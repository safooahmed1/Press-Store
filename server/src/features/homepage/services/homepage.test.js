import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buttonLink, heroInput, bannerInput, identity } from './homepage-input.js'
import { createHomepageService } from './homepage.js'
import { createMerchandisingService } from '../../catalog/services/merchandising.js'
const hero = (extra = {}) => ({ title: 'New drop', subtitle: 'Everyday layers', buttonText: 'Shop', buttonLink: '/products', isActive: true, displayOrder: 1, ...extra })

describe('homepage safe inputs and atomic service boundaries', () => {
  it('allows only internal catalog/detail/filter CTA routes with valid canonical inputs', () => {
    for (const link of ['/products', '/products/123', '/products?categoryId=1&color=Black']) assert.equal(buttonLink(link), link)
    for (const link of ['https://evil.test', '//evil.test', 'javascript:alert(1)', '/admin', '/products/../admin',
      '/products/%31', '/products/0', '/products/1?color=Black', '/products?sort=price',
      '/products?categoryId=1&categoryId=2', '/products?color=Black#bad', '/products/18446744073709551616', '/products/1\n', '/products?color=Bl\nack', `/products?color=${'😀'.repeat(100)}&size=${'😀'.repeat(100)}`]) {
      assert.throws(() => buttonLink(link), { code: 'VALIDATION_FAILED' })
    }
  })
  it('validates exact text/boolean/order/version fields and banner slots without accepting actor or image paths', () => {
    assert.equal(heroInput(hero()).title, 'New drop')
    assert.throws(() => identity('1\n'), { code: 'VALIDATION_FAILED' })
    for (const extra of [{ adminId: '1' }, { imagePath: '/secret' }, { title: '\ud800' }, { title: 'x'.repeat(256) },
      { displayOrder: -1 }, { isActive: 1 }]) assert.throws(() => heroInput(hero(extra)), { code: 'VALIDATION_FAILED' })
    assert.throws(() => heroInput(hero({ version: '1' }), true), { code: 'VALIDATION_FAILED' })
    assert.throws(() => bannerInput({ text: '', isActive: false, version: 0 }), { code: 'VALIDATION_FAILED' })
  })
  it('fails closed instead of returning partial public data when any required owner projection fails', async () => {
    for (const catalog of [{ async read() { throw new Error('private SQL') } }, { async read() { return {} } }]) {
      const service = createHomepageService({ repository: { async projection() { return { slides: [], banners: [] } } }, catalog, storage: {} })
      await assert.rejects(service.publicHomepage(), { code: 'HOMEPAGE_UNAVAILABLE' })
    }
  })
  it('compensates rejected image transactions and retains committed new files on old-file cleanup failure', async () => {
    for (const reject of [false, true]) {
      const paths = new Set(['old'])
      const service = createHomepageService({ repository: { async writeSlide() {
        if (reject) throw new Error('transaction rejected')
        return { resourceId: '1', version: 2, obsoletePaths: ['old'] }
      } }, storage: { async withCompensation(upload, work) {
        paths.add('new'); try { return await work({ path: 'new' }) } catch (error) { paths.delete('new'); throw error }
      }, async delete() { throw new Error('private filesystem') } } })
      if (reject) { await assert.rejects(service.writeSlide('1', hero({ version: 1 }), [{}])); assert.deepEqual([...paths], ['old']) }
      else { const result = await service.writeSlide('1', hero({ version: 1 }), [{}]); assert.equal(result.cleanupPending, true); assert.equal(paths.has('new'), true); assert.doesNotMatch(JSON.stringify(result), /old|obsoletePaths|private/) }
    }
  })
  it('rejects ninth/duplicate/invalid curated IDs before database work', async () => {
    const service = createMerchandisingService({ database: { transaction() { assert.fail('validation reached DB') } }, imageUrl: () => '' })
    await assert.rejects(service.replace('best-sellers', { version: 1, productIds: Array.from({ length: 9 }, (_, i) => String(i + 1)) }), { code: 'CURATION_LIMIT_EXCEEDED' })
    for (const input of [{ version: 1, productIds: ['1','1'] }, { version: '1', productIds: [] }, { version: 1, productIds: ['01'] }, { version: 1, productIds: ['1\n'] }, { version: 1, productIds: [], actorId: '1' }]) {
      await assert.rejects(service.replace('best-sellers', input), { code: 'VALIDATION_FAILED' })
    }
  })
})
