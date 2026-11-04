import { HttpError } from '../../platform/http/responses.js'
import { createImageStorage } from '../../platform/storage/image-storage.js'
import { createPublicRouters } from './routes/public-routes.js'
import { createAdminCatalogRouter } from './routes/admin-routes.js'

const runtimes = new WeakMap()
function runtime(context) {
  if (!context || typeof context !== 'object') throw new Error('Catalog runtime context required')
  if (!runtimes.has(context)) {
    // Test contexts without injected storage cannot write to an implicit application directory.
    const pure = createImageStorage({ root: '/unused-catalog-url-only' })
    const storage = context.storageConfig ? createImageStorage(context.storageConfig) : {
      urlFor: pure.urlFor,
      async withCompensation() { throw new HttpError(503, 'STORAGE_UNAVAILABLE', 'Image storage unavailable') },
      async delete() { throw new HttpError(503, 'STORAGE_UNAVAILABLE', 'Image storage unavailable') },
    }
    runtimes.set(context, { ...createPublicRouters({ database: context.database, imageUrl: storage.urlFor }),
      admin: createAdminCatalogRouter({ ...context, storage }) })
  }
  return runtimes.get(context)
}

export const feature = [
  { id: 'catalog-products', path: '/products', createRouter: (context) => runtime(context).products },
  { id: 'catalog-categories', path: '/categories', createRouter: (context) => runtime(context).categories },
  { id: 'catalog-brands', path: '/brands', createRouter: (context) => runtime(context).brands },
  { id: 'catalog-admin', path: '/admin', createRouter: (context) => runtime(context).admin },
]
