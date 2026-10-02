import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: '../chengwen',
    emptyOutDir: true,
    target: 'es2022',
  },
  server: { host: '0.0.0.0', port: 47311 },
  test: { environment: 'node' },
})
