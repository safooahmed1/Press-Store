const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const EVENT = /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)+$/
const CODE = /^[A-Z][A-Z0-9_]{0,63}$/
const TEMPLATE = /^\/[a-zA-Z0-9_/:.*{}-]*$/
const METHODS = new Set(['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'])

function text(value, pattern, maximum = 128) {
  return typeof value === 'string' && value.length <= maximum && pattern.test(value) ? value : null
}

/** Only developer-declared event names/templates and allowlisted metadata cross this boundary. */
export function createLogger({ environment, sink = (line) => console.log(line) } = {}) {
  const env = ['development', 'test', 'production'].includes(environment) ? environment : 'unknown'
  return Object.freeze({
    log(event, fields = {}) {
      try {
        const record = {
          timestamp: new Date().toISOString(),
          level: ['info', 'warn', 'error'].includes(fields.level) ? fields.level : 'info',
          environment: env,
          event: text(event, EVENT) ?? 'application.event',
          requestId: text(fields.requestId, UUID),
          routeTemplate: ['<unmatched>', '<unresolved>'].includes(fields.routeTemplate)
            ? fields.routeTemplate : text(fields.routeTemplate, TEMPLATE, 256),
          method: METHODS.has(fields.method) ? fields.method : null,
          status: Number.isInteger(fields.status) && fields.status >= 100 && fields.status <= 599
            ? fields.status : null,
          durationMs: Number.isFinite(fields.durationMs) && fields.durationMs >= 0
            ? Math.round(fields.durationMs * 1000) / 1000 : null,
          errorCode: text(fields.errorCode, CODE),
        }
        // A rejecting async sink must be contained as well as a throwing synchronous sink.
        Promise.resolve(sink(JSON.stringify(record))).catch(() => {})
      } catch { /* Logging must never affect the application or echo unsafe input. */ }
    },
  })
}
