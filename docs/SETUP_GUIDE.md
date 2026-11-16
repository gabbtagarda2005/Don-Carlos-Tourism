## Installation & Setup Guide

### Prerequisites
- Node.js v14+ 
- MongoDB (local or Atlas)
- Git
- Code editor (VS Code recommended)

---

## Backend Setup

### 1. Navigate to Backend
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` file:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/don-carlos-tourism
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CORS_ORIGIN=http://localhost:3000
```

### 4. Start MongoDB
```bash
# Using MongoDB Community Edition
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. Start Backend Server
```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

✅ Server should run on `http://localhost:5000`

---

## Mobile App Setup

### 1. Navigate to Mobile App
```bash
cd mobile-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Install Expo CLI (First Time)
```bash
npm install -g expo-cli
```

### 4. Configure API URL
Edit `src/api/auth.api.js` and update API_BASE:
```javascript
const API_BASE = 'http://your-backend-url/api';
```

### 5. Run on Android
```bash
npm run android
```

### 6. Run on iOS
```bash
npm run ios
```

### 7. Or Use Expo (Recommended for Testing)
```bash
npm start
# Then press 'a' for Android or 'i' for iOS
```

---

## Web App Setup

### 1. Navigate to Web App
```bash
cd web-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create .env File
```bash
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Start Development Server
```bash
npm start
```

✅ Web app should open on `http://localhost:3000`

---

## Database Setup

### Create Collections
Connect to MongoDB and run:

```javascript
// Create indexes for better performance
db.users.createIndex({ email: 1 });
db.touristspots.createIndex({ category: 1 });
db.businesses.createIndex({ owner: 1 });
db.events.createIndex({ date: 1 });
db.favorites.createIndex({ user: 1 });
db.reviews.createIndex({ spot: 1 });
```

### Sample Data
Import sample tourism data:
```javascript
// Create sample tourist spots
db.touristspots.insertMany([
  {
    name: "Hidden Waterfalls",
    category: "nature",
    description: "Beautiful waterfall in the highlands",
    location: { address: "Barangay X", latitude: 8.1234, longitude: 125.5678 },
    rating: 4.5,
    isActive: true
  },
  {
    name: "Sea of Clouds",
    category: "adventure",
    description: "Scenic mountain peak",
    location: { address: "Peak Area", latitude: 8.1500, longitude: 125.5900 },
    rating: 4.8,
    isActive: true
  }
]);
```

---

## Testing the System

### Test Backend
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Response should be:
# {"status":"Backend is running","timestamp":"2026-05-08T..."}
```

### Test Authentication
```bash
# Register new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "lastName": "Dela Cruz",
    "email": "juan@example.com",
    "password": "password123",
    "role": "tourist"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "password123"
  }'
```

### Test Tourist Spots
```bash
# Get all tourist spots
curl http://localhost:5000/api/tourist-spots

# Get specific spot
curl http://localhost:5000/api/tourist-spots/SPOT_ID
```

---

## Common Issues & Solutions

### Issue: MongoDB Connection Error
```
Solution: 
1. Ensure MongoDB is running
2. Check connection string in .env
3. Use MongoDB Atlas if local install fails
```

### Issue: CORS Error
```
Solution:
1. Check CORS_ORIGIN in backend .env
2. Ensure it matches your frontend URL
3. Verify backend is running
```

### Issue: Port Already in Use
```
Solution:
# Find process on port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change port in .env
```

### Issue: JWT Token Expired
```
Solution:
1. Login again to get new token
2. Token expires based on JWT_EXPIRE setting
3. Implement refresh token strategy
```

---

## Production Deployment

### Backend Deployment (AWS/Heroku)
```bash
# 1. Create Heroku app
heroku create don-carlos-tourism-api

# 2. Set environment variables
heroku config:set MONGODB_URI=your_mongodb_atlas_url
heroku config:set JWT_SECRET=your_production_secret

# 3. Deploy
git push heroku main
```

### Web App Deployment (Vercel/Netlify)
```bash
# 1. Build production files
npm run build

# 2. Deploy to Vercel
vercel deploy

# Or Netlify
netlify deploy --prod --dir=build
```

### Mobile App Release
```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android

# Submit to App Store
expo submit
```

---

## Development Workflow

### Creating New Features

1. **Backend Feature**
   - Create model in `src/models/`
   - Create controller in `src/controllers/`
   - Create routes in `src/routes/`
   - Add middleware if needed

2. **Mobile Screen**
   - Create screen in `src/screens/[usertype]/`
   - Create API call in `src/api/`
   - Add navigation if new route needed

3. **Web Page**
   - Create page in `src/pages/[section]/`
   - Add component in `src/components/`
   - Update sidebar navigation

---

## Performance Optimization

### Database Optimization
```javascript
// Add indexes for frequently queried fields
db.users.createIndex({ email: 1 });
db.touristspots.createIndex({ category: 1 });
```

### API Optimization
```javascript
// Implement pagination
router.get('/spots?page=1&limit=10')

// Cache responses
app.use(cache('10 minutes'))
```

### Frontend Optimization
```javascript
// Lazy load components
const SpotDetails = lazy(() => import('./SpotDetails'))

// Code splitting with React Router
```

---

## Monitoring & Logging

### Backend Logs
```bash
# Check logs
tail -f logs/app.log

# Or use PM2
pm2 logs
```

### Database Monitoring
```javascript
// Monitor slow queries
db.setProfilingLevel(1, { slowms: 100 })

// View profiling data
db.system.profile.find().pretty()
```

### Performance Metrics
```bash
# Check system resources
top
ps aux | grep node
```

---

## Backup & Recovery

### Backup MongoDB
```bash
mongodump --db don-carlos-tourism --out ./backup

# Restore
mongorestore --db don-carlos-tourism ./backup/don-carlos-tourism
```

### Backup MongoDB Atlas
```bash
# Use automated backups (included in MongoDB Atlas)
# Or manual export via Atlas UI
```

---

## Support

For issues or questions, refer to:
- [Backend README](./backend/README.md)
- [Mobile App README](./mobile-app/README.md)
- [Web App README](./web-app/README.md)
- [API Documentation](./API_DOCUMENTATION.md)
