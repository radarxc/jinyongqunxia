import { createEncounterBattleSetup, hexDisk, type MeridianFlowInput } from '@tianshu/core';
import type { ItemDef } from '@tianshu/data/schemas';
import type { BattleLaunch } from './contracts';
import { demoSeed } from './demo-seed';

/** Existing ENG-04 golden fixture, not a chapter encounter or a balance template. */
export function createBattleDemo(source: 'world' | 'town'): BattleLaunch {
  const cells = hexDisk({ q: 0, r: 0 }, 3).map(cell => ({ ...cell, height: 0,
    terrain: 'tr_pingdi', label: '平地', color: 0xc8b994 }));
  const grid = cells.map(({ q, r, height }) => ({ q, r, height, moveCost: 1, canopy: 0,
    los: 'none' as const, standable: true, narrow: false, dangerous: false,
    terrainDealtBp: 0, terrainTakenBp: 0, cover: null }));
  const meridianInputs: MeridianFlowInput[] = ['hero', 'enemy_0'].map((unitId) => ({
    unitId, productionPerTick: 8, qiSpeedBp: 10_000, practiceBp: 8_000,
    nodes: [
      { acupointRef: 'ap_renmai_qihai', opened: true, fluxCap: 8, lengthUnit: 1, flowBp: 10_000 },
      { acupointRef: 'ap_shouyangming_hegu', opened: true, fluxCap: 8, lengthUnit: 1, flowBp: 10_000 },
    ], routes: [{ routeId: 'mfr_fixture_basic', purpose: 'attack', steps: [
      { acupointRef: 'ap_renmai_qihai', lengthUnit: 1, segmentCt: 70, riskBp: 0 },
      { acupointRef: 'ap_shouyangming_hegu', lengthUnit: 1, segmentCt: 70, riskBp: 0 },
    ] }], activeRouteId: 'mfr_fixture_basic',
  }));
  const medicine: ItemDef = { schemaVersion: 'item.v1', id: 'it_jinchuangyao', name: '金创药',
    kind: 'pill', sub: 'medicine', grade: 1, stack: 99, chapters: 'any', origin: 'expanded',
    price: 'auto', flags: [], use: { context: 'both', action: 'consume', target: 'self',
      effects: [{ op: 'healPct', params: { valueBp: 500 } },
        { op: 'dispel', params: { tags: ['bleed'], grade: 1 } }] },
    assets: { icon: 'item/jinchuangyao' }, text: { desc: '演示战斗背包副本。' },
    extension: { type: 'generic', value: {} } };
  const setup = createEncounterBattleSetup({ encounterId: 'enc_combat_fixture', setupId: 'setup-fixture',
    // Presentation fixtures do not own entropy; battle/enter replaces this with one world-stream draw.
    seed: 0, sourceSnapshotHash: '0'.repeat(64), sourceId: 'fixture', triggerId: 'fixture',
    worldTick: 0, sceneRef: source, anchorRef: 'anchor_fixture', mode: 'spar', noItems: true,
    meridianInputs, inventory: { stacks: [{ itemId: medicine.id, count: 2 }] }, itemDefs: [medicine],
    participants: [
      { unitRef: 'hero', side: 'player', control: 'player', spawn: 'spawn_player', state: 'active', required: true },
      { unitRef: 'enemy_0', side: 'enemy', control: 'ai', spawn: 'spawn_enemy_0', state: 'active', required: true },
    ], grid, initialUnits: [
      { unitRef: 'hero', pos: { q: 0, r: 0 }, facing: 0 },
      { unitRef: 'enemy_0', pos: { q: 1, r: 0 }, facing: 3 },
    ] });
  const seeds = [demoSeed('hero'), demoSeed('enemy_0')];
  return { setup, seeds, title: '演武场', preview: true,
    cells,
    markers: seeds.map((unit, index) => ({ id: unit.id, index,
      name: index === 0 ? '演武侠客' : '陪练', q: index, r: 0, height: 0,
      facing: index === 0 ? 0 : 3, active: true,
      qiNature: index === 0 ? 'neutral' : 'yang',
      equipment: index === 0 ? { mainHand: { id: 'eq_qinggangjian', tint: '#a9b9c1' },
        body: { id: 'eq_buyi', tint: '#507879' } } : {},
    })),
    moves: [{ id: 'mv_basic_strike', name: '普通一击', skillId: 'sk_basic', skillName: '基本功',
      shape: { tpl: 'aoe_single' }, range: 1 }],
  };
}
