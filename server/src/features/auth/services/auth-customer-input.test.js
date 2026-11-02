import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { customerInput } from './customer-input.js'

describe('auth customer request validation', () => {
  const password = 'correct horse battery staple'
  it('normalizes allowed registration fields without altering passwords', () => {
    const result = customerInput(true)({ firstName: ' Amina ', lastName: ' Ali ', phone: '01012345678', password })
    assert.deepEqual(result, { ok: true, value: { firstName: 'Amina', lastName: 'Ali', phone: '+201012345678', password } })
    assert.equal(customerInput(true)({ firstName: '😀'.repeat(255), lastName: 'علي', phone: '01012345678', password }).ok, true)
  })

  it('rejects owner/address/extra fields, wrong types, invalid names and invalid credentials', () => {
    const input = { firstName: 'Amina', lastName: 'Ali', phone: '01012345678', password }
    for (const extra of ['customerId', 'adminId', 'address', 'city', 'role']) {
      assert.equal(customerInput(true)({ ...input, [extra]: 'untrusted' }).ok, false)
    }
    for (const value of [undefined, [], 'body', null]) assert.equal(customerInput(true)(value).ok, false)
    for (const firstName of ['', ' ', 4, 'a'.repeat(256), 'a\u0000b', '\ud800']) {
      assert.ok(customerInput(true)({ ...input, firstName }).fieldErrors.firstName)
    }
    const errors = customerInput()({ phone: '+441234567890', password: 'short' })
    assert.deepEqual(Object.keys(errors.fieldErrors), ['phone', 'password'])
    assert.equal(JSON.stringify(errors).includes('short'), false)
  })
})
