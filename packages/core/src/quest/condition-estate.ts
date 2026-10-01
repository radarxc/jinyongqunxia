import type { JsonValue } from '@tianshu/shared';
import type { ConditionFacts, ConditionProgram } from './condition-types';

type Row = Readonly<Record<string, JsonValue>>;
type EstateFacts = NonNullable<ConditionFacts['estate']>;
const BLOCKS = new Set(['zi', 'chou', 'yin', 'mao', 'chen', 'si',
  'wu', 'wei', 'shen', 'you', 'xu', 'hai']);
const BUCKETS = new Set(['quest', 'loot', 'cash', 'business', 'resource', 'sect', 'other', 'transfer']);
const OWNERSHIP = new Set(['hidden', 'discovered', 'available', 'controlled', 'disputed',
  'acquiring', 'owned', 'harassed', 'suspended', 'lost', 'era_unloaded']);

function requireEstate(facts: ConditionFacts): EstateFacts {
  if (facts.estate === undefined) throw new TypeError('CONDITION_FACT_MISSING');
  return facts.estate;
}
function has(row: Row, key: string): boolean { return Object.hasOwn(row, key); }
function stringField(row: Row, key: string): string {
  const value = row[key];
  if (typeof value !== 'string' || value.length === 0) throw new TypeError('CONDITION_' + key);
  return value;
}
function numberField(row: Row, key: string): number {
  const value = row[key];
  if (typeof value !== 'number' || !Number.isSafeInteger(value))
    throw new TypeError('CONDITION_' + key);
  return value;
}
function optionalNumber(row: Row, key: string): number | undefined {
  return row[key] === undefined ? undefined : numberField(row, key);
}
function ratioToBasisPoints(value: JsonValue | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value))
    throw new TypeError('CONDITION_ratio');
  const match = /^(0|1)(?:\.(\d+))?$/.exec(String(value));
  if (match === null) throw new TypeError('CONDITION_ratio');
  const fraction = match[2] ?? '';
  if (match[1] === '1') {
    if (/[^0]/.test(fraction)) throw new TypeError('CONDITION_ratio');
    return 10_000;
  }
  if (fraction.length > 4) throw new TypeError('CONDITION_ratio');
  return fraction.length === 0 ? 0 : Number.parseInt(fraction.padEnd(4, '0'), 10);
}
function assertFields(row: Row, required: readonly string[], optional: readonly string[] = []): void {
  const allowed = new Set(['kind', ...required, ...optional]);
  if (required.some((key) => !has(row, key)) || Object.keys(row).some((key) => !allowed.has(key)))
    throw new TypeError('CONDITION_ESTATE_FIELDS');
}
function compileResource(row: Row): ConditionProgram {
  assertFields(row, ['resourceRef', 'quantity', 'scope'], ['pointRef']);
  const resourceRef = stringField(row, 'resourceRef'); const quantity = numberField(row, 'quantity');
  const scope = stringField(row, 'scope'); const pointRef = row['pointRef'];
  if (!['bag', 'estate', 'point'].includes(scope) || quantity < 0 ||
      (scope === 'point' ? typeof pointRef !== 'string' || pointRef.length === 0 : pointRef !== undefined))
    throw new TypeError('CONDITION_ESTATE_RESOURCE');
  return (facts) => (requireEstate(facts).resources ?? []).some((entry) =>
    entry.resourceRef === resourceRef && entry.scope === scope &&
    (scope !== 'point' || entry.pointRef === pointRef) && entry.quantity >= quantity);
}
function compileResourcePoint(row: Row): ConditionProgram {
  assertFields(row, ['pointRef'], ['ownership', 'minLevel']);
  const pointRef = stringField(row, 'pointRef');
  const ownership = row['ownership'] === undefined ? undefined : stringField(row, 'ownership');
  const minLevel = optionalNumber(row, 'minLevel');
  if (ownership !== undefined && !OWNERSHIP.has(ownership)) throw new TypeError('CONDITION_ownership');
  if (minLevel !== undefined && (minLevel < 1 || minLevel > 5)) throw new TypeError('CONDITION_minLevel');
  return (facts) => {
    const point = requireEstate(facts).resourcePoints?.[pointRef];
    return point !== undefined && (ownership === undefined || point.ownership === ownership) &&
      (minLevel === undefined || point.level >= minLevel);
  };
}
function compileServant(row: Row): ConditionProgram {
  assertFields(row, [], ['servantRef', 'minLoyalty', 'specialty', 'minValue']);
  const servantRef = row['servantRef'] === undefined ? undefined : stringField(row, 'servantRef');
  const minLoyalty = optionalNumber(row, 'minLoyalty');
  const specialty = row['specialty'] === undefined ? undefined : stringField(row, 'specialty');
  const minValue = optionalNumber(row, 'minValue');
  if (servantRef === undefined && minLoyalty === undefined && specialty === undefined)
    throw new TypeError('CONDITION_ESTATE_SERVANT');
  if (minLoyalty !== undefined && (minLoyalty < 0 || minLoyalty > 100))
    throw new TypeError('CONDITION_minLoyalty');
  if (minValue !== undefined && specialty === undefined) throw new TypeError('CONDITION_minValue');
  return (facts) => (requireEstate(facts).servants ?? []).some((servant) => servant.available &&
    (servantRef === undefined || servant.servantRef === servantRef) &&
    (minLoyalty === undefined || servant.loyalty >= minLoyalty) &&
    (specialty === undefined || (servant.specialties[specialty] ?? -1) >= (minValue ?? 0)));
}
function compileJob(row: Row): ConditionProgram {
  const kind = stringField(row, 'kind'); const ratio = kind === 'job_duty_ratio_at_least';
  assertFields(row, ratio ? ['contractId', 'ratio'] : ['jobRef'], ratio ? [] : ['businessRef']);
  if (ratio) {
    const contractId = stringField(row, 'contractId'); const value = row['ratio'];
    const requiredBp = ratioToBasisPoints(value);
    return (facts) => (requireEstate(facts).jobs ?? []).some((job) =>
      job.contractId === contractId && job.dutyRatioBp >= requiredBp);
  }
  const jobRef = stringField(row, 'jobRef');
  const businessRef = row['businessRef'] === undefined ? undefined : stringField(row, 'businessRef');
  return (facts) => (requireEstate(facts).jobs ?? []).some((job) => job.active &&
    job.jobRef === jobRef && (businessRef === undefined || job.businessRef === businessRef));
}
function stringList(row: Row, key: string): readonly string[] {
  const value = row[key];
  if (!Array.isArray(value) || value.length === 0 ||
      value.some((entry) => typeof entry !== 'string' || !BLOCKS.has(entry)))
    throw new TypeError('CONDITION_' + key);
  return value as readonly string[];
}
function compileSchedule(row: Row): ConditionProgram {
  assertFields(row, ['day', 'blocks']);
  const day = numberField(row, 'day'); const blocks = stringList(row, 'blocks');
  if (day < 0) throw new TypeError('CONDITION_day');
  return (facts) => (requireEstate(facts).freeSchedule ?? []).some((entry) =>
    entry.day === day && blocks.every((block) => entry.blocks.includes(block)));
}
function compileQuote(row: Row): ConditionProgram {
  assertFields(row, ['quoteId', 'pointRef']);
  const quoteId = stringField(row, 'quoteId'); const pointRef = stringField(row, 'pointRef');
  return (facts) => requireEstate(facts).validSacrificeQuotes?.[quoteId] === pointRef;
}
function compileExcavation(row: Row): ConditionProgram {
  assertFields(row, ['orderId', 'cacheId']);
  const orderId = stringField(row, 'orderId'); const cacheId = stringField(row, 'cacheId');
  return (facts) => requireEstate(facts).activeExcavationOrders?.[orderId] === cacheId;
}
function compileMinimum(row: Row, refKey: string, valueKey: string,
  source: (estate: EstateFacts) => Readonly<Record<string, number>> | undefined): ConditionProgram {
  assertFields(row, [refKey, valueKey]);
  const ref = stringField(row, refKey); const minimum = numberField(row, valueKey);
  if (minimum < 0) throw new TypeError('CONDITION_' + valueKey);
  return (facts) => {
    const value = source(requireEstate(facts))?.[ref];
    if (value === undefined) throw new TypeError('CONDITION_FACT_MISSING');
    return value >= minimum;
  };
}
export function compileEstateCondition(row: Row): ConditionProgram {
  const kind = stringField(row, 'kind');
  if (kind === 'resource_at_least') return compileResource(row);
  if (kind === 'resource_point_state') return compileResourcePoint(row);
  if (kind === 'servant_available') return compileServant(row);
  if (kind === 'job_active' || kind === 'job_duty_ratio_at_least') return compileJob(row);
  if (kind === 'schedule_blocks_free') return compileSchedule(row);
  if (kind === 'estate_sacrifice_quote_valid') return compileQuote(row);
  if (kind === 'legacy_excavation_order_active') return compileExcavation(row);
  if (kind === 'business_relation_at_least') return compileMinimum(row, 'businessRef', 'value',
    (estate) => estate.businessRelations);
  if (kind === 'membership_rank_at_least') {
    const level = numberField(row, 'level');
    if (level < 1 || level > 5) throw new TypeError('CONDITION_level');
    return compileMinimum(row, 'sectRef', 'level', (estate) => estate.membershipRanks);
  }
  if (kind === 'economy_budget_remaining') {
    assertFields(row, ['bucket', 'minWen']);
    const bucket = stringField(row, 'bucket');
    if (!BUCKETS.has(bucket)) throw new TypeError('CONDITION_bucket');
    const minWen = numberField(row, 'minWen');
    return (facts) => {
      const value = requireEstate(facts).budgetRemaining?.[bucket];
      if (value === undefined) throw new TypeError('CONDITION_FACT_MISSING');
      return value >= minWen;
    };
  }
  if (kind === 'keqing_slot_free') {
    assertFields(row, []); return (facts) => requireEstate(facts).keqingSlotFree === true;
  }
  throw new TypeError(`CONDITION_ESTATE_KIND:${kind}`);
}
