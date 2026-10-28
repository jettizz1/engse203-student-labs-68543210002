# API_TEST — LAB 06

**ชื่อ–รหัส:** 68543210002 · คมสันต์ ขันคำกาศ **วันที่ทดสอบ:** 29 ตุลาคม 2026

ผลจาก `npm run check` ซึ่งใช้ Supertest ยิง request เข้า Express app จริง:

> บันทึก **ผลจริง** ที่เห็น ไม่ใช่ผลที่ควรได้ · ถ้าไม่ผ่านให้เขียนว่าไม่ผ่าน

| # | Method | Path | ส่งอะไร | status ที่ควรได้ | status ที่ได้จริง | ผ่าน |
|---|---|---|---|---|---|---|
| 1 | GET | `/` | — | 200 | 200 | ผ่าน |
| 2 | GET | `/api/requests` | — | 200 | 200 | ผ่าน |
| 3 | GET | `/api/requests/REQ-001` | — | 200 | 200 | ผ่าน |
| 4 | GET | `/api/requests/REQ-999` | — | 404 | 404 | ผ่าน |
| 5 | POST | `/api/requests` | ข้อมูลครบถูกต้อง | 201 | 201 | ผ่าน |
| 6 | POST | `/api/requests` | `{"requesterName":"x"}` | 400 | 400 | ผ่าน |
| 7 | DELETE | `/api/requests/<id ที่สร้าง>` | — | 204 | 204 | ผ่าน |
| 8 | DELETE | `/api/requests/REQ-999` | — | 404 | 404 | ผ่าน |
| 9 | GET | `/api/unknown-path-xyz` | — | 404 JSON | 404 JSON | ผ่าน |

## ⭐ Challenge (ถ้าทำ)

| # | Method | Path | status ที่ควรได้ | ที่ได้จริง | ผ่าน |
|---|---|---|---|---|---|
| 10 | GET | `/api/requests?status=pending` | 200 (กรองแล้ว) | 200 | ผ่าน |
| 11 | PUT | `/api/requests/REQ-001` + `{"status":"in-progress"}` | 200 | 200 | ผ่าน |
| 12 | PUT | `/api/requests/REQ-001` + `{"status":"มั่ว"}` | 400 | 400 | ผ่าน |

## ทดสอบว่าข้อมูลอยู่ถาวร (CP08)

| ขั้น | ทำอะไร | ผลที่เห็น |
|---|---|---|
| 1 | POST เพิ่มคำร้องใหม่ | สร้างคำร้องเพื่อทดสอบ persistence |
| 2 | GET ดูรายการ — เห็นคำร้องใหม่ไหม | พบคำร้องหลังเริ่ม Node process ใหม่ |
| 3 | Ctrl+C ปิดเซิร์ฟเวอร์ แล้วเปิดใหม่ | ทดสอบโดยโหลด service ใน process ใหม่ |
| 4 | GET ดูรายการอีกครั้ง — คำร้องยังอยู่ไหม | ยังอยู่ใน `data/requests.json` |

## สรุปผล

- ผ่าน 9 / 9 (+ Challenge 3 / 3)
- รายการที่ไม่ผ่านและสาเหตุ:

## Screenshot ที่แนบ

- [ ] `images/postman-get-200.png` — ยังไม่ได้เก็บภาพจาก Postman
- [ ] `images/postman-post-201.png` — ยังไม่ได้เก็บภาพจาก Postman
- [ ] `images/terminal-logger.png` — logger ตรวจจาก output checker แล้ว แต่ยังไม่ได้เก็บภาพ
