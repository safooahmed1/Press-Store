import { Router } from 'express'
import { HttpError, sendData } from '../../../platform/http/responses.js'
import { valid, invalid, validateRequest } from '../../../platform/http/validation.js'
import { CatalogError, identity } from '../services/catalog-input.js'
import { publicQuery } from '../services/public-input.js'
import { createPublicCatalogService } from '../services/public-catalog.js'
import { createPublicCatalogRepository } from '../repositories/public-catalog.js'

function queryValidation(classifications = false) {
  return validateRequest('query', (query) => {
    try { return valid(publicQuery(query, classifications)) } catch (error) {
      if (error instanceof CatalogError) return invalid({ query: ['Invalid catalog filters or pagination'] })
      throw error
    }
  })
}

export function createPublicRouters({ database, imageUrl }) {
  if (!database || typeof database.query !== 'function' || typeof database.transaction !== 'function') {
    throw new Error('Catalog database context required')
  }
  const service = createPublicCatalogService({ repository: createPublicCatalogRepository(database), imageUrl })
  function router() {
    const result = Router()
    result.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next() })
    return result
  }
  function boundary(error, req, res, next) {
    if (error instanceof CatalogError && error.code === 'PRODUCT_NOT_FOUND') {
      return next(new HttpError(404, 'PRODUCT_NOT_FOUND', 'Product not found'))
    }
    next(error)
  }
  const products = router()
  products.get('/', queryValidation(), async (req, res) => {
    const result = await service.list(req.validated.query)
    return sendData(res, result.data, result.meta)
  })
  products.get('/:id', validateRequest('params', (params) => {
    try { return valid({ id: identity(params.id) }) } catch { return invalid({ id: ['Invalid product identity'] }) }
  }), validateRequest('query', (query) => Object.keys(query).length ? invalid({ query: ['Query parameters are not supported for product details'] }) : valid({})),
  async (req, res) => sendData(res, await service.detail(req.validated.params.id)))
  products.use(boundary)
  const categories = router()
  const brands = router()
  for (const [result, kind] of [[categories, 'category'], [brands, 'brand']]) {
    result.get('/', queryValidation(true), async (req, res) => {
      const response = await service.classifications(kind, req.validated.query)
      return sendData(res, response.data, response.meta)
    })
  }
  return { products, categories, brands }
}
