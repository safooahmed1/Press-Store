const columns = `order_id AS orderId, order_number AS orderNumber, created_at AS createdAt,
  payment_method AS paymentMethod, payment_status AS paymentStatus, fulfillment_status AS fulfillmentStatus`

function summaries(rows) {
  return rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }))
}

/** READ-ORD-002. Only lightweight admin-visible order facts leave ORD. */
export function createOrderDashboardProjection(database) {
  return Object.freeze({
    async read({ limit }) {
      if (!Number.isInteger(limit) || limit < 1 || limit > 10) throw new TypeError('Invalid dashboard order limit')
      return database.transaction(async (tx) => {
        const [{ total }] = await tx.query('SELECT COUNT(*) AS total FROM orders')
        const recent = await tx.query(`SELECT ${columns} FROM orders ORDER BY order_id DESC LIMIT ?`, [limit])
        // The lifecycle makes every placed/prepared order actionable. Each branch can
        // read a bounded range from the fulfillment/date index before merging the two.
        const attention = await tx.query(`
          (SELECT ${columns} FROM orders WHERE fulfillment_status = 'placed'
            ORDER BY created_at DESC, order_id DESC LIMIT ?)
          UNION ALL
          (SELECT ${columns} FROM orders WHERE fulfillment_status = 'prepared'
            ORDER BY created_at DESC, order_id DESC LIMIT ?)
          ORDER BY createdAt DESC, orderId DESC LIMIT ?`, [limit, limit, limit])
        return { totalOrders: Number(total), attentionOrders: summaries(attention), recentOrders: summaries(recent) }
      })
    },
  })
}
