import { performance } from 'node:perf_hooks';
import { describe, expect, it } from 'vitest';
import { queryPath, queryReachable } from '../src/battle/geometry';
import { battleSeed } from '../src/testing/combat-fixture';
import { createBattleState, createEncounterBattleSetup } from '../src/battle';

function geometryWorkload() {
  const cells = Array.from({ length: 20 * 20 }, (_, index) => ({
    q: index % 20, r: (index / 20) | 0, height: 0, moveCost: 1, canopy: 0,
    los: 'none' as const, standable: true, narrow: false, dangerous: index % 29 === 0,
    terrainDealtBp: 0, terrainTakenBp: 0, cover: null,
  }));
  const positions = [{ q: 9, r: 9 }, ...cells.filter((cell) =>
    !(cell.q === 9 && cell.r === 9) && cell.q % 3 === 0 && cell.r % 3 === 0).slice(0, 23)];
  const participants = positions.map((_, index) => ({ unitRef: index === 0 ? 'hero' : `enemy_${index}`,
    side: index === 0 ? 'player' as const : 'enemy' as const,
    control: index === 0 ? 'player' as const : 'ai' as const,
    spawn: `spawn_${index}`, state: 'active' as const, required: true }));
  const setup = createEncounterBattleSetup({ encounterId: 'enc_geometry_perf', setupId: 'geometry-perf',
    seed: 1, sourceSnapshotHash: '0'.repeat(64), sourceId: 'perf', triggerId: 'perf', worldTick: 0,
    participants, sceneRef: 'sc_perf', anchorRef: 'arena', grid: cells,
    initialUnits: participants.map((entry, index) => ({ unitRef: entry.unitRef, pos: positions[index]!,
      facing: index === 0 ? 0 as const : 3 as const })) });
  const state = createBattleState(setup, participants.map((entry) => battleSeed(entry.unitRef)));
  Object.assign(state.units[0]!, { move: 10 });
  return () => {
    const reachable = queryReachable(state, 'hero');
    const goal = reachable[reachable.length - 1]?.pos ?? state.units[0]!.pos;
    const path = queryPath(state, 'hero', goal);
    if (path === null) throw new Error('GEOMETRY_PERF_PATH');
    return reachable.length + path.path.length;
  };
}

describe('battle geometry performance gate', () => {
  it('queries a 400-tile, 24-unit reachable set plus path within 8 ms', () => {
    const run = geometryWorkload();
    for (let warmup = 0; warmup < 12; warmup += 1) run();
    let bestMs = Number.POSITIVE_INFINITY;
    for (let sample = 0; sample < 9; sample += 1) {
      const started = performance.now(); run();
      bestMs = Math.min(bestMs, performance.now() - started);
    }
    console.info(`[battle-geometry-perf] best-of-9=${bestMs.toFixed(3)}ms budget=8ms`);
    expect(bestMs).toBeLessThanOrEqual(8);
  });
});
