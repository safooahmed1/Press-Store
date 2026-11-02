import { randomBytes } from 'node:crypto'
import { createIdentityRepository } from '../repositories/identities.js'
import { hashPassword, verifyPassword } from './passwords.js'
import { createSessionRepository } from '../../../platform/auth/session-repository.js'
import { createSessionService } from '../../../platform/auth/sessions.js'

export class AdminAuthError extends Error {
  constructor(code) { super(code); this.name = 'AdminAuthError'; this.code = code }
}

export async function createAdminService({ database, clock = () => new Date() }) {
  const identities = createIdentityRepository(database)
  const sessions = createSessionService({ repository: createSessionRepository(database), clock })
  const dummyHash = await hashPassword(randomBytes(32).toString('base64url'))
  return Object.freeze({
    async login(input, previousToken) {
      const credentials = await identities.findAdminCredentials(input.phone)
      const matches = await verifyPassword(input.password, credentials?.passwordHash ?? dummyHash)
      if (!credentials || !matches) throw new AdminAuthError('INVALID_CREDENTIALS')
      const admin = { adminId: credentials.adminId }
      const session = await sessions.create({ actorType: 'admin', actorId: admin.adminId, previousToken })
      return { admin, session }
    },
    async current(adminToken, customerToken) {
      const actor = await sessions.find(adminToken, 'admin')
      if (actor) return { adminId: actor.actorId }
      if (await sessions.find(customerToken, 'customer')) throw new AdminAuthError('FORBIDDEN')
      throw new AdminAuthError('AUTH_REQUIRED')
    },
    async logout(token) { await sessions.revoke(token, 'admin') },
  })
}
