/** DB-FND-001 only. Raw cookies/session tokens must never cross this persistence boundary. */
export function createSessionRepository(database) {
  return Object.freeze({
    async rotate({ actorType, actorId, previousHash, sessionHash, now, expiresAt }) {
      await database.transaction(async (tx) => {
        if (previousHash) {
          await tx.query('DELETE FROM sessions WHERE session_id_hash = ? AND actor_type = ?',
            [previousHash, actorType])
        }
        await tx.query(`INSERT INTO sessions
          (session_id_hash, actor_type, customer_id, admin_id, expires_at, created_at, last_seen_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [sessionHash, actorType, actorType === 'customer' ? actorId : null,
          actorType === 'admin' ? actorId : null, expiresAt, now, now])
      })
    },
    async findActive(sessionHash, actorType, now) {
      return database.transaction(async (tx) => {
        await tx.query(`UPDATE sessions SET last_seen_at = GREATEST(last_seen_at, ?)
          WHERE session_id_hash = ? AND actor_type = ? AND expires_at > ?`,
        [now, sessionHash, actorType, now])
        const [row] = await tx.query(`SELECT actor_type, customer_id, admin_id FROM sessions
          WHERE session_id_hash = ? AND actor_type = ? AND expires_at > ?`, [sessionHash, actorType, now])
        return row ? { actorType: row.actor_type,
          actorId: row.actor_type === 'customer' ? row.customer_id : row.admin_id } : null
      })
    },
    async revoke(sessionHash, actorType) {
      await database.query('DELETE FROM sessions WHERE session_id_hash = ? AND actor_type = ?',
        [sessionHash, actorType])
    },
  })
}
