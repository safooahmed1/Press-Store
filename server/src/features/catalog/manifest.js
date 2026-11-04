import { createPublicRouters } from './routes/public-routes.js'
import { createImageStorage } from '../../platform/storage/image-storage.js'

const runtimes = new WeakMap()
function runtime(context) {
  if (!context || typeof context !== 'object') throw new Error('Catalog runtime context required')
  if (!runtimes.has(context)) {
    // Only pure urlFor is retained; this root is never accessed or created.
    const { urlFor } = createImageStorage({ root: '/unused-catalog-url-only' })
    runtimes.set(context, createPublicRouters({ database: context.database, imageUrl: urlFor }))
  }
  return runtimes.get(context)
}

export const feature = [
  { id: 'catalog-products', path: '/products', createRouter: (context) => runtime(context).products },
  { id: 'catalog-categories', path: '/categories', createRouter: (context) => runtime(context).categories },
  { id: 'catalog-brands', path: '/brands', createRouter: (context) => runtime(context).brands },
]
