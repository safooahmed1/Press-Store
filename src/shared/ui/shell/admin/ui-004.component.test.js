import assert from 'node:assert/strict'
import { after, afterEach, test } from 'node:test'
import { JSDOM } from 'jsdom'
import { createServer } from 'vite'

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' })
Object.assign(globalThis, { window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, Node: dom.window.Node, MutationObserver: dom.window.MutationObserver, getComputedStyle: dom.window.getComputedStyle, IS_REACT_ACT_ENVIRONMENT: true })
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: dom.window.navigator })
const vite = await createServer({ root: process.cwd(), logLevel: 'silent' })
const [react, testing, userEventModule, axeModule, shell] = await Promise.all([
  import('react'), import('@testing-library/react'), import('@testing-library/user-event'), import('axe-core'), vite.ssrLoadModule('/src/shared/ui/shell/admin/index.js'),
])
const { createElement } = react
const { cleanup, render, screen } = testing
const userEvent = userEventModule.default
const axe = axeModule.default?.run ? axeModule.default : axeModule
const h = (type, props, ...children) => createElement(type, props, ...children)
const items = [{ id: 'overview', href: '/admin', label: 'Overview' }, { id: 'orders', href: '/admin/orders', label: 'Orders and fulfillment' }]

afterEach(() => cleanup())
after(async () => { cleanup(); await vite.close(); dom.window.close() })

test('ui-004 admin layout exposes landmarks and current-page semantics', () => {
  render(h(shell.AdminLayout, { navItems: items, currentItem: 'orders', title: 'Orders', onLogout: () => {} }, h('h1', null, 'Order queue')))
  assert.equal(screen.getByRole('main').textContent, 'Order queue')
  assert.equal(screen.getByRole('link', { name: 'Orders and fulfillment' }).getAttribute('aria-current'), 'page')
  assert.ok(screen.getByRole('button', { name: 'Log out' }))
  assert.ok(screen.getByRole('navigation', { name: 'Admin navigation' }))
})

test('ui-004 mobile drawer traps focus and restores focus on Escape', async () => {
  render(h(shell.AdminLayout, { navItems: items }, h('p', null, 'Dashboard')))
  const user = userEvent.setup()
  const menu = screen.getByRole('button', { name: 'Menu' })
  await user.click(menu)
  assert.equal(menu.getAttribute('aria-expanded'), 'true')
  assert.equal(document.activeElement, screen.getByRole('link', { name: 'PRESS STORE / ADMIN' }))
  await user.keyboard('{Escape}')
  assert.equal(menu.getAttribute('aria-expanded'), 'false')
  assert.equal(document.activeElement, menu)
})

test('ui-004 drawer cycles focus and rejects unsafe paths', async () => {
  render(h(shell.AdminLayout, { navItems: [...items, { href: 'javascript:alert(1)', label: 'Unsafe' }], onLogout: () => {} }))
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'Menu' }))
  assert.equal(screen.queryByRole('link', { name: 'Unsafe' }), null)
  await user.keyboard('{Shift>}{Tab}{/Shift}')
  assert.equal(document.activeElement, screen.getAllByRole('button', { name: 'Log out' })[1])
})

test('ui-004 admin layout passes axe accessibility checks', async () => {
  render(h(shell.AdminLayout, { navItems: items, currentItem: 'overview' }, h('h1', null, 'Overview')))
  const results = await axe.run(document.body)
  assert.deepEqual(results.violations, [])
})
