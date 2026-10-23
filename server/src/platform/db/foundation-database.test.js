import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createDatabase } from './database.js'

function fixture(overrides = {}, configOverrides = {}) {
  const calls = []
  const connection = {
    execute: async (sql, values) => { calls.push([sql, values]); return [[{ ready: 1 }], []] },
    query: async (sql) => { calls.push([sql]); return [[], []] },
    release: () => calls.push(['release']), destroy: () => calls.push(['destroy']), ...overrides,
  }
  let options
  const database = createDatabase({ connectionLimit: 2, connectTimeout: 100,
    queryTimeout: 100, ...configOverrides }, { poolFactory: (value) => {
    options = value
    return { getConnection: async () => connection, end: async () => calls.push(['end']) }
  } })
  return { database, connection, calls, options }
}

describe('foundation database boundary', () => {
  it('uses prepared values, UTC, bounded pooling and releases successful and failed queries', async () => {
    const { database, calls, options } = fixture()
    const value = "'; DROP TABLE customers; --"
    await database.query('SELECT ? AS value', [value])
    assert.deepEqual(calls, [["SET SESSION time_zone = '+00:00'", []],
      ['SELECT ? AS value', [value]], ['release']])
    assert.equal(options.waitForConnections, false)
    assert.equal(options.multipleStatements, false)
    assert.equal(options.bigNumberStrings, true)
    assert.equal(options.connectionLimit, 2)
    await assert.rejects(database.query('SELECT 1', {}), TypeError)
    assert.deepEqual(calls.at(-1), ['release'])
  })

  it('sanitizes driver errors and constraints without a raw cause', async () => {
    for (const [code, expected] of [['ER_DUP_ENTRY', 'DB_CONSTRAINT_FAILED'],
      ['ER_PARSE_ERROR', 'DB_QUERY_FAILED'], ['ER_CHECK_CONSTRAINT_VIOLATED', 'DB_CONSTRAINT_FAILED']]) {
      const { database, calls } = fixture({ execute: async () => {
        throw Object.assign(new Error('private SQL credentials'), { code, sql: 'private SQL' })
      } })
      await assert.rejects(database.query('SELECT 1'), (error) => {
        assert.equal(error.code, expected)
        assert.equal(error.cause, undefined)
        assert.doesNotMatch(JSON.stringify(error) + error.message, /private/)
        return true
      })
      assert.deepEqual(calls.at(-1), ['release'])
      assert.equal(await database.check(), false)
    }
  })

  it('commits results and prevents transaction handles escaping their callback', async () => {
    const { database, calls } = fixture()
    let escaped
    assert.equal(await database.transaction(async (tx) => {
      escaped = tx
      await tx.query('INSERT INTO fixtures VALUES (?)', [1])
      return 'committed'
    }), 'committed')
    assert.ok(calls.some(([sql]) => sql === 'COMMIT'))
    await assert.rejects(escaped.query('SELECT 1'), { code: 'DB_TRANSACTION_FAILED' })
    assert.deepEqual(calls.at(-1), ['release'])
  })

  it('rolls back callback failures and swallowed query failures', async () => {
    const { database, calls, connection } = fixture()
    const failure = new Error('domain-validation')
    await assert.rejects(database.transaction(async () => { throw failure }), (error) => error === failure)
    assert.ok(calls.some(([sql]) => sql === 'ROLLBACK'))
    assert.ok(!calls.some(([sql]) => sql === 'COMMIT'))
    const execute = connection.execute
    connection.execute = async (sql, values) => {
      if (sql === 'invalid') throw new Error('private SQL')
      return execute(sql, values)
    }
    await assert.rejects(database.transaction(async (tx) => {
      try { await tx.query('invalid') } catch { /* callback tries to swallow failure */ }
      await assert.rejects(tx.query('must-not-run'), { code: 'DB_TRANSACTION_FAILED' })
    }), { code: 'DB_TRANSACTION_FAILED' })
    assert.ok(!calls.some(([sql]) => sql === 'must-not-run'))
    assert.ok(!calls.some(([sql]) => sql === 'COMMIT'))
  })

  it('makes a failed transaction terminal and cancels concurrently queued queries', async () => {
    let fail
    const blockedFailure = new Promise((resolve, reject) => { fail = reject })
    const { database, calls } = fixture({ execute: async (sql, values) => {
      calls.push([sql, values])
      if (sql === 'deadlock') return blockedFailure
      return [[{ ready: 1 }], []]
    } })
    const transaction = database.transaction(async (tx) => {
      const deadlock = tx.query('deadlock')
      const queued = tx.query('queued-after-deadlock')
      fail(Object.assign(new Error('private deadlock detail'), { code: 'ER_LOCK_DEADLOCK' }))
      await assert.rejects(deadlock, { code: 'DB_QUERY_FAILED' })
      await assert.rejects(queued, { code: 'DB_TRANSACTION_FAILED' })
      await assert.rejects(tx.query('after-caught-deadlock'), { code: 'DB_TRANSACTION_FAILED' })
    })
    await assert.rejects(transaction, { code: 'DB_TRANSACTION_FAILED' })
    assert.ok(!calls.some(([sql]) => sql === 'queued-after-deadlock'))
    assert.ok(!calls.some(([sql]) => sql === 'after-caught-deadlock'))
    assert.ok(calls.some(([sql]) => sql === 'ROLLBACK'))
    assert.ok(!calls.some(([sql]) => sql === 'COMMIT'))
    assert.deepEqual(calls.at(-1), ['release'])
  })

  it('rejects nested transactions before acquiring a second connection', async () => {
    const { database, calls } = fixture()
    const failure = new Error('outer failure')
    await assert.rejects(database.transaction(async (tx) => {
      await tx.query('outer-write')
      await assert.rejects(database.transaction(async (inner) => {
        await inner.query('inner-write')
      }), { code: 'DB_TRANSACTION_FAILED' })
      throw failure
    }), (error) => error === failure)
    assert.ok(calls.some(([sql]) => sql === 'outer-write'))
    assert.ok(!calls.some(([sql]) => sql === 'inner-write'))
    assert.equal(calls.filter(([sql]) => sql === 'START TRANSACTION').length, 1)
    assert.ok(!calls.some(([sql]) => sql === 'COMMIT'))
  })

  it('allows unrelated concurrent top-level transactions', async () => {
    const calls = []
    let acquired = 0
    const connection = (id) => ({
      execute: async (sql, values) => { calls.push([id, sql, values]); return [[], []] },
      query: async (sql) => { calls.push([id, sql]); return [[], []] },
      release: () => calls.push([id, 'release']), destroy: () => calls.push([id, 'destroy']),
    })
    const connections = [connection(1), connection(2)]
    const database = createDatabase({ connectionLimit: 2, connectTimeout: 100, queryTimeout: 100 },
      { poolFactory: () => ({ getConnection: async () => connections[acquired++], end: async () => {} }) })
    let releaseFirst
    const firstHeld = new Promise((resolve) => { releaseFirst = resolve })
    let firstEntered
    const entered = new Promise((resolve) => { firstEntered = resolve })
    const first = database.transaction(async (tx) => {
      firstEntered()
      await firstHeld
      await tx.query('first-write')
    })
    await entered
    await database.transaction(async (tx) => { await tx.query('second-write') })
    releaseFirst()
    await first
    assert.equal(acquired, 2)
    assert.ok(calls.some(([id, sql]) => id === 1 && sql === 'first-write'))
    assert.ok(calls.some(([id, sql]) => id === 2 && sql === 'second-write'))
    assert.equal(calls.filter(([, sql]) => sql === 'COMMIT').length, 2)
  })

  it('discards a connection if rollback or a bounded operation fails', async () => {
    const { database, calls, connection } = fixture()
    const query = connection.query
    connection.query = async (sql) => {
      if (sql === 'ROLLBACK') throw new Error('private rollback')
      return query(sql)
    }
    await assert.rejects(database.transaction(async () => { throw new Error('domain') }), /domain/)
    assert.ok(calls.some(([sql]) => sql === 'destroy'))
    const timeout = fixture({ execute: () => new Promise(() => {}) }, { queryTimeout: 10 })
    await assert.rejects(timeout.database.query('SELECT 1'), { code: 'DB_TIMEOUT' })
    assert.ok(timeout.calls.some(([sql]) => sql === 'destroy'))
  })

  it('closes once and fails closed after shutdown', async () => {
    const { database, calls } = fixture()
    await Promise.all([database.close(), database.close()])
    assert.deepEqual(calls, [['end']])
    assert.equal(await database.check(), false)
    await assert.rejects(database.query('SELECT 1'), { code: 'DB_UNAVAILABLE' })
  })

  it('sanitizes acquisition failures without leaking connection identity', async () => {
    const database = createDatabase({}, { poolFactory: () => ({
      getConnection: async () => { throw new Error('private host/password') }, end: async () => {},
    }) })
    await assert.rejects(database.query('SELECT 1'), { code: 'DB_UNAVAILABLE', message: 'Database unavailable' })
    assert.equal(await database.check(), false)
    await database.close()
  })
})
