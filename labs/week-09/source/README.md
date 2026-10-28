# LAB09 — Campus Service Request Database

SQLite relational model for campus service requests, with repeatable sample data, tested queries, constraints, and design notes.

## Run from this directory

Requires Node.js 22.12+ with the built-in `node:sqlite` module (tested with Node v24.22.1 / SQLite 3.53.4).

```powershell
node --disable-warning=ExperimentalWarning validate.mjs
node --disable-warning=ExperimentalWarning build-db.mjs
node --disable-warning=ExperimentalWarning check-week09.mjs
```

`validate.mjs` executes the schema twice in memory, runs each SELECT in `queries.sql`, checks representative results, and confirms five invalid writes are rejected. `build-db.mjs` creates/rebuilds `campus.db` from `schema.sql` in this directory. The supplied checker is copied into this source folder for convenient local use; its original is `labs/lab09/starter/check-week09.mjs`.

To try the SQL in an offline SQLite playground, open `playground-seed.sql` and run the complete file, then run statements from `queries.sql`. The SQL is also compatible with SQLite playgrounds such as SQLime; playground data is temporary.

## Project files

- `schema.sql` — repeatable schema, constraints, indexes, and ten sample requests.
- `playground-seed.sql` — self-contained schema and seed for an online/offline playground.
- `queries.sql` — all eight required queries and three challenges.
- `DATA_MODEL.md` — relationships, design rationale, JOIN example, and Week 10 observation.
- `CONSTRAINT_TEST.md` — reproducible evidence for five rejected invalid writes.
- `validate.mjs` — executable SQLite checks.
- `build-db.mjs` — generate the deliverable `campus.db`.

The sample has five users (including one with no requests) and ten requests spread across all statuses, both priorities, and three departments. Request records and their displayed names are joined using the foreign key.
