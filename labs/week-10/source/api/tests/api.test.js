import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import request from 'supertest';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(HERE, '../data/test.db');
process.env.DB_FILE = DB_FILE;
await rm(DB_FILE, { force: true });

const { createApp } = await import('../src/app.js');
const service = await import('../src/services/requestService.js');
const app = createApp();

before(async () => service.loadSeed());
after(async () => {
  service.closeDatabase();
  await Promise.all([
    rm(DB_FILE, { force: true }),
    rm(`${DB_FILE}-shm`, { force: true }),
    rm(`${DB_FILE}-wal`, { force: true }),
  ]);
});

const validPayload = (overrides = {}) => ({
  requesterName: 'ผู้ทดสอบ ระบบ',
  requestType: 'อื่น ๆ',
  location: 'ห้องทดสอบ 101',
  details: 'รายละเอียดสำหรับทดสอบ API',
  priority: 'normal',
  ...overrides,
});

describe('Campus Service Request API backed by SQLite', () => {
  test('GET / returns the API status', async () => {
    const response = await request(app).get('/');
    assert.equal(response.status, 200);
    assert.match(response.body.message, /API is running/);
  });

  test('GET /api/requests returns seeded rows in API shape', async () => {
    const response = await request(app).get('/api/requests');
    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.body));
    assert.ok(response.body.length >= 3);
    assert.deepEqual(
      Object.keys(response.body[0]).sort(),
      ['details', 'id', 'location', 'priority', 'requestType', 'requesterName', 'status'].sort(),
    );
    assert.ok(!('requester_id' in response.body[0]));
  });

  test('GET /api/requests filters by status with a parameterized query', async () => {
    const filtered = await request(app).get('/api/requests?status=pending');
    assert.equal(filtered.status, 200);
    assert.ok(filtered.body.length > 0);
    assert.ok(filtered.body.every((item) => item.status === 'pending'));

    for (const payload of [
      "x' OR '1'='1",
      "'; DROP TABLE requests; --",
      "pending' OR status='completed",
    ]) {
      const injection = await request(app)
        .get(`/api/requests?status=${encodeURIComponent(payload)}`);
      assert.equal(injection.status, 200);
      assert.deepEqual(injection.body, []);
    }
    assert.ok((await request(app).get('/api/requests')).body.length > 0);
  });

  test('GET /api/requests/:id returns a row or 404', async () => {
    const found = await request(app).get('/api/requests/REQ-001');
    assert.equal(found.status, 200);
    assert.equal(found.body.requesterName, 'สมชาย ใจดี');

    const missing = await request(app).get('/api/requests/REQ-999');
    assert.equal(missing.status, 404);
  });

  test('POST reuses an existing user and creates a pending request', async () => {
    const usersBefore = service.findAllUsers().length;
    const response = await request(app).post('/api/requests').send(validPayload({
      requesterName: 'สมชาย ใจดี',
    }));
    assert.equal(response.status, 201);
    assert.equal(response.body.requesterName, 'สมชาย ใจดี');
    assert.equal(response.body.status, 'pending');
    assert.match(response.body.id, /^REQ-/);
    assert.equal(service.findAllUsers().length, usersBefore);
    await request(app).delete(`/api/requests/${response.body.id}`);
  });

  test('POST creates a user for a new requester name', async () => {
    const usersBefore = service.findAllUsers().length;
    const response = await request(app).post('/api/requests').send(validPayload());
    assert.equal(response.status, 201);
    assert.equal(response.body.requesterName, 'ผู้ทดสอบ ระบบ');
    assert.equal(service.findAllUsers().length, usersBefore + 1);
    await request(app).delete(`/api/requests/${response.body.id}`);
  });

  test('POST rejects incomplete input with a readable 400', async () => {
    const response = await request(app).post('/api/requests').send({ requesterName: 'x' });
    assert.equal(response.status, 400);
    assert.equal(response.body.error, 'ข้อมูลคำร้องไม่ถูกต้อง');
    assert.ok(Array.isArray(response.body.details));
  });

  test('database constraint errors map to a client error and roll back new users', () => {
    const usersBefore = service.findAllUsers().length;
    assert.throws(
      () => service.create(validPayload({ requestType: 'invalid', requesterName: 'ไม่ควรค้าง ระบบ' })),
      (error) => error.status === 400 && !error.message.includes('CHECK constraint failed'),
    );
    assert.equal(service.findAllUsers().length, usersBefore);
  });

  test('PUT changes a valid status and rejects invalid or missing requests', async () => {
    const updated = await request(app).put('/api/requests/REQ-001').send({ status: 'in-progress' });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.status, 'in-progress');

    const invalid = await request(app).put('/api/requests/REQ-001').send({ status: 'ผิด' });
    assert.equal(invalid.status, 400);
    const missing = await request(app).put('/api/requests/REQ-999').send({ status: 'completed' });
    assert.equal(missing.status, 404);
  });

  test('DELETE removes the selected request and returns 204', async () => {
    const created = await request(app).post('/api/requests').send(validPayload({
      requesterName: 'ผู้ลบทดสอบ ระบบ',
    }));
    const removed = await request(app).delete(`/api/requests/${created.body.id}`);
    assert.equal(removed.status, 204);
    const missing = await request(app).get(`/api/requests/${created.body.id}`);
    assert.equal(missing.status, 404);
  });

  test('users endpoints expose users and their requests', async () => {
    const users = await request(app).get('/api/users');
    assert.equal(users.status, 200);
    assert.ok(users.body.some((user) => user.name === 'สมชาย ใจดี'));

    const requests = await request(app).get('/api/users/1/requests');
    assert.equal(requests.status, 200);
    assert.ok(requests.body.every((item) => item.requesterName === 'สมชาย ใจดี'));

    const missing = await request(app).get('/api/users/999/requests');
    assert.equal(missing.status, 404);
  });

  test('running the schema migration again preserves existing rows', async () => {
    const requestCount = service.findAll().length;
    const userCount = service.findAllUsers().length;
    service.closeDatabase();
    await service.loadSeed();
    assert.equal(service.findAll().length, requestCount);
    assert.equal(service.findAllUsers().length, userCount);
  });
});
