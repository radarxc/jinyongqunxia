import * as os from 'node:os';
import { describe, expect, it } from 'vitest';
import { RigBatch } from './batch';
import { loadRigClip, registerRigClip } from './clip';
import { createRigCharacter, type RigInstance } from './character';
import { loadRigSet } from './manifest';
import { createPlaceholderRigManifest } from './placeholder';
import type { EquipmentVisuals } from './types';
import { readFileSync } from 'node:fs';

const WARMUP_FRAMES = 120;
const SAMPLE_FRAMES = 600;
const MEASUREMENT_ROUNDS = 3;

const FULL: EquipmentVisuals = {
  mainHand: { id: 'eq_perf_pair', hands: 'pair' },
  body: 'eq_perf_armor',
  head: 'eq_perf_head',
  shoulder: 'eq_perf_shoulders',
  cape: 'eq_perf_cape',
  waist: 'eq_perf_belt',
  feet: 'eq_perf_boots',
};
interface MeasurementRound {
  readonly p95Ms: number;
  readonly loadAverage: readonly number[];
}
interface Measurement {
  readonly minP95Ms: number;
  readonly rounds: readonly MeasurementRound[];
  readonly cpuCount: number;
}

function percentile95(samples: Float64Array): number {
  samples.sort();
  return samples[Math.floor(samples.length * 0.95)] ?? 0;
}

function warmUp(characters: readonly RigInstance[], batch: RigBatch): void {
  for (let frame = 0; frame < WARMUP_FRAMES; frame += 1) {
    for (const character of characters) character.update(1 / 60);
    batch.sync();
  }
}

function measureRound(characters: readonly RigInstance[], batch: RigBatch): number {
  const samples = new Float64Array(SAMPLE_FRAMES);
  for (let frame = 0; frame < SAMPLE_FRAMES; frame += 1) {
    const start = performance.now();
    for (const character of characters) character.update(1 / 60);
    batch.sync();
    samples[frame] = performance.now() - start;
  }
  return percentile95(samples);
}

function formatLoad(loadAverage: readonly number[]): string {
  return loadAverage.map((value) => value.toFixed(2)).join('/');
}

function measureBest(
  label: string,
  characters: readonly RigInstance[],
  batch: RigBatch,
): Measurement {
  warmUp(characters, batch);
  const cpuCount = os.cpus().length;
  const rounds: MeasurementRound[] = [];
  let minP95Ms = Number.POSITIVE_INFINITY;
  for (let round = 1; round <= MEASUREMENT_ROUNDS; round += 1) {
    const p95Ms = measureRound(characters, batch);
    minP95Ms = Math.min(minP95Ms, p95Ms);
    const loadAverage = os.loadavg();
    rounds.push({ p95Ms, loadAverage });
  }
  for (let round = 0; round < rounds.length; round += 1) {
    const result = rounds[round]!;
    console.info(
      `[rig-perf] ${label} round ${round + 1}/${MEASUREMENT_ROUNDS}: P95 ${result.p95Ms.toFixed(3)} ms; ` +
        `min P95 ${minP95Ms.toFixed(3)} ms; loadavg ${formatLoad(result.loadAverage)}; cpus ${cpuCount}`,
    );
  }
  return { minP95Ms, rounds, cpuCount };
}

function failureDetails(label: string, limitMs: number, measurement: Measurement): string {
  const p95s = measurement.rounds.map((round) => round.p95Ms.toFixed(3)).join('/');
  const loads = measurement.rounds.map((round) => formatLoad(round.loadAverage)).join(', ');
  return (
    `[rig-perf] ${label} failed: min P95 ${measurement.minP95Ms.toFixed(3)} ms ` +
    `(limit < ${limitMs.toFixed(2)} ms); round P95s ${p95s}; loadavg per round [${loads}]; ` +
    `cpus ${measurement.cpuCount}`
  );
}

function dispose(characters: readonly RigInstance[], batch: RigBatch): void {
  for (const character of characters) character.dispose();
  batch.dispose();
  batch.rigSet.dispose();
}

async function setup(
  count: number,
  equipment: EquipmentVisuals,
): Promise<{ characters: RigInstance[]; batch: RigBatch }> {
  const rigSet = await loadRigSet(createPlaceholderRigManifest());
  const batch = new RigBatch(rigSet, count);
  const characters: RigInstance[] = [];
  for (let index = 0; index < count; index += 1) {
    const character = createRigCharacter(rigSet, equipment, index + 1);
    character.setMotion((index % 8) as 0, 4, 'medium');
    character.setStepFps(0);
    characters.push(character);
    batch.add(character);
  }
  return { characters, batch };
}

function registerWalkClip(): void {
  const value: unknown = JSON.parse(readFileSync(
    new URL('../../../../assets/default/rig/clips/clip_walk.json', import.meta.url), 'utf8',
  ));
  try { registerRigClip(loadRigClip(value)); } catch (error) {
    if (!(error instanceof Error) || !error.message.startsWith('RIG_CLIP_DUPLICATE_ID')) throw error;
  }
}

describe('rig CPU performance', () => {
  it('keeps 20 fully equipped characters below a 60 fps CPU frame', async () => {
    const { characters, batch } = await setup(20, FULL);
    try {
      const measurement = measureBest('20 characters / 400 instances', characters, batch);
      expect(batch.stats).toMatchObject({ characters: 20, activeInstances: 400, drawCalls: 2 });
      expect(
        measurement.minP95Ms,
        failureDetails('20 characters / 400 instances', 16.67, measurement),
      ).toBeLessThan(16.67);
    } finally {
      dispose(characters, batch);
    }
  });

  it('measures the 100-character DES-rig CPU gate', async () => {
    const { characters, batch } = await setup(100, {});
    try {
      const measurement = measureBest('100 characters / 1600 instances', characters, batch);
      expect(batch.stats).toMatchObject({ characters: 100, activeInstances: 1_600, drawCalls: 2 });
      expect(
        measurement.minP95Ms,
        failureDetails('100 characters / 1600 instances', 0.8, measurement),
      ).toBeLessThan(0.8);
    } finally {
      dispose(characters, batch);
    }
  });

  it('keeps 100 clip-mode characters within the unchanged rig CPU gate', async () => {
    registerWalkClip(); const { characters, batch } = await setup(100, {});
    try {
      for (let index = 0; index < characters.length; index += 1) {
        characters[index]!.setMotion((index % 8) as 0, .78, 'medium');
        characters[index]!.playClip('clip_walk', { facingYawDeg: (index % 8) * 45, movement: true });
      }
      const measurement = measureBest('100 clip characters / 1600 instances', characters, batch);
      expect(batch.stats).toMatchObject({ characters: 100, activeInstances: 1_600, drawCalls: 2 });
      expect(characters[0]?.activeInstanceCount).toBe(16);
      expect(
        measurement.minP95Ms,
        failureDetails('100 clip characters / 1600 instances', .8, measurement),
      ).toBeLessThan(.8);
    } finally { dispose(characters, batch); }
  });
});
