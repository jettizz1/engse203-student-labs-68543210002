# ENGSE203 LAB10 — Campus Service Request

Runnable React + Express + SQLite implementation for the Week 10 lab.

## Run locally

Requires Node.js 22.12 or newer.

```powershell
cd api
npm ci
npm run db:setup
npm test
npm run dev
```

In a second terminal:

```powershell
cd frontend
npm ci
npm run dev
```

The API is at `http://localhost:3001`; the Vite frontend is at `http://localhost:5173`. `api/data/schema.sql` creates and seeds the normalized SQLite schema. `DB_FILE` can select an alternate database path, relative to `api/`.

## GitHub Pages build

From `frontend/`, run `npm run build:pages`; it creates a React production build that works as a standalone browser-storage demo. Pages is a static host and does not host Express or SQLite. For the SQLite-backed application, host the API separately and configure `VITE_API_BASE_URL` before building the API-connected frontend.

## Verification

```powershell
cd api
npm test
npm run check
cd ..\frontend
npm run check
npm run build
npm run build:pages
```

The API tests use an isolated database and remove it after the run. No runtime database or credentials are included in the submission source.
