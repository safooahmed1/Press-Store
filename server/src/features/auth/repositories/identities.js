import { normalizePhone } from '../services/auth-validation.js'

function customerSummary(row) {
  return row ? { customerId: row.customer_id, firstName: row.first_name,
    lastName: row.last_name, phone: row.phone } : null
}

/** Credential methods are server-internal; only explicit summaries may become API DTOs. */
export function createIdentityRepository(database) {
  return Object.freeze({
    async createCustomer({ firstName, lastName, phone, passwordHash, now }) {
      await database.query(`INSERT INTO customers
        (first_name, last_name, phone, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, phone, passwordHash, now, now])
      return this.readCustomerByPhone(phone)
    },
    async readCustomerByPhone(phone) {
      const [row] = await database.query(`SELECT customer_id, first_name, last_name, phone
        FROM customers WHERE phone = ?`, [normalizePhone(phone)])
      return customerSummary(row)
    },
    async findCustomerCredentials(phone) {
      const [row] = await database.query(`SELECT customer_id, first_name, last_name, phone, password_hash
        FROM customers WHERE phone = ?`, [normalizePhone(phone)])
      return row ? { ...customerSummary(row), passwordHash: row.password_hash } : null
    },
    async findAdminCredentials(phone) {
      const [row] = await database.query(`SELECT admin_id, password_hash FROM admins
        WHERE admin_id = 1 AND phone = ?`, [normalizePhone(phone)])
      return row ? { adminId: row.admin_id, passwordHash: row.password_hash } : null
    },
    async readCustomerSummary(customerId) {
      // IDs are strings because DB-FND-001 preserves BIGINT precision.
      if (typeof customerId !== 'string' || !/^[1-9][0-9]{0,19}$/.test(customerId)
        || BigInt(customerId).toString() !== customerId || BigInt(customerId) > 18446744073709551615n) {
        throw new TypeError('Invalid customer identity')
      }
      const [row] = await database.query(`SELECT customer_id, first_name, last_name, phone
        FROM customers WHERE customer_id = ?`, [customerId])
      return customerSummary(row)
    },
  })
}
