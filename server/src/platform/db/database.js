import { AsyncLocalStorage } from 'node:async_hooks'
import { createPool } from 'mysql2/promise'
import { DatabaseError, safeDatabaseError } from './database-error.js'

export function connectionOptions(config) {
  return {
    host: config.host, port: config.port, database: config.database,
    user: config.user, password: config.password, connectTimeout: config.connectTimeout,
    timezone: 'Z', charset: 'utf8mb4', supportBigNumbers: true, bigNumberStrings: true,
    multipleStatements: false, namedPlaceholders: false, maxPreparedStatements: 64,
  }
}

/** A deadline discards the connection: timed-out work must never re-enter the pool. */
export async function databaseOperation(connection, operation, timeout) {
  let timer
  try {
    return await Promise.race([
      Promise.resolve().then(operation),
      new Promise((resolve, reject) => {
        timer = setTimeout(() => {
          connection.destroy()
          reject(new DatabaseError('DB_TIMEOUT'))
        }, timeout)
      }),
    ])
  } finally { clearTimeout(timer) }
}

/** DB-FND-001. Values use server-side prepared statements; identifiers are trusted SQL. */
export function createDatabase(config, { poolFactory = createPool } = {}) {
  const pool = poolFactory({ ...connectionOptions(config),
    connectionLimit: config.connectionLimit, maxIdle: config.connectionLimit,
    idleTimeout: 60000, waitForConnections: false, queueLimit: 0 })
  let closed = false
  let closing
  const transactionContext = new AsyncLocalStorage()

  async function acquire() {
    if (closed) throw new DatabaseError('DB_UNAVAILABLE')
    try { return await pool.getConnection() } catch (error) {
      throw safeDatabaseError(error, 'DB_UNAVAILABLE')
    }
  }

  async function execute(connection, sql, values = []) {
    if (typeof sql !== 'string' || !sql.trim() || !Array.isArray(values)) {
      throw new TypeError('Expected SQL text and a parameter array')
    }
    try {
      const [rows] = await databaseOperation(connection,
        () => connection.execute(sql, values), config.queryTimeout)
      return rows
    } catch (error) { throw safeDatabaseError(error) }
  }

  async function session(connection) {
    await execute(connection, "SET SESSION time_zone = '+00:00'")
  }

  async function control(connection, sql) {
    try {
      await databaseOperation(connection, () => connection.query(sql), config.queryTimeout)
    } catch (error) { throw safeDatabaseError(error, 'DB_TRANSACTION_FAILED') }
  }

  async function query(sql, values = []) {
    const connection = await acquire()
    try {
      await session(connection)
      return await execute(connection, sql, values)
    } finally { connection.release() }
  }

  async function transaction(work) {
    if (typeof work !== 'function') throw new TypeError('Expected a transaction callback')
    if (transactionContext.getStore()?.active) throw new DatabaseError('DB_TRANSACTION_FAILED')
    const connection = await acquire()
    let active = true
    let failed = false
    let queryQueue = Promise.resolve()
    const context = { active: true }
    const queryInTransaction = (sql, values) => {
      if (!active || failed) return Promise.reject(new DatabaseError('DB_TRANSACTION_FAILED'))
      const operation = queryQueue.then(async () => {
        if (!active || failed) throw new DatabaseError('DB_TRANSACTION_FAILED')
        try { return await execute(connection, sql, values) } catch (error) {
          failed = true
          throw error
        }
      })
      // Serialize one connection explicitly and let later queued work observe terminal failure.
      queryQueue = operation.catch(() => {})
      return operation
    }
    try {
      await session(connection)
      await control(connection, 'START TRANSACTION')
      const result = await transactionContext.run(context,
        () => work(Object.freeze({ query: queryInTransaction })))
      await queryQueue
      active = false
      context.active = false
      // Even a swallowed query error must never allow partial application writes.
      if (failed) throw new DatabaseError('DB_TRANSACTION_FAILED')
      await control(connection, 'COMMIT')
      return result
    } catch (error) {
      active = false
      context.active = false
      await queryQueue
      try { await control(connection, 'ROLLBACK') } catch {
        connection.destroy()
      }
      throw error
    } finally { active = false; context.active = false; connection.release() }
  }

  return Object.freeze({ query, transaction,
    async check() {
      try { await query('SELECT 1 AS ready'); return true } catch { return false }
    },
    close() {
      if (!closing) {
        closed = true
        closing = pool.end().catch((error) => { throw safeDatabaseError(error, 'DB_UNAVAILABLE') })
      }
      return closing
    },
  })
}
