import assert from 'node:assert/strict'
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { after, before, describe, it } from 'node:test'
import sharp from 'sharp'
import { startServer } from '../../../app/start-server.js'
import { createDatabase } from '../../../platform/db/database.js'
import { loadMigrations } from '../../../platform/db/migration-files.js'
import { runMigrations } from '../../../platform/db/migrate.js'
import { startDisposableMysql } from '../../../platform/db/testing/disposable-mysql.js'
import { localDatabaseTestsEnabled } from '../../../config/database-config.js'
import { createSessionService } from '../../../platform/auth/sessions.js'
import { createSessionRepository } from '../../../platform/auth/session-repository.js'
import { createImageStorage } from '../../../platform/storage/image-storage.js'
import { createLogger } from '../../../platform/observability/logger.js'
import { startTestApp } from '../../../../../tests/helpers/http-server.js'
import { createAdminCatalogRouter } from './admin-routes.js'
import { createAdminCatalogService } from '../services/admin-catalog.js'
import { createAdminCatalogRepository } from '../repositories/admin-catalog.js'

const product = (categoryId, brandId, extra = {}) => ({ name: 'Jacket', description: 'Cotton jacket', categoryId, brandId,
  priceMinor: 400000, discountPercent: 20, variants: [{ color: 'Black', size: 'M' }, { color: 'White', size: 'L' }],
  bestSeller: false, newArrival: false, ...extra })

describe('catalog admin real MySQL CRUD, uploads and security', {
  skip: !localDatabaseTestsEnabled() && 'Requires explicit new disposable MySQL fixture opt-in',
}, () => {
  let fixture, database, root, server, origin, adminCookie, customerCookie, token, png, categoryId, brandId, itemId
  let categoryVersion = '1'
  const logs = []
  before(async () => {
    fixture = await startDisposableMysql()
    database = createDatabase(fixture.config)
    root = await mkdtemp(path.join(tmpdir(), 'press-cat003-images-'))
    const migrations = await loadMigrations()
    // Apply the complete historical prefix before the held-back migration. Future feature
    // migrations must not be applied first and make this upgrade correctly fail out-of-order.
    await runMigrations({ config: fixture.config, migrations: migrations.filter(({ name }) => name < 'cat_004_create_curation_state.sql') })
    await runMigrations({ config: fixture.config, migrations })
    await runMigrations({ config: fixture.config, migrations })
    const now = new Date()
    await database.query('INSERT INTO admins (admin_id, phone, password_hash, created_at, updated_at) VALUES (1, ?, ?, ?, ?)',
      ['+201012345678', 'synthetic hash only', now, now])
    await database.query('INSERT INTO customers (first_name, last_name, phone, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      ['Test', 'Customer', '+201112345678', 'synthetic hash only', now, now])
    const [{ customer_id: customerId }] = await database.query('SELECT customer_id FROM customers')
    const sessions = createSessionService({ repository: createSessionRepository(database) })
    token = (await sessions.create({ actorType: 'admin', actorId: '1' })).token
    adminCookie = `press-admin=${token}`
    customerCookie = `press-customer=${(await sessions.create({ actorType: 'customer', actorId: customerId })).token}`
    png = await sharp({ create: { width: 3, height: 3, channels: 3, background: '#ff0000' } }).png().toBuffer()
    const logger = createLogger({ environment: 'test', sink: (line) => logs.push(JSON.parse(line)) })
    server = await startServer({ config: { nodeEnv: 'test', port: 0 }, databaseConfig: fixture.config,
      databaseFactory: () => database, storageConfig: { root }, logger })
    origin = `http://127.0.0.1:${server.address().port}`
  })
  after(async () => {
    try {
      if (server) { server.closeAllConnections(); if (server.listening) await new Promise((resolve) => server.close(resolve)) }
    } finally {
      try { await database?.close() } finally {
        try { await fixture?.stop() } finally { if (root) await rm(root, { recursive: true, force: true }) }
      }
    }
  })
  function form(data, uploads = [png]) {
    const result = new FormData()
    result.append('data', JSON.stringify(data))
    uploads.forEach((bytes) => result.append('images', new Blob([bytes], { type: 'image/png' }), 'image.png'))
    return result
  }
  async function request(route, method = 'GET', data, uploads, options = {}) {
    const body = uploads ? form(data, uploads) : data === undefined ? undefined : JSON.stringify(data)
    const response = await fetch(`${origin}/api/v1${route}`, { method,
      headers: { ...(options.cookie === null ? {} : { Cookie: options.cookie ?? adminCookie }),
        ...(method === 'GET' ? {} : { Origin: options.origin ?? origin }),
        ...(!uploads && data !== undefined ? { 'Content-Type': 'application/json' } : {}), ...options.headers }, body })
    const payload = await response.json()
    assert.equal(response.headers.get('set-cookie'), null)
    return { status: response.status, body: payload, response }
  }
  async function success(route, method, data, uploads) {
    const result = await request(route, method, data, uploads)
    assert.ok([200, 201].includes(result.status), JSON.stringify(result.body))
    return result.body.data
  }
  it('blocks anonymous/customer/duplicate cookies and cross-origin requests before accepting uploads', async () => {
    assert.equal((await request('/admin/products', 'GET', undefined, undefined, { cookie: null })).status, 401)
    assert.equal((await request('/admin/products', 'GET', undefined, undefined, { cookie: customerCookie })).status, 403)
    assert.equal((await request('/admin/products', 'GET', undefined, undefined, { cookie: `${customerCookie}; ${adminCookie}` })).status, 200)
    assert.equal((await request('/admin/products', 'GET', undefined, undefined, { cookie: `${adminCookie}; ${adminCookie}` })).status, 401)
    const forbidden = await request('/admin/brands', 'POST', { name: 'Forbidden' }, undefined, { origin: 'https://attacker.test' })
    assert.equal(forbidden.status, 403)
    assert.deepEqual(await readdir(root), [])
    const empty = await request('/admin/products')
    assert.equal(empty.response.headers.get('cache-control'), 'no-store')
  })
  it('creates, views, edits and safely deletes classifications, with duplicate/stale conflicts', async () => {
    const category = await success('/admin/categories', 'POST', { name: 'Clothing' }, [png])
    categoryId = category.categoryId
    assert.equal(category.version, '1')
    brandId = (await success('/admin/brands', 'POST', { name: 'Press' })).brandId
    const files = await readdir(root)
    assert.equal((await request('/admin/categories', 'POST', { name: 'Clothing' }, [png])).status, 409)
    assert.deepEqual(await readdir(root), files)
    const previousCategoryPath = category.imageUrl.split('/').at(-1)
    const editedCategory = await success(`/admin/categories/${categoryId}`, 'PUT', { name: 'Clothing', version: '1' }, [png])
    categoryVersion = editedCategory.version
    assert.equal(categoryVersion, '2')
    assert.equal((await readdir(root)).includes(previousCategoryPath), false)
    assert.equal((await request(`/admin/brands/${brandId}`, 'PUT', { name: 'Press renamed', version: '1' })).status, 200)
    assert.equal((await request(`/admin/brands/${brandId}`, 'PUT', { name: 'Stale', version: '1' })).body.error.code, 'EDIT_CONFLICT')
    assert.equal((await success(`/admin/categories/${categoryId}`)).name, 'Clothing')
    const temporary = await success('/admin/categories', 'POST', { name: 'Temporary' }, [png])
    const beforeDelete = (await readdir(root)).length
    await success(`/admin/categories/${temporary.categoryId}`, 'DELETE', { version: '1' })
    assert.equal((await readdir(root)).length, beforeDelete - 1)
    const tmpBrand = await success('/admin/brands', 'POST', { name: 'Temporary brand' })
    await success(`/admin/brands/${tmpBrand.brandId}`, 'DELETE', { version: '1' })
    assert.equal((await request(`/admin/brands/${tmpBrand.brandId}`)).status, 404)
  })
  it('creates a complete product and returns all required safe admin list/detail fields', async () => {
    const padded = Buffer.alloc(5 * 1024 * 1024)
    png.copy(padded)
    const created = await success('/admin/products', 'POST', product(categoryId, brandId), [padded, png, png, png])
    itemId = created.productId
    assert.equal(created.version, '1')
    assert.ok(created.updatedAt)
    const detail = await success(`/admin/products/${itemId}`)
    assert.equal(detail.images.length, 4)
    assert.equal(detail.variants.length, 2)
    const list = await success('/admin/products')
    assert.equal(list.items[0].brand.name, 'Press renamed')
    assert.equal(list.items[0].category.name, 'Clothing')
    assert.equal(list.items[0].availableVariants.length, 2)
    assert.equal(list.items[0].finalPriceMinor, 320000)
    assert.doesNotMatch(JSON.stringify(detail), /image_path|password|session|obsoletePaths|storageRoot/)
    assert.equal((await request(`/admin/categories/${categoryId}`, 'DELETE', { version: categoryVersion })).body.error.code, 'RESOURCE_IN_USE')
  })
  it('rejects fake/oversized/extra uploads, wrong media, unknown actors and malformed multipart without persisting files', async () => {
    const beforeFiles = (await readdir(root)).sort()
    assert.equal((await request('/admin/products', 'POST', product(categoryId, brandId), [Buffer.from('fake image')])).status, 422)
    assert.equal((await request('/admin/products', 'POST', product(categoryId, brandId), Array(5).fill(png))).status, 422)
    assert.equal((await request('/admin/products', 'POST', product(categoryId, brandId), [Buffer.alloc(5 * 1024 * 1024 + 1)])).status, 413)
    assert.equal((await request('/admin/products', 'POST', { ...product(categoryId, brandId), actorId: '1' }, [png])).status, 422)
    const malformed = await fetch(`${origin}/api/v1/admin/products`, { method: 'POST', headers: {
      Cookie: adminCookie, Origin: origin, 'Content-Type': 'multipart/form-data' }, body: 'bad' })
    assert.equal(malformed.status, 422)
    const unsupported = await fetch(`${origin}/api/v1/admin/products`, { method: 'POST', headers: {
      Cookie: adminCookie, Origin: origin, 'Content-Type': 'text/plain' }, body: 'bad' })
    assert.equal(unsupported.status, 415)
    assert.deepEqual((await readdir(root)).sort(), beforeFiles)
  })
  it('rejects duplicate variants/invalid foreign keys and compensates all newly staged images', async () => {
    const beforeFiles = (await readdir(root)).sort()
    const duplicate = product(categoryId, brandId, { variants: [{ color: 'Black', size: 'M' }, { color: 'Black', size: 'M' }] })
    assert.equal((await request('/admin/products', 'POST', duplicate, [png])).body.error.code, 'DUPLICATE_VARIANT')
    assert.equal((await request('/admin/products', 'POST', product('999999', brandId), [png, png])).status, 422)
    assert.deepEqual((await readdir(root)).sort(), beforeFiles)
  })
  it('preserves variant identity on removal/readd, rejects foreign images and reconciles concurrent version edits', async () => {
    const old = await success(`/admin/products/${itemId}`)
    const black = old.variants.find((variant) => variant.color === 'Black')
    const input = product(categoryId, brandId, { version: old.version, variants: [{ color: 'White', size: 'L' }] })
    await success(`/admin/products/${itemId}`, 'PUT', input)
    const afterRemove = await success(`/admin/products/${itemId}`)
    assert.equal(afterRemove.variants.find(({ variantId }) => variantId === black.variantId).isAvailable, false)
    const saved = await success(`/admin/products/${itemId}`, 'PUT', product(categoryId, brandId, { version: afterRemove.version }))
    const readded = await success(`/admin/products/${itemId}`)
    assert.equal(readded.variants.find(({ color }) => color === 'Black').variantId, black.variantId)
    assert.equal((await request(`/admin/products/${itemId}`, 'PUT', product(categoryId, brandId, { version: saved.version, images: [{ imageId: '999999' }] }))).status, 422)
    const race = await Promise.all([
      request(`/admin/products/${itemId}`, 'PUT', product(categoryId, brandId, { name: 'Winner A', version: saved.version })),
      request(`/admin/products/${itemId}`, 'PUT', product(categoryId, brandId, { name: 'Winner B', version: saved.version })),
    ])
    assert.deepEqual(race.map(({ status }) => status).sort(), [200, 409])
  })
  it('replaces/reorders images atomically and removes only obsolete files after commit', async () => {
    const before = await success(`/admin/products/${itemId}`)
    const originalFiles = before.images.map(({ imageUrl }) => imageUrl.split('/').at(-1))
    const result = await success(`/admin/products/${itemId}`, 'PUT', product(categoryId, brandId, {
      version: before.version, images: [{ uploadIndex: 0 }, { imageId: before.images[0].imageId }],
    }), [png])
    assert.equal(result.cleanupPending, false)
    const after = await success(`/admin/products/${itemId}`)
    assert.equal(after.images[1].imageId, before.images[0].imageId)
    assert.equal((await readdir(root)).includes(originalFiles[1]), false)
    assert.ok((await readFile(path.join(root, after.images[0].imageUrl.split('/').at(-1)))).length)
    const files = (await readdir(root)).sort()
    assert.equal((await request(`/admin/products/${itemId}`, 'PUT', product('999999', brandId, {
      version: after.version, images: [{ uploadIndex: 0 }],
    }), [png])).status, 422)
    assert.deepEqual((await readdir(root)).sort(), files)
    assert.equal((await success(`/admin/products/${itemId}`)).images[0].imageId, after.images[0].imageId)
  })
  it('enforces each max-eight flag under concurrent creation and rejects a ninth without partial rows/files', async () => {
    const storage = createImageStorage({ root })
    const service = createAdminCatalogService({ repository: createAdminCatalogRepository(database), storage })
    const upload = { buffer: png, originalName: 'fixture.png', contentType: 'image/png' }
    for (let i = 0; i < 7; i++) await service.writeProduct(null, product(categoryId, brandId, { name: `Flag ${i}`, bestSeller: true, newArrival: true }), [upload])
    const beforeCount = (await database.query('SELECT COUNT(*) AS count FROM products'))[0].count
    const beforeFiles = (await readdir(root)).length
    const results = await Promise.allSettled([
      service.writeProduct(null, product(categoryId, brandId, { name: 'Flag eight A', bestSeller: true, newArrival: true }), [upload]),
      service.writeProduct(null, product(categoryId, brandId, { name: 'Flag eight B', bestSeller: true, newArrival: true }), [upload]),
    ])
    assert.equal(results.filter(({ status }) => status === 'fulfilled').length, 1)
    assert.equal(results.find(({ status }) => status === 'rejected').reason.code, 'CURATION_LIMIT_EXCEEDED')
    assert.equal((await database.query('SELECT COUNT(*) AS count FROM products WHERE is_best_seller = TRUE AND deleted_at IS NULL'))[0].count, '8')
    assert.equal((await database.query('SELECT COUNT(*) AS count FROM products WHERE is_new_arrival = TRUE AND deleted_at IS NULL'))[0].count, '8')
    assert.equal(BigInt((await database.query('SELECT COUNT(*) AS count FROM products'))[0].count), BigInt(beforeCount) + 1n)
    assert.equal((await readdir(root)).length, beforeFiles + 1)
    const [flagged] = await database.query('SELECT product_id, version FROM products WHERE is_best_seller = TRUE LIMIT 1')
    const kept = await service.setFlags(flagged.product_id, { version: flagged.version, bestSeller: true, newArrival: true })
    assert.equal(kept.version, '2')
    const current = await success(`/admin/products/${itemId}`)
    assert.equal((await request(`/admin/products/${itemId}`, 'PUT', product(categoryId, brandId, { version: current.version, bestSeller: true }))).body.error.code, 'CURATION_LIMIT_EXCEEDED')
  })
  it('soft-deletes products while retaining variant/image history and classification references', async () => {
    const current = await success(`/admin/products/${itemId}`)
    const files = (await readdir(root)).sort()
    await success(`/admin/products/${itemId}`, 'DELETE', { version: current.version })
    assert.equal((await request(`/admin/products/${itemId}`)).status, 404)
    assert.equal((await fetch(`${origin}/api/v1/products/${itemId}`)).status, 404)
    assert.equal((await database.query('SELECT COUNT(*) AS count FROM product_variants WHERE product_id = ?', [itemId]))[0].count, '2')
    assert.equal((await database.query('SELECT COUNT(*) AS count FROM product_images WHERE product_id = ?', [itemId]))[0].count, '2')
    assert.deepEqual((await readdir(root)).sort(), files)
    assert.equal((await request(`/admin/categories/${categoryId}`, 'DELETE', { version: categoryVersion })).body.error.code, 'RESOURCE_IN_USE')
    assert.doesNotMatch(JSON.stringify(logs), new RegExp(`${token}|synthetic hash|password_hash|image_path`))
  })
  it('uses configured production Origin rather than forged Host/forwarded headers and fails closed on expiry', async (t) => {
    const router = createAdminCatalogRouter({ database, config: { nodeEnv: 'production' }, appOrigin: 'https://store.test',
      storage: createImageStorage({ root }) })
    const test = await startTestApp(t, { manifests: [{ id: 'catalog-admin', path: '/admin', router }] })
    const headers = { Cookie: `__Host-press-admin=${token}`, 'Content-Type': 'application/json' }
    const rejected = await fetch(`${test.origin}/api/v1/admin/brands`, { method: 'POST', headers: {
      ...headers, Origin: 'https://evil.test', 'X-Forwarded-Host': 'evil.test' }, body: JSON.stringify({ name: 'Bad origin' }) })
    assert.equal(rejected.status, 403)
    const accepted = await fetch(`${test.origin}/api/v1/admin/brands`, { method: 'POST', headers: {
      ...headers, Origin: 'https://store.test' }, body: JSON.stringify({ name: 'Configured origin' }) })
    assert.equal(accepted.status, 201)
    const crossSite = await fetch(`${test.origin}/api/v1/admin/brands`, { method: 'POST', headers: {
      ...headers, Origin: 'https://store.test', 'Sec-Fetch-Site': 'cross-site' }, body: JSON.stringify({ name: 'Cross site' }) })
    assert.equal(crossSite.status, 403)
    await database.query('UPDATE sessions SET created_at = ?, last_seen_at = ?, expires_at = ?', [new Date('2019-01-01T00:00:00Z'), new Date('2019-01-01T00:00:00Z'), new Date('2020-01-01T00:00:00Z')])
    assert.equal((await request('/admin/products')).status, 401)
  })
})
