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
  const manifest = JSON.parse(
    JSON.stringify(
      options.manifest ?? {
        'src/main.ts': {
          file: 'assets/entry.js',
          isEntry: true,
          imports: ['_shell.js'],
          assets: options.entryAssets ?? [],
        },
        '_shell.js': { file: 'assets/shell.js' },
      },
    ),
  );
  if (!options.missingDressup && !manifest['packages/render/src/dressup/runtime.ts']) {
    manifest['packages/render/src/dressup/runtime.ts'] = {
      file: 'assets/render-dressup.js',
      name: 'render-dressup',
      isEntry: true,
      imports: ['_shell.js'],
    };
  }
  const groups = options.groups ?? {
    schemaVersion: 'size-groups.v1',
    groups: {
      workerShell: ['assets/worker.js'],
      sessionStatic: ['assets/session.js', 'assets/shared.js'],
      baseContent: ['assets/content.js'],
      coreExplore: options.coreExplore ?? [],
      coreShop: options.coreShop ?? [],
      subsystems: {
        dialogue: ['assets/dialogue.js', 'assets/shared.js'],
        region: ['assets/region.js'],
        battle: ['assets/battle.js'],
        town: ['assets/town.js'],
      },
    },
    moduleIds: { sessionStatic: options.sessionModuleIds ?? ['/repo/packages/core/src/state.ts'] },
  };
  const appGroups = options.appGroups ?? {
    schemaVersion: 'size-groups.v1',
    groups: { exploreUi: options.exploreUi ?? [] },
    moduleIds: { renderStatic: options.renderModuleIds ?? ['/repo/packages/render/src/index.ts'] },
  };
  const buildgenWorkerGroups = Object.hasOwn(options, 'buildgenWorkerGroups')
    ? options.buildgenWorkerGroups
    : {
        schemaVersion: 'size-groups.v1',
        groups: { buildgenWorker: options.buildgenWorker ?? [] },
      };
  await writeFile(join(root, 'apps/game/dist/.vite/manifest.json'), JSON.stringify(manifest));
  if (groups)
    await writeFile(join(root, 'apps/game/dist/.vite/size-groups.json'), JSON.stringify(groups));
  if (appGroups)
    await writeFile(
      join(root, 'apps/game/dist/.vite/app-size-groups.json'),
      JSON.stringify(appGroups),
    );
  if (buildgenWorkerGroups)
    await writeFile(
      join(root, 'apps/game/dist/.vite/buildgen-worker-size-groups.json'),
      JSON.stringify(buildgenWorkerGroups),
    );
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
    'render-dressup': 'export{};',
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
        render: options.renderBudget ?? 170,
        'render-rig': options.rigBudget ?? 20,
        'render-model3d': options.model3dBudget ?? 24,
        'render-dressup': options.dressupBudget ?? 24,
        'render-explore': options.exploreBudget ?? 32,
        'render-town-legacy': 14,
        'render-buildgen': 40,
        'render-buildgen-worker': options.buildgenWorkerBudget ?? 24,
        'render-actor3d': 16,
        'render-meshopt': 8,
        'explore-ui': options.exploreUiBudget ?? 45,
        'core-explore': options.coreExploreBudget ?? 24,
        'core-shop': options.coreShopBudget ?? 8,
        'render-webgpu': 300,
        basis: 255,
        devtools: 130,
      },
      routes: {
        webglEntryAndRender: 350,
        webgpuEntryAndRender: 470,
        webglExploreRoute: options.exploreRouteBudget ?? 420,
      },
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
    expect(result.stdout).toMatch(/render-rig\s+—\s+20\s+not emitted/);
    expect(result.stdout).toMatch(/render-model3d\s+—\s+24\s+not emitted/);
    expect(result.stdout).toMatch(/render-dressup\s+\d+\.\d+\s+24\s+PASS/);
    expect(result.stdout).toMatch(/render-explore\s+0\.00\s+32\s+PASS/);
    expect(result.stdout).toMatch(/render-buildgen-worker\s+0\.00\s+24\s+PASS/);
    expect(result.stdout).toMatch(/explore-ui\s+0\.00\s+45\s+PASS/);
    expect(result.stdout).toMatch(/webglExploreRoute\s+\d+\.\d+\s+420\s+PASS/);
    expect(result.stdout).toContain('首次会话闭包（预算 110 KiB gzip）');
    expect(result.stdout).toMatch(
      /worker shell[\s\S]*session static[\s\S]*base content[\s\S]*session total/,
    );
    expect(result.stdout).toMatch(/worker shell\s+\d+\.\d+\s+—\s+计入合计/);
    expect(result.stdout).toContain('子系统块（只报告，未设门');
    expect(result.stdout).toMatch(/对话 \/ Ink\s+\d+\.\d+\s+—\s+未设门/);
  });

  it('fails when a town render chunk exceeds its own budget', async () => {
    const manifest = renderFixtureManifest('render.js', 'render-host.js');
    manifest['packages/render/src/region/index.ts'] = {
      file: 'assets/render-explore.js',
      name: 'render-explore',
      imports: ['_render.js'],
    };
    const root = await fixture({
      manifest,
      exploreBudget: 0.1,
      files: {
        render: 'export{};',
        'render-host': 'export{};',
        rig: 'export{};',
        'render-explore': noisy(2_000),
      },
    });
    const result = run(root);
    expect(result.status, result.stdout + result.stderr).toBe(1);
    expect(result.stdout).toMatch(/render-explore\s+\d+\.\d+\s+0\.1\s+FAIL/);
  });

  it('fails budgets for explore UI, lazy families, worker closure, and route', async () => {
    const root = await fixture({
      exploreUi: ['assets/explore-ui.js'],
      coreExplore: ['assets/core-explore.js', 'assets/explore-dependency.js'],
      coreShop: ['assets/core-shop.js', 'assets/shop-dependency.js'],
      buildgenWorker: [
        'assets/render-buildgen-worker-x.js',
        'assets/buildgen-dependency.js',
      ],
      exploreUiBudget: 0.1,
      coreExploreBudget: 0.1,
      coreShopBudget: 0.1,
      buildgenWorkerBudget: 0.1,
      exploreRouteBudget: 0.01,
      files: {
        'explore-ui': noisy(2_000),
        'core-explore': 'export{};',
        'explore-dependency': noisy(2_000),
        'core-shop': 'export{};',
        'shop-dependency': noisy(2_000),
        'render-buildgen-worker-x': 'export{};',
        'buildgen-dependency': noisy(2_000),
      },
    });
    const result = run(root);
    expect(result.status).toBe(1);
    for (const name of ['explore-ui', 'core-explore', 'core-shop', 'render-buildgen-worker'])
      expect(result.stdout).toMatch(new RegExp(`${name}\\s+\\d+\\.\\d+\\s+0\\.1\\s+FAIL`));
    expect(result.stdout).toMatch(/webglExploreRoute\s+\d+\.\d+\s+0\.01\s+FAIL/);
  });

  it('fails closed when a buildgen Worker is emitted without its closure document', async () => {
    const root = await fixture({
      buildgenWorkerGroups: null,
      files: { 'render-buildgen-worker-x': 'export{};' },
    });
    const result = run(root);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('SIZE_SESSION_GROUP_MISSING:buildgenWorker');
  });

  it.each([
    [
      'session',
      { sessionModuleIds: ['/repo/packages/core/src/world/explore/tick.ts'] },
      'SIZE_STATIC_CLOSURE_FORBIDDEN:session',
    ],
    [
      'session former types exception',
      { sessionModuleIds: ['/repo/packages/core/src/world/explore/types.ts'] },
      'SIZE_STATIC_CLOSURE_FORBIDDEN:session',
    ],
    [
      'session former walk validation exception',
      { sessionModuleIds: ['/repo/packages/core/src/world/explore/walk-validate.ts'] },
      'SIZE_STATIC_CLOSURE_FORBIDDEN:session',
    ],
    [
      'session shop',
      { sessionModuleIds: ['/repo/packages/core/src/economy/shop-pricing.ts'] },
      'SIZE_STATIC_CLOSURE_FORBIDDEN:session',
    ],
    [
      'render',
      { renderModuleIds: ['/repo/packages/render/src/buildgen/index.ts'] },
      'SIZE_STATIC_CLOSURE_FORBIDDEN:render',
    ],
  ])('rejects forbidden modules in the %s static closure', async (_name, options, code) => {
    const root = await fixture(options);
    const result = run(root);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(code);
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

  it('fails when the rig lazy closure exceeds its separate budget', async () => {
    const manifest = renderFixtureManifest('render.js', 'render-host.js');
    manifest['_render.js'].imports = ['src/main.ts'];
    manifest['_render.js'].dynamicImports = ['_rig.js'];
    manifest['_rig.js'].imports = ['_render.js'];
    const root = await fixture({
      manifest,
      rigBudget: 0.1,
      files: { render: 'export{};', 'render-host': 'export{};', rig: noisy(2_000) },
    });
    const result = run(root);
    expect(result.status, result.stdout + result.stderr).toBe(1);
    expect(result.stdout).toMatch(/render-rig\s+\d+\.\d+\s+0\.1\s+FAIL/);
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

  it('fails closed when the required dressup chunk is missing', async () => {
    const root = await fixture({ missingDressup: true });
    const result = run(root);
    expect(result.status).toBe(1);
    expect(result.stdout).toMatch(/render-dressup\s+—\s+24\s+FAIL/);
  });

  it('fails when the dressup lazy closure exceeds its separate budget', async () => {
    const root = await fixture({
      dressupBudget: 0.1,
      files: { 'render-dressup': noisy(2_000) },
    });
    const result = run(root);
    expect(result.status).toBe(1);
    expect(result.stdout).toMatch(/render-dressup\s+\d+\.\d+\s+0\.1\s+FAIL/);
  });

  it('fails when an emitted dressup-prefixed chunk is outside its manifest closure', async () => {
    const root = await fixture({
      files: { 'render-dressup-worker-copy': noisy(2_000) },
    });
    const result = run(root);
    expect(result.status).toBe(1);
    expect(result.stdout).toMatch(/dressup orphan\s+\d+\.\d+\s+0\s+FAIL/);
  });

  it('does not charge render or battle-model3d closure bytes to dressup', async () => {
    const manifest = renderFixtureManifest('render.js', 'render-host.js');
    manifest['_battle-model3d.js'] = {
      file: 'assets/battle-model3d.js',
      name: 'battle-model3d',
      imports: ['_render.js'],
    };
    manifest['packages/render/src/dressup/runtime.ts'] = {
      file: 'assets/render-dressup.js',
      name: 'render-dressup',
      imports: ['_render.js', '_battle-model3d.js'],
    };
    const root = await fixture({
      manifest,
      dressupBudget: 0.1,
      files: {
        render: noisy(2_000),
        'render-host': 'export{};',
        rig: 'export{};',
        'battle-model3d': noisy(2_000),
        'render-dressup': 'export{};',
      },
    });
    const result = run(root);
    expect(result.status, result.stdout + result.stderr).toBe(0);
    expect(result.stdout).toMatch(/render-dressup\s+\d+\.\d+\s+0\.1\s+PASS/);
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
