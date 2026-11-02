import { normalizePhone, validatePassword } from './auth-validation.js'
import { invalid, valid } from '../../../platform/http/validation.js'

export function customerInput(registration = false) {
  return (body) => {
    const fields = registration ? ['firstName', 'lastName', 'phone', 'password'] : ['phone', 'password']
    if (!body || typeof body !== 'object' || Array.isArray(body)
      || Object.keys(body).some((key) => !fields.includes(key))) {
      return invalid({ body: 'Provide only the documented fields.' })
    }
    const result = {}
    const errors = {}
    if (registration) {
      for (const field of ['firstName', 'lastName']) {
        const value = body[field]
        if (typeof value !== 'string' || !value.isWellFormed() || !value.trim()
          || value.length > 510 || [...value.trim()].length > 255
          || [...value].some((character) => character.codePointAt(0) < 32 || character.codePointAt(0) === 127)) {
          errors[field] = 'Enter a name between 1 and 255 characters.'
        } else result[field] = value.trim()
      }
    }
    try { result.phone = normalizePhone(body.phone) } catch { errors.phone = 'Enter an Egyptian mobile number.' }
    try { result.password = validatePassword(body.password) } catch { errors.password = 'Use a password between 15 and 128 characters.' }
    return Object.keys(errors).length ? invalid(errors) : valid(result)
  }
}
