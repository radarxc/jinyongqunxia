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
  const entries = Object.entries(manifest).filter(([, item]) => item.isEntry);
  if (entries.length !== 1) throw new Error(`SIZE_ENTRY_COUNT:${entries.length}`);
  return entries[0];
}

const manifestEntries = Object.entries(manifest);
function sourceMatches(source, suffix) {
  const normalized = source.replaceAll('\\', '/');
  return normalized === suffix || normalized.endsWith(`/${suffix}`);
}

function findManifestChunk(
  name,
  {
    sources = [],
    manifestNames = [name],
    dynamicImporters = [],
    dynamicImporterNames = [],
    dynamicImporterKeys = [],
  } = {},
) {
  let candidates = manifestEntries.filter(([key, item]) =>
    sources.some((source) => sourceMatches(item.src ?? key, source)),
  );
  if (candidates.length === 0) {
    const importers = manifestEntries.filter(
      ([key, item]) =>
        dynamicImporterKeys.includes(key) ||
        dynamicImporterNames.includes(item.name) ||
        dynamicImporters.some((source) => sourceMatches(item.src ?? key, source)),
    );
    const dynamicKeys = new Set(importers.flatMap(([, item]) => item.dynamicImports ?? []));
    const dynamicTargets = manifestEntries.filter(([key]) => dynamicKeys.has(key));
    const namedTargets = dynamicTargets.filter(([, item]) => manifestNames.includes(item.name));
    candidates =
      namedTargets.length > 0 ? namedTargets : dynamicTargets.length === 1 ? dynamicTargets : [];
  }
  if (candidates.length === 0)
    candidates = manifestEntries.filter(([, item]) => manifestNames.includes(item.name));
  if (candidates.length > 1)
    throw new Error(`SIZE_MANIFEST_TARGET_AMBIGUOUS:${name}:${candidates.length}`);
  return candidates[0] ?? null;
}

function staticClosure(entryKey) {
  const seenEntries = new Set();
  const seenFiles = new Set();
  const addFile = (file) => {
    if (file.endsWith('.js')) seenFiles.add(file);
  };
  const visit = (key) => {
    if (seenEntries.has(key)) return;
    seenEntries.add(key);
    const item = manifest[key];
    if (!item) throw new Error(`SIZE_MANIFEST_IMPORT_MISSING:${key}`);
    addFile(item.file);
    for (const asset of item.assets ?? []) addFile(asset);
    for (const dependency of item.imports ?? []) visit(dependency);
  };
  visit(entryKey);
  return seenFiles;
}

function withoutFiles(files, excluded) {
  return new Set([...files].filter((file) => !excluded.has(file)));
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
const [entryKey, entry] = findEntry();
const entryFiles = staticClosure(entryKey);
const shellRecord = {
  name: 'entry',
  file: entry.file,
  size: await gzipFiles(entryFiles),
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

const targets = [
  {
    name: 'render',
    sources: ['packages/render/src/index.ts'],
    dynamicImporters: ['apps/game/src/render-host.ts'],
    dynamicImporterNames: ['render-host'],
    closure: true,
  },
  {
    name: 'render-webgpu',
    sources: ['packages/render/src/webgpu/index.ts'],
    dynamicImporters: ['apps/game/src/render-webgpu-host.ts'],
    dynamicImporterNames: ['render-webgpu-host'],
    closure: false,
  },
  {
    name: 'basis',
    sources: ['packages/render/src/basis/index.ts'],
    dynamicImporterNames: ['basis-host'],
    closure: false,
  },
  {
    name: 'devtools',
    sources: ['packages/devtools/src/index.ts'],
    dynamicImporterNames: ['devtools-host'],
    closure: false,
  },
];
const existingRecords = await Promise.all(
  targets.map(async (target) => {
    const located = findManifestChunk(target.name, target);
    if (!located)
      return {
        name: target.name,
        file: 'not emitted',
        size: null,
        budget: budgets.chunks[target.name],
      };
    const [key, item] = located;
    const files = target.closure
      ? withoutFiles(staticClosure(key), entryFiles)
      : new Set([item.file]);
    return {
      name: target.name,
      file: [...files].join(', '),
      size: await gzipFiles(files),
      budget: budgets.chunks[target.name],
      key,
    };
  }),
);
const renderRecord = existingRecords.find((record) => record.name === 'render');
const model3dTarget = findManifestChunk('render-model3d', {
  sources: ['packages/render/src/battle/model-stage.ts'],
  manifestNames: ['battle-model3d', 'render-model3d'],
});
if (!model3dTarget)
  existingRecords.push({
    name: 'render-model3d',
    file: 'not emitted',
    size: null,
    budget: budgets.chunks['render-model3d'],
  });
else {
  const [key] = model3dTarget;
  const alreadyBudgeted = new Set(entryFiles);
  if (renderRecord?.key)
    for (const file of staticClosure(renderRecord.key)) alreadyBudgeted.add(file);
  const files = withoutFiles(staticClosure(key), alreadyBudgeted);
  existingRecords.push({
    name: 'render-model3d',
    file: [...files].join(', '),
    size: await gzipFiles(files),
    budget: budgets.chunks['render-model3d'],
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
