import type { MeridianProgress, SkillInstance } from '@tianshu/data/schemas';
import { describe, expect, it } from 'vitest';
import {
  advanceInnerPractice, advanceMartialArtProgress, applyMeridianBoost,
  createMeditationState, dispatchProgressionCommand, fluxTrainingGain,
  interruptMeditation, skillExpToNext,
} from '.';

function progress(flux = 16): MeridianProgress {
  return { schemaVersion: 2, opened: ['ap_fixture'],
    meridianStats: { mer_fixture: { grade: 6, strengthLayer: 3, strengthXp: 0, fluxCap: flux } },
    acupointStats: { ap_fixture: { grade: 6, strengthLayer: 3, strengthXp: 0, fluxCap: flux } },
    targets: {}, turnCompleted: 0, lastAppliedMigration: 2 };
}

function skill(): SkillInstance {
  return { skillId: 'sk_fixture', sourceGrade: 1, sourceCap: 10, trueLayer: 1, sxp: 90,
    learnedIn: 'ch01_tianlong', nativeTo: 'ch01_tianlong', attunedGrade: null,
    attunedIn: null, latentExp: 0, movesEquipped: [], insight: 0, pages: [], flags: [] };
}

describe('inner-practice cycles', () => {
  it('uses the frozen headroom formula and only counts complete cycles', () => {
    expect(fluxTrainingGain(16, 64, 6, 5)).toBe(3);
    expect(fluxTrainingGain(64, 64, 6, 5)).toBe(0);
    const before = progress();
    const result = advanceInnerPractice(before, { mode: 'meditation', elapsedTicks: 119,
      carriedTicks: 1, cycleTicks: 60, fluxTrainBase: 6, effectiveLayer: 5, rateH: 100,
      meridianIds: ['mer_fixture'], acupointIds: ['ap_fixture'] });
    expect(result).toMatchObject({ completedCycles: 2, remainderTicks: 0 });
    expect(result.progress.acupointStats['ap_fixture']).toMatchObject({ fluxCap: 22, strengthXp: 10 });
    expect(before.acupointStats['ap_fixture']!.fluxCap).toBe(16);
  });

  it('keeps an incomplete cycle and trains duplicate targets exactly once', () => {
    const before = progress();
    const pending = advanceInnerPractice(before, { mode: 'practice', elapsedTicks: 39,
      carriedTicks: 20, cycleTicks: 60, fluxTrainBase: 6, effectiveLayer: 5, rateH: 100,
      meridianIds: ['mer_fixture'], acupointIds: ['ap_fixture'] });
    expect(pending).toMatchObject({ completedCycles: 0, remainderTicks: 59, changes: [], events: [] });
    expect(pending.progress).toBe(before);
    const trained = advanceInnerPractice(before, { mode: 'practice', elapsedTicks: 60,
      cycleTicks: 60, fluxTrainBase: 6, effectiveLayer: 5, rateH: 100,
      meridianIds: ['mer_fixture', 'mer_fixture'],
      acupointIds: ['ap_fixture', 'ap_fixture'] });
    expect(trained.changes.map((entry) => entry.targetRef))
      .toEqual(['mer_fixture', 'ap_fixture']);
    expect(trained.progress.acupointStats['ap_fixture']!.fluxCap).toBe(19);
  });
});

describe('martial-art and meridian progression', () => {
  it('uses the grade table and carries experience across several layers', () => {
    expect([1, 6, 12].map((grade) => skillExpToNext(grade, 1))).toEqual([100, 240, 600]);
    expect(advanceMartialArtProgress(skill(), 400)).toMatchObject({
      skill: { trueLayer: 4, sxp: 20 }, gainedLayers: 3, consumedSxp: 470,
    });
  });

  it('honours a lower progression cap and retains at most one next-layer cost', () => {
    const capped = advanceMartialArtProgress({ ...skill(), trueLayer: 2, sxp: 140 }, 5000, 2);
    expect(capped).toMatchObject({ skill: { trueLayer: 2, sxp: 150 },
      gainedLayers: 0, consumedSxp: 0 });
    expect(advanceMartialArtProgress({ ...skill(), sourceCap: 2 }, 10_000))
      .toMatchObject({ skill: { trueLayer: 2, sxp: 150 }, gainedLayers: 1 });
  });

  it('applies one permanent temper effect in grade, strength, then flux order', () => {
    const result = applyMeridianBoost(progress(62), { targetKind: 'acupoint',
      targetRef: 'ap_fixture', gradeUp: 1, strengthXp: 1000, fluxFlat: 4 });
    expect(result.progress.acupointStats['ap_fixture']).toEqual({
      grade: 7, strengthLayer: 4, strengthXp: 100, fluxCap: 64,
    });
    expect(result.event).toMatchObject({ t: 'progression/meridianBoostApplied',
      targetKind: 'acupoint', targetRef: 'ap_fixture' });
    expect(() => applyMeridianBoost(progress(), { targetKind: 'acupoint',
      targetRef: 'ap_missing', gradeUp: 1, strengthXp: 0, fluxFlat: 0 }))
      .toThrow('PROGRESSION_TARGET_NOT_OPEN');
  });
});

describe('meditation interruption and progression commands', () => {
  it('describes qigong deviation without applying the downstream buff', () => {
    const meditation = createMeditationState('med_fixture', 600);
    const result = interruptMeditation(meditation, 'cause_ambush', 120);
    expect(result.state).toMatchObject({ status: 'interrupted', qiGatherState: 'none' });
    expect(result.effect).toEqual({ buffId: 'bf_chaqi', ownActions: 3,
      productionBp: 5000, acuteGatherForbidden: true });
    expect(result.event).toMatchObject({ t: 'progression/meditationInterrupted',
      sessionId: 'med_fixture', causeId: 'cause_ambush', worldTick: 120 });
    const completed = { ...meditation, elapsedTicks: 600, status: 'completed' as const,
      qiGatherState: 'none' as const };
    expect(interruptMeditation(completed, 'cause_late', 121))
      .toEqual({ state: completed, effect: null, event: null });
  });

  it('routes atomic meridian boosts through command and event results', () => {
    const state = { meridians: progress(), skills: [skill()], meditation: null };
    const result = dispatchProgressionCommand(state, { t: 'progression/applyMeridianBoost',
      effect: { targetKind: 'meridian', targetRef: 'mer_fixture',
        gradeUp: 0, strengthXp: 0, fluxFlat: 4 } });
    expect(result.accepted).toBe(true);
    expect(result.events.map((event) => event.t)).toEqual(['progression/meridianBoostApplied']);
    expect(result.state.meridians.meridianStats['mer_fixture']!.fluxCap).toBe(20);
    expect(state.meridians.meridianStats['mer_fixture']!.fluxCap).toBe(16);
  });

  it('returns the exact original state when a command is rejected', () => {
    const state = { meridians: progress(), skills: [skill()], meditation: null };
    const result = dispatchProgressionCommand(state, { t: 'progression/applyMeridianBoost',
      effect: { targetKind: 'acupoint', targetRef: 'ap_missing',
        gradeUp: 1, strengthXp: 0, fluxFlat: 0 } });
    expect(result).toMatchObject({ accepted: false, events: [],
      error: 'PROGRESSION_TARGET_NOT_OPEN' });
    expect(result.state).toBe(state);
  });
});
