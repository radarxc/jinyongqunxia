import { buildEncounter } from '@tianshu/core';
import type { BattleLaunch } from './contracts';
import { COMBAT_DEMO_ENCOUNTER, COMBAT_DEMO_MEDICINE, COMBAT_DEMO_MERIDIANS,
  combatDemoSources } from './demo-seed';

/** Presentation now opens through encounter.v1 instead of authoring BattleSetup units in app code. */
export function createBattleDemo(source: 'world' | 'town'): BattleLaunch {
  const launch = buildEncounter(COMBAT_DEMO_ENCOUNTER, { setupId: 'setup-fixture', seed: 0,
    sourceSnapshotHash: '0'.repeat(64), sourceId: 'fixture', triggerId: 'fixture', worldTick: 0,
    difficulty: 'diff_xiake', units: combatDemoSources(), templates: [], sceneRef: source,
    meridianInputs: COMBAT_DEMO_MERIDIANS, inventory: { stacks: [
      { itemId: COMBAT_DEMO_MEDICINE.id, count: 2 } ] }, itemDefs: [COMBAT_DEMO_MEDICINE] });
  const cells = launch.setup.grid.cells.map((cell) => ({ q: cell.q, r: cell.r, height: cell.height,
    terrain: 'tr_pingdi', label: '平地', color: 0xc8b994 }));
  return { ...launch, title: '演武场', preview: true, cells,
    markers: launch.seeds.map((unit, index) => {
      const initial = launch.setup.start.initialByUnit.find((row) => row.unitRef === unit.id)!;
      return { id: unit.id, index, name: unit.id === 'hero' ? '演武侠客' : '陪练',
        q: initial.pos.q, r: initial.pos.r, height: 0, facing: initial.facing, active: true,
        qiNature: unit.id === 'hero' ? 'neutral' : 'yang',
        equipment: unit.id === 'hero' ? { mainHand: { id: 'eq_qinggangjian', tint: '#a9b9c1' },
          body: { id: 'eq_buyi', tint: '#507879' } } : {} };
    }),
    moves: [{ id: 'mv_basic_strike', name: '普通一击', skillId: 'sk_basic', skillName: '基本功',
      shape: { tpl: 'aoe_single' }, range: 1 }],
  };
}
