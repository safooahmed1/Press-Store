import { createCartCheckoutService } from '../cart/services/checkout-carts.js'
import { createSettingsRepository } from '../settings/repositories/settings.js'
import { createSettingsService } from '../settings/services/settings.js'
import { createCheckoutQuoteRouter } from './checkout/checkout-quote-router.js'
import { createCheckoutQuoteService } from './checkout/checkout-quote.js'

export const feature = {
  id: 'checkout',
  path: '/checkout',
  createRouter(context) {
    const { database } = context
    const quoteService = createCheckoutQuoteService({
      database,
      cartCheckout: createCartCheckoutService({ database }),
      paymentSettings: createSettingsService({ repository: createSettingsRepository(database) }),
    })
    return createCheckoutQuoteRouter({ ...context, quoteService })
  },
}
