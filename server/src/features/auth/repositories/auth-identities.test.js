import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createIdentityRepository } from './identities.js'

describe('auth identity repository boundary', () => {
  it('normalizes credential lookup and projects only permitted summary fields', async () => {
    const calls = []
    const repository = createIdentityRepository({ async query(sql, values) {
      calls.push({ sql, values })
      return [{ customer_id: '8', first_name: 'Amina', last_name: 'Ali', phone: '+201012345678',
        password_hash: 'synthetic-private-hash', session_id_hash: 'synthetic-private-session' }]
    } })
    const credentials = await repository.findCustomerCredentials('01012345678')
    assert.equal(credentials.passwordHash, 'synthetic-private-hash')
    assert.deepEqual(calls[0].values, ['+201012345678'])
    assert.doesNotMatch(calls[0].sql, /01012345678/)
    assert.deepEqual(await repository.readCustomerSummary('8'), {
      customerId: '8', firstName: 'Amina', lastName: 'Ali', phone: '+201012345678',
    })
    await assert.rejects(repository.findCustomerCredentials("' OR 1=1 --"), { code: 'VALIDATION_FAILED' })
    for (const id of ['8 OR 1=1', '0', '8\n', '18446744073709551616']) {
      await assert.rejects(repository.readCustomerSummary(id), TypeError)
    }
    assert.equal(calls.length, 2)
  })

  it('returns no actor on absence and propagates storage failure without substituting authentication', async () => {
    const absent = createIdentityRepository({ query: async () => [] })
    assert.equal(await absent.findCustomerCredentials('01012345678'), null)
    assert.equal(await absent.findAdminCredentials('+201012345678'), null)
    assert.equal(await absent.readCustomerSummary('1'), null)
    const error = new Error('synthetic database outage')
    const broken = createIdentityRepository({ query: async () => { throw error } })
    await assert.rejects(broken.findCustomerCredentials('01012345678'), error)
    await assert.rejects(broken.findAdminCredentials('01012345678'), error)
  })
})
