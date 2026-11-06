import { Router } from 'express'
import { HttpError, sendData } from '../../../platform/http/responses.js'
import { createAuthGuards } from '../../../platform/auth/guards.js'
import { createSessionCookies } from '../../../platform/auth/session-cookies.js'
import { createSessionService } from '../../../platform/auth/sessions.js'
import { createSessionRepository } from '../../../platform/auth/session-repository.js'
import { mutationBoundary, requireJson } from '../../auth/routes/customer-routes.js'
import { createCartRepository } from '../repositories/carts.js'
import { createCartService } from '../services/carts.js'
import { CartError } from '../services/cart-input.js'

const errors = {
  VALIDATION_FAILED: [422, 'Cart input is invalid'],
  CART_CONFLICT: [409, 'Cart changed; reload before editing'],
  VARIANT_UNAVAILABLE: [409, 'Variant is unavailable'],
  NOT_FOUND: [404, 'Cart item not found'],
  CATALOG_UNAVAILABLE: [503, 'Catalog data is unavailable'],
}

// The manifest supplies the real CAT reader; injection remains explicit for focused tests.
export function createCartRouter({ database, config, appOrigin, readVariants }) {
  if (!['test', 'development', 'production'].includes(config?.nodeEnv)) throw new TypeError('Cart environment required')
  const service = createCartService({ repository: createCartRepository(database), readVariants })
  const sessions = createSessionService({ repository: createSessionRepository(database) })
  const cookies = createSessionCookies({ production: config.nodeEnv === 'production' })
  const origins = mutationBoundary(config.nodeEnv === 'production', appOrigin)
  const router = Router()
  router.use(createAuthGuards({ sessions, cookies }).requireCustomer)
  router.use((req, res, next) => {
    if (Object.keys(req.query).length) throw new CartError('VALIDATION_FAILED', 'query')
    next()
  })
  router.get('/', async (req, res) => sendData(res, await service.current(req.auth.actorId)))
  for (const [method, path, action] of [['post', '/items', 'add'], ['patch', '/items/:id', 'update'],
    ['delete', '/items/:id', 'remove'], ['delete', '/', 'clear']]) {
    router[method](path, origins, requireJson, async (req, res) =>
      sendData(res, await service.mutate(req.auth.actorId, action, req.body, req.params.id)))
  }
  router.use((error, req, res, next) => {
    if (!(error instanceof CartError) || !Object.hasOwn(errors, error.code)) return next(error)
    const [status, message] = errors[error.code]
    next(new HttpError(status, error.code, message, error.field
      ? { fieldErrors: { [error.field]: [message] } } : undefined))
  })
  return router
}
