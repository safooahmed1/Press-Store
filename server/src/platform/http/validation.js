import { HttpError } from './responses.js'

const SOURCES = new Set(['body', 'params', 'query'])

export function valid(value) {
  return { ok: true, value }
}

export function invalid(fieldErrors) {
  return { ok: false, fieldErrors }
}

/** Feature-owned validators return valid(value) or invalid(fieldErrors). */
export function validateRequest(source, validator) {
  if (!SOURCES.has(source)) throw new TypeError('Validation source must be body, params, or query')
  if (typeof validator !== 'function') throw new TypeError('Request validator must be a function')
  return async (req, res, next) => {
    try {
      const result = await validator(req[source], req)
      if (!result || typeof result !== 'object' || typeof result.ok !== 'boolean') {
        throw new TypeError('Request validator must return valid() or invalid()')
      }
      if (!result.ok) {
        return next(new HttpError(422, 'VALIDATION_FAILED', 'Request validation failed', {
          fieldErrors: result.fieldErrors,
        }))
      }
      req.validated ??= {}
      req.validated[source] = result.value
      next()
    } catch (error) {
      next(error)
    }
  }
}
