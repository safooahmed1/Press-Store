import { useId } from 'react'

export function Field({
  as = 'input',
  label,
  hint,
  error,
  required = false,
  id,
  className = '',
  children,
  ...props
}) {
  const generatedId = useId()
  const controlId = id ?? `field-${generatedId.replaceAll(':', '')}`
  const hintId = `${controlId}-hint`
  const errorId = `${controlId}-error`
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined
  const Control = as === 'textarea' ? 'textarea' : as === 'select' ? 'select' : 'input'

  return (
    <div className={`grid gap-2 ${className}`}>
      <label className="text-sm font-semibold leading-tight text-ink" htmlFor={controlId}>
        {label}
        {required ? <span aria-hidden="true" className="ms-1 text-signal-red">*</span> : null}
      </label>
      <Control
        {...props}
        id={controlId}
        className="min-h-11 w-full rounded-[var(--radius-control)] border border-line bg-canvas px-3 py-3 text-ink outline-none transition-colors placeholder:text-muted focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-signal-red/30 aria-invalid:border-signal-red"
        aria-describedby={describedBy}
        aria-invalid={error ? 'true' : undefined}
        aria-required={required || undefined}
        required={required}
      >
        {as === 'select' ? children : null}
      </Control>
      {hint ? <p id={hintId} className="text-sm text-muted">{hint}</p> : null}
      {error ? <p id={errorId} className="text-sm font-medium text-signal-red" role="alert">{error}</p> : null}
    </div>
  )
}
