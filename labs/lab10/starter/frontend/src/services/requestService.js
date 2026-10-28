import { apiFetch, ApiError } from './apiClient.js';
import { clearStoredRequests, readStoredRequests, writeStoredRequests } from './requestStorage.js';
import initialRequests from '../data/initialRequests.json';

/**
 * Week 07 — เปลี่ยนจากอ่าน localStorage เป็นเรียก API จริง
 *
 * สังเกตว่า signature ของทุกฟังก์ชันเหมือนเดิมทุกตัว
 * → DashboardPage, RequestDetailPage, NewRequestPage ไม่ต้องแก้เลย
 * นี่คือประโยชน์ของ Service Layer ที่เราสร้างไว้ตั้งแต่ Week 05
 */

export { ApiError };

export const DEMO_MODE = import.meta.env?.VITE_DEMO_MODE === 'true';

function readDemoRequests() {
  const stored = readStoredRequests();
  if (stored.status === 'valid') return stored.requests;
  if (stored.status === 'invalid') clearStoredRequests();
  const seed = structuredClone(initialRequests);
  writeStoredRequests(seed);
  return seed;
}

function saveDemoRequests(requests) {
  writeStoredRequests(requests);
  return structuredClone(requests);
}

export async function getRequests(options = {}) {
  // scenario ยังใช้ได้เหมือนเดิม เพื่อให้ทดสอบสถานะต่าง ๆ ได้โดยไม่ต้องแกล้ง API
  if (options.scenario === 'error') {
    throw new ApiError('LAB scenario: จำลองการโหลดข้อมูลไม่สำเร็จ', 500);
  }
  if (options.scenario === 'empty') return [];

  if (DEMO_MODE) {
    const requests = readDemoRequests();
    return options.status ? requests.filter((request) => request.status === options.status) : requests;
  }

  const query = options.status ? `?status=${encodeURIComponent(options.status)}` : '';
  return apiFetch(`/api/requests${query}`);
}

export async function getRequestById(requestId) {
  if (DEMO_MODE) {
    return readDemoRequests().find((request) => request.id === requestId) ?? null;
  }
  try {
    return await apiFetch(`/api/requests/${encodeURIComponent(requestId)}`);
  } catch (error) {
    // 404 ไม่ใช่ความผิดพลาดของระบบ — แปลว่าไม่มีคำร้องรหัสนี้
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function addRequest(requestInput) {
  if (DEMO_MODE) {
    const requests = readDemoRequests();
    const nextNumber = requests.reduce((max, request) => {
      const match = /^REQ-(\d+)$/.exec(request.id);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0) + 1;
    const created = {
      ...requestInput,
      id: `REQ-${String(nextNumber).padStart(3, '0')}`,
      status: 'pending',
    };
    saveDemoRequests([...requests, created]);
    return created;
  }
  return apiFetch('/api/requests', {
    method: 'POST',
    body: JSON.stringify(requestInput),
  });
}

export async function updateRequestStatus(requestId, status) {
  if (DEMO_MODE) {
    const requests = readDemoRequests();
    const index = requests.findIndex((request) => request.id === requestId);
    if (index < 0) return null;
    requests[index] = { ...requests[index], status };
    saveDemoRequests(requests);
    return requests[index];
  }
  return apiFetch(`/api/requests/${encodeURIComponent(requestId)}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export async function deleteRequest(requestId) {
  if (DEMO_MODE) {
    return getRequests().then((requests) => saveDemoRequests(
      requests.filter((request) => request.id !== requestId),
    ));
  }
  await apiFetch(`/api/requests/${encodeURIComponent(requestId)}`, { method: 'DELETE' });
  // คืนรายการล่าสุดจากเซิร์ฟเวอร์ เพื่อให้หน้าจอตรงกับข้อมูลจริงเสมอ
  return getRequests();
}

export async function resetRequests() {
  if (DEMO_MODE) {
    return saveDemoRequests(structuredClone(initialRequests));
  }
  // Week 07 ยังไม่มี endpoint reset — โหลดรายการปัจจุบันกลับมาแทน
  return getRequests();
}
