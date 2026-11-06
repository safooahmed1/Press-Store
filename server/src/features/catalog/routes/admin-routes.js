import { Router } from 'express'
import { HttpError, sendData } from '../../../platform/http/responses.js'
import { validateRequest, valid, invalid } from '../../../platform/http/validation.js'
import { createAuthGuards } from '../../../platform/auth/guards.js'
import { createSessionCookies } from '../../../platform/auth/session-cookies.js'
import { createSessionService } from '../../../platform/auth/sessions.js'
import { createSessionRepository } from '../../../platform/auth/session-repository.js'
import { ImageStorageError } from '../../../platform/storage/image-storage.js'
import { mutationBoundary } from '../../auth/routes/customer-routes.js'
import { CatalogError, identity } from '../services/catalog-input.js'
import { deleteInput } from '../services/admin-input.js'
import { publicQuery } from '../services/public-input.js'
import { createAdminCatalogRepository } from '../repositories/admin-catalog.js'
import { createAdminCatalogService } from '../services/admin-catalog.js'
import { catalogBody } from './multipart.js'

const idValidation = validateRequest('params', (params) => {
  try { return valid({ id: identity(params.id) }) } catch { return invalid({ id: ['Invalid resource identity'] }) }
})
const noQuery = validateRequest('query', (query) => Object.keys(query).length ? invalid({ query: ['Query parameters are not supported'] }) : valid({}))
const pagination = validateRequest('query', (query) => {
  try { return valid(publicQuery(query, true)) } catch { return invalid({ query: ['Invalid pagination'] }) }
})
const statusByCode = { PRODUCT_NOT_FOUND: 404, CATEGORY_NOT_FOUND: 404, BRAND_NOT_FOUND: 404,
  EDIT_CONFLICT: 409, RESOURCE_IN_USE: 409, NAME_UNAVAILABLE: 409, CURATION_LIMIT_EXCEEDED: 409 }
const messages = { PRODUCT_NOT_FOUND: 'Product not found', CATEGORY_NOT_FOUND: 'Category not found', BRAND_NOT_FOUND: 'Brand not found',
  EDIT_CONFLICT: 'Resource changed; reload before editing', RESOURCE_IN_USE: 'Resource is referenced by a product',
  NAME_UNAVAILABLE: 'Name is unavailable', CURATION_LIMIT_EXCEEDED: 'At most eight products can have each merchandising flag' }

export function createAdminCatalogRouter({ database, config, appOrigin, storage, onCleanupFailure }) {
  if (!['development', 'test', 'production'].includes(config?.nodeEnv)) throw new Error('Catalog environment required')
  const sessions = createSessionService({ repository: createSessionRepository(database) })
  const cookies = createSessionCookies({ production: config.nodeEnv === 'production' })
  const guard = createAuthGuards({ sessions, cookies }).requireAdmin
  const origins = mutationBoundary(config.nodeEnv === 'production', appOrigin)
  const service = createAdminCatalogService({ repository: createAdminCatalogRepository(database), storage, onCleanupFailure })
  const admin = Router()
  for (const [path, kind] of [['products', 'product'], ['categories', 'category'], ['brands', 'brand']]) {
    const resource = Router()
    resource.use(guard)
    resource.use((req, res, next) => ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) ? origins(req, res, next) : next())
    resource.get('/', pagination, async (req, res) => {
      const filters = req.validated.query
      const result = kind === 'product' ? await service.listProducts(filters) : await service.listClassifications(kind, filters)
      return sendData(res, { items: result.items }, { page: filters.page, pageSize: filters.pageSize, total: result.total })
    })
    resource.get('/:id', idValidation, noQuery, async (req, res) => sendData(res,
      kind === 'product' ? await service.product(req.validated.params.id) : await service.classification(kind, req.validated.params.id)))
    resource.post('/', noQuery, catalogBody, async (req, res) => {
      req.catalogConstraint = kind === 'product' ? 'VALIDATION_FAILED' : 'NAME_UNAVAILABLE'
      const result = kind === 'product' ? await service.writeProduct(null, req.catalogInput, req.catalogUploads)
        : await service.writeClassification(kind, null, req.catalogInput, req.catalogUploads)
      res.status(201)
      return sendData(res, result)
    })
    resource.put('/:id', idValidation, noQuery, catalogBody, async (req, res) => {
      req.catalogConstraint = kind === 'product' ? 'VALIDATION_FAILED' : 'NAME_UNAVAILABLE'
      return sendData(res, kind === 'product'
        ? await service.writeProduct(req.validated.params.id, req.catalogInput, req.catalogUploads)
        : await service.writeClassification(kind, req.validated.params.id, req.catalogInput, req.catalogUploads))
    })
    resource.delete('/:id', idValidation, noQuery, catalogBody, async (req, res) => {
      if (req.catalogUploads.length) throw new CatalogError('VALIDATION_FAILED')
      const version = deleteInput(req.catalogInput)
      req.catalogConstraint = 'RESOURCE_IN_USE'
      return sendData(res, kind === 'product' ? await service.deleteProduct(req.validated.params.id, version)
        : await service.deleteClassification(kind, req.validated.params.id, version))
    })
    admin.use(`/${path}`, resource)
  }
  admin.use((error, req, res, next) => {
    if (error instanceof CatalogError || error?.code === 'DB_CONSTRAINT_FAILED') {
      const code = error instanceof CatalogError ? error.code : req.catalogConstraint ?? 'VALIDATION_FAILED'
      return next(new HttpError(statusByCode[code] ?? 422, code, messages[code] ?? 'Catalog input is invalid'))
    }
    if (error instanceof ImageStorageError && ['INVALID_IMAGE', 'UNSUPPORTED_IMAGE_TYPE', 'ANIMATED_IMAGE_NOT_ALLOWED',
      'IMAGE_DIMENSIONS_EXCEEDED', 'IMAGE_TOO_LARGE'].includes(error.code)) {
      return next(new HttpError(422, error.code, 'Image is not allowed'))
    }
    next(error)
  })
  return admin
}
