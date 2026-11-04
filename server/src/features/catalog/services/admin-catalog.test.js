import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { adminProductInput } from './admin-input.js'
import { createAdminCatalogService } from './admin-catalog.js'

const product = (extra = {}) => ({ name: 'Jacket', description: 'Cotton', categoryId: '1', brandId: '1', priceMinor: 101,
  discountPercent: 50, variants: [{ color: 'Black', size: 'M' }], ...extra })

describe('catalog admin input and post-commit cleanup', () => {
  it('requires exact flags/version and distinct owned-image references without accepting paths or actor fields', () => {
    assert.equal(adminProductInput(product({ bestSeller: true })).bestSeller, true)
    for (const extra of [{ bestSeller: 1 }, { adminId: '1' }, { stock: 2 }, { images: [{ imagePath: '/secret' }] }]) {
      assert.throws(() => adminProductInput(product(extra)), { code: 'VALIDATION_FAILED' })
    }
    for (const images of [[{ imageId: '1' }, { imageId: '1' }], [{ imageId: '1', uploadIndex: 0 }], [{ uploadIndex: -1 }]]) {
      assert.throws(() => adminProductInput(product({ version: '1', images }), true), { code: 'VALIDATION_FAILED' })
    }
    assert.throws(() => adminProductInput(product(), true), { code: 'VALIDATION_FAILED' })
  })
  it('compensates newly staged files on commit failure without deleting an existing image', async () => {
    const paths = new Set(['old'])
    const storage = { async withCompensation(upload, work) {
      paths.add('new')
      try { return await work({ path: 'new' }) } catch (error) { paths.delete('new'); throw error }
    } }
    const service = createAdminCatalogService({ repository: { async updateProduct() { throw new Error('commit rejected') } }, storage })
    await assert.rejects(service.writeProduct('1', product({ version: '1', images: [{ uploadIndex: 0 }] }), [{}]), /commit rejected/)
    assert.deepEqual([...paths], ['old'])
  })
  it('retains committed new images when deleting obsolete files fails and reports only a boolean', async () => {
    const paths = new Set(['old'])
    const service = createAdminCatalogService({ repository: { async updateProduct() {
      return { productId: '1', version: '2', updatedAt: new Date('2026-11-04T00:00:00Z'), obsoletePaths: ['old'] }
    } }, storage: { async withCompensation(upload, work) {
      paths.add('new'); try { return await work({ path: 'new' }) } catch (error) { paths.delete('new'); throw error }
    }, async delete() { throw new Error('private filesystem path') } }, onCleanupFailure() { throw new Error('logger failed') } })
    const result = await service.writeProduct('1', product({ version: '1', images: [{ uploadIndex: 0 }] }), [{}])
    assert.equal(result.cleanupPending, true)
    assert.equal(paths.has('new'), true)
    assert.doesNotMatch(JSON.stringify(result), /private|obsoletePaths|old/)
  })
  it('rejects unused and out-of-range new uploads before storage/database work', async () => {
    const service = createAdminCatalogService({ repository: {}, storage: {} })
    for (const images of [undefined, [{ imageId: '1' }], [{ uploadIndex: 1 }]]) {
      await assert.rejects(service.writeProduct('1', product({ version: '1', images }), [{}]), { code: 'VALIDATION_FAILED' })
    }
  })
})
