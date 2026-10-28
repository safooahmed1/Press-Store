import assert from 'node:assert/strict'
import { after, afterEach, test } from 'node:test'
import { JSDOM } from 'jsdom'
import { createServer } from 'vite'

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' })
Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  HTMLElement: dom.window.HTMLElement,
  Node: dom.window.Node,
  MutationObserver: dom.window.MutationObserver,
  getComputedStyle: dom.window.getComputedStyle,
  IS_REACT_ACT_ENVIRONMENT: true,
})
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: dom.window.navigator })

let desktopViewport = false
const viewportListeners = new Set()
Object.defineProperty(dom.window, 'matchMedia', {
  configurable: true,
  value: () => ({
    get matches() { return desktopViewport },
    media: '(min-width: 48rem)',
    addEventListener: (type, listener) => { if (type === 'change') viewportListeners.add(listener) },
    removeEventListener: (type, listener) => { if (type === 'change') viewportListeners.delete(listener) },
  }),
})

async function setDesktopViewport(matches) {
  desktopViewport = matches
  await act(async () => {
    viewportListeners.forEach((listener) => listener({ matches, media: '(min-width: 48rem)' }))
  })
}

const vite = await createServer({ root: process.cwd(), logLevel: 'silent' })
const [react, testing, userEventModule, axeModule, shell] = await Promise.all([
  import('react'),
  import('@testing-library/react'),
  import('@testing-library/user-event'),
  import('axe-core'),
  vite.ssrLoadModule('/src/shared/ui/shell/customer/index.js'),
])
const { createElement } = react
const { act, cleanup, render, screen, within } = testing
const userEvent = userEventModule.default
const axe = axeModule.default?.run ? axeModule.default : axeModule

afterEach(async () => {
  cleanup()
  await setDesktopViewport(false)
})
after(async () => {
  cleanup()
  await vite.close()
  dom.window.close()
})

const contact = {
  storeName: 'Press Store',
  storePhone: '+20 100 000 0000',
  whatsappPhone: '+20 100 000 0000',
  socialLinks: {
    Instagram: 'https://instagram.com/press-store',
    Unsafe: 'javascript:alert(1)',
    Insecure: 'http://example.com',
  },
}

test('ui-003 shell exposes landmarks, skip link, session navigation, and cart count', () => {
  render(createElement(shell.CustomerShell, {
    session: { status: 'signed-in', displayName: 'Mona' },
    cartCount: 3,
    contact,
  }, createElement('h1', null, 'Shop the new drop')))
  assert.equal(screen.getByRole('banner').querySelector('a[aria-label="Press Store home"]').getAttribute('href'), '/')
  assert.equal(screen.getByRole('main').id, 'main-content')
  assert.equal(screen.getByRole('contentinfo').textContent.includes('Call the store'), true)
  assert.equal(screen.getAllByRole('link', { name: 'Cart (3 items)' }).every((link) => link.getAttribute('href') === '/cart'), true)
  assert.equal(screen.getByRole('link', { name: 'Skip to content' }).getAttribute('href'), '#main-content')
})

test('ui-003 mobile menu traps focus and returns it on Escape', async () => {
  render(createElement(shell.CustomerNavbar, { session: { status: 'signed-out' }, cartCount: 0 }))
  const user = userEvent.setup()
  const menuButton = screen.getByRole('button', { name: 'Open menu' })
  await user.click(menuButton)
  assert.equal(menuButton.getAttribute('aria-expanded'), 'true')
  const mobileMenu = document.getElementById(menuButton.getAttribute('aria-controls'))
  assert.equal(document.activeElement, within(mobileMenu).getByRole('link', { name: 'Home' }))
  await user.keyboard('{Escape}')
  assert.equal(menuButton.getAttribute('aria-expanded'), 'false')
  assert.equal(document.activeElement, menuButton)
})

test('ui-003 closes an open mobile menu at the desktop breakpoint and moves focus to content', async () => {
  render(createElement(shell.CustomerShell, { contact }, createElement('p', null, 'Content')))
  const user = userEvent.setup()
  const menuButton = screen.getByRole('button', { name: 'Open menu' })
  await user.click(menuButton)
  const mobileMenu = document.getElementById(menuButton.getAttribute('aria-controls'))
  assert.equal(document.activeElement, within(mobileMenu).getByRole('link', { name: 'Home' }))

  await setDesktopViewport(true)

  assert.equal(menuButton.getAttribute('aria-expanded'), 'false')
  assert.equal(document.activeElement, screen.getByRole('main'))
  assert.equal(mobileMenu.className.includes('hidden'), true)
})

test('ui-003 footer hides unsafe optional social links and handles loading contacts', () => {
  render(createElement('div', null,
    createElement(shell.CustomerFooter, { contact, contactStatus: 'ready' }),
    createElement(shell.CustomerFooter, { contactStatus: 'loading' }),
  ))
  assert.equal(screen.getAllByRole('link', { name: 'Instagram' }).length, 1)
  assert.equal(screen.queryByRole('link', { name: 'Unsafe' }), null)
  assert.equal(screen.queryByRole('link', { name: 'Insecure' }), null)
  assert.equal(screen.getByText('Loading contact details…').getAttribute('role'), 'status')
})

test('ui-003 shell markup passes axe accessibility checks', async () => {
  render(createElement(shell.CustomerShell, {
    session: { status: 'signed-out' },
    cartCount: 0,
    contact,
  }, createElement('h1', null, 'Press Store')))
  const results = await axe.run(document.body)
  assert.deepEqual(results.violations, [])
})

test('ui-003 main content can receive focus for skip-link navigation', async () => {
  render(createElement(shell.CustomerShell, { contact }, createElement('p', null, 'Content')))
  const main = screen.getByRole('main')
  await act(async () => main.focus())
  assert.equal(document.activeElement, main)
})
