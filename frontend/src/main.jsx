import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import { initThemeCSS, refreshThemeCSS } from './utils/themeUtils';
import ThemeProvider from './components/utils/ThemeProvider';

// Initialize the theme CSS with the current timestamp
initThemeCSS();

// Refresh the theme CSS to load the latest colors from the backend
refreshThemeCSS();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)