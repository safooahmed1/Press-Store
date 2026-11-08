import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, before, describe, it } from 'node:test'
import { startServer } from '../../app/start-server.js'
import { localDatabaseTestsEnabled } from '../../config/database-config.js'
import { createSessionRepository } from '../../platform/auth/session-repository.js'
import { createSessionService } from '../../platform/auth/sessions.js'
import { createDatabase } from '../../platform/db/database.js'
import { loadMigrations } from '../../platform/db/migration-files.js'
import { runMigrations } from '../../platform/db/migrate.js'
import { startDisposableMysql } from '../../platform/db/testing/disposable-mysql.js'
import { createLogger } from '../../platform/observability/logger.js'
import { createAdminOrderRepository } from '../orders/admin/admin-order-repository.js'
import { createAdminOrderService } from '../orders/admin/admin-orders.js'
import { initialOrderState } from '../orders/domain/order-state.js'
import { createOrderSubmissionRepository } from '../orders/repositories/order-submissions.js'

const now = new Date()
const dayMs = 24 * 60 * 60 * 1000
const actor = { actorType: 'admin', actorId: '1' }
const phone = '+201112345678'
const walletSender = '+201212345678'
const snapshot = { subtotalMinor: 10000, discountMinor: 0, totalMinor: 10000,
  items: [{ position: 1, productId: null, variantId: null, productName: 'Historical shirt', color: 'Black',
    size: 'M', quantity: 1, baseUnitPriceMinor: 10000, finalUnitPriceMinor: 10000, discountPercent: 0 }] }

describe('admin-dashboard owner projections through the discovered server', {
  skip: !localDatabaseTestsEnabled() && 'Requires disposable MySQL',
}, () => {
  let fixture, database, server, origin, uploadRoot, sessions, adminCookie, rejectedTable
  const reads = []
  const logs = []

  before(async () => {
    fixture = await startDisposableMysql()
    database = createDatabase(fixture.config)
    await runMigrations({ config: fixture.config, migrations: await loadMigrations() })
    await database.query(`INSERT INTO admins (admin_id, phone, password_hash, created_at, updated_at)
      VALUES (1, '+201098765432', 'synthetic admin hash', ?, ?)`, [now, now])
    sessions = createSessionService({ repository: createSessionRepository(database) })
    adminCookie = `press-admin=${(await sessions.create(actor)).token}`
    const query = (handle) => (sql, values) => {
      const table = /FROM (products|orders|customers)\b/i.exec(sql)?.[1]
      if (table) {
        reads.push({ table, sql, values })
        if (table === rejectedTable) throw new Error('private owner failure')
      }
      return handle.query(sql, values)
    }
    const counted = { query: query(database), transaction: (work) => database.transaction((tx) => work({ query: query(tx) })),
      check: database.check, close: database.close }
    uploadRoot = await mkdtemp(join(tmpdir(), 'press-adm004-uploads-'))
    server = await startServer({ config: { nodeEnv: 'test', port: 0 }, databaseConfig: fixture.config,
      databaseFactory: () => counted, storageConfig: { root: uploadRoot },
      logger: createLogger({ environment: 'test', sink: (line) => logs.push(line) }) })
    origin = `http://127.0.0.1:${server.address().port}`
  })

  after(async () => {
    try {
      if (server) {
        server.closeAllConnections()
        await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
      }
    } finally {
      try { await database?.close() } finally {
        try { await fixture?.stop() } finally {
          if (uploadRoot) await rm(uploadRoot, { recursive: true, force: true })
        }
      }
    }
  })

  async function request({ cookie = adminCookie, query = '', method = 'GET' } = {}) {
    const response = await fetch(`${origin}/api/v1/admin/dashboard${query}`, { method, headers: cookie ? { cookie } : {} })
    return { status: response.status, cache: response.headers.get('cache-control'), body: await response.json() }
  }

  it('returns actual zeros and empty lists and rejects unauthenticated access without querying owners', async () => {
    reads.length = 0
    const unauthorized = await request({ cookie: null })
    assert.equal(unauthorized.status, 401)
    assert.equal(unauthorized.body.error.code, 'AUTH_REQUIRED')
    assert.deepEqual(reads, [])
    const empty = await request()
    assert.equal(empty.status, 200)
    assert.equal(empty.cache, 'no-store')
    assert.deepEqual(empty.body, { data: { totalProducts: 0, totalOrders: 0, totalCustomers: 0,
      attentionOrders: [], recentOrders: [] } })
  })

  it('returns exact owner totals, bounded lists, and safe fields for admin only', async () => {
    const { insertId: customerId } = await database.query(`INSERT INTO customers
      (first_name, last_name, phone, password_hash, created_at, updated_at)
      VALUES ('Dashboard', 'Fixture', ?, 'synthetic customer hash', ?, ?)`, [phone, now, now])
    await database.query(`INSERT INTO customers (first_name, last_name, phone, password_hash, created_at, updated_at)
      VALUES ('No', 'Orders', '+201012345678', 'synthetic customer hash', ?, ?)`, [now, now])
    const customerCookie = `press-customer=${(await sessions.create({ actorType: 'customer', actorId: String(customerId) })).token}`
    const { insertId: categoryId } = await database.query(`INSERT INTO categories
      (name, image_path, created_at, updated_at) VALUES ('Dashboard', 'fixture.png', ?, ?)`, [now, now])
    const { insertId: brandId } = await database.query(`INSERT INTO brands
      (name, created_at, updated_at) VALUES ('Dashboard', ?, ?)`, [now, now])
    for (const [name, deletedAt] of [['Visible', null], ['Unavailable but listed', null], ['Archived', now]]) {
      const { insertId } = await database.query(`INSERT INTO products
        (name, description, category_id, brand_id, price_minor, deleted_at, created_at, updated_at)
        VALUES (?, 'fixture', ?, ?, 10000, ?, ?, ?)`, [name, String(categoryId), String(brandId), deletedAt, now, now])
      await database.query(`INSERT INTO product_variants (product_id, color, size, is_available)
        VALUES (?, 'Black', 'M', ?)`, [String(insertId), name === 'Visible'])
    }

    const submissions = createOrderSubmissionRepository(database)
    const admin = createAdminOrderService({ database, repository: createAdminOrderRepository(database), clock: () => now })
    let sequence = 0
    async function seed(method, age) {
      const createdAt = new Date(now.getTime() - age)
      const cashExpiresAt = method === 'cash' ? new Date(createdAt.getTime() + 7 * dayMs) : null
      const state = initialOrderState({ paymentMethod: method, cashExpiresAt }, createdAt)
      const orderNumber = `PS-ADM-${++sequence}`
      const orderId = await database.transaction((tx) => submissions.insert(tx, { customerId: String(customerId),
        orderNumber, state, snapshot, walletSenderNumber: method === 'wallet_eg' ? walletSender : null,
        keyHash: Buffer.alloc(32, sequence), requestHash: Buffer.alloc(32, sequence) }))
      return { orderId, orderNumber, createdAt: state.createdAt, paymentMethod: method,
        paymentStatus: state.paymentStatus, fulfillmentStatus: state.fulfillmentStatus }
    }
    const placed = []
    for (let index = 0; index < 10; index++) placed.push(await seed('cash', 2000))
    const cashPrepared = await seed('cash', 1000)
    await admin.act(cashPrepared.orderId, 'prepare', { expectedVersion: 1 }, actor)
    cashPrepared.fulfillmentStatus = 'prepared'
    const pending = await seed('wallet_eg', 1000)
    const paid = await seed('instapay', 1000)
    await admin.act(paid.orderId, 'verify-payment', { expectedVersion: 1 }, actor)
    paid.paymentStatus = 'paid'
    const delivered = await seed('cash', 1000)
    await admin.act(delivered.orderId, 'deliver', { expectedVersion: 1 }, actor)
    delivered.paymentStatus = 'paid'
    delivered.fulfillmentStatus = 'delivered'
    const cancelled = await seed('cash', 9 * dayMs)
    await database.query(`UPDATE orders SET fulfillment_status = 'cancelled', version = 2,
      cancelled_at = ?, updated_at = ? WHERE order_id = ?`, [now, now, cancelled.orderId])
    cancelled.fulfillmentStatus = 'cancelled'

    reads.length = 0
    const forbidden = await request({ cookie: customerCookie })
    assert.equal(forbidden.status, 403)
    assert.equal(forbidden.body.error.code, 'FORBIDDEN')
    assert.deepEqual(reads, [])
    const result = await request({ cookie: `${customerCookie}; ${adminCookie}` })
    assert.equal(result.status, 200)
    assert.equal(result.cache, 'no-store')
    const all = [...placed, cashPrepared, pending, paid, delivered, cancelled]
    assert.deepEqual(result.body, { data: { totalProducts: 2, totalOrders: all.length, totalCustomers: 2,
      attentionOrders: [paid, pending, cashPrepared, ...placed.slice().reverse()].slice(0, 10),
      recentOrders: all.slice().reverse().slice(0, 10) } })
    assert.deepEqual(reads.map(({ table }) => table), ['products', 'orders', 'orders', 'orders', 'customers'])
    const { sql, values } = reads[3]
    const plan = await database.query(`EXPLAIN ${sql}`, values)
    const branches = plan.filter(({ table }) => table === 'orders')
    assert.equal(branches.length, 2)
    assert.ok(branches.every(({ possible_keys }) => possible_keys?.includes('orders_fulfillment')))
    for (const secret of [phone, walletSender, adminCookie, customerCookie, 'synthetic customer hash']) {
      assert.ok(!JSON.stringify(result).includes(secret))
      assert.ok(!JSON.stringify(logs).includes(secret))
    }
  })

  it('fails closed on any required owner projection and rejects unsupported inputs or writes', async () => {
    reads.length = 0
    const invalid = await request({ query: '?limit=1' })
    assert.equal(invalid.status, 422)
    assert.equal(invalid.body.error.code, 'VALIDATION_FAILED')
    assert.equal((await request({ method: 'DELETE' })).status, 404)
    assert.deepEqual(reads, [])
    try {
      for (const table of ['products', 'orders', 'customers']) {
        rejectedTable = table
        const result = await request()
        assert.equal(result.status, 503)
        assert.equal(result.body.error.code, 'DASHBOARD_UNAVAILABLE')
        assert.ok(!Object.hasOwn(result.body, 'data'))
        assert.ok(!JSON.stringify(result).includes('private owner failure'))
      }
    } finally {
      rejectedTable = undefined
    }
    assert.ok(!JSON.stringify(logs).includes('private owner failure'))
  })
})
