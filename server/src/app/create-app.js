import { randomUUID } from 'node:crypto'
import { access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { registerFeatureRouters } from './feature-manifests.js'

/** Compose the runtime without opening a port or importing feature internals. */
export async function createApp({ config, manifests = [],
  distRoot = fileURLToPath(new URL('../../../dist/', import.meta.url)),
  isReady = async () => true } = {}) {
  const app = express()
  app.disable('x-powered-by')
  // Minimal runtime boundary; FND-003 owns the full HTTP middleware contract.
  app.use((req, res, next) => {
    res.locals.requestId = randomUUID()
    res.setHeader('X-Request-Id', res.locals.requestId)
    next()
  })
  const api = express.Router()
  api.get('/health', async (req, res) => {
    let ready = false
    try { ready = await isReady() === true } catch { /* dependency detail stays private */ }
    if (!ready) return sendError(res, 503, 'SERVICE_UNAVAILABLE', 'Service unavailable')
    res.json({ data: { status: 'ready' }, meta: { requestId: res.locals.requestId } })
  })
  registerFeatureRouters(api, manifests)
  app.use('/api/v1', api)
  // Reserve the entire API namespace before static files or the SPA fallback.
  app.use('/api', (req, res) => sendError(res, 404, 'NOT_FOUND', 'Resource not found'))
  if (config.nodeEnv === 'production') {
    const indexFile = path.resolve(distRoot, 'index.html')
    await access(indexFile)
    app.use((req, res, next) => {
      let pathname
      // Classify a single decoded view; leave the URL intact for Express static.
      try { pathname = decodeURIComponent(req.path) } catch {
        return sendError(res, 404, 'NOT_FOUND', 'Resource not found')
      }
      if (pathname.startsWith('//') || /^\/api(?:\/|$)/i.test(pathname)
        || pathname.split('/').some((segment) => segment.startsWith('.'))) {
        return sendError(res, 404, 'NOT_FOUND', 'Resource not found')
      }
      res.locals.productionPath = pathname
      next()
    })
    app.use(express.static(distRoot, { index: false, dotfiles: 'deny', redirect: false }))
    app.use((req, res, next) => {
      if (!['GET', 'HEAD'].includes(req.method) || !req.accepts('html')
        || path.extname(res.locals.productionPath)) return next()
      res.sendFile(indexFile)
    })
  }
  app.use((req, res) => sendError(res, 404, 'NOT_FOUND', 'Resource not found'))
  // Express requires four parameters to recognize error middleware.
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error)
    sendError(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred')
  })
  return app
}

function sendError(res, status, code, message) {
  return res.status(status).json({ error: { code, message, requestId: res.locals.requestId } })
}
