import { describe, expect, it } from 'vitest';
import { layoutCompound } from '../compound';
import { planDimensions } from '../dims';
import { planDoors } from '../doors';
import { exportFixtures } from '../export-fixtures';
import { reachableInteriorHexes } from '../interiors/hexes';
import { solveInterior } from '../interiors/solver';
import { checkPlan } from '../invariants';
import { compileKit } from '../kit/compile';
import { parseBuildKitSource } from '../kit/schema';
import { planCompound } from '../plan-compound';
import { testBuildKit, testLayoutBuilding } from '../testing';

const stubs: readonly [string, () => unknown][] = [
  ['planDimensions', () => planDimensions({} as never, {} as never)],
  ['planDoors', () => planDoors({} as never, [0, 0, 0, 0])],
  ['planCompound', () => planCompound({} as never, {} as never, 0, {} as never)],
  ['checkPlan', () => checkPlan({} as never, {} as never)],
  ['exportFixtures', () => exportFixtures({} as never, [])],
  ['parseBuildKitSource', () => parseBuildKitSource({})],
  ['compileKit', () => compileKit({})],
  ['layoutCompound', () => layoutCompound([0, 0, 1, 1])],
  ['solveInterior', () => solveInterior({} as never)],
  ['reachableInteriorHexes', () => reachableInteriorHexes([], [], { q: 0, r: 0 })],
  ['testBuildKit', () => testBuildKit()],
  ['testLayoutBuilding', () => testLayoutBuilding()],
];

describe('reserved town-plan module stubs', () => {
  it.each(stubs)('%s fails explicitly until its owner task replaces it', (name, invoke) => {
    expect(invoke).toThrow(`TOWN_PLAN_NOT_IMPLEMENTED:${name}`);
  });
});
