import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const workspaces = [];
afterEach(async () => {
  await Promise.all(workspaces.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

async function fixture(options = {}) {
  const root = await mkdtemp(join(tmpdir(), 'tianshu-size-'));
  workspaces.push(root);
  await mkdir(join(root, 'apps/game/dist/.vite'), { recursive: true });
  await mkdir(join(root, 'apps/game/dist/assets'), { recursive: true });
  await mkdir(join(root, 'tools/perf'), { recursive: true });
  const manifest = options.manifest ?? {
    'src/main.ts': {
      file: 'assets/entry.js',
      isEntry: true,
      imports: ['_shell.js'],
      assets: options.entryAssets ?? [],
    },
    '_shell.js': { file: 'assets/shell.js' },
  };
  const groups = options.groups ?? {
    schemaVersion: 'size-groups.v1',
    groups: {
      workerShell: ['assets/worker.js'],
      sessionStatic: ['assets/session.js', 'assets/shared.js'],
      baseContent: ['assets/content.js'],
      subsystems: {
        dialogue: ['assets/dialogue.js', 'assets/shared.js'],
        region: ['assets/region.js'],
        battle: ['assets/battle.js'],
        town: ['assets/town.js'],
      },
    },
  };
  await writeFile(join(root, 'apps/game/dist/.vite/manifest.json'), JSON.stringify(manifest));
  if (groups)
    await writeFile(join(root, 'apps/game/dist/.vite/size-groups.json'), JSON.stringify(groups));
  const noisy = Array.from(
    { length: options.noisyLines ?? 20 },
    (_, index) => `${index.toString(36)}-${Math.imul(index, 2_654_435_761).toString(36)}`,
  ).join(',');
  const files = {
    entry: 'export{};',
    shell: 'export{};',
    worker: 'export{};',
    session: noisy,
    shared: 'export{};',
    content: 'export{};',
    dialogue: noisy,
    region: 'export{};',
    battle: 'export{};',
    town: 'export{};',
    ...(options.files ?? {}),
  };
  for (const [name, value] of Object.entries(files))
    await writeFile(join(root, `apps/game/dist/assets/${name}.js`), value);
  await writeFile(
    join(root, 'tools/perf/budgets.json'),
    JSON.stringify({
      chunks: {
        entry: options.entryBudget ?? 170,
        session: options.sessionBudget ?? 110,
        render: options.renderBudget ?? 180,
        'render-model3d': options.model3dBudget ?? 24,
        'render-webgpu': 300,
        basis: 255,
        devtools: 130,
      },
      routes: { webglEntryAndRender: 350, webgpuEntryAndRender: 470 },
      content: { chapterRulesAndLocale: 1_536 },
    }),
  );
  return root;
}

function run(root) {
  const script = new URL('./check_size.mjs', import.meta.url);
  const env = { ...process.env };
  delete env.NODE_OPTIONS;
  return spawnSync(process.execPath, [script.pathname], { cwd: root, env, encoding: 'utf8' });
}

describe('three-level size gate', () => {
  it('reports the title, first-session components, and subsystem-only increments', async () => {
    const root = await fixture();
    const result = run(root);
    expect(result.status, result.stdout + result.stderr).toBe(0);
    expect(result.stdout).toContain('标题页 entry 闭包（预算 170 KiB gzip）');
    expect(result.stdout).toMatch(/render-model3d\s+—\s+24\s+not emitted/);
    expect(result.stdout).toContain('首次会话闭包（预算 110 KiB gzip）');
    expect(result.stdout).toMatch(
      /worker shell[\s\S]*session static[\s\S]*base content[\s\S]*session total/,
    );
    expect(result.stdout).toMatch(/worker shell\s+\d+\.\d+\s+—\s+计入合计/);
    expect(result.stdout).toContain('子系统块（只报告，未设门');
    expect(result.stdout).toMatch(/对话 \/ Ink\s+\d+\.\d+\s+—\s+未设门/);
  });

  it('fails when the first-session closure exceeds 110 KiB', async () => {
    const root = await fixture({ noisyLines: 40_000 });
    const result = run(root);
    expect(result.status, result.stdout + result.stderr).toBe(1);
    expect(result.stdout).toMatch(/session total\s+\d+\.\d+\s+110\s+FAIL/);
  });

  it.each([
    ['workerShell', 'SIZE_SESSION_GROUP_MISSING:workerShell'],
    ['sessionStatic', 'SIZE_SESSION_GROUP_MISSING:sessionStatic'],
    ['baseContent', 'SIZE_SESSION_GROUP_MISSING:baseContent'],
  ])('fails closed when %s is missing', async (name, code) => {
    const root = await fixture();
    const path = join(root, 'apps/game/dist/.vite/size-groups.json');
    const groups = JSON.parse(await readFile(path, 'utf8'));
    delete groups.groups[name];
    await writeFile(path, JSON.stringify(groups));
    const result = run(root);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(code);
  });

  it('fails closed when a required subsystem group is missing', async () => {
    const root = await fixture();
    const path = join(root, 'apps/game/dist/.vite/size-groups.json');
    const groups = JSON.parse(await readFile(path, 'utf8'));
    delete groups.groups.subsystems.battle;
    await writeFile(path, JSON.stringify(groups));
    const result = run(root);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('SIZE_SUBSYSTEM_GROUP_MISSING:battle');
  });

  it('reports an oversized subsystem without failing the build', async () => {
    const root = await fixture({ noisyLines: 40_000, sessionBudget: 10_000 });
    const result = run(root);
    expect(result.status, result.stdout + result.stderr).toBe(0);
    expect(result.stdout).toMatch(/对话 \/ Ink\s+\d+\.\d+\s+—\s+未设门/);
  });

  it('keeps counting the title entry static import closure', async () => {
    const root = await fixture({
      entryBudget: 0.1,
      files: { shell: Array.from({ length: 2_000 }, (_, i) => `${i}-${i * 41}`).join() },
    });
    const result = run(root);
    expect(result.status, result.stdout + result.stderr).toBe(1);
    expect(result.stdout).toMatch(/entry\s+\d+\.\d+\s+0\.1\s+FAIL/);
  });

  it('keeps the title closure budget and includes its manifest assets', async () => {
    const root = await fixture({
      entryAssets: ['assets/title-asset.js'],
      entryBudget: 0.1,
      files: { 'title-asset': Array.from({ length: 2_000 }, (_, i) => `${i}-${i * 37}`).join() },
    });
    const result = run(root);
    expect(result.status, result.stdout + result.stderr).toBe(1);
    expect(result.stdout).toMatch(/entry\s+\d+\.\d+\s+0\.1\s+FAIL/);
  });

  it.each([
    ['render-aaa.js', 'render-host-zzz.js'],
    ['render-zzz.js', 'render-host-aaa.js'],
  ])('locates the manifest render chunk regardless of hash order (%s)', async (render, host) => {
    const root = await fixture({
      manifest: renderFixtureManifest(render, host),
      renderBudget: 0.1,
      files: {
        [render.slice(0, -3)]: noisy(2_000),
        [host.slice(0, -3)]: 'export{};',
        rig: 'export{};',
      },
    });
    const result = run(root);
    expect(result.status, result.stdout + result.stderr).toBe(1);
    expect(result.stdout).toMatch(/render\s+\d+\.\d+\s+0\.1\s+FAIL/);
  });

  it('counts the render static closure after removing the entry closure', async () => {
    const root = await fixture({
      manifest: renderFixtureManifest('render.js', 'render-host.js'),
      renderBudget: 0.1,
      files: { render: 'export{};', 'render-host': 'export{};', rig: noisy(2_000) },
    });
    const result = run(root);
    expect(result.status, result.stdout + result.stderr).toBe(1);
    expect(result.stdout).toMatch(/render\s+\d+\.\d+\s+0\.1\s+FAIL/);
  });

  it('fails when the battle 3D lazy chunk exceeds its budget', async () => {
    const manifest = renderFixtureManifest('render.js', 'render-host.js');
    manifest['_battle-model3d.js'] = {
      file: 'assets/battle-model3d.js',
      name: 'battle-model3d',
      imports: ['_render.js'],
    };
    const root = await fixture({
      manifest,
      model3dBudget: 0.1,
      files: {
        render: 'export{};',
        'render-host': 'export{};',
        rig: 'export{};',
        'battle-model3d': noisy(2_000),
      },
    });
    const result = run(root);
    expect(result.status, result.stdout + result.stderr).toBe(1);
    expect(result.stdout).toMatch(/render-model3d\s+\d+\.\d+\s+0\.1\s+FAIL/);
  });
});

function noisy(lines) {
  return Array.from({ length: lines }, (_, i) => `${i}-${Math.imul(i, 2_654_435_761)}`).join();
}

function renderFixtureManifest(renderFile, hostFile) {
  return {
    'src/main.ts': { file: 'assets/entry.js', isEntry: true, imports: ['_shell.js'] },
    '_shell.js': { file: 'assets/shell.js' },
    '_render-host.js': {
      file: `assets/${hostFile}`,
      name: 'render-host',
      imports: ['src/main.ts'],
      dynamicImports: ['_render.js'],
    },
    '_render.js': {
      file: `assets/${renderFile}`,
      name: 'engine',
      imports: ['src/main.ts', '_rig.js'],
    },
    '_rig.js': { file: 'assets/rig.js', name: 'rig', imports: ['_render.js'] },
  };
}
