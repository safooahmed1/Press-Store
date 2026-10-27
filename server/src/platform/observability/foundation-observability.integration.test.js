import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { get } from 'node:http'
import express from 'express'
import { startTestApp } from '../../../../tests/helpers/http-server.js'
import { createLogger } from './logger.js'
import { startServer } from '../../app/start-server.js'

describe('foundation request log integration', () => {
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
