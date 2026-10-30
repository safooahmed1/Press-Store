function safeExternalUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

function phoneHref(value) {
  const digits = String(value ?? '').replace(/[^+\d]/g, '')
  return digits ? `tel:${digits}` : null
}

function whatsappHref(value) {
  const digits = String(value ?? '').replace(/\D/g, '')
  return digits ? `https://wa.me/${digits}` : null
}

export function CustomerFooter({ contact, contactStatus = 'ready' }) {
  const ready = contactStatus === 'ready' && contact
  const phone = ready ? phoneHref(contact.storePhone) : null
  const whatsapp = ready ? whatsappHref(contact.whatsappPhone) : null
  const socialLinks = ready && contact.socialLinks && typeof contact.socialLinks === 'object'
    ? Object.entries(contact.socialLinks).map(([label, value]) => ({ label, href: safeExternalUrl(value) })).filter((link) => link.href)
    : []

  return (
    <footer className="border-t border-line bg-ink text-canvas">
      <div className="mx-auto grid max-w-[var(--press-content-max)] gap-10 px-[var(--press-gutter)] py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div className="grid content-start gap-3">
          <p className="font-display text-2xl font-extrabold tracking-[-0.06em]">{ready?.storeName || 'PRESS STORE'}</p>
          <p className="max-w-xs text-sm leading-6 text-canvas/70">Streetwear selected for the everyday rotation.</p>
        </div>
        <div className="grid content-start gap-3">
          <h2 className="text-sm font-semibold">Contact</h2>
          {contactStatus === 'loading' ? <p className="text-sm text-canvas/60" role="status">Loading contact details…</p> : null}
          {phone ? <a className="w-fit text-sm text-canvas/80 underline-offset-4 hover:underline" href={phone}>Call the store</a> : null}
          {whatsapp ? <a className="w-fit text-sm text-canvas/80 underline-offset-4 hover:underline" href={whatsapp} rel="noreferrer" target="_blank">WhatsApp</a> : null}
        </div>
        <div className="grid content-start gap-3">
          <h2 className="text-sm font-semibold">Follow</h2>
          {socialLinks.length ? socialLinks.map((link) => <a className="w-fit text-sm text-canvas/80 underline-offset-4 hover:underline" href={link.href} rel="noreferrer" target="_blank" key={link.label}>{link.label}</a>) : <p className="text-sm text-canvas/60">Social links coming soon.</p>}
        </div>
      </div>
      <div className="border-t border-canvas/20 px-[var(--press-gutter)] py-4 text-center text-xs text-canvas/60">© Press Store</div>
    </footer>
  )
}
