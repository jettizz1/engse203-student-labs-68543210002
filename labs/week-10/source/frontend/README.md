# ENGSE203 LAB10 — Campus Service Request

React frontend for the Campus Service API, backed by Express and SQLite during local development.

## Run

```bash
npm ci
npm run dev
npm run check
npm run build
npm run preview
```

`npm run build:pages` builds a standalone GitHub Pages demo that uses browser storage. GitHub Pages serves static files only; it does not host the Express API or SQLite database. To use the API from a separately deployed frontend build, set `VITE_API_BASE_URL` and run `npm run build`.

## Architecture

```mermaid
flowchart TD
  URL[Hash URL] --> Routes[App Routes]
  Routes --> Page[Page Component]
  Page --> UI[Shared Components]
  Page --> Service[requestService]
  Service --> API[Express API]
  API --> SQLite[(SQLite)]
  Service --> BrowserStorage[Pages demo localStorage]
```

- `App.jsx` กำหนด route matrix
- `pages/` เป็นเจ้าของ route-specific state และ lifecycle
- `components/` รับข้อมูลและ handler ผ่าน props
- `requestService.js` เป็น data-access boundary ของ UI และเลือก API หรือ static demo mode ตอน build
- `requestStorage.js` เป็นไฟล์เดียวที่ใช้ `localStorage` สำหรับ Pages demo

## Effect reasoning

Dashboard Effect ขึ้นกับ `scenario` และ `reloadKey` เพราะทั้งสองค่าเปลี่ยนชุดข้อมูลที่ต้อง synchronize จาก Service ส่วน summary และ filtered list เป็น derived data ระหว่าง render จึงไม่อยู่ใน Effect มี `ignore` cleanup guard เพื่อป้องกันผล async เก่ามาเขียน state หลัง route/scenario เปลี่ยน

## Privacy

ใช้ข้อมูลสาธิตเท่านั้น ห้ามบันทึก token, password, secret หรือข้อมูลส่วนบุคคลจริงใน browser storage หรือหลักฐานภาพ
