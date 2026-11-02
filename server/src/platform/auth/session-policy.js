export const SESSION_TTL_MS = Object.freeze({ customer: 7 * 24 * 60 * 60 * 1000, admin: 8 * 60 * 60 * 1000 })

export function validateActorType(actorType) {
  if (actorType !== 'customer' && actorType !== 'admin') throw new TypeError('Invalid session scope')
  return actorType
}

export function validateActor(actorType, actorId) {
  validateActorType(actorType)
  if (typeof actorId !== 'string' || !/^[1-9][0-9]{0,19}$/.test(actorId)
    || BigInt(actorId).toString() !== actorId || BigInt(actorId) > 18446744073709551615n
    || (actorType === 'admin' && actorId !== '1')) {
    throw new TypeError('Invalid actor identity')
  }
}

export function isSessionToken(token) {
  return typeof token === 'string' && token.length === 43 && /^[A-Za-z0-9_-]{43}$/.test(token)
    && Buffer.from(token, 'base64url').toString('base64url') === token
}
