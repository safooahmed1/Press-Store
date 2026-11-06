import assert from 'node:assert/strict'
import { before, after, describe, it } from 'node:test'
import { mkdtemp, rm } from 'node:fs/promises'
import path from 'node:path'
import { tmpdir } from 'node:os'
import sharp from 'sharp'
import { localDatabaseTestsEnabled } from '../../../config/database-config.js'
import { createDatabase } from '../../../platform/db/database.js'
import { loadMigrations } from '../../../platform/db/migration-files.js'
import { runMigrations } from '../../../platform/db/migrate.js'
import { startDisposableMysql } from '../../../platform/db/testing/disposable-mysql.js'
import { createSessionService } from '../../../platform/auth/sessions.js'
import { createSessionRepository } from '../../../platform/auth/session-repository.js'
import { createLogger } from '../../../platform/observability/logger.js'
import { startServer } from '../../../app/start-server.js'

describe('cart live CAT contract through discovered app and disposable MySQL', {
  skip: !localDatabaseTestsEnabled() && 'Requires new isolated MySQL; never an application database',
}, () => {
  let fixture, database, root, server, origin, adminCookie, image, categoryId, brandId
  let sequence = 0
  const password = 'Test-only-cart-password-123'
  async function start() {
    server = await startServer({ config: { nodeEnv: 'test', port: 0 }, databaseConfig: fixture.config,
      databaseFactory: () => database, storageConfig: { root },
      logger: createLogger({ environment: 'test', sink() {} }) })
    origin = `http://127.0.0.1:${server.address().port}`
  }
  async function close() {
    if (server) {
      server.closeAllConnections()
      if (server.listening) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
    }
  }
  async function request(route, { method = 'GET', data, cookie, upload, headers = {} } = {}) {
    let body
    if (upload) {
      body = new FormData()
      body.append('data', JSON.stringify(data))
      body.append('images', new Blob([image], { type: 'image/png' }), 'test.png')
    } else if (data !== undefined) body = JSON.stringify(data)
    const response = await fetch(`${origin}/api/v1${route}`, { method, body,
      headers: { ...(cookie ? { Cookie: cookie } : {}), ...(method === 'GET' ? {} : { Origin: origin }),
        ...(!upload && data !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers } })
    return { status: response.status, body: await response.json(), response }
  }
  async function success(route, options) {
    const result = await request(route, options)
    assert.ok([200, 201].includes(result.status), JSON.stringify(result.body))
    return result.body.data
  }
  async function customer() {
    const phone = `+2012${String(++sequence).padStart(8, '0')}`
    const result = await request('/auth/customer/register', { method: 'POST',
      data: { firstName: 'Cart', lastName: 'Live', phone, password } })
    assert.equal(result.status, 201, JSON.stringify(result.body))
    return { phone, cookie: result.response.headers.get('set-cookie').split(';')[0],
      id: result.body.data.customer.customerId }
  }
  async function product() {
    const input = { name: `Live cart ${++sequence}`, description: 'Live contract fixture', categoryId, brandId,
      priceMinor: 10001, discountPercent: 12.5,
      variants: [{ color: 'Black', size: 'M', isAvailable: true }, { color: 'Blue', size: 'L', isAvailable: false }],
      bestSeller: false, newArrival: false }
    const created = await success('/admin/products', { method: 'POST', cookie: adminCookie, data: input, upload: true })
    const details = await success(`/admin/products/${created.productId}`, { cookie: adminCookie })
    return { input, id: created.productId, version: created.version,
      variantId: details.variants.find((row) => row.color === 'Black').variantId }
  }
  async function add(owner, item, version = 1, quantity = 2) {
    return success('/cart/items', { method: 'POST', cookie: owner.cookie,
      data: { variantId: item.variantId, quantity, expectedCartVersion: version } })
  }
  before(async () => {
    fixture = await startDisposableMysql()
    database = createDatabase(fixture.config)
    root = await mkdtemp(path.join(tmpdir(), 'press-cart001-live-images-'))
    const migrations = await loadMigrations()
    assert.equal(migrations.filter(({ name }) => name === 'persistent-cart_001_create_carts.sql').length, 1)
    await runMigrations({ config: fixture.config, migrations })
    await database.query(`INSERT INTO admins (admin_id, phone, password_hash, created_at, updated_at)
      VALUES (1, '+201012345678', 'synthetic fixture hash', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6))`)
    const sessions = createSessionService({ repository: createSessionRepository(database) })
    adminCookie = `press-admin=${(await sessions.create({ actorType: 'admin', actorId: '1' })).token}`
    image = await sharp({ create: { width: 2, height: 2, channels: 3, background: '#ffffff' } }).png().toBuffer()
    const history = await database.query('SELECT migration_name, checksum FROM migration_records ORDER BY migration_name')
    await start()
    assert.deepEqual(await database.query('SELECT migration_name, checksum FROM migration_records ORDER BY migration_name'), history)
    categoryId = (await success('/admin/categories', { method: 'POST', cookie: adminCookie,
      data: { name: 'Live cart category' }, upload: true })).categoryId
    brandId = (await success('/admin/brands', { method: 'POST', cookie: adminCookie,
      data: { name: 'Live cart brand' } })).brandId
  })
  after(async () => {
    try { await close() } finally {
      try { await database?.close() } finally {
        try { await fixture?.stop() } finally { if (root) await rm(root, { recursive: true, force: true }) }
      }
    }
  })
  it('discovers protected cart CRUD using real catalog data and preserves customer isolation', async () => {
    const owner = await customer()
    const other = await customer()
    const item = await product()
    assert.equal((await request('/cart')).status, 401)
    assert.equal((await request('/cart', { cookie: adminCookie })).status, 403)
    const empty = await success('/cart', { cookie: owner.cookie })
    assert.equal(empty.version, 1)
    assert.deepEqual(empty.items, [])
    const cart = await add(owner, item)
    assert.equal(cart.items[0].currentUnitPriceMinor, 8751)
    assert.equal(cart.totalMinor, 17502)
    assert.equal(cart.items[0].isAvailable, true)
    assert.deepEqual((await success('/cart', { cookie: other.cookie })).items, [])
    const id = cart.items[0].cartItemId
    assert.equal((await request(`/cart/items/${id}`, { method: 'PATCH', cookie: other.cookie,
      data: { quantity: 1, expectedCartVersion: 1 } })).status, 404)
    const updated = await success(`/cart/items/${id}`, { method: 'PATCH', cookie: owner.cookie,
      data: { quantity: 3, expectedCartVersion: 2 } })
    assert.equal(updated.totalMinor, 26253)
    const cleared = await request('/cart', { method: 'DELETE', cookie: owner.cookie, data: { expectedCartVersion: 3 } })
    assert.equal(cleared.status, 200)
    assert.deepEqual(cleared.body.data.items, [])
    assert.equal(cleared.response.headers.get('cache-control'), 'no-store')
    assert.equal(cleared.response.headers.get('set-cookie'), null)
  })
  it('projects real admin price/availability changes and permits unavailable-item removal', async () => {
    const owner = await customer()
    const item = await product()
    await add(owner, item)
    await success(`/admin/products/${item.id}`, { method: 'PUT', cookie: adminCookie,
      data: { ...item.input, version: item.version, priceMinor: 20001, discountPercent: 50, variants: [] } })
    const cart = await success('/cart', { cookie: owner.cookie })
    assert.equal(cart.version, 2)
    assert.equal(cart.items[0].variantId, item.variantId)
    assert.equal(cart.items[0].currentUnitPriceMinor, 10001)
    assert.equal(cart.items[0].isAvailable, false)
    assert.equal(cart.totalMinor, 20002)
    const unavailable = await request('/cart/items', { method: 'POST', cookie: owner.cookie,
      data: { variantId: item.variantId, quantity: 1, expectedCartVersion: 2 } })
    assert.equal(unavailable.status, 409)
    assert.equal(unavailable.body.error.code, 'VARIANT_UNAVAILABLE')
    const removed = await success(`/cart/items/${cart.items[0].cartItemId}`, { method: 'DELETE', cookie: owner.cookie,
      data: { expectedCartVersion: 2 } })
    assert.deepEqual(removed.items, [])
  })
  it('retains a soft-deleted product for explanation and rejects unknown variants safely', async () => {
    const owner = await customer()
    const item = await product()
    await add(owner, item)
    await success(`/admin/products/${item.id}`, { method: 'DELETE', cookie: adminCookie, data: { version: item.version } })
    const cart = await success('/cart', { cookie: owner.cookie })
    assert.equal(cart.items[0].variantId, item.variantId)
    assert.equal(cart.items[0].isAvailable, false)
    const missing = await request('/cart/items', { method: 'POST', cookie: owner.cookie,
      data: { variantId: '18446744073709551615', quantity: 1, expectedCartVersion: 2 } })
    assert.equal(missing.status, 409)
    assert.equal(missing.body.error.code, 'VARIANT_UNAVAILABLE')
  })
  it('serializes real concurrent adds and rejects CSRF and payload price/owner overrides', async () => {
    const owner = await customer()
    const item = await product()
    const data = { variantId: item.variantId, quantity: 1, expectedCartVersion: 1 }
    const results = await Promise.all([request('/cart/items', { method: 'POST', cookie: owner.cookie, data }),
      request('/cart/items', { method: 'POST', cookie: owner.cookie, data })])
    assert.deepEqual(results.map((row) => row.status).sort(), [200, 409])
    assert.equal((await request('/cart/items', { method: 'POST', cookie: owner.cookie,
      data: { ...data, expectedCartVersion: 2 }, headers: { Origin: 'https://attacker.test' } })).status, 403)
    assert.equal((await request('/cart/items', { method: 'POST', cookie: owner.cookie,
      data: { ...data, expectedCartVersion: 2, customerId: '1', currentUnitPriceMinor: 0 } })).status, 422)
    const cart = await success('/cart', { cookie: owner.cookie })
    assert.equal(cart.items[0].quantity, 1)
    assert.equal(cart.version, 2)
  })
  it('preserves the real cart across logout, login and application/pool restart', async () => {
    const owner = await customer()
    const item = await product()
    const original = await add(owner, item)
    await success('/auth/customer/logout', { method: 'POST', cookie: owner.cookie })
    assert.equal((await request('/cart', { cookie: owner.cookie })).status, 401)
    const login = await request('/auth/customer/login', { method: 'POST', data: { phone: owner.phone, password } })
    assert.equal(login.status, 200)
    owner.cookie = login.response.headers.get('set-cookie').split(';')[0]
    await close()
    await database.close()
    database = createDatabase(fixture.config)
    await start()
    assert.deepEqual(await success('/cart', { cookie: owner.cookie }), original)
  })
})
