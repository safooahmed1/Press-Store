import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { initialOrderState, transitionOrder } from './order-state.js'

const start = new Date('2026-11-06T10:00:00.000Z')
const deadline = new Date('2026-11-07T10:00:00.000Z') // Synthetic deadline, not production A-001 policy.
const admin = Object.freeze({ actorType: 'admin', actorId: '1' })
const system = Object.freeze({ actorType: 'system', actorId: null })
const initial = (paymentMethod = 'cash') => initialOrderState({ paymentMethod,
  ...(paymentMethod === 'cash' ? { cashExpiresAt: deadline } : {}) }, start)
const act = (state, action, extra = {}) => transitionOrder(state, { action, actor: admin,
  expectedVersion: state.version, now: new Date(Date.parse(state.updatedAt) + 1000), ...extra })

describe('orders pure payment and fulfillment states', () => {
  it('starts cash unpaid with an explicit deadline and electronic methods pending without expiry', () => {
    for (const method of ['cash', 'wallet_eg', 'instapay']) {
      const value = initial(method)
      assert.equal(value.paymentStatus, method === 'cash' ? 'unpaid' : 'payment_pending')
      assert.equal(value.fulfillmentStatus, 'placed')
      assert.equal(value.cashExpiresAt, method === 'cash' ? deadline.toISOString() : null)
      assert.equal(value.version, 1)
      assert.ok(Object.isFrozen(value))
      assert.equal(value.paidAt, null)
    }
    assert.throws(() => initialOrderState({ paymentMethod: 'cash' }, start), { code: 'VALIDATION_FAILED' })
    assert.throws(() => initialOrderState({ paymentMethod: 'instapay', cashExpiresAt: deadline }, start), { code: 'VALIDATION_FAILED' })
    assert.throws(() => initialOrderState({ paymentMethod: 'cash', cashExpiresAt: start }, start), { code: 'VALIDATION_FAILED' })
  })
  it('rejects pending electronic preparation/delivery and manual cash verification', () => {
    for (const method of ['wallet_eg', 'instapay']) {
      for (const action of ['prepare', 'deliver']) assert.throws(() => act(initial(method), action), { code: 'INVALID_ORDER_TRANSITION' })
    }
    assert.throws(() => act(initial(), 'verify-payment'), { code: 'INVALID_ORDER_TRANSITION' })
  })
  it('verifies electronic payment before preparing/delivering and preserves payment audit', () => {
    for (const method of ['wallet_eg', 'instapay']) {
      const paid = act(initial(method), 'verify-payment')
      const prepared = act(paid, 'prepare')
      const delivered = act(prepared, 'deliver')
      assert.equal(paid.paymentStatus, 'paid')
      assert.equal(paid.verifiedByAdminId, '1')
      assert.equal(delivered.paidAt, paid.paidAt)
      assert.equal(delivered.preparedAt, prepared.preparedAt)
      assert.equal(delivered.deliveredByAdminId, '1')
      assert.equal(delivered.version, 4)
      assert.equal(delivered.cashExpiresAt, null)
    }
  })
  it('prepares cash unpaid and marks it paid at collection, including direct pickup', () => {
    const cash = initial()
    const prepared = act(cash, 'prepare')
    assert.equal(prepared.paymentStatus, 'unpaid')
    const delivered = act(prepared, 'deliver')
    assert.equal(delivered.paymentStatus, 'paid')
    assert.equal(delivered.paidAt, delivered.deliveredAt)
    assert.equal(delivered.cashExpiresAt, null)
    assert.equal(delivered.verifiedByAdminId, null)
    assert.equal(cash.paymentStatus, 'unpaid')
    const direct = act(cash, 'deliver')
    assert.equal(direct.preparedAt, null)
    assert.throws(() => act(direct, 'prepare'), { code: 'INVALID_ORDER_TRANSITION' })
    const directElectronic = act(act(initial('instapay'), 'verify-payment'), 'deliver')
    assert.equal(directElectronic.fulfillmentStatus, 'delivered')
    assert.equal(directElectronic.preparedAt, null)
  })
  it('returns achieved-action repeats unchanged despite the original version, including later states', () => {
    const paid = act(initial('wallet_eg'), 'verify-payment')
    const prepared = act(paid, 'prepare')
    const delivered = act(prepared, 'deliver')
    for (const action of ['verify-payment', 'prepare', 'deliver']) {
      const repeat = act(delivered, action, { expectedVersion: 1 })
      assert.deepEqual(repeat, delivered)
      assert.equal(repeat.updatedAt, delivered.updatedAt)
      assert.ok(Object.isFrozen(repeat))
    }
    assert.ok(Object.isFrozen(act({ ...delivered }, 'deliver', { expectedVersion: 1 })))
  })
  it('requires fixed authorization even for a repeat and only lets the system perform expiry', () => {
    const delivered = act(initial(), 'deliver')
    for (const actor of [undefined, system, { actorType: 'customer', actorId: '1' }, { actorType: 'admin', actorId: '2' }]) {
      assert.throws(() => act(delivered, 'deliver', { actor }), { code: 'FORBIDDEN' })
    }
    assert.throws(() => act(initial(), 'expire', { now: deadline }), { code: 'FORBIDDEN' })
    assert.throws(() => act(initial('instapay'), 'verify-payment', { actor: system }), { code: 'FORBIDDEN' })
  })
  it('rejects stale new transitions, invalid methods/versions and clocks moving backwards', () => {
    const prepared = act(initial(), 'prepare')
    assert.throws(() => act(prepared, 'deliver', { expectedVersion: 1 }), { code: 'ORDER_CONFLICT' })
    assert.throws(() => act(prepared, 'deliver', { now: start }), { code: 'VALIDATION_FAILED' })
    assert.throws(() => act(prepared, 'deliver', { expectedVersion: '2' }), { code: 'VALIDATION_FAILED' })
    assert.throws(() => initialOrderState({ paymentMethod: 'card' }, start), { code: 'VALIDATION_FAILED' })
    assert.throws(() => initialOrderState({ paymentMethod: 'instapay' }, new Date('invalid')), { code: 'VALIDATION_FAILED' })
    assert.throws(() => initialOrderState({ paymentMethod: 'instapay' }, new Date('+010000-01-01T00:00:00.000Z')), { code: 'VALIDATION_FAILED' })
  })
  it('expires only eligible unpaid cash at the supplied deadline without selecting a cutoff policy', () => {
    const prepared = act(initial(), 'prepare')
    assert.throws(() => act(prepared, 'expire', { actor: system }), { code: 'INVALID_ORDER_TRANSITION' })
    const cancelled = act(prepared, 'expire', { actor: system, now: deadline })
    assert.equal(cancelled.fulfillmentStatus, 'cancelled')
    assert.equal(cancelled.cancelledAt, deadline.toISOString())
    assert.equal(cancelled.preparedAt, prepared.preparedAt)
    assert.equal(cancelled.cashExpiresAt, deadline.toISOString())
    assert.deepEqual(act(cancelled, 'expire', { actor: system, now: deadline, expectedVersion: 1 }), cancelled)
    assert.throws(() => act(cancelled, 'deliver'), { code: 'INVALID_ORDER_TRANSITION' })
    for (const state of [act(initial(), 'deliver'), act(initial('wallet_eg'), 'verify-payment'), initial('instapay')]) {
      assert.throws(() => act(state, 'expire', { actor: system, now: deadline }), { code: 'INVALID_ORDER_TRANSITION' })
    }
  })
  it('prevents version overflow while preserving achieved repeats at the maximum', () => {
    const state = { ...initial(), version: 4294967295 }
    assert.throws(() => act(state, 'prepare'), { code: 'ORDER_CONFLICT' })
    const paid = { ...act(initial('instapay'), 'verify-payment'), version: 4294967295 }
    assert.deepEqual(act(paid, 'verify-payment', { expectedVersion: 1 }), paid)
  })
  it('rejects inconsistent persisted states instead of repairing or inventing audit facts', () => {
    for (const change of [{ paymentStatus: 'paid' }, { fulfillmentStatus: 'delivered' },
      { preparedAt: start.toISOString() }, { paidAt: start.toISOString() }, { verifiedByAdminId: '1' },
      { updatedAt: '2026-11-05T00:00:00.000Z' }, { createdAt: 'not-a-date' }]) {
      assert.throws(() => act({ ...initial(), ...change }, 'prepare'), { code: 'VALIDATION_FAILED' })
    }
  })
})
