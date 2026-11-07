import { OrderError, fields, identity, version, money, safeMoney, snapshotText } from './order-values.js'

// Trusted READ-CART-001 data only. ORD-003 must obtain a fresh locked snapshot, not client prices.
// CAT owns unit-price rounding; this module checks/copies facts and sums integer minor units.
export function createOrderSnapshots(cart) {
  fields(cart, ['cartId', 'version', 'items', 'subtotalMinor', 'discountMinor', 'totalMinor'])
  identity(cart.cartId); version(cart.version)
  if (!Array.isArray(cart.items) || cart.items.length > 100) throw new OrderError('VALIDATION_FAILED')
  if (!cart.items.length) throw new OrderError('CART_EMPTY')
  const variants = new Set()
  let subtotal = 0n, total = 0n
  const items = Array.from(cart.items, (item, index) => {
    fields(item, ['cartItemId', 'productId', 'productName', 'variantId', 'color', 'size', 'quantity',
      'priceMinor', 'discountPercent', 'currentUnitPriceMinor'])
    identity(item.cartItemId); identity(item.productId); identity(item.variantId)
    if (variants.has(item.variantId)) throw new OrderError('VALIDATION_FAILED')
    variants.add(item.variantId)
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) throw new OrderError('VALIDATION_FAILED')
    money(item.priceMinor); money(item.currentUnitPriceMinor)
    if (item.priceMinor < 1 || item.currentUnitPriceMinor > item.priceMinor
      || typeof item.discountPercent !== 'number' || !Number.isFinite(item.discountPercent)
      || item.discountPercent < 0 || item.discountPercent > 100
      || !/^(?:0|[1-9][0-9]{0,2})(?:\.[0-9]{1,2})?$/.test(String(item.discountPercent))) {
      throw new OrderError('VALIDATION_FAILED')
    }
    const base = BigInt(item.priceMinor) * BigInt(item.quantity)
    const final = BigInt(item.currentUnitPriceMinor) * BigInt(item.quantity)
    subtotal += base; total += final
    return Object.freeze({ position: index + 1, productId: item.productId, variantId: item.variantId,
      productName: snapshotText(item.productName, 255), color: snapshotText(item.color, 100), size: snapshotText(item.size, 100),
      quantity: item.quantity, baseUnitPriceMinor: item.priceMinor, finalUnitPriceMinor: item.currentUnitPriceMinor,
      discountPercent: item.discountPercent, lineSubtotalMinor: safeMoney(base), lineTotalMinor: safeMoney(final),
      lineDiscountMinor: safeMoney(base - final) })
  })
  const subtotalMinor = safeMoney(subtotal), totalMinor = safeMoney(total), discountMinor = safeMoney(subtotal - total)
  if (money(cart.subtotalMinor) !== subtotalMinor || money(cart.totalMinor) !== totalMinor
    || money(cart.discountMinor) !== discountMinor) throw new OrderError('VALIDATION_FAILED')
  return Object.freeze({ items: Object.freeze(items), subtotalMinor, discountMinor, totalMinor })
}
