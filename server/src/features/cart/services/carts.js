import { CartError, cartInput, identity, quantity, totalMinor, MAX_CART_LINES } from './cart-input.js'

// The manifest supplies READ-CAT-001; tests may explicitly inject a catalog fixture.
// There is no default, mock or cross-owner SQL fallback in production.
export function createCartService({ repository, readVariants }) {
  if (typeof repository?.withLockedCart !== 'function' || typeof readVariants !== 'function') {
    throw new TypeError('Cart repository and catalog batch reader required')
  }
  async function catalogRows(ids, tx, optionalId) {
    if (!ids.length) return new Map()
    const rows = await readVariants(ids, tx)
    if (!Array.isArray(rows)) throw new CartError('CATALOG_UNAVAILABLE')
    const result = new Map()
    for (const row of rows) {
      if (!row || !ids.includes(row.variantId) || result.has(row.variantId)
        || typeof row.productId !== 'string' || !/^[1-9][0-9]{0,19}$/.test(row.productId)
        || BigInt(row.productId) > 18446744073709551615n
        || typeof row.color !== 'string' || !row.color || typeof row.size !== 'string' || !row.size
        || !Number.isSafeInteger(row.finalPriceMinor) || row.finalPriceMinor < 0
        || typeof row.isAvailable !== 'boolean') throw new CartError('CATALOG_UNAVAILABLE')
      result.set(row.variantId, row)
    }
    if (ids.some((id) => !result.has(id) && id !== optionalId)) throw new CartError('CATALOG_UNAVAILABLE')
    return result
  }
  function project(cart, items, variants) {
    const projected = items.map((item) => {
      const row = variants.get(item.variantId)
      if (!row) throw new CartError('CATALOG_UNAVAILABLE')
      return { cartItemId: item.cartItemId, productId: row.productId, variantId: item.variantId,
        color: row.color, size: row.size, quantity: item.quantity,
        currentUnitPriceMinor: row.finalPriceMinor, isAvailable: row.isAvailable }
    })
    return { cartId: cart.cartId, version: cart.version, items: projected, totalMinor: totalMinor(projected) }
  }
  async function refreshPrices(items, variants, operations) {
    for (const item of items) {
      const price = variants.get(item.variantId).finalPriceMinor
      if (String(item.cachedPriceMinor) !== String(price)) await operations.refreshPrice(item.cartItemId, price)
    }
  }
  return Object.freeze({
    async current(customerId) {
      identity(customerId, 'customerId')
      return repository.withLockedCart(customerId, async ({ cart, items, tx, operations }) => {
        const variants = await catalogRows(items.map((item) => item.variantId), tx)
        const result = project(cart, items, variants)
        await refreshPrices(items, variants, operations)
        return result
      })
    },
    async mutate(customerId, action, input, itemId) {
      identity(customerId, 'customerId')
      const parsed = cartInput(action, input)
      if (['update', 'remove'].includes(action)) identity(itemId, 'id')
      return repository.withLockedCart(customerId, async ({ cart, items, tx, operations }) => {
        if (cart.version !== parsed.expectedCartVersion) throw new CartError('CART_CONFLICT')
        const item = action === 'add' ? items.find((row) => row.variantId === parsed.variantId)
          : items.find((row) => row.cartItemId === itemId)
        if (action === 'update' && !item) throw new CartError('NOT_FOUND')
        if (action === 'add' && !item && items.length >= MAX_CART_LINES) throw new CartError('VALIDATION_FAILED', 'items')
        const nextQuantity = action === 'add' ? quantity((item?.quantity ?? 0) + parsed.quantity) : parsed.quantity
        const ids = [...new Set([...items.map((row) => row.variantId), ...(action === 'add' ? [parsed.variantId] : [])])]
        const variants = await catalogRows(ids, tx, action === 'add' && !item ? parsed.variantId : undefined)
        if (['add', 'update'].includes(action)) {
          const variant = variants.get(action === 'add' ? parsed.variantId : item.variantId)
          if (!variant?.isAvailable) throw new CartError('VARIANT_UNAVAILABLE')
        }
        let changed = true
        if (action === 'add' && !item) await operations.add(parsed.variantId, nextQuantity, variants.get(parsed.variantId).finalPriceMinor)
        else if (action === 'add' || action === 'update') {
          changed = item.quantity !== nextQuantity
          if (changed) await operations.update(item.cartItemId, nextQuantity, variants.get(item.variantId).finalPriceMinor)
        } else if (action === 'remove') {
          changed = Boolean(item)
          if (changed) await operations.remove(itemId)
        } else {
          changed = items.length > 0
          if (changed) await operations.clear()
        }
        if (changed) await operations.incrementVersion()
        const remaining = await operations.readItems()
        // Validate JSON money bounds before commit; failure rolls back every selection change.
        const result = project(cart, remaining, variants)
        await refreshPrices(remaining, variants, operations)
        return result
      })
    },
  })
}
