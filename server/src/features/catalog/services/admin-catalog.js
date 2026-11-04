import { CatalogError, calculateFinalPrice, identity, exactFields } from './catalog-input.js'
import { adminProductInput, classificationInput } from './admin-input.js'

function iso(value) { return value instanceof Date ? value.toISOString() : new Date(value).toISOString() }
function count(value) {
  const result = Number(value)
  if (!Number.isSafeInteger(result) || result < 0) throw new Error('Invalid catalog count')
  return result
}
export function createAdminCatalogService({ repository, storage, onCleanupFailure = () => {} }) {
  async function withUploads(uploads, operation, paths = []) {
    if (!uploads.length) return operation(paths)
    return storage.withCompensation(uploads[0], (image) => withUploads(uploads.slice(1), operation, [...paths, image.path]))
  }
  async function cleanup(paths) {
    let pending = false
    for (const path of paths) {
      try { await storage.delete(path) } catch { pending = true }
    }
    if (pending) { try { onCleanupFailure() } catch { /* committed success must stay success */ } }
    return pending
  }
  function classificationDto(kind, row) {
    return { [kind === 'category' ? 'categoryId' : 'brandId']: row.id, name: row.name,
      version: row.version, updatedAt: iso(row.updated_at),
      ...(kind === 'category' ? { imageUrl: storage.urlFor(row.image_path) } : {}) }
  }
  function productDto(row) {
    const priceMinor = Number(row.price_minor)
    return { productId: row.product_id, name: row.name, categoryId: row.category_id, brandId: row.brand_id,
      brand: { brandId: row.brand_id, name: row.brand_name }, category: { categoryId: row.category_id, name: row.category_name },
      priceMinor, discountPercent: Number(row.discount_percent), finalPriceMinor: calculateFinalPrice(priceMinor, row.discount_percent),
      bestSeller: Boolean(row.is_best_seller), newArrival: Boolean(row.is_new_arrival), version: row.version,
      updatedAt: iso(row.updated_at) }
  }
  function mutationDto(result, pending) {
    return { productId: result.productId, version: result.version, updatedAt: iso(result.updatedAt), cleanupPending: pending }
  }
  return Object.freeze({
    async listProducts(filters) {
      const { rows, variants, total } = await repository.listProducts(filters)
      return { items: rows.map((row) => ({ ...productDto(row), mainImageUrl: storage.urlFor(row.main_image_path),
        availableVariants: variants.filter((variant) => variant.product_id === row.product_id)
          .map((variant) => ({ variantId: variant.variant_id, color: variant.color, size: variant.size })) })), total: count(total) }
    },
    async product(id) {
      identity(id)
      const { row, images, variants } = await repository.readProduct(id)
      return { ...productDto(row), description: row.description,
        images: images.map((image) => ({ imageId: image.product_image_id, role: image.slot === 0 ? 'main' : 'additional',
          order: image.slot, imageUrl: storage.urlFor(image.image_path) })),
        variants: variants.map((variant) => ({ variantId: variant.variant_id, color: variant.color, size: variant.size,
          isAvailable: Boolean(variant.is_available) })) }
    },
    async writeProduct(id, input, uploads) {
      if (id) identity(id)
      const validated = adminProductInput(input, Boolean(id))
      if (!id && (uploads.length < 1 || uploads.length > 4)) throw new CatalogError('IMAGE_LIMIT_EXCEEDED')
      if (id) {
        if (uploads.length && !validated.images) throw new CatalogError('VALIDATION_FAILED')
        const references = validated.images?.filter((image) => image.uploadIndex !== undefined).map((image) => image.uploadIndex) ?? []
        if (references.length !== uploads.length || references.some((index) => index >= uploads.length)) throw new CatalogError('VALIDATION_FAILED')
      }
      const result = await withUploads(uploads, (paths) => id
        ? repository.updateProduct(id, validated, paths) : repository.createProduct(validated, paths))
      // Cleanup happens after new-file compensation scopes have successfully completed/committed.
      return mutationDto(result, await cleanup(result.obsoletePaths))
    },
    async setFlags(id, input) {
      identity(id)
      exactFields(input, ['version', 'bestSeller', 'newArrival'])
      identity(input.version)
      if (typeof input.bestSeller !== 'boolean' || typeof input.newArrival !== 'boolean') throw new CatalogError('VALIDATION_FAILED')
      return mutationDto(await repository.setFlags(id, input), false)
    },
    async deleteProduct(id, version) {
      identity(id); identity(version)
      const result = await repository.deleteProduct(id, version)
      return { cleanupPending: await cleanup(result.obsoletePaths) }
    },
    async listClassifications(kind, filters) {
      const result = await repository.listClassifications(kind, filters)
      return { items: result.rows.map((row) => classificationDto(kind, row)), total: count(result.total) }
    },
    async classification(kind, id) { identity(id); return classificationDto(kind, await repository.classification(kind, id)) },
    async writeClassification(kind, id, input, uploads) {
      if (id) identity(id)
      const validated = classificationInput(input, Boolean(id))
      if (kind === 'brand' && uploads.length || kind === 'category' && (uploads.length > 1 || !id && !uploads.length)) {
        throw new CatalogError('IMAGE_LIMIT_EXCEEDED')
      }
      const result = await withUploads(uploads, (paths) => repository.writeClassification(kind, id, validated, paths[0]))
      return { ...classificationDto(kind, result.row), cleanupPending: await cleanup(result.obsoletePaths) }
    },
    async deleteClassification(kind, id, version) {
      identity(id); identity(version)
      const result = await repository.deleteClassification(kind, id, version)
      return { cleanupPending: await cleanup(result.obsoletePaths) }
    },
  })
}
