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
