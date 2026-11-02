import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { validatePassword } from './auth-validation.js'

const derive = promisify(scrypt)
const OPTIONS = Object.freeze({ N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 })
const PREFIX = 'scrypt$131072$8$1'
const ENCODING = /^scrypt\$131072\$8\$1\$([A-Za-z0-9_-]{22})\$([A-Za-z0-9_-]{86})$/

/** No trimming, normalization, truncation or reversible password storage. */
export async function hashPassword(password) {
  validatePassword(password)
  const salt = randomBytes(16)
  const key = await derive(password, salt, 64, OPTIONS)
  return `${PREFIX}$${salt.toString('base64url')}$${key.toString('base64url')}`
}

export async function verifyPassword(password, encoded) {
  try { validatePassword(password) } catch { return false }
  if (typeof encoded !== 'string') return false
  const match = ENCODING.exec(encoded)
  if (!match || match[0] !== encoded) return false
  const salt = Buffer.from(match[1], 'base64url')
  const expected = Buffer.from(match[2], 'base64url')
  if (salt.toString('base64url') !== match[1] || expected.toString('base64url') !== match[2]) return false
  const actual = await derive(password, salt, 64, OPTIONS)
  return timingSafeEqual(actual, expected)
}
