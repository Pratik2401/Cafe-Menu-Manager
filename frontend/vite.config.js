// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  define: {
    'process.env': process.env,
    'import.meta.env.VITE_THEME_URL': JSON.stringify(process.env.VITE_THEME_URL)
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          bootstrap: ['react-bootstrap', 'bootstrap'],
          icons: ['react-icons', 'bootstrap-icons', '@coreui/icons-react'],
          router: ['react-router-dom'],
          ui: ['@coreui/react', '@coreui/coreui', '@mui/material'],
          utils: ['axios', 'sweetalert2', 'uuid'],
          admin: [
            './src/components/Admin/AdminDashboard.jsx',
            './src/components/Admin/AdminLogin.jsx'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios']
  }
})