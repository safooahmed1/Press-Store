import { lazy, Suspense } from 'react'
import { collectFeatureRoutes } from './feature-manifests.js'
import { RuntimeBoundary } from './RuntimeBoundary.jsx'

const modules = import.meta.glob('../features/*/manifest.js', { eager: true })
const routes = collectFeatureRoutes(modules).map((route) => ({
  ...route, Page: lazy(route.load),
}))

export default function App({ pathname = window.location.pathname }) {
  const route = routes.find((entry) => entry.path === pathname)
  // Empty and unknown routes remain blank until UI/feature owners supply pages.
  if (!route) return null
  const Page = route.Page
  return (
    <RuntimeBoundary key={pathname}>
      <Suspense fallback={<p role="status">Loading…</p>}>
        <Page />
      </Suspense>
    </RuntimeBoundary>
  )
}
