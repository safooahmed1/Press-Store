import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const source = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')

test('UI-002 primitives expose semantic interaction contracts', () => {
  const button = source('./primitives/Button.jsx')
  const field = source('./primitives/Field.jsx')
  const dialog = source('./primitives/Dialog.jsx')

  assert.match(button, /aria-busy=\{pending \|\| undefined\}/)
  assert.match(button, /disabled=\{isDisabled\}/)
  assert.match(button, /primary:/)
  assert.match(button, /secondary:/)
  assert.match(button, /quiet:/)
  assert.match(field, /aria-describedby=\{describedBy\}/)
  assert.match(field, /aria-invalid=\{error \? 'true' : undefined\}/)
  assert.match(field, /htmlFor=\{controlId\}/)
  assert.match(dialog, /<dialog/)
  assert.match(dialog, /showModal\(\)/)
  assert.match(dialog, /onCancel=\{handleCancel\}/)
  assert.match(dialog, /returnFocusRef\.current\.focus\(\)/)
})

test('UI-002 state components keep recovery and privacy behavior explicit', () => {
  const asyncBoundary = source('./states/AsyncBoundary.jsx')
  const collectionState = source('./states/CollectionState.jsx')

  assert.match(asyncBoundary, /role="status"/)
  assert.match(asyncBoundary, /role="alert"/)
  assert.match(asyncBoundary, /Reference:/)
  assert.match(asyncBoundary, /onRetry/)
  assert.match(collectionState, /status === 'empty'/)
  assert.match(collectionState, /status === 'unauthorized'/)
  assert.match(collectionState, /status === 'error'/)
  assert.match(collectionState, /Try again/)
  assert.doesNotMatch(asyncBoundary, /dangerouslySetInnerHTML/)
  assert.doesNotMatch(collectionState, /dangerouslySetInnerHTML/)
})

test('UI-002 visual primitives consume centralized design tokens', () => {
  const files = [
    './primitives/Button.jsx',
    './primitives/Field.jsx',
    './primitives/Dialog.jsx',
    './primitives/Image.jsx',
    './states/AsyncBoundary.jsx',
    './states/CollectionState.jsx',
  ].map(source)
  const combined = files.join('\n')

  assert.match(combined, /signal-red/)
  assert.match(combined, /surface/)
  assert.match(combined, /border-line/)
  assert.match(combined, /motion-reduce/)
  assert.doesNotMatch(combined, /shadow-/)
  assert.doesNotMatch(combined, /linear-gradient|radial-gradient/)
})

test('UI-002 public exports stay limited to primitives and states', () => {
  assert.match(source('./primitives/index.js'), /Button/)
  assert.match(source('./primitives/index.js'), /Field/)
  assert.match(source('./primitives/index.js'), /Dialog/)
  assert.match(source('./primitives/index.js'), /Price/)
  assert.match(source('./primitives/index.js'), /Image/)
  assert.match(source('./states/index.js'), /AsyncBoundary/)
  assert.match(source('./states/index.js'), /CollectionState/)
})
