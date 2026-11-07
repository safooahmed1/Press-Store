import { readOrderItems } from '../repositories/order-items.js'

const activeOwner = "customer_id = ? AND fulfillment_status <> 'cancelled'"
const summaryColumns = `order_id AS orderId, order_number AS orderNumber, created_at AS createdAt,
  total_minor AS totalMinor, payment_method AS paymentMethod, payment_status AS paymentStatus,
  fulfillment_status AS fulfillmentStatus`

function orderSummary(row) {
  const { orderId, orderNumber, createdAt, totalMinor, paymentMethod, paymentStatus, fulfillmentStatus } = row
  return { orderId, orderNumber, createdAt: createdAt.toISOString(), totalMinor: Number(totalMinor),
    paymentMethod, paymentStatus, fulfillmentStatus }
}

export function createCustomerOrderRepository(database) {
  return Object.freeze({
    async list(customerId, { page, pageSize }) {
      return database.transaction(async (tx) => {
        const [{ total }] = await tx.query(`SELECT COUNT(*) AS total FROM orders WHERE ${activeOwner}`, [customerId])
        const rows = await tx.query(`SELECT ${summaryColumns} FROM orders WHERE ${activeOwner}
          ORDER BY created_at DESC, order_id DESC LIMIT ? OFFSET ?`, [customerId, pageSize, (page - 1) * pageSize])
        return { items: rows.map(orderSummary), total: Number(total) }
      })
    },

    async detail(customerId, orderId) {
      return database.transaction(async (tx) => {
        const [row] = await tx.query(`SELECT ${summaryColumns}, subtotal_minor AS subtotalMinor,
          discount_minor AS discountMinor, cash_expires_at AS cashExpiresAt
          FROM orders WHERE ${activeOwner} AND order_id = ?`, [customerId, orderId])
        if (!row) return null
        return { ...orderSummary(row), subtotalMinor: Number(row.subtotalMinor), discountMinor: Number(row.discountMinor),
          cashExpiresAt: row.cashExpiresAt?.toISOString() ?? null, items: await readOrderItems(tx, orderId) }
      })
    },
  })
}
