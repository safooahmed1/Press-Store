export const MAX_ORDER_VERSION = 4294967295
export const MAX_ORDER_MONEY = BigInt(Number.MAX_SAFE_INTEGER)

export class OrderError extends Error {
  constructor(code) { super(code); this.name = 'OrderError'; this.code = code }
}

export function fields(value, allowed) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || Object.keys(value).some((key) => !allowed.includes(key))) throw new OrderError('VALIDATION_FAILED')
}

export function identity(value) {
  if (typeof value !== 'string' || !/^[1-9][0-9]{0,19}$/.test(value)
    || BigInt(value) > 18446744073709551615n) throw new OrderError('VALIDATION_FAILED')
  return value
}

export function version(value) {
  if (!Number.isInteger(value) || value < 1 || value > MAX_ORDER_VERSION) throw new OrderError('VALIDATION_FAILED')
  return value
}

export function money(value) {
  if (!Number.isSafeInteger(value) || value < 0) throw new OrderError('VALIDATION_FAILED')
  return value
}

export function safeMoney(value) {
  if (typeof value !== 'bigint' || value < 0n || value > MAX_ORDER_MONEY) throw new OrderError('VALIDATION_FAILED')
  return Number(value)
}

export function dateTime(value) {
  if (!(value instanceof Date) || !Number.isFinite(value.getTime())) throw new OrderError('VALIDATION_FAILED')
  return timestamp(value.toISOString())
}

export function timestamp(value) {
  if (typeof value !== 'string' || !/^[1-9][0-9]{3}-/.test(value) || !Number.isFinite(Date.parse(value))
    || new Date(value).toISOString() !== value) throw new OrderError('VALIDATION_FAILED')
  return value
}

export function snapshotText(value, maximum) {
  if (typeof value !== 'string' || !value.isWellFormed() || !value.trim()
    || [...value].length > maximum || [...value].some((character) => {
      const point = character.codePointAt(0)
      return point < 32 || (point >= 127 && point <= 159)
    })) {
    throw new OrderError('VALIDATION_FAILED')
  }
  return value
}
