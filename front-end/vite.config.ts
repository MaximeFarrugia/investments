import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
      }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/openbb': {
          target: env.VITE_OPENBB_URL,
          rewrite: (path) => path.replace(/^\/openbb/, ''),
        },
        '/edgar': {
          target: env.VITE_EDGAR_URL,
          rewrite: (path) => path.replace(/^\/edgar/, ''),
        },
      },
    },
  }
})
