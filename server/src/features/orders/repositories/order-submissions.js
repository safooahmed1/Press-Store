import { readOrderItems } from './order-items.js'

export function createOrderSubmissionRepository(database) {
  return Object.freeze({
    async findSubmission(customerId, keyHash) {
      const [row] = await database.query(`
        SELECT r.request_hash AS requestHash, o.order_id AS orderId, o.order_number AS orderNumber,
          o.payment_method AS paymentMethod, o.subtotal_minor AS subtotalMinor,
          o.discount_minor AS discountMinor, o.total_minor AS totalMinor
        FROM order_idempotency_records r
        JOIN orders o ON o.order_id = r.order_id AND o.customer_id = r.customer_id
        WHERE r.customer_id = ? AND r.idempotency_key_hash = ?`, [customerId, keyHash])
      if (!row) return null
      return { ...row, subtotalMinor: Number(row.subtotalMinor), discountMinor: Number(row.discountMinor),
        totalMinor: Number(row.totalMinor) }
    },

    readItems: (orderId) => readOrderItems(database, orderId),

    async insert(tx, { customerId, orderNumber, walletSenderNumber, state, snapshot, keyHash, requestHash }) {
      const createdAt = new Date(state.createdAt)
      await tx.query(`
        INSERT INTO orders (order_number, customer_id, payment_method, wallet_sender_number,
          payment_status, fulfillment_status, subtotal_minor, discount_minor, total_minor,
          cash_expires_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        orderNumber, customerId, state.paymentMethod, walletSenderNumber, state.paymentStatus,
        state.fulfillmentStatus, snapshot.subtotalMinor, snapshot.discountMinor, snapshot.totalMinor,
        state.cashExpiresAt === null ? null : new Date(state.cashExpiresAt), createdAt, createdAt,
      ])
      const [{ orderId }] = await tx.query('SELECT CAST(LAST_INSERT_ID() AS CHAR) AS orderId')
      const placeholders = snapshot.items.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ')
      const values = snapshot.items.flatMap((item) => [
        orderId, item.position, item.productId, item.variantId, item.productName, item.color, item.size,
        item.quantity, item.baseUnitPriceMinor, item.finalUnitPriceMinor, item.discountPercent, createdAt,
      ])
      await tx.query(`
        INSERT INTO order_items (order_id, position, product_id, variant_id, product_name, color,
          size, quantity, base_unit_price_minor, final_unit_price_minor, discount_percent, created_at)
        VALUES ${placeholders}`, values)
      await tx.query(`
        INSERT INTO order_idempotency_records (customer_id, idempotency_key_hash, request_hash, order_id, created_at)
        VALUES (?, ?, ?, ?, ?)`, [customerId, keyHash, requestHash, orderId, createdAt])
      return orderId
    },
  })
}
