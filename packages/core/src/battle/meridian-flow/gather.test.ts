import { describe, expect, it } from 'vitest';
import type { Rng } from '../../rng';
import { acuteGather, dispatchMeridianFlowCommand, queryAcuteGather } from '.';
import { createMeridianFlowRuntime } from './runtime';
import type { MeridianFlowInput } from './types';

function input(purpose: 'attack' | 'defense' = 'attack'): MeridianFlowInput {
  return {
    unitId: 'unit_fixture',
    productionPerTick: 8,
    qiSpeedBp: 10_000,
    practiceBp: 9800,
    nodes: [
      { acupointRef: 'ap_fixture_a', opened: true, fluxCap: 8, lengthUnit: 1, flowBp: 10_000 },
      { acupointRef: 'ap_fixture_b', opened: true, fluxCap: 8, lengthUnit: 2, flowBp: 10_000 },
    ],
    routes: [
      {
        routeId: 'mfr_fixture_a',
        steps: [{ acupointRef: 'ap_fixture_a', lengthUnit: 1, segmentCt: 60, riskBp: 0 }],
      },
      {
        routeId: 'mfr_fixture_b',
        purpose,
        steps: [{ acupointRef: 'ap_fixture_b', lengthUnit: 2, segmentCt: 60, riskBp: 0 }],
      },
    ],
    activeRouteId: 'mfr_fixture_a',
  };
}

function countingRng(value = 9999): Rng & { readonly calls: () => number } {
  let calls = 0;
  return {
    nextU32: () => {
      calls += 1;
      return value;
    },
    snapshot: () => [1, 2, 3, 4],
    calls: () => calls,
  };
}

describe('acute qi gather runtime facade', () => {
  it('queries readiness without changing the runtime snapshot', () => {
    const runtime = createMeridianFlowRuntime(input());
    const before = runtime.snapshot();

    expect(queryAcuteGather(runtime, 'mfr_fixture_b')).toMatchObject({
      routeId: 'mfr_fixture_b',
      purpose: 'attack',
      full: false,
    });
    expect(runtime.snapshot()).toEqual(before);
  });

  it('selects an open attack route without consuming RNG', () => {
    const runtime = createMeridianFlowRuntime(input());
    const rng = countingRng();
    const result = dispatchMeridianFlowCommand(
      { flow: runtime, battleRng: rng },
      { t: 'qi.acuteGather', routeId: 'mfr_fixture_b' },
    );

    expect(result).toMatchObject({
      accepted: true,
      events: [{ t: 'qi.acuteGathered', routeId: 'mfr_fixture_b' }],
    });
    expect(runtime.snapshot().activeRouteId).toBe('mfr_fixture_b');
    expect(rng.calls()).toBe(0);
  });

  it('allows a full route to keep advancing before completing a circulation', () => {
    const runtime = createMeridianFlowRuntime(input());
    const snapshot = runtime.snapshot();
    runtime.restore({
      ...snapshot,
      routes: snapshot.routes.map((route) =>
        route.routeId === 'mfr_fixture_b'
          ? { ...route, windowTicks: 1, totalQi: 16, pipelineQi: [16, 0, 0] }
          : route,
      ),
    });

    expect(queryAcuteGather(runtime, 'mfr_fixture_b')).toMatchObject({
      routeInFlightQi: 16,
      circulationBp: 5_000,
      canInject: false,
      canAdvance: true,
      full: false,
    });
    expect(acuteGather(runtime, 'mfr_fixture_b').status.full).toBe(false);
    expect(runtime.snapshot().activeRouteId).toBe('mfr_fixture_b');
  });

  it('rejects a full completed circulation atomically and without RNG', () => {
    const runtime = createMeridianFlowRuntime(input());
    const snapshot = runtime.snapshot();
    runtime.restore({
      ...snapshot,
      routes: snapshot.routes.map((route) =>
        route.routeId === 'mfr_fixture_b'
          ? { ...route, windowTicks: 2, totalQi: 16, pipelineQi: [16, 0, 0] }
          : route,
      ),
    });
    const before = runtime.snapshot();
    const rng = countingRng();

    expect(
      dispatchMeridianFlowCommand(
        { flow: runtime, battleRng: rng },
        { t: 'qi.acuteGather', routeId: 'mfr_fixture_b' },
      ),
    ).toEqual({ accepted: false, events: [], error: 'QI_CARRY_FULL' });
    expect(runtime.snapshot()).toEqual(before);
    expect(rng.calls()).toBe(0);
  });

  it('rejects a defense route before changing the selected route', () => {
    const runtime = createMeridianFlowRuntime(input('defense'));
    const before = runtime.snapshot();
    const rng = countingRng();

    expect(
      dispatchMeridianFlowCommand(
        { flow: runtime, battleRng: rng },
        { t: 'qi.acuteGather', routeId: 'mfr_fixture_b' },
      ),
    ).toEqual({ accepted: false, events: [], error: 'QI_ROUTE_NOT_ATTACK' });
    expect(runtime.snapshot()).toEqual(before);
    expect(rng.calls()).toBe(0);
  });

  it('ticks qi through the command transaction without a second gather ledger', () => {
    const runtime = createMeridianFlowRuntime(input());
    const result = dispatchMeridianFlowCommand(
      { flow: runtime, battleRng: countingRng() },
      { t: 'qi.tick', ticks: 2 },
    );

    expect(result).toEqual({
      accepted: true,
      events: [
        { t: 'qi.flowAdvanced', unitId: 'unit_fixture', ticks: 2, battleTick: 2, stateVersion: 3 },
      ],
    });
    expect(runtime.snapshot()).toMatchObject({ tick: 2, activeRouteId: 'mfr_fixture_a' });
  });

  it('rejects an invalid move contract without consuming RNG or flow', () => {
    const runtime = createMeridianFlowRuntime(input());
    runtime.tick(2);
    const before = runtime.snapshot();
    const rng = countingRng();
    const result = dispatchMeridianFlowCommand(
      { flow: runtime, battleRng: rng },
      {
        t: 'qi.resolveMove',
        input: {
          routeId: 'mfr_fixture_a',
          moveId: 'mv_fixture',
          targetIds: ['npc_fixture'],
          causeId: 'cause_fixture',
          battleTick: 2,
          reference: { releasedQi: 0, meanFluxCap: 1, meanFlowBp: 1, routeQualityBp: 1 },
          critical: false,
          critRollBp: 0,
          critChanceBp: 0,
        },
      },
    );

    expect(result).toEqual({ accepted: false, events: [], error: 'QI_REFERENCE_ZERO' });
    expect(runtime.snapshot()).toEqual(before);
    expect(rng.calls()).toBe(0);
  });
});
