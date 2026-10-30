import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { ApiError, apiClient, normalizeApiError } from './http-client.js'

describe('foundation Axios transport', () => {
  it('uses same-origin versioned API defaults with credentials', () => {
    assert.equal(apiClient.defaults.baseURL, '/api/v1')
    assert.equal(apiClient.defaults.withCredentials, true)
    assert.equal(apiClient.defaults.timeout, 15_000)
  })

  it('normalizes canonical API envelopes without losing recovery fields', () => {
    const cause = { response: { status: 422, data: { error: {
      code: 'VALIDATION_FAILED', message: 'Check the fields',
      fieldErrors: { phone: ['Invalid phone'] }, requestId: 'opaque-id',
    } } } }
    const error = normalizeApiError(cause)
    assert.ok(error instanceof ApiError)
    assert.equal(error.code, 'VALIDATION_FAILED')
    assert.equal(error.status, 422)
    assert.deepEqual(error.fieldErrors, { phone: ['Invalid phone'] })
    assert.equal(error.requestId, 'opaque-id')
    assert.equal(error.cause, cause)
  })

  it('uses safe local messages for network and malformed server failures', () => {
    const network = normalizeApiError(new Error('socket internals'))
    assert.equal(network.code, 'NETWORK_ERROR')
    assert.doesNotMatch(network.message, /socket/)
    const malformed = normalizeApiError({ response: {
      status: 500, data: { message: 'private stack detail' },
    } })
    assert.equal(malformed.code, 'HTTP_ERROR')
    assert.doesNotMatch(malformed.message, /private stack/)
  })
})
