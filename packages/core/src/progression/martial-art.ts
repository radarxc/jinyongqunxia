import type { SkillInstance } from '@tianshu/data/schemas';
import { skillExpToNext } from './math';
import type { ProgressionEvent } from './types';

export interface MartialArtProgressResult {
  readonly skill: SkillInstance;
  readonly gainedLayers: number;
  readonly consumedSxp: number;
  readonly event: Extract<ProgressionEvent, { readonly t: 'progression/martialArtAdvanced' }>;
}

export function advanceMartialArtProgress(
  skill: SkillInstance, gainedSxp: number, layerCap = skill.sourceCap,
): MartialArtProgressResult {
  if (!Number.isSafeInteger(gainedSxp) || gainedSxp < 0) throw new RangeError('PROGRESSION_SXP_GAIN');
  if (!Number.isSafeInteger(layerCap) || layerCap < 1 || layerCap > 10) {
    throw new RangeError('PROGRESSION_LAYER_CAP');
  }
  const cap = Math.min(10, skill.sourceCap, layerCap);
  let trueLayer = skill.trueLayer;
  let sxp = skill.sxp + gainedSxp;
  if (!Number.isSafeInteger(sxp)) throw new RangeError('PROGRESSION_SXP_OVERFLOW');
  let consumedSxp = 0;
  while (trueLayer < cap) {
    const required = skillExpToNext(skill.sourceGrade, trueLayer);
    if (sxp < required) break;
    sxp -= required; consumedSxp += required; trueLayer += 1;
  }
  if (trueLayer >= cap && cap < 10) {
    sxp = Math.min(sxp, skillExpToNext(skill.sourceGrade, Math.min(trueLayer, 9)));
  }
  const next = { ...skill, trueLayer, sxp };
  const gainedLayers = trueLayer - skill.trueLayer;
  return { skill: next, gainedLayers, consumedSxp, event: {
    t: 'progression/martialArtAdvanced', skillId: skill.skillId, gainedSxp, gainedLayers,
    trueLayer, sxp,
  } };
}
