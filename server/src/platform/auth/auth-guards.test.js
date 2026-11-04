import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createAuthGuards } from './guards.js'

function fixture(find) {
  const calls = []
  const guards = createAuthGuards({ sessions: { find: async (token, scope) => {
    calls.push({ token, scope }); return find(token, scope)
  } }, cookies: { read: (scope) => `${scope}-token` } })
  const req = { get: () => 'synthetic header', body: { actorId: '900' },
    query: { actorId: '901' }, params: { actorId: '902' }, auth: { actorId: '903' } }
  const headers = {}
  const res = { set: (name, value) => { headers[name] = value } }
  return { guards, req, res, calls, headers }
}

describe('auth fixed-scope guards', () => {
  it('derives a frozen actor from the matching session, ignores request overrides and prefers matching scope', async () => {
    for (const scope of ['customer', 'admin']) {
      const f = fixture((token, requested) => ({ actorType: requested, actorId: requested === 'admin' ? '1' : '2' }))
      let passed = 0
      await f.guards[scope === 'customer' ? 'requireCustomer' : 'requireAdmin'](f.req, f.res, () => { passed++ })
      assert.equal(passed, 1)
      assert.deepEqual(f.req.auth, { actorType: scope, actorId: scope === 'admin' ? '1' : '2' })
      assert.equal(Object.isFrozen(f.req.auth), true)
      assert.equal(f.calls.length, 1)
      assert.equal(f.headers['Cache-Control'], 'no-store')
    }
  })

  it('returns 401 absent and 403 other-scope-only without calling the private handler', async () => {
    for (const scope of ['customer', 'admin']) {
      const method = scope === 'customer' ? 'requireCustomer' : 'requireAdmin'
      for (const otherPresent of [false, true]) {
        const f = fixture((token, requested) => otherPresent && requested !== scope
          ? { actorType: requested, actorId: requested === 'admin' ? '1' : '2' } : null)
        await assert.rejects(f.guards[method](f.req, f.res, () => assert.fail('unauthorized handler ran')),
          { code: otherPresent ? 'FORBIDDEN' : 'AUTH_REQUIRED', status: otherPresent ? 403 : 401 })
      }
    }
  })

  it('propagates storage failures and rejects malformed/wrong-scope actors without fallback authorization', async () => {
    const failure = new Error('synthetic storage unavailable')
    const broken = fixture(() => { throw failure })
    await assert.rejects(broken.guards.requireAdmin(broken.req, broken.res, () => assert.fail()), failure)
    assert.equal(broken.calls.length, 1)
    for (const actor of [{ actorType: 'admin', actorId: '2' }, { actorType: 'customer', actorId: '2' }]) {
      const f = fixture(() => actor)
      await assert.rejects(f.guards.requireAdmin(f.req, f.res, () => assert.fail()))
    }
  })
})
