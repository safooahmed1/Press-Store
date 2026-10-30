import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { FeatureActionProvider } from './feature-actions.js'
import { createAppQueryClient } from '../shared/api/query-client.js'

export function AppProviders({ children }) {
  const [queryClient] = useState(createAppQueryClient)
  return (
    <QueryClientProvider client={queryClient}>
      <FeatureActionProvider>{children}</FeatureActionProvider>
    </QueryClientProvider>
  )
}
