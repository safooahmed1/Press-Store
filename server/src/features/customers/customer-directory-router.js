import { Router } from 'express'
import { createAuthGuards } from '../../platform/auth/guards.js'
import { createSessionCookies } from '../../platform/auth/session-cookies.js'
import { createSessionRepository } from '../../platform/auth/session-repository.js'
import { createSessionService } from '../../platform/auth/sessions.js'
import { HttpError, sendData } from '../../platform/http/responses.js'
import { CustomerDirectoryError } from './customer-directory.js'

const errors = {
  VALIDATION_FAILED: [422, 'Customer directory input is invalid'],
  CUSTOMER_NOT_FOUND: [404, 'Customer not found'],
  DEPENDENCY_UNAVAILABLE: [503, 'Customer directory is unavailable'],
}

export function createCustomerDirectoryRouter({ database, config, directory }) {
  if (!['development', 'test', 'production'].includes(config?.nodeEnv)) {
    throw new TypeError('Customer directory runtime context required')
  }
  const sessions = createSessionService({ repository: createSessionRepository(database) })
  const cookies = createSessionCookies({ production: config.nodeEnv === 'production' })
  const router = Router()
  router.use(createAuthGuards({ sessions, cookies }).requireAdmin)
  router.get('/', async (req, res) => {
    const { items, meta } = await directory.list(req.query)
    return sendData(res, { items }, meta)
  })
  router.get('/:id', async (req, res) => {
    const { customer, meta } = await directory.detail(req.params.id, req.query)
    return sendData(res, { customer }, meta)
  })
  router.use((error, req, res, next) => {
    if (!(error instanceof CustomerDirectoryError) || !Object.hasOwn(errors, error.code)) return next(error)
    const [status, message] = errors[error.code]
    return next(new HttpError(status, error.code, message))
  })
  return router
}
