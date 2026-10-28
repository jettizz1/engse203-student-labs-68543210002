import { readFile, rename, writeFile } from 'node:fs/promises';

const SEED_PATH = new URL('../../data/initialRequests.json', import.meta.url);
const REQUESTS_PATH = new URL('../../data/requests.json', import.meta.url);

let requests = [];

async function persist(nextRequests) {
  const temporaryPath = new URL(`../../data/requests.${process.pid}.tmp`, import.meta.url);
  await writeFile(temporaryPath, `${JSON.stringify(nextRequests, null, 2)}\n`, 'utf8');
  await rename(temporaryPath, REQUESTS_PATH);
}

export async function loadSeed() {
  try {
    const raw = await readFile(REQUESTS_PATH, 'utf8');
    const storedRequests = JSON.parse(raw);
    if (!Array.isArray(storedRequests)) {
      throw new Error('ไฟล์ข้อมูลคำร้องต้องเป็น JSON array');
    }
    requests = storedRequests;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;

    const raw = await readFile(SEED_PATH, 'utf8');
    requests = JSON.parse(raw);
    await persist(requests);
  }
  return structuredClone(requests);
}

/**
 * TODO W06-S1 (CP02) · คืนรายการคำร้องทั้งหมด
 * - คืนสำเนาด้วย structuredClone() เพื่อไม่ให้ข้างนอกแก้ข้อมูลต้นฉบับ
 * TODO W06-S1b (⭐ Challenge) · ถ้ามี options.status ให้กรองเฉพาะสถานะนั้น
 */
export function findAll({ status } = {}) {
  if (!status) return structuredClone(requests);
  return structuredClone(requests.filter((r) => r.status === status));
}
/**
 * TODO W06-S2 (CP02) · คืนคำร้องใบเดียวตามรหัส
 * - ถ้าไม่พบให้คืน null (ห้าม throw — controller จะเป็นคนตัดสินว่าตอบ 404)
 */
export function findById(id) {
  const found = requests.find((r) => r.id === id);
  return found ? structuredClone(found) : null;
}

/** สร้างรหัสไม่ซ้ำ — ให้มาแล้ว ไม่ต้องแก้ */
function createId() {
  let id;
  do {
    const time = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    id = `REQ-${time}-${rand}`;
  } while (requests.some((r) => r.id === id));
  return id;
}

/**
 * TODO W06-S3 (CP04) · เพิ่มคำร้องใหม่
 * ลำดับ: สร้าง object ใหม่ (ใช้ createId()) → ตัดช่องว่างหัวท้ายทุก field ที่เป็นข้อความ
 *        → status เริ่มต้นเป็น 'pending' เสมอ → push เข้า requests → คืนสำเนา
 */
export async function create(input) {
  const newRequest = {
    id: createId(),
    requesterName: input.requesterName.trim(),
    requestType: input.requestType,
    location: input.location.trim(),
    details: input.details.trim(),
    priority: input.priority,
    status: 'pending',     // เริ่มต้นเป็น pending เสมอ
  };
  const nextRequests = [...requests, newRequest];
  await persist(nextRequests);
  requests = nextRequests;
  return structuredClone(newRequest);
}

/**
 * TODO W06-S4 (⭐ Challenge) · เปลี่ยนสถานะคำร้อง
 * - ไม่พบคืน null · พบแล้วเปลี่ยน status และคืนสำเนา
 */
export async function updateStatus(id, status) {
  const existing = requests.find((request) => request.id === id);
  if (!existing) return null;

  const updated = { ...existing, status };
  const nextRequests = requests.map((request) => (request.id === id ? updated : request));
  await persist(nextRequests);
  requests = nextRequests;
  return structuredClone(updated);
}

/**
 * TODO W06-S5 (CP05) · ลบคำร้องตามรหัส
 * - คืน true ถ้าลบได้จริง · คืน false ถ้าไม่พบรหัสนั้น
 * - ใช้ .filter() สร้าง array ใหม่ อย่าแก้ array เดิม
 */
export async function remove(id) {
  if (!requests.some((request) => request.id === id)) return false;

  const nextRequests = requests.filter((request) => request.id !== id);
  await persist(nextRequests);
  requests = nextRequests;
  return true;
}