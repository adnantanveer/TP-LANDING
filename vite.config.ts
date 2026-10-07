import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Ports from the tp-landing block (8420-8429) in Developer/.claude/rules/port-registry.md
  server: {
    port: 8420,
    strictPort: true,
    // Opt-in: TP_API_PROXY=https://techpotam.tech proxies /api to that backend so local
    // review shows real CMS content. The live API rejects cross-origin requests from localhost.
    proxy: process.env.TP_API_PROXY
      ? { '/api': { target: process.env.TP_API_PROXY, changeOrigin: true } }
      : undefined,
  },
  preview: { port: 8421, strictPort: true },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
