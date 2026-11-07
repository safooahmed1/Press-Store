import { OrderError, fields, version, dateTime, timestamp, MAX_ORDER_VERSION } from './order-values.js'

const METHODS = ['cash', 'wallet_eg', 'instapay']
const STATE_FIELDS = ['paymentMethod', 'paymentStatus', 'fulfillmentStatus', 'version', 'cashExpiresAt', 'paidAt',
  'verifiedByAdminId', 'preparedAt', 'preparedByAdminId', 'deliveredAt', 'deliveredByAdminId', 'cancelledAt', 'createdAt', 'updatedAt']

function invalidState() { throw new OrderError('VALIDATION_FAILED') }
function assertState(state) {
  fields(state, STATE_FIELDS)
  if (STATE_FIELDS.some((key) => !Object.hasOwn(state, key)) || !METHODS.includes(state.paymentMethod)
    || !['unpaid', 'payment_pending', 'paid'].includes(state.paymentStatus)
    || !['placed', 'prepared', 'delivered', 'cancelled'].includes(state.fulfillmentStatus)) invalidState()
  version(state.version)
  timestamp(state.createdAt); timestamp(state.updatedAt)
  if (state.updatedAt < state.createdAt) invalidState()
  for (const key of ['paidAt', 'preparedAt', 'deliveredAt', 'cancelledAt']) {
    if (state[key] !== null) {
      timestamp(state[key])
      if (state[key] < state.createdAt || state[key] > state.updatedAt) invalidState()
    }
  }
  for (const key of ['verifiedByAdminId', 'preparedByAdminId', 'deliveredByAdminId']) {
    if (state[key] !== null && state[key] !== '1') invalidState()
  }
  const cash = state.paymentMethod === 'cash', paid = state.paymentStatus === 'paid'
  if ((cash && state.paymentStatus === 'payment_pending') || (!cash && state.paymentStatus === 'unpaid')) invalidState()
  if ((state.paidAt !== null) !== paid || (state.verifiedByAdminId !== null) !== (!cash && paid)) invalidState()
  if (cash && !paid) {
    timestamp(state.cashExpiresAt)
    if (state.cashExpiresAt <= state.createdAt) invalidState()
  } else if (state.cashExpiresAt !== null) invalidState()
  if (!cash && !paid && state.fulfillmentStatus !== 'placed') invalidState()
  if (cash && paid && state.fulfillmentStatus !== 'delivered') invalidState()
  if ((state.preparedAt === null) !== (state.preparedByAdminId === null)
    || (state.fulfillmentStatus === 'placed' && state.preparedAt !== null)
    || (state.fulfillmentStatus === 'prepared' && state.preparedAt === null)) invalidState()
  if ((state.deliveredAt !== null) !== (state.deliveredByAdminId !== null)
    || (state.fulfillmentStatus === 'delivered') !== (state.deliveredAt !== null)) invalidState()
  if (state.fulfillmentStatus === 'delivered'
    && (!paid || state.deliveredAt < state.paidAt || (state.preparedAt !== null && state.preparedAt > state.deliveredAt))) invalidState()
  if ((state.fulfillmentStatus === 'cancelled') !== (state.cancelledAt !== null)) invalidState()
  if (state.fulfillmentStatus === 'cancelled'
    && (!cash || paid || state.cancelledAt < state.cashExpiresAt || (state.preparedAt !== null && state.preparedAt > state.cancelledAt))) invalidState()
}

export function initialOrderState(input, now) {
  fields(input, ['paymentMethod', 'cashExpiresAt'])
  if (!METHODS.includes(input.paymentMethod)) invalidState()
  const createdAt = dateTime(now), cash = input.paymentMethod === 'cash'
  const cashExpiresAt = cash ? dateTime(input.cashExpiresAt) : null
  if ((!cash && input.cashExpiresAt != null) || (cash && cashExpiresAt <= createdAt)) invalidState()
  return Object.freeze({ paymentMethod: input.paymentMethod, paymentStatus: cash ? 'unpaid' : 'payment_pending',
    fulfillmentStatus: 'placed', version: 1, cashExpiresAt, paidAt: null, verifiedByAdminId: null,
    preparedAt: null, preparedByAdminId: null, deliveredAt: null, deliveredByAdminId: null,
    cancelledAt: null, createdAt, updatedAt: createdAt })
}

// Pure state decision only. ORD-006/011 own guarded persistence and the actual expiry worker.
export function transitionOrder(state, command) {
  assertState(state)
  fields(command, ['action', 'actor', 'expectedVersion', 'now'])
  const { action, actor, expectedVersion } = command
  version(expectedVersion)
  const now = dateTime(command.now)
  if (!['verify-payment', 'prepare', 'deliver', 'expire'].includes(action)) throw new OrderError('INVALID_ORDER_TRANSITION')
  const authorized = action === 'expire' ? actor?.actorType === 'system' && actor.actorId === null
    : actor?.actorType === 'admin' && actor.actorId === '1'
  if (!authorized) throw new OrderError('FORBIDDEN')
  if (action === 'verify-payment' && state.paymentMethod === 'cash') throw new OrderError('INVALID_ORDER_TRANSITION')
  const achieved = { 'verify-payment': state.paidAt, prepare: state.preparedAt, deliver: state.deliveredAt, expire: state.cancelledAt }
  if (achieved[action] !== null) return Object.isFrozen(state) ? state : Object.freeze({ ...state })
  if (state.version !== expectedVersion || state.version === MAX_ORDER_VERSION) throw new OrderError('ORDER_CONFLICT')
  if (now < state.updatedAt) invalidState()
  const cash = state.paymentMethod === 'cash', paid = state.paymentStatus === 'paid'
  let patch
  if (action === 'verify-payment' && state.fulfillmentStatus === 'placed' && !paid) {
    patch = { paymentStatus: 'paid', paidAt: now, verifiedByAdminId: actor.actorId }
  } else if (action === 'prepare' && state.fulfillmentStatus === 'placed' && (cash || paid)) {
    patch = { fulfillmentStatus: 'prepared', preparedAt: now, preparedByAdminId: actor.actorId }
  } else if (action === 'deliver' && ['placed', 'prepared'].includes(state.fulfillmentStatus) && (cash || paid)) {
    patch = { fulfillmentStatus: 'delivered', deliveredAt: now, deliveredByAdminId: actor.actorId,
      ...(cash ? { paymentStatus: 'paid', paidAt: now, cashExpiresAt: null } : {}) }
  } else if (action === 'expire' && cash && !paid && ['placed', 'prepared'].includes(state.fulfillmentStatus)
    && now >= state.cashExpiresAt) {
    patch = { fulfillmentStatus: 'cancelled', cancelledAt: now }
  } else throw new OrderError('INVALID_ORDER_TRANSITION')
  const next = Object.freeze({ ...state, ...patch, version: state.version + 1, updatedAt: now })
  assertState(next)
  return next
}
