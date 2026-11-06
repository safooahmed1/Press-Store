import { CartError, identity, MAX_CART_VERSION } from '../services/cart-input.js'

// Owns only CART SQL. Catalog data must arrive through an owner-provided service.
export function createCartRepository(database) {
  if (typeof database?.transaction !== 'function') throw new TypeError('Cart database required')
  return Object.freeze({
    async lockForCheckout(tx, customerId) {
      const [cart] = await tx.query(`SELECT cart_id AS cartId, version FROM carts
        WHERE customer_id = ? FOR UPDATE`, [customerId])
      if (!cart) return null
      const items = await tx.query(`SELECT cart_item_id AS cartItemId, variant_id AS variantId, quantity
        FROM cart_items WHERE cart_id = ? ORDER BY cart_item_id LIMIT 101 FOR UPDATE`, [cart.cartId])
      return { cart, items }
    },
    async clearForCheckout(tx, { customerId, cartId, version }) {
      const result = await tx.query(`UPDATE carts SET version = version + 1, updated_at = UTC_TIMESTAMP(6)
        WHERE cart_id = ? AND customer_id = ? AND version = ? AND version < ?`,
      [cartId, customerId, version, MAX_CART_VERSION])
      if (result.affectedRows !== 1) throw new CartError('CART_CONFLICT')
      await tx.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId])
    },
    async withLockedCart(customerId, work) {
      identity(customerId, 'customerId')
      return database.transaction(async (tx) => {
        // The unique customer key serializes concurrent lazy creation, even before a cart exists.
        await tx.query(`INSERT INTO carts (customer_id, created_at, updated_at)
          VALUES (?, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)) ON DUPLICATE KEY UPDATE cart_id = cart_id`, [customerId])
        const [cart] = await tx.query(`SELECT cart_id AS cartId, version FROM carts WHERE customer_id = ? FOR UPDATE`, [customerId])
        const items = await tx.query(`SELECT cart_item_id AS cartItemId, variant_id AS variantId,
          quantity, current_unit_price_minor AS cachedPriceMinor FROM cart_items WHERE cart_id = ? ORDER BY cart_item_id FOR UPDATE`, [cart.cartId])
        const operations = Object.freeze({
          async add(variantId, count, price) {
            await tx.query(`INSERT INTO cart_items (cart_id, variant_id, quantity, current_unit_price_minor, created_at, updated_at)
              VALUES (?, ?, ?, ?, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6))`, [cart.cartId, variantId, count, price])
          },
          async update(itemId, count, price) {
            await tx.query(`UPDATE cart_items SET quantity = ?, current_unit_price_minor = ?, updated_at = UTC_TIMESTAMP(6)
              WHERE cart_id = ? AND cart_item_id = ?`, [count, price, cart.cartId, itemId])
          },
          async remove(itemId) {
            await tx.query('DELETE FROM cart_items WHERE cart_id = ? AND cart_item_id = ?', [cart.cartId, itemId])
          },
          async clear() { await tx.query('DELETE FROM cart_items WHERE cart_id = ?', [cart.cartId]) },
          async refreshPrice(itemId, price) {
            await tx.query(`UPDATE cart_items SET current_unit_price_minor = ?, updated_at = UTC_TIMESTAMP(6)
              WHERE cart_id = ? AND cart_item_id = ?`, [price, cart.cartId, itemId])
          },
          async incrementVersion() {
            if (cart.version === MAX_CART_VERSION) throw new CartError('CART_CONFLICT')
            await tx.query('UPDATE carts SET version = version + 1, updated_at = UTC_TIMESTAMP(6) WHERE cart_id = ?', [cart.cartId])
            cart.version += 1
          },
          async readItems() {
            return tx.query(`SELECT cart_item_id AS cartItemId, variant_id AS variantId, quantity,
              current_unit_price_minor AS cachedPriceMinor FROM cart_items WHERE cart_id = ? ORDER BY cart_item_id`, [cart.cartId])
          },
        })
        return work({ cart, items, tx, operations })
      })
    },
  })
}
