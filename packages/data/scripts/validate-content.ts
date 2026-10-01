import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';
import { loadContent, type ContentFile } from '../src/tooling';

const root = resolve(process.cwd(), 'content');
const supported = new Set(['.json', '.yaml', '.yml']);
const files: ContentFile[] = [];

async function discover(directory: string): Promise<void> {
  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((left, right) =>
    left.name < right.name ? -1 : left.name > right.name ? 1 : 0,
  );
  for (const entry of entries) {
    if (entry.name === '_drafts' || entry.name === '.schema') continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await discover(path);
    else if (supported.has(extname(entry.name).toLowerCase())) {
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
console.log(
  `content:validate: ${registry.entries.length} file(s), ${registry.entries.length} object(s) valid under ${relative(process.cwd(), root)}/`,
);
