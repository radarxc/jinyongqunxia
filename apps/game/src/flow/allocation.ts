import type { FirstSleepAllocationQuery } from '@tianshu/core';
import type { SleepAllocationSourceView } from '@tianshu/ui';

export interface AllocationDraft {
  readonly values: Readonly<Record<string, number>>;
  readonly source: SleepAllocationSourceView;
}
function fromKeys(rules: FirstSleepAllocationQuery, value: number): Readonly<Record<string, number>> {
  return Object.fromEntries(rules.keys.map((key) => [key, value]));
}
export function initialAllocation(rules: FirstSleepAllocationQuery): AllocationDraft {
  return { values: rules.draft ?? fromKeys(rules, rules.base), source: 'manual' };
}
export function resetAllocation(rules: FirstSleepAllocationQuery): AllocationDraft {
  return { values: fromKeys(rules, rules.base), source: 'manual' };
}
export function presetAllocation(rules: FirstSleepAllocationQuery,
  source: 'balanced' | 'default'): AllocationDraft {
  return { values: { ...rules.presets.balanced }, source };
}
export function changeAllocation(rules: FirstSleepAllocationQuery, draft: AllocationDraft,
  key: string, requested: number): AllocationDraft {
  if (!rules.keys.includes(key as never)) return draft;
  const current = draft.values[key] ?? rules.base;
  const used = rules.keys.reduce((sum, entry) => sum + (draft.values[entry] ?? rules.base), 0);
  const maximum = Math.min(rules.max, current + Math.max(0, rules.requiredTotal - used));
  const value = Math.max(rules.min, Math.min(maximum, Math.round(requested)));
  return { values: { ...draft.values, [key]: value }, source: 'manual' };
}
export function allocationComplete(rules: FirstSleepAllocationQuery, draft: AllocationDraft): boolean {
  return rules.keys.every((key) => Number.isSafeInteger(draft.values[key]) &&
    draft.values[key]! >= rules.min && draft.values[key]! <= rules.max) &&
    rules.keys.reduce((sum, key) => sum + draft.values[key]!, 0) === rules.requiredTotal;
}
