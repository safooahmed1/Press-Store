import { fields, OrderError } from './order-values.js'

function pageNumber(value, fallback, maximum) {
  if (value === undefined) return fallback
  if (typeof value !== 'string' || !/^[1-9][0-9]*$/.test(value) || String(Number(value)) !== value
    || Number(value) > maximum) throw new OrderError('VALIDATION_FAILED')
  return Number(value)
}

export function orderPagination(query) {
  fields(query, ['page', 'pageSize'])
  return { page: pageNumber(query.page, 1, 100000), pageSize: pageNumber(query.pageSize, 20, 50) }
}
