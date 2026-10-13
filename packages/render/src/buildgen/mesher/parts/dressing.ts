import type { BuildKitView, RecipeSink } from '../../types';
import { box, prism } from '../core/prims';
import { hallOrigin, hallSizeM, kitLayer, type HallPartContext } from './platform';
import { hallDefinition } from './columns';
import type { HallHeights } from './beams';
import type { FacadeOpening } from './walls';

function recordVertices(
  sink: RecipeSink,
  kind: 'sign' | 'lantern',
  start: number,
  end: number,
): void {
  sink.hangingProps.push({
    target: 'shell',
    kind,
    vertices: Array.from({ length: end - start }, (_, index) => start + index),
  });
}

export function emitDressing(
  context: HallPartContext,
  kit: BuildKitView,
  heights: HallHeights,
  sink: RecipeSink,
  lod: 0 | 1,
  openings: readonly FacadeOpening[],
): void {
  const { writer, plan, unit, localGroundM } = context;
  const [width, depth] = hallSizeM(plan);
  const origin = hallOrigin(plan);
  if (plan.signage) {
    const signH = 0.5;
    const frontHead = Math.max(
      heights.floorM,
      ...openings
        .filter((opening) =>
          opening.side === 0 && (opening.kind === 'door' || opening.kind === 'shopfront'))
        .map((opening) => opening.y1),
    );
    const bottom = Math.max(heights.floorM + 2.25, frontHead + 0.15);
    const start = writer.vertexCount;
    box(writer, {
      center: [0, bottom + signH / 2, depth / 2 - 0.03],
      size: [Math.min(2.4, width - 0.4), signH, 0.08],
      origin,
      yaw: plan.yaw,
      unit,
      localGroundM,
      facade: 0,
      layer: kitLayer(kit, 'signage', 'timber_painted', 'timber_raw'),
      flags: 1 << 4,
      ao: 220,
    });
    recordVertices(sink, 'sign', start, writer.vertexCount);
    sink.signs.push(unit, 0, bottom, signH, Math.min(2.4, width - 0.4), plan.signage[1]);
  }
  const definition = hallDefinition(plan, kit);
  if (definition.front !== 'shopfront' && !(definition.brackets ?? heights.bracketBandM > 0)) return;
  const lanternBottom = Math.max(heights.floorM + 2.25, heights.columnTopM - 0.85);
  const lanternH = lod === 0 ? 0.42 : 0.36;
  for (const x of [-Math.min(1.4, width / 4), Math.min(1.4, width / 4)]) {
    const start = writer.vertexCount;
    prism(writer, {
      center: [x, lanternBottom + lanternH / 2, depth / 2 - 0.22],
      radiusM: 0.16,
      heightM: lanternH,
      sides: lod === 0 ? 8 : 6,
      origin,
      yaw: plan.yaw,
      unit,
      localGroundM,
      facade: 0,
      layer: kitLayer(kit, 'lantern', 'timber_painted', 'timber_raw'),
      flags: (1 << 3) | (1 << 4),
      ao: 235,
    });
    recordVertices(sink, 'lantern', start, writer.vertexCount);
  }
}
