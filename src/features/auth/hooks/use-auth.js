import { createContext, createElement, useContext, useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminSessionKey, customerSessionKey, productionAuthApi } from '../api/auth-api.js'

const AuthApiContext = createContext(productionAuthApi)

export function AuthApiProvider({ api = productionAuthApi, children }) {
  return createElement(AuthApiContext.Provider, { value: api }, children)
}

export function useCustomerSession() {
  const api = useContext(AuthApiContext)
  return useQuery({ queryKey: customerSessionKey, queryFn: api.getCustomerSession, retry: false })
}

export function useAdminSession() {
  const api = useContext(AuthApiContext)
  return useQuery({ queryKey: adminSessionKey, queryFn: api.getAdminSession, retry: false })
}

function useSessionMutation(action, sessionKey) {
  const api = useContext(AuthApiContext)
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api[action],
    onSuccess: (data) => queryClient.setQueryData(sessionKey, data),
  })
}

export function useCustomerLogin() {
  return useSessionMutation('loginCustomer', customerSessionKey)
}

export function useCustomerRegistration() {
  return useSessionMutation('registerCustomer', customerSessionKey)
}

export function useAdminLogin() {
  return useSessionMutation('loginAdmin', adminSessionKey)
}

export function useCustomerLogout() {
  const api = useContext(AuthApiContext)
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.logoutCustomer,
    onSuccess: () => queryClient.removeQueries({ queryKey: customerSessionKey }),
  })
}

export function useRedirectWhenSession(query, destination, navigate) {
  const hasRedirected = useRef(false)
  useEffect(() => {
    if (query.data && !hasRedirected.current) {
      hasRedirected.current = true
      navigate(destination, { replace: true })
    }
  }, [destination, navigate, query.data])
}
