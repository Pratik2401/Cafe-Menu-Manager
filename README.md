# TopchiOutpost - Comprehensive Cafe Management System

## 🚀 Project Overview

TopchiOutpost is a full-stack cafe management system built with modern web technologies. It provides comprehensive solutions for cafe operations including menu management, event handling, order processing, customer feedback, and administrative controls with dynamic theming capabilities.

## 🏗️ Architecture Overview

```
TopchiOutpost/
├── backend/                 # Node.js Express API Server
│   ├── src/
│   │   ├── AdminControllers/     # Admin-specific business logic
│   │   ├── AdminRoutes/          # Admin API endpoints
│   │   ├── CustomerControllers/  # Customer-facing business logic
│   │   ├── CustomerRoutes/       # Customer API endpoints
│   │   ├── models/              # MongoDB data models
│   │   ├── middlewares/         # Authentication & utility middlewares
│   │   ├── config/              # Database & external service configs
│   │   └── utils/               # Shared utility functions
│   ├── uploads/                 # Static file storage
│   ├── app.js                   # Express application setup
│   └── server.js               # Application entry point
├── frontend/                # React.js Client Application
│   ├── src/
│   │   ├── components/          # Reusable React components
│   │   ├── api/                 # API service layers
│   │   ├── styles/              # Global CSS styles
│   │   ├── utils/               # Client-side utilities
│   │   └── assets/              # Static assets
│   ├── package.json
│   └── vite.config.js          # Vite bundler configuration
└── uploads/                     # Shared upload directory
```

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Image Processing**: ImageKit
- **Email Service**: Nodemailer
- **Security**: CORS, Helmet, bcryptjs

### Frontend
- **Framework**: React 19.1.0
- **Build Tool**: Vite
- **UI Framework**: React Bootstrap + Custom CSS
- **State Management**: React Context API
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Drag & Drop**: @dnd-kit
- **Icons**: React Icons, Bootstrap Icons
- **Styling**: Bootstrap 5 + Custom CSS

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn package manager

### Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/topchioutpost
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/topchioutpost

# JWT Secret for Authentication
JWT_SECRET=your_super_secure_jwt_secret_key_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Email Configuration (for admin features)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# ImageKit Configuration (for image uploads)
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
```

Start the backend server:
```bash
npm run dev          # Development mode with nodemon
# or
npm start           # Production mode
```

### Frontend Setup
```bash
cd frontend
npm install
```

Create `.env` file in frontend directory:
```env
# API Endpoints
VITE_API_URL_ADMIN=http://localhost:3000/api/admin
VITE_API_URL_CUSTOMER=http://localhost:3000/api/customer

# For production, update to your deployed backend URLs:
# VITE_API_URL_ADMIN=https://your-backend-domain.com/api/admin
# VITE_API_URL_CUSTOMER=https://your-backend-domain.com/api/customer
```

Start the frontend development server:
```bash
npm run dev         # Development mode
# or
npm run build       # Production build
npm run preview     # Preview production build
```

## 📊 Database Schema

### Core Models

#### Item Model
- **Purpose**: Represents menu items with pricing, variations, and add-ons
- **Key Features**: Size-based pricing, variations, field visibility controls
- **Relations**: SubCategory, FoodCategory, Tags, Sizes, Variations

#### Event Model
- **Purpose**: Manages cafe events with offers and registrations
- **Key Features**: Recurring events, age restrictions, special offers
- **Relations**: EventItems, EventRegistrations

#### Category/SubCategory Models
- **Purpose**: Hierarchical menu organization
- **Key Features**: Serial ordering, visibility controls, field customization

#### Admin Model
- **Purpose**: Administrator authentication and management
- **Key Features**: Email-based auth, password reset with OTP

### Data Relationships
```
Category (1) → (N) SubCategory → (N) Item
Item (N) → (N) Tag
Item (N) → (N) Size (with pricing)
Item (N) → (N) Variation (with pricing)
Event (1) → (N) EventItem
Event (1) → (N) EventRegistration
```

## 🔐 Authentication & Authorization

### Admin Authentication
- **Method**: JWT-based authentication
- **Storage**: localStorage (frontend)
- **Expiry**: 24 hours (configurable)
- **Protected Routes**: All admin endpoints require valid JWT token

### Security Features
- **Password Hashing**: bcryptjs with salt rounds
- **CORS Protection**: Configured for specific origins
- **Request Validation**: Input sanitization and validation
- **Error Handling**: Centralized error middleware

## 🎨 Theming System

The application features a dynamic theming system allowing real-time customization:

### Theme Configuration
- **CSS Variables**: Dynamic CSS custom properties
- **Live Updates**: Real-time theme changes without page reload
- **Logo Management**: Custom logo upload with background color
- **Color Schemes**: Primary, secondary, accent color customization

### Theme API Endpoints
- `GET /theme/theme.css` - Dynamic CSS generation
- `GET /api/admin/settings` - Theme settings management
- `PUT /api/admin/settings/menu-customization` - Update theme

## 📡 API Documentation

### Admin Endpoints Structure
```
/api/admin/
├── auth/                    # Authentication
│   ├── POST /login
│   ├── POST /signup
│   ├── POST /forgot-password
│   └── POST /reset-password
├── items/                   # Menu Items
│   ├── GET /
│   ├── POST /
│   ├── PUT /:id
│   └── DELETE /:id
├── category/                # Categories
├── subcategories/           # SubCategories
├── events/                  # Event Management
├── daily-offers/           # Daily Offers
├── socials/                # Social Media Links
├── feedback/               # Customer Feedback
├── messages/               # Custom Messages
├── user-info/              # User Information Collection
└── settings/               # Cafe Settings
```

### Customer Endpoints Structure
```
/api/customer/
├── items/                   # Public menu items
├── category/                # Public categories
├── events/                  # Public events
├── daily-offers/           # Public daily offers
├── socials/                # Social media links
├── feedback/               # Submit feedback
├── cafe/                   # Cafe information
└── user-info/              # User information submission
```

## 🔄 State Management

### Frontend State Architecture
- **Context Providers**: API Context, Breadcrumb Context, Theme Context
- **Local State**: Component-level useState for UI interactions
- **Global State**: Shared application state via React Context
- **Caching**: API response caching for improved performance

## 📝 Development Guidelines

### Code Structure Standards
- **Controllers**: Business logic separation
- **Routes**: RESTful API design
- **Models**: Mongoose schema definitions
- **Middlewares**: Reusable functionality
- **Utils**: Helper functions and utilities

### Naming Conventions
- **Files**: PascalCase for components, camelCase for utilities
- **Variables**: camelCase for JavaScript, kebab-case for CSS
- **Constants**: UPPER_SNAKE_CASE
- **Database**: camelCase for fields, PascalCase for models

### Error Handling
- **Backend**: Centralized error middleware with proper HTTP status codes
- **Frontend**: Try-catch blocks with user-friendly error messages
- **Logging**: Console logging for development, structured logging for production

## 🚀 Deployment Guide

### Backend Deployment
1. **Environment Setup**: Configure production environment variables
2. **Database**: Ensure MongoDB connection is established
3. **File Uploads**: Configure file storage (local or cloud)
4. **Process Management**: Use PM2 or similar for process management

### Frontend Deployment
1. **Build Process**: `npm run build` creates optimized production build
2. **Static Hosting**: Deploy to Vercel, Netlify, or similar platforms
3. **Environment Variables**: Update API URLs for production
4. **Domain Configuration**: Configure custom domains and SSL

### Production Checklist
- [ ] Environment variables configured
- [ ] Database connections secured
- [ ] CORS origins updated for production domains
- [ ] File upload directories properly configured
- [ ] SSL certificates installed
- [ ] Error monitoring setup
- [ ] Backup strategy implemented

## 🔍 Testing Strategy

### Backend Testing
- **Unit Tests**: Controller and model testing
- **Integration Tests**: API endpoint testing
- **Database Tests**: Model validation and relationships

### Frontend Testing
- **Component Tests**: React component unit testing
- **Integration Tests**: API integration testing
- **E2E Tests**: Full user workflow testing

## 📈 Performance Optimization

### Backend Optimizations
- **Database Indexing**: Proper MongoDB indexes for queries
- **Caching**: Response caching for frequently accessed data
- **Image Optimization**: Compressed image uploads
- **Request Validation**: Early request validation to reduce processing

### Frontend Optimizations
- **Code Splitting**: Dynamic imports for large components
- **Image Optimization**: Lazy loading and responsive images
- **Bundle Optimization**: Vite's built-in optimization features
- **Caching**: Service worker for offline functionality

## 🤝 Contributing

### Development Workflow
1. **Fork & Clone**: Fork the repository and clone locally
2. **Branch Strategy**: Create feature branches from main
3. **Code Standards**: Follow established naming conventions
4. **Testing**: Write tests for new features
5. **Documentation**: Update documentation for changes
6. **Pull Request**: Submit PR with detailed description

### Code Review Guidelines
- **Security**: Review for security vulnerabilities
- **Performance**: Check for performance implications
- **Documentation**: Ensure proper documentation
- **Testing**: Verify test coverage
- **Standards**: Adherence to coding standards

## 📞 Support & Maintenance

### Common Issues
- **Database Connection**: Check MongoDB connection string
- **Authentication**: Verify JWT secret configuration
- **File Uploads**: Ensure upload directory permissions
- **CORS Errors**: Update CORS origins for new domains

### Monitoring & Logs
- **Error Tracking**: Implement error tracking service
- **Performance Monitoring**: Monitor API response times
- **User Analytics**: Track user engagement metrics
- **System Health**: Monitor server resource usage

## 📄 License

This project is proprietary software developed for TopchiOutpost cafe management.

## 🔗 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Bootstrap Documentation](https://getbootstrap.com/docs/)

---

**Last Updated**: July 7, 2025
**Version**: 1.0.0
**Maintainers**: Development Team
