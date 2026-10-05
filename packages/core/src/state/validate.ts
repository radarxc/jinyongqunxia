import { floorDivInt } from '@tianshu/shared';
import { RNG_PROTOCOL } from '../rng';
import { isRegionTerrainId } from '../world/region-codec';
import { RULES_PROTOCOL, SAVE_SCHEMA } from './initial';
import type { GameState } from './models';
import { completeAppendValidation, invalidateAppendValidation, isVerifiedFrozenJson, markVerifiedFrozenJson,
  verifiedAppendLength } from './immutable-json';

function walk(value: unknown, seen: Set<object>, appendOnlyHistory = false): void {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value)) throw new TypeError('STATE_NON_INTEGER');
    return;
  }
  if (typeof value !== 'object' || seen.has(value)) throw new TypeError('STATE_NOT_JSON');
  if (isVerifiedFrozenJson(value)) return;
  const prototype = Object.getPrototypeOf(value);
  if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null)
    throw new TypeError('STATE_NOT_JSON');
  seen.add(value);
  if (Array.isArray(value)) {
    if (!appendOnlyHistory) invalidateAppendValidation(value);
    for (let index = appendOnlyHistory ? verifiedAppendLength(value) : 0; index < value.length; index += 1) {
      if (!(index in value)) throw new TypeError('STATE_SPARSE_ARRAY');
      walk(value[index], seen, appendOnlyHistory);
    }
    completeAppendValidation(value);
  } else {
    for (const key of Object.keys(value)) {
      const child = (value as Record<string, unknown>)[key];
      if (child === undefined) throw new TypeError('STATE_UNDEFINED');
      walk(child, seen, appendOnlyHistory);
    }
  }
  seen.delete(value);
  markVerifiedFrozenJson(value);
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
function validateCounters(value: unknown): void {
  for (const [id, count] of Object.entries(object(value))) { string(id); integer(count); }
}
function validateConsumableState(value: unknown): void {
  const row = object(value);
  keys(row, ['stamina', 'staminaMax', 'ailments', 'temporaryEffects',
    'permanentBonuses', 'meridianAids']);
  integer(row['stamina']); integer(row['staminaMax']);
  if ((row['stamina'] as number) > (row['staminaMax'] as number)) throw new TypeError('STATE_SHAPE');
  for (const entry of array(row['ailments'])) {
    const ailment = object(entry); keys(ailment, ['tag', 'grade']);
    string(ailment['tag']); integer(ailment['grade']);
  }
  for (const entry of array(row['temporaryEffects'])) {
    const effect = object(entry); keys(effect, ['op', 'grade', 'params']);
    string(effect['op']); integer(effect['grade']); object(effect['params']);
  }
  const bonuses = object(row['permanentBonuses']);
  keys(bonuses, ['stats', 'hpMaxBp', 'mpMaxBp']);
  validateCounters(bonuses['stats']); integer(bonuses['hpMaxBp']); integer(bonuses['mpMaxBp']);
  for (const entry of array(row['meridianAids'])) {
    const aid = object(entry);
    const required = ['sourceItemId', 'expiresAtTick', 'rateBp', 'successBp', 'costReduceBp'];
    const actual = Object.keys(aid);
    if (required.some((key) => !(key in aid)) ||
        actual.some((key) => !required.includes(key) && key !== 'meridians'))
      throw new TypeError('STATE_SHAPE');
    string(aid['sourceItemId']);
    for (const field of required.slice(1)) integer(aid[field]);
    if ('meridians' in aid) uniqueStrings(aid['meridians']);
  }
}
function validateCharacter(value: unknown): void {
  const row = object(value);
  keys(row, ['characterId', 'status', 'innate', 'skills', 'meridians',
    'legacyHpCredit', 'legacyMpCredit', 'stats', 'resources', 'consumable']);
  string(row['characterId']);
  if (!['active', 'departed', 'dead'].includes(String(row['status']))) throw new TypeError('STATE_SHAPE');
  const innate = object(row['innate']);
  keys(innate, ['con', 'str', 'bre', 'agi', 'wis', 'wil', 'luk', 'cha']);
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
  validateConsumableState(row['consumable']);
}
function validateRngState(value: unknown): void {
  const words = array(value);
  if (words.length !== 4) throw new TypeError('STATE_SHAPE');
  for (const word of words) integer(word, 0, 0xffff_ffff);
}
function validateBattleSession(value: unknown, appendOnlyHistory: boolean): void {
  const session = object(value);
  keys(session, ['schema', 'battleId', 'battle', 'battleRng', 'aiRng', 'opening',
    'acceptedOrdinal', 'decisionOrdinal', 'revision', 'retryCount', 'auto', 'outcomeSeq',
    'commandLog']);
  if (session['schema'] !== 'battle-session.v1') throw new TypeError('STATE_SHAPE');
  string(session['battleId']); validateRngState(session['battleRng']); validateRngState(session['aiRng']);
  for (const field of ['acceptedOrdinal', 'decisionOrdinal', 'revision', 'retryCount', 'outcomeSeq'])
    integer(session[field]);
  if (typeof session['auto'] !== 'boolean') throw new TypeError('STATE_SHAPE');
  const opening = object(session['opening']); keys(opening, ['setup', 'seeds']);
  object(opening['setup']); array(opening['seeds']);
  const commandLog = array(session['commandLog']);
  for (let index = appendOnlyHistory ? verifiedAppendLength(commandLog, 'commands') : 0;
    index < commandLog.length; index += 1)
    string(object(commandLog[index])['t']);
  completeAppendValidation(commandLog, 'commands');
  const battle = object(session['battle']);
  if (battle['phase'] !== 'opening' && battle['phase'] !== 'running' && battle['phase'] !== 'ended')
    throw new TypeError('STATE_SHAPE');
  integer(battle['actionNo']); array(battle['events']); array(battle['acceptedCommands']);
  for (const unitValue of array(battle['units'])) integer(object(unitValue)['revision']);
  if ((battle['phase'] === 'ended') !== (battle['result'] !== null) ||
      battle['phase'] === 'ended' && (session['outcomeSeq'] as number) < 1 ||
      session['battleId'] !== object(battle['setup'])['setupId'] ||
      session['battleId'] !== object(opening['setup'])['setupId'])
    throw new TypeError('STATE_SHAPE');
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
function validateTownStateShape(value: unknown): void {
  const town = object(value);
  keys(town, ['version', 'townRevision', 'sceneId', 'point', 'buildingId', 'buildingPhase']);
  if (town['version'] !== 1) throw new TypeError('STATE_SHAPE');
  string(town['townRevision']); string(town['sceneId']);
  const point = array(town['point']);
  if (point.length !== 2) throw new TypeError('STATE_SHAPE');
  integer(point[0], Number.MIN_SAFE_INTEGER); integer(point[1], Number.MIN_SAFE_INTEGER);
  const phase = String(town['buildingPhase']);
  if (!['outside', 'fading-in', 'inside', 'fading-out'].includes(phase))
    throw new TypeError('STATE_SHAPE');
  if (town['buildingId'] !== null) string(town['buildingId']);
  if ((phase === 'outside') !== (town['buildingId'] === null)) throw new TypeError('STATE_SHAPE');
}
function validateKnownCharacter(value: unknown): void {
  const known = object(value); keys(known, ['npcId', 'relationship', 'affinity', 'character']);
  string(known['npcId']);
  if (known['relationship'] !== 'met' && known['relationship'] !== 'befriended')
    throw new TypeError('STATE_SHAPE');
  integer(known['affinity'], -100, 100);
  if (known['character'] !== null) {
    validateCharacter(known['character']);
    if ((known['character'] as StateRecord)['characterId'] !== known['npcId'])
      throw new TypeError('STATE_SHAPE');
  }
}
function validateDialogue(value: unknown): void {
  const dialogue = object(value);
  const required = ['storyId', 'storyHash', 'entryKey', 'storyJsonState', 'randomSeed',
    'pendingIntents', 'consumedTagKeys'];
  const optional = ['speakerId', 'textKey', 'choices', 'history'];
  if (required.some((key) => !(key in dialogue)) ||
      Object.keys(dialogue).some((key) => !required.includes(key) && !optional.includes(key)))
    throw new TypeError('STATE_SHAPE');
  for (const field of ['storyId', 'storyHash', 'entryKey', 'storyJsonState']) string(dialogue[field]);
  integer(dialogue['randomSeed'], Number.MIN_SAFE_INTEGER);
  array(dialogue['pendingIntents']); uniqueStrings(dialogue['consumedTagKeys']);
  if ('speakerId' in dialogue) string(dialogue['speakerId']);
  if ('textKey' in dialogue && dialogue['textKey'] !== null) string(dialogue['textKey']);
  for (const value of array(dialogue['choices'] ?? [])) {
    const choice = object(value); keys(choice, ['choiceIndex', 'textKey', 'unavailableReason']);
    integer(choice['choiceIndex']); string(choice['textKey']);
    if (choice['unavailableReason'] !== null) string(choice['unavailableReason']);
  }
  for (const value of array(dialogue['history'] ?? [])) {
    const line = object(value); keys(line, ['speakerId', 'textKey']);
    string(line['speakerId']); string(line['textKey']);
  }
}
function validateMountedRegion(value: unknown): void {
  const mounted = object(value);
  keys(mounted, ['regionId', 'spawnId', 'playerHex', 'facing', 'dynamicTiles', 'entities']);
  string(mounted['regionId']); string(mounted['spawnId']);
  const playerHex = object(mounted['playerHex']); keys(playerHex, ['q', 'r']);
  integer(playerHex['q'], Number.MIN_SAFE_INTEGER);
  integer(playerHex['r'], Number.MIN_SAFE_INTEGER); integer(mounted['facing'], 0, 5);
  const tileKeys = new Set<string>();
  for (const value of array(mounted['dynamicTiles'])) {
    const tile = object(value); keys(tile, ['q', 'r', 'terrainId', 'height']);
    const q = integer(tile['q'], Number.MIN_SAFE_INTEGER);
    const r = integer(tile['r'], Number.MIN_SAFE_INTEGER);
    if (!isRegionTerrainId(string(tile['terrainId']))) throw new TypeError('STATE_SHAPE');
    integer(tile['height'], 0, 10);
    const key = `${q},${r}`; if (tileKeys.has(key)) throw new TypeError('STATE_SHAPE');
    tileKeys.add(key);
  }
  const entityIds = new Set<string>();
  for (const value of array(mounted['entities'])) {
    const entity = object(value); keys(entity, ['anchorId', 'active', 'consumed']);
    const anchorId = string(entity['anchorId']);
    if (entityIds.has(anchorId) || typeof entity['active'] !== 'boolean' ||
        typeof entity['consumed'] !== 'boolean') throw new TypeError('STATE_SHAPE');
    entityIds.add(anchorId);
  }
}
function validateReplayRules(value: unknown): void {
  const rules = object(value);
  keys(rules, ['difficulty', 'heavenlyTrialLevel', 'switches', 'difficultyLog', 'ruleRevision']);
  const difficulties = ['diff_jianghu', 'diff_xiake', 'diff_zongshi'];
  if (!difficulties.includes(String(rules['difficulty'])) || rules['heavenlyTrialLevel'] !== null)
    throw new TypeError('STATE_SHAPE');
  for (const enabled of Object.values(object(rules['switches'])))
    if (typeof enabled !== 'boolean') throw new TypeError('STATE_SHAPE');
  let previousRevision = 0;
  for (const value of array(rules['difficultyLog'])) {
    const entry = object(value); keys(entry, ['difficulty', 'worldTick', 'revision']);
    if (!difficulties.includes(String(entry['difficulty']))) throw new TypeError('STATE_SHAPE');
    integer(entry['worldTick']); const revision = integer(entry['revision'], 1);
    if (revision <= previousRevision) throw new TypeError('STATE_SHAPE');
    previousRevision = revision;
  }
  integer(rules['ruleRevision'], 1);
  if (previousRevision > (rules['ruleRevision'] as number)) throw new TypeError('STATE_SHAPE');
}
function validateProgression(value: unknown): void {
  const progression = object(value);
  keys(progression, ['changshengLayer', 'sleepPoints', 'bookSleepLog',
    'changshengLayerReceipts', 'prologueModeReceipt']);
  integer(progression['changshengLayer'], 0, 9); integer(progression['sleepPoints']);
  uniqueStrings(progression['changshengLayerReceipts']);
  const plans = new Set<string>();
  for (const value of array(progression['bookSleepLog'])) {
    const receipt = object(value);
    keys(receipt, ['planId', 'planJson', 'from', 'to', 'ruleVersion',
      'allocationSource', 'sleepEventId', 'contentHash']);
    for (const field of ['planId', 'planJson', 'from', 'to', 'ruleVersion',
      'sleepEventId', 'contentHash']) string(receipt[field]);
    if (!['manual', 'balanced', 'default'].includes(String(receipt['allocationSource'])) ||
        plans.has(receipt['planId'] as string)) throw new TypeError('STATE_SHAPE');
    plans.add(receipt['planId'] as string);
  }
  if (progression['prologueModeReceipt'] !== null) {
    const receipt = object(progression['prologueModeReceipt']);
    keys(receipt, ['mode', 'routeNodeId', 'completionNodeId', 'exitKey', 'receipts']);
    if (!['full', 'summary', 'skip'].includes(String(receipt['mode'])) ||
        !['n_c01', 'n_summary', 'n_skip_direct'].includes(String(receipt['routeNodeId'])) ||
        !['n_full_complete', 'n_summary_complete', 'n_skip_complete']
          .includes(String(receipt['completionNodeId'])) ||
        receipt['exitKey'] !== 'first_sleep_to_baima') throw new TypeError('STATE_SHAPE');
    uniqueStrings(receipt['receipts']);
  }
}
function validateGameStateShape(value: StateRecord, appendOnlyHistory = false): void {
  keys(value, ['meta', 'profile', 'chapter', 'party', 'world', 'battle', 'dialogue']);
  const meta = object(value['meta']);
  keys(meta, ['saveSchema', 'masterSeed', 'runId', 'nextRuntimeOrdinal', 'contentHash',
    'rulesProtocol', 'rngProtocol', 'coreVersion', 'coreBuild', 'stateVersion', 'worldTick',
    'nextEventSeq', 'rng', 'debugTainted']);
  integer(meta['saveSchema'], 1); integer(meta['masterSeed'], Number.MIN_SAFE_INTEGER);
  string(meta['runId']); integer(meta['nextRuntimeOrdinal'], 1); string(meta['contentHash']);
  integer(meta['rulesProtocol'], 1); string(meta['coreVersion']); string(meta['coreBuild']);
  integer(meta['rngProtocol'], 1); integer(meta['stateVersion']);
  integer(meta['worldTick']); integer(meta['nextEventSeq'], 1);
  if (typeof meta['debugTainted'] !== 'boolean') throw new TypeError('STATE_SHAPE');
  const rng = object(meta['rng']); keys(rng, ['battle', 'loot', 'world', 'ai', 'qiyu']);
  for (const state of Object.values(rng)) {
    const words = array(state);
    if (words.length !== 4) throw new TypeError('STATE_SHAPE');
    for (const word of words) integer(word, 0, 0xffff_ffff);
  }
  const profile = object(value['profile']);
  const profileRequired = ['protagonist', 'companions', 'progression'];
  const profileOptional = ['identity', 'replayRules', 'battleTraining'];
  if (profileRequired.some((key) => !(key in profile)) || Object.keys(profile).some((key) =>
    !profileRequired.includes(key) && !profileOptional.includes(key))) throw new TypeError('STATE_SHAPE');
  if (profile['protagonist'] !== null) validateCharacter(profile['protagonist']);
  for (const companion of array(profile['companions'])) validateCharacter(companion);
  if (profile['identity'] !== undefined && profile['identity'] !== null) {
    const identity = object(profile['identity']);
    keys(identity, ['name', 'gender', 'appearance', 'pronoun', 'originId']);
    for (const field of ['name', 'gender', 'appearance', 'pronoun', 'originId']) string(identity[field]);
  }
  if (profile['replayRules'] !== undefined) validateReplayRules(profile['replayRules']);
  validateProgression(profile['progression']);
  if (profile['battleTraining'] !== undefined) {
    const training = object(profile['battleTraining']);
    keys(training, ['martialUses', 'movementActions', 'fullCirculations']);
    for (const [kind, value] of Object.entries(training)) {
      const unique = new Set<string>();
      for (const raw of array(value)) {
        const entry = object(raw); const martial = kind === 'martialUses';
        keys(entry, martial ? ['unitId', 'skillId', 'uses'] : ['unitId', 'count']);
        const id = string(entry['unitId']);
        const key = JSON.stringify([id, martial ? string(entry['skillId']) : null]);
        if (unique.has(key)) throw new TypeError('STATE_SHAPE');
        unique.add(key); integer(entry[martial ? 'uses' : 'count']);
      }
    }
  }
  const chapter = object(value['chapter']);
  const chapterRequired = ['chapterId', 'eraLayerId', 'worldTier', 'worldYear', 'clock', 'story', 'worldItems', 'shops',
    'worldMap', 'town', 'npcs', 'itemChapterUses'];
  if (chapterRequired.some((key) => !(key in chapter)) || Object.keys(chapter).some((key) =>
    !chapterRequired.includes(key) && key !== 'prologue')) throw new TypeError('STATE_SHAPE');
  string(chapter['chapterId']); string(chapter['eraLayerId']);
  if (!['HIGH', 'MID', 'LOW'].includes(String(chapter['worldTier']))) throw new TypeError('STATE_SHAPE');
  integer(chapter['worldYear'], Number.MIN_SAFE_INTEGER); validateClock(chapter['clock']);
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
  if (chapter['town'] !== null) validateTownStateShape(chapter['town']);
  const npcIds = new Set<string>();
  for (const entry of array(chapter['npcs'])) {
    validateKnownCharacter(entry); const npcId = (entry as StateRecord)['npcId'] as string;
    if (npcIds.has(npcId)) throw new TypeError('STATE_SHAPE'); npcIds.add(npcId);
  }
  validateCounters(chapter['itemChapterUses']);
  if (chapter['prologue'] !== undefined) {
    const prologue = object(chapter['prologue']);
    const required = ['mode', 'receipts'];
    const optional = ['routeNodeId', 'completionNodeId', 'exitKey'];
    if (required.some((key) => !(key in prologue)) || Object.keys(prologue).some((key) =>
      !required.includes(key) && !optional.includes(key))) throw new TypeError('STATE_SHAPE');
    if (prologue['mode'] !== null && !['full', 'summary', 'skip'].includes(String(prologue['mode'])))
      throw new TypeError('STATE_SHAPE');
    if (prologue['routeNodeId'] !== undefined && prologue['routeNodeId'] !== null &&
        !['n_c01', 'n_summary', 'n_skip_direct'].includes(String(prologue['routeNodeId'])))
      throw new TypeError('STATE_SHAPE');
    if (prologue['completionNodeId'] !== undefined && prologue['completionNodeId'] !== null &&
        !['n_full_complete', 'n_summary_complete', 'n_skip_complete']
          .includes(String(prologue['completionNodeId']))) throw new TypeError('STATE_SHAPE');
    if (prologue['exitKey'] !== undefined && prologue['exitKey'] !== null &&
        prologue['exitKey'] !== 'first_sleep_to_baima')
      throw new TypeError('STATE_SHAPE');
    if ('routeNodeId' in prologue &&
        (prologue['mode'] === null) !== (prologue['routeNodeId'] === null))
      throw new TypeError('STATE_SHAPE');
    const exitKey = prologue['exitKey'] ?? null;
    const completionNodeId = prologue['completionNodeId'] ?? null;
    if ((exitKey === null) !== (completionNodeId === null))
      throw new TypeError('STATE_SHAPE');
    const routeByMode = { full: 'n_c01', summary: 'n_summary', skip: 'n_skip_direct' };
    const completionByMode = { full: 'n_full_complete', summary: 'n_summary_complete',
      skip: 'n_skip_complete' };
    const mode = prologue['mode'] as keyof typeof routeByMode | null;
    if (mode !== null && prologue['routeNodeId'] !== undefined &&
        prologue['routeNodeId'] !== routeByMode[mode]) throw new TypeError('STATE_SHAPE');
    if (mode !== null && completionNodeId !== null &&
        completionNodeId !== completionByMode[mode]) throw new TypeError('STATE_SHAPE');
    uniqueStrings(prologue['receipts']);
    const receipts = prologue['receipts'] as readonly string[];
    if (exitKey !== null && (mode === null ||
        !receipts.includes(`dc_00_01/${mode}/settled`) ||
        !receipts.includes('dc_00_01/first_sleep_to_baima'))) throw new TypeError('STATE_SHAPE');
  }
  const party = object(value['party']); keys(party, ['inventory', 'equipment', 'money']); integer(party['money']);
  const inventory = object(party['inventory']); keys(inventory, ['stacks']);
  for (const entry of array(inventory['stacks'])) { const stack = object(entry); keys(stack, ['itemId', 'count']); string(stack['itemId']); integer(stack['count'], 1); }
  const equipment = object(party['equipment']); keys(equipment, ['entries']);
  for (const entry of array(equipment['entries'])) {
    const slot = object(entry); keys(slot, ['slot', 'itemId']); string(slot['slot']);
    if (slot['itemId'] !== null) string(slot['itemId']);
  }
  const world = object(value['world']);
  keys(world, ['navigation', 'pendingTimeAdvance',
    ...('battleReceipts' in world ? ['battleReceipts'] : [])]);
  const navigation = object(world['navigation']);
  const navigationRequired = ['locationId', 'selectedDestinationId', 'pendingMount'];
  if (navigationRequired.some((key) => !(key in navigation)) ||
      Object.keys(navigation).some((key) => !navigationRequired.includes(key) &&
        key !== 'mountedRegion')) throw new TypeError('STATE_SHAPE');
  string(navigation['locationId']);
  if (navigation['selectedDestinationId'] !== null) string(navigation['selectedDestinationId']);
  if (navigation['pendingMount'] !== null) {
    const mount = object(navigation['pendingMount']);
    const mountKeys = Object.keys(mount);
    if (!['regionId', 'sceneId', 'spawnId'].every((key) => key in mount) ||
        mountKeys.some((key) => !['regionId', 'sceneId', 'spawnId', 'targetHex'].includes(key)))
      throw new TypeError('STATE_SHAPE');
    string(mount['regionId']); string(mount['sceneId']);
    if (mount['spawnId'] === null) {
      const target = object(mount['targetHex']); keys(target, ['q', 'r']);
      integer(target['q'], Number.MIN_SAFE_INTEGER); integer(target['r'], Number.MIN_SAFE_INTEGER);
    } else {
      string(mount['spawnId']);
      if ('targetHex' in mount) throw new TypeError('STATE_SHAPE');
    }
  }
  if (navigation['mountedRegion'] !== undefined && navigation['mountedRegion'] !== null)
    validateMountedRegion(navigation['mountedRegion']);
  if (world['pendingTimeAdvance'] !== null) {
    const pending = object(world['pendingTimeAdvance']); keys(pending, ['remainingTicks', 'reason']); integer(pending['remainingTicks']);
    if (pending['reason'] !== 'rest' && pending['reason'] !== 'story') throw new TypeError('STATE_SHAPE');
  }
  const battleReceiptKeys = new Set<string>();
  for (const entry of array(world['battleReceipts'] ?? [])) {
    const receipt = object(entry); keys(receipt, ['battleId', 'outcomeSeq']);
    const key = `${string(receipt['battleId'])}/${integer(receipt['outcomeSeq'], 1)}`;
    if (battleReceiptKeys.has(key)) throw new TypeError('STATE_SHAPE');
    battleReceiptKeys.add(key);
  }
  if (value['dialogue'] !== null) validateDialogue(value['dialogue']);
  if (value['battle'] !== null) validateBattleSession(value['battle'], appendOnlyHistory);
}

/** History caching is only safe inside a journaled command; boundary validation always scans arrays. */
export function assertCanonicalGameState(state: GameState, appendOnlyHistory = false): void {
  walk(state, new Set<object>(), appendOnlyHistory);
  validateGameStateShape(state as unknown as StateRecord, appendOnlyHistory);
  if (state.meta.saveSchema !== SAVE_SCHEMA || state.meta.rulesProtocol !== RULES_PROTOCOL ||
      state.meta.rngProtocol !== RNG_PROTOCOL) throw new TypeError('STATE_PROTOCOL_MISMATCH');
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
  const root = value as StateRecord;
  const world = object(root['world']); const navigation = object(world['navigation']);
  const compatibleNavigation = 'mountedRegion' in navigation ? navigation
    : { ...navigation, mountedRegion: null };
  const compatibleWorld = { ...world, navigation: compatibleNavigation };
  const compatible = { ...root, world: compatibleWorld };
  validateGameStateShape(compatible as StateRecord);
  const state = compatible as unknown as GameState;
  assertCanonicalGameState(state);
  return state;
}
