import { Router } from 'express'
import { createIdentityRepository } from '../auth/repositories/identities.js'
import { createCartCheckoutService } from '../cart/services/checkout-carts.js'
import { createSettingsRepository } from '../settings/repositories/settings.js'
import { createSettingsService } from '../settings/services/settings.js'
import { createAdminOrderRepository } from './admin/admin-order-repository.js'
import { createAdminOrderRouter } from './admin/admin-order-router.js'
import { createAdminOrderService } from './admin/admin-orders.js'
import { createCheckoutQuoteRouter } from './checkout/checkout-quote-router.js'
import { createCheckoutQuoteService } from './checkout/checkout-quote.js'
import { createOrderRouter } from './checkout/order-create-router.js'
import { createOrderService } from './checkout/order-create.js'
import { createCustomerOrderRouter } from './customer/customer-order-router.js'
import { createOrderSubmissionRepository } from './repositories/order-submissions.js'

function checkoutDependencies(database) {
  return {
    database,
    cartCheckout: createCartCheckoutService({ database }),
    paymentSettings: createSettingsService({ repository: createSettingsRepository(database) }),
  }
}

export const feature = [
  {
    id: 'checkout',
    path: '/checkout',
    createRouter(context) {
      const quoteService = createCheckoutQuoteService(checkoutDependencies(context.database))
      return createCheckoutQuoteRouter({ ...context, quoteService })
    },
  },
  {
    id: 'orders',
    path: '/orders',
    createRouter(context) {
      const { database } = context
      const orderService = createOrderService({
        ...checkoutDependencies(database),
        repository: createOrderSubmissionRepository(database),
      })
      const router = Router()
      router.use(createCustomerOrderRouter(context))
      router.use(createOrderRouter({ ...context, orderService }))
      return router
    },
  },
  {
    id: 'admin-orders',
    path: '/admin/orders',
    createRouter(context) {
      const { database } = context
      const service = createAdminOrderService({
        database,
        repository: createAdminOrderRepository(database),
        readItems: createOrderSubmissionRepository(database).readItems,
        readCustomerSummary: createIdentityRepository(database).readCustomerSummary,
        readStoreContact: createSettingsService({ repository: createSettingsRepository(database) }).contact,
      })
      return createAdminOrderRouter({ ...context, service })
    },
  },
]
