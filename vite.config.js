import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'es2022',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          // Normalise Windows backslashes so the slash-delimited matchers below
          // (e.g. /react/, /motion/) work identically on every platform.
          const p = id.replace(/\\/g, '/')
          if (p.includes('react-dom') || p.includes('/react/') || p.includes('scheduler')) {
            return 'vendor-react'
          }
          if (p.includes('react-router')) return 'vendor-router'
          if (p.includes('gsap')) return 'vendor-gsap'
          if (p.includes('lenis')) return 'vendor-lenis'
          if (p.includes('lucide-react')) return 'vendor-icons'
        },
      },
    },
  },
})
