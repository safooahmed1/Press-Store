import assert from 'node:assert/strict'
import { after, afterEach, test } from 'node:test'
import { JSDOM } from 'jsdom'
import { createServer } from 'vite'

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' })
Object.assign(globalThis, {
  window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement,
  Node: dom.window.Node, MutationObserver: dom.window.MutationObserver, getComputedStyle: dom.window.getComputedStyle,
  IS_REACT_ACT_ENVIRONMENT: true,
})
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: dom.window.navigator })

const vite = await createServer({ root: process.cwd(), logLevel: 'silent' })
const [react, query, router, testing, userEventModule, pages, hooks, fixtures, axeModule] = await Promise.all([
  import('react'), import('@tanstack/react-query'), import('react-router-dom'), import('@testing-library/react'),
  import('@testing-library/user-event'), vite.ssrLoadModule('/src/features/auth/pages/AuthPages.jsx'),
  vite.ssrLoadModule('/src/features/auth/hooks/use-auth.js'), vite.ssrLoadModule('/src/features/auth/tests/fixtures/auth-fixtures.js'), import('axe-core'),
])
const { createElement } = react
const { QueryClient, QueryClientProvider } = query
const { MemoryRouter } = router
const { cleanup, render, screen } = testing
const userEvent = userEventModule.default
const axe = axeModule.default?.run ? axeModule.default : axeModule

function renderPage(Page, api, initialEntries = ['/login']) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(createElement(QueryClientProvider, { client }, createElement(hooks.AuthApiProvider, { api },
    createElement(MemoryRouter, { initialEntries }, createElement(Page)),
  )))
}

afterEach(() => cleanup())
after(async () => { cleanup(); await vite.close(); dom.window.close() })

test('AUTH-004 validates Egyptian phone input and moves focus to the first invalid field', async () => {
  renderPage(pages.RegisterPage, fixtures.createAuthFixtureApi())
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'Create account' }))
  assert.equal(document.activeElement, screen.getByLabelText(/First name/))
  assert.match(screen.getByRole('alert').textContent, /Enter your first name/)
  await user.type(screen.getByLabelText(/First name/), 'Amina')
  await user.type(screen.getByLabelText(/Last name/), 'Ali')
  await user.type(screen.getByLabelText(/Phone number/), '+971501234567')
  await user.type(screen.getByLabelText(/Password/), 'correct-password')
  await user.click(screen.getByRole('button', { name: 'Create account' }))
  assert.equal(document.activeElement, screen.getByLabelText(/Phone number/))
})

test('AUTH-004 keeps credentials safe, reports failures, and exposes accessible auth markup', async () => {
  renderPage(pages.CustomerLoginPage, fixtures.createAuthFixtureApi())
  const user = userEvent.setup()
  await user.type(screen.getByLabelText(/Phone number/), '01012345678')
  await user.type(screen.getByLabelText(/Password/), 'wrong-password')
  await user.click(screen.getByRole('button', { name: 'Sign in' }))
  assert.match((await screen.findByRole('alert')).textContent, /incorrect/)
  assert.equal(screen.getByLabelText(/Phone number/).value, '01012345678')
  const results = await axe.run(document.body)
  assert.deepEqual(results.violations, [])
})

test('AUTH-004 shows a safe account sign-in action when the session is absent', async () => {
  renderPage(pages.AccountPage, fixtures.createAuthFixtureApi(), ['/account'])
  assert.equal((await screen.findByRole('link', { name: 'Go to sign in' })).getAttribute('href'), '/login')
})
