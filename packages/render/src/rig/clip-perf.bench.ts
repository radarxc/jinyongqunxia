import { readFileSync } from 'node:fs';
import { cpus, loadavg } from 'node:os';
import { RigBatch } from './batch';
import { loadRigClip, registerRigClip } from './clip';
import { createClipPlayer } from './clip-player';
import { createRigCharacter, type RigInstance } from './character';
import { loadRigSet } from './manifest';
import { createPlaceholderRigManifest } from './placeholder';

const CHARACTERS = 100;
const WARMUP_FRAMES = 120;
const SAMPLE_FRAMES = 600;
const ROUNDS = 3;
const DT = 1 / 60;

function percentile95(samples: Float64Array): number {
  samples.sort();
  return samples[Math.floor(samples.length * .95)] ?? 0;
}

function min(values: readonly number[]): number {
  let result = Number.POSITIVE_INFINITY;
  for (const value of values) result = Math.min(result, value);
  return result;
}

async function main(): Promise<void> {
  const clip = loadRigClip(JSON.parse(readFileSync(
    new URL('../../../../assets/default/rig/clips/clip_walk.json', import.meta.url), 'utf8',
  )));
  registerRigClip(clip);
  const players = Array.from({ length: CHARACTERS }, (_, index) => createClipPlayer(clip, {
    facingYawDeg: (index % 8) * 45, movement: true, speedMps: .78,
  }));
  for (let frame = 0; frame < WARMUP_FRAMES; frame += 1) for (const player of players) player.update(DT);
  const playerRounds: number[] = [];
  for (let round = 0; round < ROUNDS; round += 1) {
    const samples = new Float64Array(SAMPLE_FRAMES);
    for (let frame = 0; frame < SAMPLE_FRAMES; frame += 1) {
      const start = performance.now();
      for (const player of players) player.update(DT);
      samples[frame] = performance.now() - start;
    }
    playerRounds.push(percentile95(samples));
  }

  const rigSet = await loadRigSet(createPlaceholderRigManifest());
  const batch = new RigBatch(rigSet, CHARACTERS);
  const characters: RigInstance[] = [];
  for (let index = 0; index < CHARACTERS; index += 1) {
    const character = createRigCharacter(rigSet, {}, index + 1);
    character.setMotion((index % 8) as 0, .78, 'medium');
    character.setStepFps(0);
    character.playClip(clip.id, { facingYawDeg: (index % 8) * 45, movement: true });
    characters.push(character); batch.add(character);
  }
  for (let frame = 0; frame < WARMUP_FRAMES; frame += 1) {
    for (const character of characters) character.update(DT);
    batch.sync();
  }
  const updateRounds: number[] = []; const syncRounds: number[] = []; const totalRounds: number[] = [];
  for (let round = 0; round < ROUNDS; round += 1) {
    const updates = new Float64Array(SAMPLE_FRAMES); const syncs = new Float64Array(SAMPLE_FRAMES);
    const totals = new Float64Array(SAMPLE_FRAMES);
    for (let frame = 0; frame < SAMPLE_FRAMES; frame += 1) {
      const start = performance.now();
      for (const character of characters) character.update(DT);
      const updated = performance.now(); batch.sync(); const synced = performance.now();
      updates[frame] = updated - start; syncs[frame] = synced - updated; totals[frame] = synced - start;
    }
    updateRounds.push(percentile95(updates)); syncRounds.push(percentile95(syncs)); totalRounds.push(percentile95(totals));
  }
  console.info(JSON.stringify({
    loadavg: loadavg().map(value => Number(value.toFixed(2))), cpus: cpus().length,
    p95Ms: { playerProjection: min(playerRounds), characterUpdate: min(updateRounds), batchSync: min(syncRounds), total: min(totalRounds) },
    rounds: { playerProjection: playerRounds, characterUpdate: updateRounds, batchSync: syncRounds, total: totalRounds },
    drawCalls: batch.stats.drawCalls, projectionAllocations: players[0]?.projectionAllocations,
  }, null, 2));
  for (const character of characters) character.dispose();
  batch.dispose(); rigSet.dispose();
}

await main();
