import { useEffect, useId, useRef, useState } from 'react'

function focusableElements(container) {
  return container ? [...container.querySelectorAll('a[href], button:not([disabled])')] : []
}

function safeAdminPath(href) {
  return typeof href === 'string' && href.startsWith('/') && !href.startsWith('//')
}

export function AdminLayout({
  children,
  navItems = [],
  currentItem,
  title = 'Admin',
  onLogout,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const menuButtonRef = useRef(null)
  const drawerRef = useRef(null)
  const drawerId = useId()

  useEffect(() => {
    if (!drawerOpen) return undefined
    const focusables = focusableElements(drawerRef.current)
    focusables[0]?.focus()
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        setDrawerOpen(false)
        menuButtonRef.current?.focus()
        return
      }
      if (event.key !== 'Tab') return
      const items = focusableElements(drawerRef.current)
      if (!items.length) return
      const first = items[0]
      const last = items.at(-1)
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [drawerOpen])

  function closeDrawer() {
    setDrawerOpen(false)
    menuButtonRef.current?.focus()
  }

  const itemIsCurrent = (item) => item.current || item.id === currentItem || item.href === currentItem

  function navigation() {
    return (
      <nav aria-label="Admin navigation" className="grid gap-1">
        {navItems.map((item) => {
          if (!safeAdminPath(item.href)) return null
          const current = itemIsCurrent(item)
          return (
            <a
              className={`border-s-2 px-3 py-3 text-sm font-semibold transition-colors hover:bg-surface ${current ? 'border-signal-red bg-surface text-ink' : 'border-transparent text-muted'}`}
              href={item.href}
              aria-current={current ? 'page' : undefined}
              key={item.id ?? item.href}
              onClick={drawerOpen ? closeDrawer : undefined}
            >
              <span className="block break-words">{item.label}</span>
            </a>
          )
        })}
        {onLogout && (
          <button type="button" className="mt-4 border-s border-transparent px-3 py-3 text-start text-sm font-semibold text-muted hover:bg-surface" onClick={onLogout}>
            Log out
          </button>
        )}
      </nav>
    )
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <a className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-ink focus:px-4 focus:py-3 focus:text-canvas" href="#admin-content">Skip to content</a>
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-e border-line bg-canvas lg:block" aria-label="Admin sidebar">
          <div className="sticky top-0 grid gap-10 p-6">
            <a className="font-display text-xl font-extrabold tracking-[-0.06em]" href="/admin" aria-label="Admin home">PRESS STORE / ADMIN</a>
            {navigation()}
          </div>
        </aside>
        {drawerOpen && <button type="button" aria-label="Close navigation" className="fixed inset-0 z-30 bg-ink/40 lg:hidden" onClick={closeDrawer} />}
        <aside ref={drawerRef} id={drawerId} className={`${drawerOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 start-0 z-40 w-[min(21rem,calc(100vw-2rem))] border-e border-line bg-canvas p-6 transition-transform duration-200 lg:hidden`} aria-label="Mobile admin navigation" aria-hidden={!drawerOpen}>
          <div className="grid gap-10">
            <div className="flex items-center justify-between gap-4">
              <a className="font-display text-lg font-extrabold tracking-[-0.06em]" href="/admin" onClick={closeDrawer}>PRESS STORE / ADMIN</a>
              <button type="button" className="min-h-11 border-s border-line ps-3 text-sm font-semibold" onClick={closeDrawer}>Close</button>
            </div>
            {navigation()}
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <header className="border-b border-line bg-canvas">
            <div className="mx-auto flex min-h-16 max-w-[var(--press-content-max)] items-center gap-4 px-[var(--press-gutter)]">
              <button ref={menuButtonRef} type="button" className="min-h-11 border-e border-line pe-4 text-sm font-semibold lg:hidden" aria-expanded={drawerOpen} aria-controls={drawerId} onClick={() => setDrawerOpen(true)}>Menu</button>
              <p className="text-sm font-semibold text-muted" aria-live="polite">Admin / <span className="text-ink">{title}</span></p>
            </div>
          </header>
          <main id="admin-content" className="mx-auto w-full max-w-[var(--press-content-max)] px-[var(--press-gutter)] py-8 md:py-12">{children}</main>
        </div>
      </div>
    </div>
  )
}
