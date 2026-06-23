# Deployment Guide

This project is deployed as two services:

- API and PostgreSQL on Render
- React client on Vercel

## 1. Deploy API on Render

1. Push the repository to GitHub.
2. In Render, choose **New > Blueprint** and select the repository.
3. Render reads `render.yaml` and creates:
   - `careview-api`
   - `careview-db`
4. Set these service environment variables:

```text
JWT_SECRET=<at least 32 random characters>
CLIENT_ORIGIN=https://<your-vercel-app>.vercel.app
CLIENT_ORIGINS=https://<your-vercel-app>.vercel.app
```

`DATABASE_URL` is wired from the Render PostgreSQL database by `render.yaml`.

The Docker start command runs migrations before starting the API:

```text
node scripts/migrate.js && node src/server.js
```

After deployment, verify:

```text
https://<your-render-service>.onrender.com/health
```

## 2. Seed Production Demo Accounts

Run the seed command once from a local terminal after setting the production `DATABASE_URL`:

```bash
cd server
set DATABASE_URL=<render-postgres-external-url>
set JWT_SECRET=<same-secret-used-on-render>
corepack pnpm db:seed
```

On macOS/Linux, use `export` instead of `set`.

## 3. Deploy Client on Vercel

1. Import the same GitHub repository into Vercel.
2. Set the Vercel project **Root Directory** to `client`.
3. Add this environment variable:

```text
VITE_API_URL=https://<your-render-service>.onrender.com/api
```

The `client/vercel.json` file handles:

- workspace install from the root lockfile
- filtered client build
- SPA rewrites to `index.html`

## 4. Final Smoke Test

1. Open the Vercel URL.
2. Register a new patient and confirm the empty dashboard.
3. Sign in as admin.
4. Search the new patient.
5. Add a report manually.
6. Sign back in as the patient and confirm metrics appear.
7. Upload `server/data/sample-health-reports.xlsx`.
8. Confirm the audit trail records the import.

## Notes

- Do not commit real `.env` files.
- Set `CLIENT_ORIGINS` to the exact Vercel origin. Avoid `*` for this assessment.
- Render free services may sleep. The first request after inactivity can be slow.
