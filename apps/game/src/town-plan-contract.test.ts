import { readFileSync } from 'node:fs';
import { TownBuildingPlanSchema } from '@tianshu/data/schemas';
import { compileKit, planBuilding } from '@tianshu/data/town-plan';
import type {
  CompiledBuildKit, TownBuildingPlan as PlannerTownBuildingPlan,
} from '@tianshu/data/town-plan';
import type { TownBuildingPlan as SchemaTownBuildingPlan } from '@tianshu/data/schemas';
import type { BuildingPlanView } from '@tianshu/render/buildgen';
import { describe, expect, expectTypeOf, it } from 'vitest';

const PLAN_FACILITIES = [
  'none', 'residence', 'general_store', 'cloth', 'books', 'pharmacy', 'inn', 'tavern',
  'teahouse', 'smithy', 'pawnshop', 'bank', 'escort', 'school', 'temple', 'office',
  'casino', 'stable', 'storehouse', 'guardhouse', 'stall_goods', 'stall_food',
] as const satisfies readonly PlannerTownBuildingPlan['facility'][];

function loadKit(name: string): CompiledBuildKit {
  return compileKit(readFileSync(
    new URL(`../../../content/town/buildkits/${name}.yaml`, import.meta.url), 'utf8',
  ));
}

function tangTemple(): PlannerTownBuildingPlan {
  return planBuilding({
    id: 'bi_contract_temple', type: 'bld_kit_xiyu_temple_hall',
    originCell: [4, 8], sizeCells: [12, 10], entranceCell: [9, 7],
    enterable: true, baseYMm: 0, facility: 'temple',
  }, loadKit('xiyu'), 0x51a7c0de, {
    heightCells: 80, originXMm: 0, originZMm: 0,
  }, { variant: 'tang_buddhist' });
}

describe('town building-plan cross-package contract', () => {
  it('assigns schema and planner plans directly to render', () => {
    const schemaPlan: SchemaTownBuildingPlan = TownBuildingPlanSchema.parse(tangTemple());
    const schemaAsRender: BuildingPlanView = schemaPlan;
    const plannerAsRender: BuildingPlanView = tangTemple();
    const planned: BuildingPlanView = tangTemple();
    const parsed: SchemaTownBuildingPlan = TownBuildingPlanSchema.parse(planned);
    const rendered: BuildingPlanView = parsed;
    expect([schemaAsRender.finial, plannerAsRender.finial]).toEqual([
      'tang_stupa', 'tang_stupa',
    ]);
    expect(rendered.finial).toBe('tang_stupa');
    expectTypeOf(rendered.finial).toEqualTypeOf<'tang_stupa' | undefined>();
  });

  it('keeps the same 22 facility literals in schema, planner, and render', () => {
    expectTypeOf<SchemaTownBuildingPlan['facility']>()
      .toEqualTypeOf<PlannerTownBuildingPlan['facility']>();
    expectTypeOf<PlannerTownBuildingPlan['facility']>()
      .toEqualTypeOf<BuildingPlanView['facility']>();
    expect(PLAN_FACILITIES).toHaveLength(22);
    const source = tangTemple();
    for (const facility of PLAN_FACILITIES) {
      expect(TownBuildingPlanSchema.safeParse({ ...source, facility }).success).toBe(true);
    }
    expect(TownBuildingPlanSchema.safeParse({ ...source, facility: 'shop' }).success).toBe(false);
  });
});
