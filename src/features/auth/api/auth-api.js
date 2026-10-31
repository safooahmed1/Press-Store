import { apiClient } from '../../../shared/api/http-client.js'

export const customerSessionKey = ['auth', 'customer', 'session']
export const adminSessionKey = ['auth', 'admin', 'session']

function unwrap(response) {
  return response?.data?.data
}

export function normalizeEgyptianPhone(input) {
  const compact = String(input ?? '').trim().replace(/[\s()-]/g, '')
  if (/^01\d{9}$/.test(compact)) return `+20${compact.slice(1)}`
  if (/^\+201\d{9}$/.test(compact)) return compact
  return null
}

export function fieldErrors(error) {
  const errors = error?.fieldErrors
  if (!errors || typeof errors !== 'object') return {}
  return Object.fromEntries(Object.entries(errors).map(([field, messages]) => [field,
    Array.isArray(messages) ? messages[0] : messages,
  ]).filter(([, message]) => typeof message === 'string' && message))
}

export function createAuthApi(client = apiClient) {
  return {
  async registerCustomer(payload) {
    return unwrap(await client.post('/auth/customer/register', payload))
  },
  async loginCustomer(payload) {
    return unwrap(await client.post('/auth/customer/login', payload))
  },
  async logoutCustomer() {
    return unwrap(await client.post('/auth/customer/logout'))
  },
  async getCustomerSession() {
    return unwrap(await client.get('/account'))
  },
  async loginAdmin(payload) {
    return unwrap(await client.post('/auth/admin/login', payload))
  },
  async getAdminSession() {
    return unwrap(await client.get('/auth/admin/session'))
  },
  }
}

export const productionAuthApi = createAuthApi()
