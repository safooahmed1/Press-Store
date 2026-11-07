const mutableColumns = {
  paymentStatus: 'payment_status', fulfillmentStatus: 'fulfillment_status', version: 'version',
  cashExpiresAt: 'cash_expires_at', paidAt: 'paid_at', verifiedByAdminId: 'verified_by_admin_id',
  preparedAt: 'prepared_at', preparedByAdminId: 'prepared_by_admin_id',
  deliveredAt: 'delivered_at', deliveredByAdminId: 'delivered_by_admin_id', updatedAt: 'updated_at',
}
const stateColumns = {
  paymentMethod: 'payment_method', createdAt: 'created_at', cancelledAt: 'cancelled_at', ...mutableColumns,
}
const stateSelect = Object.entries(stateColumns).map(([field, column]) => `${column} AS ${field}`).join(', ')

function stateFromRow(row) {
  return Object.freeze(Object.fromEntries(Object.keys(stateColumns).map((field) => [
    field, row[field] instanceof Date ? row[field].toISOString() : row[field],
  ])))
}

export function createAdminOrderRepository(database) {
  return Object.freeze({
    async list({ page, pageSize }) {
      return database.transaction(async (tx) => {
        const [{ total }] = await tx.query('SELECT COUNT(*) AS total FROM orders')
        const rows = await tx.query(`
          SELECT o.*, (SELECT COALESCE(SUM(i.quantity), 0) FROM order_items i WHERE i.order_id = o.orderId) AS itemCount
          FROM (
            SELECT order_id AS orderId, order_number AS orderNumber, customer_id AS customerId, created_at AS createdAt,
              total_minor AS totalMinor, payment_method AS paymentMethod, payment_status AS paymentStatus,
              fulfillment_status AS fulfillmentStatus, version
            FROM orders ORDER BY order_id DESC LIMIT ? OFFSET ?
          ) o ORDER BY o.orderId DESC`, [pageSize, (page - 1) * pageSize])
        return { rows, total: Number(total) }
      })
    },

    async detail(orderId) {
      const [row] = await database.query(`
        SELECT order_id AS orderId, order_number AS orderNumber, customer_id AS customerId,
          wallet_sender_number AS walletSenderNumber, subtotal_minor AS subtotalMinor,
          discount_minor AS discountMinor, total_minor AS totalMinor, ${stateSelect}
        FROM orders WHERE order_id = ?`, [orderId])
      if (!row) return null
      return { orderId: row.orderId, orderNumber: row.orderNumber, customerId: row.customerId,
        walletSenderNumber: row.walletSenderNumber, subtotalMinor: Number(row.subtotalMinor),
        discountMinor: Number(row.discountMinor), totalMinor: Number(row.totalMinor), state: stateFromRow(row) }
    },

    async lockState(tx, orderId) {
      const [row] = await tx.query(`SELECT ${stateSelect} FROM orders WHERE order_id = ? FOR UPDATE`, [orderId])
      return row ? stateFromRow(row) : null
    },

    async updateState(tx, orderId, previous, next) {
      // Keep established audit fields byte-for-byte, including any stored fractional seconds.
      const changes = Object.entries(mutableColumns).filter(([field]) => previous[field] !== next[field])
      const assignments = changes.map(([, column]) => `${column} = ?`).join(', ')
      const values = changes.map(([field]) => field.endsWith('At') && next[field] !== null
        ? new Date(next[field]) : next[field])
      const result = await tx.query(`UPDATE orders SET ${assignments} WHERE order_id = ? AND version = ?`,
        [...values, orderId, previous.version])
      return result.affectedRows === 1
    },
  })
}
