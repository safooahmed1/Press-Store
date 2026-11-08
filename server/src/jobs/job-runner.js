import { createHash } from 'node:crypto'
import { createConnection } from 'mysql2/promise'
import { connectionOptions, databaseOperation } from '../platform/db/database.js'
import { validJobName } from './job-registry.js'

function counts(result) {
  const entries = Object.entries(result)
  if (!entries.length || entries.length > 8 || entries.some(([key, value]) =>
    !/^[a-z][a-z0-9]{0,31}$/.test(key) || key.trim() !== key
    || !Number.isSafeInteger(value) || value < 0)) throw new TypeError('Invalid feature job counts')
  return Object.fromEntries(entries)
}

export async function runFeatureJob({ config, job, connect = createConnection, clock = () => new Date(),
  report = (record) => console.log(JSON.stringify(record)) }) {
  if (!validJobName(job?.name) || typeof job.run !== 'function') throw new TypeError('Invalid feature job')
  const startedAt = clock().toISOString()
  const lockName = `press:job:${createHash('sha256').update(JSON.stringify([config.database, job.name])).digest('hex').slice(0, 54)}`
  let connection
  let locked = false
  let outcome
  const query = async (sql, values = []) => {
    const [rows] = await databaseOperation(connection, () => connection.execute(sql, values), config.queryTimeout)
    return rows
  }

  try {
    connection = await connect(connectionOptions(config))
    await query("SET SESSION time_zone = '+00:00'")
    await query('SET SESSION autocommit = 1')
    const [{ acquired }] = await query('SELECT GET_LOCK(?, 0) AS acquired', [lockName])
    if (acquired === 1 || acquired === '1') {
      locked = true
      const result = await job.run({ query, cutoff: startedAt })
      outcome = { status: 'completed', cutoff: startedAt, counts: counts(result) }
    } else if (acquired === 0 || acquired === '0') {
      outcome = { status: 'busy' }
    } else {
      outcome = { status: 'failed', errorCode: 'JOB_LOCK_FAILED' }
    }
  } catch {
    outcome = { status: 'failed', errorCode: 'JOB_FAILED' }
  } finally {
    if (connection) {
      if (locked) {
        try { await query('SELECT RELEASE_LOCK(?)', [lockName]) } catch { /* Session close also releases the lock. */ }
      }
      connection.destroy()
    }
  }

  const record = { event: 'job.finished', jobName: job.name, startedAt, finishedAt: clock().toISOString(), ...outcome }
  try { await report(record) } catch { /* Reporting does not change the database outcome. */ }
  return record
}
