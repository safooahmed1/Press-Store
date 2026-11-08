import { createIdentityRepository } from '../auth/repositories/identities.js'
import { createCustomerOrderProjection } from '../orders/repositories/customer-order-projection.js'
import { createCustomerDirectoryRouter } from './customer-directory-router.js'
import { createCustomerDirectory } from './customer-directory.js'

export const feature = {
  id: 'customers',
  path: '/admin/customers',
  createRouter(context) {
    const { database } = context
    const directory = createCustomerDirectory({
      identities: createIdentityRepository(database),
      orderProjection: createCustomerOrderProjection(database),
    })
    return createCustomerDirectoryRouter({ ...context, directory })
  },
}
