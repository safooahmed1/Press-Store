import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createCartCheckoutService } from './checkout-carts.js'

function fixture({ cart = { cartId: '1', version: 2 }, items = [{ cartItemId: '2', variantId: '7', quantity: 2 }],
  priceMinor = '10001', discountPercent = '12.50', available = 1, missing = false } = {}) {
  const writes = []
  let reads = 0
  const tx = { async query(sql) {
    reads++
    if (sql.startsWith('SELECT cart_id')) return cart ? [cart] : []
    if (sql.startsWith('SELECT cart_item_id')) return items
    if (sql.startsWith('SELECT DISTINCT')) return missing ? [] : [{ productId: '3' }]
    if (sql.startsWith('SELECT product_id')) return [{ productId: '3', productName: 'Jacket', priceMinor, discountPercent, deletedAt: null }]
    if (sql.startsWith('SELECT variant_id')) return [{ variantId: '7', productId: '3', color: 'Black', size: 'M', isAvailable: available }]
    writes.push(sql)
    return { affectedRows: 1 }
  } }
  const database = { query() { throw new Error('Separate query forbidden') },
    transaction() { throw new Error('Nested transaction forbidden') } }
  return { tx, database, writes, service: createCartCheckoutService({ database }), get reads() { return reads } }
}
const input = { customerId: '9', expectedCartVersion: 2 }

describe('cart checkout trusted transaction handoff', () => {
  it('returns a deeply frozen exact snapshot and clears once on the original transaction', async () => {
    const state = fixture()
    const snapshot = await state.service.readForCheckout(state.tx, input)
    assert.equal(snapshot.subtotalMinor, 20002)
    assert.equal(snapshot.totalMinor, 17502)
    assert.equal(snapshot.discountMinor, 2500)
    assert.equal(snapshot.items[0].productName, 'Jacket')
    assert.equal(snapshot.items[0].discountPercent, 12.5)
    assert.throws(() => { snapshot.items[0].quantity = 99 }, TypeError)
    assert.throws(() => snapshot.items.push({}), TypeError)
    assert.deepEqual(await state.service.clearForCheckout(state.tx, snapshot), { cartId: '1', version: 3 })
    await assert.rejects(state.service.clearForCheckout(state.tx, snapshot), { code: 'CART_CONFLICT' })
    assert.equal(state.writes.length, 2)
  })
  it('rejects pool handles, bad identity/version and extra owner-controlled fields before SQL', async () => {
    const state = fixture()
    await assert.rejects(state.service.readForCheckout(state.database, input), TypeError)
    await assert.rejects(state.service.readForCheckout(undefined, input), TypeError)
    for (const changes of [{ customerId: '01' }, { expectedCartVersion: '2' }, { expectedCartVersion: 0 },
      { cartId: '1' }, { totalMinor: 1 }, { actorType: 'admin' }]) {
      await assert.rejects(state.service.readForCheckout(state.tx, { ...input, ...changes }), { code: 'VALIDATION_FAILED' })
    }
    await assert.rejects(state.service.readForCheckout(state.tx, { ...input, expectedCartVersion: 4294967295 }), { code: 'CART_CONFLICT' })
    assert.equal(state.reads, 0)
  })
  it('rejects empty, stale, missing-variant and unavailable carts without clearing anything', async () => {
    for (const [options, code] of [[{ cart: null }, 'CART_EMPTY'], [{ items: [] }, 'CART_EMPTY'],
      [{ cart: { cartId: '1', version: 3 } }, 'CART_CONFLICT'], [{ missing: true }, 'VARIANT_UNAVAILABLE'],
      [{ available: 0 }, 'VARIANT_UNAVAILABLE']]) {
      const state = fixture(options)
      await assert.rejects(state.service.readForCheckout(state.tx, input), { code })
      assert.deepEqual(state.writes, [])
    }
  })
  it('rejects forged, cloned, cross-transaction and cross-instance handoff values before writes', async () => {
    const state = fixture()
    const snapshot = await state.service.readForCheckout(state.tx, input)
    for (const value of [undefined, {}, { ...snapshot }, { ...snapshot, cartId: '3' }]) {
      await assert.rejects(state.service.clearForCheckout(state.tx, value), { code: 'CART_CONFLICT' })
    }
    await assert.rejects(state.service.clearForCheckout({ query() {} }, snapshot), { code: 'CART_CONFLICT' })
    const otherService = createCartCheckoutService({ database: state.database })
    await assert.rejects(otherService.clearForCheckout(state.tx, snapshot), { code: 'CART_CONFLICT' })
    assert.deepEqual(state.writes, [])
  })
  it('rejects invalid quantities/line bounds and unsafe base subtotals even when final items are free', async () => {
    for (const options of [{ items: [{ cartItemId: '2', variantId: '7', quantity: 0 }] },
      { items: Array(101).fill({ cartItemId: '2', variantId: '7', quantity: 1 }) },
      { priceMinor: String(Number.MAX_SAFE_INTEGER), discountPercent: '100.00' }]) {
      const state = fixture(options)
      await assert.rejects(state.service.readForCheckout(state.tx, input), { code: 'VALIDATION_FAILED' })
      assert.deepEqual(state.writes, [])
    }
  })
  it('allows free discounted items and keeps clear failures available to the outer rollback boundary', async () => {
    const state = fixture({ discountPercent: '100.00' })
    const snapshot = await state.service.readForCheckout(state.tx, input)
    assert.equal(snapshot.totalMinor, 0)
    assert.equal(snapshot.discountMinor, snapshot.subtotalMinor)
    const original = state.tx.query
    const failure = new Error('synthetic write failure')
    state.tx.query = async (sql, values) => {
      if (sql.startsWith('DELETE')) throw failure
      return original(sql, values)
    }
    await assert.rejects(state.service.clearForCheckout(state.tx, snapshot), (error) => error === failure)
  })
})
