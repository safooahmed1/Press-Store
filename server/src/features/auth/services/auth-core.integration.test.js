import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { describe, it } from 'node:test'
import { localDatabaseTestsEnabled } from '../../../config/database-config.js'
import { createDatabase } from '../../../platform/db/database.js'
import { loadMigrations } from '../../../platform/db/migration-files.js'
import { runMigrations } from '../../../platform/db/migrate.js'
import { startDisposableMysql } from '../../../platform/db/testing/disposable-mysql.js'
import { createSessionRepository } from '../../../platform/auth/session-repository.js'
import { createSessionService } from '../../../platform/auth/sessions.js'

async function authMigrations() {
  const migrations = await loadMigrations({ featuresRoot: fileURLToPath(new URL('../../', import.meta.url)) })
  return migrations.filter(({ name }) => name.startsWith('auth_'))
}

describe('auth migration source discovery', () => {
  it('uses the existing feature migration seam and immutable ordered names', async () => {
    const migrations = await authMigrations()
    assert.deepEqual(migrations.map(({ name }) => name), [
      'auth_001_create_identities.sql', 'auth_002_create_sessions.sql',
    ])
    for (const migration of migrations) {
      assert.match(migration.checksum, /^[a-f0-9]{64}$/)
      assert.equal(migration.sql, await readFile(new URL(`../migrations/${migration.name}`, import.meta.url), 'utf8'))
    }
  })
})

describe('auth real MySQL identity constraints and session persistence', {
  skip: !localDatabaseTestsEnabled() && 'Requires explicit live-MySQL authorization and FND_DISPOSABLE_MYSQL_TESTS=1',
}, () => {
  it('migrates empty/upgraded databases and enforces identity, FK, rotation and expiry invariants', async (t) => {
    const fixture = await startDisposableMysql()
    let database
    t.after(async () => { try { await database?.close() } finally { await fixture.stop() } })
    database = createDatabase(fixture.config)
    const migrations = await authMigrations()
    await runMigrations({ config: fixture.config, migrations: migrations.slice(0, 1) })
    const time = new Date('2026-11-02T12:00:00Z')
    await database.query(`INSERT INTO customers
      (first_name, last_name, phone, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
    ['Amina', 'Ali', '+201012345678', 'synthetic-hash', time, time])
    await runMigrations({ config: fixture.config, migrations })
    await runMigrations({ config: fixture.config, migrations })
    const [customer] = await database.query('SELECT customer_id FROM customers WHERE phone = ?', ['+201012345678'])
    assert.ok(customer.customer_id)
    await assert.rejects(database.query(`INSERT INTO customers
      (first_name, last_name, phone, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
    ['Other', 'Name', '+201012345678', 'synthetic-hash', time, time]), { code: 'DB_CONSTRAINT_FAILED' })
    await database.query('INSERT INTO admins (admin_id, phone, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      ['1', '+201112345678', 'synthetic-hash', time, time])
    await assert.rejects(database.query('INSERT INTO admins (admin_id, phone, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      ['2', '+201212345678', 'synthetic-hash', time, time]), { code: 'DB_CONSTRAINT_FAILED' })
    let now = time
    const repository = createSessionRepository(database)
    const service = createSessionService({ repository, clock: () => new Date(now) })
    const first = await service.create({ actorType: 'customer', actorId: customer.customer_id })
    const admin = await service.create({ actorType: 'admin', actorId: '1' })
    assert.equal(await service.find(first.token, 'admin'), null)
    assert.equal(await service.find(admin.token, 'customer'), null)
    const next = await service.create({ actorType: 'customer', actorId: customer.customer_id, previousToken: first.token })
    assert.equal(await service.find(first.token, 'customer'), null)
    // An insertion FK failure must roll back deletion of the existing session.
    await assert.rejects(service.create({ actorType: 'customer', actorId: '999999', previousToken: next.token }),
      { code: 'DB_CONSTRAINT_FAILED' })
    assert.ok(await service.find(next.token, 'customer'))
    // Recreate both pool and service: persistence must not depend on process-local state.
    await database.close()
    database = createDatabase(fixture.config)
    const restarted = createSessionService({ repository: createSessionRepository(database), clock: () => new Date(now) })
    assert.deepEqual(await restarted.find(next.token, 'customer'), { actorType: 'customer', actorId: customer.customer_id })
    now = new Date(next.expiresAt)
    assert.equal(await restarted.find(next.token, 'customer'), null)
    await restarted.revoke(next.token, 'customer')
    await restarted.revoke(next.token, 'customer')
    await assert.rejects(database.query(`INSERT INTO sessions
      (session_id_hash, actor_type, customer_id, admin_id, expires_at, created_at, last_seen_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)`, [Buffer.alloc(32, 1), 'admin', customer.customer_id, null,
      new Date(time.getTime() + 1000), time, time]), { code: 'DB_CONSTRAINT_FAILED' })
    t.diagnostic(`MySQL ${fixture.version}; identity/session constraints and persistence across pool recreation verified`)
  }, { timeout: 60000 })
})
