import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App.jsx'
import { FeatureActionProvider } from './app/feature-actions.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FeatureActionProvider>
      <App />
    </FeatureActionProvider>
  </StrictMode>,
)
