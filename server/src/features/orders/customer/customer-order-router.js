import { Router } from 'express'
import { HttpError, sendData } from '../../../platform/http/responses.js'
import { orderCustomerGuard } from '../checkout/checkout-http.js'
import { checkoutPickup } from '../checkout/checkout-quote.js'
import { orderPagination } from '../domain/order-pagination.js'
import { fields, identity, OrderError } from '../domain/order-values.js'
import { createCustomerOrderRepository } from './customer-order-repository.js'

const errors = {
  VALIDATION_FAILED: [422, 'Order input is invalid'],
  ORDER_NOT_FOUND: [404, 'Order not found'],
}

export function createCustomerOrderRouter({ database, config }) {
  const repository = createCustomerOrderRepository(database)
  const customer = orderCustomerGuard({ database, config })
  const router = Router()
  router.get('/', customer, async (req, res) => {
    const pagination = orderPagination(req.query)
    const { items, total } = await repository.list(req.auth.actorId, pagination)
    return sendData(res, { items }, { ...pagination, total })
  })
  router.get('/:id', customer, async (req, res) => {
    fields(req.query, [])
    const order = await repository.detail(req.auth.actorId, identity(req.params.id))
    if (!order) throw new OrderError('ORDER_NOT_FOUND')
    const { cashExpiresAt, ...details } = order
    const guidance = checkoutPickup(order.paymentMethod)
    const pickup = { ...guidance, cashCollectionNotice: cashExpiresAt ? guidance.cashCollectionNotice : null, cashExpiresAt }
    return sendData(res, { order: { ...details, pickup } })
  })
  router.use((error, req, res, next) => {
    if (!(error instanceof OrderError) || !Object.hasOwn(errors, error.code)) return next(error)
    const [status, message] = errors[error.code]
    return next(new HttpError(status, error.code, message))
  })
  return router
}
