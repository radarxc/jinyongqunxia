import { describe, expect, it } from 'vitest';
import { createRng } from '../../rng';
import { acuteGather, advanceGatherState, createGatherState, settleGatherAction } from './gather';
import { dispatchMeridianFlowCommand } from '.';
import { createMeridianFlowRuntime } from './runtime';

function flow() {
  return createMeridianFlowRuntime({ unitId: 'unit_fixture', productionPerTick: 8,
    qiSpeedBp: 10_000, practiceBp: 9800, nodes: [
      { acupointRef: 'ap_fixture_a', opened: true, fluxCap: 8, lengthUnit: 1, flowBp: 10_000 },
      { acupointRef: 'ap_fixture_b', opened: true, fluxCap: 8, lengthUnit: 1, flowBp: 10_000 },
    ], routes: [
      { routeId: 'mfr_fixture_a', steps: [{ acupointRef: 'ap_fixture_a', lengthUnit: 1, segmentCt: 60, riskBp: 0 }] },
      { routeId: 'mfr_fixture_b', steps: [{ acupointRef: 'ap_fixture_b', lengthUnit: 1, segmentCt: 60, riskBp: 0 }] },
    ], activeRouteId: 'mfr_fixture_a' });
}

describe('gather state', () => {
  it('charges by speed, skips exactly one ready action, and keeps overflow CT', () => {
    const state = createGatherState(300, 900);
    expect(advanceGatherState(state).ct).toBe(1200);
    expect(acuteGather(state, 'mfr_fixture_a')).toMatchObject({ ct: 200, skippedActions: 1 });
    advanceGatherState(state, 3);
    settleGatherAction(state, 800);
    expect(state).toMatchObject({ ct: 300, status: 'charging', skippedActions: 1 });
  });

  it('rejects acute gathering before readiness without switching routes', () => {
    const runtime = flow();
    const before = runtime.snapshot();
    const result = dispatchMeridianFlowCommand({ flow: runtime, gather: createGatherState(100),
      battleRng: createRng([1, 2, 3, 4]) }, { t: 'qi.acuteGather', routeId: 'mfr_fixture_b' });
    expect(result).toEqual({ accepted: false, events: [], error: 'QI_GATHER_NOT_READY' });
    expect(runtime.snapshot()).toEqual(before);
  });

  it('rejects acute gathering on a non-attack route', () => {
    const guarded = createMeridianFlowRuntime({ unitId: 'unit_fixture', productionPerTick: 8,
      qiSpeedBp: 10_000, practiceBp: 9800, nodes: [
        { acupointRef: 'ap_fixture_a', opened: true, fluxCap: 8, lengthUnit: 1, flowBp: 10_000 },
      ], routes: [{ routeId: 'mfr_fixture_guard', purpose: 'defense', steps: [
        { acupointRef: 'ap_fixture_a', lengthUnit: 1, segmentCt: 60, riskBp: 0 },
      ] }] });
    const gather = createGatherState(100, 1000);
    const before = guarded.snapshot();
    const result = dispatchMeridianFlowCommand({ flow: guarded, gather,
      battleRng: createRng([1, 2, 3, 4]) }, { t: 'qi.acuteGather', routeId: 'mfr_fixture_guard' });
    expect(result).toEqual({ accepted: false, events: [], error: 'QI_ROUTE_NOT_ATTACK' });
    expect(guarded.snapshot()).toEqual(before);
    expect(gather).toMatchObject({ ct: 1000, status: 'ready', skippedActions: 0 });
  });

  it('advances both CT and qi through the command channel', () => {
    const runtime = flow();
    const result = dispatchMeridianFlowCommand({ flow: runtime, gather: createGatherState(100),
      battleRng: createRng([1, 2, 3, 4]) }, { t: 'qi.tick', ticks: 10 });
    expect(result.accepted).toBe(true);
    expect(result.events.map((event) => event.t)).toEqual(['qi.flowAdvanced', 'qi.gatherAdvanced']);
  });

  it('rejects a sealed move before consuming RNG or changing flow state', () => {
    const runtime = createMeridianFlowRuntime({ unitId: 'unit_fixture', productionPerTick: 8,
      qiSpeedBp: 10_000, practiceBp: 9800, nodes: [
        { acupointRef: 'ap_fixture_a', opened: true, fluxCap: 8, lengthUnit: 1,
          flowBp: 10_000, sealLevel: 9 },
      ], routes: [{ routeId: 'mfr_fixture_a', steps: [
        { acupointRef: 'ap_fixture_a', lengthUnit: 1, segmentCt: 60, riskBp: 0 },
      ] }] });
    let calls = 0;
    const before = runtime.snapshot();
    const result = dispatchMeridianFlowCommand({ flow: runtime, gather: createGatherState(100),
      battleRng: { nextU32: () => { calls += 1; return 0; },
        snapshot: () => [0, 0, 0, 0] } }, { t: 'qi.resolveMove', input: {
        routeId: 'mfr_fixture_a', moveId: 'mv_fixture', targetIds: ['npc_fixture'],
        causeId: 'cause_fixture', battleTick: 0,
        reference: { releasedQi: 1, meanFluxCap: 1, meanFlowBp: 1, routeQualityBp: 1 },
        critical: false, critRollBp: 0, critChanceBp: 0,
      } });
    expect(result).toEqual({ accepted: false, events: [], error: 'QI_ROUTE_SEALED' });
    expect([calls, runtime.snapshot()]).toEqual([0, before]);
  });

  it('rejects an invalid move contract before consuming RNG or releasing qi', () => {
    const runtime = flow();
    runtime.tick(2);
    let calls = 0;
    const before = runtime.snapshot();
    const result = dispatchMeridianFlowCommand({ flow: runtime, gather: createGatherState(100),
      battleRng: { nextU32: () => { calls += 1; return 9999; },
        snapshot: () => [0, 0, 0, 0] } }, { t: 'qi.resolveMove', input: {
        routeId: 'mfr_fixture_a', moveId: 'mv_fixture', targetIds: ['npc_fixture'],
        causeId: 'cause_fixture', battleTick: 2,
        reference: { releasedQi: 0, meanFluxCap: 1, meanFlowBp: 1, routeQualityBp: 1 },
        critical: false, critRollBp: 0, critChanceBp: 0,
      } });

    expect(result).toEqual({ accepted: false, events: [], error: 'QI_REFERENCE_ZERO' });
    expect([calls, runtime.snapshot()]).toEqual([0, before]);
  });
});
