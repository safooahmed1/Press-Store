import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, before, describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { createConnection } from 'mysql2/promise'
import { startServer } from '../../../app/start-server.js'
import { localDatabaseTestsEnabled } from '../../../config/database-config.js'
import { loadFeatureJobs } from '../../../jobs/job-registry.js'
import { runFeatureJob } from '../../../jobs/job-runner.js'
import { createSessionRepository } from '../../../platform/auth/session-repository.js'
import { createSessionService } from '../../../platform/auth/sessions.js'
import { createDatabase } from '../../../platform/db/database.js'
import { loadMigrations } from '../../../platform/db/migration-files.js'
import { runMigrations } from '../../../platform/db/migrate.js'
import { startDisposableMysql } from '../../../platform/db/testing/disposable-mysql.js'
import { createLogger } from '../../../platform/observability/logger.js'
import { createAdminOrderRepository } from '../admin/admin-order-repository.js'
import { createAdminOrderService } from '../admin/admin-orders.js'
import { initialOrderState } from '../domain/order-state.js'
import { createOrderSubmissionRepository } from '../repositories/order-submissions.js'

const name = 'orders.expire-unpaid-cash'
const dayMs = 24 * 60 * 60 * 1000
const cutoff = new Date(Date.now() - dayMs)
const adminActor = { actorType: 'admin', actorId: '1' }
const customerPhone = '+201112345678'
const snapshot = { subtotalMinor: 10000, discountMinor: 0, totalMinor: 10000,
  items: [{ position: 1, productId: null, variantId: null, productName: 'Historical shirt', color: 'Black',
    size: 'M', quantity: 1, baseUnitPriceMinor: 10000, finalUnitPriceMinor: 10000, discountPercent: 0 }] }

describe('orders expiry job and FND runner on disposable MySQL', {
  skip: !localDatabaseTestsEnabled() && 'Requires disposable MySQL',
}, () => {
  let fixture, database, submissions, admin, job, customerId, customerCookie, adminCookie, uploadRoot, server, origin
  let sequence = 0
  const reports = []

  before(async () => {
    fixture = await startDisposableMysql()
    database = createDatabase({ ...fixture.config, connectionLimit: 8 })
    await runMigrations({ config: fixture.config, migrations: await loadMigrations() })
    await database.query(`INSERT INTO admins (admin_id, phone, password_hash, created_at, updated_at)
      VALUES (1, '+201012345678', 'synthetic admin hash', ?, ?)`, [cutoff, cutoff])
    const customer = await database.query(`INSERT INTO customers
      (first_name, last_name, phone, password_hash, created_at, updated_at)
      VALUES ('Expiry', 'Fixture', ?, 'synthetic customer hash', ?, ?)`, [customerPhone, cutoff, cutoff])
    customerId = String(customer.insertId)
    const sessions = createSessionService({ repository: createSessionRepository(database) })
    customerCookie = `press-customer=${(await sessions.create({ actorType: 'customer', actorId: customerId })).token}`
    adminCookie = `press-admin=${(await sessions.create(adminActor)).token}`
    submissions = createOrderSubmissionRepository(database)
    admin = createAdminOrderService({ database, repository: createAdminOrderRepository(database), clock: () => cutoff })
    job = (await loadFeatureJobs()).get(name)
    assert.equal(job.name, name)
    uploadRoot = await mkdtemp(join(tmpdir(), 'press-ord011-uploads-'))
    server = await startServer({ config: { nodeEnv: 'test', port: 0 }, databaseConfig: fixture.config,
      storageConfig: { root: uploadRoot }, logger: createLogger({ environment: 'test', sink() {} }) })
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

  function run(overrides = {}) {
    return runFeatureJob({ config: fixture.config, job, clock: () => cutoff,
      report: (record) => reports.push(record), ...overrides })
  }

  async function seed(paymentMethod = 'cash', deltaMs = -1) {
    const cashExpiresAt = paymentMethod === 'cash' ? new Date(cutoff.getTime() + deltaMs) : null
    const createdAt = cashExpiresAt ? new Date(cashExpiresAt.getTime() - 7 * dayMs) : new Date(cutoff.getTime() - 10 * dayMs)
    const state = initialOrderState({ paymentMethod, cashExpiresAt }, createdAt)
    const orderNumber = `PS-EXPIRY-${++sequence}`
    const key = Buffer.alloc(32)
    key.writeUInt32BE(sequence)
    return database.transaction((tx) => submissions.insert(tx, { customerId, orderNumber, state, snapshot,
      walletSenderNumber: paymentMethod === 'wallet_eg' ? '+201212345678' : null, keyHash: key, requestHash: key }))
  }

  async function state(orderId) {
    const [row] = await database.query(`SELECT fulfillment_status AS fulfillment, payment_status AS payment,
      version, cancelled_at AS cancelledAt, updated_at AS updatedAt, prepared_at AS preparedAt
      FROM orders WHERE order_id = ?`, [orderId])
    return row
  }

  it('cancels only due unpaid cash at the cutoff, retains audit/history and reruns without writes', async () => {
    const boundary = await seed('cash', 0)
    const prepared = await seed()
    const tooSoon = await seed('cash', 1)
    const pendingWallet = await seed('wallet_eg')
    const paidInstaPay = await seed('instapay')
    const deliveredCash = await seed()
    await admin.act(prepared, 'prepare', { expectedVersion: 1 }, adminActor)
    await admin.act(paidInstaPay, 'verify-payment', { expectedVersion: 1 }, adminActor)
    await admin.act(deliveredCash, 'deliver', { expectedVersion: 1 }, adminActor)
    const untouched = await Promise.all([tooSoon, pendingWallet, paidInstaPay, deliveredCash].map(state))
    const originalItems = await submissions.readItems(boundary)

    const first = await run({ async connect(options) {
      const connection = await createConnection(options)
      await connection.execute('SET SESSION autocommit = 0')
      return connection
    } })
    assert.equal(first.status, 'completed')
    assert.equal(first.cutoff, cutoff.toISOString())
    assert.deepEqual(first.counts, { scanned: 2, cancelled: 2, skipped: 0 })
    assert.deepEqual(await state(boundary), { fulfillment: 'cancelled', payment: 'unpaid', version: 2,
      cancelledAt: cutoff, updatedAt: cutoff, preparedAt: null })
    const cancelledPrepared = await state(prepared)
    assert.equal(cancelledPrepared.fulfillment, 'cancelled')
    assert.equal(cancelledPrepared.version, 3)
    assert.deepEqual(cancelledPrepared.preparedAt, cutoff)
    assert.deepEqual(await Promise.all([tooSoon, pendingWallet, paidInstaPay, deliveredCash].map(state)), untouched)
    assert.deepEqual(await submissions.readItems(boundary), originalItems)

    const list = await fetch(`${origin}/api/v1/orders`, { headers: { cookie: customerCookie } })
    assert.equal(list.status, 200)
    const visible = (await list.json()).data.items.map(({ orderId }) => orderId)
    assert.deepEqual(new Set(visible), new Set([tooSoon, pendingWallet, paidInstaPay, deliveredCash]))
    const hidden = await fetch(`${origin}/api/v1/orders/${boundary}`, { headers: { cookie: customerCookie } })
    assert.equal(hidden.status, 404)
    assert.equal((await hidden.json()).error.code, 'ORDER_NOT_FOUND')
    const audit = await fetch(`${origin}/api/v1/admin/orders/${boundary}`, { headers: { cookie: adminCookie } })
    assert.equal(audit.status, 200)
    assert.equal((await audit.json()).data.order.cancelledAt, cutoff.toISOString())
    assert.deepEqual((await run()).counts, { scanned: 0, cancelled: 0, skipped: 0 })
    assert.deepEqual(await state(prepared), cancelledPrepared)
  })

  it('uses one named lock and skips orders changed after selection, including a concurrent delivery', async () => {
    const toDeliver = await seed()
    const toPrepare = await seed()
    const selected = Promise.withResolvers()
    const resume = Promise.withResolvers()
    const first = run({ job: { name, run: ({ query, ...context }) => job.run({ ...context, async query(sql, values) {
      if (sql.includes('UPDATE orders')) {
        selected.resolve()
        await resume.promise
      }
      return query(sql, values)
    } }) } })
    try {
      await Promise.race([selected.promise, first.then((result) => assert.fail(`Job finished before selection: ${result.status}`))])
      assert.equal((await run()).status, 'busy')
      await admin.act(toDeliver, 'deliver', { expectedVersion: 1 }, adminActor)
      await admin.act(toPrepare, 'prepare', { expectedVersion: 1 }, adminActor)
    } finally {
      resume.resolve()
    }
    assert.deepEqual((await first).counts, { scanned: 2, cancelled: 0, skipped: 2 })
    assert.equal((await state(toDeliver)).payment, 'paid')
    assert.equal((await state(toPrepare)).fulfillment, 'prepared')
    assert.deepEqual((await run()).counts, { scanned: 1, cancelled: 1, skipped: 0 })
    assert.equal((await state(toDeliver)).fulfillment, 'delivered')
    assert.equal((await state(toPrepare)).fulfillment, 'cancelled')
  })

  it('advances across tied deadlines in batches and recovers a subsequent run after a failure', async () => {
    for (let index = 0; index < 103; index++) await seed()
    let writes = 0
    const failure = await run({ job: { name, run: ({ query, ...context }) => job.run({ ...context, async query(sql, values) {
      if (sql.includes('UPDATE orders') && ++writes === 2) throw new Error('private test database failure')
      return query(sql, values)
    } }) } })
    assert.equal(failure.status, 'failed')
    assert.equal(failure.errorCode, 'JOB_FAILED')
    assert.equal(writes, 2)
    assert.deepEqual((await run()).counts, { scanned: 3, cancelled: 3, skipped: 0 })
    assert.deepEqual((await run()).counts, { scanned: 0, cancelled: 0, skipped: 0 })
    for (const secret of ['private test database failure', customerPhone, customerCookie, adminCookie, fixture.config.password]) {
      assert.ok(!JSON.stringify(reports).includes(secret))
    }
  })

  it('runs the registered job from the operational CLI with explicit database configuration', async () => {
    const orderId = await seed()
    const config = fixture.config
    const env = { NODE_ENV: 'test', MYSQL_HOST: config.host, MYSQL_PORT: String(config.port),
      MYSQL_DATABASE: config.database, MYSQL_USER: config.user, MYSQL_PASSWORD: config.password }
    const entry = fileURLToPath(new URL('../../../jobs/run-job.js', import.meta.url))
    const { stdout, stderr } = await promisify(execFile)(process.execPath, [entry, name], { env })
    const result = JSON.parse(stdout)
    assert.equal(stderr, '')
    assert.equal(result.event, 'job.finished')
    assert.equal(result.jobName, name)
    assert.equal(result.status, 'completed')
    assert.ok(result.counts.cancelled >= 1)
    assert.equal((await state(orderId)).fulfillment, 'cancelled')
    await assert.rejects(promisify(execFile)(process.execPath, [entry, 'private-input'], { env }), (error) => {
      assert.equal(error.code, 1)
      assert.deepEqual(JSON.parse(error.stderr), { event: 'job.invocation.failed', errorCode: 'JOB_CONFIGURATION_INVALID' })
      return true
    })
  })
})
