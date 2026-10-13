/**
 * Converts the shared px-per-metre exploration zoom into the retired v1 town scene multiplier.
 * The v1 orthographic camera exposes 18 / multiplier world metres vertically.
 */
export function v1ZoomRatio(pxPerMetre: number, viewportHeightPx: number): number {
  if (!Number.isFinite(pxPerMetre) || pxPerMetre <= 0)
    throw new RangeError('V1_ZOOM_PX_PER_METRE');
  if (!Number.isFinite(viewportHeightPx) || viewportHeightPx <= 0)
    throw new RangeError('V1_ZOOM_VIEWPORT_HEIGHT');
  return pxPerMetre * 18 / viewportHeightPx;
}
