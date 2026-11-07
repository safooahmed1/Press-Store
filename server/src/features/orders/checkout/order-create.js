import { createHash, randomUUID } from 'node:crypto'
import { createOrderSnapshots } from '../domain/order-snapshots.js'
import { initialOrderState } from '../domain/order-state.js'
import { fields, identity, OrderError, version } from '../domain/order-values.js'
import {
  checkoutPaymentMethod, checkoutPickup, checkoutQuoteVersion, readCheckoutCart, readCheckoutDestination,
} from './checkout-quote.js'

const cashExpiryMs = 7 * 24 * 60 * 60 * 1000
const replayableErrors = new Set([
  'CART_EMPTY', 'QUOTE_CHANGED', 'VARIANT_UNAVAILABLE', 'PAYMENT_SETTINGS_UNAVAILABLE',
  'DB_CONSTRAINT_FAILED', 'DB_QUERY_FAILED', 'DB_TRANSACTION_FAILED', 'DB_TIMEOUT',
])

function normalizeWalletSender(value) {
  if (typeof value === 'string') {
    if (value.length === 11 && /^01[0-9]{9}$/.test(value)) return `+2${value}`
    if (value.length === 13 && /^\+201[0-9]{9}$/.test(value)) return value
  }
  throw new OrderError('VALIDATION_FAILED')
}

function submissionInput(input, key) {
  fields(input, ['paymentMethod', 'walletSenderNumber', 'acceptedQuoteVersion', 'expectedCartVersion'])
  const { acceptedQuoteVersion, expectedCartVersion } = input
  const paymentMethod = checkoutPaymentMethod(input.paymentMethod)
  version(expectedCartVersion)
  if (typeof key !== 'string' || !key.length || key.length > 128 || /[^!-~]|,/.test(key)
    || typeof acceptedQuoteVersion !== 'string' || acceptedQuoteVersion.length !== 64 || /[^0-9a-f]/.test(acceptedQuoteVersion)) {
    throw new OrderError('VALIDATION_FAILED')
  }
  let walletSenderNumber = null
  if (paymentMethod === 'wallet_eg') {
    walletSenderNumber = normalizeWalletSender(input.walletSenderNumber)
  } else if (Object.hasOwn(input, 'walletSenderNumber')) {
    throw new OrderError('VALIDATION_FAILED')
  }
  const keyHash = createHash('sha256').update(key).digest()
  const requestHash = createHash('sha256').update(JSON.stringify([
    'order-submission-v1', paymentMethod, walletSenderNumber, expectedCartVersion, acceptedQuoteVersion,
  ])).digest()
  return { paymentMethod, walletSenderNumber, expectedCartVersion, acceptedQuoteVersion, keyHash, requestHash }
}

function creationResult({ orderId, orderNumber, paymentMethod, subtotalMinor, discountMinor, totalMinor }, items) {
  // Replays return the original creation result even if fulfillment or payment has since changed.
  return { orderId, orderNumber, items, subtotalMinor, discountMinor, totalMinor, paymentMethod,
    paymentStatus: paymentMethod === 'cash' ? 'unpaid' : 'payment_pending',
    fulfillmentStatus: 'placed', pickup: checkoutPickup(paymentMethod) }
}

export function createOrderService({ database, repository, cartCheckout, paymentSettings, clock = () => new Date() }) {
  async function readReplay(customerId, { keyHash, requestHash }) {
    const submission = await repository.findSubmission(customerId, keyHash)
    if (!submission) return null
    if (!submission.requestHash.equals(requestHash)) throw new OrderError('IDEMPOTENCY_CONFLICT')
    return creationResult(submission, await repository.readItems(submission.orderId))
  }

  return Object.freeze({
    async create(customerId, input, key) {
      identity(customerId)
      const request = submissionInput(input, key)
      const replay = await readReplay(customerId, request)
      if (replay) return replay

      const { paymentMethod, walletSenderNumber, expectedCartVersion, acceptedQuoteVersion, keyHash, requestHash } = request
      try {
        // READ-SET-001 uses its own connection and does not expose a transaction-bound read.
        const destination = await readCheckoutDestination(paymentSettings, paymentMethod)
        return await database.transaction(async (tx) => {
          const cart = await readCheckoutCart(cartCheckout, tx, customerId, expectedCartVersion)
          const snapshot = createOrderSnapshots(cart)
          if (checkoutQuoteVersion(customerId, cart, paymentMethod, destination, snapshot) !== acceptedQuoteVersion) {
            throw new OrderError('QUOTE_CHANGED')
          }
          const now = clock()
          const cashExpiresAt = paymentMethod === 'cash' ? new Date(now.getTime() + cashExpiryMs) : null
          const state = initialOrderState({ paymentMethod, cashExpiresAt }, now)
          const orderNumber = `PS-${randomUUID()}`
          const orderId = await repository.insert(tx, {
            customerId, orderNumber, walletSenderNumber, state, snapshot, keyHash, requestHash,
          })
          await cartCheckout.clearForCheckout(tx, cart)
          return creationResult({ orderId, orderNumber, paymentMethod, ...snapshot }, snapshot.items)
        })
      } catch (error) {
        // A concurrent submit may have committed while this attempt waited for CART or the unique key.
        // Check the durable result after rollback. Never rerun a failed write here.
        if (replayableErrors.has(error.code)) {
          const committed = await readReplay(customerId, request)
          if (committed) return committed
        }
        throw error
      }
    },
  })
}
