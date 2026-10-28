#!/usr/bin/env node
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const results = [];

async function read(relativePath) {
  try {
    return await readFile(path.join(ROOT, relativePath), 'utf8');
  } catch {
    return '';
  }
}

function check(name, passed, detail = '') {
  results.push({ name, passed: Boolean(passed), detail });
}

const requiredFiles = [
  'index.html',
  'src/main.jsx',
  'src/App.jsx',
  'src/styles.css',
  'src/pages/DashboardPage.jsx',
  'src/pages/NewRequestPage.jsx',
  'src/pages/RequestDetailPage.jsx',
  'src/services/apiClient.js',
  'src/services/requestService.js',
  'src/services/requestStorage.js',
  'src/data/initialRequests.json',
  'public/data/initialRequests.json',
];
for (const file of requiredFiles) check(`file ${file}`, Boolean(await read(file)));

const packageJson = JSON.parse(await read('package.json'));
const appSource = await read('src/App.jsx');
const formSource = await read('src/components/RequestForm.jsx');
check('React app uses HashRouter for static hosting', /<HashRouter>/.test(await read('src/main.jsx')));
check('routes include dashboard, detail, create, and about', [
  'requests/new', 'requests/:requestId', 'about',
].every((route) => appSource.includes(`path="${route}"`)));
check('API client handles non-2xx and 204 responses', /response\.ok/.test(await read('src/services/apiClient.js'))
  && /response\.status === 204/.test(await read('src/services/apiClient.js')));
check('all network calls stay in apiClient', !/\bfetch\s*\(/.test(await read('src/services/requestService.js')));

const service = await read('src/services/requestService.js');
check('service exports complete CRUD and demo reset', [
  'getRequests', 'getRequestById', 'addRequest', 'updateRequestStatus', 'deleteRequest', 'resetRequests',
].every((name) => service.includes(`export async function ${name}`)));
check('service supports API and standalone demo modes', /VITE_DEMO_MODE/.test(service)
  && /apiFetch\('\/api\/requests'/.test(service)
  && /readStoredRequests\(\)/.test(service));
check('storage is accessed only through requestStorage', !/localStorage\s*\./.test(service)
  && /localStorage\s*\./.test(await read('src/services/requestStorage.js')));
check('form request types match API database constraints', [
  'แจ้งซ่อม', 'บริการบัญชีผู้ใช้', 'ขอใช้อุปกรณ์', 'อื่น ๆ',
].every((type) => formSource.includes(`value="${type}"`)));
check('detail page can update request status through service', /updateRequestStatus/.test(await read('src/pages/RequestDetailPage.jsx')));
check('Pages UI states that API and SQLite require separate hosting', /SQLite ต้องรัน API แยกต่างหาก/.test(await read('src/pages/AppLayout.jsx'))
  && /ไม่ได้ถูก deploy หรือโฮสต์บน GitHub Pages/.test(await read('src/pages/AboutPage.jsx')));
check('Pages production build script selects pages mode', packageJson.scripts?.['build:pages'] === 'vite build --mode pages'
  && Boolean(await read('.env.pages')));
check('Vite uses a relative base for repository subpaths', /base\s*:\s*['"]\.\/['"]/.test(await read('vite.config.js')));

const pendingTodoFiles = ['src', 'scripts'];
for (const directory of pendingTodoFiles) {
  const entries = await readdir(path.join(ROOT, directory), { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !/\.(js|jsx|mjs)$/.test(entry.name)) continue;
    const source = await read(path.join(directory, entry.name));
    check(`${directory}/${entry.name} has no unfinished TODO throws`, !/throw\s+new Error\s*\(\s*['"`]TODO/.test(source));
  }
}

const failures = results.filter((result) => !result.passed);
for (const result of results) {
  console.log(`${result.passed ? '✅' : '❌'} ${result.name}${result.detail ? ` — ${result.detail}` : ''}`);
}
console.log(`\nLAB10 frontend checker: ${results.length - failures.length}/${results.length} passed`);
if (failures.length) process.exitCode = 1;
