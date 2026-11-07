import { createHash } from 'node:crypto'
import { createOrderSnapshots } from '../domain/order-snapshots.js'
import { fields, identity, OrderError, version } from '../domain/order-values.js'

const methods = ['cash', 'wallet_eg', 'instapay']
const preparationMinutes = Object.freeze({ min: 10, max: 60, typical: 30 })
const cashCollectionNotice = 'Collect your order within 3–7 days or it will be cancelled.'

export function checkoutPaymentMethod(value) {
  if (!methods.includes(value)) throw new OrderError('VALIDATION_FAILED')
  return value
}

export async function readCheckoutCart(cartCheckout, tx, customerId, expectedCartVersion) {
  try {
    return await cartCheckout.readForCheckout(tx, { customerId, expectedCartVersion })
  } catch (error) {
    if (error.code === 'CART_CONFLICT') throw new OrderError('QUOTE_CHANGED')
    throw error
  }
}

export async function readCheckoutDestination(paymentSettings, method) {
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

export function checkoutQuoteVersion(customerId, cart, paymentMethod, paymentDestination, snapshot) {
  return createHash('sha256').update(JSON.stringify([
    'checkout-quote-v1', customerId, cart.cartId, cart.version, paymentMethod, paymentDestination, snapshot,
  ])).digest('hex')
}

export function checkoutPickup(paymentMethod) {
  return Object.freeze({ preparationMinutes, cashCollectionNotice: paymentMethod === 'cash' ? cashCollectionNotice : null })
}

export function createCheckoutQuoteService({ database, cartCheckout, paymentSettings }) {
  return Object.freeze({
    async quote(customerId, input) {
      identity(customerId)
      fields(input, ['paymentMethod', 'expectedCartVersion'])
      const { paymentMethod, expectedCartVersion } = input
      checkoutPaymentMethod(paymentMethod)
      version(expectedCartVersion)

      const cart = await database.transaction((tx) => readCheckoutCart(cartCheckout, tx, customerId, expectedCartVersion))
      const snapshot = createOrderSnapshots(cart)
      // SET uses its own pool read. Release CART/CAT locks before requesting the destination.
      const paymentDestination = await readCheckoutDestination(paymentSettings, paymentMethod)
      const quoteVersion = checkoutQuoteVersion(customerId, cart, paymentMethod, paymentDestination, snapshot)
      return Object.freeze({
        ...snapshot,
        cartVersion: cart.version,
        quoteVersion,
        paymentMethod,
        paymentDestination,
        walletSenderNumberRequired: paymentMethod === 'wallet_eg',
        pickup: checkoutPickup(paymentMethod),
      })
    },
  })
}
