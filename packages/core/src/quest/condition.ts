import { compareCodePoints, type JsonValue } from '@tianshu/shared';
import { compileEstateCondition } from './condition-estate';
import type { ConditionFacts, ConditionProgram, ConditionScalar, QuestConditionFact,
  QuestStatus } from './condition-types';

export * from './condition-types';
type Row = Readonly<Record<string, JsonValue>>;
type CompareOperator = 'eq' | 'ne' | 'lt' | 'le' | 'gt' | 'ge';
type ScalarReader = (facts: ConditionFacts) => ConditionScalar | undefined;
const QUEST_STATUSES: readonly QuestStatus[] =
  ['locked', 'available', 'active', 'suspended', 'completed', 'failed', 'expired'];
const ART_IDS = new Set(['med', 'poi', 'antidote', 'forge', 'alchemy',
  'formation', 'music', 'art', 'chess', 'speech']);

function record(value: JsonValue, code = 'CONDITION_SHAPE'): Row {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    throw new TypeError(code);
  return value as Row;
}
function oneEntry(value: JsonValue): readonly [string, JsonValue] {
  const entries = Object.entries(record(value)).sort(
    (left, right) => compareCodePoints(left[0], right[0]),
  );
  if (entries.length !== 1) throw new TypeError('CONDITION_OPERATOR_COUNT');
  return entries[0]!;
}
function assertFields(row: Row, required: readonly string[], optional: readonly string[] = []): void {
  const allowed = new Set([...required, ...optional]);
  if (required.some((key) => !Object.hasOwn(row, key)) ||
      Object.keys(row).some((key) => !allowed.has(key))) throw new TypeError('CONDITION_FIELDS');
}
function stringField(row: Row, key: string): string {
  const value = row[key];
  if (typeof value !== 'string' || value.length === 0) throw new TypeError(`CONDITION_${key}`);
  return value;
}
function numberField(row: Row, key: string): number {
  const value = row[key];
  if (typeof value !== 'number' || !Number.isSafeInteger(value))
    throw new TypeError(`CONDITION_${key}`);
  return value;
}
function optionalNumber(row: Row, key: string): number | undefined {
  return row[key] === undefined ? undefined : numberField(row, key);
}
function optionalBoolean(row: Row, key: string): boolean | undefined {
  const value = row[key];
  if (value !== undefined && typeof value !== 'boolean') throw new TypeError(`CONDITION_${key}`);
  return value;
}
function scalarField(row: Row, key: string): ConditionScalar {
  const value = row[key];
  if (value === null || typeof value === 'string' || typeof value === 'boolean' ||
      (typeof value === 'number' && Number.isSafeInteger(value))) return value;
  throw new TypeError(`CONDITION_${key}`);
}
function compareValues(left: ConditionScalar | undefined, op: CompareOperator,
  right: ConditionScalar): boolean {
  if (left === undefined) throw new TypeError('CONDITION_FACT_MISSING');
  if (op === 'eq' || op === 'ne') {
    const equal = left === right; return op === 'eq' ? equal : !equal;
  }
  if (typeof left !== 'number' || typeof right !== 'number')
    throw new TypeError('CONDITION_COMPARE_TYPES');
  if (op === 'lt') return left < right;
  if (op === 'le') return left <= right;
  if (op === 'gt') return left > right;
  return left >= right;
}
function compareOperator(row: Row): CompareOperator {
  const op = stringField(row, 'op') as CompareOperator;
  if (!(['eq', 'ne', 'lt', 'le', 'gt', 'ge'] as const).includes(op))
    throw new TypeError('CONDITION_COMPARE_OP');
  return op;
}
function everySpecified(row: Row, fields: readonly string[], candidate: Row): boolean {
  return fields.every((key) => row[key] === undefined || candidate[key] === row[key]);
}
function questFact(value: QuestStatus | QuestConditionFact | undefined): QuestConditionFact | undefined {
  return typeof value === 'string' ? { state: value } : value;
}
function compileComparison(row: Row): ConditionProgram {
  assertFields(row, ['left', 'op', 'right']);
  const [kind, rawKey] = oneEntry(row['left']!);
  const simpleKinds = new Set(['stat', 'art', 'sectContribution', 'counter', 'eventField']);
  const relationKinds = new Set(['affinity', 'bond', 'resentment']);
  const key = typeof rawKey === 'string' && rawKey.length > 0 ? rawKey :
    relationKinds.has(kind) ? stringField(record(rawKey), 'npcId') : undefined;
  if (key === undefined || (!simpleKinds.has(kind) && !relationKinds.has(kind)))
    throw new TypeError('CONDITION_COMPARE_LEFT');
  if (kind === 'stat' && !['level', 'morality', 'fame', 'fameTotal'].includes(key))
    throw new TypeError('CONDITION_STAT');
  if (kind === 'art' && !ART_IDS.has(key)) throw new TypeError('CONDITION_ART');
  const readers: Readonly<Record<string, ScalarReader>> = {
    stat: (facts) => facts.stats?.[key], art: (facts) => facts.arts?.[key],
    sectContribution: (facts) => facts.sectContributions?.[key],
    counter: (facts) => facts.counters?.[key], eventField: (facts) => facts.eventFields?.[key],
    affinity: (facts) => facts.npcRelationships?.[key]?.affinity,
    bond: (facts) => facts.npcRelationships?.[key]?.bond,
    resentment: (facts) => facts.npcRelationships?.[key]?.resentment,
  };
  const read = readers[kind]!; const op = compareOperator(row); const right = scalarField(row, 'right');
  return (facts) => compareValues(read(facts), op, right);
}
function compileQuest(row: Row): ConditionProgram {
  assertFields(row, ['id', 'state'], ['stage']);
  const id = stringField(row, 'id'); const state = stringField(row, 'state') as QuestStatus;
  if (!QUEST_STATUSES.includes(state)) throw new TypeError('CONDITION_QUEST_STATE');
  const stage = row['stage'] === undefined ? undefined : stringField(row, 'stage');
  return (facts) => {
    const fact = questFact(facts.quests?.[id]);
    if (fact === undefined) throw new TypeError('CONDITION_FACT_MISSING');
    return fact.state === state && (stage === undefined || fact.stage === stage);
  };
}
function compileNpc(row: Row): ConditionProgram {
  assertFields(row, ['id', 'state'], ['affinityAtLeast', 'bondAtLeast', 'resentmentAtMost']);
  const id = stringField(row, 'id'); const state = stringField(row, 'state');
  const affinity = optionalNumber(row, 'affinityAtLeast');
  const bond = optionalNumber(row, 'bondAtLeast');
  const resentment = optionalNumber(row, 'resentmentAtMost');
  return (facts) => {
    const npcState = facts.npcStates?.[id];
    if (npcState === undefined) throw new TypeError('CONDITION_FACT_MISSING');
    const relation = facts.npcRelationships?.[id];
    return npcState === state && (affinity === undefined ||
      (relation !== undefined && relation.affinity >= affinity)) && (bond === undefined ||
      (relation !== undefined && relation.bond >= bond)) && (resentment === undefined ||
      (relation !== undefined && relation.resentment <= resentment));
  };
}
function compileHasItem(row: Row): ConditionProgram {
  assertFields(row, ['id', 'count']);
  const id = stringField(row, 'id'); const count = numberField(row, 'count');
  if (count < 0) throw new TypeError('CONDITION_count');
  return (facts) => {
    if (facts.inventory === undefined) throw new TypeError('CONDITION_FACT_MISSING');
    return (facts.inventory[id] ?? 0) >= count;
  };
}
function compileSect(row: Row): ConditionProgram {
  assertFields(row, ['id', 'status'], ['rankAtLeast', 'contributionAtLeast']);
  const id = stringField(row, 'id'); const status = stringField(row, 'status');
  const rank = optionalNumber(row, 'rankAtLeast');
  const contribution = optionalNumber(row, 'contributionAtLeast');
  if (rank !== undefined && (rank < 1 || rank > 5)) throw new TypeError('CONDITION_rankAtLeast');
  if (contribution !== undefined && contribution < 0) throw new TypeError('CONDITION_contributionAtLeast');
  return (facts) => {
    const fact = facts.sects?.[id];
    if (fact === undefined) throw new TypeError('CONDITION_FACT_MISSING');
    const actualRank = typeof fact.rank === 'number' ? fact.rank : Number(fact.rank.slice(1));
    return fact.status === status && (rank === undefined || actualRank >= rank) &&
      (contribution === undefined || fact.contribution >= contribution);
  };
}
function compileCompanion(row: Row): ConditionProgram {
  assertFields(row, ['id'], ['station', 'everRecruited']);
  const id = stringField(row, 'id');
  const station = row['station'] === undefined ? undefined : stringField(row, 'station');
  const everRecruited = optionalBoolean(row, 'everRecruited');
  if (station === undefined && everRecruited === undefined) throw new TypeError('CONDITION_COMPANION_EMPTY');
  return (facts) => {
    const fact = facts.companions?.[id];
    if (fact === undefined) throw new TypeError('CONDITION_FACT_MISSING');
    return (station === undefined || fact.station === station) &&
      (everRecruited === undefined || fact.everRecruited === everRecruited);
  };
}
function compileTime(row: Row): ConditionProgram {
  assertFields(row, [], ['yearMin', 'yearMax', 'period']);
  const yearMin = optionalNumber(row, 'yearMin'); const yearMax = optionalNumber(row, 'yearMax');
  const period = row['period'] === undefined ? undefined : stringField(row, 'period');
  if (yearMin === undefined && yearMax === undefined && period === undefined)
    throw new TypeError('CONDITION_TIME_EMPTY');
  if (yearMin !== undefined && yearMax !== undefined && yearMin > yearMax)
    throw new TypeError('CONDITION_TIME_RANGE');
  if (period !== undefined && !['night', 'dawn', 'day', 'dusk'].includes(period))
    throw new TypeError('CONDITION_TIME_PERIOD');
  return (facts) => {
    if (facts.time === undefined) throw new TypeError('CONDITION_FACT_MISSING');
    return (yearMin === undefined || facts.time.year >= yearMin) &&
      (yearMax === undefined || facts.time.year <= yearMax) &&
      (period === undefined || facts.time.period === period);
  };
}
function compileLocation(row: Row): ConditionProgram {
  assertFields(row, ['eraLayer'], ['regionId', 'cityId', 'placeKey']);
  const eraLayer = stringField(row, 'eraLayer');
  const optional = ['regionId', 'cityId', 'placeKey'] as const;
  for (const key of optional) if (row[key] !== undefined && row[key] !== null &&
      (typeof row[key] !== 'string' || row[key].length === 0)) throw new TypeError(`CONDITION_${key}`);
  return (facts) => {
    if (facts.location === undefined) throw new TypeError('CONDITION_FACT_MISSING');
    return facts.location.eraLayer === eraLayer &&
      everySpecified(row, optional, facts.location as unknown as Row);
  };
}
function compileEvent(row: Row): ConditionProgram {
  const name = stringField(row, 'name');
  for (const value of Object.values(row)) scalarField({ value }, 'value');
  return (facts) => {
    if (facts.event === undefined) throw new TypeError('CONDITION_FACT_MISSING');
    return facts.event.name === name && Object.entries(row).every(
      ([key, value]) => key === 'name' || facts.event?.fields?.[key] === value);
  };
}
function compileStoryNode(row: Row): ConditionProgram {
  assertFields(row, ['lineId', 'nodeId', 'state']);
  const lineId = stringField(row, 'lineId'); const nodeId = stringField(row, 'nodeId');
  const state = stringField(row, 'state');
  if (state !== 'completed' && state !== 'expired') throw new TypeError('CONDITION_STORY_STATE');
  return (facts) => {
    const value = facts.storyNodes?.[`${lineId}/${nodeId}`];
    if (value === undefined) throw new TypeError('CONDITION_FACT_MISSING');
    return value === state;
  };
}
function compileLegacy(row: Row, cache: boolean): ConditionProgram {
  const idKey = cache ? 'cacheId' : 'sourceId';
  assertFields(row, [idKey, 'field', 'op', 'value']);
  const id = stringField(row, idKey); const field = stringField(row, 'field');
  const allowed = cache ? ['state', 'progress']
    : ['status', 'fragmentCount', 'hasKeystone', 'localMisses'];
  if (!allowed.includes(field)) throw new TypeError('CONDITION_LEGACY_FIELD');
  const op = compareOperator(row); const right = scalarField(row, 'value');
  const numeric = field === 'fragmentCount' || field === 'localMisses' || field === 'progress';
  if ((numeric && typeof right !== 'number') || (!numeric && op !== 'eq' && op !== 'ne'))
    throw new TypeError('CONDITION_LEGACY_COMPARE');
  return (facts) => {
    const source = cache ? facts.legacyCaches?.[id] : facts.legacySources?.[id];
    if (source === undefined) throw new TypeError('CONDITION_FACT_MISSING');
    let left: ConditionScalar;
    if ('fragmentCount' in source) {
      if (field === 'status') left = source.status;
      else if (field === 'fragmentCount') left = source.fragmentCount;
      else if (field === 'hasKeystone') left = source.hasKeystone;
      else left = source.localMisses;
    } else left = field === 'state' ? source.state : source.progress;
    return compareValues(left, op, right);
  };
}
function compileLeaf(operator: string, row: Row): ConditionProgram {
  if (operator === 'compare') return compileComparison(row);
  if (operator === 'hasItem') return compileHasItem(row);
  if (operator === 'quest') return compileQuest(row);
  if (operator === 'npc') return compileNpc(row);
  if (operator === 'sect') return compileSect(row);
  if (operator === 'companion') return compileCompanion(row);
  if (operator === 'time') return compileTime(row);
  if (operator === 'location') return compileLocation(row);
  if (operator === 'estate') return compileEstateCondition(row);
  if (operator === 'event') return compileEvent(row);
  if (operator === 'legacy' || operator === 'legacyCache')
    return compileLegacy(row, operator === 'legacyCache');
  if (operator === 'storyNode') return compileStoryNode(row);
  throw new TypeError(`CONDITION_OPERATOR:${operator}`);
}
/** Build-time compiler: runtime evaluation contains no parsing or dynamic lookup construction. */
export function compileCondition(expression: JsonValue): ConditionProgram {
  const [operator, payload] = oneEntry(expression);
  if (operator === 'all' || operator === 'any') {
    if (!Array.isArray(payload) || payload.length === 0) throw new TypeError('CONDITION_LIST');
    const children = payload.map(compileCondition);
    return operator === 'all'
      ? (facts) => children.every((child) => child(facts))
      : (facts) => children.some((child) => child(facts));
  }
  if (operator === 'not') {
    const child = compileCondition(payload); return (facts) => !child(facts);
  }
  if (operator === 'flag') {
    const row = record(payload); assertFields(row, ['id'], ['is', 'state']);
    const id = stringField(row, 'id');
    if (row['is'] !== undefined && row['state'] !== undefined) throw new TypeError('CONDITION_FLAG_STATE');
    const expected = optionalBoolean(row, row['is'] === undefined ? 'state' : 'is');
    if (expected === undefined) throw new TypeError('CONDITION_FLAG_STATE');
    return (facts) => facts.flags?.[id] === expected;
  }
  return compileLeaf(operator, record(payload));
}
