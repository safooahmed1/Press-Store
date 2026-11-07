import { checkoutPickup } from '../checkout/checkout-quote.js'
import { transitionOrder } from '../domain/order-state.js'
import { fields, identity, OrderError, version } from '../domain/order-values.js'

export const adminOrderActions = Object.freeze(['verify-payment', 'prepare', 'deliver'])

function pageNumber(value, fallback, maximum) {
  if (value === undefined) return fallback
  if (typeof value !== 'string' || !/^[1-9][0-9]*$/.test(value) || String(Number(value)) !== value
    || Number(value) > maximum) throw new OrderError('VALIDATION_FAILED')
  return Number(value)
}

function customerContact(customer) {
  if (!customer) throw new Error('Order customer missing')
  const { customerId, firstName, lastName, phone } = customer
  const whatsappUrl = typeof phone === 'string' && phone.length === 13 && /^\+201[0-9]{9}$/.test(phone)
    ? `https://wa.me/${phone.slice(1)}` : null
  return { customer: { customerId, firstName, lastName, phone }, whatsappUrl }
}

async function storeContact(readStoreContact) {
  try {
    return await readStoreContact()
  } catch (error) {
    if (error.code === 'SETTINGS_UNAVAILABLE') return null
    throw error
  }
}

export function createAdminOrderService({ database, repository, readItems, readCustomerSummary,
  readStoreContact, clock = () => new Date() }) {
  return Object.freeze({
    async list(query) {
      fields(query, ['page', 'pageSize'])
      const page = pageNumber(query.page, 1, 100000)
      const pageSize = pageNumber(query.pageSize, 20, 50)
      const { rows, total } = await repository.list({ page, pageSize })
      const contacts = new Map()
      const items = []
      for (const row of rows) {
        if (!contacts.has(row.customerId)) {
          contacts.set(row.customerId, customerContact(await readCustomerSummary(row.customerId)))
        }
        const { orderId, orderNumber, createdAt, totalMinor, paymentMethod, paymentStatus, fulfillmentStatus, itemCount } = row
        items.push({ orderId, orderNumber, createdAt: createdAt.toISOString(), totalMinor: Number(totalMinor),
          paymentMethod, paymentStatus, fulfillmentStatus, itemCount: Number(itemCount), version: row.version,
          ...contacts.get(row.customerId) })
      }
      return { items, meta: { page, pageSize, total } }
    },

    async detail(orderId) {
      identity(orderId)
      const order = await repository.detail(orderId)
      if (!order) throw new OrderError('ORDER_NOT_FOUND')
      const { customerId, state, ...facts } = order
      const contact = customerContact(await readCustomerSummary(customerId))
      const items = await readItems(orderId)
      const guidance = checkoutPickup(state.paymentMethod)
      const cashCollectionNotice = state.cashExpiresAt && state.fulfillmentStatus !== 'cancelled'
        ? guidance.cashCollectionNotice : null
      return { ...facts, ...state, ...contact, items,
        pickup: { ...guidance, cashCollectionNotice, contact: await storeContact(readStoreContact) } }
    },

    async act(orderId, action, body, actor) {
      identity(orderId)
      fields(body, ['expectedVersion'])
      const expectedVersion = version(body.expectedVersion)
      if (!adminOrderActions.includes(action)) throw new OrderError('INVALID_ORDER_TRANSITION')
      return database.transaction(async (tx) => {
        const current = await repository.lockState(tx, orderId)
        if (!current) throw new OrderError('ORDER_NOT_FOUND')
        const next = transitionOrder(current, { action, actor, expectedVersion, now: clock() })
        if (next !== current && !await repository.updateState(tx, orderId, current, next)) {
          throw new OrderError('ORDER_CONFLICT')
        }
        return { orderId, paymentStatus: next.paymentStatus, fulfillmentStatus: next.fulfillmentStatus,
          version: next.version, updatedAt: next.updatedAt }
      })
    },
  })
}
