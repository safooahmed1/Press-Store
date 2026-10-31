import { ApiError } from '../../../../shared/api/http-client.js'

export const customerFixture = Object.freeze({
  customer: Object.freeze({ customerId: 'customer-1', firstName: 'Amina', lastName: 'Ali', phone: '+201012345678' }),
})

export function createAuthFixtureApi({ customer = null, admin = null } = {}) {
  let customerSession = customer
  let adminSession = admin
  return {
    async registerCustomer(payload) {
      customerSession = { customer: { ...customerFixture.customer, ...payload, phone: payload.phone } }
      return customerSession
    },
    async loginCustomer(payload) {
      if (payload.password !== 'correct-password') throw new ApiError({ code: 'INVALID_CREDENTIALS', message: 'Invalid credentials', status: 401 })
      customerSession = customerFixture
      return customerSession
    },
    async logoutCustomer() { customerSession = null; return {} },
    async getCustomerSession() {
      if (!customerSession) throw new ApiError({ code: 'AUTH_REQUIRED', message: 'Sign in required', status: 401 })
      return customerSession
    },
    async loginAdmin(payload) {
      if (payload.password !== 'correct-password') throw new ApiError({ code: 'INVALID_CREDENTIALS', message: 'Invalid credentials', status: 401 })
      adminSession = { admin: { adminId: 'admin-1' } }
      return adminSession
    },
    async getAdminSession() {
      if (!adminSession) throw new ApiError({ code: 'AUTH_REQUIRED', message: 'Sign in required', status: 401 })
      return adminSession
    },
  }
}
