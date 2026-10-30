import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { get } from 'node:http'
import express from 'express'
import { startTestApp } from '../../../../tests/helpers/http-server.js'
import { createLogger } from './logger.js'
import { startServer } from '../../app/start-server.js'
import { HttpError } from '../http/responses.js'

describe('foundation request log integration', () => {
  it('retains declared parameterized templates across sync, async and forwarded errors', async (t) => {
    const router = express.Router()
    router.post('/sync/:id', () => { throw new Error('private-sync-exception') })
    router.post('/async/:id', async () => { throw new Error('private-async-exception') })
    router.post('/forward/:id', (req, res, next) => next(new HttpError(409, 'CONFLICT', 'Safe conflict')))
    router.post('/success/:id', (req, res) => res.json({ ok: true }))
    const { origin, logs } = await startTestApp(t, {
      manifests: [{ id: 'fixture', path: '/fixture', router }],
    })
    for (const [name, status, code] of [
      ['sync', 500, 'INTERNAL_ERROR'], ['async', 500, 'INTERNAL_ERROR'],
      ['forward', 409, 'CONFLICT'], ['success', 200, null],
    ]) {
      const response = await fetch(`${origin}/api/v1/fixture/${name}/private-id?token=private-query`, {
        method: 'POST', body: JSON.stringify({ password: 'private-body' }),
        headers: { 'Content-Type': 'application/json', Authorization: 'private-auth',
          Cookie: 'private-cookie', 'X-Request-Id': 'private-inbound' },
      })
      const body = await response.json()
      assert.equal(response.status, status)
      const records = logs.filter((log) => log.requestId === response.headers.get('X-Request-Id'))
      assert.equal(records.length, 1)
      assert.equal(records[0].event, 'http.request.completed')
      assert.equal(records[0].routeTemplate, `/api/v1/fixture/${name}/:id`)
      assert.equal(records[0].status, status)
      assert.equal(records[0].errorCode, code)
      if (code) assert.equal(body.error.requestId, records[0].requestId)
    }
    assert.equal(logs.length, 4)
    assert.doesNotMatch(JSON.stringify(logs), /private|password|Authorization|Cookie|Safe conflict/)
  })

  it('keeps nested dynamic routes unresolved on both success and failure and misses unmatched', async (t) => {
    const nested = express.Router()
    nested.get('/items/:id', (req, res) => res.json({ ok: true }))
    nested.get('/failed/:id', async () => { throw new Error('private-nested-exception') })
    const router = express.Router()
    router.use('/accounts/:account', nested)
    const { origin, logs } = await startTestApp(t, {
      manifests: [{ id: 'fixture', path: '/fixture', router }],
    })
    for (const target of ['items/private-id', 'failed/private-id', 'missing']) {
      const response = await fetch(`${origin}/api/v1/fixture/accounts/private-account/${target}?private=query`)
      await response.text()
    }
    assert.deepEqual(logs.map((log) => [log.routeTemplate, log.status]), [
      ['<unresolved>', 200], ['<unresolved>', 500], ['<unmatched>', 404],
    ])
    assert.doesNotMatch(JSON.stringify(logs), /private|query/)
  })

  it('preserves failed-route HTTP behavior with throwing and rejecting log sinks', async (t) => {
    for (const sink of [() => { throw new Error('private-sink') },
      async () => { throw new Error('private-sink') }]) {
      const router = express.Router()
      router.get('/failed/:id', async () => { throw new Error('private-exception') })
      const { origin } = await startTestApp(t, {
        logger: createLogger({ environment: 'test', sink }),
        manifests: [{ id: 'fixture', path: '/fixture', router }],
      })
      const response = await fetch(`${origin}/api/v1/fixture/failed/private-id`)
      assert.equal(response.status, 500)
      const body = await response.json()
      assert.equal(body.error.code, 'INTERNAL_ERROR')
      assert.equal(body.error.requestId, response.headers.get('X-Request-Id'))
      assert.doesNotMatch(JSON.stringify(body), /private/)
    }
  })

  it('correlates response and safe route-template logs, hides URLs/PII and logs failures', async (t) => {
    const router = express.Router()
    router.get('/items/:id', (req, res) => res.json({ ok: true }))
    router.get('/failed', () => { throw new Error('private-password SELECT private-table') })
    let ready = true
    const { origin, logs } = await startTestApp(t, {
      manifests: [{ id: 'fixture', path: '/fixture', router }], isReady: async () => ready,
    })
    const ok = await fetch(`${origin}/api/v1/fixture/items/private-phone?token=private-token`, {
      headers: { 'X-Request-Id': 'private-inbound', Cookie: 'private-cookie', Authorization: 'private-auth' },
    })
    await ok.text()
    assert.equal(ok.status, 200)
    assert.equal(logs[0].requestId, ok.headers.get('X-Request-Id'))
    assert.equal(logs[0].routeTemplate, '/api/v1/fixture/items/:id')
    assert.equal(logs[0].method, 'GET')
    assert.equal(logs[0].status, 200)
    assert.equal(logs[0].errorCode, null)
    assert.ok(logs[0].durationMs >= 0)
    const failed = await fetch(`${origin}/api/v1/fixture/failed`)
    const payload = await failed.json()
    assert.equal(failed.status, 500)
    assert.equal(logs[1].errorCode, 'INTERNAL_ERROR')
    assert.equal(logs[1].level, 'error')
    assert.equal(logs[1].requestId, payload.error.requestId)
    const missing = await fetch(`${origin}/private-path?phone=private-query`)
    await missing.text()
    assert.equal(logs[2].routeTemplate, '<unmatched>')
    assert.equal(logs[2].errorCode, 'NOT_FOUND')
    ready = false
    const unavailable = await fetch(`${origin}/api/v1/health`)
    assert.equal(unavailable.status, 503)
    await unavailable.text()
    assert.equal(logs[3].errorCode, 'SERVICE_UNAVAILABLE')
    ready = true
    await (await fetch(`${origin}/api/v1/health`)).text()
    assert.equal(logs[4].status, 200)
    assert.equal(logs.length, 5)
    assert.doesNotMatch(JSON.stringify(logs), /private|SELECT|Cookie|Authorization/)
    t.diagnostic(`Representative safe log: ${JSON.stringify(logs[0])}`)
  })

  it('keeps HTTP success/error behavior when the log sink fails', async (t) => {
    const logger = createLogger({ environment: 'test', sink: () => { throw new Error('private-sink') } })
    const { origin } = await startTestApp(t, { logger })
    assert.equal((await fetch(`${origin}/api/v1/health`)).status, 200)
    const missing = await fetch(`${origin}/missing`)
    assert.equal(missing.status, 404)
    assert.equal((await missing.json()).error.code, 'NOT_FOUND')
  })

  it('records one aborted event when a real client disconnects during a response', async (t) => {
    const router = express.Router()
    router.get('/stream', (req, res) => { res.write('fixture chunk') })
    const records = []
    let aborted
    const recorded = new Promise((resolve) => { aborted = resolve })
    const logger = createLogger({ environment: 'test', sink: (line) => {
      const record = JSON.parse(line)
      records.push(record)
      if (record.event === 'http.request.aborted') aborted(record)
    } })
    const { origin } = await startTestApp(t, {
      logger, manifests: [{ id: 'fixture', path: '/fixture', router }],
    })
    await new Promise((resolve, reject) => {
      const request = get(`${origin}/api/v1/fixture/stream`, (response) => {
        response.once('data', () => { response.destroy(); resolve() })
      })
      request.once('error', reject)
    })
    const record = await recorded
    assert.equal(record.status, 499)
    assert.equal(record.errorCode, 'REQUEST_ABORTED')
    assert.equal(record.routeTemplate, '/api/v1/fixture/stream')
    assert.equal(records.length, 1)
  }, { timeout: 5000 })

  it('records startup success and failure without database/configuration details', async () => {
    const records = []
    const logger = createLogger({ environment: 'test', sink: (line) => records.push(JSON.parse(line)) })
    let closed = 0
    const options = { config: { nodeEnv: 'test', port: 0 }, databaseConfig: {}, logger,
      databaseFactory: () => ({ check: async () => true, close: async () => { closed++ } }),
      manifestsLoader: async () => [],
    }
    const server = await startServer(options)
    try { assert.equal(records[0].event, 'application.started') } finally {
      await new Promise((resolve) => server.close(resolve))
      await server.closeDatabase()
    }
    await assert.rejects(startServer({ ...options, manifestsLoader: async () => {
      throw new Error('private-config-password')
    } }), /private-config-password/)
    assert.equal(closed, 2)
    assert.equal(records[1].event, 'application.startup.failed')
    assert.equal(records[1].errorCode, 'STARTUP_FAILED')
    assert.doesNotMatch(JSON.stringify(records), /private|password/)
  })

  it('contains injected logger failure without changing successful startup or cleanup', async () => {
    let closed = 0
    const server = await startServer({ config: { nodeEnv: 'test', port: 0 }, databaseConfig: {},
      manifestsLoader: async () => [], logger: { log: async () => { throw new Error('private-sink') } },
      databaseFactory: () => ({ check: async () => true, close: async () => { closed++ } }),
    })
    try {
      const response = await fetch(`http://127.0.0.1:${server.address().port}/api/v1/health`)
      assert.equal(response.status, 200)
      await response.text()
    } finally {
      await new Promise((resolve) => server.close(resolve))
      await server.closeDatabase()
    }
    assert.equal(closed, 1)
  })
})
