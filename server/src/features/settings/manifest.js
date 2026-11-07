import { createSettingsRouters } from './routes/settings-routes.js'
const runtimes = new WeakMap()
function runtime(context) {
  if (!context || typeof context !== 'object') throw new Error('Settings runtime context required')
  if (!runtimes.has(context)) runtimes.set(context, createSettingsRouters(context))
  return runtimes.get(context)
}
export const feature = [
  { id: 'settings-public', path: '/settings', createRouter: (context) => runtime(context).publicRouter },
  { id: 'settings-admin', path: '/admin/settings', createRouter: (context) => runtime(context).admin },
]
