export class CustomerDirectoryError extends Error {
  constructor(code) {
    super(code)
    this.code = code
  }
}

function pageNumber(value, fallback, maximum) {
  if (value === undefined) return fallback
  if (typeof value !== 'string' || !/^[1-9][0-9]*$/.test(value) || String(Number(value)) !== value
    || Number(value) > maximum) throw new CustomerDirectoryError('VALIDATION_FAILED')
  return Number(value)
}

function pagination(query) {
  if (Object.keys(query).some((key) => key !== 'page' && key !== 'pageSize')) {
    throw new CustomerDirectoryError('VALIDATION_FAILED')
  }
  return { page: pageNumber(query.page, 1, 100000), pageSize: pageNumber(query.pageSize, 20, 50) }
}

function bounds({ page, pageSize }) {
  return { limit: pageSize, offset: (page - 1) * pageSize }
}

function validateCustomerId(id) {
  if (typeof id !== 'string' || !/^[1-9][0-9]{0,19}$/.test(id)
    || BigInt(id).toString() !== id || BigInt(id) > 18446744073709551615n) {
    throw new CustomerDirectoryError('VALIDATION_FAILED')
  }
}

function summary({ customerId, firstName, lastName, phone }, orderCount) {
  return { customerId, name: `${firstName} ${lastName}`, phone, orderCount }
}

async function project(work) {
  try {
    return await work()
  } catch {
    throw new CustomerDirectoryError('DEPENDENCY_UNAVAILABLE')
  }
}

export function createCustomerDirectory({ identities, orderProjection }) {
  return Object.freeze({
    async list(query) {
      const page = pagination(query)
      return project(async () => {
        const { items, total } = await identities.readCustomerPage(bounds(page))
        const counts = items.length ? await orderProjection.countByCustomerIds(items.map(({ customerId }) => customerId)) : new Map()
        return { items: items.map((customer) => summary(customer, counts.get(customer.customerId) ?? 0)),
          meta: { ...page, total } }
      })
    },

    async detail(customerId, query) {
      validateCustomerId(customerId)
      const page = pagination(query)
      const customer = await project(() => identities.readCustomerSummary(customerId))
      if (!customer) throw new CustomerDirectoryError('CUSTOMER_NOT_FOUND')
      return project(async () => {
        const { items, total } = await orderProjection.readCustomerOrders(customerId, bounds(page))
        return { customer: { ...summary(customer, total), orders: items }, meta: { ...page, total } }
      })
    },

    countCustomers: () => project(() => identities.countCustomers()),
  })
}
