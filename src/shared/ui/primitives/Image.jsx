import { useState } from 'react'

export function Image({ src, alt, fallback = null, loading = 'lazy', aspectRatio = '4 / 5', className = '', onError, ...props }) {
  const [failure, setFailure] = useState({ src: null, failed: false })
  const failed = failure.src === src && failure.failed

  function handleError(event) {
    setFailure({ src, failed: true })
    onError?.(event)
  }

  if (failed) {
    return <span className={`grid place-items-center bg-surface text-sm text-muted ${className}`} style={{ aspectRatio }} role="img" aria-label={alt}>{fallback ?? 'Image unavailable'}</span>
  }

  return (
    <img
      {...props}
      src={src}
      alt={alt}
      loading={loading}
      onError={handleError}
      className={`w-full object-cover ${className}`}
      style={{ aspectRatio, ...props.style }}
    />
  )
}
