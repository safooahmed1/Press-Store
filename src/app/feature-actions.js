import { createContext, createElement, useCallback, useContext, useEffect, useState } from 'react'
import { create } from 'zustand'

const ACTION_ID = /^[a-z]+(?:-[a-z]+)*$/
const unavailable = Object.freeze({ status: 'unavailable', error: null })

function validateAction(id, handler) {
  if (typeof id !== 'string' || !ACTION_ID.test(id)) {
    throw new TypeError('Feature action IDs must be lowercase kebab-case strings')
  }
  if (handler !== undefined && typeof handler !== 'function') {
    throw new TypeError('Feature action handlers must be functions')
  }
}

function actionError(code, message) {
  return Object.assign(new Error(message), { code })
}

/** APP-FND-001: app-owned registry; feature handlers own domain payload validation. */
export function createFeatureActionRegistry() {
  const registrations = new Map()
  const useStore = create((set, get) => ({
    actions: {},
    register(id, handler) {
      validateAction(id, handler)
      if (registrations.has(id)) {
        throw actionError('ACTION_ALREADY_REGISTERED', 'Action is already registered')
      }
      const registration = { handler }
      registrations.set(id, registration)
      set((state) => ({ actions: { ...state.actions, [id]: { status: 'registered', error: null } } }))
      let registered = true
      return () => {
        if (!registered) return
        registered = false
        if (registrations.get(id) !== registration) return
        registrations.delete(id)
        set((state) => {
          const actions = { ...state.actions }
          delete actions[id]
          return { actions }
        })
      }
    },
    async dispatch(id, payload) {
      validateAction(id)
      const registration = registrations.get(id)
      if (!registration) {
        set((state) => ({ actions: { ...state.actions, [id]: unavailable } }))
        throw actionError('ACTION_UNAVAILABLE', 'Action is unavailable')
      }
      if (get().actions[id]?.status === 'pending') {
        throw actionError('ACTION_PENDING', 'Action is already pending')
      }
      set((state) => ({ actions: { ...state.actions, [id]: { status: 'pending', error: null } } }))
      try {
        const result = await registration.handler(payload)
        if (registrations.get(id) === registration) {
          set((state) => ({ actions: { ...state.actions, [id]: { status: 'succeeded', error: null } } }))
        }
        return result
      } catch (error) {
        if (registrations.get(id) === registration) {
          set((state) => ({ actions: { ...state.actions, [id]: { status: 'failed', error } } }))
        }
        throw error
      }
    },
  }))
  return Object.freeze({
    register: (id, handler) => useStore.getState().register(id, handler),
    dispatch: (id, payload) => useStore.getState().dispatch(id, payload),
    getAction: (id) => useStore.getState().actions[id] ?? unavailable,
    useStore,
  })
}

const FeatureActionContext = createContext(null)

export function FeatureActionProvider({ children }) {
  const [registry] = useState(createFeatureActionRegistry)
  return createElement(FeatureActionContext.Provider, { value: registry }, children)
}

function useRegistry() {
  const registry = useContext(FeatureActionContext)
  if (!registry) throw new Error('FeatureActionProvider is required')
  return registry
}

/** Registers a feature-owned handler and removes it automatically on unmount. */
export function useRegisterFeatureAction(id, handler) {
  const registry = useRegistry()
  useEffect(() => registry.register(id, handler), [registry, id, handler])
}

/** Returns an action's state and dispatch function without coupling features together. */
export function useFeatureAction(id) {
  validateAction(id)
  const registry = useRegistry()
  const action = registry.useStore((state) => state.actions[id] ?? unavailable)
  const dispatch = useCallback((payload) => registry.dispatch(id, payload), [registry, id])
  return { ...action, dispatch }
}
