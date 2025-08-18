# TopchiOutpost API Documentation

## 📚 Table of Contents
- [Authentication](#authentication)
- [Admin API Endpoints](#admin-api-endpoints)
- [Customer API Endpoints](#customer-api-endpoints)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Request/Response Examples](#requestresponse-examples)

## 🔐 Authentication

### JWT Authentication
All admin endpoints require JWT authentication via Bearer token in the Authorization header.

```http
Authorization: Bearer <jwt_token>
```

### Admin Authentication Endpoints

#### POST /api/admin/auth/login
Authenticate admin user and receive JWT token.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "60d5ecb74b24a1001f8b4567",
    "email": "admin@example.com"
  }
}
```

#### POST /api/admin/auth/signup
Create new admin account.

**Request Body:**
```json
{
  "email": "newadmin@example.com",
  "password": "securepassword"
}
```

#### POST /api/admin/auth/forgot-password
Request password reset OTP.

**Request Body:**
```json
{
  "email": "admin@example.com"
}
```

#### POST /api/admin/auth/reset-password
Reset password using OTP.

**Request Body:**
```json
{
  "otp": "123456",
  "password": "newsecurepassword"
}
```

---

## 🔧 Admin API Endpoints

### Categories Management

#### GET /api/admin/category
Retrieve all categories with pagination and filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term for category name

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ecb74b24a1001f8b4567",
      "name": "Beverages",
      "image": "/uploads/categories/beverages.jpg",
      "serialId": 1,
      "isVisible": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "pages": 3
  }
}
```

#### POST /api/admin/category
Create new category.

**Request Body (multipart/form-data):**
```
name: "New Category"
image: <file>
serialId: 2
```

#### PUT /api/admin/category/:id
Update existing category.

#### DELETE /api/admin/category/:id
Delete category and handle cascading effects.

#### PATCH /api/admin/category/:id/toggle-visibility
Toggle category visibility status.

### Items Management

#### GET /api/admin/items
Retrieve menu items with advanced filtering.

**Query Parameters:**
- `subCategory`: Filter by subcategory ID
- `show`: Filter by visibility (true/false)
- `page`: Page number
- `limit`: Items per page
- `search`: Search in item name/description

#### POST /api/admin/items
Create new menu item with complex pricing structure.

**Request Body (multipart/form-data):**
```json
{
  "name": "Cappuccino",
  "description": "Rich coffee with steamed milk foam",
  "price": 4.50,
  "subcategoryId": "60d5ecb74b24a1001f8b4567",
  "foodCategoryId": "60d5ecb74b24a1001f8b4568",
  "tagIds": ["60d5ecb74b24a1001f8b4569"],
  "sizePrices": [
    {
      "sizeId": "60d5ecb74b24a1001f8b456a",
      "price": 4.50
    },
    {
      "sizeId": "60d5ecb74b24a1001f8b456b",
      "price": 5.50
    }
  ],
  "addOns": [
    {
      "addOnItem": "Extra Shot",
      "price": 1.00,
      "isMultiSelect": false
    }
  ],
  "variations": [
    {
      "variationId": "60d5ecb74b24a1001f8b456c",
      "price": 0.50,
      "isAvailable": true
    }
  ]
}
```

#### PUT /api/admin/items/:id
Update menu item with partial updates supported.

#### DELETE /api/admin/items/:id
Soft delete menu item (sets show: false).

#### PUT /api/admin/items/:id/availability
Toggle item availability status.

### Events Management

#### GET /api/admin/events
Retrieve all events with filtering and sorting.

**Query Parameters:**
- `isActive`: Filter by active status
- `startDate`: Filter events after date
- `endDate`: Filter events before date
- `search`: Search in event title/description

#### POST /api/admin/events
Create new event with complex structure.

**Request Body:**
```json
{
  "eventId": "SUMMER_FEST_2025",
  "title": "Summer Music Festival",
  "description": "Live music and special menu items",
  "startDate": "2025-07-15T18:00:00.000Z",
  "endDate": "2025-07-15T23:00:00.000Z",
  "location": "Main Hall",
  "maxAttendees": 100,
  "entryType": "ticket",
  "price": 25.00,
  "isAgeRestricted": false,
  "tags": ["music", "festival", "summer"],
  "offers": [
    {
      "name": "Festival Combo",
      "description": "Burger + Drink + Dessert",
      "regularPrice": 15.00,
      "offerPrice": 12.00,
      "items": [
        {
          "itemId": "60d5ecb74b24a1001f8b4567",
          "name": "Classic Burger",
          "quantity": 1
        }
      ]
    }
  ],
  "isRecurring": false,
  "registrationFormUrl": "https://forms.google.com/..."
}
```

### Daily Offers Management

#### GET /api/admin/daily-offers
Retrieve daily offers with status filtering.

#### POST /api/admin/daily-offers
Create new daily offer.

#### PATCH /api/admin/daily-offers/:id/toggle-status
Toggle daily offer active status.

### Social Media Management

#### GET /api/admin/socials
Retrieve all social media links.

#### POST /api/admin/socials
Add new social media platform.

**Request Body:**
```json
{
  "platform": "Instagram",
  "cafeName": "TopchiOutpost",
  "url": "https://instagram.com/topchioutpost",
  "isVisible": true,
  "location": {
    "address": "123 Main St, City",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "mapUrl": "https://maps.google.com/..."
  }
}
```

### Settings & Configuration

#### GET /api/admin/settings
Retrieve cafe settings and configuration.

#### PUT /api/admin/settings
Update cafe settings.

#### PUT /api/admin/settings/menu-customization
Update theme and menu customization settings.

**Request Body:**
```json
{
  "cssVariables": {
    "--bg-primary": "#FEF8F3",
    "--bg-secondary": "#FEAD2E",
    "--color-dark": "#383838"
  },
  "logoBackgroundColor": "#FFFFFF"
}
```

---

## 👥 Customer API Endpoints

### Public Menu Access

#### GET /api/customer/items
Retrieve visible menu items for customers.

**Query Parameters:**
- `subCategory`: Filter by subcategory
- `search`: Search items

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ecb74b24a1001f8b4567",
      "name": "Cappuccino",
      "description": "Rich coffee with steamed milk foam",
      "price": 4.50,
      "image": "/uploads/items/cappuccino.jpg",
      "subCategory": {
        "_id": "60d5ecb74b24a1001f8b4568",
        "name": "Hot Beverages"
      },
      "tags": [
        {
          "_id": "60d5ecb74b24a1001f8b4569",
          "name": "Popular"
        }
      ],
      "sizePrices": [
        {
          "sizeId": "60d5ecb74b24a1001f8b456a",
          "price": 4.50
        }
      ],
      "addOns": [
        {
          "addOnItem": "Extra Shot",
          "price": 1.00
        }
      ],
      "fieldVisibility": {
        "description": true,
        "image": true,
        "addOns": true
      }
    }
  ]
}
```

#### GET /api/customer/category
Retrieve visible categories for menu navigation.

#### GET /api/customer/subcategories
Retrieve subcategories with item counts.

### Events & Offers

#### GET /api/customer/events
Retrieve active events for customers.

#### GET /api/customer/events/:eventId
Get detailed event information including offers.

#### GET /api/customer/daily-offers
Retrieve active daily offers.

### Feedback System

#### POST /api/customer/feedback
Submit customer feedback.

**Request Body:**
```json
{
  "customerName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "rating": 5,
  "comments": "Excellent service and food quality!",
  "visitDate": "2025-07-07",
  "orderType": "dine-in"
}
```

### User Information Collection

#### POST /api/customer/user-info
Submit user information for marketing.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1990-05-15",
  "preferences": {
    "dietaryRestrictions": ["vegetarian"],
    "favoriteItems": ["60d5ecb74b24a1001f8b4567"],
    "communicationPreference": "email"
  }
}
```

---

## ⚠️ Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data provided",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

### Common HTTP Status Codes

| Status Code | Description | Common Scenarios |
|-------------|-------------|------------------|
| 200 | OK | Successful request |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation errors |
| 500 | Internal Server Error | Server-side errors |

### Error Codes Reference

| Error Code | Description |
|------------|-------------|
| `AUTH_REQUIRED` | Authentication token required |
| `INVALID_TOKEN` | JWT token is invalid or expired |
| `VALIDATION_ERROR` | Request validation failed |
| `RESOURCE_NOT_FOUND` | Requested resource doesn't exist |
| `DUPLICATE_RESOURCE` | Resource already exists |
| `FILE_UPLOAD_ERROR` | File upload failed |
| `DATABASE_ERROR` | Database operation failed |

---

## 🚦 Rate Limiting

### Current Limits
- **Admin Endpoints**: 1000 requests per hour per IP
- **Customer Endpoints**: 500 requests per hour per IP
- **Authentication Endpoints**: 50 requests per hour per IP

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1625097600
```

---

## 📋 Request/Response Examples

### Complete Item Creation Example

**Request:**
```http
POST /api/admin/items
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data

name=Premium Coffee
description=Artisan coffee with premium beans
price=6.50
subcategoryId=60d5ecb74b24a1001f8b4567
image=<file>
sizePrices=[{"sizeId":"60d5ecb74b24a1001f8b456a","price":6.50},{"sizeId":"60d5ecb74b24a1001f8b456b","price":7.50}]
addOns=[{"addOnItem":"Extra Shot","price":1.00,"isMultiSelect":false}]
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ecb74b24a1001f8b4567",
    "name": "Premium Coffee",
    "description": "Artisan coffee with premium beans",
    "price": 6.50,
    "image": "/uploads/items/premium-coffee-1625097600.jpg",
    "subCategory": "60d5ecb74b24a1001f8b4567",
    "serialId": 1,
    "sizePrices": [
      {
        "sizeId": "60d5ecb74b24a1001f8b456a",
        "price": 6.50
      }
    ],
    "addOns": [
      {
        "_id": "60d5ecb74b24a1001f8b4568",
        "addOnItem": "Extra Shot",
        "price": 1.00,
        "isMultiSelect": false
      }
    ],
    "show": true,
    "createdAt": "2025-07-07T12:00:00.000Z"
  },
  "message": "Item created successfully"
}
```

### Event with Offers Example

**Request:**
```http
POST /api/admin/events
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "eventId": "HOLIDAY_SPECIAL_2025",
  "title": "Holiday Special Menu",
  "description": "Exclusive holiday-themed menu items",
  "startDate": "2025-12-20T00:00:00.000Z",
  "endDate": "2025-12-31T23:59:59.000Z",
  "location": "All Areas",
  "entryType": "free",
  "offers": [
    {
      "name": "Holiday Combo",
      "description": "Special holiday meal combination",
      "regularPrice": 20.00,
      "offerPrice": 15.00,
      "items": [
        {
          "itemId": "60d5ecb74b24a1001f8b4567",
          "name": "Holiday Burger",
          "quantity": 1
        },
        {
          "itemId": "60d5ecb74b24a1001f8b4568",
          "name": "Seasonal Drink",
          "quantity": 1
        }
      ]
    }
  ]
}
```

---

## 🔄 Webhook Integration

### Available Webhooks
- Order status updates
- Payment confirmations
- Event registrations
- Feedback submissions

### Webhook Payload Example
```json
{
  "event": "order.status.updated",
  "timestamp": "2025-07-07T12:00:00.000Z",
  "data": {
    "orderId": "ORD_123456",
    "status": "completed",
    "previousStatus": "preparing",
    "customer": {
      "phoneNumber": "+1234567890"
    }
  }
}
```

---

## 📊 Analytics Endpoints

### GET /api/admin/analytics/sales
Retrieve sales analytics data.

### GET /api/admin/analytics/popular-items
Get most popular menu items.

### GET /api/admin/analytics/customer-feedback
Analyze customer feedback trends.

---

**Last Updated**: July 7, 2025
**API Version**: v1.0.0
