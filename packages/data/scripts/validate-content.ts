import { relative, resolve } from 'node:path';
import { validateContent } from '../src/build';

const rootDir = process.cwd();
const contentRoot = resolve(rootDir, 'content');

async function main(): Promise<void> {
  const result = await validateContent(rootDir);
  for (const diagnostic of result.diagnostics) {
    const { file, line, column } = diagnostic.primary;
    console.error(
      `${file}:${line}:${column} ${diagnostic.severity} ${diagnostic.code} ${diagnostic.message}`,
    );
  }
  if (result.diagnostics.some((entry) => entry.severity === 'error')) process.exitCode = 1;
  console.log(
    `content:validate: ${result.fileCount} file(s), ${result.objectCount} object(s), ` +
      `${result.inkStoryCount} ink story(s), ${result.mapCount} map(s) valid under ` +
      `${relative(rootDir, contentRoot)}/`,
  );
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
