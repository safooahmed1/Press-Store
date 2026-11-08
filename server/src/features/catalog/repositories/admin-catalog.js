import { CatalogError } from '../services/catalog-input.js'
import { lockCuration, advanceCuration } from './curation-state.js'

const productColumns = `product_id, name, description, category_id, brand_id, price_minor,
  discount_percent, is_best_seller, is_new_arrival, version, updated_at`
const qualifiedColumns = productColumns.split(',').map((column) => `p.${column.trim()}`).join(', ')
function kindOf(kind) {
  if (!['category', 'brand'].includes(kind)) throw new TypeError('Invalid classification kind')
  return { table: kind === 'category' ? 'categories' : 'brands', key: kind === 'category' ? 'category_id' : 'brand_id' }
}
async function checkFlags(tx, input, excludeId = '0') {
  const [counts] = await tx.query(`SELECT COUNT(CASE WHEN is_best_seller = TRUE THEN 1 END) AS best,
    COUNT(CASE WHEN is_new_arrival = TRUE THEN 1 END) AS fresh FROM products WHERE deleted_at IS NULL AND product_id <> ?`, [excludeId])
  if (input.bestSeller && Number(counts.best) >= 8 || input.newArrival && Number(counts.fresh) >= 8) {
    throw new CatalogError('CURATION_LIMIT_EXCEEDED')
  }
}
async function setVariants(tx, productId, variants) {
  const current = await tx.query('SELECT variant_id, color, size FROM product_variants WHERE product_id = ? FOR UPDATE', [productId])
  const pairs = new Map(current.map((row) => [JSON.stringify([row.color, row.size]), row.variant_id]))
  await tx.query('UPDATE product_variants SET is_available = FALSE WHERE product_id = ?', [productId])
  for (const variant of variants) {
    const existingId = pairs.get(JSON.stringify([variant.color, variant.size]))
    if (existingId) await tx.query('UPDATE product_variants SET is_available = ? WHERE variant_id = ?', [variant.isAvailable, existingId])
    else await tx.query('INSERT INTO product_variants (product_id, color, size, is_available) VALUES (?, ?, ?, ?)',
      [productId, variant.color, variant.size, variant.isAvailable])
  }
}
async function productResult(tx, productId) {
  const [row] = await tx.query('SELECT product_id AS productId, version, updated_at AS updatedAt FROM products WHERE product_id = ?', [productId])
  return row
}

async function countAdminProducts(database) {
  const [{ total }] = await database.query('SELECT COUNT(*) AS total FROM products WHERE deleted_at IS NULL')
  return total
}

export function createAdminCatalogRepository(database) {
  return Object.freeze({
    async countProducts() {
      return Number(await countAdminProducts(database))
    },
    async listProducts(filters) {
      return database.transaction(async (tx) => {
        const total = await countAdminProducts(tx)
        const rows = await tx.query(`SELECT ${qualifiedColumns}, b.name AS brand_name, c.name AS category_name, i.image_path AS main_image_path
          FROM products p JOIN brands b ON b.brand_id = p.brand_id JOIN categories c ON c.category_id = p.category_id
          LEFT JOIN product_images i ON i.product_id = p.product_id AND i.slot = 0
          WHERE p.deleted_at IS NULL ORDER BY p.product_id LIMIT ? OFFSET ?`, [filters.pageSize, (filters.page - 1) * filters.pageSize])
        const variants = rows.length ? await tx.query(`SELECT product_id, variant_id, color, size FROM product_variants
          WHERE is_available = TRUE AND product_id IN (${rows.map(() => '?').join(',')}) ORDER BY variant_id`, rows.map((row) => row.product_id)) : []
        return { rows, variants, total }
      })
    },
    async readProduct(productId) {
      return database.transaction(async (tx) => {
        const [row] = await tx.query(`SELECT ${qualifiedColumns}, b.name AS brand_name, c.name AS category_name
          FROM products p JOIN brands b ON b.brand_id = p.brand_id JOIN categories c ON c.category_id = p.category_id
          WHERE p.product_id = ? AND p.deleted_at IS NULL`, [productId])
        if (!row) throw new CatalogError('PRODUCT_NOT_FOUND')
        const images = await tx.query('SELECT product_image_id, image_path, slot FROM product_images WHERE product_id = ? ORDER BY slot', [productId])
        const variants = await tx.query('SELECT variant_id, color, size, is_available FROM product_variants WHERE product_id = ? ORDER BY variant_id', [productId])
        return { row, images, variants }
      })
    },
    async createProduct(input, paths) {
      return database.transaction(async (tx) => {
        await lockCuration(tx)
        await checkFlags(tx, input)
        await tx.query(`INSERT INTO products (name, description, category_id, brand_id, price_minor, discount_percent,
          is_best_seller, is_new_arrival, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6))`,
        [input.name, input.description, input.categoryId, input.brandId, input.priceMinor, input.discountPercent, input.bestSeller, input.newArrival])
        const [{ id }] = await tx.query('SELECT CAST(LAST_INSERT_ID() AS CHAR) AS id')
        for (const [slot, imagePath] of paths.entries()) await tx.query('INSERT INTO product_images (product_id, image_path, slot) VALUES (?, ?, ?)', [id, imagePath, slot])
        await setVariants(tx, id, input.variants)
        if (input.bestSeller || input.newArrival) await advanceCuration(tx)
        return { ...await productResult(tx, id), obsoletePaths: [] }
      })
    },
    async updateProduct(productId, input, paths) {
      return database.transaction(async (tx) => {
        await lockCuration(tx)
        const [current] = await tx.query('SELECT version, is_best_seller, is_new_arrival FROM products WHERE product_id = ? AND deleted_at IS NULL FOR UPDATE', [productId])
        if (!current) throw new CatalogError('PRODUCT_NOT_FOUND')
        if (current.version !== input.version) throw new CatalogError('EDIT_CONFLICT')
        await checkFlags(tx, input, productId)
        let obsoletePaths = []
        if (input.images) {
          const currentImages = await tx.query('SELECT product_image_id, image_path FROM product_images WHERE product_id = ? FOR UPDATE', [productId])
          const byId = new Map(currentImages.map((image) => [image.product_image_id, image.image_path]))
          const next = input.images.map((image) => {
            if (image.imageId) {
              if (!byId.has(image.imageId)) throw new CatalogError('VALIDATION_FAILED')
              return { id: image.imageId, path: byId.get(image.imageId) }
            }
            if (!paths[image.uploadIndex]) throw new CatalogError('VALIDATION_FAILED')
            return { path: paths[image.uploadIndex] }
          })
          const retained = new Set(next.map((image) => image.path))
          obsoletePaths = currentImages.filter((image) => !retained.has(image.image_path)).map((image) => image.image_path)
          await tx.query('DELETE FROM product_images WHERE product_id = ?', [productId])
          for (const [slot, image] of next.entries()) {
            await tx.query('INSERT INTO product_images (product_image_id, product_id, image_path, slot) VALUES (?, ?, ?, ?)',
              [image.id ?? null, productId, image.path, slot])
          }
        }
        await tx.query(`UPDATE products SET name = ?, description = ?, category_id = ?, brand_id = ?, price_minor = ?,
          discount_percent = ?, is_best_seller = ?, is_new_arrival = ?, version = version + 1,
          updated_at = UTC_TIMESTAMP(6) WHERE product_id = ?`,
        [input.name, input.description, input.categoryId, input.brandId, input.priceMinor, input.discountPercent,
          input.bestSeller, input.newArrival, productId])
        await setVariants(tx, productId, input.variants)
        if (Boolean(current.is_best_seller) !== input.bestSeller || Boolean(current.is_new_arrival) !== input.newArrival) await advanceCuration(tx)
        return { ...await productResult(tx, productId), obsoletePaths }
      })
    },
    async setFlags(productId, input) {
      return database.transaction(async (tx) => {
        await lockCuration(tx)
        const [current] = await tx.query('SELECT version, is_best_seller, is_new_arrival FROM products WHERE product_id = ? AND deleted_at IS NULL FOR UPDATE', [productId])
        if (!current) throw new CatalogError('PRODUCT_NOT_FOUND')
        if (current.version !== input.version) throw new CatalogError('EDIT_CONFLICT')
        await checkFlags(tx, input, productId)
        await tx.query(`UPDATE products SET is_best_seller = ?, is_new_arrival = ?, version = version + 1,
          updated_at = UTC_TIMESTAMP(6) WHERE product_id = ?`, [input.bestSeller, input.newArrival, productId])
        if (Boolean(current.is_best_seller) !== input.bestSeller || Boolean(current.is_new_arrival) !== input.newArrival) await advanceCuration(tx)
        return productResult(tx, productId)
      })
    },
    async deleteProduct(productId, version) {
      return database.transaction(async (tx) => {
        await lockCuration(tx)
        const [row] = await tx.query('SELECT version, is_best_seller, is_new_arrival FROM products WHERE product_id = ? AND deleted_at IS NULL FOR UPDATE', [productId])
        if (!row) throw new CatalogError('PRODUCT_NOT_FOUND')
        if (row.version !== version) throw new CatalogError('EDIT_CONFLICT')
        await tx.query(`UPDATE products SET deleted_at = UTC_TIMESTAMP(6), updated_at = UTC_TIMESTAMP(6),
          version = version + 1, is_best_seller = FALSE, is_new_arrival = FALSE WHERE product_id = ?`, [productId])
        await tx.query('UPDATE product_variants SET is_available = FALSE WHERE product_id = ?', [productId])
        if (row.is_best_seller || row.is_new_arrival) await advanceCuration(tx)
        return { obsoletePaths: [] }
      })
    },
    async listClassifications(kind, filters) {
      const { table, key } = kindOf(kind)
      return database.transaction(async (tx) => {
        const [count] = await tx.query(`SELECT COUNT(*) AS total FROM ${table}`)
        const rows = await tx.query(`SELECT ${key} AS id, name, version, updated_at${kind === 'category' ? ', image_path' : ''}
          FROM ${table} ORDER BY ${key} LIMIT ? OFFSET ?`, [filters.pageSize, (filters.page - 1) * filters.pageSize])
        return { rows, total: count.total }
      })
    },
    async classification(kind, id) {
      const { table, key } = kindOf(kind)
      const [row] = await database.query(`SELECT ${key} AS id, name, version, updated_at${kind === 'category' ? ', image_path' : ''} FROM ${table} WHERE ${key} = ?`, [id])
      if (!row) throw new CatalogError(kind === 'category' ? 'CATEGORY_NOT_FOUND' : 'BRAND_NOT_FOUND')
      return row
    },
    async writeClassification(kind, id, input, imagePath) {
      const { table, key } = kindOf(kind)
      return database.transaction(async (tx) => {
        let obsoletePaths = []
        let resourceId = id
        if (!id) {
          await tx.query(kind === 'category'
            ? 'INSERT INTO categories (name, image_path, created_at, updated_at) VALUES (?, ?, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6))'
            : 'INSERT INTO brands (name, created_at, updated_at) VALUES (?, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6))',
          kind === 'category' ? [input.name, imagePath] : [input.name])
          const [created] = await tx.query('SELECT CAST(LAST_INSERT_ID() AS CHAR) AS id')
          resourceId = created.id
        } else {
          const [current] = await tx.query(`SELECT version${kind === 'category' ? ', image_path' : ''} FROM ${table} WHERE ${key} = ? FOR UPDATE`, [id])
          if (!current) throw new CatalogError(kind === 'category' ? 'CATEGORY_NOT_FOUND' : 'BRAND_NOT_FOUND')
          if (current.version !== input.version) throw new CatalogError('EDIT_CONFLICT')
          await tx.query(`UPDATE ${table} SET name = ?, version = version + 1, updated_at = UTC_TIMESTAMP(6)
            ${imagePath ? ', image_path = ?' : ''} WHERE ${key} = ?`, imagePath ? [input.name, imagePath, id] : [input.name, id])
          if (imagePath) obsoletePaths = [current.image_path]
        }
        const [row] = await tx.query(`SELECT ${key} AS id, name, version, updated_at${kind === 'category' ? ', image_path' : ''} FROM ${table} WHERE ${key} = ?`, [resourceId])
        return { row, obsoletePaths }
      })
    },
    async deleteClassification(kind, id, version) {
      const { table, key } = kindOf(kind)
      return database.transaction(async (tx) => {
        const [row] = await tx.query(`SELECT version${kind === 'category' ? ', image_path' : ''} FROM ${table} WHERE ${key} = ? FOR UPDATE`, [id])
        if (!row) throw new CatalogError(kind === 'category' ? 'CATEGORY_NOT_FOUND' : 'BRAND_NOT_FOUND')
        if (row.version !== version) throw new CatalogError('EDIT_CONFLICT')
        const [used] = await tx.query(`SELECT product_id FROM products WHERE ${key} = ? LIMIT 1`, [id])
        if (used) throw new CatalogError('RESOURCE_IN_USE')
        await tx.query(`DELETE FROM ${table} WHERE ${key} = ?`, [id])
        return { obsoletePaths: row.image_path ? [row.image_path] : [] }
      })
    },
  })
}
