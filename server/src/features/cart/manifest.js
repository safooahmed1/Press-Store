import { createCatalogService } from '../catalog/services/catalog.js'
import { createCatalogRepository } from '../catalog/repositories/catalog.js'
import { createCartRouter } from './routes/cart-routes.js'

export const feature = {
  id: 'cart',
  path: '/cart',
  createRouter(context) {
    const catalog = createCatalogService({ repository: createCatalogRepository(context.database) })
    return createCartRouter({ ...context, readVariants: catalog.readVariants })
  },
}
