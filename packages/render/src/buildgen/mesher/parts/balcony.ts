import type { BuildingPlanView, BuildKitView, MeshWriter } from '../../types';
import { box, prism } from '../core/prims';
import { hallOrigin, hallSizeM, kitLayer } from './platform';

export const BALCONY_RAIL_HEIGHT_M = 1;
export const BALCONY_DEPTH_M = 0.75;

export interface BalconyOptions {
  readonly writer: MeshWriter;
  readonly plan: BuildingPlanView;
  readonly unit: number;
  readonly kit: BuildKitView;
  readonly floorM: number;
  readonly lod: 0 | 1;
  readonly depthM?: number;
}

/** Front pingzuo: slab edge, wangzhu posts, xunzhang rails and low rail panels. */
export function emitBalcony(options: BalconyOptions): void {
  const { writer, plan, unit, kit, floorM, lod } = options;
  const [width, depth] = hallSizeM(plan);
  const balconyDepth = Math.min(options.depthM ?? BALCONY_DEPTH_M, depth / 2 - 0.2);
  const frontZ = depth / 2;
  const origin = hallOrigin(plan);
  const layer = kitLayer(kit, 'timber_raw', 'timber_painted', kit.walls.front.layer);
  const localGroundM = (plan.elev[0] + (plan.floorY[0] ?? plan.elev[1])) / 1000;
  const common = { origin, yaw: plan.yaw, unit, localGroundM, layer, flags: 1 << 4 } as const;
  box(writer, {
    ...common,
    center: [0, floorM - 0.06, frontZ - balconyDepth / 2],
    size: [width, 0.12, balconyDepth],
    ao: 220,
  });
  const postCount = lod === 0 ? Math.max(3, Math.ceil(width / 2) + 1) : 3;
  const left = -width / 2 + 0.08;
  const right = width / 2 - 0.08;
  const postX = Array.from(
    { length: postCount },
    (_, index) => left + ((right - left) * index) / (postCount - 1),
  );
  for (const x of postX)
    prism(writer, {
      ...common,
      center: [x, floorM + BALCONY_RAIL_HEIGHT_M / 2, frontZ - 0.06],
      radiusM: 0.055,
      heightM: BALCONY_RAIL_HEIGHT_M,
      sides: lod === 0 ? 6 : 4,
      ao: 226,
    });
  for (let index = 0; index < postX.length - 1; index += 1) {
    const x0 = postX[index]!;
    const x1 = postX[index + 1]!;
    const span = x1 - x0 - 0.1;
    if (span <= 0) continue;
    for (const y of [floorM + 0.58, floorM + BALCONY_RAIL_HEIGHT_M - 0.04])
      box(writer, {
        ...common,
        center: [(x0 + x1) / 2, y, frontZ - 0.06],
        size: [span, 0.08, 0.08],
        ao: 224,
      });
    box(writer, {
      ...common,
      center: [(x0 + x1) / 2, floorM + 0.31, frontZ - 0.06],
      size: [span, 0.42, 0.045],
      ao: 205,
    });
  }
}
