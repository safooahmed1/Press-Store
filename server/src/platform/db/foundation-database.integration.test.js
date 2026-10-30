import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { setTimeout as delay } from 'node:timers/promises'
import { after, before, beforeEach, describe, it } from 'node:test'
import { createConnection } from 'mysql2/promise'
import { localDatabaseTestsEnabled } from '../../config/database-config.js'
import { createDatabase, connectionOptions } from './database.js'
import { runMigrations } from './migrate.js'
import { startDisposableMysql } from './testing/disposable-mysql.js'
import { startServer } from '../../app/start-server.js'

const initial = { name: 'test_001_create_fixtures.sql', sql: `
-- Owner: FND test fixture. Disposable-only. Recovery: discard the isolated datadir.
CREATE TABLE fnd_fixtures (fixture_id BIGINT NOT NULL PRIMARY KEY, value VARCHAR(100) NOT NULL UNIQUE) ENGINE=InnoDB;
INSERT INTO fnd_fixtures VALUES (1, 'initial');` }
const upgrade = { name: 'test_002_upgrade_fixtures.sql', sql: `
-- Owner: FND test fixture. Disposable-only. Index: existing primary and unique keys.
ALTER TABLE fnd_fixtures ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
INSERT INTO fnd_fixtures (fixture_id, value) VALUES (2, 'upgraded');` }

describe('foundation disposable MySQL integration', {
  skip: !localDatabaseTestsEnabled() && 'Set FND_DISPOSABLE_MYSQL_TESTS=1 to create a fresh local MySQL instance',
}, () => {
  let fixture
  let raw
  let database
  let config
  before(async () => {
    fixture = await startDisposableMysql()
    config = fixture.config
    raw = await createConnection(connectionOptions(config))
    database = createDatabase(config)
  }, { timeout: 60000 })
  after(async () => {
    if (database) await database.close()
    if (raw) raw.destroy()
    if (fixture) await fixture.stop()
  })
  beforeEach(async () => {
    // This connection can address only the database created by our private process.
    const [tables] = await raw.query('SHOW TABLES')
    for (const row of tables) {
      const name = Object.values(row)[0]
      assert.match(name, /^[a-z_]+$/)
      await raw.query(`DROP TABLE \`${name}\``)
    }
  })

  const migrate = (migrations) => runMigrations({ config, migrations })

  it('verifies MySQL/InnoDB, empty schema, ordered upgrade, immutable history and repeat execution', async (t) => {
    t.diagnostic(`Isolated MySQL ${fixture.version}; no existing database used`)
    assert.match(fixture.version, /^8\./)
    assert.deepEqual(await migrate([initial]), { applied: [initial.name], skipped: 0 })
    assert.deepEqual(await migrate([upgrade, initial]), { applied: [upgrade.name], skipped: 1 })
    assert.deepEqual(await migrate([initial, upgrade]), { applied: [], skipped: 2 })
    const rows = await database.query('SELECT value, is_active FROM fnd_fixtures ORDER BY fixture_id')
    assert.deepEqual(rows.map((row) => row.value), ['initial', 'upgraded'])
    const records = await database.query('SELECT migration_name, checksum, applied_at FROM migration_records')
    assert.equal(records.length, 3)
    for (const record of records) {
      assert.match(record.checksum, /^[a-f0-9]{64}$/)
      assert.ok(record.applied_at instanceof Date)
    }
    assert.equal((await database.query('SELECT * FROM migration_execution_states')).length, 0)
    await assert.rejects(migrate([{ ...initial, sql: initial.sql + '\n-- edited' }, upgrade]),
      { code: 'MIGRATION_HISTORY_MISMATCH' })
    await assert.rejects(migrate([upgrade]), { code: 'MIGRATION_HISTORY_MISMATCH' })
  })

  it('produces the same schema and data on empty and upgraded databases', async () => {
    await migrate([initial, upgrade])
    const snapshot = async () => {
      const [[schema]] = await raw.query('SHOW CREATE TABLE fnd_fixtures')
      return { schema: schema['Create Table'], rows: await database.query('SELECT * FROM fnd_fixtures ORDER BY fixture_id') }
    }
    const empty = await snapshot()
    for (const name of ['fnd_fixtures', 'migration_records', 'migration_execution_states']) {
      await raw.query(`DROP TABLE \`${name}\``)
    }
    await migrate([initial])
    await migrate([initial, upgrade])
    assert.deepEqual(await snapshot(), empty)
  })

  it('commits successful transactions and rolls back data/constraint failures with safe errors', async () => {
    await migrate([initial])
    await database.transaction(async (tx) => {
      await tx.query('INSERT INTO fnd_fixtures VALUES (?, ?)', [3, 'committed'])
    })
    await assert.rejects(database.transaction(async (tx) => {
      await tx.query('INSERT INTO fnd_fixtures VALUES (?, ?)', [4, 'must-rollback'])
      await tx.query('INSERT INTO fnd_fixtures VALUES (?, ?)', [5, 'initial'])
    }), (error) => {
      assert.equal(error.code, 'DB_CONSTRAINT_FAILED')
      assert.doesNotMatch(JSON.stringify(error) + error.message, /INSERT|initial|fnd_test_only/)
      return true
    })
    assert.deepEqual((await database.query('SELECT fixture_id FROM fnd_fixtures ORDER BY fixture_id'))
      .map((row) => row.fixture_id), ['1', '3'])
    await assert.rejects(database.transaction(async (tx) => {
      await tx.query('INSERT INTO fnd_fixtures VALUES (?, ?)', [6, 'callback-rollback'])
      throw new Error('domain-rejection')
    }), /domain-rejection/)
    assert.equal((await database.query('SELECT * FROM fnd_fixtures WHERE fixture_id = ?', [6])).length, 0)
    await assert.rejects(database.transaction(async (tx) => {
      try { await tx.query('INSERT INTO fnd_fixtures VALUES (?, ?)', [9, 'initial']) } catch {
        // A caught driver error still makes this transaction permanently unusable.
      }
      await assert.rejects(tx.query('INSERT INTO fnd_fixtures VALUES (?, ?)', [10, 'must-not-run']),
        { code: 'DB_TRANSACTION_FAILED' })
    }), { code: 'DB_TRANSACTION_FAILED' })
    assert.equal((await database.query('SELECT * FROM fnd_fixtures WHERE fixture_id = ?', [10])).length, 0)
  })

  it('rejects nested transactions without independently committing inner writes', async () => {
    await migrate([initial])
    await assert.rejects(database.transaction(async (tx) => {
      await tx.query('INSERT INTO fnd_fixtures VALUES (?, ?)', [7, 'outer-nested'])
      await database.transaction(async (inner) => {
        await inner.query('INSERT INTO fnd_fixtures VALUES (?, ?)', [8, 'inner-nested'])
      })
    }), { code: 'DB_TRANSACTION_FAILED' })
    assert.deepEqual(await database.query('SELECT fixture_id FROM fnd_fixtures WHERE fixture_id IN (?, ?)', [7, 8]), [])
  })

  it('binds injection strings and preserves large IDs and UTC values', async () => {
    await migrate([initial])
    const value = "'; DROP TABLE fnd_fixtures; --"
    await database.query('INSERT INTO fnd_fixtures VALUES (?, ?)', ['9007199254740993', value])
    const [row] = await database.query('SELECT fixture_id, value FROM fnd_fixtures WHERE value = ?', [value])
    assert.equal(row.fixture_id, '9007199254740993')
    assert.equal(row.value, value)
    const [zone] = await database.query('SELECT @@session.time_zone AS zone')
    assert.equal(zone.zone, '+00:00')
    await assert.rejects(database.query('SELECT 1; SELECT 2'), { code: 'DB_QUERY_FAILED' })
  })

  it('enforces finite acquisition capacity and discards timed-out sessions', async () => {
    let release
    const held = new Promise((resolve) => { release = resolve })
    let entered
    const enteredPromise = new Promise((resolve) => { entered = resolve })
    const small = createDatabase({ ...config, connectionLimit: 1, queryTimeout: 50 })
    try {
      const transaction = small.transaction(async () => { entered(); await held })
      await enteredPromise
      await assert.rejects(small.query('SELECT 1'), { code: 'DB_UNAVAILABLE' })
      release()
      await transaction
      await assert.rejects(small.query('SELECT SLEEP(1)'), { code: 'DB_TIMEOUT' })
      assert.equal(await small.check(), true)
    } finally { release(); await small.close() }
  })

  it('persists a failed DDL marker and blocks retries until separately approved recovery', async () => {
    const broken = { name: 'test_003_partial_failure.sql', sql: `
CREATE TABLE partial_fixtures (fixture_id BIGINT PRIMARY KEY) ENGINE=InnoDB;
INSERT INTO nonexistent_fixtures VALUES (1);` }
    await assert.rejects(migrate([broken]), { code: 'MIGRATION_FAILED' })
    assert.equal((await database.query('SELECT * FROM partial_fixtures')).length, 0)
    assert.equal((await database.query('SELECT * FROM migration_execution_states')).length, 1)
    assert.equal((await database.query('SELECT * FROM migration_records WHERE migration_name = ?', [broken.name])).length, 0)
    await assert.rejects(migrate([broken]), { code: 'MIGRATION_RECOVERY_REQUIRED' })
    // Disposable recovery fixture only: inspect, restore pre-state, then clear its marker.
    await raw.query('DROP TABLE partial_fixtures')
    await raw.execute('DELETE FROM migration_execution_states WHERE migration_name = ?', [broken.name])
    assert.deepEqual(await migrate([initial]), { applied: [initial.name], skipped: 0 })
  })

  it('holds the same database lock for the whole run and refuses competing runners', async () => {
    let started
    const startedPromise = new Promise((resolve) => { started = resolve })
    let release
    const barrier = new Promise((resolve) => { release = resolve })
    const first = runMigrations({ config, migrations: [initial], connect: async (options) => {
      const connection = await createConnection(options)
      const query = connection.query.bind(connection)
      connection.query = async (sql, values) => {
        if (sql === initial.sql) { started(); await barrier }
        return query(sql, values)
      }
      return connection
    } })
    try {
      await Promise.race([startedPromise, first.then(() => { throw new Error('Runner completed before test barrier') })])
      await assert.rejects(migrate([initial]), { code: 'MIGRATION_LOCK_UNAVAILABLE' })
    } finally { release(); await first }
    assert.deepEqual(await migrate([initial]), { applied: [], skipped: 1 })
  })

  it('refuses out-of-order additions and nontransactional metadata', async () => {
    await migrate([initial])
    await assert.rejects(migrate([{ name: 'test_000_before_history.sql', sql: 'SELECT 1' }, initial]),
      { code: 'MIGRATION_OUT_OF_ORDER' })
    await raw.query('ALTER TABLE migration_execution_states ENGINE=MyISAM')
    await assert.rejects(migrate([initial]), { code: 'MIGRATION_METADATA_ENGINE_INVALID' })
  })

  it('keeps interrupted-process markers durable and never automatically retries', async () => {
    const migration = { name: 'test_004_process_interruption.sql', sql: 'SELECT SLEEP(30);' }
    const source = `import { runMigrations } from './server/src/platform/db/migrate.js';
      import { createConnection } from 'mysql2/promise';
      process.on('message', async ({config, migration}) => {
        try { await runMigrations({config, migrations: [migration], connect: async (options) => {
          const connection = await createConnection(options);
          const [[{id}]] = await connection.query('SELECT CONNECTION_ID() AS id');
          process.send({connectionId: id}); return connection;
        }}); process.exit(0) }
        catch { process.exit(2) }
      });`
    const child = spawn(process.execPath, ['--input-type=module', '-e', source],
      { stdio: ['ignore', 'ignore', 'ignore', 'ipc'] })
    const exited = once(child, 'close')
    const identified = once(child, 'message')
    child.send({ config: { ...config, queryTimeout: 40000 }, migration })
    let connectionId
    try {
      const [message] = await identified
      connectionId = Number(message.connectionId)
      assert.ok(Number.isSafeInteger(connectionId) && connectionId > 0)
      let found = false
      for (let count = 0; count < 100; count++) {
        try {
          found = (await database.query('SELECT * FROM migration_execution_states WHERE migration_name = ?',
            [migration.name])).length === 1
        } catch { /* bootstrap tables may not exist yet */ }
        if (found) break
        await delay(50)
      }
      assert.ok(found, 'child persisted its interruption marker')
    } finally { child.kill('SIGKILL'); await exited }
    // A killed client may leave its server statement running until the next I/O boundary.
    await raw.query(`KILL CONNECTION ${connectionId}`)
    for (let attempt = 0; attempt < 100; attempt++) {
      const [[{ remaining }]] = await raw.execute('SELECT COUNT(*) AS remaining FROM information_schema.PROCESSLIST WHERE ID = ?', [connectionId])
      if (Number(remaining) === 0) break
      await delay(20)
    }
    await assert.rejects(migrate([migration]), { code: 'MIGRATION_RECOVERY_REQUIRED' })
  })

  it('rolls back failed migration finalization atomically and retains the interruption marker', async () => {
    await assert.rejects(runMigrations({ config, migrations: [initial], connect: async (options) => {
      const connection = await createConnection(options)
      const query = connection.query.bind(connection)
      connection.query = async (sql, values) => {
        if (sql.startsWith('DELETE FROM migration_execution_states')) throw new Error('fixture finalization failure')
        return query(sql, values)
      }
      return connection
    } }), { code: 'MIGRATION_FAILED' })
    assert.equal((await database.query('SELECT * FROM migration_records WHERE migration_name = ?', [initial.name])).length, 0)
    assert.equal((await database.query('SELECT * FROM migration_execution_states')).length, 1)
    await assert.rejects(migrate([initial]), { code: 'MIGRATION_RECOVERY_REQUIRED' })
  })

  it('runs real database readiness through HTTP without running migrations on startup', async () => {
    const server = await startServer({ config: { nodeEnv: 'test', port: 0 }, databaseConfig: config,
      manifestsLoader: async () => [] })
    try {
      const response = await fetch(`http://127.0.0.1:${server.address().port}/api/v1/health`)
      assert.equal(response.status, 200)
      assert.deepEqual((await response.json()).data, { status: 'ready' })
      const [tables] = await raw.query('SHOW TABLES')
      assert.deepEqual(tables, [])
    } finally {
      await new Promise((resolve) => server.close(resolve))
      await server.closeDatabase()
    }
  })
})
