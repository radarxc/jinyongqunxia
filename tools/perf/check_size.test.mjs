import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const workspaces = [];
afterEach(async () => {
  await Promise.all(workspaces.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

describe('chunk size gate', () => {
  it('counts the static import closure against the entry budget', async () => {
    const root = await mkdtemp(join(tmpdir(), 'tianshu-size-'));
    workspaces.push(root);
    await mkdir(join(root, 'apps/game/dist/.vite'), { recursive: true });
    await mkdir(join(root, 'apps/game/dist/assets'), { recursive: true });
    await mkdir(join(root, 'tools/perf'), { recursive: true });
    const manifest = {
      'src/main.ts': { file: 'assets/entry-a.js', isEntry: true, imports: ['_core.js'] },
      '_core.js': { file: 'assets/core-a.js' },
    };
    const noisy = Array.from(
      { length: 2_000 },
      (_, index) => `${index.toString(36)}-${Math.imul(index, 2_654_435_761).toString(36)}`,
    ).join(',');
    await writeFile(join(root, 'apps/game/dist/.vite/manifest.json'), JSON.stringify(manifest));
    await writeFile(join(root, 'apps/game/dist/assets/entry-a.js'), 'import "./core-a.js";');
    await writeFile(join(root, 'apps/game/dist/assets/core-a.js'), noisy);
    await writeBudgets(root);
    const script = new URL('./check_size.mjs', import.meta.url);
    const result = spawnSync(process.execPath, [script.pathname], { cwd: root, encoding: 'utf8' });
    expect(result.status, result.stdout + result.stderr).toBe(1);
  });

  it('counts entry assets such as the core worker', async () => {
    const root = await mkdtemp(join(tmpdir(), 'tianshu-size-'));
    workspaces.push(root);
    await mkdir(join(root, 'apps/game/dist/.vite'), { recursive: true });
    await mkdir(join(root, 'apps/game/dist/assets'), { recursive: true });
    await mkdir(join(root, 'tools/perf'), { recursive: true });
    const manifest = {
      'src/main.ts': {
        file: 'assets/entry-a.js',
        isEntry: true,
        assets: ['assets/core-worker-a.js'],
      },
    };
    const noisy = Array.from(
      { length: 2_000 },
      (_, index) => `${index.toString(36)}-${Math.imul(index, 2_654_435_761).toString(36)}`,
    ).join(',');
    await writeFile(join(root, 'apps/game/dist/.vite/manifest.json'), JSON.stringify(manifest));
    await writeFile(join(root, 'apps/game/dist/assets/entry-a.js'), 'export{};');
    await writeFile(join(root, 'apps/game/dist/assets/core-worker-a.js'), noisy);
    await writeBudgets(root);
    const script = new URL('./check_size.mjs', import.meta.url);
    const result = spawnSync(process.execPath, [script.pathname], { cwd: root, encoding: 'utf8' });
    expect(result.status, result.stdout + result.stderr).toBe(1);
  });
});

async function writeBudgets(root) {
  await writeFile(
    join(root, 'tools/perf/budgets.json'),
    JSON.stringify({
      chunks: { entry: 0.1, render: 180, 'render-webgpu': 300, basis: 255, devtools: 130 },
      routes: { webglEntryAndRender: 350, webgpuEntryAndRender: 470 },
      content: { chapterRulesAndLocale: 1_536 },
    }),
  );
}
