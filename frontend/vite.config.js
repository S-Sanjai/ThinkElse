import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // The FastAPI backend runs on localhost:8000 with root_path /api/v1.
      // Proxying keeps the browser same-origin in dev (no CORS friction),
      // and works in preview/production when a reverse proxy maps /api.
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
