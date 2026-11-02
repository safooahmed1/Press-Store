import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { describe, it } from 'node:test'
import { loadFeatureManifests } from '../../../app/feature-manifests.js'
import { startServer } from '../../../app/start-server.js'
import { createDatabase } from '../../../platform/db/database.js'
import { DatabaseError } from '../../../platform/db/database-error.js'
import { loadMigrations } from '../../../platform/db/migration-files.js'
import { runMigrations } from '../../../platform/db/migrate.js'
import { startDisposableMysql } from '../../../platform/db/testing/disposable-mysql.js'
import { localDatabaseTestsEnabled } from '../../../config/database-config.js'
import { createLogger } from '../../../platform/observability/logger.js'
import { createSessionRepository } from '../../../platform/auth/session-repository.js'
import { createSessionService } from '../../../platform/auth/sessions.js'
import { startTestApp } from '../../../../../tests/helpers/http-server.js'

const password = 'correct horse battery staple'
const details = { firstName: 'Amina', lastName: 'Ali', phone: '01012345678', password }
const cookieOf = (response) => response.headers.get('set-cookie')?.split(';')[0]
async function post(origin, action, body, cookie, headers = {}) {
  return fetch(`${origin}/api/v1/auth/customer/${action}`, { method: 'POST',
    headers: { Origin: origin, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(cookie ? { Cookie: cookie } : {}), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body) })
}

describe('auth customer HTTP request boundary', () => {
  it('rejects unsafe origin/body states, keeps private responses uncached and fails closed on outage', async (t) => {
    let calls = 0
    const unavailable = async () => { calls++; throw new DatabaseError('DB_UNAVAILABLE') }
    const manifests = await loadFeatureManifests(undefined, {
      database: { query: unavailable, transaction: unavailable },
      config: { nodeEnv: 'production' }, appOrigin: 'https://store.test',
    })
    const { origin, logs } = await startTestApp(t, { manifests })
    for (const headers of [{ Origin: 'https://attacker.test' }, { Origin: '' },
      { Origin: 'https://store.test', 'Sec-Fetch-Site': 'cross-site' }]) {
      const response = await post(origin, 'register', details, undefined, headers)
      assert.equal(response.status, 403)
      assert.equal((await response.json()).error.code, 'FORBIDDEN')
    }
    const media = await fetch(`${origin}/api/v1/auth/customer/register`, {
      method: 'POST', headers: { Origin: 'https://store.test', 'Content-Type': 'text/plain' }, body: 'not-json',
    })
    assert.equal(media.status, 415)
    const invalid = await post(origin, 'register', { ...details, customerId: '2', address: 'forbidden' }, undefined,
      { Origin: 'https://store.test' })
    assert.equal(invalid.status, 422)
    assert.ok((await invalid.json()).error.fieldErrors.body)
    assert.equal(calls, 0)
    const anonymous = await fetch(`${origin}/api/v1/account`)
    assert.equal(anonymous.status, 401)
    assert.equal(anonymous.headers.get('cache-control'), 'no-store')
    assert.equal((await anonymous.json()).error.code, 'AUTH_REQUIRED')
    const logout = await post(origin, 'logout', undefined, undefined, { Origin: 'https://store.test' })
    assert.equal(logout.status, 200)
    assert.match(logout.headers.get('set-cookie'), /__Host-press-customer=;.*Max-Age=0; Path=\/; HttpOnly; SameSite=Lax; Secure/)
    const failure = await post(origin, 'login', { phone: details.phone, password }, undefined, { Origin: 'https://store.test' })
    assert.equal(failure.status, 500)
    assert.equal(failure.headers.get('set-cookie'), null)
    assert.equal((await failure.json()).error.code, 'INTERNAL_ERROR')
    const token = randomBytes(32).toString('base64url')
    const failedLogout = await post(origin, 'logout', undefined, `__Host-press-customer=${token}`, { Origin: 'https://store.test' })
    assert.equal(failedLogout.status, 500)
    assert.equal(failedLogout.headers.get('set-cookie'), null)
    for (const path of ['/auth/admin/register']) {
      assert.equal((await fetch(`${origin}/api/v1${path}`, { method: 'POST' })).status, 404)
    }
    assert.doesNotMatch(JSON.stringify(logs), new RegExp(`${token}|${password}|${details.phone}|DB_UNAVAILABLE`))
  })
})

describe('auth customer APIs with actual MySQL', {
  skip: !localDatabaseTestsEnabled() && 'Requires explicit disposable MySQL opt-in',
}, () => {
  async function fixture(t) {
    const mysql = await startDisposableMysql()
    const database = createDatabase(mysql.config)
    let server
    const logs = []
    const logger = createLogger({ environment: 'test', sink: (line) => logs.push(JSON.parse(line)) })
    async function stop() {
      if (!server) return
      server.closeAllConnections()
      if (server.listening) await new Promise((resolve) => server.close(resolve))
      await server.closeDatabase()
      server = undefined
    }
    t.after(async () => { try { await stop(); await database.close() } finally { await mysql.stop() } })
    const migrations = (await loadMigrations()).filter(({ name }) => name.startsWith('auth_'))
    await runMigrations({ config: mysql.config, migrations })
    async function start(databaseFactory) {
      server = await startServer({ config: { nodeEnv: 'test', port: 0 }, databaseConfig: mysql.config,
        logger, ...(databaseFactory ? { databaseFactory } : {}) })
      return `http://127.0.0.1:${server.address().port}`
    }
    return { database, logs, mysql, start, stop }
  }

  it('registers, isolates, rotates, survives an actual app restart and logs out without returning credentials', async (t) => {
    const context = await fixture(t)
    let origin = await context.start()
    assert.equal((await fetch(`${origin}/api/v1/health`)).status, 200)
    const registered = await post(origin, 'register', details)
    assert.equal(registered.status, 201)
    const firstCookie = cookieOf(registered)
    assert.match(firstCookie, /^press-customer=/)
    assert.match(registered.headers.get('set-cookie'), /Path=\/; HttpOnly; SameSite=Lax/)
    assert.equal(registered.headers.get('cache-control'), 'no-store')
    const summary = (await registered.json()).data.customer
    assert.deepEqual(Object.keys(summary).sort(), ['customerId', 'firstName', 'lastName', 'phone'])
    assert.equal(summary.phone, '+201012345678')
    const [stored] = await context.database.query('SELECT password_hash FROM customers WHERE customer_id = ?', [summary.customerId])
    assert.match(stored.password_hash, /^scrypt\$131072\$8\$1\$/)
    assert.notEqual(stored.password_hash, password)
    const duplicate = await post(origin, 'register', { ...details, phone: summary.phone })
    assert.equal(duplicate.status, 409)
    assert.equal((await duplicate.json()).error.code, 'PHONE_UNAVAILABLE')
    assert.equal(duplicate.headers.get('set-cookie'), null)
    const existingWrong = await post(origin, 'login', { phone: details.phone, password: 'wrong password long enough' })
    const absent = await post(origin, 'login', { phone: '01112345678', password: 'wrong password long enough' })
    assert.equal(existingWrong.status, 401)
    assert.equal(absent.status, 401)
    const firstError = (await existingWrong.json()).error
    const secondError = (await absent.json()).error
    assert.equal(firstError.code, 'INVALID_CREDENTIALS')
    assert.equal(firstError.message, secondError.message)
    const loggedIn = await post(origin, 'login', { phone: summary.phone, password }, firstCookie)
    assert.equal(loggedIn.status, 200)
    const currentCookie = cookieOf(loggedIn)
    assert.notEqual(currentCookie, firstCookie)
    assert.equal((await fetch(`${origin}/api/v1/account`, { headers: { Cookie: firstCookie } })).status, 401)
    const other = await post(origin, 'register', { ...details, firstName: 'Other', phone: '01112345678' })
    assert.equal(other.status, 201)
    const otherSummary = (await other.json()).data.customer
    const account = await fetch(`${origin}/api/v1/account?customerId=${otherSummary.customerId}`, { headers: { Cookie: currentCookie } })
    assert.deepEqual((await account.json()).data.customer, summary)
    const now = new Date()
    await context.database.query(`INSERT INTO admins
      (admin_id, phone, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
    ['1', '+201512345678', stored.password_hash, now, now])
    const adminSessions = createSessionService({ repository: createSessionRepository(context.database) })
    const admin = await adminSessions.create({ actorType: 'admin', actorId: '1' })
    for (const cookie of [`press-admin=${admin.token}`, `press-customer=${admin.token}`]) {
      assert.equal((await fetch(`${origin}/api/v1/account`, { headers: { Cookie: cookie } })).status, 401)
    }
    assert.equal((await post(origin, 'logout', undefined, `press-admin=${admin.token}`)).status, 200)
    assert.ok(await adminSessions.find(admin.token, 'admin'))
    await context.stop()
    origin = await context.start()
    assert.deepEqual((await (await fetch(`${origin}/api/v1/account`, { headers: { Cookie: currentCookie } })).json()).data.customer, summary)
    const logout = await post(origin, 'logout', undefined, currentCookie)
    assert.equal(logout.status, 200)
    assert.equal((await fetch(`${origin}/api/v1/account`, { headers: { Cookie: currentCookie } })).status, 401)
    assert.equal((await post(origin, 'logout', undefined, currentCookie)).status, 200)
    const otherCookie = cookieOf(other)
    assert.equal((await fetch(`${origin}/api/v1/account`, { headers: { Cookie: otherCookie } })).status, 200)
    await context.database.query('UPDATE sessions SET expires_at = DATE_ADD(created_at, INTERVAL 1 MICROSECOND) WHERE customer_id = ?', [otherSummary.customerId])
    assert.equal((await fetch(`${origin}/api/v1/account`, { headers: { Cookie: otherCookie } })).status, 401)
    assert.doesNotMatch(JSON.stringify(context.logs), new RegExp(`${password}|${stored.password_hash.replaceAll('$', '\\$')}|${details.phone}`))
    t.diagnostic(`MySQL ${context.mysql.version}; actual startServer/default manifest registration and restart passed`)
  }, { timeout: 60000 })

  it('resolves a duplicate registration race and rolls back customer/session changes on session-storage failure', async (t) => {
    const context = await fixture(t)
    let origin = await context.start()
    const race = await Promise.all([post(origin, 'register', details), post(origin, 'register', details)])
    assert.deepEqual(race.map(({ status }) => status).sort(), [201, 409])
    const winner = race.find(({ status }) => status === 201)
    const priorCookie = cookieOf(winner)
    const [count] = await context.database.query('SELECT COUNT(*) AS total FROM customers WHERE phone = ?', ['+201012345678'])
    assert.equal(Number(count.total), 1)
    await context.stop()
    const underlying = createDatabase(context.mysql.config)
    origin = await context.start(() => ({ ...underlying,
      transaction: (work) => underlying.transaction((tx) => work({ query: (sql, values) => {
        if (/INSERT INTO sessions/.test(sql)) throw new DatabaseError('DB_QUERY_FAILED')
        return tx.query(sql, values)
      } })),
    }))
    const failed = await post(origin, 'register', { ...details, phone: '01212345678' }, priorCookie)
    assert.equal(failed.status, 500)
    assert.equal(failed.headers.get('set-cookie'), null)
    const [after] = await context.database.query('SELECT COUNT(*) AS total FROM customers WHERE phone = ?', ['+201212345678'])
    assert.equal(Number(after.total), 0)
    assert.equal((await fetch(`${origin}/api/v1/account`, { headers: { Cookie: priorCookie } })).status, 200)
  }, { timeout: 60000 })
})
