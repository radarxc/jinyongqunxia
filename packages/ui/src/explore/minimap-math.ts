export interface MinimapView {
  centerX: number;
  centerZ: number;
  metresPerPx: number;
  /** Legacy square size; width/height override it for the expanded painted map. */
  sizePx: number;
  widthPx?: number;
  heightPx?: number;
  /** Canvas backing-store pixels per CSS pixel. Coordinate helpers remain in CSS pixels. */
  pixelRatio?: number;
  northUp: boolean;
  basis: Float32Array | null;
}

export type WorldToImageMatrix = readonly [number, number, number, number, number, number];

export function minimapWidth(view: MinimapView): number {
  return view.widthPx ?? view.sizePx;
}

export function minimapHeight(view: MinimapView): number {
  return view.heightPx ?? view.sizePx;
}

/**
 * Writes the painted image's own projection into the minimap basis. With this basis, world to
 * minimap is the source affine multiplied by one scalar, so the image cannot stretch or shear.
 */
export function writePaintedMinimapBasis(
  matrix: WorldToImageMatrix, out: Float32Array,
): number {
  const [a, b, c, d] = matrix;
  const norm = Math.hypot(a, c) || 1;
  out[0] = a / norm; out[1] = c / norm;
  out[2] = -b / norm; out[3] = -d / norm;
  return norm;
}

/** Centres an affine source image and returns metres/CSS-pixel for a contain fit. */
export function fitPaintedMinimap(
  matrix: WorldToImageMatrix, imageWidth: number, imageHeight: number,
  viewportWidth: number, viewportHeight: number, paddingPx: number, centerOut: Float32Array,
): number {
  const [a, b, c, d, e, f] = matrix;
  const determinant = a * d - b * c;
  const imageX = imageWidth * 0.5 - e;
  const imageY = imageHeight * 0.5 - f;
  centerOut[0] = (d * imageX - c * imageY) / determinant;
  centerOut[1] = (-b * imageX + a * imageY) / determinant;
  const availableWidth = Math.max(1, viewportWidth - paddingPx * 2);
  const availableHeight = Math.max(1, viewportHeight - paddingPx * 2);
  const imageScale = Math.min(availableWidth / imageWidth, availableHeight / imageHeight);
  return 1 / (Math.hypot(a, c) * imageScale);
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
  const halfWidth = minimapWidth(view) * 0.5;
  const halfHeight = minimapHeight(view) * 0.5;
  const scale = 1 / view.metresPerPx;
  out[0] = halfWidth + (dx * rightX(view) + dz * rightZ(view)) * scale;
  out[1] = halfHeight - (dx * upX(view) + dz * upZ(view)) * scale;
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
  const halfWidth = minimapWidth(view) * 0.5;
  const halfHeight = minimapHeight(view) * 0.5;
  const horizontal = (px - halfWidth) * view.metresPerPx;
  const upward = (halfHeight - py) * view.metresPerPx;
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
