// ENG-town2-chunks 会在本文件补其他契约断言。
import { readFileSync } from 'node:fs';
import { RoofStyle, compileKit } from '@tianshu/data/town-plan';
import type { CompiledBuildKit, TownBuildingPlan } from '@tianshu/data/town-plan';
import type { TownWall } from '@tianshu/data/schemas';
import type { BuildingPlanView, BuildKitView, CityWallView } from '@tianshu/render/buildgen';
import { ROOF_STYLE } from '@tianshu/render/buildgen/types';
import { describe, expect, expectTypeOf, it } from 'vitest';

const REQUIRED_KEYS = [
  'schemaVersion',
  'id',
  'style',
  'profile',
  'dims',
  'door',
  'window',
  'walls',
  'ridge',
  'palette',
  'layers',
  'archetypes',
  'landmarks',
  'variants',
  'cityWall',
] as const;

function loadKit(name: string): CompiledBuildKit {
  const source = readFileSync(
    new URL(`../../../content/town/buildkits/${name}.yaml`, import.meta.url),
    'utf8',
  );
  return compileKit(source);
}

describe('town build-kit cross-package contract', () => {
  it('keeps data plans and render views mutually assignable', () => {
    expectTypeOf<keyof TownBuildingPlan>().toEqualTypeOf<keyof BuildingPlanView>();
    expectTypeOf<TownBuildingPlan>().toMatchTypeOf<BuildingPlanView>();
    expectTypeOf<BuildingPlanView>().toMatchTypeOf<TownBuildingPlan>();
  });

  it('assigns data CompiledBuildKit directly to render BuildKitView', () => {
    expectTypeOf<CompiledBuildKit>().toMatchTypeOf<BuildKitView>();
  });

  it('keeps wall fields exact and assigns data walls directly to render views', () => {
    expectTypeOf<keyof TownWall>().toEqualTypeOf<keyof CityWallView>();
    expectTypeOf<TownWall>().toMatchTypeOf<CityWallView>();
  });

  it('keeps every roof style name and numeric value identical', () => {
    const dataStyles = Object.fromEntries(
      Object.entries(RoofStyle).filter(([, value]) => typeof value === 'number'),
    );
    expect(ROOF_STYLE).toEqual(dataStyles);
  });

  it.each(['song_dali', 'xiyu'])('%s has every required BuildKitView top-level key', (name) => {
    const kit: BuildKitView = loadKit(name);
    for (const key of REQUIRED_KEYS) expect(kit).toHaveProperty(key);
  });
});
