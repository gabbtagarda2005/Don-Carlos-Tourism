# Deploying Don Carlos Tourism

| Part | Folder | Host | Cost |
|---|---|---|---|
| Database | — | MongoDB Atlas (M0) | Free |
| API (Express) | `backend/` | Render (Web Service) | Free |
| Website + admin console (React/Vite) | `web-app/` | Vercel | Free |

Do the steps **in this order**. It takes about 20 minutes.

---

## 0. Push the project to GitHub

1. Create an empty repository on <https://github.com/new> (e.g. `don-carlos-tourism`). Don't add a README.
2. In this project folder run:

```bash
git remote add origin https://github.com/<your-username>/don-carlos-tourism.git
git branch -M main
git push -u origin main
```

---

## 1. Create the database (MongoDB Atlas)

1. Sign up at <https://www.mongodb.com/cloud/atlas/register> → **Create** a free **M0** cluster (pick the Singapore region if offered — closest to the Philippines).
2. **Database Access** → *Add New Database User* → username + password (avoid `@ : / ?` characters in the password).
3. **Network Access** → *Add IP Address* → **Allow access from anywhere** (`0.0.0.0/0`). Render's free IPs change, so this is required.
4. **Connect** → *Drivers* → copy the connection string and add a database name before the `?`:

```
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/don-carlos-tourism?retryWrites=true&w=majority
```

---

## 2. Deploy the API on Render

1. Sign in at <https://dashboard.render.com> with GitHub.
2. **New → Blueprint** → pick your repository. Render reads `render.yaml` and asks for:
   - `MONGODB_URI` — the Atlas string from step 1
   - `CORS_ORIGIN` — leave as `*` for now (you'll update it in step 4)
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — the first admin login (password ≥ 8 characters)
3. Click **Apply**. When the deploy is live, open
   `https://<your-service>.onrender.com/api/health` — you should see `"database":"connected"`.

On first start the API automatically creates the admin account and loads the sample destinations, events and businesses.

> Free Render services sleep after 15 minutes idle and take ~50 seconds to wake. The website shows built-in content instantly while the API wakes, so visitors never see a blank page.

*Manual alternative (no Blueprint):* New → Web Service → Root Directory `backend`, Build `npm install`, Start `npm start`, then add the env vars from `backend/.env.example`.

---

## 3. Deploy the website on Vercel

1. Sign in at <https://vercel.com> with GitHub → **Add New… → Project** → import the repository.
2. Set **Root Directory** to `web-app` (click *Edit*). Framework preset: **Vite** (auto-detected).
3. **Environment Variables** → add:

| Name | Value |
|---|---|
| `VITE_API_URL` | `https://<your-service>.onrender.com/api` |

4. **Deploy**. Your site will be live at `https://<project>.vercel.app`.

> If you change `VITE_API_URL` later, redeploy — Vite bakes it in at build time.

---

## 4. Lock down CORS

Back in Render → your service → **Environment** → set

```
CORS_ORIGIN=https://<project>.vercel.app
```

(Comma-separate several origins; `*.vercel.app` also allows Vercel preview URLs.) Save — Render redeploys automatically.

---

## 5. First login

Open `https://<project>.vercel.app/login` and sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`. You'll land in the **Admin console** (`/admin`) where you can:

- edit / replace the sample destinations, events and businesses with real ones
- approve business-owner applications
- manage users and roles, moderate reviews
- read contact-form messages and newsletter subscribers
- view server health, audit logs and download a JSON backup

**Change the admin password** under *Account → Profile* after the first login.

---

## Running locally

```bash
# terminal 1 — API (needs MongoDB running locally or an Atlas URI in .env)
cd backend
cp .env.example .env
npm install
npm run dev            # http://localhost:5000

# terminal 2 — website
cd web-app
cp .env.example .env   # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev            # http://localhost:5173
```

Useful scripts: `npm run seed` (add sample data if empty), `npm run seed:reset` (replace spots/events/businesses with sample data).
