import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import type { BattleModelCatalog, BattleModelVisual } from '@tianshu/render/battle';
import { buildBattleModelCatalog, decodeModelDirectory, mapBattleModelDirectories, publishBattleModels,
  readBattleModelDirectories, resolveBattleModel } from './battle-model-assets';

const roots: string[] = [];
async function root(): Promise<string> {
  const value = await mkdtemp(join(tmpdir(), 'tianshu-battle-model-'));
  roots.push(value); return value;
}
async function asset(base: string, directory: string, files: readonly string[]): Promise<void> {
  const target = join(base, 'assets/default/model3d', directory);
  await mkdir(target, { recursive: true });
  await writeFile(join(target, 'manifest.yaml'), files.map((file, index) =>
    `- id: fixture_${index}\n  file: ${file}\n  status: candidate\n`).join(''));
  await Promise.all(files.map(file => writeFile(join(target, file), directory + '/' + file)));
}
afterEach(async () => { await Promise.all(roots.splice(0).map(path => rm(path, { recursive: true }))); });

describe('battle model resolution', () => {
  it('derives a data-driven NPC map from both supported directory forms', () => {
    expect(decodeModelDirectory('npc_xiaofeng')).toEqual({ npcId: 'npc_xiaofeng' });
    expect(decodeModelDirectory('npc_aqing__ch00_youth')).toEqual({
      npcId: 'npc_aqing', chapterToken: 'ch00',
    });
    expect(mapBattleModelDirectories([
      { directory: 'npc_xiaofeng', npcId: 'npc_xiaofeng', rig: 'model_rig.glb' },
      { directory: 'npc_aqing__ch00_youth', npcId: 'npc_aqing', chapterToken: 'ch00',
        rig: 'model_rig.glb' },
    ])).toMatchObject({ npc_xiaofeng: [{ directory: 'npc_xiaofeng' }],
      npc_aqing: [{ directory: 'npc_aqing__ch00_youth' }] });
  });

  it('selects dedicated, then gender generic, then protagonist fallback and excludes animals', () => {
    const shared = [
      { directory: 'npc_generic_m', combined: 'anim_idle_walk_run.glb' },
      { directory: 'npc_generic_f', combined: 'anim_idle_walk_run.glb' },
      { directory: 'npc_zhujue__ch00_m', combined: 'anim_idle_walk_run.glb' },
      { directory: 'npc_zhujue__ch00_f', combined: 'anim_idle_walk_run.glb' },
    ] as const;
    const directories = [...shared,
      { directory: 'npc_xiaofeng', npcId: 'npc_xiaofeng', rig: 'model_rig.glb' },
      { directory: 'npc_aqing__ch00_youth', npcId: 'npc_aqing', chapterToken: 'ch00',
        rig: 'model_rig.glb' },
    ];
    expect(resolveBattleModel(directories, { npcId: 'npc_xiaofeng', chapterId: 'ch01_tianlong',
      gender: 'male', species: 'human' })).toMatchObject({ key: 'npc_xiaofeng', kind: 'dedicated' });
    expect(resolveBattleModel(directories, { npcId: 'npc_aqing', chapterId: 'ch00_yuenv',
      gender: 'female', species: 'human' })).toMatchObject({ key: 'npc_aqing__ch00_youth',
      animationUrl: '/assets/default/model3d/npc_generic_f/anim_idle_walk_run.glb' });
    expect(resolveBattleModel(directories, { npcId: 'npc_unknown', chapterId: 'ch10_baima',
      gender: 'female', species: 'human' })).toMatchObject({ key: 'npc_generic_f', kind: 'generic' });
    expect(resolveBattleModel(shared.filter(row => row.directory !== 'npc_generic_m'),
      { npcId: 'npc_unknown', chapterId: 'ch10_baima', species: 'human' }))
      .toMatchObject({ key: 'npc_zhujue__ch00_m', kind: 'fallback' });
    expect(resolveBattleModel(directories, { npcId: 'npc_baiyuan', chapterId: 'ch00_yuenv',
      species: 'animal' })).toBeNull();
  });

  it('switches from protagonist fallback to a generic model when its manifest appears', async () => {
    const base = await root(); await asset(base, 'npc_zhujue__ch00_f', ['anim_idle_walk_run.glb']);
    let directories = await readBattleModelDirectories(base);
    expect(resolveBattleModel(directories, { chapterId: 'ch00_yuenv', gender: 'female' }))
      .toMatchObject({ key: 'npc_zhujue__ch00_f', kind: 'fallback' });
    await asset(base, 'npc_generic_f', ['anim_idle_walk_run.glb']);
    directories = await readBattleModelDirectories(base);
    expect(resolveBattleModel(directories, { chapterId: 'ch00_yuenv', gender: 'female' }))
      .toMatchObject({ key: 'npc_generic_f', kind: 'generic' });
  });

  it('projects the subject id into the catalog dedicated-model lookup', () => {
    const directories = [
      { directory: 'npc_generic_f', combined: 'anim_idle_walk_run.glb' },
      { directory: 'npc_aqing__ch00_youth', npcId: 'npc_aqing', chapterToken: 'ch00',
        rig: 'model_rig.glb' },
    ];
    const catalog = buildBattleModelCatalog(directories, 'ch00_yuenv', [{
      id: 'npc_aqing', chapterId: 'ch00_yuenv', species: 'human', gender: 'female',
      combatEligible: true,
    }], []);
    expect(catalog.npcs.npc_aqing).toMatchObject({
      key: 'npc_aqing__ch00_youth', kind: 'dedicated',
    });
  });
});

describe('battle model publishing', () => {
  it('copies only GLBs reachable from catalog values and records their subject reference', async () => {
    const base = await root(); await asset(base, 'npc_generic_m',
      ['anim_idle_walk_run.glb', 'model_rig.glb']);
    await writeFile(join(base, 'assets/default/model3d/npc_generic_m/preview.png'), 'private');
    const model: BattleModelVisual = { key: 'npc_generic_m', kind: 'generic', gender: 'male',
      heightM: 1.7, modelUrl: '/assets/default/model3d/npc_generic_m/anim_idle_walk_run.glb',
      animationUrl: '/assets/default/model3d/npc_generic_m/anim_idle_walk_run.glb' };
    const catalog: BattleModelCatalog = { schema: 'battle-models.v1', generic: {},
      protagonist: {}, npcs: { npc_fixture: model }, templates: {} };
    const references = new Map<string, Set<string>>();
    expect(await publishBattleModels(base, true, { ch00_yuenv: catalog }, undefined, references))
      .toEqual(['assets/default/model3d/npc_generic_m/anim_idle_walk_run.glb']);
    expect(await readFile(join(base, 'apps/game/public/assets/default/model3d/npc_generic_m/',
      'anim_idle_walk_run.glb'), 'utf8')).toContain('npc_generic_m');
    await expect(access(join(base, 'apps/game/public/assets/default/model3d/npc_generic_m/',
      'model_rig.glb'))).rejects.toThrow();
    expect(references.get('npc_fixture')).toEqual(new Set([
      '/assets/default/model3d/npc_generic_m/anim_idle_walk_run.glb',
    ]));
  });
});
