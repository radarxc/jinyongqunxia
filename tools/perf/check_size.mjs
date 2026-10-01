import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const root = process.cwd();
const distDir = resolve(root, 'apps/game/dist');
const budgetPath = resolve(root, 'tools/perf/budgets.json');
const budgets = JSON.parse(await readFile(budgetPath, 'utf8'));
const manifest = JSON.parse(await readFile(resolve(distDir, '.vite/manifest.json'), 'utf8'));
const records = [];

async function gzipKiB(file) {
  const bytes = await readFile(resolve(distDir, file));
  return gzipSync(bytes, { level: 9 }).byteLength / 1024;
}

function findEntry() {
  const entries = Object.values(manifest).filter((item) => item.isEntry);
  if (entries.length !== 1) throw new Error(`SIZE_ENTRY_COUNT:${entries.length}`);
  return entries[0];
}

async function gzipClosure(entryKey, excludedPrefixes = []) {
  const seenEntries = new Set();
  const seenFiles = new Set();
  const addFile = async (file) => {
    const fileName = file.split('/').at(-1) ?? file;
    if (
      !file.endsWith('.js') ||
      seenFiles.has(file) ||
      excludedPrefixes.some((prefix) => fileName.startsWith(prefix))
    ) {
      return 0;
    }
    seenFiles.add(file);
    return gzipKiB(file);
  };
  const visit = async (key) => {
    if (seenEntries.has(key)) return 0;
    seenEntries.add(key);
    const item = manifest[key];
    if (!item) throw new Error(`SIZE_MANIFEST_IMPORT_MISSING:${key}`);
    const fileName = item.file.split('/').at(-1) ?? item.file;
    if (excludedPrefixes.some((prefix) => fileName.startsWith(prefix))) return 0;
    let total = await addFile(item.file);
    for (const asset of item.assets ?? []) total += await addFile(asset);
    for (const dependency of item.imports ?? []) total += await visit(dependency);
    return total;
  };
  return visit(entryKey);
}

const emittedJs = (await readdir(resolve(distDir, 'assets'))).filter((file) =>
  file.endsWith('.js'),
);
const entry = findEntry();
const entryKey = Object.entries(manifest).find(([, item]) => item === entry)?.[0];
if (!entryKey) throw new Error('SIZE_ENTRY_KEY_MISSING');
records.push({
  name: 'entry',
  file: entry.file,
  size: await gzipClosure(entryKey, ['render-', 'render.', 'book-']),
  budget: budgets.chunks.entry,
});

for (const name of ['render', 'render-webgpu', 'basis', 'devtools']) {
  const file = emittedJs.find(
    (candidate) => candidate === `${name}.js` || candidate.startsWith(`${name}-`),
  );
  records.push({
    name,
    file: file ?? 'not emitted',
    size: file ? await gzipKiB(`assets/${file}`) : null,
    budget: budgets.chunks[name],
  });
}

const bookFiles = emittedJs.filter((file) => file.startsWith('book-'));
if (bookFiles.length === 0) {
  records.push({
    name: 'book-*',
    file: 'not emitted',
    size: null,
    budget: budgets.content.chapterRulesAndLocale,
  });
} else {
  for (const file of bookFiles) {
    records.push({
      name: file.replace(/-[A-Za-z0-9_-]+\.js$/, ''),
      file,
      size: await gzipKiB(`assets/${file}`),
      budget: budgets.content.chapterRulesAndLocale,
    });
  }
}

const format = (value) => (value === null ? '—' : value.toFixed(2));
console.log('chunk            gzip KiB   budget KiB   status');
console.log('---------------  ---------  -----------  ------');
let failed = false;
for (const record of records) {
  const status =
    record.size === null ? 'not emitted' : record.size <= record.budget ? 'PASS' : 'FAIL';
  if (status === 'FAIL') failed = true;
  console.log(
    `${record.name.padEnd(15)}  ${format(record.size).padStart(9)}  ${String(record.budget).padStart(11)}  ${status}`,
  );
}

const entrySize = records.find((record) => record.name === 'entry')?.size ?? 0;
const renderSize = records.find((record) => record.name === 'render')?.size ?? 0;
const routeTotal = entrySize + renderSize;
const routeBudget = budgets.routes.webglEntryAndRender;
const routeStatus = routeTotal <= routeBudget ? 'PASS' : 'FAIL';
if (routeStatus === 'FAIL') failed = true;
console.log(
  `${'webgl total'.padEnd(15)}  ${routeTotal.toFixed(2).padStart(9)}  ${String(routeBudget).padStart(11)}  ${routeStatus}`,
);
const webgpuSize = records.find((record) => record.name === 'render-webgpu')?.size;
if (webgpuSize !== null && webgpuSize !== undefined) {
  const webgpuTotal = entrySize + webgpuSize;
  const webgpuBudget = budgets.routes.webgpuEntryAndRender;
  const webgpuStatus = webgpuTotal <= webgpuBudget ? 'PASS' : 'FAIL';
  if (webgpuStatus === 'FAIL') failed = true;
  console.log(
    `${'webgpu total'.padEnd(15)}  ${webgpuTotal.toFixed(2).padStart(9)}  ${String(webgpuBudget).padStart(11)}  ${webgpuStatus}`,
  );
}
if (failed) process.exitCode = 1;
