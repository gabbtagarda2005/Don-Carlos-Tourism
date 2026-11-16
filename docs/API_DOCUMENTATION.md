# API Documentation - Don Carlos Tourism System

## Base URL
`http://localhost:5000/api`

---

## Authentication Endpoints

### POST /auth/register
Register a new user
```json
{
  "firstName": "Juan",
  "lastName": "Dela Cruz",
  "email": "juan@example.com",
  "password": "password123",
  "role": "tourist"
}
```

### POST /auth/login
Login user
```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```
Response:
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": { ... }
}
```

### POST /auth/logout
Logout user (requires token)

---

## Tourist Spots Endpoints

### GET /tourist-spots
Get all tourist spots
Query params: `category`, `search`

### GET /tourist-spots/:id
Get single tourist spot by ID

### POST /tourist-spots
Create new tourist spot (admin only)
```json
{
  "name": "Hidden Waterfall",
  "description": "Beautiful waterfall",
  "category": "nature",
  "location": {
    "address": "Barangay X",
    "latitude": 8.1234,
    "longitude": 125.5678
  },
  "images": ["url1", "url2"]
}
```

### PUT /tourist-spots/:id
Update tourist spot (admin only)

### DELETE /tourist-spots/:id
Delete tourist spot (admin only)

---

## Business Endpoints

### GET /businesses
Get all businesses
Query params: `category`, `approved`

### GET /businesses/:id
Get single business

### POST /businesses
Create business (business owner)

### PUT /businesses/:id
Update business (owner/admin)

### DELETE /businesses/:id
Delete business (admin)

---

## Events Endpoints

### GET /events
Get all events

### GET /events/:id
Get single event

### POST /events
Create event (admin only)

### PUT /events/:id
Update event (admin)

### DELETE /events/:id
Delete event (admin)

---

## User Endpoints

### GET /users
Get all users (admin only)

### GET /users/:id
Get user profile

### PUT /users/:id
Update user profile

### GET /users/:id/favorites
Get user's favorite spots

### POST /users/:id/favorites
Add spot to favorites

### DELETE /users/:id/favorites/:spotId
Remove from favorites

---

## Admin Endpoints

### GET /admin/dashboard
Get dashboard statistics

### GET /admin/analytics
Get system analytics

### GET /admin/approvals
Get pending business approvals

### PUT /admin/approvals/:businessId
Approve/reject business

---

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error message here",
  "status": 400
}
```

### Common Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## Authentication Header
Include JWT token in all protected endpoints:
```
Authorization: Bearer <jwt_token>
```
