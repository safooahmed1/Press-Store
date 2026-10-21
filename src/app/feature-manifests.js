/** Convert Vite-discovered manifest modules into a validated route registry. */
export function collectFeatureRoutes(modules) {
  const ids = new Set()
  const paths = new Set()
  const routes = []
  for (const key of Object.keys(modules).sort()) {
    const feature = modules[key].feature
    if (!feature || !/^[a-z]+(?:-[a-z]+)*$/.test(feature.id)
      || ids.has(feature.id) || !Array.isArray(feature.routes)) {
      throw new Error('Invalid or duplicate client feature manifest')
    }
    ids.add(feature.id)
    for (const route of feature.routes) {
      if (!route || typeof route.path !== 'string' || !/^\/(?:[a-z0-9-]+\/?)*$/.test(route.path)
        || /^\/api(?:\/|$)/.test(route.path) || paths.has(route.path)
        || typeof route.load !== 'function') {
        throw new Error('Invalid or duplicate client feature route')
      }
      paths.add(route.path)
      routes.push(route)
    }
  }
  return routes
}
