import { CustomerFooter } from './CustomerFooter.jsx'
import { CustomerLayout } from './CustomerLayout.jsx'
import { CustomerNavbar } from './CustomerNavbar.jsx'

export function CustomerShell({ session, cartCount = 0, contact, contactStatus = 'ready', children }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <CustomerNavbar session={session} cartCount={cartCount} />
      <main id="main-content" className="flex-1 py-8 sm:py-12" tabIndex="-1">
        <CustomerLayout>{children}</CustomerLayout>
      </main>
      <CustomerFooter contact={contact} contactStatus={contactStatus} />
    </div>
  )
}
