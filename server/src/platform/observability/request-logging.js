import { performance } from 'node:perf_hooks'

function routeTemplate(req, mounts) {
  if (!req.route) return '<unmatched>'
  // baseUrl can contain resolved user parameters in nested routers: never emit it.
  if (!mounts.has(req.baseUrl) || typeof req.route.path !== 'string') return '<unresolved>'
  return `${req.baseUrl}${req.route.path}`
}

export function requestLogging({ logger, mounts = ['/api/v1'] }) {
  const declaredMounts = new Set(mounts)
  return (req, res, next) => {
    const started = performance.now()
    let route = req.route
    let template = routeTemplate(req, declaredMounts)
    // Express assigns the matched route before dispatch, while baseUrl still identifies
    // its mount. Errors unwind that mount before finish/close, so snapshot only here.
    // Keep req.route's normal read/write behavior and replace the snapshot on rematches,
    // including an unresolved nested route after an earlier fully known route.
    Object.defineProperty(req, 'route', {
      configurable: true,
      enumerable: true,
      get: () => route,
      set(value) {
        route = value
        template = routeTemplate(req, declaredMounts)
      },
    })
    let recorded = false
    const record = (aborted) => {
      if (recorded) return
      recorded = true
      res.off('finish', finished)
      res.off('close', closed)
      const status = aborted ? 499 : res.statusCode
      try {
        Promise.resolve(logger.log(aborted ? 'http.request.aborted' : 'http.request.completed', {
          level: status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info',
          requestId: res.locals.requestId,
          routeTemplate: template, method: req.method, status,
          durationMs: performance.now() - started,
          errorCode: aborted ? 'REQUEST_ABORTED' : res.locals.errorCode,
        })).catch(() => {})
      } catch { /* An injected logger must also remain outside request failure semantics. */ }
    }
    const finished = () => record(false)
    const closed = () => record(!res.writableFinished)
    res.once('finish', finished)
    res.once('close', closed)
    next()
  }
}
