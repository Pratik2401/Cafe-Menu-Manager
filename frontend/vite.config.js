// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
   define: {
    'process.env': process.env,
    'import.meta.env.VITE_THEME_URL': JSON.stringify(process.env.VITE_THEME_URL)
  }
})