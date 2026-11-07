import { createHash } from 'node:crypto'
import { createOrderSnapshots } from '../domain/order-snapshots.js'
import { fields, identity, OrderError, version } from '../domain/order-values.js'

const methods = ['cash', 'wallet_eg', 'instapay']
const preparationMinutes = Object.freeze({ min: 10, max: 60, typical: 30 })
const cashCollectionNotice = 'Collect your order within 3–7 days or it will be cancelled.'

async function readCartSnapshot(database, cartCheckout, customerId, expectedCartVersion) {
  try {
    return await database.transaction((tx) => cartCheckout.readForCheckout(tx, { customerId, expectedCartVersion }))
  } catch (error) {
    if (error.code === 'CART_CONFLICT') throw new OrderError('QUOTE_CHANGED')
    throw error
  }
}

async function readDestination(paymentSettings, method) {
  let payment
  try {
    payment = await paymentSettings.payment(method)
  } catch (error) {
    if (error.code === 'SETTINGS_UNAVAILABLE') throw new OrderError('PAYMENT_SETTINGS_UNAVAILABLE')
    throw error
  }
  if (payment?.paymentMethod !== method
    || (method === 'cash' ? payment.number !== null : typeof payment.number !== 'string' || !/^\+201[0-9]{9}$/.test(payment.number))) {
    throw new OrderError('PAYMENT_SETTINGS_UNAVAILABLE')
  }
  return payment.number
}

export function createCheckoutQuoteService({ database, cartCheckout, paymentSettings }) {
  return Object.freeze({
    async quote(customerId, input) {
      identity(customerId)
      fields(input, ['paymentMethod', 'expectedCartVersion'])
      const { paymentMethod, expectedCartVersion } = input
      if (!methods.includes(paymentMethod)) throw new OrderError('VALIDATION_FAILED')
      version(expectedCartVersion)

      const cart = await readCartSnapshot(database, cartCheckout, customerId, expectedCartVersion)
      const snapshot = createOrderSnapshots(cart)
      // SET uses its own pool read. Release CART/CAT locks before requesting the destination.
      const paymentDestination = await readDestination(paymentSettings, paymentMethod)
      // Change detector only. Order creation must authenticate and recompute from fresh owner data.
      const quoteVersion = createHash('sha256').update(JSON.stringify([
        'checkout-quote-v1', customerId, cart.cartId, cart.version, paymentMethod, paymentDestination, snapshot,
      ])).digest('hex')
      return Object.freeze({
        ...snapshot,
        cartVersion: cart.version,
        quoteVersion,
        paymentMethod,
        paymentDestination,
        walletSenderNumberRequired: paymentMethod === 'wallet_eg',
        pickup: Object.freeze({ preparationMinutes, cashCollectionNotice: paymentMethod === 'cash' ? cashCollectionNotice : null }),
      })
    },
  })
}
