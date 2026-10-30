import assert from 'node:assert/strict'
import { once } from 'node:events'
import express from 'express'
import { describe, it } from 'node:test'
import { createApp } from '../../app/create-app.js'
import { HttpError, sendData } from './responses.js'
import { invalid, valid, validateRequest } from './validation.js'

async function listen(t, manifests) {
  const app = await createApp({ config: { nodeEnv: 'test' }, manifests })
  const server = app.listen(0, '127.0.0.1')
  await once(server, 'listening')
  t.after(() => new Promise((resolve) => server.close(resolve)))
  return `http://127.0.0.1:${server.address().port}`
}

function manifest() {
  const router = express.Router()
  router.post('/validate', validateRequest('body', (body) => {
    if (typeof body?.name !== 'string' || !body.name.trim()) {
      return invalid({ name: 'Name is required' })
    }
    return valid({ name: body.name.trim() })
  }), (req, res) => sendData(res, req.validated.body))
  router.get('/conflict', () => { throw new HttpError(409, 'CONFLICT', 'Safe conflict') })
  router.get('/failure', () => { throw new Error('private implementation detail') })
  return { id: 'http-test', path: '/http-test', router }
}

async function expectError(response, status, code) {
  assert.equal(response.status, status)
  assert.match(response.headers.get('content-type'), /application\/json/)
  const body = await response.json()
  assert.equal(body.error.code, code)
  assert.equal(body.error.requestId, response.headers.get('x-request-id'))
  return body
}

describe('foundation HTTP runtime integration', () => {
  it('enforces validation, body limits, safe errors, request IDs, and scope exclusions', async (t) => {
    const origin = await listen(t, [manifest()])
    const validResponse = await fetch(`${origin}/api/v1/http-test/validate`, {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-request-id': 'untrusted' },
      body: JSON.stringify({ name: ' Press ' }),
    })
    assert.equal(validResponse.status, 200)
    assert.notEqual(validResponse.headers.get('x-request-id'), 'untrusted')
    assert.deepEqual(await validResponse.json(), { data: { name: 'Press' } })
    assert.equal(validResponse.headers.get('x-powered-by'), null)

    const invalid = await fetch(`${origin}/api/v1/http-test/validate`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}',
    })
    const invalidBody = await expectError(invalid, 422, 'VALIDATION_FAILED')
    assert.deepEqual(invalidBody.error.fieldErrors, { name: ['Name is required'] })

    const malformed = await fetch(`${origin}/api/v1/http-test/validate`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: '{',
    })
    await expectError(malformed, 400, 'VALIDATION_FAILED')

    const oversized = await fetch(`${origin}/api/v1/http-test/validate`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'x'.repeat(70 * 1024) }),
    })
    await expectError(oversized, 413, 'PAYLOAD_TOO_LARGE')

    await expectError(await fetch(`${origin}/api/v1/http-test/conflict`), 409, 'CONFLICT')
    const failure = await expectError(
      await fetch(`${origin}/api/v1/http-test/failure`), 500, 'INTERNAL_ERROR',
    )
    assert.doesNotMatch(JSON.stringify(failure), /private implementation detail/)
    await expectError(await fetch(`${origin}/api/v1/shipping`), 404, 'NOT_FOUND')
  })
})
