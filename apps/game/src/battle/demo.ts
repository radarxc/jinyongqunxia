import { createEncounterBattleSetup, hexDisk } from '@tianshu/core';
import type { BattleLaunch } from './contracts';
import { demoSeed } from './demo-seed';

/** Existing ENG-04 golden fixture, not a chapter encounter or a balance template. */
export function createBattleDemo(source: 'world' | 'town'): BattleLaunch {
  const setup = createEncounterBattleSetup({ encounterId: 'enc_combat_fixture', setupId: 'setup-fixture',
    seed: 20261001, sourceSnapshotHash: '0'.repeat(64), sourceId: 'fixture', triggerId: 'fixture',
    worldTick: 0, sceneRef: source, anchorRef: 'anchor_fixture', participants: [
      { unitRef: 'hero', side: 'player', control: 'player', spawn: 'spawn_player', state: 'active', required: true },
      { unitRef: 'enemy_0', side: 'enemy', control: 'ai', spawn: 'spawn_enemy_0', state: 'active', required: true },
    ] });
  const seeds = [demoSeed('hero'), demoSeed('enemy_0')];
  return { setup, seeds, title: '演武场', preview: true,
    cells: hexDisk({ q: 0, r: 0 }, 3).map(cell => ({ ...cell, height: 0,
      terrain: 'tr_pingdi', label: '平地', color: 0xc8b994 })),
    markers: seeds.map((unit, index) => ({ id: unit.id, index,
      name: index === 0 ? '演武侠客' : '陪练', q: index, r: 0, height: 0,
      facing: index === 0 ? 0 : 3, active: true,
      equipment: index === 0 ? { mainHand: { id: 'eq_qinggangjian', tint: '#a9b9c1' },
        body: { id: 'eq_buyi', tint: '#507879' } } : {},
    })),
    moves: [{ id: 'mv_basic_strike', name: '普通一击', skillId: 'sk_basic', skillName: '基本功',
      shape: { tpl: 'aoe_single' }, range: 1 }],
  };
}
