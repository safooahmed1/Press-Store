export const MAX_CART_LINES = 100
export const MAX_ITEM_QUANTITY = 99
export const MAX_CART_VERSION = 4294967295

export class CartError extends Error {
  constructor(code, field = undefined) {
    super(code)
    this.name = 'CartError'
    this.code = code
    this.field = field
  }
}

export function identity(value, field = 'id') {
  if (typeof value !== 'string' || !/^[1-9][0-9]{0,19}$/.test(value)
    || BigInt(value) > 18446744073709551615n) throw new CartError('VALIDATION_FAILED', field)
  return value
}

export function quantity(value) {
  if (!Number.isInteger(value) || value < 1 || value > MAX_ITEM_QUANTITY) {
    throw new CartError('VALIDATION_FAILED', 'quantity')
  }
  return value
}

export function cartInput(action, input) {
  const fields = { add: ['variantId', 'quantity', 'expectedCartVersion'],
    update: ['quantity', 'expectedCartVersion'], remove: ['expectedCartVersion'], clear: ['expectedCartVersion'] }
  if (!Object.hasOwn(fields, action)) throw new TypeError('Unknown cart action')
  if (!input || typeof input !== 'object' || Array.isArray(input)
    || Object.keys(input).some((key) => !fields[action].includes(key))) {
    throw new CartError('VALIDATION_FAILED', 'body')
  }
  if (!Number.isInteger(input.expectedCartVersion) || input.expectedCartVersion < 1
    || input.expectedCartVersion > MAX_CART_VERSION) throw new CartError('VALIDATION_FAILED', 'expectedCartVersion')
  return { expectedCartVersion: input.expectedCartVersion,
    ...(action === 'add' ? { variantId: identity(input.variantId, 'variantId') } : {}),
    ...(['add', 'update'].includes(action) ? { quantity: quantity(input.quantity) } : {}) }
}

// Exact arithmetic before crossing the JSON safe-integer boundary.
export function totalMinor(items) {
  let total = 0n
  for (const item of items) {
    if (!Number.isSafeInteger(item.currentUnitPriceMinor) || item.currentUnitPriceMinor < 0) {
      throw new CartError('VALIDATION_FAILED', 'totalMinor')
    }
    quantity(item.quantity)
    total += BigInt(item.currentUnitPriceMinor) * BigInt(item.quantity)
  }
  if (total > BigInt(Number.MAX_SAFE_INTEGER)) throw new CartError('VALIDATION_FAILED', 'totalMinor')
  return Number(total)
}
