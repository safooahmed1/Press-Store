export class AuthValidationError extends Error {
  constructor(field) {
    super(`Invalid ${field}`)
    this.name = 'AuthValidationError'
    this.code = 'VALIDATION_FAILED'
    this.field = field
  }
}

export function normalizePhone(phone) {
  if (typeof phone !== 'string') throw new AuthValidationError('phone')
  if (phone.length === 11 && /^01[0-9]{9}$/.test(phone)) return `+2${phone}`
  if (phone.length === 13 && /^\+201[0-9]{9}$/.test(phone)) return phone
  throw new AuthValidationError('phone')
}

export function validatePassword(password) {
  if (typeof password !== 'string' || !password.isWellFormed()
    || password.length > 256) throw new AuthValidationError('password')
  const length = [...password].length
  if (length < 15 || length > 128) throw new AuthValidationError('password')
  return password
}
