import { access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { registerFeatureRouters } from './feature-manifests.js'
import { apiBodyParsers } from '../platform/http/body-parsers.js'
import { requestContext } from '../platform/http/request-context.js'
import { createLogger } from '../platform/observability/logger.js'
import { requestLogging } from '../platform/observability/request-logging.js'
import { productionUploads } from './production-uploads.js'
import { HttpError, httpErrorBoundary, notFound, sendData, sendError } from '../platform/http/responses.js'

/** Compose the runtime without opening a port or importing feature internals. */
export async function createApp({ config, manifests = [],
  distRoot = fileURLToPath(new URL('../../../dist/', import.meta.url)),
  isReady = async () => true, logger = createLogger({ environment: config.nodeEnv }), productionConfig } = {}) {
  const app = express()
  app.disable('x-powered-by')
  app.use(requestContext)
  app.use(requestLogging({ logger, mounts: ['/api/v1',
    ...manifests.map((feature) => `/api/v1${feature?.path}`)] }))
  const api = express.Router()
  api.use(...apiBodyParsers())
  api.get('/health', async (req, res) => {
    let ready = false
    try { ready = await isReady() === true } catch { /* dependency detail stays private */ }
    if (!ready) return sendError(res, new HttpError(503, 'SERVICE_UNAVAILABLE', 'Service unavailable'))
    return sendData(res, { status: 'ready' }, { requestId: res.locals.requestId })
  })
  registerFeatureRouters(api, manifests)
  app.use('/api/v1', api)
  // Reserve the entire API namespace before static files or the SPA fallback.
  app.use('/api', notFound)
  if (config.nodeEnv === 'production') {
    if (productionConfig) app.use('/uploads', productionUploads(productionConfig.uploadRoot))
    app.use('/uploads', notFound)
    const indexFile = path.resolve(distRoot, 'index.html')
    await access(indexFile)
    app.use((req, res, next) => {
      let pathname
      // Classify a single decoded view; leave the URL intact for Express static.
      try { pathname = decodeURIComponent(req.path) } catch {
        return notFound(req, res)
      }
      if (pathname.startsWith('//') || /^\/(?:api|uploads)(?:\/|$)/i.test(pathname)
        || pathname.split('/').some((segment) => segment.startsWith('.'))) {
        return notFound(req, res)
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
  app.use(notFound)
  app.use(httpErrorBoundary)
  return app
}
