import { publicQuery } from '../../catalog/services/public-input.js'

export class HomepageError extends Error {
  constructor(code) { super(code); this.name = 'HomepageError'; this.code = code }
}
export function fields(input, allowed) {
  if (!input || typeof input !== 'object' || Array.isArray(input)
    || Object.keys(input).some((key) => !allowed.includes(key))) throw new HomepageError('VALIDATION_FAILED')
}
export function text(value, max = 255) {
  if (typeof value !== 'string' || !value.isWellFormed()) throw new HomepageError('VALIDATION_FAILED')
  const result = value.trim()
  if (!result || [...result].length > max || [...result].some((character) => {
    const point = character.codePointAt(0)
    return point < 32 || point >= 127 && point <= 159
  })) throw new HomepageError('VALIDATION_FAILED')
  return result
}
export function identity(id) {
  if (typeof id !== 'string' || !/^[1-9][0-9]{0,19}$/.test(id) || BigInt(id) > 18446744073709551615n || BigInt(id).toString() !== id) throw new HomepageError('VALIDATION_FAILED')
  return id
}
export function version(value, minimum = 1) {
  if (!Number.isInteger(value) || value < minimum || value > 4294967294) throw new HomepageError('VALIDATION_FAILED')
  return value
}
export function buttonLink(value) {
  if (typeof value !== 'string' || value.length > 2048 || [...value].some((character) => character.codePointAt(0) < 32 || character.codePointAt(0) === 127)) throw new HomepageError('VALIDATION_FAILED')
  const pathname = value.split('?')[0]
  const match = /^\/products(?:\/([1-9][0-9]{0,19}))?$/.exec(pathname)
  if (!match) throw new HomepageError('VALIDATION_FAILED')
  const url = new URL(value, 'https://press.internal')
  if (url.origin !== 'https://press.internal' || url.hash) throw new HomepageError('VALIDATION_FAILED')
  if (match[1]) { identity(match[1]); if (url.search) throw new HomepageError('VALIDATION_FAILED') }
  const query = {}
  for (const [key, item] of url.searchParams) {
    if (Object.hasOwn(query, key)) throw new HomepageError('VALIDATION_FAILED')
    Object.defineProperty(query, key, { value: item, enumerable: true })
  }
  try { publicQuery(query) } catch { throw new HomepageError('VALIDATION_FAILED') }
  const normalized = url.pathname + url.search
  if (normalized.length > 2048) throw new HomepageError('VALIDATION_FAILED')
  return normalized
}
export function heroInput(input, updating = false) {
  fields(input, ['title','subtitle','buttonText','buttonLink','isActive','displayOrder', ...(updating ? ['version'] : [])])
  if (typeof input.isActive !== 'boolean' || !Number.isInteger(input.displayOrder)
    || input.displayOrder < 0 || input.displayOrder > 10000) throw new HomepageError('VALIDATION_FAILED')
  return { title: text(input.title), subtitle: text(input.subtitle, 500), buttonText: text(input.buttonText, 100),
    buttonLink: buttonLink(input.buttonLink), isActive: input.isActive, displayOrder: input.displayOrder,
    ...(updating ? { version: version(input.version) } : {}) }
}
export function bannerInput(input) {
  fields(input, ['text','isActive','version'])
  if (typeof input.isActive !== 'boolean') throw new HomepageError('VALIDATION_FAILED')
  return { text: text(input.text, 1000), isActive: input.isActive, version: version(input.version, 0) }
}
export function placement(value) {
  if (!['banner_1','banner_2'].includes(value)) throw new HomepageError('VALIDATION_FAILED')
  return value
}
export function pagination(query) {
  try { return publicQuery(query, true) } catch { throw new HomepageError('VALIDATION_FAILED') }
}
