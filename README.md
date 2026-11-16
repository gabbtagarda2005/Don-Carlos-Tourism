# Don Carlos Tourism — Management & Information System

A MERN-stack tourism platform for **Don Carlos, Bukidnon**: a public website for visitors and an admin console for the Municipal Tourism Office, backed by a secure REST API.

**➡ Deployment guide (MongoDB Atlas + Render + Vercel): [DEPLOYMENT.md](DEPLOYMENT.md)**

## Structure

```
backend/      Express + MongoDB REST API            → deploy on Render
  src/
    app.js            Express app (security, CORS, routes)
    server.js         Startup: DB connect, first admin, sample data
    models/           User, TouristSpot, Business, Event, Review, Message, Subscriber, ActivityLog
    routes/           auth, users, tourist-spots, businesses, events, reviews, admin, public
    middlewares/      JWT auth, role checks, error handling
    seed/             Sample content + seeding script
web-app/      React 18 + Vite + Tailwind CSS          → deploy on Vercel
  src/
    pages/public/     Landing page, destinations, spot details, events, stay & dine, auth, account
    pages/admin/      Overview analytics, destinations, events, businesses, users, reviews, inbox, system
    components/       Layout, cards, forms, UI primitives
    lib/              API client (with offline fallback), formatting helpers, sample data
mobile-app/   React Native prototype screens (not deployed)
docs/         Capstone documentation
render.yaml   Render Blueprint for the API
```

## Features

**Visitors** — cinematic landing page, search and filter destinations, detail pages with photo gallery, map, directions, reviews and ratings, saved favourites, events calendar, accommodation & dining directory, contact form, newsletter.

**Business owners** — register as a partner, submit and edit listings (reviewed by the tourism office before going public).

**Tourism administrators / developers** — analytics dashboard, full CRUD for destinations / events / businesses, business approval workflow, user and role management, review moderation, message inbox, server and database health, authentication & admin audit logs, JSON backup export.

**Security** — bcrypt password hashing, JWT auth with role-based access (`tourist`, `resident`, `business_owner`, `admin`, `developer`), rate limiting on auth and forms, Helmet headers, configurable CORS, spam honeypot, 90-day log retention.

## API overview

| Method & path | Access |
|---|---|
| `POST /api/auth/register`, `POST /api/auth/login`, `GET/PUT /api/auth/me`, `PUT /api/auth/password` | public / signed in |
| `GET /api/tourist-spots` (`?q, category, featured, sort`), `GET /api/tourist-spots/:idOrSlug` | public |
| `POST/PUT/DELETE /api/tourist-spots/:id` | admin |
| `GET /api/events` (`?upcoming=true`), `POST/PUT/DELETE /api/events/:id` | public / admin |
| `GET /api/businesses`, `GET /api/businesses/mine`, `POST/PUT/DELETE /api/businesses/:id` | public / owner / admin |
| `PATCH /api/businesses/:id/status` | admin |
| `GET/POST /api/reviews`, `DELETE /api/reviews/:id` | public / signed in |
| `GET /api/users/me/favorites`, `POST /api/users/me/favorites/:spotId` | signed in |
| `GET/PATCH/DELETE /api/users/:id` | admin |
| `POST /api/contact`, `POST /api/subscribe`, `GET /api/stats` | public |
| `GET /api/admin/stats \| messages \| subscribers \| logs \| system \| export` | admin |
| `GET /api/health` | public |

## Quick start (local)

```bash
cd backend && cp .env.example .env && npm install && npm run dev
cd web-app && cp .env.example .env && npm install && npm run dev
```

Open <http://localhost:5173>. Sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `backend/.env` to reach `/admin`.

> The destinations, events and businesses loaded on first start are **sample content** — replace them with verified local information from the admin console.
