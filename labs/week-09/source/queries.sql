-- Campus Service Request — tested SQLite queries.

-- ① คำร้องทั้งหมด เรียงตามรหัส
SELECT id, request_type, location, priority, status, created_at
FROM requests
ORDER BY id;

-- ② คำร้องที่ยังไม่ได้ดำเนินการ
SELECT id, location, details, status
FROM requests
WHERE status = 'pending'
ORDER BY id;

-- ③ คำร้องเร่งด่วนที่ยังไม่เสร็จ
SELECT id, location, priority, status
FROM requests
WHERE priority = 'urgent' AND status <> 'completed'
ORDER BY id;

-- ④ ค้นคำร้องจากคำบางส่วนในรายละเอียด (ใช้คำว่า "เครื่อง")
SELECT id, details, status
FROM requests
WHERE details LIKE '%เครื่อง%'
ORDER BY id;

-- ⑤ คำร้องพร้อมชื่อผู้แจ้ง
SELECT r.id, u.name AS requester_name, r.request_type, r.status
FROM requests AS r
JOIN users AS u ON u.id = r.requester_id
ORDER BY r.id;

-- ⑥ คำร้องของภาควิชาวิศวกรรมซอฟต์แวร์
SELECT r.id, u.name AS requester_name, u.department, r.location, r.status
FROM requests AS r
JOIN users AS u ON u.id = r.requester_id
WHERE u.department = 'วิศวกรรมซอฟต์แวร์'
ORDER BY r.id;

-- ⑦ รายชื่อผู้แจ้งที่ไม่ซ้ำกัน
SELECT DISTINCT u.name AS requester_name
FROM users AS u
JOIN requests AS r ON r.requester_id = u.id
ORDER BY requester_name;

-- ⑧ คำร้อง 3 รายการล่าสุด
SELECT id, request_type, created_at
FROM requests
ORDER BY created_at DESC, id DESC
LIMIT 3;

-- ⑨ นับจำนวนคำร้องแยกตามสถานะ
SELECT status, COUNT(*) AS total
FROM requests
GROUP BY status
ORDER BY total DESC, status;

-- ⑩ จำนวนคำร้องต่อผู้แจ้ง รวมผู้ที่ยังไม่เคยแจ้ง (LEFT JOIN)
SELECT u.name AS requester_name, u.department, COUNT(r.id) AS total
FROM users AS u
LEFT JOIN requests AS r ON r.requester_id = u.id
GROUP BY u.id, u.name, u.department
ORDER BY total DESC, u.name;

-- ⑪ Index สำหรับการค้นตามสถานะและเชื่อมโยงผู้แจ้ง (ปลอดภัยเมื่อรันซ้ำ)
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_requester ON requests(requester_id);
