/** Convert Vite-discovered manifest modules into a validated route registry. */
const routeSegment = '(?:[a-z0-9-]+|:[a-z][a-z0-9]*)'
const routePath = new RegExp(`^(?:/$|/${routeSegment}(?:/${routeSegment})*)$`)

function routeSignature(path) {
  return path.split('/').map((segment) => segment.startsWith(':') ? ':' : segment).join('/')
}

export function collectFeatureRoutes(modules) {
  const ids = new Set()
  const paths = new Set()
  const signatures = new Set()
  const routes = []
  for (const key of Object.keys(modules).sort()) {
    const feature = modules[key].feature
    if (!feature || !/^[a-z]+(?:-[a-z]+)*$/.test(feature.id)
      || ids.has(feature.id) || !Array.isArray(feature.routes)) {
      throw new Error('Invalid or duplicate client feature manifest')
    }
    ids.add(feature.id)
    for (const route of feature.routes) {
      const signature = route?.path && routeSignature(route.path)
      if (!route || typeof route.path !== 'string' || !routePath.test(route.path)
        || /^\/api(?:\/|$)/.test(route.path) || paths.has(route.path) || signatures.has(signature)
        || typeof route.load !== 'function') {
        throw new Error('Invalid or duplicate client feature route')
      }
      paths.add(route.path)
      signatures.add(signature)
      routes.push(route)
    }
  }
  return routes
}
