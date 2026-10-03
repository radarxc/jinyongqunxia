import { canonicalJson, floorDivInt, type JsonValue } from '@tianshu/shared';
import type { ChapterDef } from '@tianshu/data/schemas';
import type { SleepAllocationSource } from '../state';

export const FIRST_SLEEP_RULE = Object.freeze({
  version: 'first-sleep.v1',
  keys: ['str', 'con', 'bre', 'wis', 'agi', 'wil'] as const,
  lockedKeys: ['luk', 'cha'] as const,
  base: 35, min: 20, max: 80, budget: 90,
});
export type SleepAllocationKey = typeof FIRST_SLEEP_RULE.keys[number];
export type SleepAllocation = Readonly<Record<SleepAllocationKey, number>>;
export interface BookSleepPlan {
  readonly id: string; readonly from: string; readonly to: string;
  readonly targetTier: 'HIGH' | 'MID' | 'LOW'; readonly sleepEventId: string;
  readonly skills: { readonly martial: readonly string[]; readonly inner: readonly string[] };
  readonly convert: { readonly forget: readonly string[]; readonly dissipate: readonly string[] };
  readonly equips: readonly string[]; readonly sleepAlloc: Readonly<Record<string, number>>;
  readonly acknowledged: readonly string[]; readonly allocationSource: SleepAllocationSource;
  readonly allocationRuleVersion: string;
}
export interface BookSleepResult {
  readonly planId: string; readonly fragmentsCreated: readonly string[];
  readonly fragmentsUpdated: readonly string[]; readonly epiphanyGained: number;
  readonly trueEssenceGained: number; readonly lost: { readonly equips: number;
    readonly items: number; readonly money: number; readonly sects: readonly string[] };
  readonly departedCompanions: readonly string[];
}
export interface FirstSleepAllocationQuery {
  readonly ruleVersion: string; readonly keys: readonly SleepAllocationKey[];
  readonly base: number; readonly min: number; readonly max: number; readonly budget: number;
  readonly requiredTotal: number; readonly draft: SleepAllocation | null;
  readonly presets: { readonly balanced: SleepAllocation };
  readonly lockedKeys: typeof FIRST_SLEEP_RULE.lockedKeys;
}
const total = (): number => FIRST_SLEEP_RULE.keys.length * FIRST_SLEEP_RULE.base +
  FIRST_SLEEP_RULE.budget;
const balanced = (): SleepAllocation => Object.fromEntries(FIRST_SLEEP_RULE.keys.map((key) =>
  [key, floorDivInt(total(), FIRST_SLEEP_RULE.keys.length)])) as unknown as SleepAllocation;
export function firstSleepAllocationQuery(draft: SleepAllocation | null = null): FirstSleepAllocationQuery {
  return { ruleVersion: FIRST_SLEEP_RULE.version, keys: FIRST_SLEEP_RULE.keys,
    base: FIRST_SLEEP_RULE.base, min: FIRST_SLEEP_RULE.min, max: FIRST_SLEEP_RULE.max,
    budget: FIRST_SLEEP_RULE.budget, requiredTotal: total(), draft,
    presets: { balanced: balanced() }, lockedKeys: FIRST_SLEEP_RULE.lockedKeys };
}
export function firstSleepQueryForState(state: { readonly chapter: { readonly chapterId: string };
  readonly profile: { readonly progression?: { readonly changshengLayer: number } } },
  draft: SleepAllocation | null = null): FirstSleepAllocationQuery | null {
  return state.chapter.chapterId === 'ch00_yuenv' &&
    (state.profile.progression?.changshengLayer ?? 0) >= 1 ? firstSleepAllocationQuery(draft) : null;
}
export function validFirstSleepAllocation(value: unknown): value is SleepAllocation {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const entries = value as Readonly<Record<string, unknown>>;
  const keys = Object.keys(entries);
  if (keys.length !== FIRST_SLEEP_RULE.keys.length || keys.some((key) =>
    !(FIRST_SLEEP_RULE.keys as readonly string[]).includes(key))) return false;
  let sum = 0;
  for (const key of FIRST_SLEEP_RULE.keys) {
    const entry = entries[key];
    if (typeof entry !== 'number' || !Number.isSafeInteger(entry) || entry < FIRST_SLEEP_RULE.min ||
        entry > FIRST_SLEEP_RULE.max) return false;
    sum += entry;
  }
  return sum === total();
}
export function canonicalBookSleepPlan(plan: BookSleepPlan): string {
  return canonicalJson(plan as unknown as JsonValue);
}
export function chapterDef(content: readonly ChapterDef[] | undefined, id: string): ChapterDef | undefined {
  return content?.find((entry) => entry.id === id);
}
