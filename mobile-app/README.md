# Mobile App - Don Carlos Tourism

## Overview
React Native mobile application for Tourists, Business Owners, and Residents.

## Quick Start

```bash
npm install
npm start
```

Press `a` for Android or `i` for iOS.

## Supported Platforms
- iOS (via Expo)
- Android (via Expo)
- Web (via React Native Web)

## User Screens

### Tourist Screens
- Home - Featured attractions
- Tourist Spots - Browseable destination list
- Spot Details - Full spot information
- Hotels - Accommodation listings
- Restaurants - Dining options
- Events - Local events calendar
- Favorites - Saved destinations
- Emergency - Emergency contacts

### Business Owner Screens
- Dashboard - Business analytics
- Add/Edit Business - Profile management
- Promotions - Marketing images
- Inquiries - Customer messages

### Resident Screens
- Community Events - Local events
- Announcements - Updates
- Suggest Spot - Contribute attractions
- Explore Nearby - Local exploration

## Features

✅ Location-based search (GPS)
✅ Favorites/bookmarking
✅ Image uploads
✅ Real-time notifications
✅ Offline data caching
✅ Category filtering
✅ Reviews & ratings

## Installation

```bash
# Prerequisites
node v14+
npm or yarn
Expo CLI (optional)

# Setup
npm install

# Development
npm start

# Build for iOS
npm run ios

# Build for Android
npm run android
```

## Configuration

Edit API URL in `src/api/*.api.js`:
```javascript
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

## State Management

- **AuthContext**: Global auth state
- **FavoritesContext**: Saved spots

## Deployment

```bash
# Build for app stores
expo build:android
expo build:ios

# Release to stores
expo submit
```

## Support

For issues with the mobile app, refer to React Native documentation or contact support.
