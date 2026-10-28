import { apiFetch, ApiError } from './apiClient.js';

export { ApiError };

export async function getRequests(options = {}) {
  if (options.scenario === 'error') throw new ApiError('LAB scenario: จำลองการโหลดไม่สำเร็จ', 500);
  if (options.scenario === 'empty') return [];

  const query = options.status ? `?status=${encodeURIComponent(options.status)}` : '';
  return apiFetch(`/api/requests${query}`);
}

export async function getRequestById(requestId) {
  try {
    return await apiFetch(`/api/requests/${encodeURIComponent(requestId)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function addRequest(requestInput) {
  return apiFetch('/api/requests', { method: 'POST', body: JSON.stringify(requestInput) });
}

export async function updateRequestStatus(requestId, status) {
  return apiFetch(`/api/requests/${encodeURIComponent(requestId)}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export async function deleteRequest(requestId) {
  await apiFetch(`/api/requests/${encodeURIComponent(requestId)}`, { method: 'DELETE' });
  return getRequests();
}

export async function resetRequests() {
  return getRequests();
}
