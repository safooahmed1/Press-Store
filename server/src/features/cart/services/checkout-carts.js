import { createCatalogService } from '../../catalog/services/catalog.js'
import { createCatalogRepository } from '../../catalog/repositories/catalog.js'
import { createCartRepository } from '../repositories/carts.js'
import { CartError, cartInput, identity, quantity, totalMinor, MAX_CART_LINES, MAX_CART_VERSION } from './cart-input.js'

function requireTransaction(tx) {
  if (typeof tx?.query !== 'function' || typeof tx.transaction === 'function') {
    throw new TypeError('Active DB-FND-001 transaction-only handle required')
  }
}

function checkoutInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)
    || Object.keys(input).some((key) => !['customerId', 'expectedCartVersion'].includes(key))) {
    throw new CartError('VALIDATION_FAILED')
  }
  const customerId = identity(input.customerId, 'customerId')
  const { expectedCartVersion } = cartInput('clear', { expectedCartVersion: input.expectedCartVersion })
  if (expectedCartVersion === MAX_CART_VERSION) throw new CartError('CART_CONFLICT')
  return { customerId, expectedCartVersion }
}

// Trusted server boundary for READ-CART-001 / CMD-CART-001, not an HTTP or order service.
export function createCartCheckoutService({ database }) {
  const repository = createCartRepository(database)
  const catalog = createCatalogService({ repository: createCatalogRepository(database) })
  const snapshots = new WeakMap()
  return Object.freeze({
    async readForCheckout(tx, input) {
      requireTransaction(tx)
      const { customerId, expectedCartVersion } = checkoutInput(input)
      const locked = await repository.lockForCheckout(tx, customerId)
      if (!locked) throw new CartError('CART_EMPTY')
      const { cart, items } = locked
      if (cart.version !== expectedCartVersion) throw new CartError('CART_CONFLICT')
      if (!items.length) throw new CartError('CART_EMPTY')
      if (items.length > MAX_CART_LINES) throw new CartError('VALIDATION_FAILED')
      const ids = items.map((item) => {
        quantity(item.quantity)
        return identity(item.variantId, 'variantId')
      })
      if (new Set(ids).size !== ids.length) throw new CartError('VALIDATION_FAILED')
      const rows = await catalog.readVariantsForCheckout(ids, tx)
      const byId = new Map()
      for (const row of rows) {
        if (!ids.includes(row.variantId) || byId.has(row.variantId)
          || typeof row.productName !== 'string' || !row.productName
          || !Number.isSafeInteger(row.priceMinor) || row.priceMinor < 1
          || !Number.isSafeInteger(row.finalPriceMinor) || row.finalPriceMinor < 0 || row.finalPriceMinor > row.priceMinor
          || !Number.isFinite(row.discountPercent) || row.discountPercent < 0 || row.discountPercent > 100
          || typeof row.isAvailable !== 'boolean') throw new CartError('CATALOG_UNAVAILABLE')
        byId.set(row.variantId, row)
      }
      const projected = items.map((item) => {
        const row = byId.get(item.variantId)
        if (!row?.isAvailable) throw new CartError('VARIANT_UNAVAILABLE')
        return Object.freeze({ cartItemId: item.cartItemId, productId: row.productId, productName: row.productName,
          variantId: item.variantId, color: row.color, size: row.size, quantity: item.quantity,
          priceMinor: row.priceMinor, discountPercent: row.discountPercent, currentUnitPriceMinor: row.finalPriceMinor })
      })
      const total = totalMinor(projected)
      const subtotal = totalMinor(projected.map((item) => ({ ...item, currentUnitPriceMinor: item.priceMinor })))
      const snapshot = Object.freeze({ cartId: cart.cartId, version: cart.version, items: Object.freeze(projected),
        subtotalMinor: subtotal, discountMinor: subtotal - total, totalMinor: total })
      snapshots.set(snapshot, { tx, customerId, consumed: false })
      return snapshot
    },
    async clearForCheckout(tx, snapshot) {
      requireTransaction(tx)
      const issued = snapshot && typeof snapshot === 'object' ? snapshots.get(snapshot) : undefined
      if (!issued || issued.tx !== tx || issued.consumed) throw new CartError('CART_CONFLICT')
      await repository.clearForCheckout(tx, { customerId: issued.customerId,
        cartId: snapshot.cartId, version: snapshot.version })
      issued.consumed = true
      return Object.freeze({ cartId: snapshot.cartId, version: snapshot.version + 1 })
    },
  })
}
