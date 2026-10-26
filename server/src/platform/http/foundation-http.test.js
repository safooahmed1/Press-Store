import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { requestContext } from './request-context.js'
import { HttpError, httpErrorBoundary, sendData, sendError } from './responses.js'
import { invalid, valid, validateRequest } from './validation.js'

function response() {
  return {
    headers: {}, locals: {}, statusCode: 200, body: undefined,
    setHeader(name, value) { this.headers[name] = value },
    status(value) { this.statusCode = value; return this },
    json(value) { this.body = value; return this },
  }
}

describe('foundation HTTP contract', () => {
  it('assigns a server request ID and returns canonical success/error envelopes', () => {
    const res = response()
    requestContext({ headers: { 'x-request-id': 'untrusted' } }, res, () => {})
    assert.match(res.locals.requestId, /^[0-9a-f-]{36}$/)
    assert.notEqual(res.locals.requestId, 'untrusted')
    assert.equal(res.headers['X-Request-Id'], res.locals.requestId)
    sendData(res, { ok: true })
    assert.deepEqual(res.body, { data: { ok: true } })
    sendError(res, new HttpError(409, 'CONFLICT', 'Safe conflict'))
    assert.deepEqual(res.body, { error: {
      code: 'CONFLICT', message: 'Safe conflict', requestId: res.locals.requestId,
    } })
  })

  it('validates trusted outputs and reports normalized field errors', async () => {
    const req = { body: { name: ' Press ' } }
    let forwarded
    await validateRequest('body', (body) => valid({ name: body.name.trim() }))(
      req, response(), (error) => { forwarded = error },
    )
    assert.equal(forwarded, undefined)
    assert.deepEqual(req.validated.body, { name: 'Press' })

    await validateRequest('query', () => invalid({ page: 'Invalid page' }))(
      { query: {} }, response(), (error) => { forwarded = error },
    )
    assert.equal(forwarded.code, 'VALIDATION_FAILED')
    assert.deepEqual(forwarded.fieldErrors, { page: ['Invalid page'] })
  })

  it('sanitizes unknown, malformed JSON, and oversized body errors', () => {
    for (const [error, status, code] of [
      [new Error('database secret'), 500, 'INTERNAL_ERROR'],
      [{ type: 'entity.parse.failed' }, 400, 'VALIDATION_FAILED'],
      [{ type: 'entity.too.large', status: 413 }, 413, 'PAYLOAD_TOO_LARGE'],
    ]) {
      const res = response()
      res.locals.requestId = 'request-id'
      httpErrorBoundary(error, {}, res, () => assert.fail('unexpected next'))
      assert.equal(res.statusCode, status)
      assert.equal(res.body.error.code, code)
      assert.doesNotMatch(JSON.stringify(res.body), /database secret/)
    }
  })

  it('rejects invalid contract definitions before request handling', () => {
    assert.throws(() => new HttpError(200, 'BAD', 'message'), /status/)
    assert.throws(() => new HttpError(400, 'bad-code', 'message'), /UPPER_SNAKE_CASE/)
    assert.throws(() => validateRequest('cookies', () => valid({})), /source/)
    assert.throws(() => validateRequest('body', null), /validator/)
    const error = new HttpError(422, 'VALIDATION_FAILED', 'Invalid', {
      fieldErrors: { __proto__: ['ignored prototype'], constructor: 'Safe field' },
    })
    assert.deepEqual(error.fieldErrors, { constructor: ['Safe field'] })
  })
})
