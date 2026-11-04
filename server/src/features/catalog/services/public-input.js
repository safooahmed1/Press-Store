import { CatalogError, identity, text } from './catalog-input.js'

const allowed = new Set(['categoryId', 'brandId', 'minPriceMinor', 'maxPriceMinor', 'size', 'color', 'page', 'pageSize'])
function integer(value, minimum, maximum) {
  if (typeof value !== 'string' || !/^(?:0|[1-9][0-9]*)$/.test(value)
    || !Number.isSafeInteger(Number(value)) || Number(value) < minimum || Number(value) > maximum) {
    throw new CatalogError('VALIDATION_FAILED')
  }
  return Number(value)
}

export function publicQuery(query, classifications = false) {
  if (!query || Object.keys(query).some((key) => !(classifications ? ['page', 'pageSize'].includes(key) : allowed.has(key)))
    || Object.values(query).some((value) => typeof value !== 'string')) throw new CatalogError('VALIDATION_FAILED')
  const result = { page: query.page === undefined ? 1 : integer(query.page, 1, 100000),
    pageSize: query.pageSize === undefined ? 24 : integer(query.pageSize, 1, 48) }
  for (const key of ['categoryId', 'brandId']) if (query[key] !== undefined) result[key] = identity(query[key])
  for (const key of ['minPriceMinor', 'maxPriceMinor']) {
    if (query[key] !== undefined) result[key] = integer(query[key], 0, Number.MAX_SAFE_INTEGER)
  }
  for (const key of ['size', 'color']) if (query[key] !== undefined) result[key] = text(query[key], 100)
  if (result.minPriceMinor !== undefined && result.maxPriceMinor !== undefined
    && result.minPriceMinor > result.maxPriceMinor) throw new CatalogError('VALIDATION_FAILED')
  return result
}
