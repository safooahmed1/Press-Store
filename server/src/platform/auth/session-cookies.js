import { isSessionToken, validateActorType } from './session-policy.js'

/** Environment selection is explicit injection; only server/src/config may read the environment. */
export function createSessionCookies({ production }) {
  if (typeof production !== 'boolean') throw new TypeError('Explicit cookie environment required')
  function name(scope) {
    validateActorType(scope)
    return `${production ? '__Host-' : ''}press-${scope}`
  }
  const flags = `; Path=/; HttpOnly; SameSite=Lax${production ? '; Secure' : ''}`
  return Object.freeze({
    issue(scope, { token, expiresAt }) {
      if (!isSessionToken(token) || !(expiresAt instanceof Date) || !Number.isFinite(expiresAt.getTime())) {
        throw new TypeError('Invalid session cookie')
      }
      return `${name(scope)}=${token}; Expires=${expiresAt.toUTCString()}${flags}`
    },
    clear(scope) {
      return `${name(scope)}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0${flags}`
    },
    read(scope, header) {
      const cookieName = name(scope)
      if (header === undefined) return null
      if (typeof header !== 'string' || header.length > 8192) return null
      const matches = header.split(';').map((part) => part.trim())
        .filter((part) => part.slice(0, part.indexOf('=')) === cookieName)
      if (matches.length !== 1) return null
      const token = matches[0].slice(cookieName.length + 1)
      return isSessionToken(token) ? token : null
    },
  })
}
