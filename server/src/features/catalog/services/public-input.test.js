import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { publicQuery } from './public-input.js'
import { createPublicCatalogService } from './public-catalog.js'

describe('catalog public query boundary', () => {
  it('defaults to page one and 24 with canonical precise IDs and zero-price filter support', () => {
    assert.deepEqual(publicQuery({}), { page: 1, pageSize: 24 })
    assert.equal(publicQuery({ categoryId: '18446744073709551615', minPriceMinor: '0', pageSize: '48' }).categoryId,
      '18446744073709551615')
  })
  it('rejects duplicate/nested values, unsupported search/sort/availability and unsafe ranges', () => {
    for (const input of [{ categoryId: ['1', '2'] }, { color: {} }, { search: 'coat' }, { sort: 'price' },
      { isAvailable: 'true' }, { page: '0' }, { page: '100001' }, { pageSize: '49' }, { pageSize: '1.5' },
      { page: '01' }, { page: '1e1' }, { minPriceMinor: '-1' }, { minPriceMinor: '1.2' },
      { maxPriceMinor: '9007199254740992' }, { minPriceMinor: '2', maxPriceMinor: '1' },
      { brandId: '18446744073709551616' }, { color: 'x'.repeat(101) }, { size: '\ud800' }]) {
      assert.throws(() => publicQuery(input), { code: 'VALIDATION_FAILED' })
    }
  })
  it('trims color/size without folding case and bounds classification pagination', () => {
    assert.equal(publicQuery({ color: ' Black ', size: ' M ' }).color, 'Black')
    assert.deepEqual(publicQuery({ page: '2', pageSize: '1' }, true), { page: 2, pageSize: 1 })
    assert.throws(() => publicQuery({ color: 'Black' }, true), { code: 'VALIDATION_FAILED' })
  })
})

describe('catalog public DTO boundary', () => {
  it('uses explicit safe projections and exact current prices, including safe totals', async () => {
    const service = createPublicCatalogService({ imageUrl: (path) => `/uploads/${path}`, repository: {
      async list() { return { total: '1', rows: [{ productId: '1', name: 'Coat', priceMinor: '101',
        discountPercent: '50.00', mainImagePath: 'image.png', version: '4', deletedAt: 'private' }],
      variants: [{ variantId: '2', productId: '1', color: 'Black', size: 'M', internal: 'secret' }] } },
    } })
    const result = await service.list(publicQuery({}))
    assert.deepEqual(result, { data: { items: [{ productId: '1', name: 'Coat', priceMinor: 101,
      discountPercent: 50, finalPriceMinor: 51, mainImageUrl: '/uploads/image.png',
      availableVariants: [{ variantId: '2', color: 'Black', size: 'M' }] }] }, meta: { page: 1, pageSize: 24, total: 1 } })
  })
  it('does not return partial successful data on missing main-image or unsafe count corruption', async () => {
    for (const result of [{ total: '1', rows: [{ productId: '1' }], variants: [] },
      { total: '9007199254740992', rows: [], variants: [] }]) {
      const service = createPublicCatalogService({ imageUrl: () => '/uploads/x', repository: { async list() { return result } } })
      await assert.rejects(service.list(publicQuery({})))
    }
  })
})
