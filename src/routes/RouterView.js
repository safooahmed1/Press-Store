import { createElement, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { RuntimeBoundary } from '../app/RuntimeBoundary.js'

function RoutePage({ Page, path }) {
  return createElement(RuntimeBoundary, { key: path },
    createElement(Suspense, { fallback: createElement('p', { role: 'status' }, 'Loading…') },
      createElement(Page)))
}

export function RouterView({ routes }) {
  return createElement(Routes, null,
    ...routes.map(({ path, Page }) => createElement(Route, {
      key: path,
      path,
      element: createElement(RoutePage, { Page, path }),
    })),
    // Preserve the existing blank state until a feature owns an unknown-route experience.
    createElement(Route, { path: '*', element: null }),
  )
}
