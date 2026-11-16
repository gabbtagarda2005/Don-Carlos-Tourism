# Project Structure Overview

## Complete MERN Folder Layout

```
Don Carlos Tourism/
│
├── 📁 backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── env.js
│   │   │
│   │   ├── models/
│   │   │   ├── User.model.js
│   │   │   ├── TouristSpot.model.js
│   │   │   ├── Business.model.js
│   │   │   ├── Event.model.js
│   │   │   └── Favorite.model.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── touristSpot.controller.js
│   │   │   ├── business.controller.js
│   │   │   └── event.controller.js
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── touristSpot.routes.js
│   │   │   ├── business.routes.js
│   │   │   └── event.routes.js
│   │   │
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   ├── role.middleware.js
│   │   │   └── error.middleware.js
│   │   │
│   │   ├── services/
│   │   └── server.js
│   │
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── 📁 mobile-app/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── navigation/
│   │   │
│   │   ├── screens/
│   │   │   ├── auth/
│   │   │   │   ├── LoginScreen.js
│   │   │   │   └── RegisterScreen.js
│   │   │   │
│   │   │   ├── tourist/
│   │   │   │   ├── HomeScreen.js
│   │   │   │   ├── TouristSpotsScreen.js
│   │   │   │   ├── SpotDetailsScreen.js
│   │   │   │   ├── HotelsScreen.js
│   │   │   │   ├── RestaurantsScreen.js
│   │   │   │   ├── EventsScreen.js
│   │   │   │   ├── FavoritesScreen.js
│   │   │   │   └── EmergencyScreen.js
│   │   │   │
│   │   │   ├── business/
│   │   │   │   ├── BusinessDashboard.js
│   │   │   │   ├── AddBusinessScreen.js
│   │   │   │   ├── EditBusinessScreen.js
│   │   │   │   └── InquiryScreen.js
│   │   │
│   │   ├── context/
│   │   ├── utils/
│   │   └── App.js
│   │
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── 📁 web-app/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.js
│   │   │   │   ├── TouristSpots.js
│   │   │   │   ├── Businesses.js
│   │   │   │   ├── Events.js
│   │   │   │   └── Users.js
│   │   │   │
│   │   │   ├── developer/
│   │   │   │   ├── ServerStatus.js
│   │   │   │   ├── LogsViewer.js
│   │   │   │   ├── DatabaseMonitor.js
│   │   │   │   └── SecurityLogs.js
│   │   │
│   │   ├── components/
│   │   ├── routes/
│   │   └── App.js
│   │
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── 📁 docs/
│   ├── API_DOCUMENTATION.md
│   ├── CAPSTONE_DEFENSE_GUIDE.md
│   ├── CAPSTONE_EXECUTIVE_SUMMARY.md
│   ├── PROJECT_STRUCTURE.md
│   ├── RESOURCE_GUIDE.md
│   ├── SETUP_GUIDE.md
│   ├── SYSTEM_ARCHITECTURE.md
│   └── PROJECT_COMPLETE.md
│
├── 📄 README.md
└── 📄 .gitignore
```

---

## File Organization Strategy

### By Feature vs By Type

The project is organized **by feature** (user type/module) rather than by file type:

```
✅ RECOMMENDED - By Feature
mobile-app/screens/
├── tourist/       (all tourist-related screens together)
├── business/      (all business-related screens together)
└── resident/      (all resident-related screens together)

❌ NOT RECOMMENDED - By File Type
screens/
├── HomeScreen.js
├── DashboardScreen.js
├── ProfileScreen.js
└── ... (mixed and hard to find related screens)
```

### Naming Conventions

**Backend Files**:
- Models: `User.model.js` (singular, lowercase)
- Controllers: `auth.controller.js` (lowercase, descriptive)
- Routes: `auth.routes.js` (lowercase, plural)
- Middleware: `auth.middleware.js` (lowercase, descriptive)

**Mobile/Web Files**:
- Screens: `HomeScreen.js` (PascalCase, "Screen" suffix)
- Components: `SpotCard.js` (PascalCase, descriptive name)
- API files: `touristSpots.api.js` (camelCase, "api" suffix)
- Context: `AuthContext.js` (PascalCase, "Context" suffix)

---

## Database Collections Relationship

```
┌─────────────┐
│   users     │
└──────┬──────┘
       │ (references)
       ├─→ ┌──────────────┐
       │   │ favorites    │
       │   └──────────────┘
       │
       ├─→ ┌──────────────┐
       │   │ reviews      │
       │   └──────────────┘
       │
       ├─→ ┌──────────────┐
       │   │ businesses   │
       │   └──────────────┘
       │
       └─→ ┌──────────────┐
           │ notifications│
           └──────────────┘

┌──────────────────┐
│ touristspots     │ ←─ (featured in reviews)
└──────────────────┘

┌──────────────┐
│   events     │ ←─ (may reference spots)
└──────────────┘

┌──────────────┐
│   logs       │ ←─ (tracks all user activity)
└──────────────┘
```

---

## Access Levels by Feature

| Feature | Tourist | Business Owner | Admin | Developer |
|---------|---------|----------------|-------|-----------|
| View Spots | ✅ | ✅ | ✅ | ✅ |
| Add Spots | ❌ | ❌ | ✅ | ❌ |
| Manage Biz | ❌ | ✅ | ✅ | ❌ |
| Approvals | ❌ | ❌ | ✅ | ❌ |
| Analytics | ❌ | ✅ | ✅ | ✅ |
| Logs | ❌ | ❌ | ❌ | ✅ |

---

## Quick Navigation Guide

### Finding Tourist Features
```
Mobile App → src/screens/tourist/  (all tourist screens)
Mobile App → src/api/touristSpots.api.js  (tourist API calls)
Backend → src/routes/touristSpot.routes.js  (endpoints)
Backend → src/models/TouristSpot.model.js  (database schema)
```

### Finding Business Features
```
Mobile App → src/screens/business/  (business screens)
Mobile App → src/api/business.api.js  (business API calls)
Backend → src/routes/business.routes.js  (endpoints)
Backend → src/models/Business.model.js  (database schema)
```

### Finding Admin Features
```
Web App → src/pages/[section]/  (all admin pages)
Web App → src/components/  (reusable components)
Backend → src/routes/admin.routes.js  (admin endpoints)
```

---

## Tips for Development

1. **Always check the role** before allowing actions
2. **Keep API calls in dedicated files** (src/api/)
3. **Reuse components** from src/components/
4. **Follow naming conventions** for consistency
5. **Update middleware** for new features
6. **Test CRUD operations** in API tester
7. **Keep models simple** and focused
8. **Document new endpoints** in API_DOCUMENTATION.md

---

## Scalability Points

To scale this system:

1. **Add more user types**: Create new folders in `screens/[newtype]/`
2. **Add new features**: Add models, controllers, routes, and API files
3. **Implement caching**: Add Redis layer between app and database
4. **Database scaling**: Sharding by region or feature type
5. **API versioning**: Create `routes/v1/` and `routes/v2/` folders
6. **Microservices**: Split by domain (auth-service, tourism-service, etc.)

---

For more details, see:
- README.md (project overview)
- SETUP_GUIDE.md (installation)
- API_DOCUMENTATION.md (endpoints)
- CAPSTONE_DEFENSE_GUIDE.md (defense points)
