# Don Carlos Tourism — Website & Admin Console

React 18 + Vite + Tailwind CSS. See [DEPLOYMENT.md](../DEPLOYMENT.md) for Vercel setup.

```bash
cp .env.example .env   # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev            # http://localhost:5173
npm run build          # production build in dist/
```

- Public site: `/`, `/explore`, `/spots/:slug`, `/events`, `/stays`, `/login`, `/register`, `/account`
- Admin console (admin/developer roles): `/admin`
- If the API is unreachable (e.g. a sleeping Render instance), public pages show built-in content from `src/lib/sample-data.json` (`npm run sync-data` copies it from the backend seed).
