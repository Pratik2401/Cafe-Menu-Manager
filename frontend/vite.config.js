// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Enable experimental features for faster loading
  experimental: {
    renderBuiltUrl(filename) {
      return { runtime: `window.__assetsPath(${JSON.stringify(filename)})` }
    }
  },
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
          // Core React chunks - highest priority
          'react-core': ['react', 'react-dom'],
          'react-router': ['react-router-dom'],
          
          // UI Framework chunks
          'bootstrap-core': ['react-bootstrap', 'bootstrap'],
          'icons': ['react-icons', 'bootstrap-icons', '@coreui/icons-react'],
          
          // Customer components - load first
          'customer-core': [
            './src/components/MenuDesignOne/LandingPage.jsx',
            './src/components/MenuDesignOne/MenuView.jsx'
          ],
          
          // Admin components - lazy load
          'admin-core': [
            './src/components/Admin/AdminLogin.jsx',
            './src/components/Admin/AdminDashboard.jsx'
          ],
          'admin-management': [
            './src/components/Admin/AdminCategoryMainPage.jsx',
            './src/components/Admin/AdminItemMainPage.jsx'
          ],
          
          // Utilities and services
          'api-services': ['axios'],
          'ui-utils': ['sweetalert2', 'uuid'],
          'external-ui': ['@coreui/react', '@coreui/coreui', '@mui/material']
        }
      }
    },
    chunkSizeWarningLimit: 500,
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
    include: [
      'react', 'react-dom', 'react-router-dom', 'axios',
      'react-bootstrap', 'bootstrap'
    ],
    force: true
  },
  server: {
    warmup: {
      clientFiles: [
        './src/components/MenuDesignOne/LandingPage.jsx',
        './src/components/MenuDesignOne/MenuView.jsx',
        './src/components/utils/CafeLoader.jsx'
      ]
    }
  }
})