import { CatalogError, identity, exactFields, calculateFinalPrice } from './catalog-input.js'
import { createMerchandisingRepository } from '../repositories/merchandising.js'

export function createMerchandisingService({ database, imageUrl }) {
  const repository = createMerchandisingRepository(database)
  function summary(row, variants) {
    if (!row.image_path) throw new Error('Product image unavailable')
    const priceMinor = Number(row.price_minor)
    return { productId: row.product_id, name: row.name, priceMinor, discountPercent: Number(row.discount_percent),
      finalPriceMinor: calculateFinalPrice(priceMinor, row.discount_percent), mainImageUrl: imageUrl(row.image_path),
      availableVariants: variants.filter((variant) => variant.product_id === row.product_id)
        .map((variant) => ({ variantId: variant.variant_id, color: variant.color, size: variant.size })) }
  }
  return Object.freeze({
    async read() {
      const result = await repository.read()
      const bestIds = new Set(result.bestSellerProductIds)
      const newIds = new Set(result.newArrivalProductIds)
      return { version: result.version, bestSellerProductIds: [...bestIds], newArrivalProductIds: [...newIds],
        bestSellers: result.rows.filter((row) => bestIds.has(row.product_id)).map((row) => summary(row, result.variants)),
        newArrivals: result.rows.filter((row) => newIds.has(row.product_id)).map((row) => summary(row, result.variants)),
        categories: result.categories.map((row) => ({ categoryId: row.category_id, name: row.name, imageUrl: imageUrl(row.image_path) })) }
    },
    async replace(kind, input) {
      exactFields(input, ['productIds', 'version'])
      if (!Number.isInteger(input.version) || input.version < 1 || input.version > 4294967294
        || !Array.isArray(input.productIds)) throw new CatalogError('VALIDATION_FAILED')
      if (input.productIds.length > 8) throw new CatalogError('CURATION_LIMIT_EXCEEDED')
      const ids = input.productIds.map(identity)
      if (new Set(ids).size !== ids.length || ids.some((id) => BigInt(id).toString() !== id)) throw new CatalogError('VALIDATION_FAILED')
      return repository.replace(kind, { version: input.version, productIds: ids })
    },
  })
}
