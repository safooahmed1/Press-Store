import { Link } from 'react-router-dom'

export function AuthLayout({ children, mode = 'customer', title, description }) {
  const isAdmin = mode === 'admin'
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto grid min-h-screen max-w-[var(--press-content-max)] lg:grid-cols-[minmax(18rem,0.8fr)_minmax(28rem,1.2fr)]">
        <section className="order-2 grid content-between border-t border-line bg-ink p-[var(--press-gutter)] text-canvas lg:order-1 lg:border-e lg:border-t-0 lg:p-10" aria-label="Press Store identity">
          <Link className="font-display text-2xl font-black tracking-[-0.08em] focus-visible:outline-canvas" to="/" aria-label="Press Store home">PRESS STORE</Link>
          <div className="my-12 max-w-md lg:my-0">
            <p className="mb-4 text-sm font-semibold text-canvas/70">{isAdmin ? 'Store operations' : 'Your Press Store account'}</p>
            <h1 className="font-display text-display font-black tracking-[-0.08em]">{isAdmin ? 'RUN THE FLOOR.' : 'DRESS WITH INTENT.'}</h1>
            <p className="mt-6 max-w-sm text-base leading-7 text-canvas/80">{isAdmin ? 'Use the separate admin entrance to manage the storefront.' : 'Keep your orders, cart, and account details in one place.'}</p>
          </div>
          <p className="text-sm text-canvas/65">Egypt · pickup shopping · secure account access</p>
        </section>
        <section className="order-1 grid content-center px-[var(--press-gutter)] py-10 sm:py-16 lg:order-2 lg:px-[clamp(2rem,7vw,8rem)]">
          <div className="mx-auto w-full max-w-md">
            <p className="mb-5 text-sm font-semibold text-muted">{isAdmin ? 'Admin access' : 'Customer access'}</p>
            <h2 className="font-display text-title font-black tracking-[-0.065em]">{title}</h2>
            <p className="mt-4 max-w-sm text-muted">{description}</p>
            <div className="mt-9">{children}</div>
          </div>
        </section>
      </div>
    </main>
  )
}
