import { Router } from 'express'
import { createAuthGuards } from '../../../platform/auth/guards.js'
import { createSessionCookies } from '../../../platform/auth/session-cookies.js'
import { createSessionRepository } from '../../../platform/auth/session-repository.js'
import { createSessionService } from '../../../platform/auth/sessions.js'
import { HttpError, sendData } from '../../../platform/http/responses.js'
import { mutationBoundary, requireJson } from '../../auth/routes/customer-routes.js'
import { CartError } from '../../cart/services/cart-input.js'
import { OrderError } from '../domain/order-values.js'

const errors = {
  VALIDATION_FAILED: [422, 'Quote input is invalid'],
  CART_EMPTY: [409, 'Cart is empty'],
  VARIANT_UNAVAILABLE: [409, 'A variant is unavailable'],
  QUOTE_CHANGED: [409, 'Cart changed. Refresh the quote before continuing'],
  PAYMENT_SETTINGS_UNAVAILABLE: [409, 'Selected payment method is unavailable'],
  CATALOG_UNAVAILABLE: [503, 'Catalog data is unavailable'],
}

export function createCheckoutQuoteRouter({ database, config, appOrigin, quoteService }) {
  if (!['development', 'test', 'production'].includes(config?.nodeEnv) || typeof quoteService?.quote !== 'function') {
    throw new TypeError('Checkout quote runtime context required')
  }
  const production = config.nodeEnv === 'production'
  const sessions = createSessionService({ repository: createSessionRepository(database) })
  const cookies = createSessionCookies({ production })
  const { requireCustomer } = createAuthGuards({ sessions, cookies })
  const router = Router()

  router.post('/quote', requireCustomer, mutationBoundary(production, appOrigin), requireJson, async (req, res) => {
    if (Object.keys(req.query).length) throw new OrderError('VALIDATION_FAILED')
    return sendData(res, { quote: await quoteService.quote(req.auth.actorId, req.body) })
  })
  router.use((error, req, res, next) => {
    if (!(error instanceof OrderError || error instanceof CartError) || !Object.hasOwn(errors, error.code)) {
      return next(error)
    }
    const [status, message] = errors[error.code]
    return next(new HttpError(status, error.code, message))
  })
  return router
}
