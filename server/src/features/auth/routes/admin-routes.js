import express from 'express'
import { HttpError, sendData } from '../../../platform/http/responses.js'
import { validateRequest } from '../../../platform/http/validation.js'
import { createSessionCookies } from '../../../platform/auth/session-cookies.js'
import { createAdminService, AdminAuthError } from '../services/admins.js'
import { customerInput } from '../services/customer-input.js'
import { mutationBoundary, requireJson } from './customer-routes.js'

export async function createAdminRouter({ database, config, appOrigin } = {}) {
  if (!database || typeof database.query !== 'function' || typeof database.transaction !== 'function'
    || !['development', 'test', 'production'].includes(config?.nodeEnv)) throw new Error('Auth runtime context required')
  const production = config.nodeEnv === 'production'
  const mutations = mutationBoundary(production, appOrigin)
  const cookies = createSessionCookies({ production })
  const service = await createAdminService({ database })
  const router = express.Router()
  router.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next() })
  const token = (req, scope = 'admin') => cookies.read(scope, req.get('cookie'))
  router.post('/login', mutations, requireJson, validateRequest('body', customerInput(false)), async (req, res) => {
    const result = await service.login(req.validated.body, token(req))
    res.append('Set-Cookie', cookies.issue('admin', result.session))
    return sendData(res, { admin: result.admin })
  })
  router.post('/logout', mutations, async (req, res) => {
    await service.logout(token(req))
    res.append('Set-Cookie', cookies.clear('admin'))
    return sendData(res, {})
  })
  router.get('/session', async (req, res) => sendData(res, {
    admin: await service.current(token(req), token(req, 'customer')),
  }))
  router.use((error, req, res, next) => {
    if (!(error instanceof AdminAuthError)) return next(error)
    const statuses = { INVALID_CREDENTIALS: 401, AUTH_REQUIRED: 401, FORBIDDEN: 403 }
    const messages = { INVALID_CREDENTIALS: 'Phone number or password is incorrect',
      AUTH_REQUIRED: 'Sign in required', FORBIDDEN: 'Admin session required' }
    next(new HttpError(statuses[error.code], error.code, messages[error.code]))
  })
  return router
}
