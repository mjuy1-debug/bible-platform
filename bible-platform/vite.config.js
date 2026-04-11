import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/bible-platform/',   // GitHub Pages 레포 이름과 일치
  build: {
    chunkSizeWarningLimit: 2000,
  },
})
