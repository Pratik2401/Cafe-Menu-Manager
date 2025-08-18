# TopchiOutpost Backend API

## 🚀 Overview

The TopchiOutpost backend is a robust Node.js/Express API server that powers the cafe management system. It provides comprehensive endpoints for menu management, event handling, user authentication, and system administration.

## 🏗️ Architecture

### Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Local filesystem with ImageKit integration
- **Email**: Nodemailer for notifications

### Project Structure
```
backend/
├── src/
│   ├── AdminControllers/    # Admin business logic
│   ├── AdminRoutes/         # Admin API endpoints
│   ├── CustomerControllers/ # Customer business logic
│   ├── CustomerRoutes/      # Customer API endpoints
│   ├── models/             # MongoDB data models
│   ├── middlewares/        # Authentication & utilities
│   ├── config/             # Database & service configuration
│   └── utils/              # Helper functions
├── uploads/                # File upload storage
├── app.js                  # Express application setup
├── server.js              # Application entry point
└── package.json           # Dependencies & scripts
```

## ⚙️ Installation & Setup

### Prerequisites
- Node.js >= 16.0.0
- MongoDB (local or Atlas)
- npm or yarn

### Environment Configuration
Create `.env` file:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/topchioutpost

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_here

# Server
PORT=3000
NODE_ENV=development

# Email Service (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# ImageKit (Optional)
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=your_endpoint
```

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## 📡 API Endpoints

### Authentication Routes (`/api/admin/auth`)
- `POST /login` - Admin login
- `POST /signup` - Create admin account
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with OTP

### Admin Routes (`/api/admin`)
- `/items` - Menu item management
- `/category` - Category management
- `/subcategories` - Subcategory management
- `/events` - Event management
- `/daily-offers` - Daily offers
- `/socials` - Social media links
- `/settings` - Cafe configuration

### Customer Routes (`/api/customer`)
- `/items` - Public menu items
- `/category` - Public categories
- `/events` - Public events
- `/feedback` - Submit feedback
- `/cafe` - Cafe information

## 🔐 Authentication

The API uses JWT-based authentication for admin routes:

```javascript
// Admin routes require Authorization header
Authorization: Bearer <jwt_token>
```

## 📊 Database Models

### Key Models
- **Item**: Menu items with pricing, variations, add-ons
- **Category/SubCategory**: Menu organization
- **Event**: Cafe events with offers
- **Admin**: Administrator accounts
- **Feedback**: Customer feedback
- **Social**: Social media links

## 🔧 Development

### Available Scripts
```bash
npm run dev     # Development with nodemon
npm start       # Production mode
npm run build   # No build step needed
```

### Code Standards
- ESLint configuration for code quality
- JSDoc comments for all functions
- Error handling with try-catch blocks
- Input validation and sanitization

### Adding New Features
1. Create model in `/src/models/`
2. Implement controller in `/src/AdminControllers/` or `/src/CustomerControllers/`
3. Define routes in `/src/AdminRoutes/` or `/src/CustomerRoutes/`
4. Add route to `app.js`
5. Test endpoints
6. Update API documentation

## 🧪 Testing

### Manual Testing
Use tools like Postman or Thunder Client to test endpoints:

```http
GET http://localhost:3000/api/customer/items
Authorization: Bearer <token>
```

### Health Check
```http
GET http://localhost:3000/
```
Returns server status and uptime information.

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure MongoDB Atlas connection
- [ ] Set strong JWT secret
- [ ] Configure email service
- [ ] Set up file storage
- [ ] Configure reverse proxy (nginx)
- [ ] Set up SSL certificates
- [ ] Configure process manager (PM2)

### PM2 Configuration
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name "topchioutpost-api"

# Monitor
pm2 status
pm2 logs topchioutpost-api
```

## 🔍 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check MongoDB status
brew services list | grep mongodb  # macOS
sudo systemctl status mongod       # Linux
```

#### Port Already in Use
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
```

#### JWT Errors
- Verify JWT_SECRET is set
- Check token expiration
- Validate token format

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=app:*
```

## 📈 Performance

### Optimization Tips
- Database indexing for frequent queries
- Image compression for uploads
- Response caching for static data
- Connection pooling for database
- Error monitoring and logging

### Monitoring
- API response times
- Database query performance
- Memory usage
- Error rates

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Review Guidelines
- All functions must have JSDoc comments
- Error handling for all async operations
- Input validation for all endpoints
- Security considerations reviewed
- Performance impact assessed

## 📄 License

This project is proprietary software for TopchiOutpost cafe management.

## 📞 Support

For technical support or questions:
- Check existing documentation
- Review error logs
- Contact development team

---

**Last Updated**: July 7, 2025  
**API Version**: 1.0.0  
**Node.js Version**: 16+