import { Router } from 'express'
import { sendData } from '../../../platform/http/responses.js'
import { checkoutCustomerBoundary, checkoutErrorBoundary } from './checkout-http.js'

export function createCheckoutQuoteRouter({ database, config, appOrigin, quoteService }) {
  if (typeof quoteService?.quote !== 'function') throw new TypeError('Checkout quote runtime context required')
  const router = Router()
  router.post('/quote', ...checkoutCustomerBoundary({ database, config, appOrigin }), async (req, res) => {
    return sendData(res, { quote: await quoteService.quote(req.auth.actorId, req.body) })
  })
  router.use(checkoutErrorBoundary('Quote input is invalid'))
  return router
}
