import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import { startServer } from '../../../app/start-server.js'
import { localDatabaseTestsEnabled } from '../../../config/database-config.js'
import { createSessionRepository } from '../../../platform/auth/session-repository.js'
import { createSessionService } from '../../../platform/auth/sessions.js'
import { createDatabase } from '../../../platform/db/database.js'
import { loadMigrations } from '../../../platform/db/migration-files.js'
import { runMigrations } from '../../../platform/db/migrate.js'
import { startDisposableMysql } from '../../../platform/db/testing/disposable-mysql.js'
import { createLogger } from '../../../platform/observability/logger.js'
import { createCartRepository } from '../../cart/repositories/carts.js'
import { createCartCheckoutService } from '../../cart/services/checkout-carts.js'
import { createCartService } from '../../cart/services/carts.js'
import { createAdminCatalogRepository } from '../../catalog/repositories/admin-catalog.js'
import { createCatalogRepository } from '../../catalog/repositories/catalog.js'
import { createAdminCatalogService } from '../../catalog/services/admin-catalog.js'
import { createCatalogService } from '../../catalog/services/catalog.js'
import { createSettingsRepository } from '../../settings/repositories/settings.js'
import { createSettingsService } from '../../settings/services/settings.js'
import { createOrderSubmissionRepository } from '../repositories/order-submissions.js'
import { createCheckoutQuoteService } from './checkout-quote.js'
import { createOrderService } from './order-create.js'
import { temporaryDirectory } from '../../../../../tests/helpers/temporary-directory.js'

const now = new Date('2026-11-07T12:00:00.000Z')
const settingsInput = { storeName: 'Order fixture', storePhone: '+201012345678', whatsappPhone: '+201112345678',
  walletEgNumber: '+201212345678', instaPayNumber: '+201512345678', socialLinks: {} }

describe('orders creation and replay on disposable MySQL', {
  skip: !localDatabaseTestsEnabled() && 'Requires disposable MySQL',
}, () => {
  let fixture, database, catalog, admin, carts, cartCheckout, settings, quote, repository, sessions, categoryId, brandId
  let customerSequence = 0
  let imageSequence = 0

  before(async () => {
    fixture = await startDisposableMysql()
    database = createDatabase({ ...fixture.config, connectionLimit: 8 })
    await runMigrations({ config: fixture.config, migrations: await loadMigrations() })
    const storage = { withCompensation: async (upload, work) => work({ path: `order-${++imageSequence}.png` }),
      urlFor: (name) => `/uploads/${name}`, async delete() {} }
    catalog = createCatalogService({ repository: createCatalogRepository(database), storage })
    admin = createAdminCatalogService({ repository: createAdminCatalogRepository(database), storage })
    carts = createCartService({ repository: createCartRepository(database), readVariants: catalog.readVariants })
    cartCheckout = createCartCheckoutService({ database })
    settings = createSettingsService({ repository: createSettingsRepository(database) })
    await settings.save({ ...settingsInput, version: 0 })
    quote = createCheckoutQuoteService({ database, cartCheckout, paymentSettings: settings }).quote
    repository = createOrderSubmissionRepository(database)
    sessions = createSessionService({ repository: createSessionRepository(database) })
    categoryId = (await catalog.createCategory({ name: 'Order fixture' }, {})).id
    brandId = (await catalog.createBrand({ name: 'Order fixture' })).id
  })
  after(async () => { try { await database?.close() } finally { await fixture?.stop() } })

  function service(overrides = {}) {
    return createOrderService({ database, repository, cartCheckout, paymentSettings: settings, clock: () => now, ...overrides })
  }

  async function customerCart() {
    const phone = `+2011${String(++customerSequence).padStart(8, '0')}`
    const customer = await database.query(`INSERT INTO customers
      (first_name, last_name, phone, password_hash, created_at, updated_at)
      VALUES ('Order', 'Fixture', ?, 'synthetic fixture hash', ?, ?)`, [phone, now, now])
    const customerId = String(customer.insertId)
    const productInput = { name: `Jacket ${customerId}`, description: 'Synthetic order fixture', categoryId, brandId,
      priceMinor: 10001, discountPercent: 12.5, variants: [{ color: 'Black', size: 'M' }] }
    const { productId } = await catalog.createProduct(productInput, [{}])
    const [{ variantId }] = (await admin.product(productId)).variants
    const cart = await carts.mutate(customerId, 'add', { variantId, quantity: 2, expectedCartVersion: 1 })
    return { customerId, productId, productInput, variantId, cart }
  }

  async function confirmation(customerId, cart, paymentMethod) {
    const expectedCartVersion = cart.version
    const { quoteVersion } = await quote(customerId, { paymentMethod, expectedCartVersion })
    return { paymentMethod, expectedCartVersion, acceptedQuoteVersion: quoteVersion,
      ...(paymentMethod === 'wallet_eg' ? { walletSenderNumber: '01112345678' } : {}) }
  }

  async function orderCount(customerId) {
    const [row] = await database.query('SELECT COUNT(*) AS count FROM orders WHERE customer_id = ?', [customerId])
    return Number(row.count)
  }

  it('persists exact snapshots, method-specific state and expiry, then clears the exact cart', async () => {
    for (const method of ['cash', 'wallet_eg', 'instapay']) {
      const { customerId, cart } = await customerCart()
      const input = await confirmation(customerId, cart, method)
      const orders = service()
      const result = await orders.create(customerId, input, 'same-key-per-customer')
      assert.equal(result.totalMinor, 17502)
      assert.equal(result.subtotalMinor, 20002)
      assert.equal(result.discountMinor, 2500)
      assert.equal(result.items[0].finalUnitPriceMinor, 8751)
      assert.equal(result.paymentStatus, method === 'cash' ? 'unpaid' : 'payment_pending')
      assert.equal(result.fulfillmentStatus, 'placed')
      assert.match(result.orderNumber, /^PS-/)
      const [stored] = await database.query(`SELECT wallet_sender_number, cash_expires_at
        FROM orders WHERE order_id = ? AND customer_id = ?`, [result.orderId, customerId])
      assert.equal(stored.wallet_sender_number, method === 'wallet_eg' ? '+201112345678' : null)
      assert.equal(stored.cash_expires_at?.toISOString() ?? null, method === 'cash' ? '2026-11-14T12:00:00.000Z' : null)
      const empty = await carts.current(customerId)
      assert.equal(empty.version, cart.version + 1)
      assert.deepEqual(empty.items, [])
      assert.deepEqual(await orders.create(customerId, input, 'same-key-per-customer'), result)
    }
  })

  it('returns the original result after a later cart, catalog edit, and payment change', async () => {
    const { customerId, cart, variantId, productId, productInput } = await customerCart()
    const input = await confirmation(customerId, cart, 'wallet_eg')
    const orders = service()
    const result = await orders.create(customerId, input, 'lost-response')
    const nextCart = await carts.mutate(customerId, 'add', { variantId, quantity: 1, expectedCartVersion: cart.version + 1 })
    await admin.writeProduct(productId, { ...productInput, priceMinor: 20000, version: '1' }, [])
    const settingsVersion = (await settings.admin()).version
    await settings.save({ ...settingsInput, version: settingsVersion, walletEgNumber: '+201012345678' })
    assert.deepEqual(await orders.create(customerId, { ...input, walletSenderNumber: '+201112345678' }, 'lost-response'), result)
    await assert.rejects(orders.create(customerId, { ...input, walletSenderNumber: '01100000000' }, 'lost-response'),
      { code: 'IDEMPOTENCY_CONFLICT' })
    assert.equal((await carts.current(customerId)).version, nextCart.version)
    assert.equal((await carts.current(customerId)).items[0].quantity, 1)
    assert.equal(await orderCount(customerId), 1)
  })

  it('rejects destination, price, version and availability changes without creating orders', async () => {
    const { customerId, cart, productId, productInput } = await customerCart()
    const orders = service()
    const wallet = await confirmation(customerId, cart, 'wallet_eg')
    const settingsVersion = (await settings.admin()).version
    await settings.save({ ...settingsInput, version: settingsVersion })
    await assert.rejects(orders.create(customerId, wallet, 'changed-destination'), { code: 'QUOTE_CHANGED' })
    const cash = await confirmation(customerId, cart, 'cash')
    await admin.writeProduct(productId, { ...productInput, priceMinor: 20000, version: '1' }, [])
    await assert.rejects(orders.create(customerId, cash, 'changed-price'), { code: 'QUOTE_CHANGED' })
    await assert.rejects(orders.create(customerId, { ...cash, expectedCartVersion: cart.version + 1 }, 'changed-cart'),
      { code: 'QUOTE_CHANGED' })
    await admin.deleteProduct(productId, '2')
    await assert.rejects(orders.create(customerId, cash, 'unavailable'), { code: 'VARIANT_UNAVAILABLE' })
    assert.equal(await orderCount(customerId), 0)
    assert.equal((await carts.current(customerId)).version, cart.version)
  })

  it('rolls back order, items, key and cart clear when a failure happens after the clear', async () => {
    const { customerId, cart } = await customerCart()
    const input = await confirmation(customerId, cart, 'cash')
    const failing = service({ cartCheckout: { ...cartCheckout, async clearForCheckout(tx, snapshot) {
      await cartCheckout.clearForCheckout(tx, snapshot)
      throw new Error('fixture failure after clear')
    } } })
    await assert.rejects(failing.create(customerId, input, 'rollback'), /fixture failure after clear/)
    assert.equal(await orderCount(customerId), 0)
    assert.equal((await carts.current(customerId)).version, cart.version)
    assert.equal((await carts.current(customerId)).items[0].quantity, 2)
    const retried = await service().create(customerId, input, 'rollback')
    assert.equal(retried.totalMinor, 17502)
    assert.equal(await orderCount(customerId), 1)
  })

  it('resolves simultaneous same-key requests and prevents two keys consuming one cart', async () => {
    function concurrentOrders() {
      const { promise, resolve } = Promise.withResolvers()
      let arrivals = 0
      return service({ cartCheckout: { ...cartCheckout, async readForCheckout(tx, input) {
        if (++arrivals === 2) resolve()
        await promise
        return cartCheckout.readForCheckout(tx, input)
      } } })
    }
    let orders = concurrentOrders()
    const { customerId, cart } = await customerCart()
    const input = await confirmation(customerId, cart, 'cash')
    const [first, second] = await Promise.all([
      orders.create(customerId, input, 'same'), orders.create(customerId, input, 'same'),
    ])
    assert.deepEqual(first, second)
    assert.equal(await orderCount(customerId), 1)

    orders = concurrentOrders()
    const other = await customerCart()
    const otherInput = await confirmation(other.customerId, other.cart, 'cash')
    const competing = await Promise.allSettled(['one', 'two'].map((key) => orders.create(other.customerId, otherInput, key)))
    assert.equal(competing.filter(({ status }) => status === 'fulfilled').length, 1)
    assert.equal(competing.find(({ status }) => status === 'rejected').reason.code, 'QUOTE_CHANGED')
    assert.equal(await orderCount(other.customerId), 1)

    orders = concurrentOrders()
    const wallet = await customerCart()
    const walletInput = await confirmation(wallet.customerId, wallet.cart, 'wallet_eg')
    const conflicting = await Promise.allSettled(['01112345678', '01100000000'].map((walletSenderNumber) =>
      orders.create(wallet.customerId, { ...walletInput, walletSenderNumber }, 'one-key')))
    assert.equal(conflicting.filter(({ status }) => status === 'fulfilled').length, 1)
    assert.equal(conflicting.find(({ status }) => status === 'rejected').reason.code, 'IDEMPOTENCY_CONFLICT')
    assert.equal(await orderCount(wallet.customerId), 1)
  })

  it('applies the HTTP session, input, and retry boundaries through normal server discovery', async (t) => {
    const { customerId, cart } = await customerCart()
    const logs = []
    const server = await startServer({
      config: { nodeEnv: 'test', port: 0 },
      databaseConfig: fixture.config,
      storageConfig: { root: await temporaryDirectory(t) },
      logger: createLogger({ environment: 'test', sink: (line) => logs.push(line) }),
    })
    t.after(async () => {
      try {
        server.closeAllConnections()
        await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
      } finally {
        await server.closeDatabase()
      }
    })
    const origin = `http://127.0.0.1:${server.address().port}`
    const { token } = await sessions.create({ actorType: 'customer', actorId: customerId })
    const input = await confirmation(customerId, cart, 'wallet_eg')
    const cookie = `press-customer=${token}`
    const key = 'order-http-secret-key'
    const request = async (body, headers, path = '/api/v1/orders') => {
      const response = await fetch(origin + path, { method: 'POST', body: JSON.stringify(body),
        headers: { 'content-type': 'application/json', origin, ...headers } })
      return { status: response.status, cache: response.headers.get('cache-control'), body: await response.json() }
    }
    const authenticated = { cookie, 'idempotency-key': key }
    for (const [body, headers, path, status, code] of [
      [input, { 'idempotency-key': key }, undefined, 401, 'AUTH_REQUIRED'],
      [input, { ...authenticated, origin: 'https://other.invalid' }, undefined, 403, 'FORBIDDEN'],
      [input, { cookie }, undefined, 422, 'VALIDATION_FAILED'],
      [input, { ...authenticated, 'idempotency-key': 'first, second' }, undefined, 422, 'VALIDATION_FAILED'],
      [input, authenticated, '/api/v1/orders?customerId=2', 422, 'VALIDATION_FAILED'],
      [{ ...input, walletSenderNumber: undefined }, authenticated, undefined, 422, 'VALIDATION_FAILED'],
      [{ ...input, expectedCartVersion: undefined }, authenticated, undefined, 422, 'VALIDATION_FAILED'],
      [{ ...input, totalMinor: 1 }, authenticated, undefined, 422, 'VALIDATION_FAILED'],
    ]) {
      const response = await request(body, headers, path)
      assert.equal(response.status, status)
      assert.equal(response.body.error.code, code)
    }
    assert.equal(await orderCount(customerId), 0)
    const created = await request(input, authenticated)
    assert.equal(created.status, 201)
    assert.equal(created.cache, 'no-store')
    assert.deepEqual(await request(input, authenticated), created)
    const conflict = await request({ ...input, walletSenderNumber: '01100000000' }, authenticated)
    assert.equal(conflict.status, 409)
    assert.equal(conflict.body.error.code, 'IDEMPOTENCY_CONFLICT')
    for (const secret of [key, token, '+201112345678', input.walletSenderNumber]) {
      assert.ok(!JSON.stringify(logs).includes(secret))
      assert.ok(!JSON.stringify(created).includes(secret))
    }
  })
})
