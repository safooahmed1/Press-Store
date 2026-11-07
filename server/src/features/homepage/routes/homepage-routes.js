import { Router } from 'express'
import { HttpError, sendData } from '../../../platform/http/responses.js'
import { validateRequest, valid, invalid } from '../../../platform/http/validation.js'
import { createAuthGuards } from '../../../platform/auth/guards.js'
import { createSessionCookies } from '../../../platform/auth/session-cookies.js'
import { createSessionService } from '../../../platform/auth/sessions.js'
import { createSessionRepository } from '../../../platform/auth/session-repository.js'
import { createImageStorage, ImageStorageError } from '../../../platform/storage/image-storage.js'
import { mutationBoundary, requireJson } from '../../auth/routes/customer-routes.js'
import { CatalogError } from '../../catalog/services/catalog-input.js'
import { createMerchandisingService } from '../../catalog/services/merchandising.js'
import { catalogBody } from '../../catalog/routes/multipart.js'
import { HomepageError, fields, version, pagination, identity } from '../services/homepage-input.js'
import { createHomepageRepository } from '../repositories/homepage.js'
import { createHomepageService } from '../services/homepage.js'

const noQuery = validateRequest('query', (query) => Object.keys(query).length ? invalid({ query: ['Query parameters are not supported'] }) : valid({}))
const pages = validateRequest('query', (query) => {
  try { return valid(pagination(query)) } catch { return invalid({ query: ['Invalid pagination'] }) }
})
const id = validateRequest('params', (params) => {
  try { return valid({ id: identity(params.id) }) } catch { return invalid({ id: ['Invalid slide identity'] }) }
})
function errors(error, req, res, next) {
  if (error instanceof HomepageError || error instanceof CatalogError) {
    const code = error.code === 'CURATION_LIMIT_EXCEEDED' ? 'CURATED_LIMIT' : error.code
    const statuses = { HOMEPAGE_UNAVAILABLE: 503, HERO_NOT_FOUND: 404, PRODUCT_NOT_FOUND: 404,
      HERO_ACTIVE_LIMIT: 409, CURATED_LIMIT: 409, EDIT_CONFLICT: 409 }
    const messages = { HOMEPAGE_UNAVAILABLE: 'Homepage is unavailable', HERO_NOT_FOUND: 'Slide not found', PRODUCT_NOT_FOUND: 'Product not found',
      HERO_ACTIVE_LIMIT: 'Keep one to three active slides', CURATED_LIMIT: 'Choose at most eight products', EDIT_CONFLICT: 'Content changed; reload before saving' }
    return next(new HttpError(statuses[code] ?? 422, code, messages[code] ?? 'Homepage input is invalid'))
  }
  if (error instanceof ImageStorageError && ['INVALID_IMAGE','UNSUPPORTED_IMAGE_TYPE','ANIMATED_IMAGE_NOT_ALLOWED','IMAGE_DIMENSIONS_EXCEEDED','IMAGE_TOO_LARGE'].includes(error.code)) {
    return next(new HttpError(422, error.code, 'Image is not allowed'))
  }
  if (error?.code === 'DB_CONSTRAINT_FAILED') return next(new HttpError(422, 'VALIDATION_FAILED', 'Homepage input is invalid'))
  next(error)
}
export function createHomepageRouters(context) {
  const { database, config, appOrigin, storageConfig } = context
  if (!database || typeof database.transaction !== 'function' || !['development','test','production'].includes(config?.nodeEnv)) throw new Error('Homepage context required')
  const pure = createImageStorage({ root: '/unused-homepage-url-only' })
  const storage = storageConfig ? createImageStorage(storageConfig) : { urlFor: pure.urlFor,
    async withCompensation() { throw new HttpError(503, 'STORAGE_UNAVAILABLE', 'Image storage unavailable') },
    async delete() { throw new HttpError(503, 'STORAGE_UNAVAILABLE', 'Image storage unavailable') } }
  const catalog = createMerchandisingService({ database, imageUrl: storage.urlFor })
  const service = createHomepageService({ repository: createHomepageRepository(database), catalog, storage })
  const publicRouter = Router()
  publicRouter.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next() })
  publicRouter.get('/', noQuery, async (req, res) => sendData(res, await service.publicHomepage()))
  publicRouter.use(errors)
  const admin = Router()
  admin.use(createAuthGuards({ sessions: createSessionService({ repository: createSessionRepository(database) }),
    cookies: createSessionCookies({ production: config.nodeEnv === 'production' }) }).requireAdmin)
  const origin = mutationBoundary(config.nodeEnv === 'production', appOrigin)
  admin.use((req, res, next) => ['POST','PUT','DELETE','PATCH'].includes(req.method) ? origin(req, res, next) : next())
  admin.get('/', pages, async (req, res) => {
    const slides = await service.listSlides(req.validated.query)
    const banners = await service.banners()
    return sendData(res, { heroSlides: slides.items, banner1: banners.find((banner) => banner.placement === 'banner_1') ?? null,
      banner2: banners.find((banner) => banner.placement === 'banner_2') ?? null, selections: await service.selections() },
    { ...req.validated.query, total: slides.total })
  })
  admin.get('/hero-slides', pages, async (req, res) => {
    const result = await service.listSlides(req.validated.query)
    return sendData(res, { items: result.items }, { ...req.validated.query, total: result.total })
  })
  admin.get('/hero-slides/:id', id, noQuery, async (req, res) => sendData(res, await service.slide(req.validated.params.id)))
  admin.post('/hero-slides', noQuery, catalogBody, async (req, res) => {
    const result = await service.writeSlide(null, req.catalogInput, req.catalogUploads)
    res.status(201); return sendData(res, result)
  })
  admin.put('/hero-slides/:id', id, noQuery, catalogBody, async (req, res) => sendData(res,
    await service.writeSlide(req.validated.params.id, req.catalogInput, req.catalogUploads)))
  admin.delete('/hero-slides/:id', id, noQuery, requireJson, async (req, res) => {
    fields(req.body, ['version'])
    return sendData(res, await service.deleteSlide(req.validated.params.id, version(req.body.version)))
  })
  admin.get('/banners', noQuery, async (req, res) => sendData(res, { items: await service.banners() }))
  admin.put('/banners/:placement', noQuery, requireJson, async (req, res) => sendData(res, await service.writeBanner(req.params.placement, req.body)))
  admin.get('/curation', noQuery, async (req, res) => sendData(res, await service.selections()))
  admin.put('/curation/:kind', noQuery, requireJson, async (req, res) => sendData(res, await service.replaceSelection(req.params.kind, req.body)))
  admin.use(errors)
  return { publicRouter, admin }
}
