import { describe, expect, it } from 'vitest';
import { RigBatch } from './batch';
import { createRigCharacter, type RigInstance } from './character';
import { loadRigSet } from './manifest';
import { createPlaceholderRigManifest } from './placeholder';
import type { EquipmentVisuals } from './types';

const FULL: EquipmentVisuals = {
  mainHand: { id: 'eq_perf_pair', hands: 'pair' }, body: 'eq_perf_armor', head: 'eq_perf_head',
  shoulder: 'eq_perf_shoulders', cape: 'eq_perf_cape', waist: 'eq_perf_belt', feet: 'eq_perf_boots',
};

function percentile95(samples: Float64Array): number {
  samples.sort(); return samples[Math.floor(samples.length * .95)] ?? 0;
}

function measure(characters: readonly RigInstance[], batch: RigBatch): number {
  const samples = new Float64Array(600);
  for (let frame = -120; frame < 600; frame += 1) {
    const start = performance.now();
    for (const character of characters) character.update(1 / 60);
    batch.sync();
    if (frame >= 0) samples[frame] = performance.now() - start;
  }
  return percentile95(samples);
}

async function setup(count: number, equipment: EquipmentVisuals): Promise<{ characters: RigInstance[]; batch: RigBatch }> {
  const rigSet = await loadRigSet(createPlaceholderRigManifest()); const batch = new RigBatch(rigSet, count);
  const characters: RigInstance[] = [];
  for (let index = 0; index < count; index += 1) {
    const character = createRigCharacter(rigSet, equipment, index + 1); character.setMotion((index % 8) as 0, 4, 'medium'); character.setStepFps(0);
    characters.push(character); batch.add(character);
  }
  return { characters, batch };
}

describe('rig CPU performance', () => {
  it('keeps 20 fully equipped characters below a 60 fps CPU frame', async () => {
    const { characters, batch } = await setup(20, FULL); const p95 = measure(characters, batch);
    console.info(`[rig-perf] 20 characters / 400 instances P95 ${p95.toFixed(3)} ms`);
    expect(batch.stats).toMatchObject({ characters: 20, activeInstances: 400, drawCalls: 2 }); expect(p95).toBeLessThan(16.67);
    batch.rigSet.dispose(); batch.dispose();
  });

  it('measures the 100-character DES-rig CPU gate', async () => {
    const { characters, batch } = await setup(100, {}); const p95 = measure(characters, batch);
    console.info(`[rig-perf] 100 characters / 1600 instances P95 ${p95.toFixed(3)} ms`);
    expect(batch.stats).toMatchObject({ characters: 100, activeInstances: 1_600, drawCalls: 2 }); expect(p95).toBeLessThan(.8);
    batch.rigSet.dispose(); batch.dispose();
  });
});
