import { createElement, lazy } from 'react'
import { collectFeatureRoutes } from '../app/feature-manifests.js'
import { RouterView } from './RouterView.js'

const modules = import.meta.glob('../features/*/manifest.js', { eager: true })
const discoveredRoutes = collectFeatureRoutes(modules).map((route) => ({
  ...route,
  Page: lazy(route.load),
}))

/** Compose feature manifests into client routes without a central page registry. */
export default function RouterApp({ routes = discoveredRoutes }) {
  return createElement(RouterView, { routes })
}
