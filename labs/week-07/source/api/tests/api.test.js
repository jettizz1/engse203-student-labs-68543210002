import { test, beforeEach, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { loadSeed } from '../src/services/requestService.js';

let app;
beforeEach(async () => {
  await loadSeed();
  app = createApp();
});

const validRequest = {
  requesterName: 'ทดสอบ ระบบ',
  requestType: 'แจ้งซ่อม',
  location: 'C3-401',
  details: 'รายละเอียดยาวพอสมควรจริง',
  priority: 'normal',
};

describe('GET /api/requests', () => {
  test('คืนรายการทั้งหมด พร้อม status 200', async () => {
    const res = await request(app).get('/api/requests');
    assert.equal(res.status, 200);
    assert.equal(res.body.length, 3);
    assert.ok(Array.isArray(res.body));
  });

  test('กรองรายการตาม status', async () => {
    const res = await request(app).get('/api/requests?status=pending');
    assert.equal(res.status, 200);
    assert.ok(res.body.every((item) => item.status === 'pending'));
  });

  test('ตอบ CORS header ให้ origin ที่อนุญาต', async () => {
    const res = await request(app).get('/api/requests').set('Origin', 'http://localhost:5173');
    assert.equal(res.headers['access-control-allow-origin'], 'http://localhost:5173');
  });
});

describe('GET /api/requests/:id', () => {
  test('คืนคำร้องเมื่อพบ ID', async () => {
    const res = await request(app).get('/api/requests/REQ-001');
    assert.equal(res.status, 200);
    assert.equal(res.body.id, 'REQ-001');
  });

  test('ตอบ 404 เมื่อไม่พบ ID', async () => {
    const res = await request(app).get('/api/requests/REQ-NOT-FOUND');
    assert.equal(res.status, 404);
    assert.match(res.body.error, /ไม่พบคำร้อง/);
  });
});

describe('POST /api/requests', () => {
  test('สร้างคำร้องใหม่และกำหนดสถานะเริ่มต้นเป็น pending', async () => {
    const res = await request(app).post('/api/requests').send(validRequest);
    assert.equal(res.status, 201);
    assert.equal(res.body.status, 'pending');
    assert.match(res.body.id, /^REQ-/);
  });

  test('ตอบ 400 เมื่อข้อมูลไม่ครบ', async () => {
    const res = await request(app).post('/api/requests').send({ requesterName: 'ก' });
    assert.equal(res.status, 400);
    assert.ok(Array.isArray(res.body.details));
  });
});

describe('PUT /api/requests/:id', () => {
  test('อัปเดตสถานะด้วย status ที่รองรับ', async () => {
    const res = await request(app).put('/api/requests/REQ-001').send({ status: 'in-progress' });
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'in-progress');
  });

  test('ตอบ 400 เมื่อ status ไม่ถูกต้อง', async () => {
    const res = await request(app).put('/api/requests/REQ-001').send({ status: 'unknown' });
    assert.equal(res.status, 400);
  });

  test('ตอบ 404 เมื่ออัปเดต ID ที่ไม่มีอยู่', async () => {
    const res = await request(app).put('/api/requests/REQ-NOT-FOUND').send({ status: 'completed' });
    assert.equal(res.status, 404);
  });
});

describe('DELETE /api/requests/:id', () => {
  test('ลบคำร้องและตอบ 204 โดยไม่มี body', async () => {
    const res = await request(app).delete('/api/requests/REQ-001');
    assert.equal(res.status, 204);
    assert.equal(res.text, '');
    const list = await request(app).get('/api/requests');
    assert.equal(list.body.length, 2);
  });

  test('ตอบ 404 เมื่อลบ ID ที่ไม่มีอยู่', async () => {
    const res = await request(app).delete('/api/requests/REQ-NOT-FOUND');
    assert.equal(res.status, 404);
  });
});
