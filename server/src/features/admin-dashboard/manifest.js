import { createIdentityRepository } from '../auth/repositories/identities.js'
import { createAdminCatalogRepository } from '../catalog/repositories/admin-catalog.js'
import { createCustomerDirectory } from '../customers/customer-directory.js'
import { createOrderDashboardProjection } from '../orders/repositories/order-dashboard-projection.js'
import { createDashboardRouter } from './dashboard-router.js'

export const feature = {
  id: 'admin-dashboard',
  path: '/admin/dashboard',
  createRouter(context) {
    const { database } = context
    return createDashboardRouter({
      ...context,
      countProducts: createAdminCatalogRepository(database).countProducts,
      readOrders: createOrderDashboardProjection(database).read,
      countCustomers: createCustomerDirectory({ identities: createIdentityRepository(database) }).countCustomers,
    })
  },
}
