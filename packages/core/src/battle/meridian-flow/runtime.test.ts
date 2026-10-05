/// <reference types="node" />
// eslint-disable-next-line no-restricted-imports -- Test-only replay hash oracle; runtime stays platform-neutral.
import { createHash } from 'node:crypto';
import { canonicalJson } from '@tianshu/shared';
import { describe, expect, it } from 'vitest';
import { createRng, seedStream, type Rng } from '../../rng';
import { createMeridianFlowRuntime } from './runtime';
import type { MeridianFlowInput, ResolveQiMoveInput } from './types';

const STANDARD = { releasedQi: 192, meanFluxCap: 16, meanFlowBp: 10_000, routeQualityBp: 10_000 };
const ROWS: readonly (readonly [string, number, number, string, number, number, number, number,
  number, number, number])[] = [
  ['low', 8, 8000, 'weak', 6, 7, 28, 4666, 7687, 7299, 6500],
  ['low', 8, 8000, 'weak', 6, 15, 60, 10_000, 7687, 13_500, 10_377],
  ['low', 8, 8000, 'standard', 16, 7, 56, 4666, 8355, 7299, 6500],
  ['low', 8, 8000, 'standard', 16, 15, 120, 10_000, 8838, 13_500, 11_931],
  ['low', 8, 8000, 'strong', 32, 7, 56, 4666, 9303, 7299, 6790],
  ['low', 8, 8000, 'strong', 32, 15, 120, 10_000, 9665, 13_500, 13_047],
  ['mid', 16, 10_000, 'weak', 6, 6, 36, 5000, 7997, 7500, 6500],
  ['mid', 16, 10_000, 'weak', 6, 12, 72, 10_000, 7997, 13_500, 10_795],
  ['mid', 16, 10_000, 'standard', 16, 6, 96, 5000, 9196, 7500, 6897],
  ['mid', 16, 10_000, 'standard', 16, 12, 192, 10_000, 10_000, 13_500, 13_500],
  ['mid', 16, 10_000, 'strong', 32, 6, 96, 5000, 9732, 7500, 7299],
  ['mid', 16, 10_000, 'strong', 32, 12, 192, 10_000, 10_862, 13_500, 14_663],
  ['high', 28, 12_500, 'weak', 6, 5, 30, 5000, 7997, 7500, 6500],
  ['high', 28, 12_500, 'weak', 6, 10, 60, 10_000, 7997, 13_500, 10_795],
  ['high', 28, 12_500, 'standard', 16, 5, 80, 5000, 9061, 7500, 6795],
  ['high', 28, 12_500, 'standard', 16, 10, 160, 10_000, 9731, 13_500, 13_136],
  ['high', 28, 12_500, 'strong', 32, 5, 140, 5000, 11_009, 7500, 8256],
  ['high', 28, 12_500, 'strong', 32, 10, 280, 10_000, 13_097, 13_500, 17_680],
];

function fixture(productionPerTick: number, qiSpeedBp: number, fluxCap: number, routes = 1): MeridianFlowInput {
  const nodes = Array.from({ length: routes * 12 }, (_, index) => ({
    acupointRef: `ap_fixture_${String(index).padStart(3, '0')}`, opened: true,
    fluxCap, lengthUnit: 1, flowBp: 10_000,
  }));
  return { unitId: 'unit_fixture', productionPerTick, qiSpeedBp, practiceBp: 9800, nodes,
    routes: Array.from({ length: routes }, (_, routeIndex) => ({
      routeId: `mfr_fixture_${String(routeIndex).padStart(2, '0')}`,
      steps: nodes.slice(routeIndex * 12, routeIndex * 12 + 12).map((node) => ({
        acupointRef: node.acupointRef, lengthUnit: 1, segmentCt: 60, riskBp: 0,
      })),
    })), activeRouteId: 'mfr_fixture_00' };
}

function moveInput(ticks: number): ResolveQiMoveInput {
  return { routeId: 'mfr_fixture_00', moveId: 'mv_fixture', targetIds: ['npc_fixture'],
    causeId: 'cause_fixture', battleTick: ticks, reference: STANDARD, critical: false,
    critRollBp: 9999, critChanceBp: 0 };
}

function noJamRng(): Rng {
  return { nextU32: () => 9999, snapshot: () => [0, 0, 0, 0] };
}

describe('MeridianFlowRuntime frozen DES-qi table', () => {
  it.each(ROWS)(
    '%s inner / %s meridian at %s ticks',
    (_inner, production, speed, _meridian, width, ticks, released, circulation, base, cycle, final) => {
      const runtime = createMeridianFlowRuntime(fixture(
        production as number, speed as number, width as number,
      ));
      runtime.tick(ticks as number);
      const result = runtime.resolveMove(moveInput(ticks as number), noJamRng()).resolution;
      expect([result.releasedQi, result.circulationBp, result.baseMeridianAttackBp,
        result.circulationDamageBp, result.meridianAttackBp])
        .toEqual([released, circulation, base, cycle, final]);
      expect(result.completed).toBe(12);
    },
  );
});

describe('MeridianFlowRuntime state and replay', () => {
  it('advances a batch exactly like one tick at a time', () => {
    const input = fixture(16, 10_000, 16, 2);
    const batch = createMeridianFlowRuntime(input);
    const stepped = createMeridianFlowRuntime(input);
    batch.tick(12, 5_000);
    for (let tick = 0; tick < 12; tick += 1) stepped.tick(1, 5_000);
    expect(batch.snapshot()).toEqual(stepped.snapshot());
  });

  it('keeps old-route packets when switching injection routes during a batch', () => {
    const input = fixture(16, 10_000, 16, 2);
    const batch = createMeridianFlowRuntime(input);
    const stepped = createMeridianFlowRuntime(input);
    batch.tick(3); stepped.tick(3);
    batch.selectRoute('mfr_fixture_01'); stepped.selectRoute('mfr_fixture_01');
    batch.tick(12);
    for (let tick = 0; tick < 12; tick += 1) stepped.tick();
    expect(batch.snapshot()).toEqual(stepped.snapshot());
    expect(batch.snapshot().routes[0]!.totalQi).toBeGreaterThan(0);
    expect(batch.snapshot().routes[1]!.totalQi).toBeGreaterThan(0);
  });

  it('caps all stored qi at the unit and route capacities', () => {
    const runtime = createMeridianFlowRuntime(fixture(28, 12_500, 32));
    runtime.tick(1000);
    const snapshot = runtime.snapshot();
    expect(snapshot.dantianQi + snapshot.routes.reduce((sum, route) => sum + route.totalQi, 0))
      .toBe(runtime.unitQiHardCap);
    expect(snapshot.routes[0]!.totalQi).toBeLessThanOrEqual(384);
  });

  it('never exceeds a node carry capacity on a fractional-speed route', () => {
    const runtime = createMeridianFlowRuntime(fixture(8, 8000, 6));
    runtime.tick(15);
    const snapshot = runtime.snapshot();
    expect(Math.max(...snapshot.nodes.map((node) => node.inFlightQi))).toBeLessThanOrEqual(6);
    expect(snapshot.routes[0]!.totalQi).toBe(60);
  });

  it('arbitrates shared-node capacity across active route flows', () => {
    const input = fixture(8, 8000, 6, 2);
    const shared = input.nodes[0]!;
    const routeB = input.routes[1]!;
    const runtime = createMeridianFlowRuntime({ ...input, routes: [input.routes[0]!, { ...routeB,
      steps: [{ ...routeB.steps[0]!, acupointRef: shared.acupointRef }, ...routeB.steps.slice(1)] }] });
    runtime.tick(2); runtime.selectRoute('mfr_fixture_01'); runtime.tick(20);
    const snapshot = runtime.snapshot();
    expect(snapshot.nodes.find((node) => node.acupointRef === shared.acupointRef)?.inFlightQi)
      .toBeLessThanOrEqual(6);
    expect(snapshot.dantianQi + snapshot.routes.reduce((sum, route) => sum + route.totalQi, 0))
      .toBeLessThanOrEqual(runtime.unitQiHardCap);
  });

  it('keeps shared first-node residence within capacity after a congested route switch', () => {
    const input = fixture(16, 10_000, 16, 2);
    const shared = input.nodes[0]!;
    const routeB = input.routes[1]!;
    const runtime = createMeridianFlowRuntime({ ...input,
      nodes: input.nodes.map((node, index) => index === 1 ? { ...node, flowBp: 3000 } : node),
      routes: [input.routes[0]!, { ...routeB, steps: [
        { ...routeB.steps[0]!, acupointRef: shared.acupointRef }, ...routeB.steps.slice(1),
      ] }],
    });
    runtime.tick(2); runtime.selectRoute('mfr_fixture_01'); runtime.tick();
    const snapshot = runtime.snapshot();

    expect(snapshot.nodes.find((node) => node.acupointRef === shared.acupointRef)?.inFlightQi)
      .toBeLessThanOrEqual(16);
    expect(snapshot.dantianQi).toBe(12);
  });

  it('restores a canonical snapshot and replays to the same serialized result', () => {
    const run = () => {
      const runtime = createMeridianFlowRuntime(fixture(16, 10_000, 16));
      runtime.tick(5);
      const checkpoint = runtime.snapshot();
      runtime.tick(7);
      const rng = createRng(seedStream(31, 'battle'));
      const result = runtime.resolveMove(moveInput(12), rng);
      const final = canonicalJson({ result, snapshot: runtime.snapshot(), rng: rng.snapshot() } as never);
      const restored = createMeridianFlowRuntime(fixture(16, 10_000, 16));
      restored.restore(checkpoint); restored.tick(7);
      const replayRng = createRng(seedStream(31, 'battle'));
      const replay = canonicalJson({ result: restored.resolveMove(moveInput(12), replayRng),
        snapshot: restored.snapshot(), rng: replayRng.snapshot() } as never);
      return { final, replay, finalHash: createHash('sha256').update(final).digest('hex'),
        replayHash: createHash('sha256').update(replay).digest('hex') };
    };
    const first = run();
    const second = run();
    expect(first.replay).toBe(first.final);
    expect([first.finalHash, first.replayHash, second.finalHash, second.replayHash])
      .toEqual(Array.from({ length: 4 }, () => first.finalHash));
  });

  it('canonicalizes, deep-copies, and restores every dynamic v2 transient field', () => {
    const runtime = createMeridianFlowRuntime(fixture(16, 10_000, 16));
    runtime.tick(3);
    const reversePath = [{ acupointRef: 'ap_fixture_004', lengthUnit: 2 }];
    const affectedRouteRefs = ['mfr_fixture_09', 'mfr_fixture_00'];
    const transient = {
      foreignQi: [
        { id: 7, sourceUnitId: 'enemy_b', sourceInnerId: 'in_b', injectedQi: 8,
          remainingQi: 6, injectedSpeedBp: 10_000, injectionAcupoint: 'ap_fixture_004',
          hitZone: 'body' as const, digestRatioBp: 10_000, reversePath, stepIndex: 0,
          remainingTravelTick: 2, arrivedAtTick: 5 },
        { id: 3, sourceUnitId: 'enemy_a', sourceInnerId: 'in_a', injectedQi: 5,
          remainingQi: 5, injectedSpeedBp: 9_000, injectionAcupoint: 'ap_fixture_002',
          hitZone: 'hand' as const, digestRatioBp: 20_000, reversePath: [], stepIndex: 0,
          remainingTravelTick: 0, arrivedAtTick: 2 },
        { id: 2, sourceUnitId: 'enemy_c', sourceInnerId: 'in_c', injectedQi: 4,
          remainingQi: 1, injectedSpeedBp: 8_000, injectionAcupoint: 'ap_fixture_006',
          hitZone: 'leg' as const, digestRatioBp: 30_000, reversePath: [], stepIndex: 0,
          remainingTravelTick: 0, arrivedAtTick: 5 },
      ],
      acupointOccupancies: [
        { acupointRef: 'ap_fixture_010', sourceUnitId: 'enemy_z', sourceInnerId: 'in_z',
          occupyingQi: 3, digestRatioBp: 20_000, level: 2, remainingOwnActions: 2,
          affectedRouteRefs },
        { acupointRef: 'ap_fixture_002', sourceUnitId: 'enemy_b', sourceInnerId: 'in_b',
          occupyingQi: 2, digestRatioBp: 20_000, level: 1, remainingOwnActions: 1,
          affectedRouteRefs: [] },
        { acupointRef: 'ap_fixture_002', sourceUnitId: 'enemy_a', sourceInnerId: 'in_a',
          occupyingQi: 1, digestRatioBp: 10_000, level: 3, remainingOwnActions: 3,
          affectedRouteRefs: [] },
      ],
      redirectedQi: 11, redirectedQiExpiresAtOwnAction: 4,
    };

    const canonical = runtime.snapshot(transient);
    expect(canonical.foreignQi.map((entry) => entry.id)).toEqual([3, 2, 7]);
    expect(canonical.acupointOccupancies.map((entry) =>
      `${entry.acupointRef}:${entry.sourceUnitId}`)).toEqual([
      'ap_fixture_002:enemy_a', 'ap_fixture_002:enemy_b', 'ap_fixture_010:enemy_z',
    ]);
    expect(canonical.acupointOccupancies[2]!.affectedRouteRefs)
      .toEqual(['mfr_fixture_00', 'mfr_fixture_09']);
    reversePath[0]!.lengthUnit = 99;
    affectedRouteRefs.push('mfr_fixture_mutated');
    expect(canonical.foreignQi[2]!.reversePath[0]!.lengthUnit).toBe(2);
    expect(canonical.acupointOccupancies[2]!.affectedRouteRefs).toHaveLength(2);

    const complete = { ...canonical, grappleLevel: 3, grappleSource: 'enemy_grappler',
      grappleRemaining: 2 };
    const restored = createMeridianFlowRuntime(fixture(16, 10_000, 16));
    restored.restore(complete);
    expect(restored.snapshot()).toEqual(complete);
  });

  it('rejects an invalid snapshot without partially changing live state', () => {
    const runtime = createMeridianFlowRuntime(fixture(16, 10_000, 16));
    runtime.tick(5);
    const before = runtime.snapshot();
    const invalid = { ...before, tick: before.tick + 7, nodes: before.nodes.map((node, index) =>
      index === before.nodes.length - 1 ? { ...node, inFlightQi: node.inFlightQi + 1 } : node) };

    expect(() => runtime.restore(invalid)).toThrowError('QI_SNAPSHOT_NODE');
    expect(runtime.snapshot()).toEqual(before);
  });

  it('clears an expired redirected-Qi action marker with an explicit null', () => {
    const runtime = createMeridianFlowRuntime(fixture(16, 10_000, 16));
    runtime.restore({ ...runtime.snapshot(), redirectedQi: 10, redirectedQiExpiresAtOwnAction: 4 });
    const expired = runtime.snapshot({ foreignQi: [], acupointOccupancies: [],
      redirectedQi: 0, redirectedQiExpiresAtOwnAction: null });
    expect(expired.redirectedQiExpiresAtOwnAction).toBeNull();
    const restored = createMeridianFlowRuntime(fixture(16, 10_000, 16));
    restored.restore(expired);
    expect(restored.snapshot()).toEqual(expired);
  });

  it('releases only qi already downstream when a route jams midway', () => {
    const runtime = createMeridianFlowRuntime(fixture(16, 10_000, 16));
    runtime.tick(12);
    const before = runtime.snapshot().routes[0]!.totalQi;
    let roll = 0;
    const rng: Rng = { nextU32: () => roll++ === 2 ? 0 : 9999,
      snapshot: () => [0, 0, 0, 0] };
    const result = runtime.resolveMove(moveInput(12), rng).resolution;
    const after = runtime.snapshot().routes[0]!.totalQi;

    expect(result.blockedAt).toBe(2);
    expect([before, result.releasedQi, after]).toEqual([192, 144, 48]);
    expect(result.releasedQi + after).toBe(before);
  });

  it('emits one stable full-cycle critical event without consuming extra RNG', () => {
    const runtime = createMeridianFlowRuntime(fixture(16, 10_000, 16));
    runtime.tick(12);
    const rng = createRng(seedStream(77, 'battle'));
    const controlRng = createRng(seedStream(77, 'battle'));
    for (let index = 0; index < 12; index += 1) controlRng.nextU32();
    const result = runtime.resolveMove({ ...moveInput(12), critical: true, critRollBp: 321,
      critChanceBp: 900 }, rng);
    expect(rng.snapshot()).toEqual(controlRng.snapshot());
    expect(result.fullCycleCrit).toMatchObject({ t: 'qi.fullCycleCrit', circulationBp: 10_000,
      critRollBp: 321, critChanceBp: 900 });
    expect(result.fullCycleCrit?.message).toBeTruthy();
  });
});
