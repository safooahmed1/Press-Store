import { createCustomerRouters } from './routes/customer-routes.js'

// One graph per FND runtime context, shared by both mounts and reclaimed with that runtime.
const runtimes = new WeakMap()
function runtime(context) {
  if (!context || typeof context !== 'object') throw new Error('Auth runtime context required')
  if (!runtimes.has(context)) runtimes.set(context, createCustomerRouters(context))
  return runtimes.get(context)
}

export const feature = [
  { id: 'auth', path: '/auth', createRouter: async (context) => (await runtime(context)).auth },
  { id: 'auth-account', path: '/account', createRouter: async (context) => (await runtime(context)).account },
]
