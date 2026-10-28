const formatterCache = new Map()

function getFormatter(locale, currency) {
  const key = `${locale}:${currency}`
  if (!formatterCache.has(key)) {
    formatterCache.set(key, new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }))
  }
  return formatterCache.get(key)
}

export function Price({ amountMinor, locale = 'en-EG', currency = 'EGP', className = '' }) {
  const numericAmount = typeof amountMinor === 'bigint' ? Number(amountMinor) : amountMinor
  if (!Number.isSafeInteger(numericAmount)) {
    throw new TypeError('Price amountMinor must be a safe integer or bigint within display range')
  }

  return <span className={`font-semibold tabular-nums ${className}`} dir="ltr">{getFormatter(locale, currency).format(numericAmount / 100)}</span>
}
