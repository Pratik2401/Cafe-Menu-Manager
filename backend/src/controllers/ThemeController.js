const Cafe = require('../models/CafeModel');

/**
 * Generate and serve dynamic CSS based on cafe theme settings
 */
const getThemeCSS = async (_req, res) => {
  try {
    const cafe = await Cafe.findOne();
    
    if (!cafe || !cafe.menuCustomization || !cafe.menuCustomization.cssVariables) {
      // Return default CSS if no customization exists
      res.setHeader('Content-Type', 'text/css');
      res.send(`
:root {
  /* Primary background colors */
  --bg-primary: #FEF8F3;    /* Main background */
  --bg-secondary: #FEAD2E;  /* Headers, active elements */
  --bg-tertiary: #383838;   /* Accents, hover states */
  
  /* Font colors */
  --color-dark: #383838;    /* Primary text */
  --color-accent: #FEAD2E;  /* Highlights, active elements */
  --color-secondary: #666666; /* Secondary text */
  
  /* Logo settings */
  --logo-bg-color: #FFFFFF;  /* Logo background color */
}
      `);
      return;
    }
    
    // Get CSS variables from cafe settings
    const cssVars = cafe.menuCustomization.cssVariables;
    
    // Set content type to CSS
    res.setHeader('Content-Type', 'text/css');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    // Get logo background color
    const logoBackgroundColor = cafe.menuCustomization.logoBackgroundColor || '#FFFFFF';
    
    // Generate and send the CSS
    res.send(`
:root {
  /* Primary background colors */
  --bg-primary: ${cssVars['--bg-primary'] || '#FEF8F3'};    /* Main background */
  --bg-secondary: ${cssVars['--bg-secondary'] || '#FEAD2E'};  /* Headers, active elements */
  --bg-tertiary: ${cssVars['--bg-tertiary'] || '#383838'};   /* Accents, hover states */
  
  /* Font colors */
  --color-dark: ${cssVars['--color-dark'] || '#383838'};    /* Primary text */
  --color-accent: ${cssVars['--color-accent'] || '#FEAD2E'};  /* Highlights, active elements */
  --color-secondary: ${cssVars['--color-secondary'] || '#666666'}; /* Secondary text */
  --card-bg:${cssVars['--card-bg'] || '#FFFFFF'};        /* Card background color */
  --card-text:${cssVars['--card-text'] || '#000000'};
  /* Logo settings */
  --logo-bg-color: ${logoBackgroundColor};  /* Logo background color */
}
    `);
  } catch (error) {
    console.error('Error generating theme CSS:', error);
    // Return default CSS in case of error
    res.setHeader('Content-Type', 'text/css');
    res.status(500).send(`
:root {
  /* Primary background colors - DEFAULT (Error occurred) */
  --bg-primary: #FEF8F3;
  --bg-secondary: #FEAD2E;
  --bg-tertiary: #383838;
  
  /* Font colors - DEFAULT (Error occurred) */
  --color-dark: #383838;
  --color-accent: #FEAD2E;
  --color-secondary: #666666;
  
  /* Logo settings - DEFAULT (Error occurred) */
  --logo-bg-color: #FFFFFF;
  --card-bg: #FFFFFF;
  --card-text: #000000;
}
    `);
  }
};

module.exports = {
  getThemeCSS
};