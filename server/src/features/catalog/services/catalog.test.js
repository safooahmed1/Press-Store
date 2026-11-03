import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { calculateFinalPrice, discountBasisPoints, productInput } from './catalog-input.js'
import { createCatalogService } from './catalog.js'

const product = (changes = {}) => ({ name: ' Jacket ', description: ' Cotton ', categoryId: '1', brandId: '2',
  priceMinor: 10001, discountPercent: '12.50', variants: [{ color: 'Black', size: 'M' }], ...changes })

describe('catalog exact money and domain input', () => {
  it('rounds the final unit price half up, including 0/100 percent and maximum safe price', () => {
    assert.equal(calculateFinalPrice(101, 50), 51)
    assert.equal(calculateFinalPrice(1, 50), 1)
    assert.equal(calculateFinalPrice(10001, '12.50'), 8751)
    assert.equal(calculateFinalPrice(400000, 20), 320000)
    assert.equal(calculateFinalPrice(Number.MAX_SAFE_INTEGER, 0), Number.MAX_SAFE_INTEGER)
    assert.equal(calculateFinalPrice(Number.MAX_SAFE_INTEGER, 100), 0)
    assert.equal(discountBasisPoints('99.99'), 9999n)
  })
  it('rejects unsafe money, excessive percent precision, non-finite and coercible input', () => {
    for (const price of [0, -1, 1.5, '1', NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
      assert.throws(() => calculateFinalPrice(price, 0), { code: 'VALIDATION_FAILED' })
    }
    for (const percent of [-1, 100.01, '0.001', '1e1', ' 1', true, null, NaN, Infinity, '01']) {
      assert.throws(() => calculateFinalPrice(100, percent), { code: 'VALIDATION_FAILED' })
    }
  })
  it('keeps IDs precise, defaults availability and rejects duplicates after trimming', () => {
    const input = productInput(product({ categoryId: '18446744073709551615' }))
    assert.equal(input.name, 'Jacket')
    assert.equal(input.categoryId, '18446744073709551615')
    assert.equal(input.discountPercent, '12.50')
    assert.equal(input.variants[0].isAvailable, true)
    assert.throws(() => productInput(product({ variants: [{ color: 'Black', size: 'M' }, { color: ' Black ', size: 'M' }] })),
      { code: 'DUPLICATE_VARIANT' })
  })
  it('rejects quantity/roles/unknown fields, invalid Unicode, oversized labels and nonboolean availability', () => {
    for (const changes of [{ quantity: 1 }, { bestSeller: true }, { name: '\ud800' }, { name: 'x'.repeat(256) },
      { description: 'a\u0000b' }, { categoryId: '01' }, { categoryId: '18446744073709551616' },
      { variants: [{ color: 'Black', size: 'M', quantity: 1 }] },
      { variants: [{ color: 'Black', size: 'M', isAvailable: 1 }] }]) {
      assert.throws(() => productInput(product(changes)), { code: 'VALIDATION_FAILED' })
    }
  })
})

describe('catalog storage compensation and failure boundaries', () => {
  function setup({ failAt = 0, rejectCreate = false } = {}) {
    const paths = new Set()
    let attempts = 0
    let inserts = 0
    const storage = { async withCompensation(upload, operation) {
      attempts++
      if (attempts === failAt) throw new Error('storage failed')
      const path = `image-${attempts}`
      paths.add(path)
      try { return await operation({ path }) } catch (error) { paths.delete(path); throw error }
    } }
    const repository = { async createProduct(input, images) {
      inserts++
      if (rejectCreate) throw new Error('transaction failed')
      return { productId: '1', images }
    } }
    return { service: createCatalogService({ repository, storage }), paths, get inserts() { return inserts } }
  }
  it('enforces image counts before storage/database and retains exactly one main plus up to three additional', async () => {
    const state = setup()
    for (const images of [[], Array(5).fill({}), null]) {
      await assert.rejects(state.service.createProduct(product(), images), { code: 'IMAGE_LIMIT_EXCEEDED' })
    }
    assert.equal(state.inserts, 0)
    const result = await state.service.createProduct(product(), [{}, {}, {}, {}])
    assert.equal(result.images.length, 4)
    assert.equal(state.paths.size, 4)
  })
  it('compensates earlier files when a later file fails without starting the transaction', async () => {
    const state = setup({ failAt: 3 })
    await assert.rejects(state.service.createProduct(product(), [{}, {}, {}]), /storage failed/)
    assert.equal(state.paths.size, 0)
    assert.equal(state.inserts, 0)
  })
  it('compensates all newly stored images on transaction rejection', async () => {
    const state = setup({ rejectCreate: true })
    await assert.rejects(state.service.createProduct(product(), [{}, {}]), /transaction failed/)
    assert.equal(state.paths.size, 0)
  })
  it('reports post-commit cleanup separately and never accepts unavailable variants', async () => {
    const service = createCatalogService({ repository: {
      async deleteClassification() { return 'obsolete.png' }, async readAvailableVariant() { return null },
    }, storage: { async delete() { throw new Error('filesystem failed') } } })
    assert.deepEqual(await service.deleteClassification('category', '1', '1'), { deleted: true, cleanupPending: 'obsolete.png' })
    await assert.rejects(service.requireAvailableVariant('1'), { code: 'VARIANT_UNAVAILABLE' })
  })
})
