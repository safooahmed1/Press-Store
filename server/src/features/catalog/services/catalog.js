import { CatalogError, exactFields, text, productInput, calculateFinalPrice, identity } from './catalog-input.js'

function variantIdsForRead(variantIds, tx) {
  if (!Array.isArray(variantIds) || variantIds.length > 100) throw new CatalogError('VALIDATION_FAILED')
  const ids = Array.from(variantIds, (id) => identity(id))
  if (new Set(ids).size !== ids.length) throw new CatalogError('VALIDATION_FAILED')
  if (typeof tx?.query !== 'function') throw new TypeError('Catalog consumer transaction required')
  return ids
}

function variantProjection(row) {
  return { variantId: row.variantId, productId: row.productId, color: row.color, size: row.size,
    finalPriceMinor: calculateFinalPrice(Number(row.priceMinor), row.discountPercent),
    isAvailable: Boolean(Number(row.isAvailable)) }
}

// Server-internal domain surface only. CAT-003 owns HTTP/auth and mutation adapters.
export function createCatalogService({ repository, storage }) {
  async function withImages(uploads, operation, paths = []) {
    if (!uploads.length) return operation(paths)
    return storage.withCompensation(uploads[0], (stored) =>
      withImages(uploads.slice(1), operation, [...paths, stored.path]))
  }

  return Object.freeze({
    // READ-CAT-001: join the consumer transaction, including retained unavailable variants.
    async readVariants(variantIds, tx) {
      const ids = variantIdsForRead(variantIds, tx)
      if (!ids.length) return []
      const rows = await repository.readVariants(ids, tx)
      return rows.map(variantProjection)
    },
    async readVariantsForCheckout(variantIds, tx) {
      const ids = variantIdsForRead(variantIds, tx)
      if (typeof tx.transaction === 'function') throw new TypeError('Catalog transaction-only handle required')
      if (!ids.length) return []
      const rows = await repository.readVariantsForCheckout(ids, tx)
      return rows.map((row) => ({ ...variantProjection(row), productName: row.productName,
        priceMinor: Number(row.priceMinor), discountPercent: Number(row.discountPercent) }))
    },
    async createBrand(input) {
      exactFields(input, ['name'])
      return repository.createClassification('brand', text(input.name))
    },
    async createCategory(input, upload) {
      exactFields(input, ['name'])
      const name = text(input.name)
      if (!upload) throw new CatalogError('VALIDATION_FAILED')
      return storage.withCompensation(upload, (stored) => repository.createClassification('category', name, stored.path))
    },
    async renameClassification(kind, id, input, version) {
      exactFields(input, ['name'])
      return repository.renameClassification(kind, id, text(input.name), version)
    },
    async deleteClassification(kind, id, version) {
      const obsoletePath = await repository.deleteClassification(kind, id, version)
      // DB commit is final; file failure must never masquerade as a rolled-back deletion.
      if (obsoletePath) {
        try { await storage.delete(obsoletePath) } catch {
          return { deleted: true, cleanupPending: obsoletePath }
        }
      }
      return { deleted: true, cleanupPending: null }
    },
    async createProduct(input, uploads) {
      const validated = productInput(input)
      if (!Array.isArray(uploads) || uploads.length < 1 || uploads.length > 4 || uploads.some((upload) => !upload)) {
        throw new CatalogError('IMAGE_LIMIT_EXCEEDED')
      }
      // All file writes wrap the transaction, so insert/commit failures compensate every new image.
      return withImages(uploads, (paths) => repository.createProduct(validated, paths))
    },
    async requireAvailableVariant(variantId) {
      const variant = await repository.readAvailableVariant(variantId)
      if (!variant) throw new CatalogError('VARIANT_UNAVAILABLE')
      const priceMinor = Number(variant.priceMinor)
      return { ...variant, priceMinor, finalPriceMinor: calculateFinalPrice(priceMinor, variant.discountPercent) }
    },
  })
}
