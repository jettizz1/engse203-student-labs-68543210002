# Campus Service — Full-Stack (LAB 11)

Campus Service is a full-stack service-request application. Users can browse, filter, create, update, and remove campus service requests. The UI is built with React and Vite, the JSON API uses Express, and SQLite stores requests and users.

## Three-tier architecture

```text
React frontend  ── HTTP/JSON ──►  Express API  ── SQL ──►  SQLite
frontend/src/                    api/src/                  api/data/
```

The frontend owns routes, forms, and rendering. The API owns validation, HTTP status codes, logging, and request orchestration. The service layer maps the relational database representation into the stable API response shape; SQLite owns durable local data and relational constraints.

## Requirements

- Node.js 22.12 or newer (Node 24 is also supported).
- Install dependencies independently in `api/` and `frontend/`.

## Development

1. In `api/`, run `npm ci`, copy `.env.example` to `.env`, then run `npm run db:setup`.
2. Start the API in that directory with `npm run dev` (default `http://localhost:3001`).
3. In a second terminal, enter `frontend/`, run `npm ci` and `npm run dev` (Vite prints its URL, normally `http://localhost:5173`).
4. Vite proxies `/api` requests to the API. Open the Vite URL to use the app.

Useful API commands from `api/`: `npm test`, `npm run check`, `npm run db:setup`, and `npm run db:reset`.

## Production

Build the client from `frontend/` using `npm run build`; Vite writes `frontend/dist/`. Configure the environment variables below, then start the server from `api/` with `npm start`. In `NODE_ENV=production`, Express serves the built SPA and `/api` from the same origin. On a new deployment, the API creates the database schema automatically; `npm run db:setup` is also available for deliberate initialization/reset workflows.

GitHub Pages is static hosting only: it does not run Express or SQLite. The Pages `publish/` directory is a responsive project showcase, not a claim that the full-stack API is hosted there. To run the application remotely, deploy the API and persistent database separately (or deploy the bundled Express app to a host that supports both), then set `VITE_API_BASE_URL` to that API origin at build time when it is not same-origin. A local `.env` is not bundled or committed.

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `NODE_ENV` | `development` | Selects development or production logging/static-file behavior. |
| `PORT` | `3001` | Express listening port. |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed browser origin for cross-origin API clients. |
| `DB_FILE` | `api/data/campus.db` | SQLite file path; relative paths resolve from the process working directory. |
| `SCHEMA_FILE` | `api/data/schema.sql` | Schema file used to initialize a new database. |
| `STATIC_DIR` | `frontend/dist` | Production frontend build served by Express. |
| `VITE_API_BASE_URL` | empty (same-origin) | Optional API origin embedded in the frontend build. |

For `DB_FILE`, `SCHEMA_FILE`, and `STATIC_DIR`, use paths appropriate to the API process working directory. `.env.example` uses the paths expected when commands run from `api/`.

## Design decisions

The three-tier separation keeps display concerns, HTTP concerns, and persistence concerns independently testable. The request service preserves the API shape even though the database uses a normalized `requester_id` foreign key, so data-source details do not leak into the UI. SQLite suits this small, structured, single-instance teaching application: it is transactional, relational, portable, and needs no separate database service. A larger multi-instance deployment should use a managed database and durable shared storage rather than an ephemeral local filesystem.

## Health and error behavior

`GET /api/health` reports `status`, environment, uptime, and database connectivity. It returns HTTP 503 if the database is unavailable. Unknown routes return JSON 404 responses; centralized error middleware avoids leaking stack traces in production. Morgan uses concise development logs and combined production logs.
