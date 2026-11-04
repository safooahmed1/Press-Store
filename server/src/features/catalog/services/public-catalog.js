import { CatalogError, calculateFinalPrice, identity } from './catalog-input.js'

function totalNumber(value) {
  const number = Number(value)
  if (!Number.isSafeInteger(number) || number < 0) throw new Error('Invalid catalog count')
  return number
}

export function createPublicCatalogService({ repository, imageUrl }) {
  function summary(row, variants) {
    if (!row.mainImagePath) throw new Error('Catalog image invariant failed')
    const priceMinor = Number(row.priceMinor)
    return { productId: row.productId, name: row.name, priceMinor, discountPercent: Number(row.discountPercent),
      finalPriceMinor: calculateFinalPrice(priceMinor, row.discountPercent), mainImageUrl: imageUrl(row.mainImagePath),
      availableVariants: variants.filter((variant) => variant.productId === row.productId)
        .map(({ variantId, color, size }) => ({ variantId, color, size })) }
  }
  return Object.freeze({
    async list(filters) {
      const result = await repository.list(filters)
      return { data: { items: result.rows.map((row) => summary(row, result.variants)) },
        meta: { page: filters.page, pageSize: filters.pageSize, total: totalNumber(result.total) } }
    },
    async detail(productId) {
      identity(productId)
      const result = await repository.detail(productId)
      if (!result) throw new CatalogError('PRODUCT_NOT_FOUND')
      const { row, images, variants } = result
      return { ...summary(row, variants), description: row.description,
        category: { categoryId: row.categoryId, name: row.categoryName },
        brand: { brandId: row.brandId, name: row.brandName },
        images: images.map(({ imagePath, slot }) => ({ role: slot === 0 ? 'main' : 'additional', order: slot,
          imageUrl: imageUrl(imagePath) })) }
    },
    async classifications(kind, filters) {
      const result = await repository.classifications(kind, filters)
      return { data: { items: result.rows.map((row) => kind === 'category'
        ? { categoryId: row.id, name: row.name, imageUrl: imageUrl(row.imagePath) }
        : { brandId: row.id, name: row.name }) },
      meta: { page: filters.page, pageSize: filters.pageSize, total: totalNumber(result.total) } }
    },
  })
}
