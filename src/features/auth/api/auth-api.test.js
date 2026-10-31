import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createAuthApi, fieldErrors, normalizeEgyptianPhone } from './auth-api.js'

describe('AUTH-004 phone and error boundary', () => {
  it('normalizes approved Egyptian local and E.164 inputs only', () => {
    assert.equal(normalizeEgyptianPhone('01012345678'), '+201012345678')
    assert.equal(normalizeEgyptianPhone('+201012345678'), '+201012345678')
    assert.equal(normalizeEgyptianPhone(' 010 1234 5678 '), '+201012345678')
    assert.equal(normalizeEgyptianPhone('+971501234567'), null)
    assert.equal(normalizeEgyptianPhone('0112345678'), null)
  })

  it('keeps only safe first field messages from the canonical error envelope', () => {
    assert.deepEqual(fieldErrors({ fieldErrors: { phone: ['Enter a valid phone.', 'Ignored'], password: ['Required'] } }), {
      phone: 'Enter a valid phone.', password: 'Required',
    })
    assert.deepEqual(fieldErrors(new Error('network detail')), {})
  })

  it('targets the frozen customer and admin API endpoints through the production adapter boundary', async () => {
    const calls = []
    const client = {
      post: async (path, body) => { calls.push({ method: 'post', path, body }); return { data: { data: { ok: true } } } },
      get: async (path) => { calls.push({ method: 'get', path }); return { data: { data: { ok: true } } } },
    }
    const api = createAuthApi(client)
    await api.registerCustomer({ phone: '+201012345678' })
    await api.loginCustomer({ phone: '+201012345678' })
    await api.logoutCustomer()
    await api.getCustomerSession()
    await api.loginAdmin({ phone: '+201012345678' })
    await api.getAdminSession()
    assert.deepEqual(calls.map((call) => `${call.method}:${call.path}`), [
      'post:/auth/customer/register', 'post:/auth/customer/login', 'post:/auth/customer/logout',
      'get:/account', 'post:/auth/admin/login', 'get:/auth/admin/session',
    ])
  })
})
