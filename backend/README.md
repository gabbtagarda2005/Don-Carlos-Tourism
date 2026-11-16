# Don Carlos Tourism — API

Express + MongoDB (Mongoose) REST API. See the root [README](../README.md) for the endpoint list and [DEPLOYMENT.md](../DEPLOYMENT.md) for Render setup.

```bash
cp .env.example .env   # set MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npm run dev            # http://localhost:5000/api/health
npm run seed           # add sample content if collections are empty
npm run seed:reset     # replace spots/events/businesses with sample content
```

On startup the server creates the first admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (if no admin exists) and, unless `SEED_SAMPLE_DATA=false`, loads sample content into empty collections.
