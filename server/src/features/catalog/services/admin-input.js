import { CatalogError, exactFields, identity, productInput, text } from './catalog-input.js'

export function adminProductInput(input, updating = false) {
  exactFields(input, ['name', 'description', 'categoryId', 'brandId', 'priceMinor', 'discountPercent', 'variants',
    'bestSeller', 'newArrival', ...(updating ? ['version', 'images'] : [])])
  const { version, images, bestSeller = false, newArrival = false, ...core } = input
  if (typeof bestSeller !== 'boolean' || typeof newArrival !== 'boolean') throw new CatalogError('VALIDATION_FAILED')
  const result = { ...productInput(core), bestSeller, newArrival }
  if (updating) {
    result.version = identity(version)
    if (images !== undefined) {
      if (!Array.isArray(images) || images.length < 1 || images.length > 4) throw new CatalogError('IMAGE_LIMIT_EXCEEDED')
      const used = new Set()
      result.images = images.map((image) => {
        exactFields(image, ['imageId', 'uploadIndex'])
        if (Object.keys(image).length !== 1) throw new CatalogError('VALIDATION_FAILED')
        let normalized
        if (image.imageId !== undefined) normalized = { imageId: identity(image.imageId) }
        else if (Number.isInteger(image.uploadIndex) && image.uploadIndex >= 0 && image.uploadIndex < 4) normalized = { uploadIndex: image.uploadIndex }
        else throw new CatalogError('VALIDATION_FAILED')
        const key = JSON.stringify(normalized)
        if (used.has(key)) throw new CatalogError('VALIDATION_FAILED')
        used.add(key)
        return normalized
      })
    }
  }
  return result
}
export function classificationInput(input, updating = false) {
  exactFields(input, updating ? ['name', 'version'] : ['name'])
  return { name: text(input.name), ...(updating ? { version: identity(input.version) } : {}) }
}
export function deleteInput(input) {
  exactFields(input, ['version'])
  return identity(input.version)
}
