import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { normalizePhone, validatePassword } from './auth-validation.js'
import { hashPassword, verifyPassword } from './passwords.js'

describe('auth Egyptian identity and password primitives', () => {
  it('maps both approved phone formats to one identity and rejects other input', () => {
    assert.equal(normalizePhone('01012345678'), '+201012345678')
    assert.equal(normalizePhone('+201012345678'), '+201012345678')
    for (const phone of [null, 1012345678, '201012345678', '+441012345678',
      '0101234567', '010123456789', ' 01012345678', '٠١٠١٢٣٤٥٦٧٨', '01012345678\n']) {
      assert.throws(() => normalizePhone(phone), { code: 'VALIDATION_FAILED', field: 'phone' })
    }
  })

  it('enforces Unicode character bounds without composition rules or trimming', () => {
    assert.equal(validatePassword(' '.repeat(15)), ' '.repeat(15))
    assert.equal(validatePassword('س'.repeat(128)), 'س'.repeat(128))
    assert.equal(validatePassword('😀'.repeat(128)), '😀'.repeat(128))
    for (const password of [null, {}, 'a'.repeat(14), 'a'.repeat(129), '\ud800'.repeat(15)]) {
      assert.throws(() => validatePassword(password), { code: 'VALIDATION_FAILED', field: 'password' })
    }
  })

  it('uses random salts, verifies passwords and refuses malformed or attacker-chosen costs', async () => {
    const password = 'correct horse battery staple'
    const first = await hashPassword(password)
    const second = await hashPassword(password)
    assert.notEqual(first, second)
    assert.doesNotMatch(first, /correct|horse|battery|staple/)
    assert.equal(await verifyPassword(password, first), true)
    assert.equal(await verifyPassword('incorrect horse battery staple', first), false)
    assert.equal(await verifyPassword(`${password} `, first), false)
    for (const encoded of [null, 'invalid', first.replace('131072', '999999999'), `${first}\n`]) {
      assert.equal(await verifyPassword(password, encoded), false)
    }
    assert.equal(await verifyPassword('short', first), false)
    await assert.rejects(hashPassword('short'), { code: 'VALIDATION_FAILED' })
  })
})
