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
import { createIdentityRepository } from '../auth/repositories/identities.js'
import { initialOrderState } from '../orders/domain/order-state.js'
import { createOrderSubmissionRepository } from '../orders/repositories/order-submissions.js'
import { createCustomerDirectory } from './customer-directory.js'

const route = '/api/v1/admin/customers'
const now = new Date()
const dayMs = 24 * 60 * 60 * 1000
const snapshot = { subtotalMinor: 10000, discountMinor: 500, totalMinor: 9500,
  items: [{ position: 1, productId: null, variantId: null, productName: 'Historical shirt', color: 'Black',
    size: 'M', quantity: 1, baseUnitPriceMinor: 10000, finalUnitPriceMinor: 9500, discountPercent: 5 }] }

describe('customers admin directory on disposable MySQL', {
  skip: !localDatabaseTestsEnabled() && 'Requires disposable MySQL',
}, () => {
  let fixture, database, counted, server, origin, uploadRoot, adminCookie, customerCookie, customers, orders
  const logs = []
  const queries = []
  let rejectedTable

  before(async () => {
    fixture = await startDisposableMysql()
    database = createDatabase(fixture.config)
    await runMigrations({ config: fixture.config, migrations: await loadMigrations() })
    await database.query(`INSERT INTO admins (admin_id, phone, password_hash, created_at, updated_at)
      VALUES (1, '+201098765432', 'synthetic admin hash', ?, ?)`, [now, now])
    customers = []
    for (const phone of ['+201012345678', '+201112345678', '+201212345678']) {
      const { insertId } = await database.query(`INSERT INTO customers
        (first_name, last_name, phone, password_hash, created_at, updated_at)
        VALUES ('Same', 'Name', ?, 'synthetic customer hash', ?, ?)`, [phone, now, now])
      customers.push({ customerId: String(insertId), name: 'Same Name', phone })
    }
    const sessions = createSessionService({ repository: createSessionRepository(database) })
    adminCookie = `press-admin=${(await sessions.create({ actorType: 'admin', actorId: '1' })).token}`
    customerCookie = `press-customer=${(await sessions.create({ actorType: 'customer', actorId: customers[0].customerId })).token}`
    const submissions = createOrderSubmissionRepository(database)
    async function order(customer, orderNumber, paymentMethod, createdAt, key) {
      const cashExpiresAt = paymentMethod === 'cash' ? new Date(createdAt.getTime() + 7 * dayMs) : null
      const state = initialOrderState({ paymentMethod, cashExpiresAt }, createdAt)
      const orderId = await database.transaction((tx) => submissions.insert(tx, { customerId: customer.customerId,
        orderNumber, state, snapshot, walletSenderNumber: paymentMethod === 'wallet_eg' ? '+201512345678' : null,
        keyHash: Buffer.alloc(32, key), requestHash: Buffer.alloc(32, key) }))
      return { orderId, orderNumber, createdAt: state.createdAt, totalMinor: snapshot.totalMinor,
        paymentMethod, paymentStatus: state.paymentStatus, fulfillmentStatus: state.fulfillmentStatus }
    }
    const active = await order(customers[0], 'PS-CUS-1', 'wallet_eg', new Date(now.getTime() - dayMs), 1)
    const cancelled = await order(customers[0], 'PS-CUS-2', 'cash', new Date(now.getTime() - 9 * dayMs), 2)
    const foreign = await order(customers[1], 'PS-CUS-3', 'instapay', now, 3)
    await database.query(`UPDATE orders SET fulfillment_status = 'cancelled', version = 2,
      cancelled_at = ?, updated_at = ? WHERE order_id = ?`, [now, now, cancelled.orderId])
    orders = { active, cancelled: { ...cancelled, fulfillmentStatus: 'cancelled' }, foreign }

    const query = (handle) => (sql, values) => {
      const table = /FROM (customers|orders)\b/i.exec(sql)?.[1]
      if (table) {
        queries.push({ table, sql, values })
        if (table === rejectedTable) throw new Error('private projection failure')
      }
      return handle.query(sql, values)
    }
    counted = { query: query(database), transaction: (work) => database.transaction((tx) => work({ query: query(tx) })),
      check: database.check, close: database.close }
    uploadRoot = await mkdtemp(join(tmpdir(), 'press-cus001-uploads-'))
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

  async function request(path = '', { cookie = adminCookie, method = 'GET' } = {}) {
    const response = await fetch(origin + route + path, { method, headers: cookie ? { cookie } : {} })
    return { status: response.status, cache: response.headers.get('cache-control'), body: await response.json() }
  }

  it('rejects anonymous and customer access and exposes no write action', async () => {
    queries.length = 0
    for (const path of ['', `/${customers[0].customerId}`]) {
      for (const [cookie, status, code] of [[null, 401, 'AUTH_REQUIRED'], [customerCookie, 403, 'FORBIDDEN']]) {
        const result = await request(path, { cookie })
        assert.equal(result.status, status)
        assert.equal(result.cache, 'no-store')
        assert.equal(result.body.error.code, code)
      }
    }
    const remove = await request(`/${customers[0].customerId}`, { method: 'DELETE' })
    assert.equal(remove.status, 404)
    assert.deepEqual(queries, [])
  })

  it('paginates customer summaries and gets every count in one grouped ORD query', async () => {
    for (const pageSize of [1, 50]) {
      queries.length = 0
      const result = await request(`?pageSize=${pageSize}`)
      assert.equal(result.status, 200)
      assert.equal(result.cache, 'no-store')
      assert.deepEqual(result.body, {
        data: { items: customers.slice(0, pageSize).map((customer, index) => ({ ...customer, orderCount: [2, 1, 0][index] })) },
        meta: { page: 1, pageSize, total: 3 },
      })
      assert.deepEqual(queries.map(({ table }) => table), ['customers', 'customers', 'orders'])
      const { sql, values } = queries[2]
      const [plan] = await database.query(`EXPLAIN ${sql}`, values)
      assert.match(plan.possible_keys, /orders_customer_history/)
    }
    const second = await request('?page=2&pageSize=1')
    assert.deepEqual(second.body.data.items, [{ ...customers[1], orderCount: 1 }])
    queries.length = 0
    assert.deepEqual((await request('?page=4&pageSize=1')).body.data.items, [])
    assert.deepEqual(queries.map(({ table }) => table), ['customers', 'customers'])
  })

  it('returns only the requested customer and paginates their admin-visible history including cancellations', async () => {
    queries.length = 0
    const first = await request(`/${customers[0].customerId}?pageSize=1`)
    assert.equal(first.status, 200)
    assert.deepEqual(first.body, { data: { customer: { ...customers[0], orderCount: 2, orders: [orders.active] } },
      meta: { page: 1, pageSize: 1, total: 2 } })
    assert.deepEqual(queries.map(({ table }) => table), ['customers', 'orders', 'orders'])
    const { sql, values } = queries[2]
    const [plan] = await database.query(`EXPLAIN ${sql}`, values)
    assert.match(plan.possible_keys, /orders_customer_history/)
    assert.deepEqual((await request(`/${customers[0].customerId}?page=2&pageSize=1`)).body.data.customer.orders, [orders.cancelled])
    assert.deepEqual((await request(`/${customers[1].customerId}`)).body.data.customer.orders, [orders.foreign])
    assert.deepEqual((await request(`/${customers[2].customerId}`)).body.data.customer.orders, [])
  })

  it('returns safe input/not-found errors and no partial results when either dependency fails', async () => {
    for (const path of ['?page=0', '?pageSize=51', '?page=1&page=2', '?phone=0',
      '/01', '/1%0A', '/18446744073709551616', `/${customers[0].customerId}?customerId=2`]) {
      const result = await request(path)
      assert.equal(result.status, 422, path)
      assert.equal(result.body.error.code, 'VALIDATION_FAILED')
    }
    queries.length = 0
    const missing = await request('/18446744073709551615')
    assert.equal(missing.status, 404)
    assert.equal(missing.body.error.code, 'CUSTOMER_NOT_FOUND')
    assert.deepEqual(queries.map(({ table }) => table), ['customers'])
    try {
      for (const table of ['customers', 'orders']) {
        rejectedTable = table
        for (const path of ['', `/${customers[0].customerId}`]) {
          const result = await request(path)
          assert.equal(result.status, 503)
          assert.equal(result.body.error.code, 'DEPENDENCY_UNAVAILABLE')
          assert.ok(!Object.hasOwn(result.body, 'data'))
          assert.ok(!JSON.stringify(result).includes('private projection failure'))
        }
      }
    } finally {
      rejectedTable = undefined
    }
    for (const privateValue of [customers[0].phone, adminCookie, customerCookie, 'private projection failure']) {
      assert.ok(!JSON.stringify(logs).includes(privateValue))
    }
  })

  it('exposes the dashboard count as one internal aggregate', async () => {
    queries.length = 0
    const directory = createCustomerDirectory({ identities: createIdentityRepository(counted) })
    assert.equal(await directory.countCustomers(), 3)
    assert.deepEqual(queries.map(({ sql }) => sql), ['SELECT COUNT(*) AS total FROM customers'])
  })
})
