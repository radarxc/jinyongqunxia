import type { ItemDef } from '@tianshu/data/schemas';
import type { BattleMove, BattleRewardSetup, BattleUnitSeed, MeridianFlowInput, SideId } from '../battle';
import { createBattleState, createEncounterBattleSetup } from '../battle';
import { HEX_DIRECTIONS, hexDisk } from '../hex';

export const BASIC_MOVE: BattleMove = { id: 'mv_basic_strike', powerBp: 10_000,
  referencePowerBp: 10_000, skillId: 'sk_basic', wInBp: 3_500, recovery: 900,
  mpCost: 0, hitZone: 'body',
  autoTargetCap: 1, range: { min: 1, max: 1 }, delivery: 'melee',
  shape: { tpl: 'aoe_single' }, hTol: 2, target: 'enemy' };

export function battleSeed(id: string, moves: readonly BattleMove[] = [BASIC_MOVE]): BattleUnitSeed {
  return { id, hp: 1_200, hpMax: 1_200, mp: 400, mpMax: 400, shield: 0, ctFrozen: false,
    pendingShift: 0, spd: 100, qinggong: 50, openingQinggong: 50, openingPriority: 0, agi: 50,
    stats: { level: 35, atkOut: 240, atkIn: 220, defOut: 180, defIn: 170, aptitude: 50,
      aptitudeInner: 50, critDamagePct: 150, hit: 100, eva: -100, parry: -100, pierce: 100,
      crit: -100, tough: 40, strength: 50 }, moves, zoneGuards: {
        body: { qi: 0, carryCapacity: 100, strengthBp: 10_000, flowRatioBp: 10_000, breakGuardBp: 0 },
        hand: { qi: 0, carryCapacity: 100, strengthBp: 10_000, flowRatioBp: 10_000, breakGuardBp: 0 },
        leg: { qi: 0, carryCapacity: 100, strengthBp: 10_000, flowRatioBp: 10_000, breakGuardBp: 0 },
      }, buffs: [], foreignQi: [], acupointOccupancies: [], ownActions: 0 };
}

export function combatFixture(input: { readonly seed?: number; readonly playerMoves?: readonly BattleMove[];
  readonly enemyMoves?: readonly BattleMove[]; readonly enemies?: number; readonly hp?: number;
  readonly noAuto?: boolean; readonly noItems?: boolean; readonly gridRadius?: number;
  readonly meridianInputs?: readonly MeridianFlowInput[];
  readonly inventory?: { readonly stacks: readonly { readonly itemId: string; readonly count: number }[] };
  readonly itemDefs?: readonly ItemDef[]; readonly rewards?: Partial<BattleRewardSetup>;
  readonly playerMedical?: number } = {}) {
  const enemies = input.enemies ?? 1;
  const participants = [{ unitRef: 'hero', side: 'player' as SideId, control: 'player' as const,
    spawn: 'spawn_player', state: 'active' as const, required: true },
  ...Array.from({ length: enemies }, (_, index) => ({ unitRef: `enemy_${index}`,
    side: 'enemy' as SideId, control: 'ai' as const, spawn: `spawn_enemy_${index}`,
    state: 'active' as const, required: true }))];
  const radius = input.gridRadius ?? Math.max(2, enemies);
  const grid = hexDisk({ q: 0, r: 0 }, radius).map(({ q, r }) => ({ q, r, height: 0,
    moveCost: 1, canopy: 0, los: 'none' as const, standable: true, narrow: false, dangerous: false }));
  const initialUnits = participants.map((entry, index) => ({ unitRef: entry.unitRef,
    pos: index === 0 ? { q: 0, r: 0 } : { ...HEX_DIRECTIONS[(index - 1) % 6]! },
    facing: (index === 0 ? 0 : 3) as 0 | 3 }));
  const setup = createEncounterBattleSetup({ encounterId: 'enc_combat_fixture', setupId: 'setup-fixture',
    seed: input.seed ?? 1, sourceSnapshotHash: '0'.repeat(64), sourceId: 'fixture', triggerId: 'fixture',
    worldTick: 0, participants, sceneRef: 'sc_fixture', anchorRef: 'anchor_fixture',
    noAuto: input.noAuto ?? false, noItems: input.noItems ?? false, grid, initialUnits,
    ...(input.meridianInputs === undefined ? {} : { meridianInputs: input.meridianInputs }),
    ...(input.inventory === undefined ? {} : { inventory: input.inventory }),
    ...(input.itemDefs === undefined ? {} : { itemDefs: input.itemDefs }),
    ...(input.rewards === undefined ? {} : { rewards: input.rewards }) });
  const seeds = [battleSeed('hero', input.playerMoves),
    ...Array.from({ length: enemies }, (_, index) => battleSeed(`enemy_${index}`, input.enemyMoves))];
  if (input.playerMedical !== undefined) Object.assign(seeds[0]!, { medical: input.playerMedical });
  if (input.hp !== undefined) for (const seed of seeds) {
    Object.assign(seed, { hp: input.hp, hpMax: input.hp });
  }
  return createBattleState(setup, seeds);
}
