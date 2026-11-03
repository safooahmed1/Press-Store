export class CatalogError extends Error {
  constructor(code) {
    super(code)
    this.name = 'CatalogError'
    this.code = code
  }
}

export function exactFields(input, allowed) {
  if (!input || typeof input !== 'object' || Array.isArray(input)
    || Object.keys(input).some((key) => !allowed.includes(key))) {
    throw new CatalogError('VALIDATION_FAILED')
  }
}

export function text(value, maximum = 255) {
  if (typeof value !== 'string' || !value.isWellFormed()) throw new CatalogError('VALIDATION_FAILED')
  const trimmed = value.trim()
  if (!trimmed || [...trimmed].length > maximum
    || [...trimmed].some((character) => {
      const point = character.codePointAt(0)
      return point < 32 || (point >= 127 && point <= 159)
    })) throw new CatalogError('VALIDATION_FAILED')
  return trimmed
}

export function identity(value) {
  if (typeof value !== 'string' || !/^[1-9][0-9]{0,19}$/.test(value)
    || BigInt(value) > 18446744073709551615n) throw new CatalogError('VALIDATION_FAILED')
  return value
}

// Canonical decimal percent, converted through decimal digits, never float multiplication.
export function discountBasisPoints(value = 0) {
  if (!['number', 'string'].includes(typeof value)
    || !/^(?:0|[1-9][0-9]{0,2})(?:\.[0-9]{1,2})?$/.test(String(value))) {
    throw new CatalogError('VALIDATION_FAILED')
  }
  const [whole, fraction = ''] = String(value).split('.')
  const points = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'))
  if (points > 10000n) throw new CatalogError('VALIDATION_FAILED')
  return points
}

export function calculateFinalPrice(priceMinor, discountPercent = 0) {
  if (!Number.isSafeInteger(priceMinor) || priceMinor < 1) throw new CatalogError('VALIDATION_FAILED')
  const points = discountBasisPoints(discountPercent)
  return Number((BigInt(priceMinor) * (10000n - points) + 5000n) / 10000n)
}

export function productInput(input) {
  exactFields(input, ['name', 'description', 'categoryId', 'brandId', 'priceMinor', 'discountPercent', 'variants'])
  const points = discountBasisPoints(input.discountPercent)
  calculateFinalPrice(input.priceMinor, input.discountPercent)
  if (!Array.isArray(input.variants) || input.variants.length > 1000) throw new CatalogError('VALIDATION_FAILED')
  const pairs = new Set()
  const variants = input.variants.map((variant) => {
    exactFields(variant, ['color', 'size', 'isAvailable'])
    const color = text(variant.color, 100)
    const size = text(variant.size, 100)
    const key = JSON.stringify([color, size])
    if (pairs.has(key)) throw new CatalogError('DUPLICATE_VARIANT')
    pairs.add(key)
    if (variant.isAvailable !== undefined && typeof variant.isAvailable !== 'boolean') {
      throw new CatalogError('VALIDATION_FAILED')
    }
    return { color, size, isAvailable: variant.isAvailable ?? true }
  })
  return { name: text(input.name), description: text(input.description, 10000),
    categoryId: identity(input.categoryId), brandId: identity(input.brandId), priceMinor: input.priceMinor,
    discountPercent: `${points / 100n}.${String(points % 100n).padStart(2, '0')}`, variants }
}
