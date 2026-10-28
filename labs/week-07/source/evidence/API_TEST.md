# LAB07 automated test evidence

Results below were produced in this workspace on 2026-10-29. They are automated command-line checks only; no manual browser run or screenshots are claimed.

| Command | Result |
|---|---|
| `node check-week07.mjs` (cwd: `source/`) | PASS — 36/36 checks (25/25 in-class, 8/8 take-home, 3/3 challenge) |
| `node check-week07.mjs --inclass` (cwd: `source/`) | PASS — 25/25 in-class checks |
| `npm.cmd test` (cwd: `source/api/`) | PASS — 12 tests, 0 failures |
| `npm.cmd run check` (cwd: `source/api/`) | PASS — 28/28 API project checks |
| `npm.cmd run check` (cwd: `source/frontend/`) | PASS — 7/7 LAB07 frontend integration checks |
| `npm.cmd run build` (cwd: `source/frontend/`) | PASS — Vite production build completed |

`npm.cmd` was used because PowerShell's execution policy blocked the `npm.ps1` shim. The course checker itself notes that it cannot verify CORS behavior in a browser. The Pages `publish/` page is a static showcase and is not evidence that the hosted site runs Express.
