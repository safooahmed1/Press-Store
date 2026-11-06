import assert from 'node:assert/strict'
import { before, after, describe, it } from 'node:test'
import { localDatabaseTestsEnabled } from '../../../config/database-config.js'
import { createDatabase } from '../../../platform/db/database.js'
import { loadMigrations } from '../../../platform/db/migration-files.js'
import { runMigrations } from '../../../platform/db/migrate.js'
import { startDisposableMysql } from '../../../platform/db/testing/disposable-mysql.js'
import { createCatalogService } from '../../catalog/services/catalog.js'
import { createCatalogRepository } from '../../catalog/repositories/catalog.js'
import { createAdminCatalogService } from '../../catalog/services/admin-catalog.js'
import { createAdminCatalogRepository } from '../../catalog/repositories/admin-catalog.js'
import { createCartService } from './carts.js'
import { createCartRepository } from '../repositories/carts.js'
import { createCartCheckoutService } from './checkout-carts.js'
import { countQueries } from '../../../../../tests/helpers/query-counter.js'

describe('cart checkout real MySQL readiness, locks and transaction rollback', {
  skip: !localDatabaseTestsEnabled() && 'Requires new disposable MySQL only',
}, () => {
  let fixture, database, competitor, catalog, admin, competingAdmin, checkout, carts, competingCarts, categoryId, brandId
  let sequence = 0, imageSequence = 0
  before(async () => {
    fixture = await startDisposableMysql()
    database = createDatabase(fixture.config)
    competitor = createDatabase(fixture.config)
    await runMigrations({ config: fixture.config, migrations: await loadMigrations() })
    // Image transport is not the rule under test; only this fixture uses synthetic stored paths.
    const storage = { withCompensation: async (upload, work) => work({ path: `checkout-fixture-${++imageSequence}.png` }),
      urlFor: (name) => `/uploads/${name}`, async delete() {} }
    catalog = createCatalogService({ repository: createCatalogRepository(database), storage })
    admin = createAdminCatalogService({ repository: createAdminCatalogRepository(database), storage })
    competingAdmin = createAdminCatalogService({ repository: createAdminCatalogRepository(competitor), storage })
    checkout = createCartCheckoutService({ database })
    carts = createCartService({ repository: createCartRepository(database), readVariants: catalog.readVariants })
    const otherCatalog = createCatalogService({ repository: createCatalogRepository(competitor) })
    competingCarts = createCartService({ repository: createCartRepository(competitor), readVariants: otherCatalog.readVariants })
    categoryId = (await catalog.createCategory({ name: 'Checkout fixture' }, {})).id
    brandId = (await catalog.createBrand({ name: 'Checkout fixture' })).id
  })
  after(async () => {
    try { await competitor?.close() } finally {
      try { await database?.close() } finally { await fixture?.stop() }
    }
  })
  async function customer() {
    const phone = `+2011${String(++sequence).padStart(8, '0')}`
    await database.query(`INSERT INTO customers (first_name, last_name, phone, password_hash, created_at, updated_at)
      VALUES ('Checkout', 'Fixture', ?, 'synthetic fixture hash', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6))`, [phone])
    return (await database.query('SELECT customer_id AS id FROM customers WHERE phone = ?', [phone]))[0].id
  }
  async function setup(options = {}) {
    const customerId = await customer()
    const input = { name: `Checkout jacket ${++sequence}`, description: 'Synthetic checkout fixture', categoryId, brandId,
      priceMinor: options.priceMinor ?? 10001, discountPercent: options.discountPercent ?? 12.5,
      variants: Array.from({ length: options.lines ?? 1 }, (_, i) => ({ color: `Black ${i}`, size: 'M', isAvailable: true })) }
    const product = await catalog.createProduct(input, [{}])
    const detail = await admin.product(product.productId)
    const ids = detail.variants.map((row) => row.variantId)
    const cart = await carts.mutate(customerId, 'add', { variantId: ids[0], quantity: 2, expectedCartVersion: 1 })
    return { customerId, productId: product.productId, productInput: input, ids, cart,
      input: { customerId, expectedCartVersion: cart.version } }
  }
  it('reads exact immutable history data and clears only its cart/version on outer commit', async () => {
    const ctx = await setup()
    const beforeProduct = await admin.product(ctx.productId)
    await database.transaction(async (tx) => {
      const snapshot = await checkout.readForCheckout(tx, ctx.input)
      assert.equal(snapshot.items[0].productName, ctx.productInput.name)
      assert.equal(snapshot.subtotalMinor, 20002)
      assert.equal(snapshot.totalMinor, 17502)
      assert.equal(snapshot.discountMinor, 2500)
      assert.throws(() => { snapshot.items[0].quantity = 99 }, TypeError)
      assert.deepEqual(await checkout.clearForCheckout(tx, snapshot), { cartId: ctx.cart.cartId, version: 3 })
    })
    const current = await carts.current(ctx.customerId)
    assert.deepEqual(current.items, [])
    assert.equal(current.version, 3)
    assert.deepEqual(await admin.product(ctx.productId), beforeProduct)
  })
  it('rejects missing/empty carts and another customer without creating or consuming a cart', async () => {
    const ctx = await setup()
    const other = await customer()
    await assert.rejects(database.transaction((tx) => checkout.readForCheckout(tx,
      { customerId: other, expectedCartVersion: 1 })), { code: 'CART_EMPTY' })
    assert.equal((await database.query('SELECT COUNT(*) AS count FROM carts WHERE customer_id = ?', [other]))[0].count, '0')
    await carts.current(other)
    await assert.rejects(database.transaction((tx) => checkout.readForCheckout(tx,
      { customerId: other, expectedCartVersion: 1 })), { code: 'CART_EMPTY' })
    assert.equal((await carts.current(ctx.customerId)).items[0].quantity, 2)
  })
  it('rejects a stale version after another tab commits an edit', async () => {
    const ctx = await setup()
    await competingCarts.mutate(ctx.customerId, 'update', { quantity: 3, expectedCartVersion: 2 }, ctx.cart.items[0].cartItemId)
    await assert.rejects(database.transaction((tx) => checkout.readForCheckout(tx, ctx.input)), { code: 'CART_CONFLICT' })
    assert.equal((await carts.current(ctx.customerId)).items[0].quantity, 3)
  })
  it('revalidates real admin prices, removed variants and soft deletion before issuing a handoff', async () => {
    const ctx = await setup()
    await admin.writeProduct(ctx.productId, { ...ctx.productInput, version: '1', priceMinor: 20001, discountPercent: 50 }, [])
    await database.transaction(async (tx) => {
      const snapshot = await checkout.readForCheckout(tx, ctx.input)
      assert.equal(snapshot.items[0].currentUnitPriceMinor, 10001)
      assert.equal(snapshot.totalMinor, 20002)
    })
    await admin.writeProduct(ctx.productId, { ...ctx.productInput, version: '2', variants: [] }, [])
    await assert.rejects(database.transaction((tx) => checkout.readForCheckout(tx, ctx.input)), { code: 'VARIANT_UNAVAILABLE' })
    await admin.deleteProduct(ctx.productId, '3')
    await assert.rejects(database.transaction((tx) => checkout.readForCheckout(tx, ctx.input)), { code: 'VARIANT_UNAVAILABLE' })
    assert.equal((await carts.current(ctx.customerId)).items[0].quantity, 2)
  })
  it('holds cart/product/variant locks until the outer transaction ends, then releases them', async () => {
    const ctx = await setup()
    const probes = [
      ['SELECT cart_id FROM carts WHERE cart_id = ? FOR UPDATE NOWAIT', ctx.cart.cartId],
      ['SELECT product_id FROM products WHERE product_id = ? FOR UPDATE NOWAIT', ctx.productId],
      ['SELECT variant_id FROM product_variants WHERE variant_id = ? FOR UPDATE NOWAIT', ctx.ids[0]],
    ]
    await database.transaction(async (tx) => {
      await checkout.readForCheckout(tx, ctx.input)
      for (const [sql, id] of probes) {
        await assert.rejects(competitor.transaction((other) => other.query(sql, [id])), { code: 'DB_QUERY_FAILED' })
      }
    })
    // The identical SQL must succeed afterwards, ruling out syntax/privilege errors as the reason above.
    for (const [sql, id] of probes) assert.equal((await competitor.transaction((other) => other.query(sql, [id]))).length, 1)
  })
  it('uses current locking reads even after the caller established an older consistent snapshot', async () => {
    const ctx = await setup()
    await database.transaction(async (tx) => {
      const [old] = await tx.query('SELECT price_minor FROM products WHERE product_id = ?', [ctx.productId])
      assert.equal(old.price_minor, '10001')
      await competingAdmin.writeProduct(ctx.productId,
        { ...ctx.productInput, version: '1', priceMinor: 20001, discountPercent: 50 }, [])
      const snapshot = await checkout.readForCheckout(tx, ctx.input)
      assert.equal(snapshot.items[0].priceMinor, 20001)
      assert.equal(snapshot.items[0].currentUnitPriceMinor, 10001)
    })
  })
  it('rejects cloned/cross-transaction/cross-service/replayed snapshots without a second clear', async () => {
    const ctx = await setup()
    const otherService = createCartCheckoutService({ database: competitor })
    await database.transaction(async (tx) => {
      const snapshot = await checkout.readForCheckout(tx, ctx.input)
      await assert.rejects(checkout.clearForCheckout(tx, { ...snapshot }), { code: 'CART_CONFLICT' })
      await assert.rejects(competitor.transaction((other) => checkout.clearForCheckout(other, snapshot)), { code: 'CART_CONFLICT' })
      await assert.rejects(otherService.clearForCheckout(tx, snapshot), { code: 'CART_CONFLICT' })
      await checkout.clearForCheckout(tx, snapshot)
      await assert.rejects(checkout.clearForCheckout(tx, snapshot), { code: 'CART_CONFLICT' })
    })
    assert.equal((await carts.current(ctx.customerId)).version, 3)
  })
  it('cannot reuse a snapshot after its original transaction has finished', async () => {
    const ctx = await setup()
    let original, snapshot
    await database.transaction(async (tx) => { original = tx; snapshot = await checkout.readForCheckout(tx, ctx.input) })
    await assert.rejects(database.transaction((tx) => checkout.clearForCheckout(tx, snapshot)), { code: 'CART_CONFLICT' })
    await assert.rejects(checkout.clearForCheckout(original, snapshot), { code: 'DB_TRANSACTION_FAILED' })
    assert.equal((await carts.current(ctx.customerId)).items[0].quantity, 2)
  })
  it('restores the entire cart/version if later consumer work fails after clear', async () => {
    const ctx = await setup()
    const failed = new Error('intentional consumer failure, no ORD implementation')
    await assert.rejects(database.transaction(async (tx) => {
      const snapshot = await checkout.readForCheckout(tx, ctx.input)
      await checkout.clearForCheckout(tx, snapshot)
      throw failed
    }), (error) => error === failed)
    assert.deepEqual(await carts.current(ctx.customerId), ctx.cart)
  })
  it('rolls back clear even when the caller catches a later SQL constraint failure', async () => {
    const ctx = await setup()
    await assert.rejects(database.transaction(async (tx) => {
      const snapshot = await checkout.readForCheckout(tx, ctx.input)
      await checkout.clearForCheckout(tx, snapshot)
      await assert.rejects(tx.query(`INSERT INTO cart_items (cart_id, variant_id, quantity, current_unit_price_minor, created_at, updated_at)
        VALUES (?, ?, 0, 0, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6))`, [ctx.cart.cartId, ctx.ids[0]]), { code: 'DB_CONSTRAINT_FAILED' })
    }), { code: 'DB_TRANSACTION_FAILED' })
    assert.deepEqual(await carts.current(ctx.customerId), ctx.cart)
  })
  it('rejects an old-tab mutation after the locked cart is consumed', async () => {
    const ctx = await setup()
    let pending
    await database.transaction(async (tx) => {
      const snapshot = await checkout.readForCheckout(tx, ctx.input)
      pending = competingCarts.mutate(ctx.customerId, 'update', { quantity: 3, expectedCartVersion: 2 },
        ctx.cart.items[0].cartItemId).then(() => null, (error) => error)
      await checkout.clearForCheckout(tx, snapshot)
    })
    assert.equal((await pending).code, 'CART_CONFLICT')
    const current = await carts.current(ctx.customerId)
    assert.equal(current.version, 3)
    assert.deepEqual(current.items, [])
  })
  it('performs a bounded five-query handoff for a 100-line cart without N+1 catalog reads', async () => {
    const ctx = await setup({ lines: 100 })
    let version = 2
    for (const variantId of ctx.ids.slice(1)) {
      await carts.mutate(ctx.customerId, 'add', { variantId, quantity: 1, expectedCartVersion: version++ })
    }
    const counter = countQueries(database)
    const snapshot = await counter.transaction((tx) => checkout.readForCheckout(tx,
      { customerId: ctx.customerId, expectedCartVersion: version }))
    assert.equal(snapshot.items.length, 100)
    assert.equal(counter.count, 5)
  })
  it('rejects unsafe base subtotal without consuming a cart whose final price is zero', async () => {
    const ctx = await setup({ priceMinor: Number.MAX_SAFE_INTEGER, discountPercent: 100 })
    await assert.rejects(database.transaction((tx) => checkout.readForCheckout(tx, ctx.input)), { code: 'VALIDATION_FAILED' })
    assert.equal((await carts.current(ctx.customerId)).items[0].quantity, 2)
  })
})
