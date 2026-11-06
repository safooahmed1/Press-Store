import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { cartInput, identity, quantity, totalMinor } from './cart-input.js'
import { createCartService } from './carts.js'

describe('cart input and exact money boundaries', () => {
  it('accepts approved quantity limits and canonical unsigned BIGINT identities', () => {
    assert.equal(quantity(1), 1)
    assert.equal(quantity(99), 99)
    assert.equal(identity('18446744073709551615'), '18446744073709551615')
    assert.deepEqual(cartInput('add', { variantId: '7', quantity: 2, expectedCartVersion: 1 }),
      { variantId: '7', quantity: 2, expectedCartVersion: 1 })
  })
  it('rejects coercion, fractions, missing fields, excess quantities and owner overrides', () => {
    for (const value of [0, -1, 100, 1.1, '2', null, undefined, NaN, Infinity, true]) {
      assert.throws(() => quantity(value), { code: 'VALIDATION_FAILED' })
    }
    for (const value of ['0', '01', ' 1', '1e2', '18446744073709551616', 1]) {
      assert.throws(() => identity(value), { code: 'VALIDATION_FAILED' })
    }
    for (const extra of [{ customerId: '2' }, { priceMinor: 1 }, { cartId: '3' }, { isAvailable: true }]) {
      assert.throws(() => cartInput('add', { variantId: '7', quantity: 1, expectedCartVersion: 1, ...extra }), { code: 'VALIDATION_FAILED' })
    }
  })
  it('requires numeric bounded versions on every mutation and a quantity only where allowed', () => {
    for (const action of ['add', 'update', 'remove', 'clear']) {
      for (const value of [undefined, 0, -1, 1.5, '1', 4294967296]) {
        const fields = { ...(action === 'add' ? { variantId: '7' } : {}),
          ...(['add', 'update'].includes(action) ? { quantity: 1 } : {}) }
        assert.throws(() => cartInput(action, { ...fields, expectedCartVersion: value }), { code: 'VALIDATION_FAILED' })
      }
    }
    assert.deepEqual(cartInput('remove', { expectedCartVersion: 2 }), { expectedCartVersion: 2 })
    assert.throws(() => cartInput('update', { expectedCartVersion: 1 }), { code: 'VALIDATION_FAILED' })
    assert.throws(() => cartInput('clear', { expectedCartVersion: 1, quantity: 1 }), { code: 'VALIDATION_FAILED' })
  })
  it('requires explicit catalog injection with no production fixture fallback', () => {
    assert.throws(() => createCartService({ repository: { withLockedCart() {} } }), TypeError)
  })
  it('calculates totals exactly, supports free discounted items and rejects JSON money overflow', () => {
    assert.equal(totalMinor([{ currentUnitPriceMinor: 320000, quantity: 2 }]), 640000)
    assert.equal(totalMinor([{ currentUnitPriceMinor: 0, quantity: 99 }]), 0)
    assert.equal(totalMinor([]), 0)
    assert.equal(totalMinor([{ currentUnitPriceMinor: Number.MAX_SAFE_INTEGER, quantity: 1 }]), Number.MAX_SAFE_INTEGER)
    assert.throws(() => totalMinor([{ currentUnitPriceMinor: Number.MAX_SAFE_INTEGER, quantity: 2 }]), { code: 'VALIDATION_FAILED' })
    assert.throws(() => totalMinor([{ currentUnitPriceMinor: 1.5, quantity: 1 }]), { code: 'VALIDATION_FAILED' })
  })
})
