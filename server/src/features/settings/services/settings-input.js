import { normalizePhone } from '../../auth/services/auth-validation.js'

export class SettingsError extends Error {
  constructor(code, field = 'body') {
    super(code)
    this.name = 'SettingsError'
    this.code = code
    this.field = field
  }
}
const fields = new Set(['storeName', 'storePhone', 'whatsappPhone', 'walletEgNumber', 'instaPayNumber', 'socialLinks', 'version'])
const networks = new Set(['facebook', 'instagram', 'tiktok'])
function invalid(field) { throw new SettingsError('VALIDATION_FAILED', field) }
export function storeName(value) {
  if (typeof value !== 'string' || !value.isWellFormed()) invalid('storeName')
  const result = value.trim()
  if (!result || [...result].length > 255 || [...result].some((character) => {
    const point = character.codePointAt(0)
    return point < 32 || point >= 127 && point <= 159
  })) invalid('storeName')
  return result
}
export function phone(value, field) {
  try { return normalizePhone(value) } catch { invalid(field) }
}
export function socialLinks(value = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length > 3) invalid('socialLinks')
  const entries = Object.entries(value).map(([network, link]) => {
    if (!networks.has(network) || typeof link !== 'string' || link.length > 2048) invalid('socialLinks')
    if (!link.trim()) return null
    let url
    try { url = new URL(link) } catch { invalid('socialLinks') }
    if (url.protocol !== 'https:' || url.username || url.password || url.port
      || ![`${network}.com`, `www.${network}.com`].includes(url.hostname) || url.href.length > 2048) invalid('socialLinks')
    return [network, url.href]
  }).filter(Boolean)
  return Object.fromEntries(entries)
}
export function settingsInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some((key) => !fields.has(key))) invalid('body')
  if (!Number.isInteger(input.version) || input.version < 0 || input.version > 4294967294) invalid('version')
  return { storeName: storeName(input.storeName), storePhone: phone(input.storePhone, 'storePhone'),
    whatsappPhone: phone(input.whatsappPhone, 'whatsappPhone'), walletEgNumber: phone(input.walletEgNumber, 'walletEgNumber'),
    instaPayNumber: phone(input.instaPayNumber, 'instaPayNumber'), socialLinks: socialLinks(input.socialLinks), version: input.version }
}
