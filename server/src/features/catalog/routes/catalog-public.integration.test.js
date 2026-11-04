import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { after, before, describe, it } from 'node:test'
import { loadFeatureManifests } from '../../../app/feature-manifests.js'
import { localDatabaseTestsEnabled } from '../../../config/database-config.js'
import { createDatabase } from '../../../platform/db/database.js'
import { DatabaseError } from '../../../platform/db/database-error.js'
import { loadMigrations } from '../../../platform/db/migration-files.js'
import { runMigrations } from '../../../platform/db/migrate.js'
import { startDisposableMysql } from '../../../platform/db/testing/disposable-mysql.js'
import { startTestApp } from '../../../../../tests/helpers/http-server.js'
import { createPublicRouters } from './public-routes.js'
import { createCatalogRepository } from '../repositories/catalog.js'
import { productInput } from '../services/catalog-input.js'

const manifestsOf = (routers) => Object.entries(routers).map(([path, router]) => ({ id: `catalog-${path}`, path: `/${path}`, router }))

describe('catalog public HTTP failure boundary', () => {
  it('rejects malformed/unknown/repeated inputs before DB work and safely handles outage without cookies', async (t) => {
    let calls = 0
    const unavailable = async () => { calls++; throw new DatabaseError('DB_UNAVAILABLE') }
    const routers = createPublicRouters({ database: { query: unavailable, transaction: unavailable }, imageUrl: () => '/uploads/x' })
    const { origin, logs } = await startTestApp(t, { manifests: manifestsOf(routers) })
    for (const suffix of ['?sort=price', '?search=test', '?isAvailable=true', '?categoryId=1&categoryId=2',
      '?page=0', '?pageSize=49', '/1?sort=price', '/1?page=1', '?minPriceMinor=2&maxPriceMinor=1', '?color[x]=Black', '/0', '/-1', '/18446744073709551616']) {
      const response = await fetch(`${origin}/api/v1/products${suffix}`)
      assert.equal(response.status, 422, suffix)
      const body = await response.json()
      assert.equal(body.error.code, 'VALIDATION_FAILED')
      assert.ok(body.error.requestId)
    }
    assert.equal(calls, 0)
    const failure = await fetch(`${origin}/api/v1/products`, { headers: { Cookie: 'press-customer=ignored' } })
    assert.equal(failure.status, 500)
    assert.equal(failure.headers.get('set-cookie'), null)
    assert.equal(failure.headers.get('cache-control'), 'no-store')
    assert.equal((await failure.json()).error.code, 'INTERNAL_ERROR')
    assert.equal((await fetch(`${origin}/api/v1/products`, { method: 'POST' })).status, 404)
    assert.doesNotMatch(JSON.stringify(logs), /DB_UNAVAILABLE|press-customer|ignored/)
  })
})

describe('catalog public APIs with isolated MySQL', {
  skip: !localDatabaseTestsEnabled() && 'Requires FND_DISPOSABLE_MYSQL_TESTS=1 and a newly created disposable fixture',
}, () => {
  let fixture, database, repository, origin, category, secondCategory, brand, secondBrand, jacket, shirt, dress, soldOut, deleted, half
  let queryCount = 0
  let stopHttp
  before(async () => {
    fixture = await startDisposableMysql()
    database = createDatabase(fixture.config)
    repository = createCatalogRepository(database)
    await runMigrations({ config: fixture.config, migrations: (await loadMigrations()).filter(({ name }) => name.startsWith('cat_')) })
    category = (await repository.createClassification('category', 'Clothing', `${randomUUID()}.png`)).id
    secondCategory = (await repository.createClassification('category', 'Dresses', `${randomUUID()}.png`)).id
    brand = (await repository.createClassification('brand', 'Press')).id
    secondBrand = (await repository.createClassification('brand', 'Other')).id
    async function add(name, categoryId, brandId, priceMinor, discountPercent, variants, count = 1) {
      return (await repository.createProduct(productInput({ name, description: `${name} description`, categoryId, brandId,
        priceMinor, discountPercent, variants }), Array.from({ length: count }, () => `${randomUUID()}.png`))).productId
    }
    const black = { color: 'Black', size: 'M', isAvailable: true }
    jacket = await add('Jacket', category, brand, 400000, 20, [black, { color: 'White', size: 'L', isAvailable: false }], 4)
    shirt = await add('Shirt', category, secondBrand, 100000, 0, [
      { color: 'Red', size: 'S' }, { color: 'Black', size: 'L' },
    ])
    dress = await add('Dress', secondCategory, brand, 320000, 0, [{ color: 'White', size: 'M' }])
    soldOut = await add('Sold out', secondCategory, secondBrand, 50000, 0, [{ ...black, isAvailable: false }])
    deleted = await add('Deleted', category, brand, 250000, 0, [black])
    await database.query('UPDATE products SET deleted_at = UTC_TIMESTAMP(6) WHERE product_id = ?', [deleted])
    half = await add('Half', category, brand, 101, 50, [black])
    const counted = { query: (...args) => database.query(...args), transaction: (operation) => database.transaction((tx) =>
      operation({ query: (...args) => { queryCount++; return tx.query(...args) } })) }
    const manifests = await loadFeatureManifests(undefined, { database: counted, config: { nodeEnv: 'test' } })
    const app = await startTestApp({ after: (cleanup) => { stopHttp = cleanup } }, { manifests })
    origin = app.origin
  })
  after(async () => { try { await stopHttp?.() } finally { try { await database?.close() } finally { await fixture?.stop() } } })
  async function get(path) {
    const response = await fetch(`${origin}/api/v1${path}`)
    assert.equal(response.status, 200, path)
    assert.equal(response.headers.get('set-cookie'), null)
    return response.json()
  }
  const productIds = (body) => body.data.items.map(({ productId }) => productId)

  it('discovers production mounts, defaults pagination, omits deleted records and projects safe DTOs', async () => {
    const body = await get('/products')
    assert.deepEqual(productIds(body), [jacket, shirt, dress, soldOut, half])
    assert.deepEqual(body.meta, { page: 1, pageSize: 24, total: 5 })
    const item = body.data.items[0]
    assert.equal(item.finalPriceMinor, 320000)
    assert.equal(item.discountPercent, 20)
    assert.match(item.mainImageUrl, /^\/uploads\/[0-9a-f-]+\.png$/)
    assert.equal(item.availableVariants.length, 1)
    assert.deepEqual(body.data.items.find(({ productId }) => productId === soldOut).availableVariants, [])
    assert.doesNotMatch(JSON.stringify(body), /imagePath|deletedAt|version|is_available|description|password|stock/)
  })
  it('applies each supported filter and their conjunction to the same available pair', async () => {
    const cases = [
      [`categoryId=${category}`, [jacket, shirt, half]], [`brandId=${brand}`, [jacket, dress, half]],
      ['color=Black', [jacket, shirt, half]], ['size=S', [shirt]], ['color=Black&size=S', []],
      ['color=White&size=L', []], ['color=Black&size=M', [jacket, half]],
      ['minPriceMinor=320000&maxPriceMinor=320000', [jacket, dress]],
      [`categoryId=${category}&brandId=${brand}&color=Black&size=M&minPriceMinor=300000&maxPriceMinor=350000`, [jacket]],
      ['categoryId=999999', []], ['color=black', []],
    ]
    for (const [query, expected] of cases) assert.deepEqual(productIds(await get(`/products?${query}`)), expected, query)
  })
  it('uses approved rounded final money at inclusive boundaries, not base price', async () => {
    assert.deepEqual(productIds(await get('/products?minPriceMinor=51&maxPriceMinor=51')), [half])
    assert.deepEqual(productIds(await get('/products?maxPriceMinor=50')), [])
    assert.deepEqual(productIds(await get('/products?minPriceMinor=400000')), [])
    assert.deepEqual(productIds(await get('/products?maxPriceMinor=9007199254740991')), [jacket, shirt, dress, soldOut, half])
  })
  it('paginates without overlap and uses three bounded queries instead of per-product variant queries', async () => {
    queryCount = 0
    const page = await get('/products?page=2&pageSize=2')
    assert.deepEqual(productIds(page), [dress, soldOut])
    assert.deepEqual(page.meta, { page: 2, pageSize: 2, total: 5 })
    assert.equal(queryCount, 3)
    const empty = await get('/products?page=100000')
    assert.deepEqual(empty.data.items, [])
    assert.equal(empty.meta.total, 5)
    const plan = await database.query('EXPLAIN SELECT product_id FROM products WHERE category_id = ? AND deleted_at IS NULL ORDER BY product_id LIMIT 24', [category])
    assert.ok(plan.some((row) => String(row.possible_keys).includes('products_category_price')))
  })
  it('returns ordered full gallery and classifications, but only active variant options', async () => {
    const body = (await get(`/products/${jacket}`)).data
    assert.equal(body.description, 'Jacket description')
    assert.deepEqual(body.brand, { brandId: brand, name: 'Press' })
    assert.deepEqual(body.category, { categoryId: category, name: 'Clothing' })
    assert.equal(body.images.length, 4)
    assert.deepEqual(body.images.map(({ role, order }) => [role, order]), [['main', 0], ['additional', 1], ['additional', 2], ['additional', 3]])
    assert.equal(body.availableVariants.length, 1)
    for (const id of [deleted, '999999']) {
      const response = await fetch(`${origin}/api/v1/products/${id}`)
      assert.equal(response.status, 404)
      assert.equal((await response.json()).error.code, 'PRODUCT_NOT_FOUND')
    }
    const categories = await get('/categories?pageSize=1&page=2')
    assert.equal(categories.data.items[0].categoryId, secondCategory)
    assert.equal(categories.meta.total, 2)
    const brands = await get('/brands')
    assert.deepEqual(brands.data.items, [{ brandId: brand, name: 'Press' }, { brandId: secondBrand, name: 'Other' }])
  })
  it('keeps SQL input parameterized and returns safe empty results for a quoted filter', async () => {
    assert.deepEqual(productIds(await get(`/products?color=${encodeURIComponent("Black' OR 1=1 --")}`)), [])
    assert.equal((await get('/products')).meta.total, 5)
  })
  it('matches SQL filtered prices with integer service calculations at maximum money and 100 percent discount', async () => {
    for (const [name, priceMinor, discountPercent] of [['Maximum', Number.MAX_SAFE_INTEGER, '99.99'], ['Free', 100, 100]]) {
      const { productId } = await repository.createProduct(productInput({ name, description: name,
        categoryId: category, brandId: brand, priceMinor, discountPercent, variants: [] }), [`${randomUUID()}.png`])
      const detail = (await get(`/products/${productId}`)).data
      const result = await get(`/products?minPriceMinor=${detail.finalPriceMinor}&maxPriceMinor=${detail.finalPriceMinor}`)
      assert.ok(productIds(result).includes(productId))
      assert.equal(detail.priceMinor, priceMinor)
      assert.equal(detail.finalPriceMinor, discountPercent === 100 ? 0 : 900719925474)
    }
  })

})
