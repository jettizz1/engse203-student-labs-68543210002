import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AppError } from '../middleware/errorHandler.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const API_ROOT = path.resolve(HERE, '../..');
const DB_FILE = path.resolve(API_ROOT, process.env.DB_FILE ?? path.join('data', 'campus.db'));
const SCHEMA_FILE = path.join(API_ROOT, 'data', 'schema.sql');

const SELECT_SHAPE = `
  SELECT r.id,
         u.name AS requesterName,
         r.request_type AS requestType,
         r.location,
         r.details,
         r.priority,
         r.status
  FROM requests r
  JOIN users u ON u.id = r.requester_id`;

let db;

function requireDatabase() {
  if (!db) throw new Error('Database is not initialized. Call loadSeed() first.');
  return db;
}

function toAppError(err) {
  const message = err.message ?? '';
  if (message.includes('UNIQUE constraint failed')) {
    return new AppError('ข้อมูลนี้มีอยู่แล้วในระบบ', 409);
  }
  if (
    message.includes('FOREIGN KEY constraint failed')
    || message.includes('CHECK constraint failed')
    || message.includes('NOT NULL constraint failed')
  ) {
    return new AppError('ข้อมูลที่ส่งมาไม่ถูกต้องหรืออ้างถึงข้อมูลที่ไม่มีอยู่', 400);
  }
  return err;
}

export async function loadSeed() {
  if (db) return;
  mkdirSync(path.dirname(DB_FILE), { recursive: true });
  db = new DatabaseSync(DB_FILE);
  db.exec('PRAGMA foreign_keys = ON');

  if (!existsSync(SCHEMA_FILE)) throw new Error(`ไม่พบ schema.sql ที่ ${SCHEMA_FILE}`);
  db.exec(readFileSync(SCHEMA_FILE, 'utf8'));
}

export function closeDatabase() {
  if (!db) return;
  db.close();
  db = undefined;
}

export function findAll({ status } = {}) {
  const database = requireDatabase();
  return status
    ? database.prepare(`${SELECT_SHAPE} WHERE r.status = ? ORDER BY r.id`).all(status)
    : database.prepare(`${SELECT_SHAPE} ORDER BY r.id`).all();
}

export function findById(id) {
  return requireDatabase().prepare(`${SELECT_SHAPE} WHERE r.id = ?`).get(id) ?? null;
}

function resolveUserId(name) {
  const database = requireDatabase();
  const found = database.prepare('SELECT id FROM users WHERE name = ?').get(name);
  if (found) return found.id;

  const email = `lab10-${randomUUID()}@rmutl.ac.th`;
  return database.prepare(
    'INSERT INTO users (name, department, email) VALUES (?, ?, ?)',
  ).run(name, 'ไม่ระบุ', email).lastInsertRowid;
}

function nextId() {
  const row = requireDatabase().prepare(
    "SELECT id FROM requests WHERE id GLOB 'REQ-[0-9]*'",
  ).all();
  const last = row.reduce((max, request) => {
    const match = /^REQ-(\d+)$/.exec(request.id);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `REQ-${String(last + 1).padStart(3, '0')}`;
}

export function create(input) {
  const database = requireDatabase();
  const id = nextId();
  database.exec('BEGIN');
  try {
    const requesterId = resolveUserId(input.requesterName.trim());
    database.prepare(`
      INSERT INTO requests (id, requester_id, request_type, location, details, priority)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      id,
      requesterId,
      input.requestType,
      input.location.trim(),
      input.details.trim(),
      input.priority ?? 'normal',
    );
    database.exec('COMMIT');
  } catch (err) {
    database.exec('ROLLBACK');
    throw toAppError(err);
  }
  return findById(id);
}

export function updateStatus(id, status) {
  const result = requireDatabase().prepare(
    'UPDATE requests SET status = ? WHERE id = ?',
  ).run(status, id);
  return result.changes ? findById(id) : null;
}

export function remove(id) {
  const target = findById(id);
  if (!target) return null;
  requireDatabase().prepare('DELETE FROM requests WHERE id = ?').run(id);
  return target;
}

export function findAllUsers() {
  return requireDatabase().prepare(
    'SELECT id, name, department FROM users ORDER BY id',
  ).all();
}

export function findUserRequests(userId) {
  const database = requireDatabase();
  const user = database.prepare('SELECT id FROM users WHERE id = ?').get(userId);
  if (!user) return null;
  return database.prepare(`${SELECT_SHAPE} WHERE r.requester_id = ? ORDER BY r.id`).all(userId);
}
