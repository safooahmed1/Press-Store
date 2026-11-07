import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import { localDatabaseTestsEnabled } from '../../../config/database-config.js'
import { createSessionRepository } from '../../../platform/auth/session-repository.js'
import { createSessionService } from '../../../platform/auth/sessions.js'
import { createDatabase } from '../../../platform/db/database.js'
import { loadMigrations } from '../../../platform/db/migration-files.js'
import { runMigrations } from '../../../platform/db/migrate.js'
import { startDisposableMysql } from '../../../platform/db/testing/disposable-mysql.js'
import { createCartCheckoutService } from '../../cart/services/checkout-carts.js'
import { createCartService } from '../../cart/services/carts.js'
import { createCartRepository } from '../../cart/repositories/carts.js'
import { createCatalogService } from '../../catalog/services/catalog.js'
import { createCatalogRepository } from '../../catalog/repositories/catalog.js'
import { createAdminCatalogService } from '../../catalog/services/admin-catalog.js'
import { createAdminCatalogRepository } from '../../catalog/repositories/admin-catalog.js'
import { createCheckoutQuoteService } from './checkout-quote.js'
import { createCheckoutQuoteRouter } from './checkout-quote-router.js'
import { startTestApp } from '../../../../../tests/helpers/http-server.js'

const wallet = '+201212345678'
const instapay = '+201512345678'
const settingsInput = { storeName: 'Quote fixture', storePhone: '+201012345678', whatsappPhone: '+201112345678',
  walletEgNumber: wallet, instaPayNumber: instapay, socialLinks: {} }
const realSettingsEnabled = localDatabaseTestsEnabled() && process.env.ORD_REAL_SETTINGS_TESTS === '1'

describe('orders checkout quote with live owner services', {
  skip: !realSettingsEnabled && 'Requires the isolated SET composition and disposable MySQL',
}, () => {
  let fixture, database, quoteService, sessions, settings, catalog, admin, carts, categoryId, brandId
  let customers = 0
  let images = 0

  before(async () => {
    // The authorized development composition supplies these exact SET modules only for this suite.
    const [{ createSettingsService }, { createSettingsRepository }] = await Promise.all([
      import('../../settings/services/settings.js'),
      import('../../settings/repositories/settings.js'),
    ])
    const migrations = await loadMigrations()
    assert.ok(migrations.some(({ name }) => name === 'set_001_create_store_settings.sql'))
    fixture = await startDisposableMysql()
    database = createDatabase(fixture.config)
    await runMigrations({ config: fixture.config, migrations })
    const storage = { withCompensation: async (upload, work) => work({ path: `quote-fixture-${++images}.png` }),
      urlFor: (name) => `/uploads/${name}`, async delete() {} }
    catalog = createCatalogService({ repository: createCatalogRepository(database), storage })
    admin = createAdminCatalogService({ repository: createAdminCatalogRepository(database), storage })
    carts = createCartService({ repository: createCartRepository(database), readVariants: catalog.readVariants })
    settings = createSettingsService({ repository: createSettingsRepository(database) })
    quoteService = createCheckoutQuoteService({ database, cartCheckout: createCartCheckoutService({ database }), paymentSettings: settings })
    sessions = createSessionService({ repository: createSessionRepository(database) })
    categoryId = (await catalog.createCategory({ name: 'Quote fixture' }, {})).id
    brandId = (await catalog.createBrand({ name: 'Quote fixture' })).id
  })

  after(async () => {
    try { await database?.close() } finally { await fixture?.stop() }
  })

  async function customer() {
    const phone = `+2011${String(++customers).padStart(8, '0')}`
    await database.query(`INSERT INTO customers (first_name, last_name, phone, password_hash, created_at, updated_at)
      VALUES ('Quote', 'Fixture', ?, 'synthetic fixture hash', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6))`, [phone])
    return (await database.query('SELECT customer_id AS id FROM customers WHERE phone = ?', [phone]))[0].id
  }

  async function customerCart() {
    const customerId = await customer()
    const productInput = { name: `Quote jacket ${customerId}`, description: 'Synthetic checkout quote fixture',
      categoryId, brandId, priceMinor: 10001, discountPercent: 12.5, variants: [{ color: 'Black', size: 'M' }] }
    const { productId } = await catalog.createProduct(productInput, [{}])
    const [{ variantId }] = (await admin.product(productId)).variants
    const cart = await carts.mutate(customerId, 'add', { variantId, quantity: 2, expectedCartVersion: 1 })
    return { customerId, productId, productInput, cart }
  }

  async function mountQuote(t) {
    const router = createCheckoutQuoteRouter({ database, config: { nodeEnv: 'test' }, quoteService })
    const { origin, logs } = await startTestApp(t, { manifests: [{ id: 'checkout', path: '/checkout', router }] })
    return {
      logs,
      async request(body, { cookie, path = '/api/v1/checkout/quote', headers = {} } = {}) {
        const response = await fetch(origin + path, { method: 'POST', body: JSON.stringify(body),
          headers: { 'content-type': 'application/json', origin, ...(cookie ? { cookie } : {}), ...headers } })
        return { status: response.status, body: await response.json(), headers: response.headers }
      },
    }
  }

  async function sessionCookie(actorId, actorType = 'customer') {
    const { token } = await sessions.create({ actorType, actorId })
    return `press-${actorType}=${token}`
  }

  it('handles cash before SET provisioning, then returns only the selected configured number for each electronic method', async (t) => {
    const { customerId, cart } = await customerCart()
    const { quote } = quoteService
    const input = { expectedCartVersion: cart.version }
    const cash = await quote(customerId, { ...input, paymentMethod: 'cash' })
    assert.equal(cash.totalMinor, 17502)
    assert.equal(cash.paymentDestination, null)
    assert.match(cash.pickup.cashCollectionNotice, /3–7 days/)
    await assert.rejects(quote(customerId, { ...input, paymentMethod: 'wallet_eg' }), { code: 'PAYMENT_SETTINGS_UNAVAILABLE' })
    const cookie = await sessionCookie(customerId)
    const { request, logs } = await mountQuote(t)
    const missing = await request({ ...input, paymentMethod: 'wallet_eg' }, { cookie })
    assert.equal(missing.status, 409)
    assert.equal(missing.body.error.code, 'PAYMENT_SETTINGS_UNAVAILABLE')
    const configured = await settings.save({ ...settingsInput, version: 0 })
    const walletQuote = await quote(customerId, { ...input, paymentMethod: 'wallet_eg' })
    const instaPayQuote = await quote(customerId, { ...input, paymentMethod: 'instapay' })
    assert.equal(walletQuote.paymentDestination, wallet)
    assert.equal(walletQuote.walletSenderNumberRequired, true)
    assert.equal(instaPayQuote.paymentDestination, instapay)
    assert.equal(instaPayQuote.walletSenderNumberRequired, false)
    assert.equal(walletQuote.pickup.cashCollectionNotice, null)
    assert.ok(!JSON.stringify(walletQuote).includes(instapay))
    assert.ok(!JSON.stringify(instaPayQuote).includes(wallet))

    await settings.save({ ...settingsInput, version: configured.version, walletEgNumber: '+201012345678' })
    const updated = await quote(customerId, { ...input, paymentMethod: 'wallet_eg' })
    assert.equal(updated.paymentDestination, '+201012345678')
    assert.notEqual(updated.quoteVersion, walletQuote.quoteVersion)
    assert.equal((await quote(customerId, { ...input, paymentMethod: 'instapay' })).quoteVersion, instaPayQuote.quoteVersion)
    for (const [paymentMethod, destination] of [['cash', null], ['wallet_eg', '+201012345678'], ['instapay', instapay]]) {
      const response = await request({ ...input, paymentMethod }, { cookie })
      assert.equal(response.status, 200)
      assert.equal(response.headers.get('cache-control'), 'no-store')
      assert.equal(response.headers.get('set-cookie'), null)
      assert.equal(response.body.data.quote.paymentDestination, destination)
      assert.equal(response.body.data.quote.totalMinor, 17502)
      assert.equal(response.body.data.quote.walletSenderNumberRequired, paymentMethod === 'wallet_eg')
    }
    const observed = JSON.stringify(logs)
    assert.ok(logs.length >= 4)
    for (const value of [cookie, '+201012345678', instapay]) assert.ok(!observed.includes(value))
    const unchanged = await carts.current(customerId)
    assert.equal(unchanged.version, cart.version)
    assert.equal(unchanged.items[0].quantity, 2)
  })

  it('revalidates a real CAT price change at the same cart version and rejects an unavailable variant', async () => {
    const { customerId, productId, productInput, cart } = await customerCart()
    const { quote } = quoteService
    const input = { expectedCartVersion: cart.version, paymentMethod: 'cash' }
    const original = await quote(customerId, input)
    await admin.writeProduct(productId, { ...productInput, priceMinor: 20001, discountPercent: 50, version: '1' }, [])
    const repriced = await quote(customerId, input)
    assert.equal(repriced.totalMinor, 20002)
    assert.equal(repriced.cartVersion, original.cartVersion)
    assert.notEqual(repriced.quoteVersion, original.quoteVersion)
    await admin.deleteProduct(productId, '2')
    await assert.rejects(quote(customerId, input), { code: 'VARIANT_UNAVAILABLE' })
    assert.equal((await carts.current(customerId)).version, cart.version)
  })

  it('rejects empty carts and stale versions without changing either customer cart', async () => {
    const { customerId, cart } = await customerCart()
    const { quote } = quoteService
    const other = await customer()
    await assert.rejects(quote(other, { expectedCartVersion: 1, paymentMethod: 'cash' }), { code: 'CART_EMPTY' })
    const changed = await carts.mutate(customerId, 'update', { quantity: 3, expectedCartVersion: cart.version }, cart.items[0].cartItemId)
    await assert.rejects(quote(customerId, { expectedCartVersion: cart.version, paymentMethod: 'cash' }), { code: 'QUOTE_CHANGED' })
    assert.equal((await carts.current(customerId)).version, changed.version)
    assert.equal((await carts.current(customerId)).items[0].quantity, 3)
  })

  it('enforces session scope, Origin, input and stale-cart errors at the HTTP boundary', async (t) => {
    const { customerId, cart } = await customerCart()
    const other = await customer()
    const cookie = await sessionCookie(customerId)
    const otherCookie = await sessionCookie(other)
    await database.query(`INSERT INTO admins (admin_id, phone, password_hash, created_at, updated_at)
      VALUES (1, '+201099999999', 'synthetic fixture hash', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6))`)
    const adminCookie = await sessionCookie('1', 'admin')
    const { request } = await mountQuote(t)
    const input = { expectedCartVersion: cart.version, paymentMethod: 'cash' }
    const cases = [
      [input, {}, 401, 'AUTH_REQUIRED'],
      [input, { cookie: adminCookie }, 403, 'FORBIDDEN'],
      [input, { cookie, headers: { origin: 'https://other.invalid' } }, 403, 'FORBIDDEN'],
      [input, { cookie, headers: { 'content-type': 'text/plain' } }, 415, 'UNSUPPORTED_MEDIA_TYPE'],
      [{ ...input, customerId: other }, { cookie }, 422, 'VALIDATION_FAILED'],
      [input, { cookie, path: '/api/v1/checkout/quote?customerId=2' }, 422, 'VALIDATION_FAILED'],
      [{ ...input, expectedCartVersion: 1 }, { cookie: otherCookie }, 409, 'CART_EMPTY'],
      [{ ...input, expectedCartVersion: 1 }, { cookie }, 409, 'QUOTE_CHANGED'],
    ]
    for (const [body, options, status, code] of cases) {
      const response = await request(body, options)
      assert.equal(response.status, status, code)
      assert.equal(response.body.error.code, code)
      assert.ok(response.body.error.requestId)
      assert.equal(response.headers.get('cache-control'), 'no-store')
    }
  })
})
