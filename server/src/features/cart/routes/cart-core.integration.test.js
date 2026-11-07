import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import { localDatabaseTestsEnabled } from '../../../config/database-config.js'
import { createDatabase } from '../../../platform/db/database.js'
import { loadMigrations } from '../../../platform/db/migration-files.js'
import { runMigrations } from '../../../platform/db/migrate.js'
import { startDisposableMysql } from '../../../platform/db/testing/disposable-mysql.js'
import { createSessionService } from '../../../platform/auth/sessions.js'
import { createSessionRepository } from '../../../platform/auth/session-repository.js'
import { createCustomerRouters } from '../../auth/routes/customer-routes.js'
import { createCustomerService } from '../../auth/services/customers.js'
import { createCatalogService } from '../../catalog/services/catalog.js'
import { createCatalogRepository } from '../../catalog/repositories/catalog.js'
import { createCartRepository } from '../repositories/carts.js'
import { createCartService } from '../services/carts.js'
import { createCartRouter } from './cart-routes.js'
import { startTestApp } from '../../../../../tests/helpers/http-server.js'

async function cartMigrations() {
  return loadMigrations()
}

// Catalog projections below are test-only fixtures, never a production data source.
// Real CART MySQL/HTTP/AUTH behavior is verified; live READ-CAT-001 wiring is not.
describe('cart independent HTTP and real MySQL persistence', {
  skip: !localDatabaseTestsEnabled() && 'Requires new disposable MySQL fixture opt-in',
}, () => {
  let fixture, database, variants, productId, sessions, adminCookie
  let sequence = 0
  before(async () => {
    fixture = await startDisposableMysql()
    database = createDatabase(fixture.config)
    await runMigrations({ config: fixture.config, migrations: await cartMigrations() })
    const now = new Date()
    await database.query('INSERT INTO admins (admin_id, phone, password_hash, created_at, updated_at) VALUES (1, ?, ?, ?, ?)',
      ['+201012345678', 'synthetic fixture hash', now, now])
    sessions = createSessionService({ repository: createSessionRepository(database) })
    adminCookie = `press-admin=${(await sessions.create({ actorType: 'admin', actorId: '1' })).token}`
    let image = 0
    const catalog = createCatalogService({ repository: createCatalogRepository(database),
      storage: { withCompensation: async (upload, work) => work({ path: `fixture-${++image}.png` }) } })
    const category = await catalog.createCategory({ name: 'Cart fixtures' }, { testOnly: true })
    const brand = await catalog.createBrand({ name: 'Cart fixtures' })
    const created = await catalog.createProduct({ name: 'Cart product', description: 'Test fixture',
      categoryId: category.id, brandId: brand.id, priceMinor: 400000, discountPercent: 20,
      variants: Array.from({ length: 101 }, (_, i) => ({ color: `Color ${i}`, size: 'M' })) }, [{ testOnly: true }])
    productId = created.productId
    const rows = await database.query('SELECT variant_id AS variantId, color, size FROM product_variants WHERE product_id = ? ORDER BY variant_id', [productId])
    variants = rows.map((row) => ({ ...row, productId, finalPriceMinor: 320000, isAvailable: true }))
  })
  after(async () => {
    try { await database?.close() } finally { await fixture?.stop() }
  })
  async function customer() {
    const phone = `+2011${String(++sequence).padStart(8, '0')}`
    await database.query(`INSERT INTO customers (first_name, last_name, phone, password_hash, created_at, updated_at)
      VALUES ('Cart', 'Fixture', ?, 'synthetic fixture hash', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6))`, [phone])
    const [{ customer_id: id }] = await database.query('SELECT customer_id FROM customers WHERE phone = ?', [phone])
    return { id, cookie: `press-customer=${(await sessions.create({ actorType: 'customer', actorId: id })).token}` }
  }
  function reader(state = variants.map((row) => ({ ...row }))) {
    const calls = []
    return { state, calls, read: async (ids, tx) => {
      assert.ok(ids.length <= 100)
      assert.equal(typeof tx?.query, 'function')
      calls.push([...ids])
      return state.filter((row) => ids.includes(row.variantId)).map((row) => ({ ...row }))
    } }
  }
  async function context(t, options = {}) {
    const owner = await customer()
    const other = await customer()
    const catalog = reader()
    const router = createCartRouter({ database: options.database ?? database, config: { nodeEnv: 'test' },
      readVariants: options.readVariants ?? catalog.read })
    const app = await startTestApp(t, { manifests: [{ id: 'cart-fixture', path: '/cart', router }] })
    async function request(path = '', method = 'GET', body, extra = {}) {
      const response = await fetch(`${app.origin}/api/v1/cart${path}`, { method,
        headers: { Cookie: owner.cookie, ...(method === 'GET' ? {} : { Origin: app.origin }),
          ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...extra },
        body: body === undefined ? undefined : JSON.stringify(body) })
      assert.equal(response.headers.get('cache-control'), 'no-store')
      assert.equal(response.headers.get('set-cookie'), null)
      return { status: response.status, body: await response.json() }
    }
    const service = createCartService({ repository: createCartRepository(database), readVariants: catalog.read })
    return { ...app, owner, other, catalog, request, service }
  }
  async function add(ctx, version = 1, quantity = 2, variantId = variants[0].variantId) {
    const result = await ctx.request('/items', 'POST', { variantId, quantity, expectedCartVersion: version })
    assert.equal(result.status, 200, JSON.stringify(result.body))
    return result.body.data
  }
  it('creates one empty account cart and serializes concurrent first reads', async (t) => {
    const ctx = await context(t)
    const values = await Promise.all([ctx.service.current(ctx.owner.id), ctx.service.current(ctx.owner.id)])
    assert.equal(values[0].cartId, values[1].cartId)
    assert.deepEqual(values[0], { cartId: values[0].cartId, version: 1, items: [], totalMinor: 0 })
    assert.equal(ctx.catalog.calls.length, 0)
    const [{ count }] = await database.query('SELECT COUNT(*) AS count FROM carts WHERE customer_id = ?', [ctx.owner.id])
    assert.equal(count, '1')
  })
  it('adds, merges, updates, removes and clears without duplicate rows or caller-owned IDs', async (t) => {
    const ctx = await context(t)
    const added = await add(ctx)
    assert.equal(added.version, 2)
    assert.equal(added.totalMinor, 640000)
    assert.deepEqual(Object.keys(added.items[0]).sort(), ['cartItemId', 'color', 'currentUnitPriceMinor', 'isAvailable', 'productId', 'quantity', 'size', 'variantId'].sort())
    const merged = await add(ctx, 2, 3)
    assert.equal(merged.items.length, 1)
    assert.equal(merged.items[0].quantity, 5)
    const id = merged.items[0].cartItemId
    const updated = await ctx.request(`/items/${id}`, 'PATCH', { quantity: 4, expectedCartVersion: 3 })
    assert.equal(updated.body.data.version, 4)
    const noChange = await ctx.request(`/items/${id}`, 'PATCH', { quantity: 4, expectedCartVersion: 4 })
    assert.equal(noChange.body.data.version, 4)
    const removed = await ctx.request(`/items/${id}`, 'DELETE', { expectedCartVersion: 4 })
    assert.equal(removed.body.data.version, 5)
    assert.deepEqual(removed.body.data.items, [])
    assert.equal((await ctx.request(`/items/${id}`, 'DELETE', { expectedCartVersion: 5 })).body.data.version, 5)
    assert.equal((await ctx.request('', 'DELETE', { expectedCartVersion: 5 })).body.data.version, 5)
    await add(ctx, 5)
    const cleared = await ctx.request('', 'DELETE', { expectedCartVersion: 6 })
    assert.equal(cleared.body.data.version, 7)
    assert.deepEqual(cleared.body.data.items, [])
  })
  it('enforces session scope, ownership, Origin, strict inputs and safe errors', async (t) => {
    const ctx = await context(t)
    assert.equal((await ctx.request('', 'GET', undefined, { Cookie: '' })).status, 401)
    assert.equal((await ctx.request('', 'GET', undefined, { Cookie: adminCookie })).status, 403)
    assert.equal((await ctx.request('', 'GET', undefined, { Cookie: `${ctx.owner.cookie}; ${ctx.owner.cookie}` })).status, 401)
    const added = await add(ctx)
    const id = added.items[0].cartItemId
    assert.deepEqual((await ctx.request('', 'GET', undefined, { Cookie: ctx.other.cookie })).body.data.items, [])
    const hidden = await ctx.request(`/items/${id}`, 'PATCH', { quantity: 1, expectedCartVersion: 1 }, { Cookie: ctx.other.cookie })
    assert.equal(hidden.status, 404)
    assert.equal((await ctx.request(`/items/${id}`, 'DELETE', { expectedCartVersion: 1 }, { Cookie: ctx.other.cookie })).status, 200)
    assert.equal((await ctx.service.current(ctx.owner.id)).items[0].quantity, 2)
    for (const headers of [{ Origin: 'https://attacker.test' }, { Origin: '' }, { 'Sec-Fetch-Site': 'cross-site' }]) {
      assert.equal((await ctx.request('/items', 'POST', { variantId: variants[0].variantId, quantity: 1, expectedCartVersion: 2 }, headers)).status, 403)
    }
    for (const extra of [{ customerId: ctx.other.id }, { currentUnitPriceMinor: 1 }, { quantity: 100 }, { quantity: '2' }, { expectedCartVersion: '2' }]) {
      assert.equal((await ctx.request('/items', 'POST', { variantId: variants[0].variantId, quantity: 1, expectedCartVersion: 2, ...extra })).status, 422)
    }
    assert.equal((await ctx.request('?customerId=2')).status, 422)
    assert.equal((await ctx.request('/items/01', 'PATCH', { quantity: 1, expectedCartVersion: 2 })).status, 422)
    assert.equal((await ctx.request('/items', 'POST', undefined)).status, 415)
    assert.equal((await ctx.request('/items', 'POST', { variantId: '18446744073709551615', quantity: 1, expectedCartVersion: 2 })).body.error.code, 'VARIANT_UNAVAILABLE')
  })
  it('allows only one concurrent writer using the same version and preserves quantity on rejection', async (t) => {
    const ctx = await context(t)
    const input = { variantId: variants[0].variantId, quantity: 1, expectedCartVersion: 1 }
    const results = await Promise.all([ctx.request('/items', 'POST', input), ctx.request('/items', 'POST', input)])
    assert.deepEqual(results.map((row) => row.status).sort(), [200, 409])
    const conflict = results.find((row) => row.status === 409)
    assert.equal(conflict.body.error.code, 'CART_CONFLICT')
    assert.equal(typeof conflict.body.error.requestId, 'string')
    const cart = (await ctx.request()).body.data
    assert.equal(cart.items.length, 1)
    assert.equal(cart.items[0].quantity, 1)
    await add(ctx, 2, 98)
    const overflow = await ctx.request('/items', 'POST', { ...input, expectedCartVersion: 3 })
    assert.equal(overflow.status, 422)
    assert.equal((await ctx.service.current(ctx.owner.id)).items[0].quantity, 99)
    const staleRemove = await ctx.request(`/items/${cart.items[0].cartItemId}`, 'DELETE', { expectedCartVersion: 1 })
    assert.equal(staleRemove.status, 409)
  })
  it('enforces the 100-line boundary but permits merging existing rows at capacity', async (t) => {
    const ctx = await context(t)
    for (let i = 0; i < 100; i++) await add(ctx, i + 1, 1, variants[i].variantId)
    const overflow = await ctx.request('/items', 'POST', { variantId: variants[100].variantId, quantity: 1, expectedCartVersion: 101 })
    assert.equal(overflow.status, 422)
    const merged = await add(ctx, 101, 1)
    assert.equal(merged.items.length, 100)
    assert.equal(merged.items[0].quantity, 2)
    assert.ok(ctx.catalog.calls.every((ids) => ids.length <= 100))
  })
  it('refreshes current price in one injected batch, retains unavailable rows and never edits CAT', async (t) => {
    const ctx = await context(t)
    const before = await database.query('SELECT price_minor, discount_percent FROM products WHERE product_id = ?', [productId])
    await add(ctx)
    await add(ctx, 2, 1, variants[1].variantId)
    ctx.catalog.state[0].finalPriceMinor = 100
    ctx.catalog.state[0].isAvailable = false
    ctx.catalog.calls.length = 0
    const cart = (await ctx.request()).body.data
    assert.equal(ctx.catalog.calls.length, 1)
    assert.equal(ctx.catalog.calls[0].length, 2)
    assert.equal(cart.version, 3)
    assert.equal(cart.items[0].currentUnitPriceMinor, 100)
    assert.equal(cart.items[0].isAvailable, false)
    const rejected = await ctx.request(`/items/${cart.items[0].cartItemId}`, 'PATCH', { quantity: 3, expectedCartVersion: 3 })
    assert.equal(rejected.body.error.code, 'VARIANT_UNAVAILABLE')
    assert.deepEqual(await database.query('SELECT price_minor, discount_percent FROM products WHERE product_id = ?', [productId]), before)
    const cached = await database.query('SELECT current_unit_price_minor FROM cart_items WHERE cart_item_id = ?', [cart.items[0].cartItemId])
    assert.equal(cached[0].current_unit_price_minor, '100')
  })
  it('rolls back insert/version changes when exact total exceeds JSON integer range', async (t) => {
    const ctx = await context(t)
    ctx.catalog.state[0].finalPriceMinor = Number.MAX_SAFE_INTEGER
    const result = await ctx.request('/items', 'POST', { variantId: variants[0].variantId, quantity: 2, expectedCartVersion: 1 })
    assert.equal(result.status, 422)
    assert.deepEqual((await ctx.request()).body.data.items, [])
    assert.equal((await ctx.request()).body.data.version, 1)
  })
  it('fails closed on missing/incomplete/duplicate catalog data without leaking provider errors', async (t) => {
    const ctx = await context(t)
    await add(ctx)
    for (const readVariants of [async () => [], async () => [variants[0], variants[0]],
      async () => [{ ...variants[0], finalPriceMinor: '10' }], async () => { throw new Error('private SQL and credentials') }]) {
      const service = createCartService({ repository: createCartRepository(database), readVariants })
      await assert.rejects(service.current(ctx.owner.id))
    }
    const failing = await context(t, { readVariants: async () => { throw new Error('private SQL and credentials') } })
    const result = await failing.request('/items', 'POST', { variantId: variants[0].variantId, quantity: 1, expectedCartVersion: 1 })
    assert.equal(result.status, 500)
    assert.equal(result.body.error.code, 'INTERNAL_ERROR')
    assert.doesNotMatch(JSON.stringify(result), /private SQL|credentials|SELECT/)
    assert.deepEqual((await failing.service.current(failing.owner.id)).items, [])
  })
  it('rolls back a late database failure without partial quantities or version changes', async (t) => {
    const original = await context(t)
    const created = await add(original)
    const broken = { transaction: (work) => database.transaction((tx) => work({ query: (sql, values) => {
      if (sql.startsWith('UPDATE carts SET version')) throw new Error('synthetic late failure')
      return tx.query(sql, values)
    } })) }
    const service = createCartService({ repository: createCartRepository(broken), readVariants: original.catalog.read })
    await assert.rejects(service.mutate(original.owner.id, 'update', { quantity: 3, expectedCartVersion: 2 }, created.items[0].cartItemId))
    const after = await original.service.current(original.owner.id)
    assert.equal(after.version, 2)
    assert.equal(after.items[0].quantity, 2)
  })
  it('persists across real logout/login and reconstruction of the MySQL pool', async (t) => {
    const auth = await createCustomerService({ database })
    const phone = `+2012${String(++sequence).padStart(8, '0')}`
    const registered = await auth.register({ firstName: 'Cart', lastName: 'Persistence', phone, password: 'Test-only-password-123' })
    const catalog = reader()
    const service = createCartService({ repository: createCartRepository(database), readVariants: catalog.read })
    const cart = await service.mutate(registered.customer.customerId, 'add', { variantId: variants[0].variantId, quantity: 3, expectedCartVersion: 1 })
    const routers = await createCustomerRouters({ database, config: { nodeEnv: 'test' } })
    const app = await startTestApp(t, { manifests: [{ id: 'auth-fixture', path: '/auth', router: routers.auth }] })
    const logout = await fetch(`${app.origin}/api/v1/auth/customer/logout`, { method: 'POST',
      headers: { Origin: app.origin, Cookie: `press-customer=${registered.session.token}` } })
    assert.equal(logout.status, 200)
    assert.equal(await sessions.find(registered.session.token, 'customer'), null)
    const login = await fetch(`${app.origin}/api/v1/auth/customer/login`, { method: 'POST',
      headers: { Origin: app.origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, password: 'Test-only-password-123' }) })
    assert.equal(login.status, 200)
    assert.match(login.headers.get('set-cookie'), /press-customer=/)
    const freshDatabase = createDatabase(fixture.config)
    try {
      const fresh = createCartService({ repository: createCartRepository(freshDatabase), readVariants: catalog.read })
      assert.deepEqual(await fresh.current(registered.customer.customerId), cart)
    } finally { await freshDatabase.close() }
  })
  it('fails closed for expired sessions and production Origin spoofing', async (t) => {
    const ctx = await context(t)
    const historicalSessions = createSessionService({ repository: createSessionRepository(database),
      clock: () => new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) })
    const expired = await historicalSessions.create({ actorType: 'customer', actorId: ctx.owner.id })
    assert.equal((await ctx.request('', 'GET', undefined, { Cookie: `press-customer=${expired.token}` })).status, 401)
    const active = await sessions.create({ actorType: 'customer', actorId: ctx.owner.id })
    const router = createCartRouter({ database, config: { nodeEnv: 'production' }, appOrigin: 'https://store.test', readVariants: ctx.catalog.read })
    const app = await startTestApp(t, { manifests: [{ id: 'cart-production-fixture', path: '/cart', router }] })
    const headers = { Cookie: `__Host-press-customer=${active.token}`, 'Content-Type': 'application/json' }
    const body = JSON.stringify({ variantId: variants[0].variantId, quantity: 1, expectedCartVersion: 1 })
    const denied = await fetch(`${app.origin}/api/v1/cart/items`, { method: 'POST', body,
      headers: { ...headers, Origin: app.origin, 'X-Forwarded-Host': 'store.test', 'X-Forwarded-Proto': 'https' } })
    assert.equal(denied.status, 403)
    const accepted = await fetch(`${app.origin}/api/v1/cart/items`, { method: 'POST', body,
      headers: { ...headers, Origin: 'https://store.test' } })
    assert.equal(accepted.status, 200)
  })
  it('refuses version exhaustion without committing item changes', async (t) => {
    const ctx = await context(t)
    const created = await add(ctx)
    await database.query('UPDATE carts SET version = 4294967295 WHERE cart_id = ?', [created.cartId])
    const result = await ctx.request(`/items/${created.items[0].cartItemId}`, 'PATCH', { quantity: 3, expectedCartVersion: 4294967295 })
    assert.equal(result.status, 409)
    const cart = (await ctx.request()).body.data
    assert.equal(cart.version, 4294967295)
    assert.equal(cart.items[0].quantity, 2)
  })
  it('enforces foreign keys, quantity/price bounds and uniqueness in actual MySQL', async () => {
    const owner = await customer()
    const service = createCartService({ repository: createCartRepository(database), readVariants: reader().read })
    const cart = await service.mutate(owner.id, 'add', { variantId: variants[0].variantId, quantity: 1, expectedCartVersion: 1 })
    const insert = (cartId, variantId, count, price) => database.query(`INSERT INTO cart_items
      (cart_id, variant_id, quantity, current_unit_price_minor, created_at, updated_at) VALUES (?, ?, ?, ?, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6))`,
    [cartId, variantId, count, price])
    await assert.rejects(insert(cart.cartId, variants[0].variantId, 1, 0), { code: 'DB_CONSTRAINT_FAILED' })
    await assert.rejects(insert(cart.cartId, variants[1].variantId, 0, 0), { code: 'DB_CONSTRAINT_FAILED' })
    await assert.rejects(insert(cart.cartId, variants[1].variantId, 100, 0), { code: 'DB_CONSTRAINT_FAILED' })
    await assert.rejects(insert(cart.cartId, variants[1].variantId, 1, '9007199254740992'), { code: 'DB_CONSTRAINT_FAILED' })
    await assert.rejects(insert(cart.cartId, '18446744073709551615', 1, 0), { code: 'DB_CONSTRAINT_FAILED' })
    await assert.rejects(database.query('DELETE FROM customers WHERE customer_id = ?', [owner.id]), { code: 'DB_CONSTRAINT_FAILED' })
    await assert.rejects(database.query('UPDATE carts SET version = 0 WHERE cart_id = ?', [cart.cartId]), { code: 'DB_CONSTRAINT_FAILED' })
    await assert.rejects(database.query(`INSERT INTO carts (customer_id, created_at, updated_at)
      VALUES (?, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6))`, [owner.id]), { code: 'DB_CONSTRAINT_FAILED' })
    await assert.rejects(database.query(`INSERT INTO carts (customer_id, created_at, updated_at)
      VALUES (?, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6))`, ['18446744073709551615']), { code: 'DB_CONSTRAINT_FAILED' })
  })
})

describe('cart migration upgrade and discovery isolation', {
  skip: !localDatabaseTestsEnabled() && 'Requires new disposable MySQL fixture opt-in',
}, () => {
  it('upgrades a CAT baseline and reruns immutable migrations without changing owner data', async () => {
    const fixture = await startDisposableMysql()
    const database = createDatabase(fixture.config)
    try {
      const migrations = await cartMigrations()
      const cartMigrationName = 'persistent-cart_001_create_carts.sql'
      const cartMigrationIndex = migrations.findIndex(({ name }) => name === cartMigrationName)
      assert.notEqual(cartMigrationIndex, -1, 'The initial CART migration must be discoverable')
      const baseline = migrations.slice(0, cartMigrationIndex)
      const throughCart = migrations.slice(0, cartMigrationIndex + 1)
      await runMigrations({ config: fixture.config, migrations: baseline })
      const [{ count: before }] = await database.query('SELECT COUNT(*) AS count FROM migration_records')
      await database.query(`INSERT INTO brands (name, created_at, updated_at) VALUES ('Upgrade fixture', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6))`)
      const upgraded = await runMigrations({ config: fixture.config, migrations: throughCart })
      assert.deepEqual(upgraded.applied, [cartMigrationName])
      assert.equal((await database.query('SELECT name FROM brands'))[0].name, 'Upgrade fixture')
      assert.deepEqual((await runMigrations({ config: fixture.config, migrations: throughCart })).applied, [])
      const [{ count: after }] = await database.query('SELECT COUNT(*) AS count FROM migration_records')
      assert.equal(BigInt(after), BigInt(before) + 1n)
    } finally {
      try { await database.close() } finally { await fixture.stop() }
    }
  })
})
