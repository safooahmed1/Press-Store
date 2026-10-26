const ERROR_CODE = /^[A-Z][A-Z0-9_]*$/

function safeFieldErrors(fieldErrors) {
  if (fieldErrors === undefined) return undefined
  if (!fieldErrors || typeof fieldErrors !== 'object' || Array.isArray(fieldErrors)) {
    throw new TypeError('fieldErrors must be an object')
  }
  const normalized = []
  for (const [field, value] of Object.entries(fieldErrors)) {
    const messages = (Array.isArray(value) ? value : [value])
      .filter((message) => typeof message === 'string' && message.trim())
      .map((message) => message.trim())
    if (messages.length) normalized.push([field, messages])
  }
  return Object.fromEntries(normalized)
}

export class HttpError extends Error {
  constructor(status, code, message, { fieldErrors, cause } = {}) {
    if (!Number.isInteger(status) || status < 400 || status > 599) {
      throw new TypeError('HTTP error status must be between 400 and 599')
    }
    if (typeof code !== 'string' || !ERROR_CODE.test(code)) {
      throw new TypeError('HTTP error code must be stable UPPER_SNAKE_CASE')
    }
    if (typeof message !== 'string' || !message.trim()) {
      throw new TypeError('HTTP error message must be a non-empty safe string')
    }
    super(message.trim(), { cause })
    this.name = 'HttpError'
    this.status = status
    this.code = code
    this.fieldErrors = safeFieldErrors(fieldErrors)
  }
}

export function sendData(res, data, meta) {
  return res.json(meta === undefined ? { data } : { data, meta })
}

export function sendError(res, error) {
  const payload = {
    code: error.code,
    message: error.message,
    requestId: res.locals.requestId,
  }
  if (error.fieldErrors && Object.keys(error.fieldErrors).length) {
    payload.fieldErrors = error.fieldErrors
  }
  return res.status(error.status).json({ error: payload })
}

export function notFound(req, res) {
  return sendError(res, new HttpError(404, 'NOT_FOUND', 'Resource not found'))
}

// Express requires four parameters to recognize error middleware.
export function httpErrorBoundary(error, req, res, next) {
  if (res.headersSent) return next(error)
  if (error instanceof HttpError) return sendError(res, error)
  if (error?.type === 'entity.parse.failed') {
    return sendError(res, new HttpError(400, 'VALIDATION_FAILED', 'Request body is invalid'))
  }
  if (error?.type === 'entity.too.large' || error?.status === 413) {
    return sendError(res, new HttpError(413, 'PAYLOAD_TOO_LARGE', 'Request body is too large'))
  }
  return sendError(res, new HttpError(500, 'INTERNAL_ERROR', 'An unexpected error occurred'))
}
