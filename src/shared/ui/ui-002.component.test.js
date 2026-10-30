import assert from 'node:assert/strict'
import { after, afterEach, test } from 'node:test'
import { JSDOM } from 'jsdom'
import { createServer } from 'vite'

const dom = new JSDOM('<!doctype html><html><body><div id="test-root"></div></body></html>', {
  url: 'http://localhost/',
})
Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  HTMLElement: dom.window.HTMLElement,
  HTMLDialogElement: dom.window.HTMLDialogElement,
  Node: dom.window.Node,
  MutationObserver: dom.window.MutationObserver,
  getComputedStyle: dom.window.getComputedStyle,
  IS_REACT_ACT_ENVIRONMENT: true,
})
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: dom.window.navigator })

const vite = await createServer({ root: process.cwd(), logLevel: 'silent' })
const [react, testing, userEventModule, axeModule, primitives, states] = await Promise.all([
  import('react'),
  import('@testing-library/react'),
  import('@testing-library/user-event'),
  import('axe-core'),
  vite.ssrLoadModule('/src/shared/ui/primitives/index.js'),
  vite.ssrLoadModule('/src/shared/ui/states/index.js'),
])
const { createElement, useState } = react
const { act, cleanup, fireEvent, render, screen } = testing
const userEvent = userEventModule.default
const axe = axeModule.default?.run ? axeModule.default : axeModule

if (globalThis.HTMLDialogElement) {
  globalThis.HTMLDialogElement.prototype.showModal = function showModal() {
    this.open = true
  }
  globalThis.HTMLDialogElement.prototype.close = function close() {
    this.open = false
    this.dispatchEvent(new dom.window.Event('close'))
  }
}

afterEach(() => cleanup())
after(async () => {
  cleanup()
  await vite.close()
  dom.window.close()
})

test('ui-002 Button exposes pending semantics and prevents duplicate activation', async () => {
  const onClick = () => {}
  render(createElement(primitives.Button, { pending: true, onClick }, 'Save'))
  const button = screen.getByRole('button', { name: 'Working' })
  assert.equal(button.disabled, true)
  assert.equal(button.getAttribute('aria-busy'), 'true')
  assert.equal(button.dataset.state, 'pending')
  await userEvent.setup().click(button)
  assert.equal(button.disabled, true)
})

test('ui-002 Field wires labels, hints, and validation errors to its control', () => {
  render(createElement(primitives.Field, {
    id: 'email', label: 'Email address', hint: 'Use the address on your account.', error: 'Enter a valid email.', required: true,
    type: 'email',
  }))
  const control = screen.getByLabelText(/Email address/)
  assert.equal(control.getAttribute('aria-invalid'), 'true')
  assert.match(control.getAttribute('aria-describedby'), /email-hint/)
  assert.match(control.getAttribute('aria-describedby'), /email-error/)
  assert.equal(screen.getByRole('alert').textContent, 'Enter a valid email.')
})

test('ui-002 Price formats integer minor units and Image recovers from load failure', () => {
  render(createElement('div', null,
    createElement(primitives.Price, { amountMinor: 123450 }),
    createElement(primitives.Image, { src: '/missing.webp', alt: 'Black jacket' }),
  ))
  assert.match(screen.getByText(/EGP|1,234/).textContent, /EGP|1,234/)
  const image = screen.getByRole('img', { name: 'Black jacket' })
  fireEvent.error(image)
  assert.equal(screen.getByRole('img', { name: 'Black jacket' }).textContent, 'Image unavailable')
})

test('ui-002 Dialog returns focus after close and exposes labelled modal semantics', async () => {
  function DialogFixture() {
    const [open, setOpen] = useState(false)
    return createElement('div', null,
      createElement('button', { type: 'button', onClick: () => setOpen(true) }, 'Open dialog'),
      createElement(primitives.Dialog, {
        open,
        onClose: () => setOpen(false),
        title: 'Confirm removal',
        description: 'This action cannot be undone.',
        actions: createElement('button', { type: 'button', onClick: () => setOpen(false) }, 'Cancel'),
      }, 'Remove this item?'),
    )
  }
  const user = userEvent.setup()
  render(createElement(DialogFixture))
  const opener = screen.getByRole('button', { name: 'Open dialog' })
  await user.click(opener)
  const dialog = screen.getByRole('dialog', { name: 'Confirm removal' })
  assert.equal(dialog.open, true)
  assert.match(dialog.textContent, /Remove this item/)
  await act(async () => dialog.close())
  assert.equal(document.activeElement, opener)
})

test('ui-002 AsyncBoundary and CollectionState provide explicit recovery states', async () => {
  let retries = 0
  render(createElement('div', null,
    createElement(states.AsyncBoundary, { status: 'error', requestId: 'req-123', onRetry: () => { retries += 1 } }),
    createElement(states.CollectionState, { status: 'empty', emptyTitle: 'No products', emptyAction: createElement('button', null, 'Browse all') }),
  ))
  assert.equal(screen.getByText('Reference:').textContent.includes('req-123'), true)
  await userEvent.setup().click(screen.getByRole('button', { name: 'Try again' }))
  assert.equal(retries, 1)
  assert.equal(screen.getByRole('heading', { name: 'No products' }).textContent, 'No products')
})

test('ui-002 representative markup has no automated axe violations', async () => {
  cleanup()
  render(createElement('main', null,
    createElement('h1', null, 'Product controls'),
    createElement(primitives.Field, { label: 'Search products', id: 'search' }),
    createElement(primitives.Button, null, 'Search'),
    createElement(states.CollectionState, { status: 'empty', emptyTitle: 'No products found' }),
  ))
  const results = await axe.run(document.body)
  assert.deepEqual(results.violations, [])
})
