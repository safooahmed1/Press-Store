import { Router } from 'express'
import { sendData } from '../../../platform/http/responses.js'
import { checkoutCustomerBoundary, checkoutErrorBoundary } from './checkout-http.js'

export function createOrderRouter({ database, config, appOrigin, orderService }) {
  if (typeof orderService?.create !== 'function') throw new TypeError('Order creation runtime context required')
  const router = Router()
  router.post('/', ...checkoutCustomerBoundary({ database, config, appOrigin }), async (req, res) => {
    const keys = req.headersDistinct['idempotency-key']
    const key = keys?.length === 1 ? keys[0] : undefined
    const order = await orderService.create(req.auth.actorId, req.body, key)
    return sendData(res.status(201), { order })
  })
  router.use(checkoutErrorBoundary('Order input is invalid'))
  return router
}
