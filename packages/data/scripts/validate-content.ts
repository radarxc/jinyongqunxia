import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';
import { loadContent, type ContentFile } from '../src/tooling';
import { validateTiledMaps } from '../src/build';

const root = resolve(process.cwd(), 'content');
const supported = new Set(['.json', '.yaml', '.yml']);
const nonDefinitionDirectories = new Set(['migrations', 'locales']);
const files: ContentFile[] = [];
const tiled: { path: string; absolutePath: string; text: string }[] = [];

async function discover(directory: string): Promise<void> {
  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((left, right) =>
    left.name < right.name ? -1 : left.name > right.name ? 1 : 0,
  );
  for (const entry of entries) {
    if (entry.name === '_drafts' || entry.name === '.schema' ||
        (directory === root && nonDefinitionDirectories.has(entry.name))) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await discover(path);
    else if (entry.name.endsWith('.tmj')) {
      tiled.push({ path: relative(process.cwd(), path).replaceAll('\\', '/'), absolutePath: path,
        text: await readFile(path, 'utf8') });
    } else if (supported.has(extname(entry.name).toLowerCase())) {
      files.push({
        path: relative(process.cwd(), path).replaceAll('\\', '/'),
        text: await readFile(path, 'utf8'),
      });
    }
  }
}

await discover(root);
if (files.length === 0) throw new TypeError('CONTENT_EMPTY: no supported production content');
const registry = loadContent(files);
const mapDiagnostics = await validateTiledMaps(tiled);
for (const diagnostic of mapDiagnostics) {
  const { file, line, column } = diagnostic.primary;
  console.error(`${file}:${line}:${column} ${diagnostic.severity} ${diagnostic.code} ${diagnostic.message}`);
}
if (mapDiagnostics.some((entry) => entry.severity === 'error')) process.exitCode = 1;
console.log(
  `content:validate: ${registry.entries.length + tiled.length} file(s), ${registry.entries.length} object(s), ` +
  `${tiled.length} map(s) valid under ${relative(process.cwd(), root)}/`,
);
