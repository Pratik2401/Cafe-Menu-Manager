# TopchiOutpost Frontend

## 🚀 Overview

The TopchiOutpost frontend is a modern React application that provides an intuitive interface for both customers and administrators. Built with React 19 and Vite, it offers fast performance, dynamic theming, and responsive design.

## 🏗️ Architecture

### Technology Stack
- **Framework**: React 19.1.0
- **Build Tool**: Vite 6.3.5
- **UI Framework**: React Bootstrap 5
- **State Management**: React Context API
- **Routing**: React Router DOM 7.6.0
- **HTTP Client**: Axios 1.9.0
- **Icons**: React Icons + Bootstrap Icons
- **Drag & Drop**: @dnd-kit

### Project Structure
```
frontend/
├── src/
│   ├── components/         # React components
│   │   ├── Admin/         # Admin dashboard components
│   │   ├── Customer/      # Customer-facing components
│   │   └── Shared/        # Reusable components
│   ├── api/               # API service layer
│   ├── utils/             # Utility functions
│   ├── styles/            # CSS stylesheets
│   └── assets/            # Static assets
├── public/                # Public assets
├── index.html            # HTML template
└── vite.config.js        # Vite configuration
```

## ⚙️ Installation & Setup

### Prerequisites
- Node.js >= 16.0.0
- npm or yarn

### Environment Configuration
Create `.env` file:
```env
# API Endpoints
VITE_API_URL_ADMIN=http://localhost:3000/api/admin
VITE_API_URL_CUSTOMER=http://localhost:3000/api/customer

# Development Settings
VITE_DEBUG_MODE=true
```

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access application
# http://localhost:5173
```

## 🎨 Features

### Customer Features
- **Menu Browsing**: Interactive menu with categories and search
- **Event Information**: View cafe events and special offers
- **Daily Offers**: Browse current promotions
- **Feedback System**: Submit ratings and reviews
- **Responsive Design**: Mobile-first responsive interface

### Admin Features
- **Dashboard**: Comprehensive management interface
- **Menu Management**: CRUD operations for items, categories
- **Event Management**: Create and manage cafe events
- **Theme Customization**: Dynamic color scheme management
- **User Analytics**: Customer feedback and engagement data
- **Content Management**: Images, descriptions, pricing

## 🔧 Development

### Available Scripts
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint issues
```

### Component Structure
```javascript
/**
 * @component ComponentName
 * @description Component purpose
 * @param {Object} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const ComponentName = ({ prop1, prop2 }) => {
  // Component logic
  return <div>Component JSX</div>;
};

export default ComponentName;
```

### State Management
```javascript
// Context usage
import { useApi } from '../contexts/ApiContext';

const Component = () => {
  const { loading, setLoading } = useApi();
  // Component logic
};
```

## 🎨 Styling

### CSS Framework
- **Bootstrap 5**: Base styling framework
- **Custom CSS**: Component-specific styles
- **CSS Variables**: Dynamic theming support

### Theme System
```css
:root {
  --bg-primary: #FEF8F3;
  --bg-secondary: #FEAD2E;
  --color-dark: #383838;
  --color-accent: #FEAD2E;
}
```

### Responsive Design
- Mobile-first approach
- Bootstrap breakpoints (sm, md, lg, xl, xxl)
- Touch-friendly interface elements

## 📡 API Integration

### Service Layer
```javascript
// Admin API example
import { createItem } from '../api/admin';

const handleCreateItem = async (itemData) => {
  try {
    const newItem = await createItem(itemData);
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

### Error Handling
```javascript
// Centralized error handling
const handleApiError = (error) => {
  if (error.response?.status === 401) {
    // Redirect to login
  } else {
    // Show error message
  }
};
```

## 🔐 Authentication

### Token Management
```javascript
// Store token with expiry
setTokenWithExpiry(token, 24); // 24 hours

// Retrieve valid token
const token = getValidToken();
```

### Protected Routes
```javascript
<ProtectedRoute>
  <AdminComponent />
</ProtectedRoute>
```

## 🧪 Testing

### Testing Strategy
- Component unit tests
- API integration tests
- User interaction tests
- Accessibility testing

### Test Setup
```javascript
import { render, screen } from '@testing-library/react';
import Component from './Component';

test('renders correctly', () => {
  render(<Component />);
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

## 🚀 Deployment

### Build Process
```bash
# Create production build
npm run build

# Output in dist/ directory
dist/
├── assets/
│   ├── index.[hash].js
│   └── index.[hash].css
└── index.html
```

### Deployment Platforms
- **Vercel**: Recommended for React apps
- **Netlify**: Alternative hosting platform
- **AWS S3**: Static hosting with CloudFront
- **Traditional Hosting**: Upload dist/ folder

### Environment Variables
Update for production:
```env
VITE_API_URL_ADMIN=https://your-api-domain.com/api/admin
VITE_API_URL_CUSTOMER=https://your-api-domain.com/api/customer
```

## 📊 Performance

### Optimization Features
- **Code Splitting**: Lazy loading for routes
- **Image Optimization**: Responsive images with lazy loading
- **Bundle Analysis**: Webpack bundle analyzer
- **Caching**: Service worker for offline support

### Performance Monitoring
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist/
```

## 🔧 Configuration

### Vite Configuration
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          bootstrap: ['react-bootstrap']
        }
      }
    }
  }
});
```

### ESLint Configuration
```javascript
// eslint.config.js
export default [
  {
    rules: {
      'react/prop-types': 'warn',
      'no-unused-vars': 'error'
    }
  }
];
```

## 🔍 Troubleshooting

### Common Issues

#### Development Server Won't Start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### API Connection Issues
- Check backend server is running
- Verify API URLs in environment variables
- Check CORS configuration

#### Build Failures
```bash
# Check for TypeScript errors
npm run type-check

# Check for linting issues
npm run lint
```

## 🤝 Contributing

### Development Workflow
1. Create feature branch
2. Implement feature with tests
3. Update documentation
4. Submit pull request

### Code Standards
- ESLint configuration enforced
- Prettier for code formatting
- JSDoc comments for components
- Responsive design required

## 📈 Browser Support

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Progressive Enhancement
- Core functionality works without JavaScript
- Enhanced experience with modern features
- Graceful degradation for older browsers

## 📄 License

This project is proprietary software for TopchiOutpost cafe management.

---

**Last Updated**: July 7, 2025  
**React Version**: 19.1.0  
**Node.js Version**: 16+
