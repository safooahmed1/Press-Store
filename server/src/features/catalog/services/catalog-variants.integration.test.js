import assert from 'node:assert/strict'
import { before, after, describe, it } from 'node:test'
import { localDatabaseTestsEnabled } from '../../../config/database-config.js'
import { createDatabase } from '../../../platform/db/database.js'
import { loadMigrations } from '../../../platform/db/migration-files.js'
import { runMigrations } from '../../../platform/db/migrate.js'
import { startDisposableMysql } from '../../../platform/db/testing/disposable-mysql.js'
import { countQueries } from '../../../../../tests/helpers/query-counter.js'
import { createCatalogRepository } from '../repositories/catalog.js'
import { createCatalogService } from './catalog.js'

describe('catalog cart batch contract on real disposable MySQL', {
  skip: !localDatabaseTestsEnabled() && 'Requires newly created disposable MySQL fixture',
}, () => {
  let fixture, database, service, productId, ids
  before(async () => {
    fixture = await startDisposableMysql()
    database = createDatabase(fixture.config)
    await runMigrations({ config: fixture.config,
      migrations: (await loadMigrations()).filter(({ name }) => name.startsWith('cat_')) })
    const seed = createCatalogService({ repository: createCatalogRepository(database), storage: {
      withCompensation: async (upload, work) => work({ path: 'test-only-projection.png' }),
    } })
    const category = await seed.createCategory({ name: 'Batch fixture' }, {})
    const brand = await seed.createBrand({ name: 'Batch fixture' })
    const created = await seed.createProduct({ name: 'Batch fixture', description: 'Test only',
      categoryId: category.id, brandId: brand.id, priceMinor: 10001, discountPercent: 12.5,
      variants: Array.from({ length: 100 }, (_, i) => ({ color: `Color ${i}`, size: 'M', isAvailable: i !== 0 })) }, [{}])
    productId = created.productId
    ids = (await database.query('SELECT variant_id FROM product_variants WHERE product_id = ? ORDER BY variant_id', [productId]))
      .map((row) => row.variant_id)
    // Any accidental out-of-transaction path fails rather than obtaining another connection.
    service = createCatalogService({ repository: createCatalogRepository({
      query() { throw new Error('Separate catalog query forbidden') },
      transaction() { throw new Error('Nested catalog transaction forbidden') },
    }) })
  })
  after(async () => { try { await database?.close() } finally { await fixture?.stop() } })
  it('projects 100 variants with one domain query, including inactive rows and missing-ID omission', async () => {
    const counter = countQueries(database)
    const rows = await counter.transaction((tx) => service.readVariants(ids, tx))
    assert.equal(counter.count, 1)
    assert.equal(rows.length, 100)
    assert.equal(rows[0].isAvailable, false)
    assert.equal(rows[1].isAvailable, true)
    assert.ok(rows.every((row) => row.finalPriceMinor === 8751))
    assert.deepEqual(await database.transaction((tx) => service.readVariants(['18446744073709551615'], tx)), [])
  })
  it('sees transaction-local owner changes and rolls them back with the consumer transaction', async () => {
    const rollback = new Error('intentional fixture rollback')
    await assert.rejects(database.transaction(async (tx) => {
      await tx.query('UPDATE products SET price_minor = 20001, discount_percent = 50, deleted_at = UTC_TIMESTAMP(6) WHERE product_id = ?', [productId])
      const [row] = await service.readVariants([ids[1]], tx)
      assert.equal(row.finalPriceMinor, 10001)
      assert.equal(row.isAvailable, false)
      throw rollback
    }), (error) => error === rollback)
    const [row] = await database.transaction((tx) => service.readVariants([ids[1]], tx))
    assert.equal(row.finalPriceMinor, 8751)
    assert.equal(row.isAvailable, true)
  })
})
