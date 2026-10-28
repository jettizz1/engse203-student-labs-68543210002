# Constraint test evidence

Executed against the schema and sample data with Node.js `node:sqlite` (SQLite 3.53.4) using `validate.mjs`. Each invalid write was run against a live in-memory database with `PRAGMA foreign_keys = ON`; all five failed as intended and no invalid row was retained.

| # | Attempt | Observed SQLite error |
|---|---|---|
| 1 | Insert a request whose `requester_id` is `99999` | `FOREIGN KEY constraint failed` |
| 2 | Insert a request with `status = 'ยกเลิก'` | `CHECK constraint failed: status IN ('pending', 'in-progress', 'completed')` |
| 3 | Insert a user with an existing email | `UNIQUE constraint failed: users.email` |
| 4 | Insert a request using existing id `REQ-001` | `UNIQUE constraint failed: requests.id` |
| 5 | Insert a request without `location` | `NOT NULL constraint failed: requests.location` |

Re-run these checks with:

```powershell
node --disable-warning=ExperimentalWarning validate.mjs
```

The script uses assertions that fail if an invalid write is accepted or raises the wrong constraint error.
