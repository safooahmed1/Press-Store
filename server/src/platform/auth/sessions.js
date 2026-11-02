import { createHash, randomBytes } from 'node:crypto'
import { SESSION_TTL_MS, isSessionToken, validateActor, validateActorType } from './session-policy.js'

function digest(token) {
  return createHash('sha256').update(token, 'ascii').digest()
}

/** Trusted authentication workflows call create only after credentials have been verified. */
export function createSessionService({ repository, clock = () => new Date() }) {
  function time() {
    const now = clock()
    if (!(now instanceof Date) || !Number.isFinite(now.getTime())) throw new TypeError('Invalid session clock')
    return now
  }
  return Object.freeze({
    async create({ actorType, actorId, previousToken }) {
      validateActor(actorType, actorId)
      const now = time()
      const expiresAt = new Date(now.getTime() + SESSION_TTL_MS[actorType])
      const token = randomBytes(32).toString('base64url')
      await repository.rotate({ actorType, actorId, now, expiresAt, sessionHash: digest(token),
        previousHash: isSessionToken(previousToken) ? digest(previousToken) : null })
      return { token, expiresAt }
    },
    async find(token, actorType) {
      validateActorType(actorType)
      if (!isSessionToken(token)) return null
      const actor = await repository.findActive(digest(token), actorType, time())
      if (!actor) return null
      validateActor(actor.actorType, actor.actorId)
      if (actor.actorType !== actorType) throw new Error('Session scope mismatch')
      return { actorType: actor.actorType, actorId: actor.actorId }
    },
    async revoke(token, actorType) {
      validateActorType(actorType)
      if (isSessionToken(token)) await repository.revoke(digest(token), actorType)
    },
  })
}
