import { CatalogError } from '../services/catalog-input.js'
import { lockCuration, advanceCuration } from './curation-state.js'

function flagColumn(kind) {
  if (!['best-sellers', 'new-arrivals'].includes(kind)) throw new CatalogError('VALIDATION_FAILED')
  return kind === 'best-sellers' ? 'is_best_seller' : 'is_new_arrival'
}
/** CAT owns all SQL/flags. HOME receives only these named read/command methods. */
export function createMerchandisingRepository(database) {
  return Object.freeze({
    async read() {
      return database.transaction(async (tx) => {
        const [state] = await tx.query('SELECT curation_version FROM catalog_curation_states WHERE state_id = 1')
        if (!state) throw new Error('Catalog coordination unavailable')
        const best = await tx.query('SELECT product_id FROM products WHERE deleted_at IS NULL AND is_best_seller = TRUE ORDER BY product_id LIMIT 9')
        const fresh = await tx.query('SELECT product_id FROM products WHERE deleted_at IS NULL AND is_new_arrival = TRUE ORDER BY product_id LIMIT 9')
        if (best.length > 8 || fresh.length > 8) throw new CatalogError('CURATION_LIMIT_EXCEEDED')
        const ids = [...new Set([...best, ...fresh].map((row) => row.product_id))]
        const rows = ids.length ? await tx.query(`SELECT p.product_id, p.name, p.price_minor, p.discount_percent, i.image_path
          FROM products p LEFT JOIN product_images i ON i.product_id = p.product_id AND i.slot = 0
          WHERE p.product_id IN (${ids.map(() => '?').join(',')}) AND p.deleted_at IS NULL
          AND EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.product_id AND v.is_available = TRUE)
          ORDER BY p.product_id`, ids) : []
        const variants = rows.length ? await tx.query(`SELECT product_id, variant_id, color, size FROM product_variants
          WHERE product_id IN (${rows.map(() => '?').join(',')}) AND is_available = TRUE ORDER BY variant_id`, rows.map((row) => row.product_id)) : []
        const categories = await tx.query('SELECT category_id, name, image_path FROM categories ORDER BY category_id LIMIT 48')
        return { version: state.curation_version, bestSellerProductIds: best.map((row) => row.product_id),
          newArrivalProductIds: fresh.map((row) => row.product_id), rows, variants, categories }
      })
    },
    async replace(kind, input) {
      const column = flagColumn(kind)
      const ids = input.productIds
      return database.transaction(async (tx) => {
        const version = await lockCuration(tx)
        if (version !== input.version) throw new CatalogError('EDIT_CONFLICT')
        const targets = ids.length ? await tx.query(`SELECT product_id FROM products
          WHERE product_id IN (${ids.map(() => '?').join(',')}) AND deleted_at IS NULL ORDER BY product_id FOR UPDATE`, ids) : []
        if (targets.length !== ids.length) throw new CatalogError('PRODUCT_NOT_FOUND')
        const old = await tx.query(`SELECT product_id FROM products WHERE deleted_at IS NULL AND ${column} = TRUE ORDER BY product_id FOR UPDATE`)
        const previous = new Set(old.map((row) => row.product_id))
        const desired = new Set(ids)
        for (const id of new Set([...previous, ...desired])) {
          if (previous.has(id) !== desired.has(id)) await tx.query(`UPDATE products SET ${column} = ?, version = version + 1,
            updated_at = UTC_TIMESTAMP(6) WHERE product_id = ?`, [desired.has(id), id])
        }
        await advanceCuration(tx)
        return { resourceId: kind, version: version + 1 }
      })
    },
  })
}
