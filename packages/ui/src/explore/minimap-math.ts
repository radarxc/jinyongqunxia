export interface MinimapView {
  centerX: number;
  centerZ: number;
  metresPerPx: number;
  sizePx: number;
  northUp: boolean;
  basis: Float32Array | null;
}

function rightX(view: MinimapView): number {
  return view.northUp || view.basis === null ? 1 : view.basis[0]!;
}

function rightZ(view: MinimapView): number {
  return view.northUp || view.basis === null ? 0 : view.basis[1]!;
}

function upX(view: MinimapView): number {
  return view.northUp || view.basis === null ? 0 : view.basis[2]!;
}

function upZ(view: MinimapView): number {
  return view.northUp || view.basis === null ? -1 : view.basis[3]!;
}

/** Projects an XZ world point into the top-left-origin minimap canvas. */
export function worldToMinimap(
  x: number, z: number, view: MinimapView, out: Float32Array,
): Float32Array {
  const dx = x - view.centerX;
  const dz = z - view.centerZ;
  const half = view.sizePx * 0.5;
  const scale = 1 / view.metresPerPx;
  out[0] = half + (dx * rightX(view) + dz * rightZ(view)) * scale;
  out[1] = half - (dx * upX(view) + dz * upZ(view)) * scale;
  return out;
}

/** Unprojects a minimap canvas point; the determinant also handles Float32 basis drift. */
export function minimapToWorld(
  px: number, py: number, view: MinimapView, out: Float32Array,
): Float32Array {
  const rx = rightX(view);
  const rz = rightZ(view);
  const ux = upX(view);
  const uz = upZ(view);
  const half = view.sizePx * 0.5;
  const horizontal = (px - half) * view.metresPerPx;
  const upward = (half - py) * view.metresPerPx;
  const determinant = rx * uz - rz * ux;
  out[0] = view.centerX + (horizontal * uz - rz * upward) / determinant;
  out[1] = view.centerZ + (rx * upward - horizontal * ux) / determinant;
  return out;
}

/** Canvas-space angle from +x, clockwise because canvas y points downward. */
export function compassAngleRad(view: MinimapView): number {
  return Math.atan2(upZ(view), -rightZ(view));
}

export function hitMarker(
  px: number, py: number, markersXY: Float32Array, count: number, radiusPx: number,
): number {
  const radiusSquared = radiusPx * radiusPx;
  let nearest = -1;
  let nearestSquared = radiusSquared;
  for (let index = 0; index < count; index += 1) {
    const dx = markersXY[index * 2]! - px;
    const dy = markersXY[index * 2 + 1]! - py;
    const distanceSquared = dx * dx + dy * dy;
    if (distanceSquared <= nearestSquared) {
      if (distanceSquared < nearestSquared || nearest < 0) {
        nearest = index;
        nearestSquared = distanceSquared;
      }
    }
  }
  return nearest;
}
