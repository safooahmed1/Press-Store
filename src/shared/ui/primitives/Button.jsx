import { forwardRef } from 'react'

const variants = {
  primary: 'bg-signal-red text-canvas hover:bg-ink',
  secondary: 'bg-ink text-canvas hover:bg-signal-red',
  quiet: 'border border-line bg-canvas text-ink hover:border-ink hover:bg-surface',
}

export const Button = forwardRef(function Button({
  children,
  className = '',
  pending = false,
  pendingLabel = 'Working',
  variant = 'primary',
  type = 'button',
  disabled,
  ...props
}, ref) {
  const isDisabled = disabled || pending

  return (
    <button
      {...props}
      ref={ref}
      type={type}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] px-5 py-3 text-sm font-semibold leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-signal-red disabled:cursor-not-allowed disabled:opacity-55 ${variants[variant] ?? variants.primary} ${className}`}
      disabled={isDisabled}
      aria-busy={pending || undefined}
      data-state={pending ? 'pending' : isDisabled ? 'disabled' : 'ready'}
    >
      {pending ? <span aria-hidden="true" className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none" /> : null}
      <span>{pending ? pendingLabel : children}</span>
    </button>
  )
})
