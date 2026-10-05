import type { CharacterTemplate, EncounterDef } from '@tianshu/data/schemas';
import { hexDisk, hexRing } from '../hex';
import type { BattleUnitSeed } from '../battle';
import { BASIC_MOVE, battleSeed } from './combat-fixture';

const modes = { diff_jianghu: { hpBp: 8_000, attackBp: 8_000 },
  diff_xiake: { hpBp: 10_000, attackBp: 10_000 },
  diff_zongshi: { hpBp: 12_000, attackBp: 11_200 } } as const;
const difficulty = { localDifficulty: 1, enemyStatBp: 9_000, modes };
const cell = ({ q, r }: { readonly q: number; readonly r: number }) => ({ q, r, height: 0,
  moveCost: 1, canopy: 0, los: 'none' as const, standable: true, narrow: false,
  dangerous: false, terrainDealtBp: 0, terrainTakenBp: 0, cover: null });
function grid(count: 61 | 73 | 91) {
  const base = count === 61 ? hexDisk({ q: 0, r: 0 }, 4)
    : count === 73 ? [...hexDisk({ q: 0, r: 0 }, 4), ...hexRing({ q: 0, r: 0 }, 5).slice(0, 12)]
    : [...hexDisk({ q: 0, r: 0 }, 5)];
  return base.slice(0, count).map(cell);
}
const rules = { mode: 'normal' as const, noAuto: false, noRetreat: false, noItems: false,
  mercyAllowed: true, lethalIntent: false, friendlyFire: false, roundLimit: 30, boss: false,
  retry: true, skippable: false };
const hero = { unitRef: 'hero', source: { kind: 'character' as const, characterRef: 'protagonist' },
  side: 'player' as const, control: 'player' as const, spawnId: 'spawn_hero', state: 'active' as const,
  required: true, placement: { pos: { q: 0, r: 0 }, facing: 0 } };
const template = (unitRef: string, role: string, side: 'ally' | 'enemy', q: number, dreamLevel: number) => ({
  unitRef, source: { kind: 'template' as const, templateId: 'tmpl_normal', dreamLevel }, side,
  control: 'ai' as const, spawnId: `spawn_${unitRef}`, state: 'active' as const, required: true,
  placement: { pos: { q, r: 0 }, facing: side === 'enemy' ? 3 : 0 }, group: role,
});
const baseOutcome = { lose: [{ kind: 'unitDown' as const, unitRef: 'hero' }], draw: [],
  onDefeat: 'retry' as const, concede: 'forbidden' as const };

export const PROLOGUE_ENCOUNTERS: readonly EncounterDef[] = [
  { schemaVersion: 'encounter.v1', id: 'enc_00_zhulin',
    chapterId: 'ch00_yuenv', kind: 'story', arena: { kind: 'inline', topology: 'hex-pointy',
      anchorId: 'arena_zhulin', cells: grid(61) }, participants: [hero,
      template('road_swordsman_1', 'role_road_swordsman', 'enemy', 1, 1),
      template('road_swordsman_2', 'role_road_swordsman', 'enemy', -1, 1)],
    outcome: { ...baseOutcome, win: [{ kind: 'allHostileDown', side: 'player' }] }, rules,
    beats: [{ id: 'aqing_rescue', once: true, when: { kind: 'hpBelow', unitRef: 'hero', thresholdBp: 4_500 },
      actions: [{ kind: 'emit', event: 'battle/aqingRescue' }] },
    { id: 'spirit_demo', once: true, when: { kind: 'lossStreak', count: 3 },
      actions: [{ kind: 'offerDemonstration', replayId: 'replay_zhulin_demo' }] }], difficulty },
  { schemaVersion: 'encounter.v1', id: 'enc_00_baiyuan',
    chapterId: 'ch00_yuenv', kind: 'spar', arena: { kind: 'inline', topology: 'hex-pointy',
      anchorId: 'arena_baiyuan', cells: grid(73) }, participants: [hero,
      { unitRef: 'baiyuan', source: { kind: 'npc', npcId: 'npc_baiyuan' }, side: 'enemy',
        control: 'ai', spawnId: 'spawn_baiyuan', state: 'active', required: true,
        placement: { pos: { q: 1, r: 0 }, facing: 3 } }],
    outcome: { ...baseOutcome, onDefeat: 'continue', concede: 'advance', win: [
      { kind: 'hitCount', actorSide: 'player', targetSide: 'enemy', hits: 1 },
      { kind: 'surviveRounds', rounds: 2 }] },
    rules: { ...rules, mode: 'spar', noItems: true, retry: false, skippable: true },
    beats: [], difficulty },
  { schemaVersion: 'encounter.v1', id: 'enc_00_biandao',
    chapterId: 'ch00_yuenv', kind: 'story', arena: { kind: 'inline', topology: 'hex-pointy',
      anchorId: 'arena_biandao', cells: grid(91) }, participants: [hero,
      template('yue_soldier_1', 'role_yue_soldier', 'ally', -1, 2),
      template('wu_swordsman_1', 'role_wu_swordsman', 'enemy', 1, 2),
      template('wu_swordsman_2', 'role_wu_swordsman', 'enemy', 2, 2),
      { unitRef: 'aqing_projection', source: { kind: 'npc', npcId: 'npc_aqing' }, side: 'ally',
        control: 'ai', spawnId: 'spawn_aqing_projection', state: 'offgrid', required: false,
        placement: { pos: { q: 0, r: 1 }, facing: 0 } }],
    outcome: { ...baseOutcome, win: [{ kind: 'allHostileDown', side: 'player' }] },
    rules: { ...rules, mercyAllowed: true, lethalIntent: false },
    beats: [{ id: 'aqing_projection', once: true, when: { kind: 'lossStreak', count: 3 },
      actions: [{ kind: 'switchControl', unitRef: 'aqing_projection', control: 'player' }] }], difficulty },
];

export const PROLOGUE_TEMPLATE: CharacterTemplate = { schemaVersion: 'character-template.v1',
  id: 'tmpl_normal', role: 'normal', innate: { con: 50, str: 50, agi: 50, wis: 50, wil: 50,
    luk: 50, cha: 50 }, cultivationBand: { min: 1, max: 20, derived: true }, skillSeeds: [] };

export function prologueEncounterSources(): readonly { readonly ref: string; readonly seed: BattleUnitSeed }[] {
  const refs = ['protagonist', 'road_swordsman_1', 'road_swordsman_2', 'npc_baiyuan',
    'yue_soldier_1', 'wu_swordsman_1', 'wu_swordsman_2', 'npc_aqing'];
  return refs.map((ref) => ({ ref, seed: battleSeed(ref, [BASIC_MOVE]) }));
}
