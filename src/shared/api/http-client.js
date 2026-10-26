import axios from 'axios'

export class ApiError extends Error {
  constructor({ code, message, status = null, fieldErrors, requestId, cause }) {
    super(message, { cause })
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.fieldErrors = fieldErrors
    this.requestId = requestId
  }
}

function canonicalError(error) {
  const payload = error?.response?.data?.error
  if (!payload || typeof payload.code !== 'string' || typeof payload.message !== 'string') return null
  return new ApiError({
    code: payload.code,
    message: payload.message,
    status: error.response.status,
    fieldErrors: payload.fieldErrors,
    requestId: payload.requestId,
    cause: error,
  })
}

export function normalizeApiError(error) {
  if (error instanceof ApiError) return error
  const canonical = canonicalError(error)
  if (canonical) return canonical
  if (axios.isCancel(error)) {
    return new ApiError({ code: 'REQUEST_CANCELLED', message: 'Request cancelled', cause: error })
  }
  if (!error?.response) {
    return new ApiError({ code: 'NETWORK_ERROR', message: 'Unable to reach the service', cause: error })
  }
  return new ApiError({
    code: 'HTTP_ERROR',
    message: 'The service returned an invalid response',
    status: error.response.status,
    cause: error,
  })
}

export const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: { Accept: 'application/json' },
  timeout: 15_000,
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeApiError(error)),
)
