import { MAX_ORDER_VERSION, timestamp } from '../domain/order-values.js'

const batchSize = 100
const maxBatches = 10
const eligible = `payment_method = 'cash' AND payment_status = 'unpaid'
  AND fulfillment_status IN ('placed', 'prepared') AND cash_expires_at <= ?
  AND updated_at <= ? AND version < ?`

export async function expireUnpaidCash({ query, cutoff }) {
  const at = new Date(timestamp(cutoff))
  const conditions = [at, at, MAX_ORDER_VERSION]
  let scanned = 0
  let cancelled = 0
  let cursor

  for (let batch = 0; batch < maxBatches; batch++) {
    const after = cursor ? 'AND (cash_expires_at > ? OR (cash_expires_at = ? AND order_id > CAST(? AS UNSIGNED)))' : ''
    const bounds = cursor ? [cursor.expiresAt, cursor.expiresAt, cursor.orderId] : []
    const candidates = await query(`
      SELECT order_id AS orderId, version, CAST(cash_expires_at AS CHAR) AS expiresAt
      FROM orders WHERE ${eligible} ${after}
      ORDER BY cash_expires_at, order_id LIMIT ?`, [...conditions, ...bounds, batchSize])
    if (!candidates.length) break

    const pairs = candidates.map(() => '(CAST(? AS UNSIGNED), ?)').join(', ')
    const identities = candidates.flatMap(({ orderId, version }) => [orderId, version])
    const result = await query(`
      UPDATE orders SET fulfillment_status = 'cancelled', cancelled_at = ?, updated_at = ?, version = version + 1
      WHERE ${eligible} AND (order_id, version) IN (${pairs})`, [at, at, ...conditions, ...identities])
    scanned += candidates.length
    cancelled += result.affectedRows
    if (candidates.length < batchSize) break
    cursor = candidates.at(-1)
  }

  return { scanned, cancelled, skipped: scanned - cancelled }
}
