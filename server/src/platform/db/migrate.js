import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { createConnection } from 'mysql2/promise'
import { connectionOptions, databaseOperation } from './database.js'
import { orderedMigrations } from './migration-files.js'

const bootstrapName = 'fnd_000_create_migration_metadata.sql'

export class MigrationError extends Error {
  constructor(code) {
    super('Migration execution stopped; inspect migration state before retrying')
    this.name = 'MigrationError'
    this.code = code
  }
}

/** Explicit operator entry point. Never called by application startup. */
export async function runMigrations({ config, migrations, connect = createConnection }) {
  const ordered = orderedMigrations(migrations)
  if (ordered.some(({ name }) => name === bootstrapName)) throw new MigrationError('MIGRATION_NAME_RESERVED')
  const lockName = `press:migrate:${createHash('sha256').update(config.database).digest('hex').slice(0, 48)}`
  let connection
  let locked = false
  const applied = []
  const query = async (sql, values = [], timeout = config.queryTimeout) => {
    const [rows] = await databaseOperation(connection,
      () => connection.query(sql, values), timeout)
    return rows
  }
  try {
    // Multi-statements are restricted to this dedicated connection and trusted source files.
    connection = await connect({ ...connectionOptions(config), multipleStatements: true })
    await query("SET SESSION time_zone = '+00:00'")
    await query('SET SESSION autocommit = 1')
    const [lock] = await query('SELECT GET_LOCK(?, ?) AS acquired',
      [lockName, config.migrationLockTimeout], Math.max(config.queryTimeout, config.migrationLockTimeout * 1000 + 1000))
    if (Number(lock.acquired) !== 1) throw new MigrationError('MIGRATION_LOCK_UNAVAILABLE')
    locked = true
    const bootstrap = await readFile(new URL('./migrations/fnd_000_create_migration_metadata.sql', import.meta.url), 'utf8')
    let engines = await query('SELECT ENGINE AS engine FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN (?, ?)',
      ['migration_records', 'migration_execution_states'])
    if (engines.length === 0) {
      await query(bootstrap)
      engines = await query('SELECT ENGINE AS engine FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN (?, ?)',
        ['migration_records', 'migration_execution_states'])
    }
    if (engines.length !== 2) throw new MigrationError('MIGRATION_METADATA_INCOMPLETE')
    if (engines.length !== 2 || engines.some(({ engine }) => engine !== 'InnoDB')) {
      throw new MigrationError('MIGRATION_METADATA_ENGINE_INVALID')
    }
    const [{ checksum: bootstrapChecksum }] = orderedMigrations([{ name: bootstrapName, sql: bootstrap }])
    const [bootstrapRecord] = await query('SELECT checksum FROM migration_records WHERE migration_name = ?', [bootstrapName])
    if (bootstrapRecord && bootstrapRecord.checksum !== bootstrapChecksum) {
      throw new MigrationError('MIGRATION_HISTORY_MISMATCH')
    }
    if (!bootstrapRecord) {
      await query('INSERT INTO migration_records (migration_name, checksum, applied_at) VALUES (?, ?, UTC_TIMESTAMP(6))',
        [bootstrapName, bootstrapChecksum])
    }
    const pending = await query('SELECT migration_name FROM migration_execution_states')
    if (pending.length) throw new MigrationError('MIGRATION_RECOVERY_REQUIRED')
    const history = await query('SELECT migration_name, checksum FROM migration_records WHERE migration_name <> ? ORDER BY migration_name', [bootstrapName])
    const byName = new Map(ordered.map((migration) => [migration.name, migration]))
    for (const record of history) {
      if (byName.get(record.migration_name)?.checksum !== record.checksum) {
        throw new MigrationError('MIGRATION_HISTORY_MISMATCH')
      }
    }
    const completed = new Set(history.map((record) => record.migration_name))
    const last = history.at(-1)?.migration_name
    for (const migration of ordered) {
      if (completed.has(migration.name)) continue
      if (last && migration.name < last) throw new MigrationError('MIGRATION_OUT_OF_ORDER')
      // This autocommitted marker survives DDL implicit commits and interrupted processes.
      await query('INSERT INTO migration_execution_states (migration_name, checksum, started_at) VALUES (?, ?, UTC_TIMESTAMP(6))',
        [migration.name, migration.checksum])
      await query(migration.sql)
      await query('START TRANSACTION')
      try {
        await query('INSERT INTO migration_records (migration_name, checksum, applied_at) VALUES (?, ?, UTC_TIMESTAMP(6))',
          [migration.name, migration.checksum])
        await query('DELETE FROM migration_execution_states WHERE migration_name = ?', [migration.name])
        await query('COMMIT')
      } catch (error) {
        try { await query('ROLLBACK') } catch { connection.destroy() }
        throw error
      }
      applied.push(migration.name)
    }
    return { applied, skipped: completed.size }
  } catch (error) {
    throw error instanceof MigrationError ? error : new MigrationError('MIGRATION_FAILED')
  } finally {
    if (connection) {
      if (locked) {
        try { await query('SELECT RELEASE_LOCK(?)', [lockName]) } catch { connection.destroy() }
      }
      // Never return a session holding a named lock to an application pool.
      connection.destroy()
    }
  }
}
