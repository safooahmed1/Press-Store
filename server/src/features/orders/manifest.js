import { createCartCheckoutService } from '../cart/services/checkout-carts.js'
import { createSettingsRepository } from '../settings/repositories/settings.js'
import { createSettingsService } from '../settings/services/settings.js'
import { createCheckoutQuoteRouter } from './checkout/checkout-quote-router.js'
import { createCheckoutQuoteService } from './checkout/checkout-quote.js'
import { createOrderRouter } from './checkout/order-create-router.js'
import { createOrderService } from './checkout/order-create.js'
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
      return createOrderRouter({ ...context, orderService })
    },
  },
]
