import type { MarkerKind, MinimapMarker } from './minimap-painter';

export interface MinimapLabelPlacement {
  readonly marker: MinimapMarker;
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

interface Rect { left: number; top: number; right: number; bottom: number }

const labelHeight = 20;
const badgeRadius = 10;
const labelGap = 3;

function intersects(left: Rect, right: Rect): boolean {
  return left.left < right.right && left.right > right.left
    && left.top < right.bottom && left.bottom > right.top;
}

function categoryPriority(kind: MarkerKind): number {
  if (kind === 'shop' || kind === 'facility' || kind === 'inn') return 3;
  if (kind === 'office' || kind === 'gate' || kind === 'exit') return 2;
  if (kind === 'temple' || kind === 'pagoda') return 1;
  return 0;
}

function labelWidth(label: string): number {
  let units = 0;
  for (const character of label) units += character.codePointAt(0)! > 0xff ? 1 : 0.56;
  return Math.ceil(units * 12 + 10);
}

/** Priority-greedy label layout. Call only when marker/view/selection dimensions change. */
export function placeMinimapLabels(
  markers: readonly MinimapMarker[], markerXY: Float32Array, selectedIds: ReadonlySet<string>,
  width: number, height: number, destinationId?: string, highlightedIds: ReadonlySet<string> = new Set(),
): readonly MinimapLabelPlacement[] {
  const badges: Rect[] = markers.map((_, index) => {
    const x = markerXY[index * 2]!; const y = markerXY[index * 2 + 1]!;
    return { left: x - badgeRadius, top: y - badgeRadius, right: x + badgeRadius,
      bottom: y + badgeRadius };
  });
  const candidates = markers.map((marker, index) => ({ marker, index, priority:
    marker.id === destinationId ? 5 : highlightedIds.has(marker.id) ? 4 : categoryPriority(marker.kind) }))
    .filter(candidate => selectedIds.has(candidate.marker.id))
    .sort((left, right) => right.priority - left.priority || left.index - right.index);
  const placed: MinimapLabelPlacement[] = [];
  const occupied: Rect[] = [];
  for (const candidate of candidates) {
    const x = markerXY[candidate.index * 2]!; const y = markerXY[candidate.index * 2 + 1]!;
    const textWidth = labelWidth(candidate.marker.label);
    const positions = [
      [x + badgeRadius + labelGap, y - labelHeight / 2],
      [x - badgeRadius - labelGap - textWidth, y - labelHeight / 2],
      [x - textWidth / 2, y - badgeRadius - labelGap - labelHeight],
      [x - textWidth / 2, y + badgeRadius + labelGap],
    ] as const;
    for (const [left, top] of positions) {
      const rect = { left, top, right: left + textWidth, bottom: top + labelHeight };
      const inBounds = rect.left >= 0 && rect.top >= 0 && rect.right <= width && rect.bottom <= height;
      if (!inBounds || badges.some(badge => intersects(rect, badge))
          || occupied.some(label => intersects(rect, label))) continue;
      placed.push({ marker: candidate.marker, left, top, width: textWidth, height: labelHeight });
      occupied.push(rect);
      break;
    }
  }
  return placed;
}
