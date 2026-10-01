import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

const pagesBase = process.env.GITHUB_PAGES === 'true' ? '/dynamic-answer-book/' : './'

export default defineConfig({
  // GitHub Pages 的網址在 /dynamic-answer-book/ 底下，資源必須帶上這個前綴。
  base: pagesBase,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 47291,
    strictPort: true,
  },
})
