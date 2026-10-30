import { randomUUID } from 'node:crypto'

/** Assign an opaque server-generated request ID; never trust a client-supplied ID. */
export function requestContext(req, res, next) {
  res.locals.requestId = randomUUID()
  res.setHeader('X-Request-Id', res.locals.requestId)
  next()
}
