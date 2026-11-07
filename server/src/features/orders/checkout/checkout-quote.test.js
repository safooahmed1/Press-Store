import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createCheckoutQuoteService } from './checkout-quote.js'

const destinations = { cash: null, wallet_eg: '+201212345678', instapay: '+201512345678' }
const input = { paymentMethod: 'cash', expectedCartVersion: 2 }

function cartSnapshot() {
  return { cartId: '3', version: 2, subtotalMinor: 20002, discountMinor: 2500, totalMinor: 17502,
    items: [{ cartItemId: '4', productId: '5', variantId: '6', productName: 'Jacket', color: 'Black', size: 'M',
      quantity: 2, priceMinor: 10001, discountPercent: 12.5, currentUnitPriceMinor: 8751 }] }
}

function setup() {
  const calls = []
  const tx = Object.freeze({})
  const state = { cart: cartSnapshot(), payment: (method) => ({ paymentMethod: method, number: destinations[method] }) }
  const service = createCheckoutQuoteService({
    database: { async transaction(work) {
      calls.push('begin')
      try { return await work(tx) } finally { calls.push('release') }
    } },
    cartCheckout: { async readForCheckout(handle, request) {
      assert.equal(handle, tx)
      calls.push(request)
      if (state.cart instanceof Error) throw state.cart
      return state.cart
    } },
    paymentSettings: { async payment(method) { calls.push(method); return state.payment(method) } },
  })
  return { service, state, calls }
}

function errorWithCode(code) {
  return Object.assign(new Error('Synthetic owner error'), { code })
}

describe('orders checkout quote', () => {
  it('uses the session customer and expected cart version, with exact immutable money and pickup guidance', async () => {
    const { service, calls } = setup()
    const quote = await service.quote('1', input)
    assert.deepEqual(calls, ['begin', { customerId: '1', expectedCartVersion: 2 }, 'release', 'cash'])
    assert.equal(quote.cartVersion, 2)
    assert.equal(quote.subtotalMinor, 20002)
    assert.equal(quote.discountMinor, 2500)
    assert.equal(quote.totalMinor, 17502)
    assert.equal(quote.items[0].finalUnitPriceMinor, 8751)
    assert.equal(quote.paymentDestination, null)
    assert.equal(quote.walletSenderNumberRequired, false)
    assert.deepEqual(quote.pickup.preparationMinutes, { min: 10, max: 60, typical: 30 })
    assert.match(quote.pickup.cashCollectionNotice, /3–7 days/)
    assert.ok(Object.isFrozen(quote.items[0]))
    assert.ok(Object.isFrozen(quote.pickup))
  })

  it('returns only the selected electronic destination and requests a sender number only for Wallet confirmation', async () => {
    const { service, calls } = setup()
    for (const paymentMethod of ['wallet_eg', 'instapay']) {
      const quote = await service.quote('1', { ...input, paymentMethod })
      assert.equal(quote.paymentMethod, paymentMethod)
      assert.equal(quote.paymentDestination, destinations[paymentMethod])
      assert.equal(quote.walletSenderNumberRequired, paymentMethod === 'wallet_eg')
      assert.equal(quote.pickup.cashCollectionNotice, null)
      const other = paymentMethod === 'wallet_eg' ? 'instapay' : 'wallet_eg'
      assert.ok(!JSON.stringify(quote).includes(destinations[other]))
    }
    assert.deepEqual(calls.filter((call) => Object.hasOwn(destinations, call)), ['wallet_eg', 'instapay'])
  })

  it('validates the quote body and customer before either owner is called', async () => {
    const { service, calls } = setup()
    for (const change of [{ paymentMethod: 'card' }, { expectedCartVersion: '2' }, { expectedCartVersion: 0 },
      { customerId: '2' }, { totalMinor: 1 }, { walletSenderNumber: '01212345678' }, { acceptedQuoteVersion: 'fake' }]) {
      await assert.rejects(service.quote('1', { ...input, ...change }), { code: 'VALIDATION_FAILED' })
    }
    await assert.rejects(service.quote('01', input), { code: 'VALIDATION_FAILED' })
    assert.deepEqual(calls, [])
  })

  it('maps stale carts and unavailable settings without masking other owner failures', async () => {
    const { service, state, calls } = setup()
    const original = state.cart
    for (const [ownerCode, expected] of [['CART_CONFLICT', 'QUOTE_CHANGED'], ['CART_EMPTY', 'CART_EMPTY'],
      ['VARIANT_UNAVAILABLE', 'VARIANT_UNAVAILABLE'], ['CATALOG_UNAVAILABLE', 'CATALOG_UNAVAILABLE']]) {
      state.cart = errorWithCode(ownerCode)
      await assert.rejects(service.quote('1', input), { code: expected })
    }
    assert.ok(!calls.includes('cash'))
    state.cart = original
    state.payment = () => { throw errorWithCode('SETTINGS_UNAVAILABLE') }
    await assert.rejects(service.quote('1', { ...input, paymentMethod: 'wallet_eg' }), { code: 'PAYMENT_SETTINGS_UNAVAILABLE' })
    const outage = errorWithCode('DB_UNAVAILABLE')
    state.payment = () => { throw outage }
    await assert.rejects(service.quote('1', input), (error) => error === outage)
  })

  it('fails closed if settings returns a malformed or different method destination', async () => {
    const { service, state } = setup()
    for (const payment of [null, { paymentMethod: 'instapay', number: destinations.instapay },
      { paymentMethod: 'wallet_eg', number: null }, { paymentMethod: 'wallet_eg', number: 'invalid' }]) {
      state.payment = () => payment
      await assert.rejects(service.quote('1', { ...input, paymentMethod: 'wallet_eg' }), { code: 'PAYMENT_SETTINGS_UNAVAILABLE' })
    }
    state.payment = () => ({ paymentMethod: 'cash', number: destinations.wallet_eg })
    await assert.rejects(service.quote('1', input), { code: 'PAYMENT_SETTINGS_UNAVAILABLE' })
  })

  it('binds the opaque change detector to customer, cart version, price and selected destination', async () => {
    const { service, state } = setup()
    const electronic = { ...input, paymentMethod: 'wallet_eg' }
    const quote = await service.quote('1', electronic)
    assert.match(quote.quoteVersion, /^[a-f0-9]{64}$/)
    assert.equal((await service.quote('1', electronic)).quoteVersion, quote.quoteVersion)
    assert.notEqual((await service.quote('2', electronic)).quoteVersion, quote.quoteVersion)
    assert.notEqual((await service.quote('1', input)).quoteVersion, quote.quoteVersion)
    state.payment = (method) => ({ paymentMethod: method, number: '+201012345678' })
    assert.notEqual((await service.quote('1', electronic)).quoteVersion, quote.quoteVersion)
    state.payment = (method) => ({ paymentMethod: method, number: destinations[method] })
    state.cart.version = 3
    assert.notEqual((await service.quote('1', { ...electronic, expectedCartVersion: 3 })).quoteVersion, quote.quoteVersion)
    state.cart.version = 2
    state.cart.items[0].currentUnitPriceMinor = 9000
    state.cart.totalMinor = 18000
    state.cart.discountMinor = 2002
    assert.notEqual((await service.quote('1', electronic)).quoteVersion, quote.quoteVersion)
  })
})
