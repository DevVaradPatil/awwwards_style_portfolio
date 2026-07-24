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
    // Emits dist/.vite/manifest.json — the source-path → hashed-output map that
    // scripts/prerender.mjs needs to resolve each project's OG image. Guessing
    // from the dist basename is ambiguous (both apps ship a `1.webp` and a
    // `logo.png`), so the manifest is the only reliable lookup.
    manifest: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          // Normalise Windows backslashes so the slash-delimited matchers below
          // (e.g. /react/, /motion/) work identically on every platform.
          const p = id.replace(/\\/g, '/')
          // Analytics is reached only through a dynamic import (see
          // system/Analytics.jsx) — returning undefined lets rolldown keep it
          // in that async chunk, so it is never modulepreloaded on `/`.
          // This MUST come before the react matcher: @vercel/*/dist/react/
          // contains '/react/' and would otherwise land in the eager
          // vendor-react chunk.
          if (p.includes('@vercel/')) return
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
