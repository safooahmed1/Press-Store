import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readAdminBootstrapConfig } from './admin-bootstrap-config.js'

describe('auth bootstrap protected configuration', () => {
  it('rejects absent/non-string inputs without exposing values and preserves passwords exactly', () => {
    const password = '  protected password stays unchanged  '
    assert.deepEqual(readAdminBootstrapConfig({ BOOTSTRAP_ADMIN_PHONE: '01012345678',
      BOOTSTRAP_ADMIN_PASSWORD: password }), { phone: '01012345678', password })
    for (const env of [{}, { BOOTSTRAP_ADMIN_PHONE: '01012345678' },
      { BOOTSTRAP_ADMIN_PHONE: 123, BOOTSTRAP_ADMIN_PASSWORD: password },
      { BOOTSTRAP_ADMIN_PHONE: '01012345678', BOOTSTRAP_ADMIN_PASSWORD: '' }]) {
      assert.throws(() => readAdminBootstrapConfig(env), { message: 'Invalid admin bootstrap configuration' })
    }
  })
})
