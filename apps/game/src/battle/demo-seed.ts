import { hexDisk, type BattleUnitSeed, type MeridianFlowInput } from '@tianshu/core';
import type { EncounterDef, ItemDef } from '@tianshu/data/schemas';

/** Literal ENG-04 combat-fixture values, kept as demo content input. */
export function demoSeed(id: string): BattleUnitSeed {
  return { id, hp: 1200, hpMax: 1200, mp: 400, mpMax: 400, shield: 0, ctFrozen: false,
    pendingShift: 0, spd: 100, qinggong: 50, openingQinggong: 50, openingPriority: 0, agi: 50,
    stats: { level: 35, atkOut: 240, atkIn: 220, defOut: 180, defIn: 170, aptitude: 50,
      aptitudeInner: 50, critDamagePct: 150, hit: 100, eva: -100, parry: -100, pierce: 100,
      crit: -100, tough: 40, strength: 50 },
    moves: [{ id: 'mv_basic_strike', powerBp: 10_000, referencePowerBp: 10_000,
      skillId: 'sk_basic', meridianRouteRef: 'mfr_fixture_basic', wInBp: 3500,
      recovery: 900, mpCost: 0, hitZone: 'body', autoTargetCap: 1, range: { min: 1, max: 1 },
      delivery: 'melee', shape: { tpl: 'aoe_single' }, hTol: 2, target: 'enemy' }],
    zoneGuards: {
      body: { qi: 0, carryCapacity: 100, strengthBp: 10_000, flowRatioBp: 10_000, breakGuardBp: 0 },
      hand: { qi: 0, carryCapacity: 100, strengthBp: 10_000, flowRatioBp: 10_000, breakGuardBp: 0 },
      leg: { qi: 0, carryCapacity: 100, strengthBp: 10_000, flowRatioBp: 10_000, breakGuardBp: 0 },
    }, buffs: [], foreignQi: [], acupointOccupancies: [], ownActions: 0 };
}

const demoCell = ({ q, r }: { readonly q: number; readonly r: number }) => ({ q, r, height: 0,
  moveCost: 1, canopy: 0, los: 'none' as const, standable: true, narrow: false,
  dangerous: false, terrainDealtBp: 0, terrainTakenBp: 0, cover: null });
export const COMBAT_DEMO_ENCOUNTER = { schemaVersion: 'encounter.v1',
  id: 'enc_combat_fixture', chapterId: 'ch00_yuenv', kind: 'spar',
  arena: { kind: 'inline', topology: 'hex-pointy', anchorId: 'anchor_fixture',
    cells: hexDisk({ q: 0, r: 0 }, 3).map(demoCell) },
  participants: [
    { unitRef: 'hero', source: { kind: 'character', characterRef: 'protagonist' },
      side: 'player', control: 'player', spawnId: 'spawn_player', state: 'active', required: true,
      placement: { pos: { q: 0, r: 0 }, facing: 0 } },
    { unitRef: 'enemy_0', source: { kind: 'character', characterRef: 'companion:enemy_0' },
      side: 'enemy', control: 'ai', spawnId: 'spawn_enemy_0', state: 'active', required: true,
      placement: { pos: { q: 1, r: 0 }, facing: 3 } },
  ],
  outcome: { win: [{ kind: 'allHostileDown', side: 'player' }],
    lose: [{ kind: 'unitDown', unitRef: 'hero' }], draw: [], onDefeat: 'retry',
    concede: 'forbidden' },
  rules: { mode: 'spar', noAuto: false, noRetreat: false, noItems: true,
    mercyAllowed: true, lethalIntent: false, friendlyFire: false, roundLimit: 30, boss: false,
    retry: true, skippable: false }, beats: [],
  difficulty: { localDifficulty: 1, enemyStatBp: 9_000, modes: {
    diff_jianghu: { hpBp: 8_000, attackBp: 8_000 },
    diff_xiake: { hpBp: 10_000, attackBp: 10_000 },
    diff_zongshi: { hpBp: 12_000, attackBp: 11_200 } } },
} satisfies EncounterDef;

export const COMBAT_DEMO_MERIDIANS: readonly MeridianFlowInput[] = ['hero', 'enemy_0'].map((unitId) => ({
  unitId, productionPerTick: 8, qiSpeedBp: 10_000, practiceBp: 8_000,
  nodes: [
    { acupointRef: 'ap_renmai_qihai', opened: true, fluxCap: 8, lengthUnit: 1, flowBp: 10_000 },
    { acupointRef: 'ap_shouyangming_hegu', opened: true, fluxCap: 8, lengthUnit: 1, flowBp: 10_000 },
  ], routes: [{ routeId: 'mfr_fixture_basic', purpose: 'attack', steps: [
    { acupointRef: 'ap_renmai_qihai', lengthUnit: 1, segmentCt: 70, riskBp: 0 },
    { acupointRef: 'ap_shouyangming_hegu', lengthUnit: 1, segmentCt: 70, riskBp: 0 },
  ] }], activeRouteId: 'mfr_fixture_basic',
}));

export const COMBAT_DEMO_MEDICINE: ItemDef = { schemaVersion: 'item.v1',
  id: 'it_jinchuangyao', name: '金创药', kind: 'pill', sub: 'medicine', grade: 1, stack: 99,
  chapters: 'any', origin: 'expanded', price: 'auto', flags: [],
  use: { context: 'both', action: 'consume', target: 'self', effects: [
    { op: 'healPct', params: { valueBp: 500 } },
    { op: 'dispel', params: { tags: ['bleed'], grade: 1 } },
  ] }, assets: { icon: 'item/jinchuangyao' }, text: { desc: '演示战斗背包副本。' },
  extension: { type: 'generic', value: {} } };

export function combatDemoSources() {
  return [{ ref: 'protagonist', seed: demoSeed('hero') },
    { ref: 'companion:enemy_0', seed: demoSeed('enemy_0') }];
}
