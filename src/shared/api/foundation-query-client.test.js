import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createAppQueryClient, shouldRetryQuery } from './query-client.js'

describe('foundation React Query boundary', () => {
  it('retries one transient read but never client failures or repeated failures', () => {
    assert.equal(shouldRetryQuery(0, { code: 'NETWORK_ERROR' }), true)
    assert.equal(shouldRetryQuery(0, { status: 503 }), true)
    assert.equal(shouldRetryQuery(0, { status: 422 }), false)
    assert.equal(shouldRetryQuery(1, { status: 503 }), false)
  })

  it('does not retry mutations by default', () => {
    const defaults = createAppQueryClient().getDefaultOptions()
    assert.equal(defaults.queries.retry, shouldRetryQuery)
    assert.equal(defaults.queries.refetchOnWindowFocus, false)
    assert.equal(defaults.mutations.retry, false)
  })
})
