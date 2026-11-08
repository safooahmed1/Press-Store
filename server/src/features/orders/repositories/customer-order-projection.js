import { identity } from '../domain/order-values.js'

/** READ-ORD-001. Admin-visible history includes cancelled orders. */
export function createCustomerOrderProjection(database) {
  return Object.freeze({
    async countByCustomerIds(customerIds) {
      if (!Array.isArray(customerIds) || customerIds.length > 50 || new Set(customerIds).size !== customerIds.length) {
        throw new TypeError('Invalid customer ID batch')
      }
      for (const customerId of customerIds) identity(customerId)
      if (!customerIds.length) return new Map()
      const placeholders = customerIds.map(() => 'CAST(? AS UNSIGNED)').join(', ')
      const rows = await database.query(`SELECT customer_id AS customerId, COUNT(*) AS orderCount FROM orders
        WHERE customer_id IN (${placeholders}) GROUP BY customer_id`, customerIds)
      return new Map(rows.map(({ customerId, orderCount }) => [customerId, Number(orderCount)]))
    },

    async readCustomerOrders(customerId, { limit, offset }) {
      identity(customerId)
      if (!Number.isInteger(limit) || limit < 1 || limit > 50 || !Number.isSafeInteger(offset) || offset < 0) {
        throw new TypeError('Invalid customer order pagination')
      }
      return database.transaction(async (tx) => {
        const [{ total }] = await tx.query('SELECT COUNT(*) AS total FROM orders WHERE customer_id = ?', [customerId])
        const rows = await tx.query(`SELECT order_id AS orderId, order_number AS orderNumber, created_at AS createdAt,
          total_minor AS totalMinor, payment_method AS paymentMethod, payment_status AS paymentStatus,
          fulfillment_status AS fulfillmentStatus
          FROM orders WHERE customer_id = ? ORDER BY created_at DESC, order_id DESC LIMIT ? OFFSET ?`,
        [customerId, limit, offset])
        return { items: rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString(),
          totalMinor: Number(row.totalMinor) })), total: Number(total) }
      })
    },
  })
}
