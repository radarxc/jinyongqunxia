import { describe, expect, it } from 'vitest';
import type { BattleModelCatalog, BattleModelVisual } from '@tianshu/render/battle';
import type { BattleLaunch } from './contracts';
import type { GameContent } from '../runtime/content';
import { resolveMarkerModel, withBattleModels } from './model-selection';

const visual = (key: string, gender: 'male' | 'female', kind: BattleModelVisual['kind'] = 'generic'):
BattleModelVisual => ({ key, gender, kind, heightM: gender === 'male' ? 1.7 : 1.62,
  modelUrl: `/assets/default/model3d/${key}/anim_idle_walk_run.glb` });
const male = visual('npc_generic_m', 'male');
const female = visual('npc_generic_f', 'female');
const catalog: BattleModelCatalog = { schema: 'battle-models.v1', generic: { male, female },
  protagonist: { male: visual('npc_zhujue__ch00_m', 'male', 'dedicated'),
    female: visual('npc_zhujue__ch00_f', 'female', 'dedicated') },
  npcs: { npc_aqing: visual('npc_aqing__ch00_youth', 'female', 'dedicated'),
    npc_baiyuan: null }, templates: { tmpl_normal: male } };
const content = { battleModels: catalog, assets: { npc_aqing: { portrait: 'portrait.png' } },
  npcs: [
    { id: 'npc_aqing', identity: { name: '阿青', aliases: [], species: 'human' as const,
      gender: 'female' as const }, appearances: [] },
    { id: 'npc_unknown_f', identity: { name: '女侠', aliases: [], species: 'human' as const,
      gender: 'female' as const }, appearances: [] },
    { id: 'npc_baiyuan', identity: { name: '白猿', aliases: [], species: 'animal' as const },
      appearances: [] },
  ],
} as unknown as GameContent;

describe('battle model runtime projection', () => {
  it('uses NPC gender, defaults missing template gender to male, and preserves non-human 2D', () => {
    expect(resolveMarkerModel(catalog, content, { kind: 'npc', npcId: 'npc_aqing' }))
      .toMatchObject({ key: 'npc_aqing__ch00_youth' });
    expect(resolveMarkerModel(catalog, content, { kind: 'npc', npcId: 'npc_unknown_f' }))
      .toBe(female);
    expect(resolveMarkerModel(catalog, content, { kind: 'template', templateId: 'missing' }))
      .toBe(male);
    expect(resolveMarkerModel(catalog, content, { kind: 'npc', npcId: 'npc_baiyuan' }))
      .toBeNull();
  });

  it('decorates every launch marker with a distinguishable model source and NPC portrait', () => {
    const marker = (id: string, index: number) => ({ id, index, name: id, q: index, r: 0,
      height: 0, facing: 0 as const, active: true, equipment: {} });
    const launch = { markers: [marker('hero', 0), marker('aqing_projection', 1),
      marker('baiyuan', 2), marker('mob', 3)]
    } as unknown as BattleLaunch;
    const result = withBattleModels(launch, content, { protagonistGender: 'female' });
    expect(result.markers.map(row => [row.appearance?.kind, row.model?.key, row.portraitUrl]))
      .toEqual([['protagonist', 'npc_zhujue__ch00_f', undefined],
        ['npc', 'npc_aqing__ch00_youth', 'portrait.png'], ['npc', undefined, undefined],
        ['template', 'npc_generic_m', undefined]]);
  });
});
