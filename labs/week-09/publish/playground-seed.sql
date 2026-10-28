-- Campus Service Request — reproducible SQLite schema and sample data.
-- Re-run safely: child table first, then its referenced parent table.
PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL CHECK (length(trim(name)) > 0),
  department  TEXT NOT NULL CHECK (length(trim(department)) > 0),
  email       TEXT NOT NULL UNIQUE CHECK (length(trim(email)) > 0)
);

CREATE TABLE requests (
  id            TEXT PRIMARY KEY CHECK (length(trim(id)) > 0),
  requester_id  INTEGER NOT NULL,
  request_type  TEXT NOT NULL CHECK (request_type IN ('แจ้งซ่อม', 'บริการบัญชีผู้ใช้', 'ขอใช้อุปกรณ์', 'อื่น ๆ')),
  location      TEXT NOT NULL CHECK (length(trim(location)) > 0),
  details       TEXT NOT NULL CHECK (length(trim(details)) > 0),
  priority      TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent')),
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  FOREIGN KEY (requester_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_requester ON requests(requester_id);

INSERT INTO users (id, name, department, email) VALUES
  (1, 'สมชาย ใจดี', 'วิศวกรรมซอฟต์แวร์', 'somchai@rmutl.ac.th'),
  (2, 'สุภาวดี รักเรียน', 'วิศวกรรมซอฟต์แวร์', 'supawadee@rmutl.ac.th'),
  (3, 'ธนกฤต ตั้งใจ', 'วิศวกรรมไฟฟ้า', 'thanakrit@rmutl.ac.th'),
  (4, 'ปรียา ขยันยิ่ง', 'สำนักวิทยบริการ', 'preeya@rmutl.ac.th'),
  (5, 'กานต์ธีรา รอบคอบ', 'วิศวกรรมคอมพิวเตอร์', 'kanthira@rmutl.ac.th');

INSERT INTO requests (id, requester_id, request_type, location, details, priority, status, created_at) VALUES
  ('REQ-001', 1, 'แจ้งซ่อม', 'ห้องปฏิบัติการ 301', 'เครื่องปรับอากาศไม่ทำงานตั้งแต่เช้า', 'urgent', 'pending', '2026-10-20 08:15:00'),
  ('REQ-002', 2, 'บริการบัญชีผู้ใช้', 'อาคารวิศวกรรมซอฟต์แวร์', 'เข้าสู่ระบบห้องปฏิบัติการไม่ได้', 'normal', 'in-progress', '2026-10-21 09:30:00'),
  ('REQ-003', 3, 'ขอใช้อุปกรณ์', 'ห้องประชุม 2', 'ขอยืมโปรเจกเตอร์สำหรับนำเสนอโครงงาน', 'normal', 'completed', '2026-10-21 13:00:00'),
  ('REQ-004', 1, 'แจ้งซ่อม', 'ห้องปฏิบัติการ 302', 'คอมพิวเตอร์เครื่องที่ 5 เปิดไม่ติด', 'urgent', 'pending', '2026-10-22 10:10:00'),
  ('REQ-005', 4, 'อื่น ๆ', 'ห้องสมุด ชั้น 2', 'ขอเพิ่มปลั๊กไฟบริเวณโต๊ะอ่านหนังสือ', 'normal', 'pending', '2026-10-22 14:45:00'),
  ('REQ-006', 2, 'แจ้งซ่อม', 'ห้องปฏิบัติการ 401', 'ไฟในห้องกะพริบตลอดเวลา', 'normal', 'pending', '2026-10-23 08:20:00'),
  ('REQ-007', 3, 'แจ้งซ่อม', 'อาคารวิศวกรรมไฟฟ้า', 'ประตูห้องเก็บอุปกรณ์เปิดไม่ได้', 'urgent', 'in-progress', '2026-10-24 11:05:00'),
  ('REQ-008', 4, 'บริการบัญชีผู้ใช้', 'ห้องสมุด ชั้น 1', 'ขอรีเซ็ตรหัสผ่าน Wi-Fi', 'normal', 'completed', '2026-10-25 16:00:00'),
  ('REQ-009', 1, 'ขอใช้อุปกรณ์', 'ห้องปฏิบัติการ 301', 'ขอยืมเมาส์สำรองสำหรับการสอน', 'normal', 'in-progress', '2026-10-26 07:55:00'),
  ('REQ-010', 2, 'อื่น ๆ', 'อาคารวิศวกรรมซอฟต์แวร์', 'ขอเปลี่ยนหลอดไฟหน้าห้องเรียน', 'urgent', 'pending', '2026-10-27 12:25:00');
