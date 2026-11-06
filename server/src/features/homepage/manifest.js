import { createHomepageRouters } from './routes/homepage-routes.js'
const runtimes = new WeakMap()
function runtime(context) {
  if (!context || typeof context !== 'object') throw new Error('Homepage context required')
  if (!runtimes.has(context)) runtimes.set(context, createHomepageRouters(context))
  return runtimes.get(context)
}
export const feature = [
  { id: 'homepage-public', path: '/homepage', createRouter: (context) => runtime(context).publicRouter },
  { id: 'homepage-admin', path: '/admin/homepage', createRouter: (context) => runtime(context).admin },
]
