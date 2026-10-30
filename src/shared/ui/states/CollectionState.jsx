import { Button } from '../primitives/Button.jsx'

export function CollectionState({ status = 'success', children, emptyTitle = 'Nothing here yet', emptyDescription, emptyAction, onRetry }) {
  if (status === 'loading') return <div className="grid gap-3" role="status" aria-live="polite" aria-label="Loading results" aria-busy="true"><span className="h-36 w-full animate-pulse bg-surface motion-reduce:animate-none" /><span className="h-3 w-2/3 animate-pulse bg-surface motion-reduce:animate-none" /></div>
  if (status === 'empty') return <div className="grid justify-items-start gap-3 border-y border-line py-10" role="status"><h2 className="font-display text-xl font-bold">{emptyTitle}</h2>{emptyDescription ? <p className="max-w-prose text-sm text-muted">{emptyDescription}</p> : null}{emptyAction}</div>
  if (status === 'unauthorized') return <div className="grid gap-3 border-s-4 border-signal-red bg-surface p-5" role="alert"><h2 className="font-semibold">Sign in to view these results</h2><p className="text-sm text-muted">Your account access is required for this collection.</p></div>
  if (status === 'error') return <div className="grid gap-3 border-s-4 border-signal-red bg-surface p-5" role="alert"><h2 className="font-semibold">Results are unavailable.</h2><p className="text-sm text-muted">Try again in a moment.</p>{onRetry ? <Button variant="quiet" onClick={onRetry}>Try again</Button> : null}</div>
  return children
}
