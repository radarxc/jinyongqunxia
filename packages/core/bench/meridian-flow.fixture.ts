import { createMeridianFlowRuntime } from '../src/battle/meridian-flow/runtime';
import type { MeridianFlowInput } from '../src/battle/meridian-flow/types';

function stressFixture(): MeridianFlowInput {
  const nodes = Array.from({ length: 144 }, (_, index) => ({
    acupointRef: `ap_perf_${String(index).padStart(3, '0')}`, opened: true,
    fluxCap: 16, lengthUnit: 1, flowBp: 10_000,
  }));
  return { unitId: 'unit_perf', productionPerTick: 16, qiSpeedBp: 10_000,
    practiceBp: 9800, nodes, routes: Array.from({ length: 12 }, (_, routeIndex) => ({
      routeId: `mfr_perf_${String(routeIndex).padStart(2, '0')}`,
      steps: nodes.slice(routeIndex * 12, routeIndex * 12 + 12).map((node) => ({
        acupointRef: node.acupointRef, lengthUnit: 1, segmentCt: 60, riskBp: 0,
      })),
    })), activeRouteId: 'mfr_perf_00' };
}

export function runMeridianTickWorkload(): void {
  createMeridianFlowRuntime(stressFixture()).tick(1000);
}
