import assert from 'node:assert/strict'
import { mkdtemp, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { after, before, describe, it } from 'node:test'
import sharp from 'sharp'
import { localDatabaseTestsEnabled } from '../../../config/database-config.js'
import { createDatabase } from '../../../platform/db/database.js'
import { loadMigrations } from '../../../platform/db/migration-files.js'
import { runMigrations } from '../../../platform/db/migrate.js'
import { startDisposableMysql } from '../../../platform/db/testing/disposable-mysql.js'
import { createImageStorage } from '../../../platform/storage/image-storage.js'
import { createCatalogRepository } from '../repositories/catalog.js'
import { createCatalogService } from './catalog.js'

const product = (categoryId, brandId, extra = {}) => ({ name: 'Jacket', description: 'Cotton jacket', categoryId,
  brandId, priceMinor: 10001, discountPercent: '12.50', variants: [{ color: 'Black', size: 'M' }], ...extra })

describe('catalog migration discovery', () => {
  it('discovers immutable forward migrations through FND without startup wiring', async () => {
    const names = (await loadMigrations()).filter(({ name }) => name.startsWith('cat_')).map(({ name }) => name)
    assert.deepEqual(names, ['cat_001_create_classifications.sql', 'cat_002_create_products.sql', 'cat_003_create_images_variants.sql'])
  })
})

describe('catalog isolated MySQL domain integrity', {
  skip: !localDatabaseTestsEnabled() && 'Requires FND_DISPOSABLE_MYSQL_TESTS=1; never uses an application database',
}, () => {
  let fixture, database, root, storage, service, categoryId, brandId, upload, created
  before(async () => {
    fixture = await startDisposableMysql()
    root = await mkdtemp(path.join(tmpdir(), 'press-cat001-images-'))
    database = createDatabase(fixture.config)
    storage = createImageStorage({ root })
    service = createCatalogService({ repository: createCatalogRepository(database), storage })
    const buffer = await sharp({ create: { width: 2, height: 2, channels: 3, background: '#ffffff' } }).png().toBuffer()
    upload = { buffer, originalName: 'test.png', contentType: 'image/png' }
  })
  after(async () => {
    try { await database?.close() } finally {
      try { await fixture?.stop() } finally { if (root) await rm(root, { recursive: true, force: true }) }
    }
  })
  it('upgrades classifications with existing data, reruns safely and enforces unique names', async () => {
    const migrations = (await loadMigrations()).filter(({ name }) => name.startsWith('cat_'))
    await runMigrations({ config: fixture.config, migrations: migrations.slice(0, 1) })
    const category = await service.createCategory({ name: 'Outerwear' }, upload)
    const brand = await service.createBrand({ name: 'Press' })
    categoryId = category.id; brandId = brand.id
    await runMigrations({ config: fixture.config, migrations })
    await runMigrations({ config: fixture.config, migrations })
    await assert.rejects(service.createBrand({ name: 'Press' }), { code: 'DB_CONSTRAINT_FAILED' })
    const beforeFiles = await readdir(root)
    await assert.rejects(service.createCategory({ name: 'Outerwear' }, upload), { code: 'DB_CONSTRAINT_FAILED' })
    assert.deepEqual(await readdir(root), beforeFiles)
    assert.equal((await database.query('SELECT COUNT(*) AS count FROM categories'))[0].count, '1')
  })
  it('commits product, four image slots and unique boolean variants with exact stored money', async () => {
    created = await service.createProduct(product(categoryId, brandId, { variants: [
      { color: 'Black', size: 'M' }, { color: 'Black', size: 'L', isAvailable: false },
    ] }), [upload, upload, upload, upload])
    const [row] = await database.query('SELECT price_minor, discount_percent FROM products WHERE product_id = ?', [created.productId])
    assert.equal(row.price_minor, '10001')
    assert.equal(row.discount_percent, '12.50')
    const images = await database.query('SELECT slot FROM product_images WHERE product_id = ? ORDER BY slot', [created.productId])
    assert.deepEqual(images.map(({ slot }) => slot), [0, 1, 2, 3])
    const variants = await database.query('SELECT variant_id, is_available FROM product_variants WHERE product_id = ? ORDER BY variant_id', [created.productId])
    assert.equal((await service.requireAvailableVariant(variants[0].variant_id)).finalPriceMinor, 8751)
    await assert.rejects(service.requireAvailableVariant(variants[1].variant_id), { code: 'VARIANT_UNAVAILABLE' })
    await assert.rejects(database.query('INSERT INTO product_variants (product_id, color, size) VALUES (?, ?, ?)',
      [created.productId, 'Black', 'M']), { code: 'DB_CONSTRAINT_FAILED' })
    await assert.rejects(database.query('UPDATE product_variants SET is_available = 2 WHERE variant_id = ?',
      [variants[0].variant_id]), { code: 'DB_CONSTRAINT_FAILED' })
    await assert.rejects(database.query('INSERT INTO product_images (product_id, image_path, slot) VALUES (?, ?, ?)',
      [created.productId, 'synthetic-fifth.png', 4]), { code: 'DB_CONSTRAINT_FAILED' })
    await assert.rejects(database.query('INSERT INTO product_images (product_id, image_path, slot) VALUES (?, ?, ?)',
      [created.productId, 'synthetic-main.png', 0]), { code: 'DB_CONSTRAINT_FAILED' })
  })
  it('rolls back partial product/images and compensates files on a later child insert failure', async () => {
    const repository = createCatalogRepository(database)
    const input = product(categoryId, brandId, { discountPercent: '0.00', variants: [
      { color: 'White', size: 'S', isAvailable: true }, { color: 'White', size: 'S', isAvailable: true },
    ] })
    const [{ count: beforeProducts }] = await database.query('SELECT COUNT(*) AS count FROM products')
    await assert.rejects(repository.createProduct(input, ['synthetic-rollback.png']), { code: 'DB_CONSTRAINT_FAILED' })
    assert.equal((await database.query('SELECT COUNT(*) AS count FROM products'))[0].count, beforeProducts)
    assert.equal((await database.query('SELECT COUNT(*) AS count FROM product_images WHERE image_path = ?', ['synthetic-rollback.png']))[0].count, '0')
    const files = (await readdir(root)).sort()
    await assert.rejects(service.createProduct(product(categoryId, brandId), [upload, { ...upload, buffer: Buffer.from('invalid') }]), { code: 'INVALID_IMAGE' })
    assert.deepEqual((await readdir(root)).sort(), files)
    await assert.rejects(service.createProduct(product('999999', brandId), [upload, upload]), { code: 'DB_CONSTRAINT_FAILED' })
    assert.deepEqual((await readdir(root)).sort(), files)
  })
  it('rejects referenced deletions including soft-deleted products and hides their variants', async () => {
    await assert.rejects(service.deleteClassification('category', categoryId, '1'), { code: 'RESOURCE_IN_USE' })
    await database.query('UPDATE products SET deleted_at = UTC_TIMESTAMP(6) WHERE product_id = ?', [created.productId])
    const [variant] = await database.query('SELECT variant_id FROM product_variants WHERE product_id = ? LIMIT 1', [created.productId])
    await assert.rejects(service.requireAvailableVariant(variant.variant_id), { code: 'VARIANT_UNAVAILABLE' })
    await assert.rejects(service.deleteClassification('brand', brandId, '1'), { code: 'RESOURCE_IN_USE' })
    await assert.rejects(database.query('DELETE FROM categories WHERE category_id = ?', [categoryId]), { code: 'DB_CONSTRAINT_FAILED' })
  })
  it('allows only one concurrent classification edit and cleans unreferenced category files after commit', async () => {
    const results = await Promise.allSettled([
      service.renameClassification('brand', brandId, { name: 'Press One' }, '1'),
      service.renameClassification('brand', brandId, { name: 'Press Two' }, '1'),
    ])
    assert.equal(results.filter(({ status }) => status === 'fulfilled').length, 1)
    assert.equal(results.find(({ status }) => status === 'rejected').reason.code, 'EDIT_CONFLICT')
    const removable = await service.createCategory({ name: 'Temporary' }, upload)
    const beforeFiles = await readdir(root)
    assert.deepEqual(await service.deleteClassification('category', removable.id, '1'), { deleted: true, cleanupPending: null })
    assert.equal((await readdir(root)).length, beforeFiles.length - 1)
    await assert.rejects(database.query('UPDATE products SET price_minor = 0 WHERE product_id = ?', [created.productId]), { code: 'DB_CONSTRAINT_FAILED' })
    await assert.rejects(database.query('UPDATE products SET discount_percent = 101 WHERE product_id = ?', [created.productId]), { code: 'DB_CONSTRAINT_FAILED' })
  })
})
