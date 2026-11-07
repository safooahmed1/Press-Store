import { Router } from 'express'
import { createAuthGuards } from '../../../platform/auth/guards.js'
import { createSessionCookies } from '../../../platform/auth/session-cookies.js'
import { createSessionRepository } from '../../../platform/auth/session-repository.js'
import { createSessionService } from '../../../platform/auth/sessions.js'
import { HttpError, sendData } from '../../../platform/http/responses.js'
import { mutationBoundary, requireJson } from '../../auth/routes/customer-routes.js'
import { fields, OrderError } from '../domain/order-values.js'
import { adminOrderActions } from './admin-orders.js'

const errors = {
  VALIDATION_FAILED: [422, 'Order input is invalid'],
  FORBIDDEN: [403, 'This account cannot access this resource'],
  ORDER_NOT_FOUND: [404, 'Order not found'],
  ORDER_CONFLICT: [409, 'Order changed. Reload before continuing'],
  INVALID_ORDER_TRANSITION: [409, 'Order cannot perform this action in its current state'],
}

export function createAdminOrderRouter({ database, config, appOrigin, service }) {
  if (!['development', 'test', 'production'].includes(config?.nodeEnv)) {
    throw new TypeError('Order admin runtime context required')
  }
  const production = config.nodeEnv === 'production'
  const sessions = createSessionService({ repository: createSessionRepository(database) })
  const cookies = createSessionCookies({ production })
  const origins = mutationBoundary(production, appOrigin)
  const router = Router()
  router.use(createAuthGuards({ sessions, cookies }).requireAdmin)
  router.get('/', async (req, res) => {
    const { items, meta } = await service.list(req.query)
    return sendData(res, { items }, meta)
  })
  router.get('/:id', async (req, res) => {
    fields(req.query, [])
    return sendData(res, { order: await service.detail(req.params.id) })
  })
  for (const action of adminOrderActions) {
    router.post(`/:id/${action}`, origins, requireJson, async (req, res) => {
      fields(req.query, [])
      return sendData(res, await service.act(req.params.id, action, req.body, req.auth))
    })
  }
  router.use((error, req, res, next) => {
    if (!(error instanceof OrderError) || !Object.hasOwn(errors, error.code)) return next(error)
    const [status, message] = errors[error.code]
    return next(new HttpError(status, error.code, message))
  })
  return router
}
