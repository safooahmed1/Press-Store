import { Router } from 'express'
import { createAuthGuards } from '../../platform/auth/guards.js'
import { createSessionCookies } from '../../platform/auth/session-cookies.js'
import { createSessionRepository } from '../../platform/auth/session-repository.js'
import { createSessionService } from '../../platform/auth/sessions.js'
import { HttpError, sendData } from '../../platform/http/responses.js'

const orderLimit = 10

export function createDashboardRouter({ database, config, countProducts, readOrders, countCustomers }) {
  if (!['development', 'test', 'production'].includes(config?.nodeEnv)) {
    throw new TypeError('Dashboard runtime context required')
  }
  const sessions = createSessionService({ repository: createSessionRepository(database) })
  const cookies = createSessionCookies({ production: config.nodeEnv === 'production' })
  const { requireAdmin } = createAuthGuards({ sessions, cookies })
  const router = Router()
  router.get('/', requireAdmin, async (req, res) => {
    if (Object.keys(req.query).length) throw new HttpError(422, 'VALIDATION_FAILED', 'Dashboard query is invalid')

    let data
    try {
      const totalProducts = await countProducts()
      const { totalOrders, attentionOrders, recentOrders } = await readOrders({ limit: orderLimit })
      const totalCustomers = await countCustomers()
      data = { totalProducts, totalOrders, totalCustomers, attentionOrders, recentOrders }
    } catch {
      throw new HttpError(503, 'DASHBOARD_UNAVAILABLE', 'Dashboard is unavailable')
    }
    return sendData(res, data)
  })
  return router
}
