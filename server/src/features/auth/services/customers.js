import { randomBytes } from 'node:crypto'
import { createIdentityRepository } from '../repositories/identities.js'
import { hashPassword, verifyPassword } from './passwords.js'
import { createSessionRepository } from '../../../platform/auth/session-repository.js'
import { createSessionService } from '../../../platform/auth/sessions.js'

export class CustomerAuthError extends Error {
  constructor(code) { super(code); this.name = 'CustomerAuthError'; this.code = code }
}

/** Input is already validated. The service never exposes stored credentials or session digests. */
export async function createCustomerService({ database, clock = () => new Date() }) {
  const identities = createIdentityRepository(database)
  const sessions = createSessionService({ repository: createSessionRepository(database), clock })
  // Compute before listening: an absent customer still performs the same fixed-cost verification.
  const dummyHash = await hashPassword(randomBytes(32).toString('base64url'))
  return Object.freeze({
    async register(input, previousToken) {
      const passwordHash = await hashPassword(input.password)
      const now = clock()
      if (!(now instanceof Date) || !Number.isFinite(now.getTime())) throw new Error('Invalid auth clock')
      try {
        return await database.transaction(async (tx) => {
          const customer = await createIdentityRepository(tx).createCustomer({ ...input, passwordHash, now })
          if (!customer) throw new Error('Customer insert did not produce an identity')
          // Join this AUTH registration transaction; DB-FND-001 forbids nested transactions.
          const transactionDatabase = { query: tx.query, transaction: (work) => work(tx) }
          const joined = createSessionService({ repository: createSessionRepository(transactionDatabase),
            clock: () => new Date(now) })
          const session = await joined.create({ actorType: 'customer', actorId: customer.customerId, previousToken })
          return { customer, session }
        })
      } catch (error) {
        // Inspect only after rollback: a failed FND transaction cannot execute further queries.
        if (error.code === 'DB_CONSTRAINT_FAILED' && await identities.readCustomerByPhone(input.phone)) {
          throw new CustomerAuthError('PHONE_UNAVAILABLE')
        }
        throw error
      }
    },
    async login(input, previousToken) {
      const credentials = await identities.findCustomerCredentials(input.phone)
      const matches = await verifyPassword(input.password, credentials?.passwordHash ?? dummyHash)
      if (!credentials || !matches) throw new CustomerAuthError('INVALID_CREDENTIALS')
      const { passwordHash: omitted, ...customer } = credentials
      void omitted
      const session = await sessions.create({ actorType: 'customer', actorId: customer.customerId, previousToken })
      return { customer, session }
    },
    async account(token) {
      const actor = await sessions.find(token, 'customer')
      if (!actor) throw new CustomerAuthError('AUTH_REQUIRED')
      const customer = await identities.readCustomerSummary(actor.actorId)
      if (!customer) throw new CustomerAuthError('AUTH_REQUIRED')
      return customer
    },
    async logout(token) { await sessions.revoke(token, 'customer') },
  })
}
