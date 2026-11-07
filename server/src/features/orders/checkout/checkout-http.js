import { createAuthGuards } from '../../../platform/auth/guards.js'
import { createSessionCookies } from '../../../platform/auth/session-cookies.js'
import { createSessionRepository } from '../../../platform/auth/session-repository.js'
import { createSessionService } from '../../../platform/auth/sessions.js'
import { HttpError } from '../../../platform/http/responses.js'
import { mutationBoundary, requireJson } from '../../auth/routes/customer-routes.js'
import { CartError } from '../../cart/services/cart-input.js'
import { OrderError } from '../domain/order-values.js'

const errors = {
  VALIDATION_FAILED: [422, 'Checkout input is invalid'],
  CART_EMPTY: [409, 'Cart is empty'],
  VARIANT_UNAVAILABLE: [409, 'A variant is unavailable'],
  QUOTE_CHANGED: [409, 'Cart changed. Refresh the quote before continuing'],
  PAYMENT_SETTINGS_UNAVAILABLE: [409, 'Selected payment method is unavailable'],
  CATALOG_UNAVAILABLE: [503, 'Catalog data is unavailable'],
  IDEMPOTENCY_CONFLICT: [409, 'Idempotency key already used for a different request'],
}

export function orderCustomerGuard({ database, config }) {
  if (!['development', 'test', 'production'].includes(config?.nodeEnv)) {
    throw new TypeError('Checkout runtime context required')
  }
  const production = config.nodeEnv === 'production'
  const sessions = createSessionService({ repository: createSessionRepository(database) })
  const cookies = createSessionCookies({ production })
  return createAuthGuards({ sessions, cookies }).requireCustomer
}

export function checkoutCustomerBoundary({ database, config, appOrigin }) {
  return [
    orderCustomerGuard({ database, config }),
    mutationBoundary(config.nodeEnv === 'production', appOrigin),
    requireJson,
    (req, res, next) => {
      if (Object.keys(req.query).length) throw new OrderError('VALIDATION_FAILED')
      next()
    },
  ]
}

export function checkoutErrorBoundary(validationMessage = errors.VALIDATION_FAILED[1]) {
  return (error, req, res, next) => {
    if (!(error instanceof OrderError || error instanceof CartError) || !Object.hasOwn(errors, error.code)) {
      return next(error)
    }
    const [status, message] = errors[error.code]
    return next(new HttpError(status, error.code, error.code === 'VALIDATION_FAILED' ? validationMessage : message))
  }
}
