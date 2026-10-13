import type { CharacterTemplate, EncounterDef, RegionMap } from '@tianshu/data/schemas';
import { floorDivInt, mulBpFloor } from '@tianshu/shared';
import type { DifficultyId } from '../../state';
import { decodeRegionMap } from '../../world/region-codec';
import type { BattleUnitSeed } from './index';
import { createEncounterBattleSetup } from './index';
import type { BattleCondition, BattleGridCell, BattleSetup } from '../types';
import type { HexDir } from '../../hex';

export interface EncounterUnitSource {
  readonly ref: string; readonly seed: BattleUnitSeed;
}
export interface EncounterBuildContext {
  readonly setupId: string; readonly seed: number; readonly sourceSnapshotHash: string;
  readonly sourceId: string; readonly triggerId: string; readonly worldTick: number;
  readonly lossStreak?: number;
  readonly difficulty: DifficultyId; readonly units: readonly EncounterUnitSource[];
  readonly templates: readonly CharacterTemplate[]; readonly regionMaps?: readonly RegionMap[];
  readonly sceneRef?: string; readonly anchorRef?: string;
  readonly meridianInputs?: BattleSetup['meridianInputs'];
  readonly inventory?: BattleSetup['inventory']; readonly itemDefs?: BattleSetup['itemDefs'];
}
export interface EncounterBuildResult { readonly setup: BattleSetup; readonly seeds: readonly BattleUnitSeed[] }

const MODE_MOD: Readonly<Record<DifficultyId, { readonly hp: number; readonly attack: number;
  readonly rating: number; readonly speed: number }>> = {
  diff_jianghu: { hp: 8_000, attack: 8_000, rating: -8, speed: 9_500 },
  diff_xiake: { hp: 10_000, attack: 10_000, rating: 0, speed: 10_000 },
  diff_zongshi: { hp: 12_000, attack: 11_200, rating: 6, speed: 10_300 },
};
export const ENCOUNTER_TEMPLATE_BP = {
  tmpl_normal: { hp: 6_000, attack: 10_000, defense: 8_500, mp: 10_000, rating: -10, speed: 9_500 },
  tmpl_elite: { hp: 13_000, attack: 11_000, defense: 10_000, mp: 10_000, rating: 0, speed: 10_000 },
  tmpl_head: { hp: 26_000, attack: 11_500, defense: 11_000, mp: 15_000, rating: 8, speed: 10_300 },
  tmpl_boss: { hp: 40_000, attack: 12_500, defense: 12_000, mp: 20_000, rating: 15, speed: 10_600 },
} as const;
const RATING_KEYS = ['hit', 'eva', 'parry', 'pierce', 'crit', 'tough'] as const;
type TemplateRole = CharacterTemplate['role'];

function standardTemplateRole(templateId: string): TemplateRole | undefined {
  if (templateId === 'tmpl_normal') return 'normal';
  if (templateId === 'tmpl_elite') return 'elite';
  if (templateId === 'tmpl_head') return 'head';
  if (templateId === 'tmpl_boss') return 'boss';
  return undefined;
}

function scaled(value: number, ...multipliers: readonly number[]): number {
  return multipliers.reduce((current, multiplier) => mulBpFloor(current, multiplier), value);
}
function cloneSeed(seed: BattleUnitSeed): BattleUnitSeed {
  return { ...seed, stats: { ...seed.stats }, moves: seed.moves.map((move) => ({ ...move,
    range: { ...move.range }, shape: { ...move.shape } })),
    zoneGuards: { body: { ...seed.zoneGuards.body }, hand: { ...seed.zoneGuards.hand },
      leg: { ...seed.zoneGuards.leg } }, buffs: seed.buffs.map((row) => ({ ...row })),
    foreignQi: seed.foreignQi.map((row) => ({ ...row, reversePath: row.reversePath.map((step) => ({ ...step })) })),
    acupointOccupancies: seed.acupointOccupancies.map((row) => ({ ...row,
      affectedRouteRefs: [...row.affectedRouteRefs] })) };
}

export function expandEncounterUnitSeed(seed: BattleUnitSeed, participant: EncounterDef['participants'][number],
  templateRole: TemplateRole | undefined, difficulty: DifficultyId, localDifficultyBp: number): BattleUnitSeed {
  const copy = cloneSeed(seed);
  if (participant.source.kind !== 'template') return copy;
  const role = templateRole ?? standardTemplateRole(participant.source.templateId);
  if (role === undefined) throw new RangeError('ENCOUNTER_TEMPLATE_UNSUPPORTED');
  const template = ENCOUNTER_TEMPLATE_BP[`tmpl_${role}`];
  const bossHpBp = role === 'boss' ? 40_000 + 5_000 * Math.min(6,
    Math.max(0, floorDivInt(participant.source.dreamLevel - 1, 10))) : template.hp;
  const mode = MODE_MOD[difficulty];
  const enemyBp = participant.side === 'enemy' ? localDifficultyBp : 10_000;
  const hpModeBp = participant.side === 'enemy' ? mode.hp : 10_000;
  const attackModeBp = participant.side === 'enemy' ? mode.attack : 10_000;
  const hpMax = Math.max(1, scaled(copy.hpMax, bossHpBp, enemyBp, hpModeBp));
  const mpMax = Math.max(0, scaled(copy.mpMax, template.mp));
  const stats = { ...copy.stats, level: participant.source.dreamLevel,
    atkOut: scaled(copy.stats.atkOut, template.attack, enemyBp, attackModeBp),
    atkIn: scaled(copy.stats.atkIn, template.attack, enemyBp, attackModeBp),
    defOut: scaled(copy.stats.defOut, template.defense),
    defIn: scaled(copy.stats.defIn, template.defense) };
  for (const key of RATING_KEYS) stats[key] += template.rating
    + (participant.side === 'enemy' ? mode.rating : 0);
  return { ...copy, hpMax, hp: Math.min(hpMax, scaled(copy.hp, bossHpBp, enemyBp, hpModeBp)),
    mpMax, mp: Math.min(mpMax, scaled(copy.mp, template.mp)),
    spd: scaled(copy.spd, template.speed, participant.side === 'enemy' ? mode.speed : 10_000), stats };
}

function condition(condition: EncounterDef['outcome']['win'][number]): BattleCondition {
  if (condition.kind === 'allHostileDown') return { kind: condition.kind, side: condition.side };
  if (condition.kind === 'unitDown') return { kind: condition.kind, unitRef: condition.unitRef };
  if (condition.kind === 'surviveRounds') return { kind: condition.kind, rounds: condition.rounds };
  if (condition.kind === 'actionLimit') return { kind: condition.kind, actions: condition.actions };
  return { kind: condition.kind, actorSide: condition.actorSide,
    targetSide: condition.targetSide, hits: condition.hits };
}

function arenaGrid(definition: EncounterDef, context: EncounterBuildContext):
  { readonly grid: readonly BattleGridCell[]; readonly sceneRef: string; readonly anchorRef: string } {
  if (definition.arena.kind === 'inline') return { grid: definition.arena.cells.map((cell) => ({
    ...cell, ...(cell.cover === null ? {} : { cover: { ...cell.cover,
      ...(cell.cover.sourceDirs === undefined ? {}
        : { sourceDirs: cell.cover.sourceDirs as readonly HexDir[] }) } }) })) as readonly BattleGridCell[],
    sceneRef: `inline:${definition.id}`, anchorRef: definition.arena.anchorId };
  const arenaRef = definition.arena;
  const map = context.regionMaps?.find((row) => row.regionId === arenaRef.regionId
    && row.id === arenaRef.sceneId);
  if (map === undefined) throw new RangeError('ENCOUNTER_REGION_MAP_MISSING');
  const objects = [...map.objects, ...map.chunks.flatMap((chunk) => chunk.objects)];
  const arena = objects.find((row) => row.class === 'BattleArena'
    && row.id === arenaRef.arenaId);
  if (arena === undefined || arena.class !== 'BattleArena')
    throw new RangeError('ENCOUNTER_BATTLE_ARENA_MISSING');
  if (arena.encounterId !== undefined && arena.encounterId !== definition.id)
    throw new RangeError('ENCOUNTER_BATTLE_ARENA_ENCOUNTER');
  const onField = definition.participants.filter((row) => row.state !== 'offgrid');
  const playerCount = onField.filter((row) => row.side === 'player' || row.side === 'ally').length;
  const enemyCount = onField.filter((row) => row.side === 'enemy').length;
  if (playerCount > arena.playerCapacity || enemyCount > arena.enemyCapacity
    || onField.length > arena.playerCapacity + arena.enemyCapacity)
    throw new RangeError('ENCOUNTER_BATTLE_ARENA_CAPACITY');
  const arenaCells = new Set(arena.cells.map((cell) => `${cell.q},${cell.r}`));
  const grid = decodeRegionMap(map, 5, 3).cells.filter((cell) => arenaCells.has(`${cell.q},${cell.r}`))
    .map((cell): BattleGridCell => ({ q: cell.q, r: cell.r, height: cell.height,
      moveCost: cell.moveCost, canopy: 0, los: 'none', standable: cell.standable,
      narrow: cell.narrow, dangerous: cell.dangerous, terrainDealtBp: 0,
      terrainTakenBp: 0, cover: null }));
  if (grid.length !== arena.cells.length) throw new RangeError('ENCOUNTER_BATTLE_ARENA_GRID');
  return { grid, sceneRef: map.id, anchorRef: arena.id };
}

export function buildEncounter(definition: EncounterDef, context: EncounterBuildContext): EncounterBuildResult {
  const arena = arenaGrid(definition, context);
  const participants = definition.participants.map((row) => ({ unitRef: row.unitRef, side: row.side,
    control: row.control, spawn: row.spawnId, state: row.state, required: row.required,
    ...(row.group === undefined ? {} : { group: row.group }) }));
  const seeds = definition.participants.map((participant) => {
    const sourceRef = participant.source.kind === 'npc' ? participant.source.npcId
      : participant.source.kind === 'character' ? participant.source.characterRef
      : participant.unitRef;
    const source = context.units.find((row) => row.ref === sourceRef);
    if (source === undefined) throw new RangeError(`ENCOUNTER_UNIT_SOURCE_MISSING:${sourceRef}`);
    let templateRole: TemplateRole | undefined;
    if (participant.source.kind === 'template') {
      const templateId = participant.source.templateId;
      const template = context.templates.find((row) => row.id === templateId);
      if (template === undefined)
        throw new RangeError(`ENCOUNTER_TEMPLATE_MISSING:${templateId}`);
      templateRole = template.role;
    }
    const seed = expandEncounterUnitSeed(source.seed, participant, templateRole, context.difficulty,
      definition.difficulty.enemyStatBp);
    return seed.id === participant.unitRef ? seed : { ...seed, id: participant.unitRef };
  });
  const setup = createEncounterBattleSetup({ encounterId: definition.id as `enc_${string}`, setupId: context.setupId,
    seed: context.seed, sourceSnapshotHash: context.sourceSnapshotHash, sourceId: context.sourceId,
    triggerId: context.triggerId, worldTick: context.worldTick, participants,
    sceneRef: context.sceneRef ?? arena.sceneRef, anchorRef: context.anchorRef ?? arena.anchorRef,
    grid: arena.grid,
    initialUnits: definition.participants.map((row) => ({
      unitRef: row.unitRef, pos: row.placement.pos, facing: row.placement.facing as HexDir,
    })), mode: definition.rules.mode, noAuto: definition.rules.noAuto,
    noRetreat: definition.rules.noRetreat, noItems: definition.rules.noItems,
    mercyAllowed: definition.rules.mercyAllowed, lethalIntent: definition.rules.lethalIntent,
    friendlyFire: definition.rules.friendlyFire, roundLimit: definition.rules.roundLimit,
    boss: definition.rules.boss, winCond: definition.outcome.win.map(condition),
    loseCond: definition.outcome.lose.map(condition), drawCond: definition.outcome.draw.map(condition),
    onDefeat: definition.outcome.onDefeat as BattleSetup['end']['onDefeat'],
    concede: definition.outcome.concede,
    retryAllowed: definition.rules.retry, skippable: definition.rules.skippable,
    scriptBeats: definition.beats, lossStreak: context.lossStreak ?? 0,
    ...(context.meridianInputs === undefined ? {} : { meridianInputs: context.meridianInputs }),
    ...(context.inventory === undefined ? {} : { inventory: context.inventory }),
    ...(context.itemDefs === undefined ? {} : { itemDefs: context.itemDefs }) });
  return { setup, seeds };
}
