import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
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
import { initialOrderState, transitionOrder } from './order-state.js'
import { createOrderSnapshots } from './order-snapshots.js'

const now = new Date('2026-11-06T10:00:00.000Z')
const deadline = new Date('2026-11-07T10:00:00.000Z') // Synthetic test value; A-001 is not selected.
const adminActor = { actorType: 'admin', actorId: '1' }
const initial = (paymentMethod) => initialOrderState({ paymentMethod,
  ...(paymentMethod === 'cash' ? { cashExpiresAt: deadline } : {}) }, now)
async function pendingMigrations() {
  const directory = new URL('../migrations/pending/', import.meta.url)
  return Promise.all((await readdir(directory)).filter((name) => name.endsWith('.sql')).sort()
    .map(async (name) => ({ name, sql: await readFile(new URL(name, directory), 'utf8') })))
}
const stateColumns = { paymentMethod: 'payment_method', paymentStatus: 'payment_status', fulfillmentStatus: 'fulfillment_status',
  version: 'version', cashExpiresAt: 'cash_expires_at', paidAt: 'paid_at', verifiedByAdminId: 'verified_by_admin_id',
  preparedAt: 'prepared_at', preparedByAdminId: 'prepared_by_admin_id', deliveredAt: 'delivered_at',
  deliveredByAdminId: 'delivered_by_admin_id', cancelledAt: 'cancelled_at', createdAt: 'created_at', updatedAt: 'updated_at' }
function storedState(state) {
  return Object.fromEntries(Object.entries(stateColumns).map(([key, column]) =>
    [column, key.endsWith('At') && state[key] !== null ? new Date(state[key]) : state[key]]))
}

describe('orders core schema and immutable snapshots on disposable MySQL', {
  skip: !localDatabaseTestsEnabled() && 'Requires new disposable MySQL only',
}, () => {
  let fixture, database, customers, productId, variantId, catalogAdmin, productInput
  let sequence = 0
  before(async () => {
    fixture = await startDisposableMysql()
    database = createDatabase(fixture.config)
    const baseline = await loadMigrations()
    assert.ok(baseline.every(({ name }) => !name.startsWith('store-orders_')))
    await runMigrations({ config: fixture.config, migrations: [...baseline, ...await pendingMigrations()] })
    await database.query(`INSERT INTO admins (admin_id, phone, password_hash, created_at, updated_at)
      VALUES (1, '+201012345678', 'synthetic fixture hash', ?, ?)`, [now, now])
    for (const phone of ['+201112345678', '+201212345678']) {
      await database.query(`INSERT INTO customers (first_name, last_name, phone, password_hash, created_at, updated_at)
        VALUES ('Order', 'Fixture', ?, 'synthetic fixture hash', ?, ?)`, [phone, now, now])
    }
    customers = (await database.query('SELECT customer_id FROM customers ORDER BY customer_id')).map((row) => row.customer_id)
    let image = 0
    const storage = { withCompensation: async (upload, work) => work({ path: `orders-fixture-${++image}.png` }),
      urlFor: (name) => `/uploads/${name}`, async delete() {} }
    const catalog = createCatalogService({ repository: createCatalogRepository(database), storage })
    catalogAdmin = createAdminCatalogService({ repository: createAdminCatalogRepository(database), storage })
    const categoryId = (await catalog.createCategory({ name: 'Order fixture' }, {})).id
    const brandId = (await catalog.createBrand({ name: 'Order fixture' })).id
    productInput = { name: 'Historical jacket', description: 'Synthetic historical fixture', categoryId, brandId,
      priceMinor: 10001, discountPercent: 12.5, variants: [{ color: 'Black', size: 'M' }] }
    productId = (await catalog.createProduct(productInput, [{}])).productId
    variantId = (await catalogAdmin.product(productId)).variants[0].variantId
  })
  after(async () => { try { await database?.close() } finally { await fixture?.stop() } })
  async function insertOrder({ method = 'cash', customerId = customers[0], state = initial(method), overrides = {} } = {}, handle = database) {
    const data = { order_number: `PS-TEST-${++sequence}`, customer_id: customerId,
      wallet_sender_number: method === 'wallet_eg' ? '+201112345678' : null,
      subtotal_minor: 20002, discount_minor: 2500, total_minor: 17502, ...storedState(state), ...overrides }
    const keys = Object.keys(data)
    const result = await handle.query(`INSERT INTO orders (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`, Object.values(data))
    return { orderId: String(result.insertId), customerId, state, orderNumber: data.order_number }
  }
  function snapshot() {
    // Synthetic trusted cart input for the ORD-001 model, not an ORD-003 checkout/API proof.
    return createOrderSnapshots({ cartId: '1', version: 2, items: [{ cartItemId: '2', productId, variantId,
      productName: 'Historical jacket', color: 'Black', size: 'M', quantity: 2, priceMinor: 10001,
      currentUnitPriceMinor: 8751, discountPercent: 12.5 }], subtotalMinor: 20002, discountMinor: 2500, totalMinor: 17502 })
  }
  async function insertItem(orderId, overrides = {}, handle = database) {
    const item = snapshot().items[0]
    const data = { order_id: orderId, position: item.position, product_id: item.productId, variant_id: item.variantId,
      product_name: item.productName, color: item.color, size: item.size, quantity: item.quantity,
      base_unit_price_minor: item.baseUnitPriceMinor, final_unit_price_minor: item.finalUnitPriceMinor,
      discount_percent: item.discountPercent, created_at: now, ...overrides }
    await handle.query(`INSERT INTO order_items (${Object.keys(data).join(', ')}) VALUES (${Object.keys(data).map(() => '?').join(', ')})`, Object.values(data))
  }
  async function insertKey(order, key = 1, handle = database, customerId = order.customerId) {
    await handle.query(`INSERT INTO order_idempotency_records (customer_id, idempotency_key_hash, request_hash, order_id, created_at)
      VALUES (?, ?, ?, ?, ?)`, [customerId, Buffer.alloc(32, key), Buffer.alloc(32, 2), order.orderId, now])
  }
  async function persistState(orderId, state) {
    const data = storedState(state)
    await database.query(`UPDATE orders SET ${Object.keys(data).map((key) => `${key} = ?`).join(', ')} WHERE order_id = ?`, [...Object.values(data), orderId])
  }
  it('accepts all three initial method states with coherent nullable audit and expiry fields', async () => {
    for (const method of ['cash', 'wallet_eg', 'instapay']) {
      const order = await insertOrder({ method })
      const [row] = await database.query('SELECT payment_method, payment_status, fulfillment_status, cash_expires_at FROM orders WHERE order_id = ?', [order.orderId])
      assert.equal(row.payment_method, method)
      assert.equal(row.payment_status, method === 'cash' ? 'unpaid' : 'payment_pending')
      assert.equal(row.fulfillment_status, 'placed')
      assert.equal(row.cash_expires_at !== null, method === 'cash')
    }
  })
  it('rejects inconsistent methods, money, audit, ownership and electronic operations in SQL', async () => {
    for (const overrides of [{ total_minor: 1 }, { subtotal_minor: '9007199254740992' }, { payment_method: 'card' },
      { payment_status: 'payment_pending' }, { cash_expires_at: null }, { cash_expires_at: now }, { version: 0 },
      { customer_id: '18446744073709551615' }, { wallet_sender_number: '+201112345678' },
      { paid_at: now }, { fulfillment_status: 'delivered' }, { fulfillment_status: 'cancelled' }]) {
      await assert.rejects(insertOrder({ overrides }))
    }
    for (const overrides of [{ fulfillment_status: 'prepared', prepared_at: now, prepared_by_admin_id: '1' },
      { cash_expires_at: deadline }, { wallet_sender_number: '+not-a-number' }, { wallet_sender_number: null }]) {
      await assert.rejects(insertOrder({ method: 'wallet_eg', overrides }))
    }
  })
  it('stores exact generated item totals and rejects invalid quantity/position/foreign-key rows', async () => {
    const order = await insertOrder()
    await insertItem(order.orderId)
    const [item] = await database.query('SELECT line_subtotal_minor, line_total_minor, line_discount_minor FROM order_items WHERE order_id = ?', [order.orderId])
    assert.deepEqual(item, { line_subtotal_minor: '20002', line_total_minor: '17502', line_discount_minor: '2500' })
    for (const overrides of [{ position: 1 }, { position: 0 }, { position: 101 }, { position: 2, quantity: 0 },
      { position: 2, quantity: 100 }, { position: 2, discount_percent: 101 }, { position: 2, product_name: ' ' },
      { position: 2, variant_id: '18446744073709551615' }, { position: 2, product_id: null },
      { position: 2, base_unit_price_minor: Number.MAX_SAFE_INTEGER }]) {
      await assert.rejects(insertItem(order.orderId, overrides))
    }
    const historical = await insertOrder()
    await insertItem(historical.orderId, { product_id: null, variant_id: null })
    assert.equal((await database.query('SELECT product_name FROM order_items WHERE order_id = ?', [historical.orderId]))[0].product_name, 'Historical jacket')
  })
  it('persists domain transitions, permits true repeats and protects immutable audit and facts', async () => {
    const order = await insertOrder({ method: 'wallet_eg' })
    let state = order.state
    for (const action of ['verify-payment', 'prepare', 'deliver']) {
      state = transitionOrder(state, { action, actor: adminActor, expectedVersion: state.version,
        now: new Date(Date.parse(state.updatedAt) + 1000) })
      await persistState(order.orderId, state)
    }
    const before = await database.query('SELECT * FROM orders WHERE order_id = ?', [order.orderId])
    const repeated = transitionOrder(state, { action: 'deliver', actor: adminActor, expectedVersion: 1, now: new Date(Date.parse(state.updatedAt) + 1000) })
    await persistState(order.orderId, repeated)
    assert.deepEqual(await database.query('SELECT * FROM orders WHERE order_id = ?', [order.orderId]), before)
    for (const [field, value] of [['order_number', 'Edited'], ['customer_id', customers[1]], ['subtotal_minor', 1],
      ['wallet_sender_number', '+201212345678'], ['paid_at', new Date(Date.parse(state.paidAt) + 1)],
      ['prepared_by_admin_id', null], ['version', state.version + 1]]) {
      await assert.rejects(database.query(`UPDATE orders SET ${field} = ? WHERE order_id = ?`, [value, order.orderId]), { code: 'DB_CONSTRAINT_FAILED' })
    }
    const emptyHistory = await insertOrder()
    await assert.rejects(database.query('DELETE FROM orders WHERE order_id = ?', [emptyHistory.orderId]), { code: 'DB_CONSTRAINT_FAILED' })
    const cash = await insertOrder()
    const paidCash = transitionOrder(cash.state, { action: 'deliver', actor: adminActor, expectedVersion: 1,
      now: new Date(now.getTime() + 1000) })
    await persistState(cash.orderId, paidCash)
    assert.equal((await database.query('SELECT cash_expires_at FROM orders WHERE order_id = ?', [cash.orderId]))[0].cash_expires_at, null)
  })
  it('scopes immutable idempotency keys to customer/order and resolves a duplicate insert race', async () => {
    const first = await insertOrder(), second = await insertOrder()
    const results = await Promise.allSettled([insertKey(first, 10), insertKey(second, 10)])
    assert.deepEqual(results.map((row) => row.status).sort(), ['fulfilled', 'rejected'])
    const other = await insertOrder({ customerId: customers[1] })
    await insertKey(other, 10)
    const wrongOwner = await insertOrder()
    await assert.rejects(insertKey(wrongOwner, 11, database, customers[1]), { code: 'DB_CONSTRAINT_FAILED' })
    await assert.rejects(insertKey(other, 12), { code: 'DB_CONSTRAINT_FAILED' })
    await assert.rejects(database.query('UPDATE order_idempotency_records SET request_hash = ? WHERE order_id = ?', [Buffer.alloc(32, 3), other.orderId]), { code: 'DB_CONSTRAINT_FAILED' })
    await assert.rejects(database.query('DELETE FROM order_idempotency_records WHERE order_id = ?', [other.orderId]), { code: 'DB_CONSTRAINT_FAILED' })
  })
  it('retains immutable item names/prices after real catalog editing and soft deletion', async () => {
    const order = await insertOrder()
    await insertItem(order.orderId)
    const before = await database.query('SELECT * FROM order_items WHERE order_id = ?', [order.orderId])
    await catalogAdmin.writeProduct(productId, { ...productInput, version: '1', name: 'Later catalog name', priceMinor: 50000, variants: [] }, [])
    await catalogAdmin.deleteProduct(productId, '2')
    assert.deepEqual(await database.query('SELECT * FROM order_items WHERE order_id = ?', [order.orderId]), before)
    await assert.rejects(database.query("UPDATE order_items SET product_name = 'Edited' WHERE order_id = ?", [order.orderId]), { code: 'DB_CONSTRAINT_FAILED' })
    await assert.rejects(database.query('DELETE FROM order_items WHERE order_id = ?', [order.orderId]), { code: 'DB_CONSTRAINT_FAILED' })
  })
  it('rolls back a multi-table fixture insertion without deleting retained history or consuming a key', async () => {
    const counts = async () => {
      const result = []
      for (const table of ['orders', 'order_items', 'order_idempotency_records']) {
        result.push((await database.query(`SELECT COUNT(*) AS count FROM ${table}`))[0].count)
      }
      return result
    }
    const before = await counts()
    const failure = new Error('intentional fixture rollback, not a production order-create API')
    await assert.rejects(database.transaction(async (tx) => {
      const order = await insertOrder({}, tx)
      await insertItem(order.orderId, {}, tx)
      await insertKey(order, 20, tx)
      throw failure
    }), (error) => error === failure)
    assert.deepEqual(await counts(), before)
  })
})

describe('orders staged schema upgrade', {
  skip: !localDatabaseTestsEnabled() && 'Requires newly created disposable MySQL',
}, () => {
  it('upgrades the published baseline with staged SQL and reruns without changing old checksums/data', async () => {
    const fixture = await startDisposableMysql()
    const database = createDatabase(fixture.config)
    try {
      const baseline = await loadMigrations()
      await runMigrations({ config: fixture.config, migrations: baseline })
      await database.query(`INSERT INTO customers (first_name, last_name, phone, password_hash, created_at, updated_at)
        VALUES ('Upgrade', 'Fixture', '+201112345678', 'synthetic fixture hash', ?, ?)`, [now, now])
      const before = await database.query('SELECT migration_name, checksum FROM migration_records ORDER BY migration_name')
      const migrations = [...baseline, ...await pendingMigrations()]
      assert.deepEqual((await runMigrations({ config: fixture.config, migrations })).applied,
        ['store-orders_001_create_orders.sql', 'store-orders_002_create_items_idempotency.sql', 'store-orders_003_protect_order_history.sql'])
      assert.deepEqual((await runMigrations({ config: fixture.config, migrations })).applied, [])
      const after = await database.query('SELECT migration_name, checksum FROM migration_records ORDER BY migration_name')
      assert.deepEqual(after.slice(0, before.length), before)
      assert.equal((await database.query('SELECT first_name FROM customers'))[0].first_name, 'Upgrade')
    } finally { try { await database.close() } finally { await fixture.stop() } }
  })
})
