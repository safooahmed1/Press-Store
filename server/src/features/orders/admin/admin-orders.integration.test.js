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
import { createSettingsRepository } from '../../settings/repositories/settings.js'
import { createSettingsService } from '../../settings/services/settings.js'
import { initialOrderState } from '../domain/order-state.js'
import { createOrderSubmissionRepository } from '../repositories/order-submissions.js'
import { createAdminOrderRepository } from './admin-order-repository.js'
import { createAdminOrderService } from './admin-orders.js'

const customerPhone = '+201112345678'
const senderPhone = '+201212345678'
const storePhone = '+201012345678'
const actor = { actorType: 'admin', actorId: '1' }
const basePath = '/api/v1/admin/orders'
const dayMs = 24 * 60 * 60 * 1000
const snapshot = { subtotalMinor: 20000, discountMinor: 2500, totalMinor: 17500,
  items: [{ position: 1, productId: null, variantId: null, productName: 'Archived shirt',
    color: 'Black', size: 'M', quantity: 2, baseUnitPriceMinor: 10000, finalUnitPriceMinor: 8750, discountPercent: 12.5 }] }

describe('orders admin APIs with discovered routes and disposable MySQL', {
  skip: !localDatabaseTestsEnabled() && 'Requires disposable MySQL',
}, () => {
  let fixture, database, server, submissions, settings, origin, adminCookie, customerCookie, customerId, uploadRoot
  const logs = []
  let sequence = 0

  before(async () => {
    fixture = await startDisposableMysql()
    database = createDatabase(fixture.config)
    await runMigrations({ config: fixture.config, migrations: await loadMigrations() })
    const now = new Date()
    await database.query(`INSERT INTO admins (admin_id, phone, password_hash, created_at, updated_at)
      VALUES (1, ?, 'synthetic admin hash', ?, ?)`, [storePhone, now, now])
    const customer = await database.query(`INSERT INTO customers (first_name, last_name, phone, password_hash, created_at, updated_at)
      VALUES ('Test', 'Customer', ?, 'synthetic customer hash', ?, ?)`, [customerPhone, now, now])
    customerId = String(customer.insertId)
    const sessions = createSessionService({ repository: createSessionRepository(database) })
    adminCookie = `press-admin=${(await sessions.create(actor)).token}`
    customerCookie = `press-customer=${(await sessions.create({ actorType: 'customer', actorId: customerId })).token}`
    submissions = createOrderSubmissionRepository(database)
    settings = createSettingsService({ repository: createSettingsRepository(database) })
    uploadRoot = await mkdtemp(join(tmpdir(), 'press-ord006-uploads-'))
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

  async function seed(paymentMethod = 'cash', ageDays = 0) {
    const now = new Date(Date.now() - 1000 - ageDays * dayMs)
    const cashExpiresAt = paymentMethod === 'cash' ? new Date(now.getTime() + 7 * dayMs) : null
    const state = initialOrderState({ paymentMethod, cashExpiresAt }, now)
    const orderNumber = `PS-ADMIN-${++sequence}`
    const orderId = await database.transaction((tx) => submissions.insert(tx, {
      customerId, orderNumber, walletSenderNumber: paymentMethod === 'wallet_eg' ? senderPhone : null,
      state, snapshot, keyHash: Buffer.alloc(32, sequence), requestHash: Buffer.alloc(32, sequence),
    }))
    return { orderId, orderNumber }
  }

  async function request(path = '', { body, cookie = adminCookie, headers = {} } = {}) {
    const response = await fetch(origin + basePath + path, {
      method: body === undefined ? 'GET' : 'POST',
      headers: { ...(cookie ? { cookie } : {}), ...(body === undefined ? {} : {
        origin, 'content-type': 'application/json',
      }), ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    return { status: response.status, cache: response.headers.get('cache-control'), body: await response.json() }
  }

  function action(orderId, name, expectedVersion, options) {
    return request(`/${orderId}/${name}`, { body: { expectedVersion }, ...options })
  }

  async function assertError(response, status, code) {
    const result = await response
    assert.equal(result.status, status)
    assert.equal(result.body.error.code, code)
    assert.ok(result.body.error.requestId)
  }

  it('protects reads and writes with the admin session, Origin, and strict input validation', async () => {
    const { orderId } = await seed()
    await assertError(request('', { cookie: null }), 401, 'AUTH_REQUIRED')
    await assertError(request(`/${orderId}`, { cookie: customerCookie }), 403, 'FORBIDDEN')
    await assertError(action(orderId, 'deliver', 1, { cookie: customerCookie }), 403, 'FORBIDDEN')
    await assertError(action(orderId, 'deliver', 1, { headers: { origin: 'https://other.invalid' } }), 403, 'FORBIDDEN')
    await assertError(action(orderId, 'deliver', 1, { headers: { 'content-type': 'text/plain' } }), 415, 'UNSUPPORTED_MEDIA_TYPE')
    await assertError(action(orderId, 'deliver', '1'), 422, 'VALIDATION_FAILED')
    await assertError(action(orderId, 'deliver', 1, { body: { expectedVersion: 1, adminId: '1' } }), 422, 'VALIDATION_FAILED')
    await assertError(action('18446744073709551615', 'deliver', 1), 404, 'ORDER_NOT_FOUND')
    await assertError(request(`/${orderId}%0A`), 422, 'VALIDATION_FAILED')
    await assertError(request('/18446744073709551616'), 422, 'VALIDATION_FAILED')
    const result = await request(`/${orderId}`)
    assert.equal(result.status, 200)
    assert.equal(result.cache, 'no-store')
    assert.equal(result.body.data.order.version, 1)
  })

  it('paginates summaries and returns snapshot details and a safe WhatsApp link from AUTH', async () => {
    const cash = await seed('cash', 9)
    const cancelledAt = new Date(Date.now() - dayMs)
    await database.query(`UPDATE orders SET fulfillment_status = 'cancelled', version = 2,
      cancelled_at = ?, updated_at = ? WHERE order_id = ?`, [cancelledAt, cancelledAt, cash.orderId])
    const wallet = await seed('wallet_eg')
    const first = await request('?page=1&pageSize=2')
    assert.equal(first.status, 200)
    assert.deepEqual(first.body.data.items.map(({ orderId }) => orderId), [wallet.orderId, cash.orderId])
    assert.equal(first.body.meta.page, 1)
    assert.equal(first.body.meta.pageSize, 2)
    assert.ok(first.body.meta.total >= 2)
    const [summary, cancelled] = first.body.data.items
    assert.equal(summary.orderNumber, wallet.orderNumber)
    assert.equal(summary.itemCount, 2)
    assert.equal(summary.totalMinor, 17500)
    assert.deepEqual(summary.customer, { customerId, firstName: 'Test', lastName: 'Customer', phone: customerPhone })
    assert.equal(summary.whatsappUrl, 'https://wa.me/201112345678')
    assert.equal(cancelled.fulfillmentStatus, 'cancelled')
    assert.ok(!Object.hasOwn(summary, 'walletSenderNumber'))
    assert.deepEqual((await request('?page=100000&pageSize=50')).body.data.items, [])
    await assertError(request('?pageSize=51'), 422, 'VALIDATION_FAILED')
    await assertError(request('?page=1&page=2'), 422, 'VALIDATION_FAILED')
    await assertError(request('?status=placed'), 422, 'VALIDATION_FAILED')

    const unprovisioned = (await request(`/${wallet.orderId}`)).body.data.order
    assert.equal(unprovisioned.pickup.contact, null)
    await settings.save({ storeName: 'Fixture store', storePhone, whatsappPhone: storePhone,
      walletEgNumber: senderPhone, instaPayNumber: '+201512345678', socialLinks: {}, version: 0 })
    const detail = (await request(`/${wallet.orderId}`)).body.data.order
    assert.equal(detail.subtotalMinor, 20000)
    assert.equal(detail.discountMinor, 2500)
    assert.equal(detail.totalMinor, 17500)
    assert.equal(detail.walletSenderNumber, senderPhone)
    assert.equal(detail.items[0].productName, 'Archived shirt')
    assert.equal(detail.items[0].finalUnitPriceMinor, 8750)
    assert.equal(detail.whatsappUrl, summary.whatsappUrl)
    assert.deepEqual(detail.pickup.preparationMinutes, { min: 10, max: 60, typical: 30 })
    assert.deepEqual(detail.pickup.contact, { storeName: 'Fixture store', storePhone, whatsappPhone: storePhone })
    assert.equal((await request(`/${cash.orderId}`)).body.data.order.pickup.cashCollectionNotice, null)
    await assertError(action(cash.orderId, 'deliver', 2), 409, 'INVALID_ORDER_TRANSITION')
    for (const secret of [adminCookie, customerCookie, customerPhone, senderPhone, 'synthetic customer hash']) {
      assert.ok(!JSON.stringify(logs).includes(secret))
    }
  })

  it('requires verification for Wallet and InstaPay and audits each action only once', async () => {
    for (const method of ['wallet_eg', 'instapay']) {
      const { orderId } = await seed(method)
      await assertError(action(orderId, 'prepare', 1), 409, 'INVALID_ORDER_TRANSITION')
      await assertError(action(orderId, 'deliver', 1), 409, 'INVALID_ORDER_TRANSITION')
      const verified = await action(orderId, 'verify-payment', 1)
      assert.equal(verified.status, 200)
      assert.deepEqual(verified.body.data, { orderId, paymentStatus: 'paid', fulfillmentStatus: 'placed',
        version: 2, updatedAt: verified.body.data.updatedAt })
      assert.deepEqual((await action(orderId, 'verify-payment', 1)).body, verified.body)
      await assertError(action(orderId, 'prepare', 1), 409, 'ORDER_CONFLICT')
      assert.equal((await action(orderId, 'prepare', 2)).body.data.fulfillmentStatus, 'prepared')
      const delivered = await action(orderId, 'deliver', 3)
      assert.equal(delivered.body.data.fulfillmentStatus, 'delivered')
      assert.equal(delivered.body.data.version, 4)
      const detail = (await request(`/${orderId}`)).body.data.order
      for (const field of ['verifiedByAdminId', 'preparedByAdminId', 'deliveredByAdminId']) assert.equal(detail[field], '1')
      assert.ok(detail.paidAt <= detail.preparedAt && detail.preparedAt <= detail.deliveredAt)
      assert.equal(detail.cashExpiresAt, null)
      assert.deepEqual((await action(orderId, 'prepare', 2)).body, delivered.body)
      assert.deepEqual((await request(`/${orderId}`)).body.data.order, detail)
    }
  })

  it('records cash payment at pickup and supports direct delivery without fabricating preparation', async () => {
    const cash = await seed()
    await assertError(action(cash.orderId, 'verify-payment', 1), 409, 'INVALID_ORDER_TRANSITION')
    const prepared = (await action(cash.orderId, 'prepare', 1)).body.data
    assert.equal(prepared.paymentStatus, 'unpaid')
    const delivered = (await action(cash.orderId, 'deliver', 2)).body.data
    assert.equal(delivered.paymentStatus, 'paid')
    const detail = (await request(`/${cash.orderId}`)).body.data.order
    assert.equal(detail.paidAt, detail.deliveredAt)
    assert.equal(detail.cashExpiresAt, null)
    assert.equal(detail.verifiedByAdminId, null)

    const direct = await seed()
    assert.equal((await action(direct.orderId, 'deliver', 1)).body.data.fulfillmentStatus, 'delivered')
    await assertError(action(direct.orderId, 'prepare', 2), 409, 'INVALID_ORDER_TRANSITION')
    assert.equal((await request(`/${direct.orderId}`)).body.data.order.preparedAt, null)
  })

  it('serializes competing actions and makes simultaneous repeats idempotent', async () => {
    const cash = await seed()
    const competed = await Promise.all([action(cash.orderId, 'prepare', 1), action(cash.orderId, 'deliver', 1)])
    assert.deepEqual(competed.map(({ status }) => status).sort(), [200, 409])
    assert.equal(competed.find(({ status }) => status === 409).body.error.code, 'ORDER_CONFLICT')
    assert.equal((await request(`/${cash.orderId}`)).body.data.order.version, 2)

    const wallet = await seed('wallet_eg')
    const repeated = await Promise.all([action(wallet.orderId, 'verify-payment', 1), action(wallet.orderId, 'verify-payment', 1)])
    assert.equal(repeated[0].status, 200)
    assert.deepEqual(repeated[0], repeated[1])
    assert.equal(repeated[0].body.data.version, 2)
  })

  it('rolls back the state and audit write when the transaction fails', async () => {
    const { orderId } = await seed()
    const repository = createAdminOrderRepository(database)
    const failing = createAdminOrderService({ database, repository: {
      ...repository,
      async updateState(...args) {
        assert.equal(await repository.updateState(...args), true)
        throw new Error('fixture failure after update')
      },
    } })
    const before = (await request(`/${orderId}`)).body.data.order
    await assert.rejects(failing.act(orderId, 'deliver', { expectedVersion: 1 }, actor), /fixture failure after update/)
    assert.deepEqual((await request(`/${orderId}`)).body.data.order, before)
    assert.equal((await action(orderId, 'deliver', 1)).status, 200)
  })
})
