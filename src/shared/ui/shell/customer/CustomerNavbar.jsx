import { useEffect, useId, useRef, useState } from 'react'

const links = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
]

function focusableElements(container) {
  return [...container.querySelectorAll('a[href], button:not([disabled])')]
}

export function CustomerNavbar({ session = { status: 'signed-out' }, cartCount = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const menuButtonRef = useRef(null)
  const menuId = useId()

  useEffect(() => {
    if (!menuOpen) return undefined
    const firstFocusable = focusableElements(menuRef.current)?.[0]
    firstFocusable?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        setMenuOpen(false)
        menuButtonRef.current?.focus()
        return
      }
      if (event.key !== 'Tab' || !menuRef.current) return
      const focusable = focusableElements(menuRef.current)
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable.at(-1)
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
  }, [menuOpen])

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(min-width: 48rem)')
    if (!mediaQuery || !menuOpen) return undefined

    function closeForDesktop(event) {
      if (!event.matches) return
      const focusWasInMenu = menuRef.current?.contains(document.activeElement)
      setMenuOpen(false)
      if (focusWasInMenu) document.getElementById('main-content')?.focus()
    }

    mediaQuery.addEventListener('change', closeForDesktop)
    closeForDesktop(mediaQuery)
    return () => mediaQuery.removeEventListener('change', closeForDesktop)
  }, [menuOpen])

  function closeMenu() {
    setMenuOpen(false)
    menuButtonRef.current?.focus()
  }

  const accountLabel = session.status === 'signed-in' ? 'Account' : 'Sign in'
  const accountHref = session.status === 'signed-in' ? '/account' : '/login'

  return (
    <header className="border-b border-line bg-canvas">
      <a className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-ink focus:px-4 focus:py-3 focus:text-canvas" href="#main-content">Skip to content</a>
      <div className="mx-auto flex min-h-16 max-w-[var(--press-content-max)] items-center justify-between gap-5 px-[var(--press-gutter)]">
        <a className="font-display text-xl font-extrabold tracking-[-0.06em] text-ink" href="/" aria-label="Press Store home">PRESS STORE</a>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
          {links.map((link) => <a className="text-sm font-semibold text-ink underline-offset-4 hover:underline" href={link.href} key={link.href}>{link.label}</a>)}
        </nav>
        <div className="hidden items-center gap-5 md:flex">
          <a className="text-sm font-semibold text-ink underline-offset-4 hover:underline" href={accountHref}>{accountLabel}</a>
          <a className="text-sm font-semibold text-ink underline-offset-4 hover:underline" href="/cart" aria-label={`Cart (${cartCount} items)`}>Cart ({cartCount})</a>
        </div>
        <button
          ref={menuButtonRef}
          type="button"
          className="inline-flex min-h-11 items-center border-s border-line ps-4 text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-signal-red md:hidden"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>
      </div>
      <div
        ref={menuRef}
        id={menuId}
        className={`${menuOpen ? 'grid' : 'hidden'} gap-6 border-t border-line bg-surface px-[var(--press-gutter)] py-6 md:hidden`}
        aria-label="Mobile navigation"
      >
        <nav className="grid gap-4" aria-label="Mobile primary navigation">
          {[...links, { href: accountHref, label: accountLabel }, { href: '/cart', label: `Cart (${cartCount})`, ariaLabel: `Cart (${cartCount} items)` }].map((link) => <a className="text-lg font-semibold text-ink" href={link.href} key={link.href} onClick={closeMenu} aria-label={link.ariaLabel}>{link.label}</a>)}
        </nav>
      </div>
    </header>
  )
}
