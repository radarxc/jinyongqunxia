/// <reference types="node" />
// eslint-disable-next-line no-restricted-imports -- Test-only monotonic timing; gameplay does not read wall time.
import { performance } from 'node:perf_hooks';
// eslint-disable-next-line no-restricted-imports -- Test-only state hash oracle.
import { createHash } from 'node:crypto';
import { canonicalJson } from '@tianshu/shared';
import { describe, expect, it } from 'vitest';
import { createRng, seedStream } from '../../rng';
import { createMeridianFlowRuntime } from './runtime';
import type { MeridianFlowInput, ResolveQiMoveInput } from './types';

const STANDARD_RAW = { releasedQi: 288, meanFluxCap: 16, meanFlowBp: 9000,
  routeQualityBp: 7875 };
const STANDARD_PROFILE = { qiBp: 10_000, widthBp: 10_000, flowBp: 10_000,
  completionBp: 10_000 };
const STRONG_PROFILE = { qiBp: 13_000, widthBp: 12_500, flowBp: 12_500,
  completionBp: 9500 };

type HardBlock = 'unopened_node' | 'ruptured_node' | 'point_seal_9';

function fixture(hardBlock?: HardBlock): MeridianFlowInput {
  const nodes = Array.from({ length: 18 }, (_, index) => ({
    acupointRef: `ap_preview_${String(index).padStart(2, '0')}`,
    opened: index !== 4 || hardBlock !== 'unopened_node',
    fluxCap: 16, lengthUnit: 1, flowBp: 9000,
    ruptureDamage: index === 4 && hardBlock === 'ruptured_node' ? 1 : 0,
    sealLevel: index === 4 && hardBlock === 'point_seal_9' ? 9 : 0,
  }));
  return { unitId: 'unit_preview', productionPerTick: 16, qiSpeedBp: 10_000,
    practiceBp: 9000, nodes, ...(hardBlock === undefined ? { activeRouteId: 'mfr_preview' } : {}),
    routes: [{ routeId: 'mfr_preview', previewReference: STANDARD_RAW, steps: nodes.map((node) => ({
      acupointRef: node.acupointRef, lengthUnit: 1, segmentCt: 60, riskBp: 100,
    })) }] };
}

function hash(value: unknown): string {
  return createHash('sha256').update(canonicalJson(value as never)).digest('hex');
}

function moveInput(): ResolveQiMoveInput {
  return { routeId: 'mfr_preview', moveId: 'mv_preview', targetIds: ['unit_target'],
    causeId: 'cause_preview', battleTick: 18, reference: STANDARD_RAW,
    defender: STANDARD_PROFILE, critical: false, critRollBp: 9999, critChanceBp: 0 };
}

function commitAfterPreviews(previewCount: number): {
  readonly result: unknown; readonly rng: unknown; readonly stateHash: string;
} {
  const runtime = createMeridianFlowRuntime(fixture());
  runtime.tick(18);
  const rng = createRng(seedStream(20_260_927, 'battle'));
  for (let index = 0; index < previewCount; index += 1) runtime.preview('mfr_preview');
  return { result: runtime.resolveMove(moveInput(), rng), rng: rng.snapshot(),
    stateHash: hash(runtime.snapshot()) };
}

describe('MeridianFlowRuntime.preview', () => {
  it('uses roll=9999 without consuming RNG or changing version, snapshot, or node hash', () => {
    const runtime = createMeridianFlowRuntime(fixture());
    runtime.tick(18);
    const rng = createRng(seedStream(20_260_927, 'battle'));
    const rngBefore = rng.snapshot();
    const snapshotBefore = runtime.snapshot();
    const nodesBefore = hash(snapshotBefore.nodes);
    const versionBefore = runtime.stateVersion;

    const preview = runtime.preview('mfr_preview');

    expect(preview).toMatchObject({ attempted: 18, completed: 18, flowCt: 1080,
      blockedAt: null, disabledReason: null, stateVersion: versionBefore });
    expect(preview.jamChancesBp).toHaveLength(18);
    expect(preview.arrivalBp).toHaveLength(18);
    expect(rng.snapshot()).toEqual(rngBefore);
    expect(runtime.stateVersion).toBe(versionBefore);
    expect(runtime.snapshot()).toEqual(snapshotBefore);
    expect(hash(runtime.snapshot().nodes)).toBe(nodesBefore);
  });

  it('supports an explicit deterministic roll and reuses the preallocated result', () => {
    const runtime = createMeridianFlowRuntime(fixture());
    runtime.tick(18);
    const clean = runtime.preview('mfr_preview');
    const jammed = runtime.preview('mfr_preview', {
      previewRollBp: 0, opponent: STANDARD_PROFILE,
    });

    expect(jammed).toBe(clean);
    expect(jammed).toMatchObject({ attempted: 1, completed: 0, blockedAt: 0,
      blockedNode: 'ap_preview_00', stateVersion: runtime.stateVersion });
    expect(jammed.trace[0]).toMatchObject({ acupointRef: 'ap_preview_00', jammed: true });
    expect(runtime.preview('mfr_preview')).toMatchObject({ completed: 18,
      profile: { qiBp: 8750, widthBp: 10_000, flowBp: 10_000, completionBp: 10_000 },
      attackerStrengthBp: 9625, defenderStrengthBp: 10_000,
      meridianAttackBp: 13_144, meridianDefenseBp: 10_188, meridianSpeedBp: 9812 });
  });

  it('uses the opponent profile for attack, defense, and speed preview multipliers', () => {
    const runtime = createMeridianFlowRuntime(fixture());
    runtime.tick(18);

    expect(runtime.preview('mfr_preview', { opponent: STRONG_PROFILE })).toMatchObject({
      attackerStrengthBp: 9625, defenderStrengthBp: 12_050,
      meridianAttackBp: 11_641, meridianDefenseBp: 10_981, meridianSpeedBp: 8993,
    });
  });

  it.each([
    ['unopened_node', 'ap_preview_04'],
    ['ruptured_node', 'ap_preview_04'],
    ['point_seal_9', 'ap_preview_04'],
  ] as const)('preflights a later %s before attempting any segment', (reason, blockedNode) => {
    const runtime = createMeridianFlowRuntime(fixture(reason));
    const preview = runtime.preview('mfr_preview');

    expect(preview).toMatchObject({ attempted: 0, completed: 0, flowCt: 0,
      routeQualityBp: 0, releasedQi: 0, blockedAt: 4, blockedNode, disabledReason: reason });
  });

  it.each([1, 100])('keeps commit result, battle RNG, and state hash after %i previews', (count) => {
    const control = commitAfterPreviews(0);
    expect(commitAfterPreviews(count)).toEqual(control);
  });

  it('reports median latency against the 0.15 ms advisory budget without blocking', () => {
    const runtime = createMeridianFlowRuntime(fixture());
    runtime.tick(18);
    const samples: number[] = [];
    for (let warmup = 0; warmup < 100; warmup += 1) runtime.preview('mfr_preview');
    for (let sample = 0; sample < 501; sample += 1) {
      // eslint-disable-next-line no-restricted-properties -- Non-blocking test-only timing report.
      const started = performance.now();
      runtime.preview('mfr_preview');
      // eslint-disable-next-line no-restricted-properties -- Non-blocking test-only timing report.
      samples.push(performance.now() - started);
    }
    samples.sort((left, right) => left - right);
    const medianMs = samples[250]!;
    console.info(`meridian preview median: ${medianMs.toFixed(4)} ms (advisory <= 0.15 ms)`);
    expect(Number.isFinite(medianMs)).toBe(true);
  });
});
