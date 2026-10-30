import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, useParams } from 'react-router-dom'
import { RouterView } from './RouterView.js'

function render(path, routes) {
  return renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [path] },
    createElement(RouterView, { routes })))
}

describe('RouterApp', () => {
  it('renders a manifest-owned static route', () => {
    const Page = () => createElement('main', null, 'catalog')
    assert.match(render('/products', [{ path: '/products', Page }]), /catalog/)
  })

  it('passes dynamic route parameters to manifest-owned pages', () => {
    const Page = () => createElement('main', null, useParams().productid)
    assert.match(render('/products/press-01', [{ path: '/products/:productid', Page }]), /press-01/)
  })

  it('keeps unknown routes blank', () => {
    assert.equal(render('/unknown', [{ path: '/products', Page: () => createElement('main', null, 'catalog') }]), '')
  })
})
