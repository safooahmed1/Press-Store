import { randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { createConnection } from 'mysql2/promise'
import { readDatabaseConfig } from '../../../config/database-config.js'

function trackProcess(child) {
  let error
  let closeResult
  const closed = new Promise((resolve) => {
    child.once('close', (code, signal) => {
      closeResult = { code, signal }
      resolve(closeResult)
    })
  })
  const settled = new Promise((resolve) => {
    child.once('error', (value) => { error = value; resolve({ error: value }) })
    closed.then(resolve)
  })
  return {
    child, closed, settled,
    get error() { return error },
    get terminated() {
      return Boolean(closeResult) || child.exitCode !== null || child.signalCode !== null
    },
  }
}

function running(process) {
  return process && !process.terminated
}

async function within(promise, timeout, sleep) {
  const expired = Symbol('expired')
  const controller = new AbortController()
  const timer = sleep(timeout, undefined, { signal: controller.signal, ref: false })
    .then(() => expired, (error) => error?.name === 'AbortError' ? new Promise(() => {}) : Promise.reject(error))
  try {
    const result = await Promise.race([promise, timer])
    return result === expired ? undefined : result
  } finally { controller.abort() }
}

async function terminate(process, timeout, sleep) {
  if (!running(process)) return
  const signalFailures = []
  try { process.child.kill('SIGTERM') } catch (error) { signalFailures.push(error) }
  if (await within(process.closed, timeout, sleep) || !running(process)) return
  try { process.child.kill('SIGKILL') } catch (error) { signalFailures.push(error) }
  if (await within(process.closed, timeout, sleep) || !running(process)) return
  const cause = signalFailures.length > 1
    ? new AggregateError(signalFailures, 'Disposable MySQL signal delivery failed')
    : signalFailures[0]
  throw new Error('Disposable MySQL child failed to exit', { cause })
}

/** Opt-in tests only: creates its own datadir, database and test-only credentials. */
export async function startDisposableMysql({
  dependencies = {}, startupAttempts = 100, initializationTimeout = 30000,
  shutdownTimeout = 3000, terminateTimeout = 1000, readinessTimeout = 1000,
  startupTimeout = 30000, retryDelay = 100,
} = {}) {
  const spawnProcess = dependencies.spawnProcess || spawn
  const connect = dependencies.connect || createConnection
  const makeRoot = dependencies.makeRoot || ((prefix) => mkdtemp(prefix))
  const write = dependencies.write || writeFile
  const removeRoot = dependencies.removeRoot || rm
  const sleep = dependencies.sleep || delay
  const random = dependencies.random || randomBytes
  const root = await makeRoot(path.join(tmpdir(), 'press-fnd002-mysql-'))
  const datadir = path.join(root, 'data')
  const log = path.join(root, 'mysql.log')
  const password = random(24).toString('hex')
  const port = 30000 + random(2).readUInt16BE() % 30000
  const config = readDatabaseConfig({ MYSQL_HOST: '127.0.0.1', MYSQL_PORT: String(port),
    MYSQL_DATABASE: 'fnd_disposable_tests', MYSQL_USER: 'fnd_test_only', MYSQL_PASSWORD: password,
    MYSQL_CONNECTION_LIMIT: '2', MYSQL_CONNECT_TIMEOUT_MS: '1000', MYSQL_QUERY_TIMEOUT_MS: '3000',
    MYSQL_MIGRATION_LOCK_TIMEOUT_SECONDS: '1' })
  let initializer
  let server
  let stopping
  let startupCancelled = false
  const readinessConnections = new Set()
  const destroyedConnections = new WeakSet()

  function destroyOnce(connection) {
    if (!connection || destroyedConnections.has(connection)) return
    destroyedConnections.add(connection)
    connection.destroy()
  }

  async function cleanup() {
    const failures = []
    startupCancelled = true
    for (const active of readinessConnections) {
      try { destroyOnce(active) } catch (error) { failures.push(error) }
    }
    readinessConnections.clear()
    let connection
    if (running(server)) {
      try {
        let connectionExpired = false
        const connectionAttempt = Promise.resolve().then(() => connect({ host: config.host, port,
          user: config.user, password, database: config.database, connectTimeout: 1000 }))
        connectionAttempt.then((value) => {
          if (connectionExpired) try { destroyOnce(value) } catch { /* already outside helper ownership */ }
        }, () => {})
        connection = await within(connectionAttempt, shutdownTimeout, sleep)
        connectionExpired = !connection
        if (connection) {
          const shutdown = Promise.resolve().then(() => connection.query('SHUTDOWN'))
          shutdown.catch(() => {})
          await within(shutdown, shutdownTimeout, sleep)
        }
      } catch { /* owned process termination below is the cleanup fallback */ }
      finally {
        if (connection) try { destroyOnce(connection) } catch (error) { failures.push(error) }
      }
      try {
        if (running(server)) await within(server.closed, shutdownTimeout, sleep)
      } catch (error) { failures.push(error) }
    }
    for (const process of [initializer, server]) {
      try { await terminate(process, terminateTimeout, sleep) } catch (error) { failures.push(error) }
    }
    const childrenTerminated = [initializer, server]
      .every((process) => !process || process.terminated)
    if (childrenTerminated) {
      try { await removeRoot(root, { recursive: true, force: true }) } catch (error) { failures.push(error) }
    } else if (failures.length === 0) {
      failures.push(new Error('Disposable MySQL child failed to exit'))
    }
    if (failures.length === 1) throw failures[0]
    if (failures.length > 1) throw new AggregateError(failures, 'Disposable MySQL cleanup failed')
  }

  function stop() {
    if (!stopping) stopping = cleanup()
    return stopping
  }

  try {
    initializer = trackProcess(spawnProcess('mysqld', ['--no-defaults', '--initialize-insecure',
      `--datadir=${datadir}`, `--log-error=${log}`], { stdio: 'ignore' }))
    const initialized = await within(initializer.settled, initializationTimeout, sleep)
    if (!initialized || initialized.error || initialized.code !== 0) {
      throw new Error('Disposable MySQL initialization failed')
    }
    const initFile = path.join(root, 'initialize.sql')
    await write(initFile, [
      `ALTER USER 'root'@'localhost' IDENTIFIED BY '${random(24).toString('hex')}';`,
      'CREATE DATABASE fnd_disposable_tests CHARACTER SET utf8mb4;',
      `CREATE USER 'fnd_test_only'@'127.0.0.1' IDENTIFIED BY '${password}';`,
      "GRANT ALL ON fnd_disposable_tests.* TO 'fnd_test_only'@'127.0.0.1';",
      "GRANT SHUTDOWN ON *.* TO 'fnd_test_only'@'127.0.0.1';",
    ].join('\n'), { mode: 0o600 })
    server = trackProcess(spawnProcess('mysqld', ['--no-defaults', `--datadir=${datadir}`,
      `--port=${port}`, '--bind-address=127.0.0.1', '--mysqlx=OFF', '--skip-log-bin',
      `--socket=${path.join(root, 'mysql.sock')}`, `--pid-file=${path.join(root, 'mysql.pid')}`,
      `--log-error=${log}`, `--init-file=${initFile}`], { stdio: 'ignore' }))
    const readiness = (async () => {
      for (let attempt = 0; attempt < startupAttempts; attempt++) {
        if (startupCancelled) throw new Error('Disposable MySQL readiness timed out')
        if (!running(server) || server.error) throw new Error('Disposable MySQL startup failed')
        const attemptDeadline = Date.now() + readinessTimeout
        let connection
        let connectionExpired = false
        try {
          const connectionAttempt = Promise.resolve().then(() => connect({ host: config.host, port,
            user: config.user, password, database: config.database,
            connectTimeout: Math.max(1, Math.min(200, readinessTimeout)) }))
          connectionAttempt.then((value) => {
            if (connectionExpired || startupCancelled) {
              try { destroyOnce(value) } catch { /* late connection cannot be used */ }
            }
          }, () => {})
          connection = await within(connectionAttempt,
            Math.max(0, attemptDeadline - Date.now()), sleep)
          connectionExpired = !connection
          if (!connection || startupCancelled) throw new Error('Readiness connection timed out')
          readinessConnections.add(connection)
          const query = Promise.resolve().then(() => connection.query(
            'SELECT @@version AS version, @@version_comment AS comment'))
          query.catch(() => {})
          const result = await within(query, Math.max(0, attemptDeadline - Date.now()), sleep)
          if (!result || startupCancelled) throw new Error('Readiness query timed out')
          const [[row]] = result
          if (/mariadb/i.test(row.version + row.comment)) throw new Error('MySQL required')
          return { config, version: row.version, stop }
        } catch {
          if (startupCancelled) throw new Error('Disposable MySQL readiness timed out')
          if (!running(server) || server.error) throw new Error('Disposable MySQL startup failed')
          if (attempt + 1 < startupAttempts) await sleep(retryDelay)
        } finally {
          connectionExpired = true
          if (connection) {
            readinessConnections.delete(connection)
            try { destroyOnce(connection) } catch { /* readiness will retry or fail */ }
          }
        }
      }
      throw new Error('Disposable MySQL readiness timed out')
    })()
    readiness.catch(() => {})
    const fixture = await within(readiness, startupTimeout, sleep)
    if (!fixture) {
      startupCancelled = true
      for (const active of readinessConnections) {
        try { destroyOnce(active) } catch { /* cleanup records process failures below */ }
      }
      readinessConnections.clear()
      throw new Error('Disposable MySQL readiness timed out')
    }
    return fixture
  } catch (error) {
    try { await stop() } catch (cleanupError) {
      throw new AggregateError([error, cleanupError], 'Disposable MySQL startup and cleanup failed',
        { cause: cleanupError })
    }
    throw error
  }
}
