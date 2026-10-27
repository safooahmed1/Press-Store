import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { describe, it } from 'node:test'
import { createLogger } from './logger.js'
import { requestLogging } from './request-logging.js'

describe('foundation safe observability', () => {
  it('drops sensitive fields, raw exceptions and malformed metadata without traversing them', () => {
    const lines = []
    const logger = createLogger({ environment: 'test', sink: (line) => lines.push(line) })
    const fields = { level: 'error', errorCode: 'DB_QUERY_FAILED', password: 'private-password',
      phone: '+201012345678', paymentNumber: 'private-payment', headers: { cookie: 'private-cookie' },
      body: { secret: 'private-body' }, sql: 'SELECT private_sql',
      error: new Error('private-exception'), requestId: 'private-inbound-id',
      routeTemplate: '/unsafe?phone=private-query', durationMs: -1, status: 999 }
    Object.defineProperty(fields, 'credentials', { enumerable: true, get() { throw new Error('do not read') } })
    logger.log('database.failed', fields)
    assert.equal(lines.length, 1)
    assert.doesNotMatch(lines[0], /private|201012345678|SELECT|cookie|password|stack|credentials/)
    const record = JSON.parse(lines[0])
    assert.equal(record.environment, 'test')
    assert.equal(record.level, 'error')
    assert.equal(record.errorCode, 'DB_QUERY_FAILED')
    assert.equal(record.routeTemplate, null)
    assert.equal(record.requestId, null)
    assert.equal(record.durationMs, null)
    assert.equal(record.status, null)
    assert.ok(Number.isFinite(Date.parse(record.timestamp)))
    logger.log('invalid\nevent', { errorCode: 'invalid\ncode' })
    assert.equal(JSON.parse(lines[1]).event, 'application.event')
    assert.equal(JSON.parse(lines[1]).errorCode, null)
  })

  it('contains throwing and rejecting sinks without affecting following application work', async () => {
    for (const sink of [() => { throw new Error('secret') }, async () => { throw new Error('secret') }]) {
      const logger = createLogger({ environment: 'test', sink })
      assert.doesNotThrow(() => logger.log('application.started'))
    }
    await new Promise((resolve) => setImmediate(resolve))
  })

  it('records an early disconnect exactly once and does not leak a resolved nested mount', () => {
    const records = []
    const logger = createLogger({ environment: 'test', sink: (line) => records.push(JSON.parse(line)) })
    const res = Object.assign(new EventEmitter(), {
      locals: { requestId: 'e5e1c6bc-4c42-4b69-9385-5fac9ab0835f' },
      writableFinished: false, statusCode: 200,
    })
    let next = false
    requestLogging({ logger })({ method: 'GET', baseUrl: '/api/v1/secret-phone',
      route: { path: '/orders/:id' } }, res, () => { next = true })
    res.emit('close')
    res.emit('finish')
    assert.equal(next, true)
    assert.equal(records.length, 1)
    assert.equal(records[0].event, 'http.request.aborted')
    assert.equal(records[0].status, 499)
    assert.equal(records[0].errorCode, 'REQUEST_ABORTED')
    assert.equal(records[0].routeTemplate, '<unresolved>')
    assert.equal(res.listenerCount('close') + res.listenerCount('finish'), 0)
    assert.doesNotMatch(JSON.stringify(records), /secret-phone/)
  })
})
