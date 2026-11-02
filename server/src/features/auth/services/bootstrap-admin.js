import { createIdentityRepository } from '../repositories/identities.js'
import { normalizePhone, validatePassword } from './auth-validation.js'
import { hashPassword, verifyPassword } from './passwords.js'

async function unchanged(existing, phone, password) {
  if (!existing || existing.phone !== phone || !await verifyPassword(password, existing.passwordHash)) {
    throw new Error('Admin bootstrap conflicts with existing identity')
  }
  return { status: 'unchanged' }
}

/** Explicit provisioning only. Never updates credentials, timestamps or sessions. */
export async function bootstrapAdmin({ database, input, clock = () => new Date() }) {
  const phone = normalizePhone(input.phone)
  const password = validatePassword(input.password)
  const identities = createIdentityRepository(database)
  const existing = await identities.readBootstrapAdmin()
  if (existing) return unchanged(existing, phone, password)
  const passwordHash = await hashPassword(password)
  const now = clock()
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) throw new Error('Invalid bootstrap clock')
  try {
    // One atomic INSERT; the singleton constraint arbitrates concurrent provisioning.
    await identities.createAdmin({ phone, passwordHash, now })
    return { status: 'created' }
  } catch (error) {
    if (error.code !== 'DB_CONSTRAINT_FAILED') throw error
    return unchanged(await identities.readBootstrapAdmin(), phone, password)
  }
}
