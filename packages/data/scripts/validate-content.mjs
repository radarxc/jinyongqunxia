import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';

const root = resolve(process.cwd(), 'content');
let checked = 0;

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === '_drafts') continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (extname(entry.name) === '.json') {
      JSON.parse(await readFile(path, 'utf8'));
      checked += 1;
    }
  }
}

await walk(root);
console.log(
  `content:validate: ${checked} JSON file(s) valid under ${relative(process.cwd(), root)}/`,
);
