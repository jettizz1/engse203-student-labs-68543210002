import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const schema = readFileSync(path.join(root, 'schema.sql'), 'utf8');
const queries = readFileSync(path.join(root, 'queries.sql'), 'utf8');
const db = new DatabaseSync(':memory:');
db.exec('PRAGMA foreign_keys = ON');
db.exec(schema);
db.exec(schema);
assert.equal(db.prepare('SELECT COUNT(*) AS n FROM users').get().n, 5);
assert.equal(db.prepare('SELECT COUNT(*) AS n FROM requests').get().n, 10);
assert.equal(db.prepare('PRAGMA foreign_key_check').all().length, 0);
console.log('PASS schema.sql executes twice; 5 users, 10 requests, no foreign-key violations');

const statements = queries
  .replace(/--[^\n]*/g, '')
  .split(';')
  .map((statement) => statement.trim())
  .filter(Boolean);
let selectCount = 0;
for (const statement of statements) {
  const prepared = db.prepare(statement);
  if (/^SELECT\b/i.test(statement)) {
    prepared.all();
    selectCount += 1;
  } else {
    prepared.run();
  }
}
assert.equal(selectCount, 10);
assert.equal(db.prepare("SELECT COUNT(*) AS n FROM requests WHERE status = 'pending'").get().n, 5);
assert.equal(db.prepare("SELECT COUNT(*) AS n FROM requests WHERE priority = 'urgent' AND status <> 'completed'").get().n, 4);
assert.equal(db.prepare("SELECT COUNT(*) AS n FROM users u LEFT JOIN requests r ON r.requester_id = u.id WHERE r.id IS NULL").get().n, 1);
assert.equal(db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'index' AND name IN ('idx_requests_status', 'idx_requests_requester')").get().n, 2);
console.log(`PASS queries.sql executes all ${selectCount} SELECT statements and index statements`);
console.log('PASS sample assertions: 5 pending, 4 urgent unfinished, 1 user without requests, 2 indexes');

const tests = [
  {
    label: 'invalid requester_id is rejected by FOREIGN KEY',
    sql: "INSERT INTO requests (id, requester_id, request_type, location, details) VALUES ('TEST-FK', 99999, 'แจ้งซ่อม', 'ห้องทดสอบ', 'invalid user')",
    error: 'FOREIGN KEY constraint failed',
  },
  {
    label: 'invalid status is rejected by CHECK',
    sql: "INSERT INTO requests (id, requester_id, request_type, location, details, status) VALUES ('TEST-STATUS', 1, 'แจ้งซ่อม', 'ห้องทดสอบ', 'invalid status', 'ยกเลิก')",
    error: 'CHECK constraint failed',
  },
  {
    label: 'duplicate email is rejected by UNIQUE',
    sql: "INSERT INTO users (name, department, email) VALUES ('ทดสอบ', 'ทดสอบ', 'somchai@rmutl.ac.th')",
    error: 'UNIQUE constraint failed',
  },
  {
    label: 'duplicate request id is rejected by PRIMARY KEY',
    sql: "INSERT INTO requests (id, requester_id, request_type, location, details) VALUES ('REQ-001', 1, 'แจ้งซ่อม', 'ห้องทดสอบ', 'duplicate id')",
    error: 'UNIQUE constraint failed',
  },
  {
    label: 'missing location is rejected by NOT NULL',
    sql: "INSERT INTO requests (id, requester_id, request_type, details) VALUES ('TEST-NULL', 1, 'แจ้งซ่อม', 'missing location')",
    error: 'NOT NULL constraint failed',
  },
];

for (const test of tests) {
  let actualError;
  try {
    db.prepare(test.sql).run();
  } catch (error) {
    actualError = error;
  }
  assert.ok(actualError, `${test.label}: invalid write was accepted`);
  assert.match(actualError.message, new RegExp(test.error.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  console.log(`PASS ${test.label} — ${actualError.message}`);
}
db.close();
console.log('PASS all schema, query, sample-data, index, and constraint checks');
