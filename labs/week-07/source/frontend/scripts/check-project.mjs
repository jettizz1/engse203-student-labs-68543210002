#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as service from '../src/services/requestService.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read = (file) => readFile(path.join(root, file), 'utf8');
const checks = [];

async function check(name, run) {
  try {
    await run();
    checks.push({ name, ok: true });
  } catch (error) {
    checks.push({ name, ok: false, error });
  }
}

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() { return body; },
  };
}

const originalFetch = globalThis.fetch;
try {
  await check('GET requests uses API and supports encoded status filters', async () => {
    let url = '';
    globalThis.fetch = async (target) => {
      url = target;
      return jsonResponse([{ id: 'REQ-001' }]);
    };
    assert.deepEqual(await service.getRequests({ status: 'in progress&urgent' }), [{ id: 'REQ-001' }]);
    assert.match(url, /\/api\/requests\?status=in%20progress%26urgent$/);
  });

  await check('empty and error scenarios remain available for UI states', async () => {
    assert.deepEqual(await service.getRequests({ scenario: 'empty' }), []);
    await assert.rejects(service.getRequests({ scenario: 'error' }), (error) => error.status === 500);
  });

  await check('GET request detail maps 404 to null', async () => {
    globalThis.fetch = async () => jsonResponse({ error: 'missing' }, 404);
    assert.equal(await service.getRequestById('unknown/id'), null);
  });

  await check('POST creates a request using JSON', async () => {
    let init;
    globalThis.fetch = async (_url, options) => {
      init = options;
      return jsonResponse({ id: 'REQ-NEW', status: 'pending' }, 201);
    };
    const body = { requesterName: 'Tester' };
    assert.deepEqual(await service.addRequest(body), { id: 'REQ-NEW', status: 'pending' });
    assert.equal(init.method, 'POST');
    assert.equal(JSON.parse(init.body).requesterName, 'Tester');
  });

  await check('PUT updates status and DELETE reloads server data', async () => {
    const calls = [];
    globalThis.fetch = async (url, options = {}) => {
      calls.push({ url, options });
      return options.method === 'DELETE'
        ? jsonResponse(null, 204)
        : jsonResponse([{ id: 'REQ-001', status: 'completed' }]);
    };
    assert.deepEqual(await service.updateRequestStatus('REQ/001', 'completed'), [{ id: 'REQ-001', status: 'completed' }]);
    assert.equal(calls[0].options.method, 'PUT');
    assert.deepEqual(JSON.parse(calls[0].options.body), { status: 'completed' });
    assert.deepEqual(await service.deleteRequest('REQ-001'), [{ id: 'REQ-001', status: 'completed' }]);
    assert.equal(calls[1].options.method, 'DELETE');
  });

  await check('API client reports offline and HTTP errors with status codes', async () => {
    globalThis.fetch = async () => { throw new Error('offline'); };
    await assert.rejects(service.getRequests(), (error) => error.status === 0);
    globalThis.fetch = async () => jsonResponse({ error: 'invalid' }, 400);
    await assert.rejects(service.getRequests(), (error) => error.status === 400 && error.message === 'invalid');
  });

  await check('React pages expose loading/error states and status update control', async () => {
    const dashboard = await read('src/pages/DashboardPage.jsx');
    const detail = await read('src/pages/RequestDetailPage.jsx');
    assert.match(dashboard, /loadState === 'loading'/);
    assert.match(dashboard, /loadState === 'error'/);
    assert.match(detail, /updateRequestStatus/);
    assert.match(detail, /request-status/);
  });
} finally {
  globalThis.fetch = originalFetch;
}

const failed = checks.filter((entry) => !entry.ok);
checks.forEach(({ name, ok, error }) => console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${error ? ` — ${error.message}` : ''}`));
console.log(`LAB07 frontend checks: ${checks.length - failed.length}/${checks.length} pass`);
if (failed.length) process.exitCode = 1;
