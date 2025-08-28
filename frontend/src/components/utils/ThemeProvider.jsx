import React, { useEffect, useState } from 'react';
import { applyThemeVariablesToRoot } from '../../utils/themeUtils';

/**
 * ThemeProvider component that ensures theme is loaded before rendering children
 */
const ThemeProvider = ({ children }) => {
  const [themeLoaded, setThemeLoaded] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Apply theme variables to :root
    const loadTheme = async () => {
      try {
        await applyThemeVariablesToRoot();
        setThemeLoaded(true);
      } catch (err) {
        console.error('Failed to load theme:', err);
        setError(err.message);
        // Continue rendering even if theme failed to load
        setThemeLoaded(true);
      }
    };
    
    loadTheme();
    
    // Apply default theme variables directly to ensure something is displayed
    document.documentElement.style.setProperty('--bg-primary', '#FEF8F3', 'important');
    document.documentElement.style.setProperty('--bg-secondary', '#FEAD2E', 'important');
    document.documentElement.style.setProperty('--bg-tertiary', '#383838', 'important');
    document.documentElement.style.setProperty('--color-dark', '#383838', 'important');
    document.documentElement.style.setProperty('--color-accent', '#FEAD2E', 'important');
  }, []);
  
  // Show a minimal loading state while theme is loading
  if (!themeLoaded) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#FEF8F3' // Default background color
      }}>
        <p>Loading theme...</p>
      </div>
    );
  }
  
  return <>{children}</>;
};

export default ThemeProvider;