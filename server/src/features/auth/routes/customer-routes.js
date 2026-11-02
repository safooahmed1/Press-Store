import express from 'express'
import { HttpError, sendData } from '../../../platform/http/responses.js'
import { validateRequest } from '../../../platform/http/validation.js'
import { createSessionCookies } from '../../../platform/auth/session-cookies.js'
import { createCustomerService, CustomerAuthError } from '../services/customers.js'
import { customerInput } from '../services/customer-input.js'

export function mutationBoundary(production, appOrigin) {
  if (production && (!appOrigin || new URL(appOrigin).protocol !== 'https:'
    || new URL(appOrigin).origin !== appOrigin)) throw new Error('Validated auth origin required')
  return (req, res, next) => {
    // Production uses the validated configured origin, never Host or forwarded headers.
    const expected = production ? appOrigin : `${req.protocol}://${req.get('host')}`
    if (req.get('origin') !== expected || req.get('sec-fetch-site') === 'cross-site') {
      return next(new HttpError(403, 'FORBIDDEN', 'Request origin is not allowed'))
    }
    next()
  }
}

export function requireJson(req, res, next) {
  return req.is('application/json') ? next()
    : next(new HttpError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Use a JSON request body'))
}

function authErrors(error, req, res, next) {
  if (!(error instanceof CustomerAuthError)) return next(error)
  const statuses = { PHONE_UNAVAILABLE: 409, INVALID_CREDENTIALS: 401, AUTH_REQUIRED: 401 }
  const messages = { PHONE_UNAVAILABLE: 'Phone number is unavailable',
    INVALID_CREDENTIALS: 'Phone number or password is incorrect', AUTH_REQUIRED: 'Sign in required' }
  next(new HttpError(statuses[error.code], error.code, messages[error.code]))
}

/** Factories consume the single FND-owned pool; constructing a router never creates another pool. */
export async function createCustomerRouters({ database, config, appOrigin } = {}) {
  if (!database || typeof database.query !== 'function' || typeof database.transaction !== 'function'
    || !['development', 'test', 'production'].includes(config?.nodeEnv)) throw new Error('Auth runtime context required')
  const production = config.nodeEnv === 'production'
  const mutations = mutationBoundary(production, appOrigin)
  const cookies = createSessionCookies({ production })
  const service = await createCustomerService({ database })
  const auth = express.Router()
  const account = express.Router()
  for (const router of [auth, account]) router.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })
  const token = (req) => cookies.read('customer', req.get('cookie'))
  for (const [action, registration] of [['register', true], ['login', false]]) {
    auth.post(`/customer/${action}`, mutations, requireJson, validateRequest('body', customerInput(registration)), async (req, res) => {
      const result = await service[action](req.validated.body, token(req))
      res.append('Set-Cookie', cookies.issue('customer', result.session))
      res.status(registration ? 201 : 200)
      return sendData(res, { customer: result.customer })
    })
  }
  auth.post('/customer/logout', mutations, async (req, res) => {
    await service.logout(token(req))
    res.append('Set-Cookie', cookies.clear('customer'))
    return sendData(res, {})
  })
  account.get('/', async (req, res) => sendData(res, { customer: await service.account(token(req)) }))
  auth.use(authErrors)
  account.use(authErrors)
  return { auth, account }
}
