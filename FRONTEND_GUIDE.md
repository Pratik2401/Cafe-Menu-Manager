# Frontend Developer Guide - TopchiOutpost

## 🎯 Project Overview

TopchiOutpost frontend is a React-based application built with modern development practices. It provides a comprehensive interface for both customers and administrators to interact with the cafe management system.

## 🏗️ Architecture & Structure

### Component Architecture
```
src/
├── components/              # Reusable React components
│   ├── Customer/           # Customer-facing components
│   ├── Admin/              # Admin dashboard components
│   ├── Shared/             # Shared utility components
│   └── Layout/             # Layout components
├── api/                    # API service layer
│   ├── admin.js           # Admin API functions
│   ├── customer.js        # Customer API functions
│   └── index.js           # API configuration
├── utils/                  # Utility functions
│   ├── auth.js            # Authentication utilities
│   ├── themeUtils.js      # Theme management
│   └── tokenManager.js    # JWT token management
├── styles/                 # CSS stylesheets
│   ├── components/        # Component-specific styles
│   ├── globals.css        # Global styles
│   └── themes/            # Theme files
└── assets/                # Static assets
```

### State Management Strategy

#### 1. Context Providers
- **ApiContext**: Manages API loading states and error handling
- **BreadcrumbContext**: Navigation breadcrumb management
- **ThemeProvider**: Dynamic theme management

#### 2. Local State Management
- Component-level state using `useState`
- Form state management with controlled components
- UI state (modals, dropdowns, loading states)

#### 3. Global State
- Authentication state in localStorage
- Theme preferences
- User preferences and settings

## 🎨 UI/UX Guidelines

### Design System
- **Primary Framework**: React Bootstrap 5
- **Icons**: React Icons + Bootstrap Icons
- **Typography**: System fonts with fallbacks
- **Color Scheme**: CSS custom properties for theming
- **Spacing**: Bootstrap spacing utilities (mt-, mb-, p-, m-)

### Component Naming Conventions
```javascript
// Component files: PascalCase
AdminDashboard.jsx
MenuItemCard.jsx
CustomerFeedback.jsx

// CSS classes: kebab-case with BEM methodology
.menu-item-card
.menu-item-card__title
.menu-item-card--featured
```

### Responsive Design Standards
- **Mobile First**: Design for mobile, enhance for desktop
- **Breakpoints**: Bootstrap 5 breakpoints (sm, md, lg, xl, xxl)
- **Testing**: Test on multiple screen sizes
- **Touch Targets**: Minimum 44px for touch elements

## 🔧 Development Setup

### Prerequisites
```bash
Node.js >= 16.0.0
npm >= 8.0.0
```

### Environment Configuration
Create `.env` file:
```env
# API Configuration
VITE_API_URL_ADMIN=http://localhost:3000/api/admin
VITE_API_URL_CUSTOMER=http://localhost:3000/api/customer

# Development Settings
VITE_DEBUG_MODE=true
VITE_ENABLE_MOCK_DATA=false
```

### Development Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📡 API Integration

### API Service Layer Architecture

#### 1. Admin API (`src/api/admin.js`)
```javascript
// Example API function structure
export const createItem = async (itemData) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.post('/items', itemData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating item:', error);
    throw error;
  }
};
```

#### 2. Customer API (`src/api/customer.js`)
```javascript
// Public endpoints don't require authentication
export const getMenuItems = async (filters = {}) => {
  try {
    const response = await customerAPI.get('/items', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching menu items:', error);
    throw error;
  }
};
```

### Error Handling Strategy
```javascript
// Centralized error handling
const handleApiError = (error, context) => {
  console.error(`API Error in ${context}:`, error);
  
  if (error.response?.status === 401) {
    // Handle authentication errors
    logout();
    navigate('/admin/login');
  } else if (error.response?.status === 403) {
    // Handle authorization errors
    showErrorAlert('Access denied');
  } else {
    // Handle general errors
    showErrorAlert('Something went wrong. Please try again.');
  }
};
```

## 🔐 Authentication & Security

### JWT Token Management
```javascript
// Token storage with expiry
export const setTokenWithExpiry = (token, hoursValid) => {
  const expiry = new Date().getTime() + (hoursValid * 60 * 60 * 1000);
  localStorage.setItem('adminToken', token);
  localStorage.setItem('adminTokenExpiry', expiry.toString());
};

// Token validation
export const getValidToken = () => {
  const token = localStorage.getItem('adminToken');
  const expiry = localStorage.getItem('adminTokenExpiry');
  
  if (!token || !expiry) return null;
  
  if (new Date().getTime() > parseInt(expiry)) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminTokenExpiry');
    return null;
  }
  
  return token;
};
```

### Protected Routes
```javascript
// ProtectedRoute component usage
<Route 
  path="/admin/dashboard" 
  element={
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>
```

## 🎨 Theme System

### Dynamic Theme Implementation
```javascript
// Theme CSS injection
export const refreshThemeCSS = () => {
  const timestamp = new Date().getTime();
  const existingLink = document.getElementById('dynamic-theme-css');
  
  if (existingLink) {
    existingLink.href = `${API_BASE_URL}/theme/theme.css?t=${timestamp}`;
  } else {
    const link = document.createElement('link');
    link.id = 'dynamic-theme-css';
    link.rel = 'stylesheet';
    link.href = `${API_BASE_URL}/theme/theme.css?t=${timestamp}`;
    document.head.appendChild(link);
  }
};
```

### CSS Custom Properties
```css
:root {
  /* Primary colors */
  --bg-primary: #FEF8F3;
  --bg-secondary: #FEAD2E;
  --bg-tertiary: #383838;
  
  /* Text colors */
  --color-dark: #383838;
  --color-accent: #FEAD2E;
  --color-secondary: #666666;
  
  /* Component colors */
  --card-bg: #FFFFFF;
  --card-text: #000000;
  --logo-bg-color: #FFFFFF;
}
```

## 📱 Component Development

### Component Structure Template
```javascript
/**
 * @component ComponentName
 * @description Brief description of component purpose
 * @param {Object} props - Component props
 * @param {string} props.title - Component title
 * @param {Function} props.onAction - Action handler
 * @returns {JSX.Element} Rendered component
 */
import React, { useState, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';
import './ComponentName.css';

const ComponentName = ({ title, onAction }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Component initialization
  }, []);

  const handleAction = async () => {
    setLoading(true);
    try {
      await onAction();
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="component-name">
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Button 
          onClick={handleAction}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Action'}
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ComponentName;
```

### Form Handling Best Practices
```javascript
// Controlled form component
const ItemForm = ({ item, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    price: item?.price || 0,
    description: item?.description || ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {/* Form fields */}
    </Form>
  );
};
```

## 🔄 State Management Patterns

### API Context Usage
```javascript
// Using API context for loading states
import { useApi } from '../contexts/ApiContext';

const Component = () => {
  const { setLoading, setError } = useApi();

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await apiCall();
      // Handle success
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
};
```

### Local Storage Management
```javascript
// Utility functions for localStorage
export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const loadFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return defaultValue;
  }
};
```

## 🎯 Performance Optimization

### Code Splitting
```javascript
// Lazy loading for large components
import { lazy, Suspense } from 'react';

const AdminDashboard = lazy(() => import('./AdminDashboard'));

const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <AdminDashboard />
  </Suspense>
);
```

### Image Optimization
```javascript
// Image component with lazy loading
const OptimizedImage = ({ src, alt, className }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`image-container ${className}`}>
      {!loaded && <div className="image-placeholder">Loading...</div>}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        style={{ display: loaded ? 'block' : 'none' }}
        loading="lazy"
      />
    </div>
  );
};
```

### Memoization
```javascript
// Using React.memo for expensive components
const ExpensiveComponent = React.memo(({ data, onAction }) => {
  // Component logic
}, (prevProps, nextProps) => {
  // Custom comparison logic
  return prevProps.data.id === nextProps.data.id;
});

// Using useMemo for expensive calculations
const ProcessedData = ({ items }) => {
  const expensiveValue = useMemo(() => {
    return items.reduce((acc, item) => {
      // Expensive calculation
      return acc + item.price * item.quantity;
    }, 0);
  }, [items]);

  return <div>Total: {expensiveValue}</div>;
};
```

## 🧪 Testing Strategy

### Component Testing
```javascript
// Jest + React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import MenuItemCard from '../MenuItemCard';

describe('MenuItemCard', () => {
  const mockItem = {
    name: 'Coffee',
    price: 4.50,
    description: 'Hot coffee'
  };

  test('renders item information correctly', () => {
    render(<MenuItemCard item={mockItem} />);
    
    expect(screen.getByText('Coffee')).toBeInTheDocument();
    expect(screen.getByText('$4.50')).toBeInTheDocument();
    expect(screen.getByText('Hot coffee')).toBeInTheDocument();
  });

  test('handles click events', () => {
    const mockOnClick = jest.fn();
    render(<MenuItemCard item={mockItem} onClick={mockOnClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalledWith(mockItem);
  });
});
```

### API Testing
```javascript
// Mock API responses for testing
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/customer/items', (req, res, ctx) => {
    return res(ctx.json([
      { id: 1, name: 'Coffee', price: 4.50 }
    ]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## 🚀 Build & Deployment

### Production Build
```bash
# Build optimization
npm run build

# Files will be in dist/ directory
dist/
├── assets/
│   ├── index.[hash].js    # Main bundle
│   ├── vendor.[hash].js   # Dependencies
│   └── index.[hash].css   # Styles
└── index.html
```

### Environment-Specific Builds
```javascript
// vite.config.js
export default defineConfig({
  define: {
    __DEV__: process.env.NODE_ENV === 'development'
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          bootstrap: ['react-bootstrap'],
          icons: ['react-icons']
        }
      }
    }
  }
});
```

## 🔍 Debugging & Development Tools

### Debug Utilities
```javascript
// Debug helper functions
export const debugLog = (message, data) => {
  if (import.meta.env.VITE_DEBUG_MODE === 'true') {
    console.log(`[DEBUG] ${message}:`, data);
  }
};

export const performanceLog = (label, fn) => {
  if (import.meta.env.VITE_DEBUG_MODE === 'true') {
    console.time(label);
    const result = fn();
    console.timeEnd(label);
    return result;
  }
  return fn();
};
```

### Error Boundaries
```javascript
// Error boundary for component error handling
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <details>
            {this.state.error && this.state.error.toString()}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## 📋 Code Quality Standards

### ESLint Configuration
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'jsx-a11y/anchor-is-valid': 'warn'
  }
};
```

### Prettier Configuration
```javascript
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

## 🤝 Contributing Guidelines

### Pull Request Process
1. **Feature Branch**: Create from `main` branch
2. **Naming**: Use descriptive branch names (`feature/menu-item-editing`)
3. **Commits**: Write clear commit messages
4. **Testing**: Ensure all tests pass
5. **Code Review**: Request review from team members

### Commit Message Format
```
type(scope): description

feat(menu): add item editing functionality
fix(auth): resolve token expiration issue
docs(readme): update installation instructions
style(components): fix button spacing
```

---

**Last Updated**: July 7, 2025
**Version**: 1.0.0
**Maintainers**: Frontend Development Team
