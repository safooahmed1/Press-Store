import { CatalogError, identity } from '../services/catalog-input.js'

const classifications = Object.freeze({
  category: { table: 'categories', key: 'category_id' },
  brand: { table: 'brands', key: 'brand_id' },
})

function classification(kind) {
  const value = Object.hasOwn(classifications, kind) && classifications[kind]
  if (!value) throw new CatalogError('VALIDATION_FAILED')
  return value
}

export function createCatalogRepository(database) {
  return Object.freeze({
    async readVariants(variantIds, tx) {
      const placeholders = variantIds.map(() => '?').join(', ')
      return tx.query(`SELECT v.variant_id AS variantId, p.product_id AS productId,
        v.color, v.size, p.price_minor AS priceMinor, p.discount_percent AS discountPercent,
        (v.is_available = TRUE AND p.deleted_at IS NULL) AS isAvailable
        FROM product_variants v JOIN products p ON p.product_id = v.product_id
        WHERE v.variant_id IN (${placeholders}) ORDER BY v.variant_id`, variantIds)
    },
    async createClassification(kind, name, imagePath = null) {
      const { table, key } = classification(kind)
      return database.transaction(async (tx) => {
        await tx.query(kind === 'category'
          ? `INSERT INTO categories (name, image_path, created_at, updated_at) VALUES (?, ?, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6))`
          : `INSERT INTO brands (name, created_at, updated_at) VALUES (?, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6))`,
        kind === 'category' ? [name, imagePath] : [name])
        const [row] = await tx.query(`SELECT CAST(LAST_INSERT_ID() AS CHAR) AS id`)
        const [created] = await tx.query(`SELECT ${key} AS id, version FROM ${table} WHERE ${key} = ?`, [row.id])
        return created
      })
    },
    async renameClassification(kind, id, name, version) {
      const { table, key } = classification(kind)
      identity(id); identity(version)
      const result = await database.query(`UPDATE ${table} SET name = ?, version = version + 1,
        updated_at = UTC_TIMESTAMP(6) WHERE ${key} = ? AND version = ?`, [name, id, version])
      if (result.affectedRows !== 1) throw new CatalogError('EDIT_CONFLICT')
    },
    async deleteClassification(kind, id, version) {
      const { table, key } = classification(kind)
      identity(id); identity(version)
      return database.transaction(async (tx) => {
        const [row] = await tx.query(`SELECT version${kind === 'category' ? ', image_path' : ''}
          FROM ${table} WHERE ${key} = ? FOR UPDATE`, [id])
        if (!row || row.version !== version) throw new CatalogError('EDIT_CONFLICT')
        const [reference] = await tx.query(`SELECT product_id FROM products WHERE ${key} = ? LIMIT 1`, [id])
        if (reference) throw new CatalogError('RESOURCE_IN_USE')
        await tx.query(`DELETE FROM ${table} WHERE ${key} = ?`, [id])
        return row.image_path ?? null
      })
    },
    async createProduct(input, imagePaths) {
      return database.transaction(async (tx) => {
        await tx.query(`INSERT INTO products
          (name, description, category_id, brand_id, price_minor, discount_percent, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6))`,
        [input.name, input.description, input.categoryId, input.brandId, input.priceMinor, input.discountPercent])
        const [{ id }] = await tx.query('SELECT CAST(LAST_INSERT_ID() AS CHAR) AS id')
        for (const [slot, imagePath] of imagePaths.entries()) {
          await tx.query('INSERT INTO product_images (product_id, image_path, slot) VALUES (?, ?, ?)', [id, imagePath, slot])
        }
        for (const variant of input.variants) {
          await tx.query(`INSERT INTO product_variants (product_id, color, size, is_available) VALUES (?, ?, ?, ?)`,
            [id, variant.color, variant.size, variant.isAvailable])
        }
        return { productId: id, version: '1' }
      })
    },
    async readAvailableVariant(variantId) {
      identity(variantId)
      const [row] = await database.query(`SELECT v.variant_id AS variantId, p.product_id AS productId,
        v.color, v.size, p.price_minor AS priceMinor, p.discount_percent AS discountPercent
        FROM product_variants v JOIN products p ON p.product_id = v.product_id
        WHERE v.variant_id = ? AND v.is_available = TRUE AND p.deleted_at IS NULL`, [variantId])
      return row ?? null
    },
  })
}
