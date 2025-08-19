/**
 * Updates the theme CSS link with a new timestamp to force a refresh
 * @param {boolean} forceReload - Whether to force a reload of the CSS file
 */
export const refreshThemeCSS = (forceReload = true) => {
  // Find the theme CSS link element
  const themeLink = document.querySelector('link[href*="theme.css"]');
  
  if (themeLink) {
    // Get the current href
    let href = themeLink.getAttribute('href');
    
    // Replace the timestamp or add it if it doesn't exist
    if (href.includes('?v=')) {
      href = href.replace(/\?v=\d+/, `?v=${Date.now()}`);
    } else {
      href = `${href}?v=${Date.now()}`;
    }
    
    // Update the href to force a refresh
    themeLink.setAttribute('href', href);
    
    // If forceReload is true, remove and re-add the link element to force a reload
    if (forceReload) {
      const parent = themeLink.parentNode;
      const nextSibling = themeLink.nextSibling;
      
      // Remove the link element
      parent.removeChild(themeLink);
      
      // Create a new link element with the same attributes
      const newLink = document.createElement('link');
      newLink.rel = 'stylesheet';
      newLink.href = href;
      
      // Re-add the link element
      if (nextSibling) {
        parent.insertBefore(newLink, nextSibling);
      } else {
        parent.appendChild(newLink);
      }
    }
  }
};

/**
 * Initialize the theme CSS link with the current timestamp
 */
export const initThemeCSS = () => {
  // Find the theme CSS link element
  const themeLink = document.querySelector('link[href*="TIMESTAMP_PLACEHOLDER"]');
  
  if (themeLink) {
    // Get the current href
    let href = themeLink.getAttribute('href');
    
    // Replace the environment variable placeholder with the actual base URL
    const baseUrl = import.meta.env.VITE_API_URL_BASE || 'http://localhost:3000';
    href = href.replace('%VITE_API_URL_BASE%', baseUrl);
    
    // Replace the placeholder with the current timestamp
    href = href.replace('TIMESTAMP_PLACEHOLDER', Date.now());
    
    // Update the href
    themeLink.setAttribute('href', href);
    
    // Set the onload handler to apply the CSS variables to :root
    themeLink.onload = () => {
      applyThemeVariablesToRoot();
    };
  }
};

/**
 * Apply theme CSS variables to :root element
 * This ensures the variables are available even if the CSS file hasn't loaded yet
 */
export const applyThemeVariablesToRoot = async () => {
  try {
    // Get the base URL from environment variables
    const baseUrl = import.meta.env.VITE_API_URL_BASE || 'http://localhost:3000';
    
    console.log('Fetching theme CSS from:', `${baseUrl}/theme?v=${Date.now()}`);
    
    // Fetch the theme CSS file
    const response = await fetch(`${baseUrl}/theme?v=${Date.now()}`);
   
    if (!response.ok) {
      throw new Error(`Failed to fetch theme CSS: ${response.status} ${response.statusText}`);
    }
    
    const cssText = await response.text();
    console.log('Theme CSS loaded:', cssText);
    
    // Extract CSS variables from the response
    const rootRegex = /:root\s*{([^}]*)}/;
    const match = rootRegex.exec(cssText);
    if (match && match[1]) {
      // Extract variable declarations
      const variableRegex = /--([^:]+):\s*([^;]+);/g;
      let varMatch;
      
      while ((varMatch = variableRegex.exec(match[1])) !== null) {
        const varName = `--${varMatch[1].trim()}`;
        const varValue = varMatch[2].trim();
        
        // Apply the variable to :root
        document.documentElement.style.setProperty(varName, varValue);
        console.log(`Applied CSS variable: ${varName} = ${varValue}`);
      }
    } else {
      console.warn('No :root section found in CSS');
    }
  } catch (error) {
    console.error('Error applying theme variables:', error);
    
    // Apply default theme variables as fallback
    document.documentElement.style.setProperty('--bg-primary', '#FEF8F3');
    document.documentElement.style.setProperty('--bg-secondary', '#FEAD2E');
    document.documentElement.style.setProperty('--bg-tertiary', '#383838');
    document.documentElement.style.setProperty('--color-dark', '#383838');
    document.documentElement.style.setProperty('--color-accent', '#FEAD2E');
    console.log('Applied default theme variables as fallback');
    
    throw error;
  }
};