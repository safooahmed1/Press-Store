import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Never load .env files into the client build; public config is explicit.
  envDir: false,
  server: {
    proxy: { '/api': 'http://127.0.0.1:3000' },
  },
})
