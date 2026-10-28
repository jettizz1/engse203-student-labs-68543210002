# Campus Service API contract

Base URL: `http://localhost:3001` (configure the port with `PORT`). JSON responses use UTF-8. The API allows the configured `CORS_ORIGIN`, which defaults to `http://localhost:5173`.

## Request resource

| Field | Type | Values / constraints |
|---|---|---|
| `id` | string | Server-generated request identifier |
| `requesterName` | string | At least 2 non-whitespace characters |
| `requestType` | string | `แจ้งซ่อม`, `บริการบัญชีผู้ใช้`, `ขอใช้อุปกรณ์`, or `อื่น ๆ` |
| `location` | string | Required |
| `details` | string | At least 10 non-whitespace characters |
| `priority` | string | `normal` or `urgent` |
| `status` | string | `pending`, `in-progress`, or `completed` |

## Endpoints

### `GET /api/requests`

Returns all requests as an array (`200`). Optional `status` query filters the array, e.g. `GET /api/requests?status=pending`.

### `GET /api/requests/:id`

Returns one request (`200`) or `{ "error": "..." }` (`404`).

### `POST /api/requests`

Creates a request (`201`). The client sends `requesterName`, `requestType`, `location`, `details`, and `priority`; the server generates `id` and initializes `status` to `pending`.

```json
{
  "requesterName": "ทดสอบ ระบบ",
  "requestType": "แจ้งซ่อม",
  "location": "C3-401",
  "details": "รายละเอียดคำร้องตัวอย่างที่ยาวพอ",
  "priority": "normal"
}
```

Invalid input returns `400` with an `error` and a `details` array describing validation problems.

### `PUT /api/requests/:id`

Changes a request's status. Send `{ "status": "in-progress" }`. A successful update returns the updated request (`200`); an unsupported status returns `400`; an unknown ID returns `404`.

### `DELETE /api/requests/:id`

Deletes a request and returns an empty response (`204`). An unknown ID returns `404`.

## Error behavior

Errors use JSON `{ "error": "..." }`. Production responses do not expose stack traces or internal details. Unknown routes return `404`.
