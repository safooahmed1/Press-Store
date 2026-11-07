import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createOrderSnapshots } from './order-snapshots.js'

function cart(changes = {}) {
  return { cartId: '1', version: 2, items: [{ cartItemId: '2', productId: '3', productName: 'Jacket', variantId: '7',
    color: 'Black', size: 'M', quantity: 2, priceMinor: 10001, discountPercent: 12.5, currentUnitPriceMinor: 8751 }],
  subtotalMinor: 20002, discountMinor: 2500, totalMinor: 17502, ...changes }
}

describe('orders immutable trusted cart snapshots', () => {
  it('copies authoritative unit prices and exact integer sums into deeply frozen historical facts', () => {
    const source = cart()
    const snapshot = createOrderSnapshots(source)
    assert.equal(snapshot.totalMinor, 17502)
    assert.equal(snapshot.items[0].lineDiscountMinor, 2500)
    assert.equal(snapshot.items[0].baseUnitPriceMinor, 10001)
    assert.equal(snapshot.items[0].position, 1)
    source.items[0].productName = 'Later catalog name'
    assert.equal(snapshot.items[0].productName, 'Jacket')
    assert.throws(() => { snapshot.items[0].productName = 'Edit' }, TypeError)
    assert.throws(() => snapshot.items.push({}), TypeError)
    assert.throws(() => { snapshot.totalMinor = 1 }, TypeError)
  })
  it('preserves a free CAT discount without inventing a second rounding policy', () => {
    const source = cart({ totalMinor: 0, discountMinor: 20002 })
    source.items[0] = { ...source.items[0], discountPercent: 100, currentUnitPriceMinor: 0 }
    const snapshot = createOrderSnapshots(source)
    assert.equal(snapshot.totalMinor, 0)
    assert.equal(snapshot.items[0].lineTotalMinor, 0)
  })
  it('rejects unknown fields, invalid identity/text/quantity, duplicates, sparse and over-limit lines', () => {
    assert.throws(() => createOrderSnapshots(cart({ ownerId: '2' })), { code: 'VALIDATION_FAILED' })
    assert.throws(() => createOrderSnapshots(cart({ items: [] })), { code: 'CART_EMPTY' })
    for (const items of [Array(1), Array(101).fill(cart().items[0]), [cart().items[0], cart().items[0]]]) {
      assert.throws(() => createOrderSnapshots(cart({ items })), { code: 'VALIDATION_FAILED' })
    }
    for (const change of [{ productId: '01' }, { variantId: 7 }, { quantity: '2' }, { quantity: 0 }, { quantity: 100 },
      { productName: '' }, { color: 'X'.repeat(101) }, { size: '\u0000' }, { discountPercent: 1.234 },
      { currentUnitPriceMinor: 10002 }, { currentUnitPriceMinor: -1 }, { priceMinor: 0 }, { receipt: 'not allowed' }]) {
      assert.throws(() => createOrderSnapshots(cart({ items: [{ ...cart().items[0], ...change }] })), { code: 'VALIDATION_FAILED' })
    }
  })
  it('rejects mismatched aggregate money rather than accepting a client total', () => {
    for (const change of [{ totalMinor: 1 }, { subtotalMinor: 1 }, { discountMinor: 0 }, { totalMinor: '17502' }, { totalMinor: NaN }]) {
      assert.throws(() => createOrderSnapshots(cart(change)), { code: 'VALIDATION_FAILED' })
    }
  })
  it('keeps the safe integer boundary exact and rejects per-line/aggregate overflow', () => {
    const maximum = Number.MAX_SAFE_INTEGER
    const item = { ...cart().items[0], quantity: 1, priceMinor: maximum, discountPercent: 0, currentUnitPriceMinor: maximum }
    assert.equal(createOrderSnapshots(cart({ items: [item], subtotalMinor: maximum, totalMinor: maximum, discountMinor: 0 })).totalMinor, maximum)
    assert.throws(() => createOrderSnapshots(cart({ items: [{ ...item, quantity: 2 }] })), { code: 'VALIDATION_FAILED' })
    assert.throws(() => createOrderSnapshots(cart({ items: [item, { ...item, variantId: '8' }] })), { code: 'VALIDATION_FAILED' })
  })
})
