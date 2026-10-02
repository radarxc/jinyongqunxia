import { floorDivInt } from '@tianshu/shared';
import type { GameState } from './models';

function walk(value: unknown, seen: Set<object>): void {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value)) throw new TypeError('STATE_NON_INTEGER');
    return;
  }
  if (typeof value !== 'object' || seen.has(value)) throw new TypeError('STATE_NOT_JSON');
  const prototype = Object.getPrototypeOf(value);
  if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null)
    throw new TypeError('STATE_NOT_JSON');
  seen.add(value);
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      if (!(index in value)) throw new TypeError('STATE_SPARSE_ARRAY');
      walk(value[index], seen);
    }
  } else {
    for (const key of Object.keys(value)) {
      const child = (value as Record<string, unknown>)[key];
      if (child === undefined) throw new TypeError('STATE_UNDEFINED');
      walk(child, seen);
    }
  }
  seen.delete(value);
}

type StateRecord = Record<string, unknown>;
function object(value: unknown, code = 'STATE_SHAPE'): StateRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new TypeError(code);
  return value as StateRecord;
}
function keys(value: StateRecord, expected: readonly string[]): void {
  const actual = Object.keys(value);
  const allowed = new Set(expected);
  if (actual.length !== expected.length || actual.some((key) => !allowed.has(key)))
    throw new TypeError('STATE_SHAPE');
}
function array(value: unknown): readonly unknown[] {
  if (!Array.isArray(value)) throw new TypeError('STATE_SHAPE');
  return value;
}
function string(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) throw new TypeError('STATE_SHAPE');
  return value;
}
function integer(value: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): number {
  if (!Number.isSafeInteger(value) || (value as number) < min || (value as number) > max)
    throw new TypeError('STATE_SHAPE');
  return value as number;
}
function strings(value: unknown): void {
  for (const entry of array(value)) string(entry);
}
function uniqueStrings(value: unknown): void {
  const entries = array(value);
  strings(entries);
  if (new Set(entries).size !== entries.length) throw new TypeError('STATE_SHAPE');
}
function validateStats(value: unknown): void {
  const row = object(value);
  keys(row, ['hpMax', 'mpMax', 'strength', 'speed', 'tenacity', 'coordination']);
  for (const entry of Object.values(row)) integer(entry);
}
function validatePermanentStat(value: unknown, fluxMax: number): void {
  const row = object(value); keys(row, ['grade', 'strengthLayer', 'strengthXp', 'fluxCap']);
  integer(row['grade'], 1, 12); integer(row['strengthLayer'], 1, 9);
  integer(row['strengthXp']); integer(row['fluxCap'], 1, fluxMax);
}
function validateAttempt(value: unknown): void {
  const row = object(value); keys(row, ['progressH', 'attemptOrdinal']);
  integer(row['progressH']); integer(row['attemptOrdinal']);
}
function validateMeridianProgress(value: unknown): void {
  const row = object(value);
  const required = ['schemaVersion', 'opened', 'meridianStats', 'acupointStats', 'targets',
    'turnCompleted', 'lastAppliedMigration'];
  const optional = ['turnTarget', 'turnState'];
  const actual = Object.keys(row);
  if (required.some((key) => !(key in row)) || actual.some((key) => !required.includes(key) && !optional.includes(key)))
    throw new TypeError('STATE_SHAPE');
  if (row['schemaVersion'] !== 2) throw new TypeError('STATE_SHAPE');
  uniqueStrings(row['opened']);
  const opened = new Set(row['opened'] as readonly string[]);
  const meridianStats = object(row['meridianStats']);
  for (const [id, entry] of Object.entries(meridianStats)) { string(id); validatePermanentStat(entry, 96); }
  const acupointStats = object(row['acupointStats']);
  for (const [id, entry] of Object.entries(acupointStats)) { string(id); validatePermanentStat(entry, 64); }
  if ([...opened].some((id) => !(id in acupointStats)) || Object.keys(acupointStats).some((id) => !opened.has(id)))
    throw new TypeError('STATE_SHAPE');
  const targets = object(row['targets']);
  for (const [id, entry] of Object.entries(targets)) {
    string(id); if (opened.has(id)) throw new TypeError('STATE_SHAPE'); validateAttempt(entry);
  }
  integer(row['turnCompleted'], 0, 9); integer(row['lastAppliedMigration']);
  if (('turnTarget' in row) !== ('turnState' in row)) throw new TypeError('STATE_SHAPE');
  if ('turnTarget' in row) { string(row['turnTarget']); validateAttempt(row['turnState']); }
}
function validateCharacter(value: unknown): void {
  const row = object(value);
  keys(row, ['characterId', 'status', 'innate', 'skills', 'meridians',
    'legacyHpCredit', 'legacyMpCredit', 'stats', 'resources']);
  string(row['characterId']);
  if (!['active', 'departed', 'dead'].includes(String(row['status']))) throw new TypeError('STATE_SHAPE');
  const innate = object(row['innate']);
  keys(innate, ['con', 'str', 'agi', 'wis', 'wil', 'luk', 'cha']);
  for (const entry of Object.values(innate)) integer(entry);
  for (const entry of array(row['skills'])) {
    const skill = object(entry);
    keys(skill, ['skillId', 'sourceGrade', 'sourceCap', 'trueLayer', 'sxp', 'learnedIn',
      'nativeTo', 'attunedGrade', 'attunedIn', 'latentExp', 'movesEquipped', 'insight', 'pages', 'flags']);
    string(skill['skillId']); integer(skill['sourceGrade'], 1, 12); integer(skill['sourceCap'], 1, 10);
    integer(skill['trueLayer'], 1, skill['sourceCap'] as number); integer(skill['sxp']);
    string(skill['learnedIn']); string(skill['nativeTo']);
    if ((skill['attunedGrade'] === null) !== (skill['attunedIn'] === null)) throw new TypeError('STATE_SHAPE');
    if (skill['attunedGrade'] !== null) integer(skill['attunedGrade'], 1, 12);
    if (skill['attunedIn'] !== null) string(skill['attunedIn']);
    integer(skill['latentExp']); uniqueStrings(skill['movesEquipped']);
    for (const page of array(skill['pages'])) integer(page, 1);
    uniqueStrings(skill['flags']); integer(skill['insight']);
  }
  validateMeridianProgress(row['meridians']);
  integer(row['legacyHpCredit']); integer(row['legacyMpCredit']); validateStats(row['stats']);
  const resources = object(row['resources']); keys(resources, ['hp', 'mp']);
  const stats = row['stats'] as StateRecord;
  integer(resources['hp'], 0, stats['hpMax'] as number); integer(resources['mp'], 0, stats['mpMax'] as number);
}
function validateClock(value: unknown): void {
  const row = object(value);
  keys(row, ['epochId', 'calendarSpecId', 'epochYear', 'elapsedTicks', 'shichenIndex',
    'dayIndex', 'monthIndex', 'yearOffset', 'slotInDay']);
  string(row['epochId']); string(row['calendarSpecId']); integer(row['epochYear'], Number.MIN_SAFE_INTEGER);
  integer(row['elapsedTicks']); integer(row['shichenIndex']); integer(row['dayIndex']);
  integer(row['monthIndex']); integer(row['yearOffset']); integer(row['slotInDay'], 0, 11);
}
function validateStory(value: unknown): void {
  const story = object(value); keys(story, ['chapterId', 'lines']); string(story['chapterId']);
  for (const entry of array(story['lines'])) {
    const line = object(entry);
    keys(line, ['lineId', 'status', 'activeNodeIds', 'completedNodeIds', 'expiredNodeIds',
      'chosenOptions', 'branchPath', 'resolvedWindows', 'appliedEffectIds', 'revision']);
    string(line['lineId']);
    if (!['locked', 'available', 'active', 'completed', 'expired'].includes(String(line['status'])))
      throw new TypeError('STATE_SHAPE');
    for (const field of ['activeNodeIds', 'completedNodeIds', 'expiredNodeIds', 'branchPath', 'appliedEffectIds'])
      uniqueStrings(line[field]);
    for (const value of Object.values(object(line['chosenOptions']))) string(value);
    for (const value of Object.values(object(line['resolvedWindows']))) {
      const window = object(value); keys(window, ['opensAtTick', 'closesAtTick', 'defersUsed']);
      integer(window['opensAtTick']); integer(window['closesAtTick']); integer(window['defersUsed']);
      if ((window['opensAtTick'] as number) >= (window['closesAtTick'] as number)) throw new TypeError('STATE_SHAPE');
    }
    integer(line['revision']);
  }
}
function validateRoadLeg(value: unknown): void {
  const leg = object(value); keys(leg, ['roadKey', 'from', 'to']);
  string(leg['roadKey']); string(leg['from']); string(leg['to']);
}
function validateMapPosition(value: unknown): void {
  const position = object(value);
  if (position['kind'] === 'node') {
    keys(position, ['kind', 'nodeId']); string(position['nodeId']); return;
  }
  keys(position, ['kind', 'leg', 'offsetLi']);
  if (position['kind'] !== 'road') throw new TypeError('STATE_SHAPE');
  validateRoadLeg(position['leg']); integer(position['offsetLi']);
}
function validateSceneEntry(value: unknown): void {
  const scene = object(value);
  keys(scene, ['sceneId', 'townSpec', 'templateYear', 'gateId', 'spawn', 'accessNote',
    'kind', 'nodeId', 'name', 'chapterId', 'era', 'returnNodeId']);
  for (const field of ['sceneId', 'accessNote', 'kind', 'nodeId', 'name', 'chapterId', 'era', 'returnNodeId'])
    string(scene[field]);
  for (const field of ['townSpec', 'gateId']) if (scene[field] !== null) string(scene[field]);
  if (scene['templateYear'] !== null) integer(scene['templateYear'], 1);
  if (scene['spawn'] !== null) {
    const point = array(scene['spawn']);
    if (point.length !== 2) throw new TypeError('STATE_SHAPE');
    integer(point[0]); integer(point[1]);
  }
}
function validateWorldMapStateShape(value: unknown): void {
  const map = object(value);
  keys(map, ['version', 'mapRevision', 'position', 'journey', 'nextJourneyId',
    'scene', 'law', 'lastMessage']);
  if (map['version'] !== 1) throw new TypeError('STATE_SHAPE');
  string(map['mapRevision']); validateMapPosition(map['position']); integer(map['nextJourneyId'], 1);
  if (typeof map['lastMessage'] !== 'string') throw new TypeError('STATE_SHAPE');
  const law = object(map['law']); keys(law, ['wantedLevel', 'normalCityGateBlocked']);
  integer(law['wantedLevel']);
  if (typeof law['normalCityGateBlocked'] !== 'boolean') throw new TypeError('STATE_SHAPE');
  if (map['scene'] !== null) validateSceneEntry(map['scene']);
  if (map['journey'] === null) return;
  const journey = object(map['journey']);
  keys(journey, ['id', 'destination', 'legs', 'legIndex', 'offsetLi', 'travelledLi',
    'totalLi', 'status']);
  integer(journey['id'], 1); string(journey['destination']);
  for (const leg of array(journey['legs'])) validateRoadLeg(leg);
  for (const field of ['legIndex', 'offsetLi', 'travelledLi', 'totalLi']) integer(journey[field]);
  if (!['walking', 'paused', 'encounter'].includes(String(journey['status'])))
    throw new TypeError('STATE_SHAPE');
}
function validateGameStateShape(value: StateRecord): void {
  keys(value, ['meta', 'profile', 'chapter', 'party', 'transient', 'battle']);
  const meta = object(value['meta']);
  keys(meta, ['coreVersion', 'rngProtocol', 'stateVersion', 'worldTick', 'nextEventSeq', 'rng']);
  string(meta['coreVersion']); integer(meta['rngProtocol'], 1); integer(meta['stateVersion']);
  integer(meta['worldTick']); integer(meta['nextEventSeq'], 1);
  const rng = object(meta['rng']); keys(rng, ['battle', 'loot', 'world', 'ai', 'qiyu']);
  for (const state of Object.values(rng)) {
    const words = array(state);
    if (words.length !== 4) throw new TypeError('STATE_SHAPE');
    for (const word of words) integer(word, 0, 0xffff_ffff);
  }
  const profile = object(value['profile']); keys(profile, ['protagonist', 'companions']);
  if (profile['protagonist'] !== null) validateCharacter(profile['protagonist']);
  for (const companion of array(profile['companions'])) validateCharacter(companion);
  const chapter = object(value['chapter']);
  keys(chapter, ['chapterId', 'worldYear', 'clock', 'story', 'worldItems', 'shops', 'worldMap']);
  string(chapter['chapterId']); integer(chapter['worldYear'], Number.MIN_SAFE_INTEGER); validateClock(chapter['clock']);
  validateStory(chapter['story']);
  const worldItems = object(chapter['worldItems']); keys(worldItems, ['entries']);
  for (const entry of array(worldItems['entries'])) {
    const item = object(entry); keys(item, ['instanceKey', 'itemId', 'count', 'locationId', 'collectible', 'pickedUp']);
    string(item['instanceKey']); string(item['itemId']); integer(item['count'], 1); string(item['locationId']);
    if (typeof item['collectible'] !== 'boolean' || typeof item['pickedUp'] !== 'boolean') throw new TypeError('STATE_SHAPE');
  }
  for (const entry of array(chapter['shops'])) {
    const shop = object(entry); keys(shop, ['shopKey', 'stock']); string(shop['shopKey']);
    for (const stockEntry of array(shop['stock'])) {
      const stock = object(stockEntry); keys(stock, ['itemId', 'count', 'lastRestockDay']);
      string(stock['itemId']); integer(stock['count']); integer(stock['lastRestockDay']);
    }
  }
  if (chapter['worldMap'] !== null) validateWorldMapStateShape(chapter['worldMap']);
  const party = object(value['party']); keys(party, ['inventory', 'equipment', 'money']); integer(party['money']);
  const inventory = object(party['inventory']); keys(inventory, ['stacks']);
  for (const entry of array(inventory['stacks'])) { const stack = object(entry); keys(stack, ['itemId', 'count']); string(stack['itemId']); integer(stack['count'], 1); }
  const equipment = object(party['equipment']); keys(equipment, ['entries']);
  for (const entry of array(equipment['entries'])) {
    const slot = object(entry); keys(slot, ['slot', 'itemId']); string(slot['slot']);
    if (slot['itemId'] !== null) string(slot['itemId']);
  }
  const transient = object(value['transient']); keys(transient, ['pendingTimeAdvance', 'dialogue', 'battle']);
  if (transient['pendingTimeAdvance'] !== null) {
    const pending = object(transient['pendingTimeAdvance']); keys(pending, ['remainingTicks', 'reason']); integer(pending['remainingTicks']);
    if (pending['reason'] !== 'rest' && pending['reason'] !== 'story') throw new TypeError('STATE_SHAPE');
  }
  if (transient['dialogue'] !== null || transient['battle'] !== null || value['battle'] !== null) throw new TypeError('STATE_SHAPE');
}

export function assertCanonicalGameState(state: GameState): void {
  walk(state, new Set<object>());
  if (state.meta.worldTick !== state.chapter.clock.elapsedTicks) throw new TypeError('STATE_CLOCK_MISMATCH');
  if (state.chapter.worldYear !== state.chapter.clock.epochYear + state.chapter.clock.yearOffset) throw new TypeError('STATE_YEAR_MISMATCH');
  const ticks = state.chapter.clock.elapsedTicks;
  const dayIndex = floorDivInt(ticks, 14400);
  const monthIndex = floorDivInt(dayIndex, 30);
  const minuteOfDay = floorDivInt(ticks, 10) % 1440;
  if (state.chapter.clock.shichenIndex !== floorDivInt(ticks + 600, 1200) ||
      state.chapter.clock.dayIndex !== dayIndex || state.chapter.clock.monthIndex !== monthIndex ||
      state.chapter.clock.yearOffset !== floorDivInt(monthIndex, 12) ||
      state.chapter.clock.slotInDay !== floorDivInt((minuteOfDay - 1380 + 1440) % 1440, 120))
    throw new TypeError('STATE_CLOCK_DERIVED');
}

export function parseGameState(value: unknown): GameState {
  walk(value, new Set<object>());
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new TypeError('STATE_ROOT');
  validateGameStateShape(value as StateRecord);
  const state = value as unknown as GameState;
  assertCanonicalGameState(state);
  return state;
}
