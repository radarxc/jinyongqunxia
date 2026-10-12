import type { BuildKitView, MeshWriter, RecipeSink } from '../../types';
import { box, transformPoint } from '../core/prims';
import { kitLayer, type HallPartContext } from './platform';
import type { FacadeOpening } from './walls';

const INSET_M = 0.08;
const INTERIOR_FLAGS = 1 << 2;

function localFrameBox(
  writer: MeshWriter,
  context: HallPartContext,
  opening: FacadeOpening,
  center: readonly [number, number, number],
  size: readonly [number, number, number],
  extra: Partial<{ layer: number; flags: number; ao: number }> = {},
): void {
  box(writer, {
    center,
    size,
    origin: opening.origin,
    yaw: opening.yaw,
    unit: context.unit,
    localGroundM: context.localGroundM,
    facade: opening.facade,
    layer: extra.layer ?? 5,
    flags: extra.flags ?? 1,
    ao: extra.ao ?? 225,
  });
}

function emitFrame(
  context: HallPartContext,
  opening: FacadeOpening,
  frameM: number,
  layer: number,
): void {
  const width = opening.x1 - opening.x0;
  const height = opening.y1 - opening.y0;
  const x = (opening.x0 + opening.x1) / 2;
  const depth = Math.min(opening.thicknessM, frameM);
  localFrameBox(
    context.writer,
    context,
    opening,
    [opening.x0 + frameM / 2, opening.y0 + height / 2, 0],
    [frameM, height, depth],
    { layer },
  );
  localFrameBox(
    context.writer,
    context,
    opening,
    [opening.x1 - frameM / 2, opening.y0 + height / 2, 0],
    [frameM, height, depth],
    { layer },
  );
  localFrameBox(
    context.writer,
    context,
    opening,
    [x, opening.y1 - frameM / 2, 0],
    [width, frameM, depth],
    { layer },
  );
  if (opening.kind === 'window')
    localFrameBox(
      context.writer,
      context,
      opening,
      [x, opening.y0 + frameM / 2, 0],
      [width, frameM, depth],
      { layer },
    );
}

function emitThreshold(
  context: HallPartContext,
  opening: FacadeOpening,
  layer: number,
): void {
  if (opening.kind !== 'door' || opening.thresholdM <= 0) return;
  const clearX0 = (opening.x0 + opening.x1 - opening.clearWidthM) / 2;
  const clearX1 = clearX0 + opening.clearWidthM;
  localFrameBox(
    context.writer,
    context,
    opening,
    [(clearX0 + clearX1) / 2, opening.y0 + opening.thresholdM / 2, 0],
    [opening.clearWidthM, opening.thresholdM, opening.thicknessM],
    { layer, flags: 1 },
  );
}

function emitDarkBacking(
  context: HallPartContext,
  opening: FacadeOpening,
  frameM: number,
  darkLayer: number,
  frameLayer: number,
  lod: 0 | 1,
): void {
  const x = (opening.x0 + opening.x1) / 2;
  const width = opening.x1 - opening.x0 - frameM * 2;
  const height = opening.y1 - opening.y0 - frameM * 2;
  if (width <= 0 || height <= 0) return;
  localFrameBox(
    context.writer,
    context,
    opening,
    [x, (opening.y0 + opening.y1) / 2, -INSET_M],
    [width, height, 0.025],
    { layer: darkLayer, flags: INTERIOR_FLAGS, ao: 105 },
  );
  // LOD1 drops the window cross-bars (lattice reads from the texture at that distance) so the
  // hall plus its real roof stays inside the tech/16 §6.5 LOD1 budgets.
  if (opening.kind === 'window' && lod === 0) {
    const bar = Math.min(0.06, frameM * 0.6);
    localFrameBox(
      context.writer,
      context,
      opening,
      [x, (opening.y0 + opening.y1) / 2, -INSET_M + 0.015],
      [bar, height, 0.035],
      { layer: frameLayer, flags: INTERIOR_FLAGS | (1 << 3), ao: 190 },
    );
    localFrameBox(
      context.writer,
      context,
      opening,
      [x, (opening.y0 + opening.y1) / 2, -INSET_M + 0.015],
      [width, bar, 0.035],
      { layer: frameLayer, flags: INTERIOR_FLAGS | (1 << 3), ao: 190 },
    );
  }
}

/** Door record: unit, local side, world centre xyz, world yaw, clear wh, inset, dark backing depth. */
export function emitFrames(
  context: HallPartContext,
  kit: BuildKitView,
  openings: readonly FacadeOpening[],
  sink: RecipeSink,
  lod: 0 | 1 = 0,
): void {
  const frameM = Math.max(0.1, kit.door.frame / 1000);
  const frameLayer = kitLayer(kit, 'timber_raw', 'timber_painted', kit.walls.front.layer);
  const darkLayer = kitLayer(kit, 'interior_dark', 'dark', kit.walls.front.layer);
  const thresholdLayer = kitLayer(kit, 'stone_dressed', 'stone_rubble', 'stone');
  for (const opening of openings) {
    emitFrame(context, opening, frameM, frameLayer);
    emitThreshold(context, opening, thresholdLayer);
    if (opening.kind === 'window') emitDarkBacking(context, opening, frameM, darkLayer, frameLayer, lod);
    if (opening.kind === 'door') {
      const centre = (opening.x0 + opening.x1) / 2;
      const world = transformPoint(
        [centre, opening.y0 + opening.thresholdM + opening.clearHeightM / 2, -INSET_M],
        { origin: opening.origin, yaw: opening.yaw },
      );
      sink.doors.push(
        context.unit,
        opening.side,
        world[0],
        world[1],
        world[2],
        opening.yaw,
        opening.clearWidthM,
        opening.clearHeightM,
        INSET_M,
        0.025,
      );
    }
  }
}
