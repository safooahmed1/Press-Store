import { HttpError } from '../http/responses.js'
import { validateActor } from './session-policy.js'

/** AUTH-AUTH-001/002. Resource owners must use req.auth, never caller-supplied actor IDs. */
export function createAuthGuards({ sessions, cookies }) {
  if (typeof sessions?.find !== 'function' || typeof cookies?.read !== 'function') {
    throw new TypeError('Auth guard dependencies required')
  }
  function requireScope(scope) {
    return async (req, res, next) => {
      res.set('Cache-Control', 'no-store')
      const header = req.get('cookie')
      const actor = await sessions.find(cookies.read(scope, header), scope)
      if (!actor) {
        const opposite = scope === 'customer' ? 'admin' : 'customer'
        const other = await sessions.find(cookies.read(opposite, header), opposite)
        if (other) {
          validateActor(other.actorType, other.actorId)
          if (other.actorType !== opposite) throw new Error('Auth guard scope mismatch')
          throw new HttpError(403, 'FORBIDDEN', 'This account cannot access this resource')
        }
        throw new HttpError(401, 'AUTH_REQUIRED', 'Sign in required')
      }
      validateActor(actor.actorType, actor.actorId)
      if (actor.actorType !== scope) throw new Error('Auth guard scope mismatch')
      req.auth = Object.freeze({ actorType: actor.actorType, actorId: actor.actorId })
      next()
    }
  }
  return Object.freeze({ requireCustomer: requireScope('customer'), requireAdmin: requireScope('admin') })
}
