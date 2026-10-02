import { compareCodePoints, mulDivFloor } from '@tianshu/shared';
import type { MeridianProgress } from '@tianshu/data/schemas';
import type { CharacterState, CharacterStats } from './models';

export interface ResourceSkillRef {
  readonly skillId: string; readonly absGrade: number;
  readonly category: 'inner' | 'other'; readonly trueLayer: number;
}

export interface CharacterStatsInput {
  readonly skills: readonly ResourceSkillRef[];
  readonly meridians: MeridianProgress;
  readonly legacyHpCredit: number; readonly legacyMpCredit: number;
  readonly flatHpMax?: number; readonly flatMpMax?: number;
  readonly hpMaxPctBp?: number; readonly mpMaxPctBp?: number;
  readonly innate?: CharacterState['innate'];
}

function checked(value: number, code: string): number {
  if (!Number.isSafeInteger(value)) throw new TypeError(code);
  return value;
}
function sum(values: readonly number[]): number {
  let result = 0;
  for (const value of values) result = checked(result + value, 'CHARACTER_STAT_OVERFLOW');
  return result;
}
function applyBp(root: number, flat: number, pctBp: number): number {
  const factor = Math.max(2000, checked(10000 + pctBp, 'CHARACTER_STAT_OVERFLOW'));
  const base = checked(root + flat, 'CHARACTER_STAT_OVERFLOW');
  if (base <= 0) return 1;
  return Math.max(1, mulDivFloor(base, factor, 10000));
}

export function deriveCharacterStats(input: CharacterStatsInput): CharacterStats {
  const opened = [...new Set(input.meridians.opened)].sort(compareCodePoints);
  if (opened.length !== input.meridians.opened.length) throw new TypeError('CHARACTER_OPENED_DUPLICATE');
  const openedSet = new Set(opened);
  const skillHp = sum(input.skills.filter((skill) => skill.category === 'other').map(
    (skill) => checked((30 + 4 * skill.absGrade) * Math.min(skill.trueLayer, 9), 'CHARACTER_STAT_OVERFLOW'),
  ));
  const innerHp = sum(input.skills.filter((skill) => skill.category === 'inner').map(
    (skill) => checked((20 + 3 * skill.absGrade) * Math.min(skill.trueLayer, 9), 'CHARACTER_STAT_OVERFLOW'),
  ));
  const innerMp = sum(input.skills.filter((skill) => skill.category === 'inner').map(
    (skill) => checked((28 + 5 * skill.absGrade) * Math.min(skill.trueLayer, 9), 'CHARACTER_STAT_OVERFLOW'),
  ));
  const meridianScore = sum(Object.values(input.meridians.meridianStats).map(
    (entry) => checked(entry.grade * entry.strengthLayer, 'CHARACTER_STAT_OVERFLOW'),
  ));
  const acupointScore = sum(Object.entries(input.meridians.acupointStats)
    .filter(([id]) => openedSet.has(id)).map(([, entry]) =>
      checked(entry.grade * entry.strengthLayer, 'CHARACTER_STAT_OVERFLOW')));
  const hpRoot = checked(300 + skillHp + innerHp + 8 * opened.length + 6 * meridianScore + 2 * acupointScore + input.legacyHpCredit, 'CHARACTER_STAT_OVERFLOW');
  const mpRoot = checked(200 + innerMp + 6 * opened.length + 8 * meridianScore + 3 * acupointScore + input.legacyMpCredit, 'CHARACTER_STAT_OVERFLOW');
  const innate = input.innate;
  return {
    hpMax: applyBp(hpRoot, input.flatHpMax ?? 0, input.hpMaxPctBp ?? 0),
    mpMax: applyBp(mpRoot, input.flatMpMax ?? 0, input.mpMaxPctBp ?? 0),
    strength: innate?.str ?? 0, speed: innate?.agi ?? 0,
    tenacity: innate?.con ?? 0, coordination: innate?.wis ?? 0,
  };
}

function statsFor(
  character: Pick<CharacterState, 'meridians' | 'legacyHpCredit' | 'legacyMpCredit' | 'innate'>,
  skills: readonly ResourceSkillRef[],
): CharacterStats {
  return deriveCharacterStats({
    skills, meridians: character.meridians,
    legacyHpCredit: character.legacyHpCredit, legacyMpCredit: character.legacyMpCredit,
    innate: character.innate,
  });
}

export function createCharacterState(
  character: Omit<CharacterState, 'stats' | 'resources' | 'consumable'> &
    { readonly consumable?: CharacterState['consumable'] },
  skills: readonly ResourceSkillRef[],
): CharacterState {
  const stats = statsFor(character, skills);
  return { ...character, stats, resources: { hp: stats.hpMax, mp: stats.mpMax },
    consumable: character.consumable ?? { stamina: 0, staminaMax: 0, ailments: [],
      temporaryEffects: [], permanentBonuses: { stats: {}, hpMaxBp: 0, mpMaxBp: 0 },
      meridianAids: [] } };
}

export function withDerivedCharacterStats(
  character: CharacterState, skills: readonly ResourceSkillRef[],
): CharacterState {
  const stats = statsFor(character, skills);
  const preserve = (current: number, oldMax: number, newMax: number): number =>
    current === oldMax ? newMax : Math.min(newMax, mulDivFloor(current, newMax, Math.max(1, oldMax)));
  return { ...character, stats, resources: {
    hp: preserve(character.resources.hp, character.stats.hpMax, stats.hpMax),
    mp: preserve(character.resources.mp, character.stats.mpMax, stats.mpMax),
  } };
}
