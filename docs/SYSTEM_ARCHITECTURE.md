# SYSTEM ARCHITECTURE & DIAGRAMS

## 1. HIGH-LEVEL SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                    DON CARLOS TOURISM SYSTEM                    │
│                      (MERN Stack - 2026)                        │
└─────────────────────────────────────────────────────────────────┘

                    ┌──────────────────┐
                    │  PRESENTATION    │
                    │  LAYER           │
                    └──────────────────┘
                    /        |         \
                   /         |          \
          ┌─────────┐   ┌──────────┐   ┌──────────┐
          │ WEB APP │   │MOBILE APP│   │MOBILE APP│
          │ (React) │   │ (Tourist)│   │(Business)│
          │ ADMIN   │   │(Resident)│   │(Admin)   │
          └─────────┘   └──────────┘   └──────────┘
                    \       |         /
                     \      |        /
                      ┌─────────────┐
                      │  API LAYER  │
                      │ Express.js  │
                      │ /api/*      │
                      └─────────────┘
                           |
              ┌────────────┼────────────┐
              |            |            |
         ┌─────────┐  ┌──────────┐  ┌────────────┐
         │ Auth    │  │ Business │  │ Middleware │
         │Logic    │  │ Logic    │  │ (JWT,RBAC)│
         └─────────┘  └──────────┘  └────────────┘
              |            |            |
              └────────────┼────────────┘
                           |
                      ┌──────────────┐
                      │ DATA LAYER   │
                      │ (Mongoose)   │
                      └──────────────┘
                           |
                      ┌──────────────┐
                      │  DATABASE    │
                      │ (MongoDB)    │
                      │  8 Collections
                      └──────────────┘
```

---

## 2. USER ROLE PERMISSION MATRIX

```
┌───────────────────────────────────────────────────────────────┐
│ ROLE HIERARCHY & PERMISSIONS                                  │
└───────────────────────────────────────────────────────────────┘

Developer (Level 5) ◄───────────────────┐
   ↑                                     │
   │ Can do everything Admin can + ...   │
   │                                     │
Admin (Level 4) ◄─────────────────┐     │
   ↑                              │     │
   │ Can do everything below +    │     │
   │ Approvals, Reports, Settings │     │
   │                              │     │
Business Owner (Level 3) ◄─────┐ │     │
   ↑                           │ │     │
   │ Can do everything below + │ │     │
   │ Business Management       │ │     │
   │                           │ │     │
Resident (Level 2) ◄────┐      │ │     │
   ↑                    │      │ │     │
   │ Can do view +      │      │ │     │
   │ Suggestions        │      │ │     │
   │                    │      │ │     │
Tourist (Level 1)       │      │ │     │
   │ Can:               │      │ │     │
   ├─ View Spots        │      │ │     │
   ├─ View Events       │      │ │     │
   ├─ Search            ►──────┘ │     │
   ├─ Favorites         │        │
   ├─ Reviews           │        │
   └─ Profile           │        │
                        │        │
            Escalation: │        │
            Higher level│        │
            can do all  │        │
            below       └────────┘
```

---

## 3. DATABASE RELATIONSHIPS

```
┌──────────────────────────────────────────────────────────────┐
│ MONGODB COLLECTIONS & RELATIONSHIPS                          │
└──────────────────────────────────────────────────────────────┘

┌──────────────────┐
│     Users        │ (Authentication Hub)
├──────────────────┤
│ _id              │
│ email            │
│ password (hash)  │
│ role             │
│ profile info     │
│ lastLogin        │
└────────┬─────────┘
         │
    ┌────┴────┬─────────────┬────────────┐
    │          │             │            │
    ▼          ▼             ▼            ▼
┌────────┐ ┌────────┐ ┌──────────┐ ┌──────────┐
│Favorites│ │Reviews │ │Business  │ │Notif.    │
├────────┤ ├────────┤ ├──────────┤ ├──────────┤
│userId  │ │userId  │ │ownerId   │ │userId    │
│spotId  │ │spotId  │ │profile   │ │message   │
│addedAt │ │rating  │ │location  │ │status    │
│        │ │comment │ │images    │ │type      │
│        │ │date    │ │isApproved│ │timestamp │
└────────┘ └────────┘ └──────────┘ └──────────┘

           ▲            │
           │            │
      ┌────┴──────┐     │
      │TouristSpots       │
      ├──────────┤        │
      │_id       │        │
      │name      │        │
      │category  │◄───────┘
      │location  │
      │images    │
      │rating    │
      │visits    │
      └──────────┘

┌──────────────┐
│Events        │ (Independent)
├──────────────┤
│_id           │
│title         │
│date          │
│location      │
│images        │
│category      │
└──────────────┘

┌──────────────┐
│Logs          │ (Audit Trail)
├──────────────┤
│_id           │
│userId        │
│action        │
│timestamp     │
│details       │
└──────────────┘
```

---

## 4. API ENDPOINT STRUCTURE

```
┌────────────────────────────────────────────────────────┐
│ REST API ENDPOINTS - Express Routes                    │
└────────────────────────────────────────────────────────┘

/api/
├── /auth (Authentication)
│   ├── POST   /register      (Create account)
│   ├── POST   /login         (Get JWT token)
│   └── POST   /logout        (Invalidate session)
│
├── /users (User Management)
│   ├── GET    /              (Get all users - admin)
│   ├── GET    /:id           (Get user profile)
│   ├── PUT    /:id           (Update profile)
│   ├── GET    /:id/favorites (Get saved spots)
│   ├── POST   /:id/favorites (Add to favorites)
│   └── DELETE /:id/favorites/:spotId
│
├── /tourist-spots (Destinations)
│   ├── GET    /              (List all spots)
│   ├── GET    /:id           (Get spot details)
│   ├── POST   /              (Create - admin)
│   ├── PUT    /:id           (Update - admin)
│   └── DELETE /:id           (Delete - admin)
│
├── /businesses (Commerce)
│   ├── GET    /              (List businesses)
│   ├── GET    /:id           (Get business)
│   ├── POST   /              (Create - owner)
│   ├── PUT    /:id           (Update - owner)
│   └── DELETE /:id           (Delete - admin)
│
├── /events (Activities)
│   ├── GET    /              (List events)
│   ├── GET    /:id           (Get event)
│   ├── POST   /              (Create - admin)
│   ├── PUT    /:id           (Update - admin)
│   └── DELETE /:id           (Delete - admin)
│
└── /admin (Administration)
    ├── GET    /dashboard     (KPI metrics)
    ├── GET    /analytics     (Trends & stats)
    ├── GET    /approvals     (Pending items)
    └── PUT    /approvals/:id (Approve/reject)
```

---

## 5. AUTHENTICATION FLOW DIAGRAM

```
┌────────────────────────────────────────────────────┐
│ JWT AUTHENTICATION FLOW                            │
└────────────────────────────────────────────────────┘

CLIENT (Mobile/Web)            SERVER (Node.js)
         │                             │
         │─── 1. REGISTER ────────────►│
         │     (email, pwd,role)       │
         │                             ├─ Validate
         │                             ├─ Hash pwd
         │                             ├─ Create User
         │◄──── 2. Success ───────────┤
         │                             │
         │─── 3. LOGIN ──────────────►│
         │     (email, password)       │
         │                             ├─ Verify pwd
         │                             ├─ Generate JWT
         │                             ├─ Include role
         │◄──── 4. JWT Token ─────────┤
         │                             │
         │─── 5. API Request ────────►│
         │     (JWT in header)         │
         │                             ├─ Extract JWT
         │                             ├─ Verify signature
         │                             ├─ Check expiry
         │                             ├─ Verify role
         │◄──── 6. Protected Data ────┤
         │     (Success/403)           │
         │                             │

USER'S BROWSER STORAGE:
  ├─ JWT Token
  ├─ User ID
  ├─ User Role
  └─ Refresh Token (optional)

TOKEN STRUCTURE:
  Header.Payload.Signature
  
  Payload contains:
  {
    userId: "...",
    email: "...",
    role: "tourist",
    iat: 1234567890,
    exp: 1234654290
  }
```

---

## 6. MOBILE APP NAVIGATION STRUCTURE

```
┌────────────────────────────────────────────────────────┐
│ REACT NATIVE NAVIGATION HIERARCHY                      │
└────────────────────────────────────────────────────────┘

App.js (Root)
  │
  ├─► Navigation Context
  │   └─► isSignedIn?
  │
  └─► TabNavigator (Bottom Tabs)
      │
      ├─ Explore Tab
      │  ├─► HomeScreen
      │  ├─► TouristSpotsScreen
      │  ├─► SpotDetailsScreen
      │  └─► [Stack Navigator]
      │
      ├─ Hotels/Food Tab
      │  ├─► HotelsScreen
      │  ├─► RestaurantsScreen
      │  └─► [Stack Navigator]
      │
      ├─ Events Tab
      │  ├─► EventsScreen
      │  └─► EventDetailsScreen
      │
      ├─ Favorites Tab
      │  └─► FavoritesScreen (from Context)
      │
      └─ Profile Tab
         ├─► ProfileScreen
         ├─► LoginScreen
         └─► SettingsScreen
```

---

## 7. WEB APP PAGE HIERARCHY

```
┌────────────────────────────────────────────────────────┐
│ REACT WEB APP ROUTING STRUCTURE                        │
└────────────────────────────────────────────────────────┘

App.js (with React Router)
  │
  ├─► PrivateRoute Wrapper
  │   └─► Check Auth & Role
  │
  └─► Routes
      │
      ├─ /              ► DashboardHome
      │                 (KPI cards, charts)
      │
      ├─ /analytics     ► Analytics
      │                 (Visitor trends, revenue)
      │
      ├─ /spots         ► SpotList
      │                 (CRUD with DataTable)
      │
      ├─ /spots/add     ► AddSpot
      │                 (Form submission)
      │
      ├─ /businesses    ► BusinessList
      │
      ├─ /businesses/approvals ► Approvals
      │                         (Pending queue)
      │
      ├─ /events        ► EventList
      │
      ├─ /users         ► UserList
      │
      ├─ /reports       ► TourismReports
      │
      ├─ /settings      ► SystemSettings
      │
      └─ /security      ► SecurityManagement
         (Dev only)
```

---

## 8. DATA FLOW EXAMPLE - Tourist Browsing Spots

```
┌────────────────────────────────────────────────────────┐
│ DATA FLOW: Tourist Views Tourist Spots                 │
└────────────────────────────────────────────────────────┘

TOURIST MOBILE APP
│
├─ 1. User taps "Explore Spots"
│   └─► TouristSpotsScreen rendered
│
├─ 2. useEffect Hook triggers
│   └─► Calls touristSpotsAPI.getAllSpots()
│
├─ 3. API Makes HTTP Request
│   └─► GET /api/tourist-spots
│
├─ 4. Request reaches Backend
│   └─► authMiddleware checks JWT ✓
│
├─ 5. Controller receives request
│   ├─► touristSpot.controller.js
│   ├─► Calls mongoose query
│   └─► TouristSpot.find().exec()
│
├─ 6. MongoDB Query
│   ├─► Searches touristspots collection
│   ├─► Returns matching documents
│   └─► JSON array
│
├─ 7. Controller returns response
│   └─► { success: true, data: [...] }
│
├─ 8. API Response received
│   └─► Mobile app processes data
│
├─ 9. State Update (useState)
│   └─► setSpots(data)
│
├─ 10. Component Re-renders
│    └─► FlatList displays spots
│
└─ 11. User sees Spot Cards
    ├─ Hidden Waterfalls (4.5★)
    ├─ Sea of Clouds (4.8★)
    └─ Kaamulan Spirit (4.3★)
```

---

## 9. SECURITY ARCHITECTURE

```
┌────────────────────────────────────────────────────────┐
│ SECURITY LAYERS                                        │
└────────────────────────────────────────────────────────┘

LAYER 1: Input Validation
         ├─ Express-validator checks
         ├─ Type checking
         └─ Range validation

LAYER 2: Authentication
         ├─ JWT token verification
         ├─ Token expiration
         └─ Secret key protection

LAYER 3: Authorization (RBAC)
         ├─ Role middleware
         ├─ Permission checks
         └─ Resource ownership

LAYER 4: Data Protection
         ├─ Password hashing (bcryptjs)
         ├─ Sensitive field masking
         └─ PII protection

LAYER 5: Network Security
         ├─ HTTPS/TLS encryption
         ├─ CORS configuration
         └─ Rate limiting (optional)

LAYER 6: Database Security
         ├─ MongoDB connection auth
         ├─ Indexed queries
         └─ Connection pooling

LAYER 7: Logging & Monitoring
         ├─ Activity logs
         ├─ Error tracking
         └─ Performance metrics
```

---

## 10. DEPLOYMENT ARCHITECTURE

```
┌────────────────────────────────────────────────────────┐
│ PRODUCTION DEPLOYMENT SETUP                            │
└────────────────────────────────────────────────────────┘

                        USERS
                          │
              ┌───────────┼───────────┐
              │           │           │
          TOURISTS      BUSINESS    RESIDENTS
         (Mobile)      (Mobile)     (Mobile)
              │           │           │
              └─────┬─────┴─────┬─────┘
                    │           │
              ┌─────▼─────┐ ┌──▼──────────┐
              │ Mobile App│ │ Web App     │
              │ (Expo/    │ │ (React)     │
              │  Store)   │ │ (Vercel)    │
              └─────┬─────┘ └──┬──────────┘
                    │          │
                    └────┬─────┘
                         │
                    ┌────▼──────────┐
                    │   API Server  │
                    │  (Heroku/AWS) │
                    └────┬──────────┘
                         │
            ┌────────────┼────────────┐
            │            │            │
        ┌───▼──┐   ┌────▼────┐   ┌──▼────┐
        │ JWT  │   │Middleware   │Logs/  │
        │Auth  │   │Stack        │Metrics│
        │      │   │             │       │
        └──────┘   └─────┬──────┘   └──────┘
                         │
                    ┌────▼──────────┐
                    │   MongoDB     │
                    │   (Atlas)     │
                    └───────────────┘
                         │
                    ┌────▼──────────┐
                    │  Cloudinary   │
                    │ (Images/CDN)  │
                    └───────────────┘
```

---

## 11. FEATURE MATRIX BY USER TYPE

```
┌────────────────────────────────────────────────────────────┐
│ FEATURES BY USER ROLE                                      │
└────────────────────────────────────────────────────────────┘

                    TOURIST  RESIDENT  BUSINESS  ADMIN  DEV
View Spots            ✓        ✓         ✓       ✓      ✓
View Events           ✓        ✓         ✓       ✓      ✓
Add/Edit Spots        ✗        ✗         ✗       ✓      ✗
Manage Business       ✗        ✗         ✓       ✓      ✗
Approve Business      ✗        ✗         ✗       ✓      ✗
View Reports          ✗        ✗         ✓       ✓      ✓
Access Analytics      ✗        ✗         ✓       ✓      ✓
System Monitoring     ✗        ✗         ✗       ✗      ✓
View Logs             ✗        ✗         ✗       ✗      ✓
Database Access       ✗        ✗         ✗       ✗      ✓
User Management       ✗        ✗         ✗       ✓      ✓

Legend: ✓ = Full Access, ✗ = No Access
```

---

## 12. PROJECT DEPENDENCIES

```
┌────────────────────────────────────────────────────────┐
│ KEY TECHNOLOGIES & DEPENDENCIES                        │
└────────────────────────────────────────────────────────┘

BACKEND (Node.js)
├── express@4.18.2 - Web framework
├── mongoose@7.0.0 - MongoDB ODM
├── jsonwebtoken@9.0.0 - JWT auth
├── bcryptjs@2.4.3 - Password hashing
├── cors@2.8.5 - Cross-origin support
├── multer@1.4.5 - File uploads
├── cloudinary@1.33.0 - Image CDN
└── express-validator@7.0.0 - Input validation

MOBILE (React Native)
├── react@18.2.0 - UI library
├── react-native@0.72.0 - Mobile framework
├── @react-navigation/* - Navigation
├── axios@1.3.0 - HTTP client
├── react-native-maps@1.3.0 - Maps
├── react-native-geolocation-service@5.3.0 - GPS
└── expo@* - Development platform

WEB APP (React)
├── react@18.2.0 - UI library
├── react-router-dom@6.0.0 - Routing
├── axios@1.3.0 - HTTP client
├── react-icons@4.7.0 - Icon library
├── tailwindcss@3.0.0 - CSS framework
├── recharts@2.5.0 - Charts & graphs
└── react-scripts@5.0.1 - Build tools

DATABASE
└── mongodb - NoSQL database

DEPLOYMENT
├── Heroku/AWS - Backend hosting
├── Vercel/Netlify - Frontend hosting
├── MongoDB Atlas - Cloud database
└── Cloudinary - Image storage
```

---

This comprehensive visualization helps understand the system's architecture and relationships between components. Use this during your capstone defense to explain system design clearly!
