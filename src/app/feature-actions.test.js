import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createFeatureActionRegistry } from './feature-actions.js'

describe('foundation feature action registry', () => {
  it('rejects invalid IDs, handlers, and duplicate registrations', () => {
    const registry = createFeatureActionRegistry()
    assert.throws(() => registry.register('invalid id', () => {}), /lowercase kebab-case/)
    assert.throws(() => registry.register('valid-action', null), /handlers must be functions/)
    registry.register('valid-action', () => {})
    assert.throws(() => registry.register('valid-action', () => {}), { code: 'ACTION_ALREADY_REGISTERED' })
  })

  it('removes handlers through idempotent lifecycle cleanup', async () => {
    const registry = createFeatureActionRegistry()
    const unregister = registry.register('remove-me', () => 'done')
    assert.equal(await registry.dispatch('remove-me'), 'done')
    unregister()
    unregister()
    await assert.rejects(registry.dispatch('remove-me'), { code: 'ACTION_UNAVAILABLE' })
    assert.equal(registry.getAction('remove-me').status, 'unavailable')
  })

  it('passes payloads and records pending then successful actions', async () => {
    const registry = createFeatureActionRegistry()
    let resolve
    const completion = new Promise((value) => { resolve = value })
    registry.register('save-draft', async (payload) => {
      assert.deepEqual(payload, { title: 'Press' })
      await completion
      return { saved: true }
    })
    const dispatched = registry.dispatch('save-draft', { title: 'Press' })
    assert.equal(registry.getAction('save-draft').status, 'pending')
    await assert.rejects(registry.dispatch('save-draft'), { code: 'ACTION_PENDING' })
    resolve()
    assert.deepEqual(await dispatched, { saved: true })
    assert.equal(registry.getAction('save-draft').status, 'succeeded')
  })

  it('does not restore action state after lifecycle cleanup during pending work', async () => {
    const registry = createFeatureActionRegistry()
    let resolve
    const completion = new Promise((value) => { resolve = value })
    const unregister = registry.register('pending-cleanup', () => completion)
    const dispatched = registry.dispatch('pending-cleanup')
    assert.equal(registry.getAction('pending-cleanup').status, 'pending')
    unregister()
    assert.equal(registry.getAction('pending-cleanup').status, 'unavailable')
    resolve('done')
    assert.equal(await dispatched, 'done')
    assert.equal(registry.getAction('pending-cleanup').status, 'unavailable')
  })

  it('records failures while preserving handler error identity', async () => {
    const registry = createFeatureActionRegistry()
    const failure = new Error('Feature validation failed')
    registry.register('fail-action', async () => { throw failure })
    await assert.rejects(registry.dispatch('fail-action'), failure)
    assert.equal(registry.getAction('fail-action').status, 'failed')
    assert.equal(registry.getAction('fail-action').error, failure)
  })
})
