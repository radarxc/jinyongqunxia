import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..'); const dist = join(root, 'dist');
const fail = message => { throw new Error(`OFFLINE_CHECK:${message}`); };
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const swName = (await readdir(dist)).find(name => name === 'sw.js');
if (!swName) fail('missing sw.js');
const sw = await readFile(join(dist, swName), 'utf8');
const manifestSource = /(\[\{"revision":(?:null|"[^"]*"),"url":"[^"]+"\}.*?\])(?:,|\))/u.exec(sw)?.[1];
if (!manifestSource) fail('cannot parse precache manifest');
const precache = JSON.parse(manifestSource);
if (new Set(precache.map(entry => entry.url)).size !== precache.length) fail('duplicate precache URL');
for (const required of ['index.html', 'manifest.webmanifest'])
  if (precache.filter(entry => entry.url === required).length !== 1) fail(`required shell ${required}`);
const version = JSON.parse(await readFile(join(dist, 'version.json'), 'utf8'));
const versionHash = version.releaseHash;
const md5 = bytes => createHash('md5').update(bytes).digest('hex');
for (const entry of precache) {
  const url = String(entry.url);
  if (url.includes('/assets/default/') || url.startsWith('content/') || /(?:^|\/)book-/u.test(url) ||
      /(?:^|\/)vfx-/u.test(url) || /(?:^|\/)rig-demo(?:-|\.|\/|$)/u.test(url)) fail(`precache ${url}`);
  if (!/\.(?:js|css|html|wasm|woff2|svg|webmanifest)$/u.test(url)) fail(`non-shell precache ${url}`);
  if (entry.revision === null && !/(?:^|\/)[^/]+-[A-Za-z0-9_-]{8,}\.(?:js|css|wasm|woff2|svg)$/u.test(url))
    fail(`uncache-busted shell ${url}`);
  const local = await readFile(join(dist, url));
  if (entry.revision !== null && entry.revision !== digest(local) && entry.revision !== md5(local) &&
      !(url === 'index.html' && entry.revision === `${md5(local)}-${versionHash}`))
    fail(`precache revision ${url}`);
}
const offlineDir = join(dist, 'offline');
const closures = (await readdir(offlineDir)).filter(name => /^closure\..+\.json$/u.test(name)).sort();
if (closures.length === 0) fail('missing closures');
for (const name of closures) {
  const closure = JSON.parse(await readFile(join(offlineDir, name), 'utf8'));
  let total = 0;
  for (const file of closure.files) {
    const bytes = await readFile(join(dist, file.url.slice(1)));
    if (bytes.byteLength !== file.bytes || digest(bytes) !== file.sha256) fail(`hash ${file.url}`);
    if (file.bytes > 8 * 1024 * 1024) fail(`file budget ${file.url}`); total += file.bytes;
  }
  if (!closure.files.some(file => file.url === '/content/index.json' && file.kind === 'manifest'))
    fail(`missing content root ${name}`);
  if (total !== closure.totals.bytes) fail(`total ${name}`);
  if (closure.totals.enterBytes > 60 * 1024 * 1024) {
    const message = `enter budget ${closure.chapter}:${closure.totals.enterBytes}`;
    if (closure.chapter.startsWith('ch00_')) console.warn(`OFFLINE_CHECK:${message}`); else fail(message);
  }
}
if (!/^[a-f0-9]{64}$/u.test(version.releaseHash)) fail('version hash');
if (!/^[a-f0-9]{64}$/u.test(version.assetsHash)) fail('assets hash');
if (!sw.includes(version.releaseHash)) fail('service worker is not bound to version hash');
for (const icon of ['pwa-192x192.png', 'pwa-512x512.png', 'apple-touch-icon-180x180.png'])
  if ((await stat(join(dist, icon))).size === 0) fail(`empty icon ${icon}`);
const manifest = JSON.parse(await readFile(join(dist, 'manifest.webmanifest'), 'utf8'));
if (!manifest.icons?.some(icon => icon.sizes === '192x192') ||
    !manifest.icons?.some(icon => icon.sizes === '512x512') || !manifest.display_override) fail('manifest install fields');
const headers = await readFile(join(dist, '_headers'), 'utf8');
if (!headers.includes('/sw.js\n  Cache-Control: no-cache') ||
    !headers.includes('/version.json\n  Cache-Control: no-cache')) fail('no-cache headers');
if ((await stat(join(dist, 'index.html'))).size === 0) fail('empty index');
console.log(`offline check ok: ${closures.length} closures, ${precache.length} shell entries`);
