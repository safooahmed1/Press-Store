import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, before, describe, it } from 'node:test'
import { startServer } from '../../../app/start-server.js'
import { localDatabaseTestsEnabled } from '../../../config/database-config.js'
import { createSessionRepository } from '../../../platform/auth/session-repository.js'
import { createSessionService } from '../../../platform/auth/sessions.js'
import { createDatabase } from '../../../platform/db/database.js'
import { loadMigrations } from '../../../platform/db/migration-files.js'
import { runMigrations } from '../../../platform/db/migrate.js'
import { startDisposableMysql } from '../../../platform/db/testing/disposable-mysql.js'
import { createLogger } from '../../../platform/observability/logger.js'
import { initialOrderState } from '../domain/order-state.js'
import { createOrderSubmissionRepository } from '../repositories/order-submissions.js'

const basePath = '/api/v1/orders'
const senderNumber = '+201212345678'
const dayMs = 24 * 60 * 60 * 1000
const now = new Date()
const dayBefore = (days) => new Date(now.getTime() - days * dayMs)
const snapshot = { subtotalMinor: 20000, discountMinor: 2500, totalMinor: 17500,
  items: [{ position: 1, productId: null, variantId: null, productName: 'Archived shirt', color: 'Black',
    size: 'M', quantity: 2, baseUnitPriceMinor: 10000, finalUnitPriceMinor: 8750, discountPercent: 12.5 }] }

describe('orders customer history through the discovered server', {
  skip: !localDatabaseTestsEnabled() && 'Requires disposable MySQL',
}, () => {
  let fixture, database, server, origin, uploadRoot, orders, owner, other, empty, adminCookie
  const logs = []

  before(async () => {
    fixture = await startDisposableMysql()
    database = createDatabase(fixture.config)
    await runMigrations({ config: fixture.config, migrations: await loadMigrations() })
    const sessions = createSessionService({ repository: createSessionRepository(database) })
    const submissions = createOrderSubmissionRepository(database)
    let sequence = 0

    async function customer(phone) {
      const { insertId } = await database.query(`INSERT INTO customers
        (first_name, last_name, phone, password_hash, created_at, updated_at)
        VALUES ('History', 'Fixture', ?, 'synthetic hash', ?, ?)`, [phone, now, now])
      const customerId = String(insertId)
      const { token } = await sessions.create({ actorType: 'customer', actorId: customerId })
      return { customerId, cookie: `press-customer=${token}` }
    }

    async function seed(customerId, paymentMethod, createdAt) {
      const cashExpiresAt = paymentMethod === 'cash' ? new Date(createdAt.getTime() + 7 * dayMs) : null
      const state = initialOrderState({ paymentMethod, cashExpiresAt }, createdAt)
      const orderNumber = `PS-HISTORY-${++sequence}`
      const orderId = await database.transaction((tx) => submissions.insert(tx, {
        customerId, orderNumber, state, snapshot,
        walletSenderNumber: paymentMethod === 'wallet_eg' ? senderNumber : null,
        keyHash: Buffer.alloc(32, sequence), requestHash: Buffer.alloc(32, sequence),
      }))
      return { orderId, orderNumber, createdAt: state.createdAt, cashExpiresAt: state.cashExpiresAt }
    }

    owner = await customer('+201112345678')
    other = await customer('+201012345678')
    empty = await customer('+201512345678')
    await database.query(`INSERT INTO admins (admin_id, phone, password_hash, created_at, updated_at)
      VALUES (1, '+201098765432', 'synthetic admin hash', ?, ?)`, [now, now])
    adminCookie = `press-admin=${(await sessions.create({ actorType: 'admin', actorId: '1' })).token}`
    const cash = await seed(owner.customerId, 'cash', dayBefore(1))
    const older = await seed(owner.customerId, 'instapay', dayBefore(2))
    const wallet = await seed(owner.customerId, 'wallet_eg', dayBefore(1))
    const foreign = await seed(other.customerId, 'cash', dayBefore(0))
    const cancelled = await seed(owner.customerId, 'cash', dayBefore(9))
    const cancelledAt = dayBefore(1)
    await database.query(`UPDATE orders SET fulfillment_status = 'cancelled', version = 2,
      cancelled_at = ?, updated_at = ? WHERE order_id = ?`, [cancelledAt, cancelledAt, cancelled.orderId])
    orders = { cash, older, wallet, foreign, cancelled }
    uploadRoot = await mkdtemp(join(tmpdir(), 'press-ord009-uploads-'))
    server = await startServer({
      config: { nodeEnv: 'test', port: 0 },
      databaseConfig: fixture.config,
      storageConfig: { root: uploadRoot },
      logger: createLogger({ environment: 'test', sink: (line) => logs.push(line) }),
    })
    origin = `http://127.0.0.1:${server.address().port}`
  })

  after(async () => {
    try {
      if (server) {
        server.closeAllConnections()
        await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
      }
    } finally {
      try {
        await server?.closeDatabase()
        await database?.close()
      } finally {
        try { await fixture?.stop() } finally {
          if (uploadRoot) await rm(uploadRoot, { recursive: true, force: true })
        }
      }
    }
  })

  async function request(path = '', cookie = owner.cookie) {
    const response = await fetch(origin + basePath + path, { headers: cookie ? { cookie } : {} })
    return { status: response.status, cache: response.headers.get('cache-control'), body: await response.json() }
  }

  it('requires a customer session on both reads and sets no-store', async () => {
    for (const path of ['', `/${orders.cash.orderId}`]) {
      for (const [cookie, status, code] of [[null, 401, 'AUTH_REQUIRED'], [adminCookie, 403, 'FORBIDDEN']]) {
        const result = await request(path, cookie)
        assert.equal(result.status, status)
        assert.equal(result.body.error.code, code)
        assert.equal(result.cache, 'no-store')
      }
      const customer = await request(path, `${adminCookie}; ${owner.cookie}`)
      assert.equal(customer.status, 200)
      assert.equal(customer.cache, 'no-store')
    }
  })

  it('paginates only own non-cancelled orders by creation date and then ID', async () => {
    const first = await request('?pageSize=2')
    assert.equal(first.status, 200)
    assert.deepEqual(first.body.meta, { page: 1, pageSize: 2, total: 3 })
    assert.deepEqual(first.body.data.items, [
      { orderId: orders.wallet.orderId, orderNumber: orders.wallet.orderNumber, createdAt: orders.wallet.createdAt,
        totalMinor: 17500, paymentMethod: 'wallet_eg', paymentStatus: 'payment_pending', fulfillmentStatus: 'placed' },
      { orderId: orders.cash.orderId, orderNumber: orders.cash.orderNumber, createdAt: orders.cash.createdAt,
        totalMinor: 17500, paymentMethod: 'cash', paymentStatus: 'unpaid', fulfillmentStatus: 'placed' },
    ])
    assert.deepEqual((await request('?page=2&pageSize=2')).body.data.items.map(({ orderId }) => orderId), [orders.older.orderId])
    assert.deepEqual((await request('?page=3&pageSize=2')).body.data.items, [])
    const otherResult = await request('', other.cookie)
    assert.deepEqual(otherResult.body.meta, { page: 1, pageSize: 20, total: 1 })
    assert.deepEqual(otherResult.body.data.items.map(({ orderId }) => orderId), [orders.foreign.orderId])
    assert.deepEqual((await request('', empty.cookie)).body, { data: { items: [] }, meta: { page: 1, pageSize: 20, total: 0 } })
  })

  it('gives the same safe 404 for missing, cancelled, and another customer’s order', async () => {
    for (const orderId of [orders.cancelled.orderId, orders.foreign.orderId, '18446744073709551615']) {
      const result = await request(`/${orderId}`)
      assert.equal(result.status, 404)
      assert.equal(result.cache, 'no-store')
      const { requestId, ...error } = result.body.error
      assert.ok(requestId)
      assert.deepEqual(error, { code: 'ORDER_NOT_FOUND', message: 'Order not found' })
    }
    assert.equal((await request(`/${orders.wallet.orderId}`, other.cookie)).status, 404)
  })

  it('returns historical snapshots, amounts and pickup guidance without private payment or audit fields', async () => {
    const result = await request(`/${orders.wallet.orderId}`)
    assert.equal(result.status, 200)
    const { items, pickup, ...order } = result.body.data.order
    assert.deepEqual(order, { orderId: orders.wallet.orderId, orderNumber: orders.wallet.orderNumber,
      createdAt: orders.wallet.createdAt, subtotalMinor: 20000, discountMinor: 2500, totalMinor: 17500,
      paymentMethod: 'wallet_eg', paymentStatus: 'payment_pending', fulfillmentStatus: 'placed' })
    assert.deepEqual(items, [{ ...snapshot.items[0], lineSubtotalMinor: 20000, lineTotalMinor: 17500, lineDiscountMinor: 2500 }])
    assert.deepEqual(pickup, { preparationMinutes: { min: 10, max: 60, typical: 30 },
      cashCollectionNotice: null, cashExpiresAt: null })
    const cash = (await request(`/${orders.cash.orderId}`)).body.data.order
    assert.equal(cash.pickup.cashExpiresAt, orders.cash.cashExpiresAt)
    assert.match(cash.pickup.cashCollectionNotice, /3–7 days/)
    assert.ok(!JSON.stringify(result).includes(senderNumber))
    for (const secret of [senderNumber, owner.cookie, other.cookie, adminCookie, 'synthetic hash']) {
      assert.ok(!JSON.stringify(logs).includes(secret))
    }
  })

  it('rejects invalid pagination, injected owners and noncanonical order IDs', async () => {
    for (const path of ['?page=0', '?page=1&page=2', '?pageSize=51', '?page=100001',
      '?customerId=2', `/${orders.cash.orderId}?customerId=2`, `/0${orders.cash.orderId}`,
      `/${orders.cash.orderId}%0A`, '/18446744073709551616']) {
      const result = await request(path)
      assert.equal(result.status, 422, path)
      assert.equal(result.body.error.code, 'VALIDATION_FAILED')
    }
  })

  it('keeps delivered orders visible and stops showing the unpaid cash deadline', async () => {
    const response = await fetch(`${origin}/api/v1/admin/orders/${orders.cash.orderId}/deliver`, {
      method: 'POST', headers: { origin, cookie: adminCookie, 'content-type': 'application/json' },
      body: JSON.stringify({ expectedVersion: 1 }),
    })
    assert.equal(response.status, 200)
    await response.json()
    const result = await request(`/${orders.cash.orderId}`)
    assert.equal(result.status, 200)
    const { paymentStatus, fulfillmentStatus, pickup } = result.body.data.order
    assert.equal(paymentStatus, 'paid')
    assert.equal(fulfillmentStatus, 'delivered')
    assert.equal(pickup.cashExpiresAt, null)
    assert.equal(pickup.cashCollectionNotice, null)
    assert.ok((await request()).body.data.items.some(({ orderId }) => orderId === orders.cash.orderId))
  })
})
