import { Button } from '../primitives/Button.jsx'

function LoadingState({ label }) {
  return <div className="grid gap-3" role="status" aria-live="polite" aria-label={label}><span className="h-3 w-32 animate-pulse bg-surface motion-reduce:animate-none" /><span className="h-3 w-full max-w-xl animate-pulse bg-surface motion-reduce:animate-none" /></div>
}

export function AsyncBoundary({ status = 'success', children, errorMessage, requestId, onRetry }) {
  if (status === 'loading') return <LoadingState label="Loading" />
  if (status === 'unauthorized') return <div className="grid gap-3 border-s-4 border-signal-red bg-surface p-5" role="alert"><h2 className="font-semibold">Sign in to continue</h2><p className="text-sm text-muted">This area is available to signed-in customers.</p></div>
  if (status === 'error') {
    return <div className="grid gap-3 border-s-4 border-signal-red bg-surface p-5" role="alert"><h2 className="font-semibold">We couldn’t load this yet.</h2><p className="text-sm text-muted">{typeof errorMessage === 'string' ? errorMessage : 'Try again in a moment.'}</p>{requestId ? <p className="text-xs text-muted">Reference: <span dir="ltr">{requestId}</span></p> : null}{onRetry ? <Button variant="quiet" onClick={onRetry}>Try again</Button> : null}</div>
  }
  return children
}
