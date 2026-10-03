import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const root = process.cwd();
const distDir = resolve(root, 'apps/game/dist');
const budgets = JSON.parse(await readFile(resolve(root, 'tools/perf/budgets.json'), 'utf8'));
const manifest = JSON.parse(await readFile(resolve(distDir, '.vite/manifest.json'), 'utf8'));
let sizeGroups;
try {
  sizeGroups = JSON.parse(await readFile(resolve(distDir, '.vite/size-groups.json'), 'utf8'));
} catch (error) {
  throw new Error('SIZE_SESSION_GROUP_MISSING:size-groups.json', { cause: error });
}

const gzipCache = new Map();
async function gzipKiB(file) {
  if (!gzipCache.has(file)) {
    const bytes = await readFile(resolve(distDir, file));
    gzipCache.set(file, gzipSync(bytes, { level: 9 }).byteLength / 1024);
  }
  return gzipCache.get(file);
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
    )
      return 0;
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

function readGroup(name) {
  if (sizeGroups.schemaVersion !== 'size-groups.v1')
    throw new Error('SIZE_SESSION_GROUP_INVALID:schemaVersion');
  const files = sizeGroups.groups?.[name];
  if (
    !Array.isArray(files) ||
    files.length === 0 ||
    files.some((file) => typeof file !== 'string' || !file.endsWith('.js'))
  )
    throw new Error(`SIZE_SESSION_GROUP_MISSING:${name}`);
  return files;
}

function readSubsystems() {
  const groups = sizeGroups.groups?.subsystems;
  if (!groups || typeof groups !== 'object' || Array.isArray(groups))
    throw new Error('SIZE_SUBSYSTEM_GROUP_MISSING:subsystems');
  const required = ['dialogue', 'region', 'battle', 'town'];
  for (const name of required) {
    const files = groups[name];
    if (
      !Array.isArray(files) ||
      files.length === 0 ||
      files.some((file) => typeof file !== 'string' || !file.endsWith('.js'))
    )
      throw new Error(`SIZE_SUBSYSTEM_GROUP_MISSING:${name}`);
  }
  const labels = { dialogue: '对话 / Ink', region: '区域', battle: '战斗', town: '城镇' };
  return required.map((name) => ({ name: labels[name], files: groups[name] }));
}

async function gzipFiles(files) {
  let total = 0;
  for (const file of new Set(files)) total += await gzipKiB(file);
  return total;
}

const emittedJs = (await readdir(resolve(distDir, 'assets'))).filter((file) =>
  file.endsWith('.js'),
);
const entry = findEntry();
const entryKey = Object.entries(manifest).find(([, item]) => item === entry)?.[0];
if (!entryKey) throw new Error('SIZE_ENTRY_KEY_MISSING');
const shellRecord = {
  name: 'entry',
  file: entry.file,
  size: await gzipClosure(entryKey, ['render-', 'render.', 'book-']),
  budget: budgets.chunks.entry,
};

const sessionParts = [
  { name: 'worker shell', files: readGroup('workerShell') },
  { name: 'session static', files: readGroup('sessionStatic') },
  { name: 'base content', files: readGroup('baseContent') },
];
const sessionFiles = new Set(sessionParts.flatMap((part) => part.files));
const measuredSessionParts = await Promise.all(
  sessionParts.map(async (part) => ({ ...part, size: await gzipFiles(part.files) })),
);
const sessionRecord = {
  name: 'session total',
  file: [...sessionFiles].join(', '),
  size: await gzipFiles(sessionFiles),
  budget: budgets.chunks.session,
};
const subsystemRecords = await Promise.all(
  readSubsystems().map(async ({ name, files }) => {
    const incremental = files.filter((file) => !sessionFiles.has(file));
    return { name, file: incremental.join(', '), size: await gzipFiles(incremental), budget: null };
  }),
);

const existingRecords = [];
for (const name of ['render', 'render-webgpu', 'basis', 'devtools']) {
  const file = emittedJs.find(
    (candidate) => candidate === `${name}.js` || candidate.startsWith(`${name}-`),
  );
  existingRecords.push({
    name,
    file: file ?? 'not emitted',
    size: file ? await gzipKiB(`assets/${file}`) : null,
    budget: budgets.chunks[name],
  });
}
const bookFiles = emittedJs.filter((file) => file.startsWith('book-'));
if (bookFiles.length === 0)
  existingRecords.push({
    name: 'book-*',
    file: 'not emitted',
    size: null,
    budget: budgets.content.chapterRulesAndLocale,
  });
else
  for (const file of bookFiles)
    existingRecords.push({
      name: file.replace(/-[A-Za-z0-9_-]+\.js$/, ''),
      file,
      size: await gzipKiB(`assets/${file}`),
      budget: budgets.content.chapterRulesAndLocale,
    });

const format = (value) => (value === null ? '—' : value.toFixed(2));
let failed = false;
function printHeader(title) {
  console.log(`\n${title}`);
  console.log('chunk            gzip KiB   budget KiB   status');
  console.log('---------------  ---------  -----------  ------');
}
function printRecord(record) {
  const status =
    record.status ??
    (record.size === null
      ? 'not emitted'
      : record.budget === null
        ? '未设门'
        : record.size <= record.budget
          ? 'PASS'
          : 'FAIL');
  if (status === 'FAIL') failed = true;
  console.log(
    `${record.name.padEnd(15)}  ${format(record.size).padStart(9)}  ${String(record.budget ?? '—').padStart(11)}  ${status}`,
  );
}

printHeader(`标题页 entry 闭包（预算 ${budgets.chunks.entry} KiB gzip）`);
printRecord(shellRecord);
for (const record of existingRecords) printRecord(record);
const renderSize = existingRecords.find((record) => record.name === 'render')?.size ?? 0;
const routeRecord = {
  name: 'webgl total',
  size: shellRecord.size + renderSize,
  budget: budgets.routes.webglEntryAndRender,
};
printRecord(routeRecord);
const webgpuSize = existingRecords.find((record) => record.name === 'render-webgpu')?.size;
if (webgpuSize !== null && webgpuSize !== undefined)
  printRecord({
    name: 'webgpu total',
    size: shellRecord.size + webgpuSize,
    budget: budgets.routes.webgpuEntryAndRender,
  });

printHeader(`首次会话闭包（预算 ${budgets.chunks.session} KiB gzip）`);
for (const part of measuredSessionParts) printRecord({ ...part, budget: null, status: '计入合计' });
printRecord(sessionRecord);

printHeader('子系统块（只报告，未设门；为首次会话后的增量静态闭包）');
for (const record of subsystemRecords) printRecord(record);
if (failed) process.exitCode = 1;
