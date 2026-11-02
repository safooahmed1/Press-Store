import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { describe, it } from 'node:test'
import { randomBytes } from 'node:crypto'
import { loadFeatureManifests } from '../../../app/feature-manifests.js'
import { startServer } from '../../../app/start-server.js'
import { createDatabase } from '../../../platform/db/database.js'
import { DatabaseError } from '../../../platform/db/database-error.js'
import { loadMigrations } from '../../../platform/db/migration-files.js'
import { runMigrations } from '../../../platform/db/migrate.js'
import { startDisposableMysql } from '../../../platform/db/testing/disposable-mysql.js'
import { localDatabaseTestsEnabled } from '../../../config/database-config.js'
import { createLogger } from '../../../platform/observability/logger.js'
import { startTestApp } from '../../../../../tests/helpers/http-server.js'
import { bootstrapAdmin } from '../services/bootstrap-admin.js'

const execute = promisify(execFile)
const input = { phone: '01012345678', password: 'synthetic admin password' }
const other = { phone: '01112345678', password: 'different protected password' }
const cookieOf = (response) => response.headers.get('set-cookie')?.split(';')[0]
async function post(origin, scope, action, body, cookie, headers = {}) {
  return fetch(`${origin}/api/v1/auth/${scope}/${action}`, { method: 'POST',
    headers: { Origin: origin, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(cookie ? { Cookie: cookie } : {}), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body) })
}
const current = (origin, cookie) => fetch(`${origin}/api/v1/auth/admin/session`, {
  headers: cookie ? { Cookie: cookie } : {},
})

describe('auth admin request boundary', () => {
  it('rejects origin/media/field attacks, forbids public registration and fails closed on storage errors', async (t) => {
    let calls = 0
    const unavailable = async () => { calls++; throw new DatabaseError('DB_UNAVAILABLE') }
    const manifests = await loadFeatureManifests(undefined, {
      database: { query: unavailable, transaction: unavailable },
      config: { nodeEnv: 'production' }, appOrigin: 'https://store.test',
    })
    const { origin, logs } = await startTestApp(t, { manifests })
    for (const action of ['login', 'logout']) {
      for (const headers of [{ Origin: '' }, { Origin: 'https://evil.test' },
        { Origin: 'https://store.test', 'Sec-Fetch-Site': 'cross-site' }]) {
        const res = await post(origin, 'admin', action, input, undefined, headers)
        assert.equal(res.status, 403)
        assert.equal((await res.json()).error.code, 'FORBIDDEN')
        assert.equal(res.headers.get('set-cookie'), null)
        assert.equal(res.headers.get('cache-control'), 'no-store')
      }
    }
    const media = await fetch(`${origin}/api/v1/auth/admin/login`, { method: 'POST',
      headers: { Origin: 'https://store.test', 'Content-Type': 'text/plain' }, body: 'bad' })
    assert.equal(media.status, 415)
    for (const body of [{ ...input, adminId: '1' }, { ...input, role: 'admin' },
      { ...input, password: 'short' }, { ...input, phone: '+33123456789' }, null]) {
      const res = await post(origin, 'admin', 'login', body, undefined, { Origin: 'https://store.test' })
      // FND's strict JSON parser rejects primitive JSON before feature validation.
      assert.equal(res.status, body === null ? 400 : 422)
      assert.equal(res.headers.get('set-cookie'), null)
    }
    assert.equal(calls, 0)
    const anonymous = await current(origin)
    assert.equal(anonymous.status, 401)
    assert.equal((await anonymous.json()).error.code, 'AUTH_REQUIRED')
    const logout = await post(origin, 'admin', 'logout', undefined, undefined, { Origin: 'https://store.test' })
    assert.equal(logout.status, 200)
    assert.match(logout.headers.get('set-cookie'), /__Host-press-admin=;.*Max-Age=0; Path=\/; HttpOnly; SameSite=Lax; Secure/)
    const token = randomBytes(32).toString('base64url')
    const responses = [await post(origin, 'admin', 'login', input, undefined, { Origin: 'https://store.test' }),
      await current(origin, `__Host-press-admin=${token}`),
      await post(origin, 'admin', 'logout', undefined, `__Host-press-admin=${token}`, { Origin: 'https://store.test' })]
    for (const res of responses) {
      assert.equal(res.status, 500)
      assert.equal(res.headers.get('set-cookie'), null)
      assert.equal(res.headers.get('cache-control'), 'no-store')
      assert.equal((await res.json()).error.code, 'INTERNAL_ERROR')
    }
    const registration = await post(origin, 'admin', 'register', input)
    assert.equal(registration.status, 404)
    assert.doesNotMatch(JSON.stringify(logs), new RegExp(`${token}|${input.password}|${input.phone}|DB_UNAVAILABLE`))
  })
})

describe('auth admin bootstrap and APIs with actual MySQL', {
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
    await runMigrations({ config: mysql.config,
      migrations: (await loadMigrations()).filter(({ name }) => name.startsWith('auth_')) })
    async function start(databaseFactory) {
      server = await startServer({ config: { nodeEnv: 'test', port: 0 }, databaseConfig: mysql.config,
        logger, ...(databaseFactory ? { databaseFactory } : {}) })
      return `http://127.0.0.1:${server.address().port}`
    }
    return { mysql, database, start, stop, logs }
  }

  it('provisions once, preserves credentials/timestamps/sessions, refuses mismatches and exercises the real CLI safely', async (t) => {
    const { database, mysql } = await fixture(t)
    const env = { NODE_ENV: 'test', MYSQL_HOST: mysql.config.host, MYSQL_PORT: String(mysql.config.port),
      MYSQL_DATABASE: mysql.config.database, MYSQL_USER: mysql.config.user, MYSQL_PASSWORD: mysql.config.password,
      BOOTSTRAP_ADMIN_PHONE: input.phone, BOOTSTRAP_ADMIN_PASSWORD: input.password }
    const created = await execute(process.execPath, ['scripts/bootstrap-admin.js'], { env, timeout: 15000 })
    assert.equal(created.stdout, 'Admin created.\n')
    assert.equal(created.stderr, '')
    const before = await database.query('SELECT * FROM admins')
    assert.notEqual(before[0].password_hash, input.password)
    const now = new Date()
    await database.query(`INSERT INTO sessions (session_id_hash, actor_type, admin_id, created_at, last_seen_at, expires_at)
      VALUES (?, 'admin', 1, ?, ?, ?)`, [Buffer.alloc(32, 9), now, now, new Date(now.getTime() + 60000)])
    const sessionsBefore = await database.query('SELECT * FROM sessions')
    assert.deepEqual(await bootstrapAdmin({ database, input: { ...input, phone: '+201012345678' } }), { status: 'unchanged' })
    for (const changed of [other, { ...input, password: other.password }]) {
      await assert.rejects(bootstrapAdmin({ database, input: changed }), /conflicts/)
    }
    const cli = await execute(process.execPath, ['scripts/bootstrap-admin.js'], { env, timeout: 15000 })
    assert.equal(cli.stdout, 'Admin unchanged.\n')
    assert.equal(cli.stderr, '')
    await assert.rejects(execute(process.execPath, ['scripts/bootstrap-admin.js'], {
      env: { ...env, BOOTSTRAP_ADMIN_PASSWORD: other.password }, timeout: 15000,
    }), (error) => {
      assert.equal(error.code, 1)
      assert.equal(error.stdout, '')
      assert.doesNotMatch(error.stderr, /different protected|synthetic|01012345678|scrypt|SELECT|INSERT/)
      return true
    })
    assert.deepEqual(await database.query('SELECT * FROM admins'), before)
    assert.deepEqual(await database.query('SELECT * FROM sessions'), sessionsBefore)
  })

  it('reconciles concurrent identical bootstrap and refuses a competing identity without overwrite', async (t) => {
    const { database } = await fixture(t)
    // Barrier guarantees both contenders see absence before either INSERT.
    async function race(inputs) {
      let reads = 0
      let release
      const barrier = new Promise((resolve) => { release = resolve })
      const racing = { query: async (sql, values) => {
        const result = await database.query(sql, values)
        if (sql.startsWith('SELECT admin_id, phone') && ++reads <= 2) {
          if (reads === 2) release()
          await barrier
        }
        return result
      } }
      return Promise.allSettled(inputs.map((value) => bootstrapAdmin({ database: racing, input: value })))
    }
    const identical = await race([input, input])
    assert.deepEqual(identical.map((result) => result.status), ['fulfilled', 'fulfilled'])
    assert.deepEqual(identical.map((result) => result.value.status).sort(), ['created', 'unchanged'])
    await database.query('DELETE FROM admins')
    const competing = await race([input, other])
    assert.equal(competing.filter((result) => result.status === 'fulfilled').length, 1)
    assert.equal(competing.filter((result) => result.status === 'rejected').length, 1)
    const [winner] = await database.query('SELECT phone, password_hash FROM admins')
    const winningInput = winner.phone === '+201012345678' ? input : other
    assert.deepEqual(await bootstrapAdmin({ database, input: winningInput }), { status: 'unchanged' })
    assert.equal((await database.query('SELECT * FROM admins')).length, 1)
    assert.equal((await database.query('SELECT phone, password_hash FROM admins'))[0].password_hash, winner.password_hash)
  })

  it('isolates admin/customer credentials and cookies, rotates, survives restart, expires and logs out idempotently', async (t) => {
    const context = await fixture(t)
    await bootstrapAdmin({ database: context.database, input })
    let origin = await context.start()
    const absent = await post(origin, 'admin', 'login', other)
    const wrong = await post(origin, 'admin', 'login', { ...input, password: other.password })
    assert.equal(absent.status, 401)
    assert.equal(wrong.status, 401)
    assert.equal((await absent.json()).error.message, (await wrong.json()).error.message)
    assert.equal(absent.headers.get('set-cookie'), null)
    const customer = await post(origin, 'customer', 'register', {
      ...other, firstName: 'Amina', lastName: 'Ali',
    })
    const customerCookie = cookieOf(customer)
    assert.equal(customer.status, 201)
    assert.equal((await post(origin, 'admin', 'login', other)).status, 401)
    assert.equal((await post(origin, 'customer', 'login', input)).status, 401)
    const forbidden = await current(origin, customerCookie)
    assert.equal(forbidden.status, 403)
    assert.equal((await forbidden.json()).error.code, 'FORBIDDEN')
    assert.equal((await current(origin, customerCookie.replace('press-customer=', 'press-admin='))).status, 401)
    const login = await post(origin, 'admin', 'login', input)
    assert.equal(login.status, 200)
    assert.deepEqual(await login.json(), { data: { admin: { adminId: '1' } } })
    assert.match(login.headers.get('set-cookie'), /^press-admin=.*; Expires=.*; Path=\/; HttpOnly; SameSite=Lax$/)
    const first = cookieOf(login)
    const rotated = cookieOf(await post(origin, 'admin', 'login', input, first))
    assert.notEqual(first, rotated)
    assert.equal((await current(origin, first)).status, 401)
    assert.equal((await current(origin, `${customerCookie}; ${rotated}`)).status, 200)
    assert.equal((await current(origin, rotated.replace('press-admin=', 'press-customer='))).status, 401)
    assert.equal((await current(origin, `${rotated}; ${rotated}`)).status, 401)
    const [times] = await context.database.query("SELECT created_at, expires_at FROM sessions WHERE actor_type = 'admin'")
    assert.equal(times.expires_at - times.created_at, 8 * 60 * 60 * 1000)
    await context.stop()
    origin = await context.start()
    assert.equal((await current(origin, rotated)).status, 200)
    const logout = await post(origin, 'admin', 'logout', undefined, `${customerCookie}; ${rotated}`)
    assert.equal(logout.status, 200)
    assert.deepEqual(await logout.json(), { data: {} })
    assert.equal((await current(origin, rotated)).status, 401)
    assert.equal((await post(origin, 'admin', 'logout', undefined, rotated)).status, 200)
    assert.equal((await fetch(`${origin}/api/v1/account`, { headers: { Cookie: customerCookie } })).status, 200)
    const next = cookieOf(await post(origin, 'admin', 'login', input))
    const independent = cookieOf(await post(origin, 'admin', 'login', input))
    await post(origin, 'customer', 'logout', undefined, `${customerCookie}; ${next}`)
    assert.equal((await current(origin, next)).status, 200)
    await post(origin, 'admin', 'logout', undefined, next)
    assert.equal((await current(origin, independent)).status, 200)
    await context.database.query("UPDATE sessions SET created_at = ?, expires_at = ? WHERE actor_type = 'admin'",
      [new Date(0), new Date(1000)])
    assert.equal((await current(origin, independent)).status, 401)
    assert.doesNotMatch(JSON.stringify(context.logs), new RegExp(`${input.password}|${other.password}|${input.phone}|${rotated.split('=')[1]}`))
  })

  it('rolls back failed admin rotation and preserves the old cookie without issuing a replacement', async (t) => {
    const context = await fixture(t)
    await bootstrapAdmin({ database: context.database, input })
    let origin = await context.start()
    const cookie = cookieOf(await post(origin, 'admin', 'login', input))
    await context.stop()
    origin = await context.start((config) => {
      const database = createDatabase(config)
      return { ...database, transaction: (work) => database.transaction((tx) => work({ query: async (sql, values) => {
        if (/INSERT INTO sessions/.test(sql)) throw new DatabaseError('DB_QUERY_FAILED')
        return tx.query(sql, values)
      } })) }
    })
    const failed = await post(origin, 'admin', 'login', input, cookie)
    assert.equal(failed.status, 500)
    assert.equal((await failed.json()).error.code, 'INTERNAL_ERROR')
    assert.equal(failed.headers.get('set-cookie'), null)
    assert.equal((await current(origin, cookie)).status, 200)
    assert.equal((await context.database.query("SELECT * FROM sessions WHERE actor_type = 'admin'")).length, 1)
  })
})
