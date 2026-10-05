import { buildEncounter, type BattleMove, type BattleUnitSeed,
  type HexPrimitiveShape } from '@tianshu/core/battle';
import type { CharacterState, GameState } from '@tianshu/core/state';
import { compileBattleMove, type EncounterDef, type MoveDef } from '@tianshu/data/schemas';
import { canonicalJson, type JsonValue } from '@tianshu/shared';
import type { BattleLaunch } from '../battle/contracts';
import type { GameContent, GameNpcDef } from './content';

function hash32(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index); hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}
const ROLE_SLOT_UUID_NAMESPACE_V1 = 'd9014055-8a15-5c3e-9719-ff6c8a3167c4';
const encoder = new TextEncoder();
function uuidBytes(value: string): Uint8Array {
  const hex = value.replaceAll('-', '');
  if (!/^[0-9a-f]{32}$/u.test(hex)) throw new TypeError('UUID_NAMESPACE_INVALID');
  return Uint8Array.from({ length: 16 }, (_, index) =>
    Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16));
}
function formatUuid(bytes: Uint8Array): string {
  const hex = [...bytes].map((value) => value.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
async function roleSlotUuid(name: string): Promise<string> {
  const namespace = uuidBytes(ROLE_SLOT_UUID_NAMESPACE_V1);
  const encoded = encoder.encode(name); const input = new Uint8Array(namespace.length + encoded.length);
  input.set(namespace); input.set(encoded, namespace.length);
  const digest = new Uint8Array(await globalThis.crypto.subtle.digest('SHA-1', input));
  digest[6] = (digest[6]! & 0x0f) | 0x50; digest[8] = (digest[8]! & 0x3f) | 0x80;
  return formatUuid(digest.slice(0, 16));
}
async function sha256Hex(value: string): Promise<string> {
  const digest = new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256', encoder.encode(value)));
  return [...digest].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
const guard = (value: number) => ({ qi: 0, carryCapacity: Math.max(1, value),
  strengthBp: 10_000, flowRatioBp: 10_000, breakGuardBp: 0 });
function battleMove(move: MoveDef, subType?: string): BattleMove {
  const compiled = compileBattleMove(move);
  const shape: HexPrimitiveShape = compiled.shape.tpl === 'aoe_single'
    ? { tpl: 'aoe_single', ...(compiled.shape.includeEmpty === undefined
      ? {} : { includeEmpty: compiled.shape.includeEmpty }) }
    : compiled.shape;
  return { ...compiled, shape, skillId: move.skillId as `sk_${string}`,
    ...(subType === undefined ? {} : { subType }) };
}
function fallbackMove(): BattleMove {
  return { id: 'mv_basic_strike', skillId: 'sk_basic',
    powerBp: 8_000, referencePowerBp: 10_000, wInBp: 3_500, recovery: 900, mpCost: 0,
    hitZone: 'body', autoTargetCap: 1, range: { min: 1, max: 1 }, delivery: 'melee',
    shape: { tpl: 'aoe_single' }, hTol: 2, target: 'enemy', friendlyFire: 'none' };
}
function seed(id: string, level: number, innate: Readonly<Record<string, number>>,
  hp: number, hpMax: number, mp: number, mpMax: number,
  moves: readonly BattleMove[]): BattleUnitSeed {
  const str = innate['str'] ?? 50; const agi = innate['agi'] ?? 50;
  const con = innate['con'] ?? 50; const wis = innate['wis'] ?? 50;
  const attack = 80 + level * 10 + str; const defense = 65 + level * 8 + con;
  return { id, hp, hpMax, mp, mpMax, shield: 0, ctFrozen: false, pendingShift: 0,
    spd: 70 + agi, qinggong: agi, openingQinggong: agi, openingPriority: 0, agi,
    stats: { level, atkOut: attack, atkIn: attack, defOut: defense, defIn: defense,
      aptitude: wis, aptitudeInner: wis, critDamagePct: 150, hit: 80 + agi, eva: agi,
      parry: 30 + wis, pierce: 30 + str, crit: 20 + agi, tough: 30 + con, strength: str },
    moves, zoneGuards: { body: guard(mpMax), hand: guard(mpMax), leg: guard(mpMax) }, buffs: [],
    foreignQi: [], acupointOccupancies: [], ownActions: 0 };
}
function characterSeed(character: CharacterState, id: string, moves: readonly BattleMove[]): BattleUnitSeed {
  const level = Math.max(1, character.skills.reduce((best, row) => Math.max(best, row.trueLayer), 1));
  const pendingFirstSleep = ['con', 'str', 'bre', 'agi', 'wis', 'wil']
    .every((key) => character.innate[key as keyof CharacterState['innate']] === 0);
  const battleInnate = pendingFirstSleep ? { ...character.innate,
    con: 50, str: 50, bre: 50, agi: 50, wis: 50, wil: 50 } : character.innate;
  return seed(id, level, battleInnate, character.resources.hp, character.stats.hpMax,
    character.resources.mp, character.stats.mpMax, moves);
}
function npcSeed(npc: GameNpcDef, chapter: string, id: string, moves: readonly BattleMove[]): BattleUnitSeed {
  const appearance = npc.appearances.find((row) => row.chapterId === chapter);
  if (!appearance?.combatEligible) throw new RangeError(`ENCOUNTER_NPC_NOT_COMBAT:${npc.id}`);
  const build = appearance.build;
  const level = build.pipeline === 'full' ? build.cultivationBand
    : Math.max(1, build.ageBand === 'elder' ? 12 : build.ageBand === 'child' ? 1 : 5);
  const hp = 300 + level * 60; const mp = 160 + level * 25;
  return seed(id, level, { con: 55, str: 55, agi: npc.id === 'npc_baiyuan' ? 75 : 50, wis: 50 },
    hp, hp, mp, mp, moves);
}
function sourceMoves(content: GameContent, builds: readonly { readonly skillId: string;
  readonly trueLayer: number; readonly movesEquipped?: readonly string[] }[]): readonly BattleMove[] {
  const moveById = new Map((content.moves ?? []).map((row) => [row.id, row]));
  const selected: MoveDef[] = [];
  for (const build of builds) {
    const skill = content.skills.find((row) => row.id === build.skillId);
    if (!skill) continue;
    const unlocked = skill.moveIds.flatMap((id) => {
      const move = moveById.get(id);
      return move?.skillId === skill.id && move.unlock <= build.trueLayer ? [move] : [];
    });
    const equipped = build.movesEquipped?.flatMap((id) => {
      const move = moveById.get(id);
      return move && unlocked.includes(move) ? [move] : [];
    }) ?? [];
    selected.push(...(equipped.length > 0 ? equipped : unlocked));
  }
  const authored = selected.filter((row, index) => selected.findIndex((other) => other.id === row.id) === index)
    .map((move) => battleMove(move, content.skills.find((skill) =>
      skill.id === move.skillId)?.subType));
  return authored.some((move) => move.id === 'mv_basic_strike')
    ? authored : [...authored, fallbackMove()];
}
function lossStreak(state: GameState, encounter: EncounterDef): number {
  const flags = encounter.settlement?.lossFlags ?? []; const switches = state.profile.replayRules?.switches ?? {};
  let result = 0;
  for (let index = 0; index < flags.length; index += 1)
    if (switches[flags[index]!] === true) result = index + 1;
  return result;
}
function launchPresentation(encounter: EncounterDef, built: ReturnType<typeof buildEncounter>,
  content: GameContent): Omit<BattleLaunch, 'setup' | 'seeds'> {
  const names = new Map<string, string>([['hero', '主角'], ['baiyuan', '白猿'],
    ['road_swordsman_1', '持剑路卒甲'], ['road_swordsman_2', '持剑路卒乙'],
    ['yue_soldier_1', '越卒'], ['wu_swordsman_1', '吴剑士甲'], ['wu_swordsman_2', '吴剑士乙']]);
  return { cells: built.setup.grid.cells.map((cell) => ({ q: cell.q, r: cell.r, height: cell.height,
    terrain: cell.terrainId ?? (cell.canopy > 0 ? 'tr_zhulin' : 'tr_pingdi'),
    label: cell.terrainId ?? (cell.canopy > 0 ? '竹林' : '战场'),
    color: cell.canopy > 0 ? 0x79966c : 0xc8b994 })),
  markers: built.setup.start.initialByUnit.map((row, index) => ({ id: row.unitRef, index,
    name: names.get(row.unitRef) ?? row.unitRef, q: row.pos.q, r: row.pos.r,
    height: built.setup.grid.cells.find((cell) => cell.q === row.pos.q && cell.r === row.pos.r)?.height ?? 0,
    facing: row.facing, active: true, equipment: {} })),
  moves: built.seeds.flatMap((row) => row.moves).filter((move, index, rows) =>
    rows.findIndex((candidate) => candidate.id === move.id) === index).map((move) => ({ id: move.id,
    name: content.moves?.find((row) => row.id === move.id)?.name ?? '普通一击',
    skillId: move.skillId ?? 'sk_basic',
    skillName: content.skills.find((row) => row.id === move.skillId)?.name ?? '基本功',
    shape: move.shape, range: move.range.max })), title: encounter.id, preview: false };
}

export interface WorldEncounterRequest { readonly encounterId: string; readonly anchorId: string }
export async function prepareWorldEncounter(content: GameContent, state: GameState,
  request: WorldEncounterRequest): Promise<BattleLaunch> {
  const encounter = content.encounters?.find((row) => row.id === request.encounterId);
  if (!encounter || encounter.chapterId !== state.chapter.chapterId)
    throw new RangeError(`ENCOUNTER_UNKNOWN:${request.encounterId}`);
  const units = await Promise.all(encounter.participants.map(async (participant, participantIndex) => {
    const source = participant.source;
    if (source.kind === 'character') {
      const character = source.characterRef === 'protagonist' ? state.profile.protagonist
        : state.profile.companions.find((row) =>
          `companion:${row.characterId}` === source.characterRef);
      if (!character) throw new RangeError(`ENCOUNTER_CHARACTER_MISSING:${source.characterRef}`);
      return { ref: source.characterRef, seed: characterSeed(character, participant.unitRef,
        sourceMoves(content, character.skills)) };
    }
    if (source.kind === 'npc') {
      const npc = content.npcs.find((row) => row.id === source.npcId);
      if (!npc) throw new RangeError(`ENCOUNTER_NPC_MISSING:${source.npcId}`);
      const appearance = npc.appearances.find((row) => row.chapterId === encounter.chapterId);
      const builds = appearance?.build.pipeline === 'full' ? appearance.build.skills : [];
      return { ref: source.npcId, seed: npcSeed(npc, encounter.chapterId, participant.unitRef,
        sourceMoves(content, builds)) };
    }
    const template = content.templates?.find((row) => row.id === source.templateId);
    if (!template) throw new RangeError(`ENCOUNTER_TEMPLATE_MISSING:${source.templateId}`);
    const role = participant.group === undefined ? undefined
      : content.roleSlots?.find((row) => row.slotId === participant.group);
    if (participant.group !== undefined && (!role || role.templateId !== template.id ||
        role.dreamTier !== source.dreamLevel))
      throw new RangeError(`ENCOUNTER_ROLE_SLOT_MISMATCH:${participant.group}`);
    const spawnOrdinal = encounter.participants.slice(0, participantIndex)
      .filter((row) => row.group === participant.group).length;
    if (role && spawnOrdinal >= role.count) throw new RangeError(`ENCOUNTER_ROLE_SLOT_COUNT:${role.slotId}`);
    const sourceInstanceId = await roleSlotUuid(canonicalJson([state.meta.runId, encounter.chapterId,
      template.id, participant.spawnId, spawnOrdinal] as unknown as JsonValue));
    const stable = hash32(sourceInstanceId);
    const level = source.dreamLevel; const innate = { ...template.innate,
      agi: Math.max(1, Math.min(100, template.innate.agi + (stable % 5) - 2)) };
    const hp = 300 + level * 50; const mp = 180 + level * 20;
    return { ref: participant.unitRef, sourceInstanceId, seed: seed(participant.unitRef, level, innate,
      hp, hp, mp, mp, sourceMoves(content, template.skillSeeds)) };
  }));
  const difficulty = state.profile.replayRules?.difficulty ?? 'diff_xiake';
  const arena = encounter.arena;
  const regionMap = arena.kind === 'regionArena'
    ? content.regionMaps?.find((map) => map.regionId === arena.regionId
      && map.id === arena.sceneId) : undefined;
  const sourceHash = await sha256Hex(canonicalJson({ encounter, units, difficulty,
    inventory: state.party.inventory, itemDefs: content.items,
    ...(regionMap === undefined ? {} : { regionMap }) } as unknown as JsonValue));
  const built = buildEncounter(encounter, { setupId: `encounter-${encounter.id}`,
    seed: hash32(`${state.meta.masterSeed}/${encounter.id}/${state.meta.nextRuntimeOrdinal}`),
    sourceSnapshotHash: sourceHash, sourceId: encounter.id, triggerId: request.anchorId,
    worldTick: state.meta.worldTick, difficulty,
    lossStreak: lossStreak(state, encounter), units, templates: content.templates ?? [],
    ...(content.regionMaps === undefined ? {} : { regionMaps: content.regionMaps }),
    sceneRef: state.world.navigation.locationId,
    anchorRef: request.anchorId, inventory: state.party.inventory, itemDefs: content.items as never });
  return { setup: built.setup, seeds: built.seeds, ...launchPresentation(encounter, built, content) };
}
