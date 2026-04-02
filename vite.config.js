import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Python FastAPI backend (port 8000)
      '/.netlify/functions/login': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: () => '/api/auth/login'
      },
      '/.netlify/functions/register': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: () => '/api/auth/register'
      },
      '/.netlify/functions/verify-email': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: () => '/api/auth/verify-email'
      },
      '/.netlify/functions/resend-code': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: () => '/api/auth/resend-code'
      },
      '/.netlify/functions/tapqyr-quizzes': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/.netlify\/functions/, '/api')
      },
      '/.netlify/functions/tapqyr-sessions': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/.netlify\/functions/, '/api')
      },
      '/.netlify/functions/tapqyr-players': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/.netlify\/functions/, '/api')
      },
      '/.netlify/functions/tapqyr-answer': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/.netlify\/functions/, '/api')
      },
      '/.netlify/functions/presentation-api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/.netlify\/functions/, '/api')
      },
      '/.netlify/functions/generate-content': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: () => '/api/ai/generate-content'
      },
      '/.netlify/functions/ai-tulga-content': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: () => '/api/ai/tulga-content'
      },
      '/.netlify/functions/ai-tts': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: () => '/api/ai/tts'
      },
      '/.netlify/functions/generate-presentation': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: () => '/api/ai/generate-presentation'
      },
      '/.netlify/functions/admin-stats': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: () => '/api/admin/stats'
      },
      '/.netlify/functions/admin-users': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: () => '/api/admin/users'
      },
      '/.netlify/functions/analytics': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: () => '/api/analytics'
      },
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
