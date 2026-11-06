import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import { startServer } from '../../../app/start-server.js'
import { loadMigrations } from '../../../platform/db/migration-files.js'
import { runMigrations } from '../../../platform/db/migrate.js'
import { createDatabase } from '../../../platform/db/database.js'
import { DatabaseError } from '../../../platform/db/database-error.js'
import { startDisposableMysql } from '../../../platform/db/testing/disposable-mysql.js'
import { localDatabaseTestsEnabled } from '../../../config/database-config.js'
import { createSessionRepository } from '../../../platform/auth/session-repository.js'
import { createSessionService } from '../../../platform/auth/sessions.js'
import { createLogger } from '../../../platform/observability/logger.js'
import { startTestApp } from '../../../../../tests/helpers/http-server.js'
import { createSettingsRouters } from './settings-routes.js'
import { createSettingsRepository } from '../repositories/settings.js'
import { createSettingsService } from '../services/settings.js'

const details = (extra = {}) => ({ storeName: 'Press Store', storePhone: '01012345678', whatsappPhone: '01112345678',
  walletEgNumber: '01212345678', instaPayNumber: '01512345678', socialLinks: { instagram: 'https://instagram.com/press' }, version: 0, ...extra })

describe('settings feature migration discovery', () => {
  it('uses the existing FND seam without implicit provisioning', async () => {
    const migrations = (await loadMigrations()).filter(({ name }) => name.startsWith('set_'))
    assert.deepEqual(migrations.map(({ name }) => name), ['set_001_create_store_settings.sql'])
    assert.match(migrations[0].checksum, /^[a-f0-9]{64}$/)
  })
})

describe('settings isolated MySQL admin/public/privacy APIs', {
  skip: !localDatabaseTestsEnabled() && 'Requires new disposable MySQL fixture opt-in',
}, () => {
  let fixture, database, server, origin, adminCookie, customerCookie, token, guardReads = 0
  const logs = []
  const logger = createLogger({ environment: 'test', sink: (line) => logs.push(JSON.parse(line)) })
  async function start() {
    const counted = { check: () => database.check(), close: () => database.close(), query: (...args) => database.query(...args),
      transaction: (work) => database.transaction((tx) => work({ query: (sql, values) => {
        if (sql.includes('SELECT actor_type, customer_id, admin_id')) guardReads++
        return tx.query(sql, values)
      } })) }
    server = await startServer({ config: { nodeEnv: 'test', port: 0 }, databaseConfig: fixture.config, databaseFactory: () => counted, logger })
    origin = `http://127.0.0.1:${server.address().port}`
  }
  async function stop() {
    if (server) { server.closeAllConnections(); if (server.listening) await new Promise((resolve) => server.close(resolve)); server = null }
  }
  before(async () => {
    fixture = await startDisposableMysql()
    database = createDatabase(fixture.config)
    const migrations = await loadMigrations()
    await runMigrations({ config: fixture.config, migrations: migrations.filter(({ name }) => !name.startsWith('set_')) })
    const now = new Date()
    await database.query('INSERT INTO admins (admin_id, phone, password_hash, created_at, updated_at) VALUES (1, ?, ?, ?, ?)', ['+201012345678', 'synthetic hash', now, now])
    await database.query('INSERT INTO customers (first_name, last_name, phone, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      ['Test', 'Customer', '+201112345678', 'synthetic hash', now, now])
    const [customer] = await database.query('SELECT customer_id FROM customers')
    const sessions = createSessionService({ repository: createSessionRepository(database) })
    token = (await sessions.create({ actorType: 'admin', actorId: '1' })).token
    adminCookie = `press-admin=${token}`
    customerCookie = `press-customer=${(await sessions.create({ actorType: 'customer', actorId: customer.customer_id })).token}`
    await runMigrations({ config: fixture.config, migrations })
    await runMigrations({ config: fixture.config, migrations })
    await start()
  })
  after(async () => { try { await stop() } finally { try { await database?.close() } finally { await fixture?.stop() } } })
  async function request(path = '/admin/settings', method = 'GET', data, options = {}) {
    const response = await fetch(`${origin}/api/v1${path}`, { method, headers: {
      ...(options.cookie === null ? {} : { Cookie: options.cookie ?? adminCookie }),
      ...(method === 'PUT' ? { Origin: options.origin ?? origin, 'Content-Type': 'application/json' } : {}), ...options.headers,
    }, body: data === undefined ? undefined : JSON.stringify(data) })
    const body = await response.json()
    assert.equal(response.headers.get('set-cookie'), null)
    return { status: response.status, body, response }
  }
  it('composes nested settings mount once beside CAT, preserves CAT guards and reports unprovisioned state', async () => {
    guardReads = 0
    assert.equal((await request()).body.error.code, 'SETTINGS_UNAVAILABLE')
    assert.equal(guardReads, 1)
    assert.equal((await request('/settings/public-contact', 'GET', undefined, { cookie: null })).status, 503)
    assert.equal((await request('/admin/products', 'GET', undefined, { cookie: null })).status, 401)
    assert.equal((await request('/admin/settings', 'GET', undefined, { cookie: null })).status, 401)
    assert.equal((await request('/admin/settings', 'GET', undefined, { cookie: customerCookie })).status, 403)
    assert.equal((await request('/admin/settings', 'PUT', details({ version: 1 }))).status, 503)
  })
  it('lets one concurrent initial PUT win without replacing independent payment values', async () => {
    const results = await Promise.all([request('/admin/settings', 'PUT', details()), request('/admin/settings', 'PUT', details({ storeName: 'Other winner' }))])
    assert.deepEqual(results.map(({ status }) => status).sort(), [200, 409])
    const current = (await request()).body.data.settings
    assert.equal(current.version, 1)
    assert.equal(current.walletEgNumber, '+201212345678')
    assert.equal(current.instaPayNumber, '+201512345678')
    assert.equal((await database.query('SELECT COUNT(*) AS count FROM store_settings'))[0].count, '1')
    assert.equal((await request('/admin/settings', 'PUT', details())).body.error.code, 'EDIT_CONFLICT')
    await assert.rejects(database.query(`INSERT INTO store_settings SELECT 2, store_name, store_phone, whatsapp_phone,
      wallet_eg_number, insta_pay_number, social_links, version, created_at, updated_at FROM store_settings`), { code: 'DB_CONSTRAINT_FAILED' })
    await assert.rejects(database.query('UPDATE store_settings SET version = 0'), { code: 'DB_CONSTRAINT_FAILED' })
  })
  it('returns minimum public/internal projections and never puts unselected numbers in response/logs', async () => {
    const response = await request('/settings/public-contact', 'GET', undefined, { cookie: null })
    assert.equal(response.status, 200)
    assert.equal(response.response.headers.get('cache-control'), 'no-store')
    assert.deepEqual(Object.keys(response.body.data).sort(), ['socialLinks', 'storeName', 'storePhone', 'whatsappPhone'])
    assert.doesNotMatch(JSON.stringify(response.body), /walletEgNumber|instaPayNumber|version|201212345678|201512345678/)
    const service = createSettingsService({ repository: createSettingsRepository(database) })
    assert.deepEqual(await service.payment('wallet_eg'), { paymentMethod: 'wallet_eg', number: '+201212345678' })
    assert.deepEqual(await service.payment('instapay'), { paymentMethod: 'instapay', number: '+201512345678' })
    assert.deepEqual(await service.payment('cash'), { paymentMethod: 'cash', number: null })
    assert.deepEqual(Object.keys(await service.contact()).sort(), ['storeName', 'storePhone', 'whatsappPhone'])
    assert.doesNotMatch(JSON.stringify(logs), new RegExp(`${token}|201212345678|201512345678|01212345678|01512345678|password_hash|synthetic hash`))
  })
  it('rejects unsafe payloads, unknown queries, wrong media and Origin without changing the prior version', async () => {
    const before = (await request()).body.data.settings
    for (const extra of [{ socialLinks: { facebook: 'https://evil.test' } }, { walletEgNumber: '+12025551234' }, { actorId: '1' }, { version: '1' }]) {
      const failed = await request('/admin/settings', 'PUT', details({ version: before.version, ...extra }))
      assert.equal(failed.status, 422)
      assert.equal(failed.body.error.code, 'VALIDATION_FAILED')
    }
    assert.equal((await request('/admin/settings', 'PUT', details({ version: before.version }), { origin: 'https://evil.test' })).status, 403)
    assert.equal((await request('/admin/settings', 'PUT', details({ version: before.version }), { headers: { 'Sec-Fetch-Site': 'cross-site' } })).status, 403)
    assert.equal((await request('/admin/settings', 'PUT', details(), { headers: { 'Content-Type': 'text/plain' } })).status, 415)
    assert.equal((await request('/admin/settings?version=1')).status, 422)
    assert.equal((await request('/settings/public-contact?includePayments=true')).status, 422)
    assert.deepEqual((await request()).body.data.settings, before)
  })
  it('uses atomic version checks for concurrent saves, with optional social removal and equal payment numbers', async () => {
    const before = (await request()).body.data.settings
    const results = await Promise.all([
      request('/admin/settings', 'PUT', details({ version: before.version, storeName: 'One', socialLinks: {}, instaPayNumber: '01212345678' })),
      request('/admin/settings', 'PUT', details({ version: before.version, storeName: 'Two', socialLinks: {}, instaPayNumber: '01212345678' })),
    ])
    assert.deepEqual(results.map(({ status }) => status).sort(), [200, 409])
    const current = (await request()).body.data.settings
    assert.equal(current.version, before.version + 1)
    assert.equal(current.walletEgNumber, current.instaPayNumber)
    assert.deepEqual((await request('/settings/public-contact', 'GET', undefined, { cookie: null })).body.data.socialLinks, {})
  })
  it('uses configured production Origin independently of Host and forwarded headers', async (t) => {
    const current = (await request()).body.data.settings
    const routers = createSettingsRouters({ database, config: { nodeEnv: 'production' }, appOrigin: 'https://store.test' })
    const app = await startTestApp(t, { manifests: [{ id: 'settings-admin', path: '/admin/settings', router: routers.admin }] })
    async function put(originHeader) {
      return fetch(`${app.origin}/api/v1/admin/settings`, { method: 'PUT', headers: {
        Cookie: `__Host-press-admin=${token}`, Origin: originHeader, 'X-Forwarded-Host': 'evil.test',
        'Content-Type': 'application/json' }, body: JSON.stringify(details({ version: current.version, storeName: 'Configured origin' })) })
    }
    assert.equal((await put(app.origin)).status, 403)
    assert.equal((await put('https://store.test')).status, 200)
  })
  it('rolls back an actual partial update on a later failure and returns a safe error', async (t) => {
    const current = (await request()).body.data.settings
    const broken = { query: (...args) => database.query(...args), transaction: (work) => database.transaction((tx) => work({
      query: async (sql, values) => {
        const result = await tx.query(sql, values)
        if (sql.startsWith('UPDATE store_settings')) throw new DatabaseError('DB_QUERY_FAILED')
        return result
      },
    })) }
    const routers = createSettingsRouters({ database: broken, config: { nodeEnv: 'test' } })
    const app = await startTestApp(t, { manifests: [{ id: 'settings-admin', path: '/admin/settings', router: routers.admin }] })
    const failure = await fetch(`${app.origin}/api/v1/admin/settings`, { method: 'PUT', headers: {
      Cookie: adminCookie, Origin: app.origin, 'Content-Type': 'application/json' }, body: JSON.stringify(details({ version: current.version, storeName: 'Must roll back' })) })
    assert.equal(failure.status, 500)
    const error = await failure.json()
    assert.equal(error.error.code, 'INTERNAL_ERROR')
    assert.doesNotMatch(JSON.stringify(error), /DB_QUERY_FAILED|UPDATE|201212345678|01212345678/)
    assert.deepEqual((await request()).body.data.settings, current)
  })
  it('persists settings and admin session across a real server/pool restart, then denies expired access', async () => {
    const current = (await request()).body.data.settings
    await stop()
    await database.close()
    database = createDatabase(fixture.config)
    await start()
    assert.deepEqual((await request()).body.data.settings, current)
    await database.query("UPDATE sessions SET created_at = ?, last_seen_at = ?, expires_at = ? WHERE actor_type = 'admin'",
      [new Date('2019-01-01T00:00:00Z'), new Date('2019-01-01T00:00:00Z'), new Date('2020-01-01T00:00:00Z')])
    assert.equal((await request()).status, 401)
    assert.equal((await request('/settings/public-contact', 'GET', undefined, { cookie: null })).status, 200)
  })
})
