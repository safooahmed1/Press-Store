import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createCatalogRepository } from '../repositories/catalog.js'
import { createCatalogService } from './catalog.js'

describe('catalog READ-CAT-001 cart batch projection', () => {
  function setup(rows = []) {
    const calls = []
    const tx = { async query(sql, values) { calls.push({ sql, values }); return rows } }
    const database = { query() { throw new Error('Must join the consumer transaction') },
      transaction() { throw new Error('Must not start a nested transaction') } }
    return { calls, tx, service: createCatalogService({ repository: createCatalogRepository(database) }) }
  }
  it('uses one parameterized query on the supplied transaction for up to 100 IDs', async () => {
    const state = setup()
    const ids = Array.from({ length: 100 }, (_, i) => String(i + 1))
    assert.deepEqual(await state.service.readVariants(ids, state.tx), [])
    assert.equal(state.calls.length, 1)
    assert.deepEqual(state.calls[0].values, ids)
    assert.equal(state.calls[0].sql.match(/\?/g).length, 100)
  })
  it('returns exact safe prices and explicit availability for retained rows', async () => {
    const state = setup([
      { variantId: '7', productId: '1', color: 'Black', size: 'M', priceMinor: '10001', discountPercent: '12.50', isAvailable: 1 },
      { variantId: '8', productId: '1', color: 'Blue', size: 'L', priceMinor: '10001', discountPercent: '100.00', isAvailable: 0 },
    ])
    assert.deepEqual(await state.service.readVariants(['7', '8', '9'], state.tx), [
      { variantId: '7', productId: '1', color: 'Black', size: 'M', finalPriceMinor: 8751, isAvailable: true },
      { variantId: '8', productId: '1', color: 'Blue', size: 'L', finalPriceMinor: 0, isAvailable: false },
    ])
  })
  it('rejects oversized, duplicate, malformed and injection-like IDs before database work', async () => {
    const state = setup()
    for (const input of [null, {}, Array(1), ['1', '1'], Array.from({ length: 101 }, (_, i) => String(i + 1)),
      ['0'], ['01'], [1], ['1 OR 1=1'], ['18446744073709551616']]) {
      await assert.rejects(state.service.readVariants(input, state.tx), { code: 'VALIDATION_FAILED' })
    }
    assert.equal(state.calls.length, 0)
  })
  it('requires a transaction and skips SQL for an empty valid batch', async () => {
    const state = setup()
    await assert.rejects(state.service.readVariants(['1']), TypeError)
    await assert.rejects(state.service.readVariants([], {}), TypeError)
    assert.deepEqual(await state.service.readVariants([], state.tx), [])
    assert.equal(state.calls.length, 0)
  })
  it('propagates database failure without falling back to stale or separate reads', async () => {
    const state = setup()
    const failure = new Error('synthetic test failure')
    await assert.rejects(state.service.readVariants(['1'], { async query() { throw failure } }),
      (error) => error === failure)
  })
})

describe('catalog cart checkout locking projection', () => {
  it('locks parent products before variants with a bounded batch and current price metadata', async () => {
    const calls = []
    const tx = { async query(sql, values) {
      calls.push({ sql, values })
      if (sql.startsWith('SELECT DISTINCT')) return [{ productId: '3' }]
      if (sql.startsWith('SELECT product_id')) return [{ productId: '3', productName: 'Jacket', priceMinor: '10001', discountPercent: '12.50', deletedAt: null }]
      return [{ variantId: '7', productId: '3', color: 'Black', size: 'M', isAvailable: 1 }]
    } }
    const service = createCatalogService({ repository: createCatalogRepository({
      query() { throw new Error('Separate query forbidden') }, transaction() { throw new Error('Nested transaction forbidden') },
    }) })
    const rows = await service.readVariantsForCheckout(['7'], tx)
    assert.equal(calls.length, 3)
    assert.match(calls[1].sql, /ORDER BY product_id FOR SHARE/)
    assert.match(calls[2].sql, /ORDER BY variant_id FOR SHARE/)
    assert.deepEqual(calls[2].values, ['7'])
    assert.deepEqual(rows[0], { productId: '3', productName: 'Jacket', variantId: '7', color: 'Black', size: 'M',
      priceMinor: 10001, discountPercent: 12.5, finalPriceMinor: 8751, isAvailable: true })
  })
  it('rejects malformed input and nontransaction handles, skips SQL for an empty batch', async () => {
    let queries = 0
    const tx = { query() { queries++; return [] } }
    const service = createCatalogService({ repository: createCatalogRepository({}) })
    for (const ids of [null, Array(1), ['01'], ['1', '1'], Array(101).fill('1')]) {
      await assert.rejects(service.readVariantsForCheckout(ids, tx), { code: 'VALIDATION_FAILED' })
    }
    await assert.rejects(service.readVariantsForCheckout(['1'], { ...tx, transaction() {} }), TypeError)
    assert.deepEqual(await service.readVariantsForCheckout([], tx), [])
    assert.equal(queries, 0)
  })
})
