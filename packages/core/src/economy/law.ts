import type { Equipment } from '../state';
import type {
  EquipmentRule, LawEnforcementState, UniformCheckInput, UniformCheckResult,
  UniformExposureEvent,
} from './types';

function rulesById(rules: readonly EquipmentRule[]): ReadonlyMap<string, EquipmentRule> {
  const map = new Map<string, EquipmentRule>();
  for (const rule of rules) {
    if (map.has(rule.itemId)) throw new TypeError('EQUIPMENT_RULE_DUPLICATE');
    map.set(rule.itemId, rule);
  }
  return map;
}

export function canEnterNormalCityGate(state: LawEnforcementState): boolean {
  return !state.normalCityGateBlocked;
}

/**
 * Applies one visible equipment-exposure transaction. Callers persist the returned
 * law state and event together so replay does not apply the same exposure twice.
 */
export function checkUniformExposure(input: UniformCheckInput): UniformCheckResult {
  if (!Number.isSafeInteger(input.time) || input.time < 0
    || !Number.isSafeInteger(input.lawState.wantedLevel) || input.lawState.wantedLevel < 0)
    throw new RangeError('UNIFORM_EXPOSURE_STATE');
  const increase = input.wantedIncrease ?? 1;
  if (!Number.isSafeInteger(increase) || increase <= 0)
    throw new RangeError('UNIFORM_WANTED_INCREASE');
  const identities = new Set(input.identityTags);
  const lookup = rulesById(input.rules);
  const events: UniformExposureEvent[] = [];
  const seen = new Set<string>();
  for (const entry of input.equipment.entries) {
    if (entry.itemId === null || seen.has(entry.itemId)) continue;
    seen.add(entry.itemId);
    const rule = lookup.get(entry.itemId);
    if (rule === undefined) throw new RangeError('EQUIPMENT_ITEM_UNKNOWN');
    const law = rule.lawProfile;
    if (law === undefined || rule.exposure !== 'visible'
      || law.allowedIdentityTags.some((tag) => identities.has(tag))) continue;
    events.push({ equipId: entry.itemId, wearerId: input.wearerId, lawProfile: law,
      exposure: 'visible', locationId: input.locationId, time: input.time });
  }
  if (events.length === 0) return { lawState: input.lawState, events };
  const wantedLevel = input.lawState.wantedLevel + increase * events.length;
  if (!Number.isSafeInteger(wantedLevel)) throw new RangeError('UNIFORM_WANTED_OVERFLOW');
  return { lawState: { wantedLevel, normalCityGateBlocked: true }, events };
}

export function equippedUniformRules(
  equipment: Equipment, rules: readonly EquipmentRule[],
): readonly EquipmentRule[] {
  const lookup = rulesById(rules);
  const result: EquipmentRule[] = [];
  for (const entry of equipment.entries) {
    if (entry.itemId === null) continue;
    const rule = lookup.get(entry.itemId);
    if (rule?.lawProfile !== undefined && !result.includes(rule)) result.push(rule);
  }
  return result;
}
