import assert from 'node:assert/strict'
import { readFileSync, statSync } from 'node:fs'
import { describe, it } from 'node:test'

const css = readFileSync(new URL('./index.css', import.meta.url), 'utf8')
const packageJson = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'))
const main = readFileSync(new URL('../main.jsx', import.meta.url), 'utf8')
const viteConfig = readFileSync(new URL('../../vite.config.js', import.meta.url), 'utf8')

function luminance(hex) {
  const channels = hex.match(/[0-9a-f]{2}/gi).map((channel) => parseInt(channel, 16) / 255)
  const linear = channels.map((channel) => (channel <= 0.03928
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4))
  return (0.2126 * linear[0]) + (0.7152 * linear[1]) + (0.0722 * linear[2])
}

function contrast(first, second) {
  const light = Math.max(luminance(first), luminance(second))
  const dark = Math.min(luminance(first), luminance(second))
  return (light + 0.05) / (dark + 0.05)
}

describe('ui design tokens', () => {
  it('publishes the approved fashion palette and responsive tokens', () => {
    for (const token of [
      '--color-canvas: #ffffff',
      '--color-ink: #111111',
      '--color-signal-red: #d0001b',
      '--color-surface: #f3f3f0',
      '--color-muted: #666666',
      '--color-line: #d6d6d1',
      '--breakpoint-sm: 40rem',
      '--breakpoint-md: 48rem',
      '--breakpoint-lg: 64rem',
      '--breakpoint-xl: 80rem',
    ]) assert.match(css, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    assert.match(css, /--radius-card:\s*0;/)
    assert.match(css, /--text-display:\s*clamp\(/)
  })

  it('keeps primary text, accent, and muted text readable on the canvas', () => {
    assert.ok(contrast('#111111', '#ffffff') >= 4.5)
    assert.ok(contrast('#d0001b', '#ffffff') >= 4.5)
    assert.ok(contrast('#666666', '#ffffff') >= 4.5)
  })

  it('self-hosts one variable Latin font and one Arabic fallback', () => {
    assert.match(css, /font-family:\s*"Archivo"/)
    assert.match(css, /font-family:\s*"Noto Sans Arabic"/)
    for (const path of [
      '../assets/fonts/archivo-latin-wght-normal.woff2',
      '../assets/fonts/noto-sans-arabic-arabic-wght-normal.woff2',
    ]) assert.ok(statSync(new URL(path, import.meta.url)).size > 1024)
    assert.equal((css.match(/@font-face/g) ?? []).length, 2)
  })

  it('wires Tailwind through Vite and loads the global stylesheet once', () => {
    assert.match(packageJson.devDependencies.tailwindcss, /^\^4\./)
    assert.match(packageJson.devDependencies['@tailwindcss/vite'], /^\^4\./)
    assert.match(packageJson.devDependencies['css-loader'], /^\^6|^\^7|^\^8/)
    assert.match(viteConfig, /tailwindcss\(\)/)
    assert.equal((main.match(/\.\/styles\/index\.css/g) ?? []).length, 1)
    assert.match(css, /^@import "tailwindcss";/)
  })

  it('keeps motion, focus, and RTL-tolerant base behavior explicit', () => {
    assert.match(css, /prefers-reduced-motion/)
    assert.match(css, /focus-visible/)
    assert.match(css, /font-family: var\(--font-sans\)/)
  })
})
