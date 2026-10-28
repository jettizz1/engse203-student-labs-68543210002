# LAB07 — Campus Service Request

This deliverable has a runnable Express API and a React/Vite frontend. Start each in its own terminal:

1. API: `cd api`, copy `.env.example` to `.env` if you need custom values, then run `npm install` and `npm run dev`. The default API is `http://localhost:3001`.
2. Frontend: `cd frontend`, run `npm install` and `npm run dev`; open the Vite URL (normally `http://localhost:5173`).
3. Optional API address override: create `frontend/.env.local` with `VITE_API_BASE_URL=http://localhost:3001`.

Run API tests with `cd api; npm test`. Run the course checker from this directory with `node check-week07.mjs`; `node check-week07.mjs --inclass` runs only the in-class subset.

The API keeps requests in memory and loads the sample seed on startup. Changes are therefore reset when the API restarts; this lab does not claim database persistence. `API_CONTRACT.md` documents all five API endpoints.

The `publish/` directory at the week level is a static GitHub Pages showcase. GitHub Pages does not run this Express API; use the local run steps above to use the live React/API integration.
