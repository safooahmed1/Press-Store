import { QueryClient } from '@tanstack/react-query'

export function shouldRetryQuery(failureCount, error) {
  if (failureCount >= 1) return false
  if (error?.code === 'NETWORK_ERROR') return true
  return Number.isInteger(error?.status) && error.status >= 500
}

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: shouldRetryQuery, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  })
}
