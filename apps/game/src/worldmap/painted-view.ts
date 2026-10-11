/** Geometry for the painted map. All coordinates are independent of DOM and Vue. */
export type Point = readonly [number, number];
export interface Size { readonly width: number; readonly height: number }
export interface ViewState { readonly s: number; readonly tx: number; readonly ty: number }
export type MapTier = 'capital' | 'major' | 'sect' | 'minor' | 'site';
export interface ViewNode {
  readonly id: string; readonly name: string; readonly kind: 'town' | 'ruin' | 'sect';
  readonly point: Point; readonly open: boolean; readonly tier?: MapTier | undefined; readonly marker?: string | undefined;
  /** Icon only; the name appears on hover / selection and never reserves label space (hidden sects). */
  readonly quiet?: boolean | undefined;
  /** Fixed screen-pixel nudge for seats sharing a town's spot, so both stay readable at every zoom. */
  readonly screenOffset?: Point | undefined;
}
/** Sect seat as published in the map definition (tech/13 §5.4). */
export interface ViewSect {
  readonly id: string; readonly name: string; readonly siteName: string; readonly point: Point;
  readonly status: 'O' | 'H' | 'P' | 'M'; readonly marker: string; readonly cityId: string | null;
}
export interface ViewRoad {
  readonly key: string; readonly start: string; readonly end: string;
  readonly points: readonly Point[]; readonly kind: string; readonly eras: readonly string[];
  readonly path?: readonly Point[] | undefined;
}
/** Era landmark vignette published by the build (tech/13 §5.3). */
export interface LandmarkEntry {
  readonly id: string; readonly node: string; readonly chapters: readonly string[]; readonly url: string;
  readonly anchor: Point; readonly footprintGrid: number; readonly width: number; readonly height: number;
}
export interface RoadPath { readonly key: string; readonly d: string; readonly className: string }
export interface LabelPriority {
  readonly selectedId?: string | null; readonly currentNodeId?: string | null;
  readonly destinationId?: string | null;
}
export interface NodeLabel {
  readonly id: string; readonly name: string; readonly kind: 'town' | 'ruin' | 'sect'; readonly quiet: boolean;
  /** Name hidden until hover / selection: quiet seats, or sect names that would overlap a label. */
  readonly labelHidden: boolean;
  readonly x: number; readonly y: number; readonly width: number; readonly height: number;
  readonly labelX: number; readonly labelY: number; readonly visible: boolean;
  readonly tier: MapTier; readonly marker: string; readonly font: number;
}
export const GRID_SIZE: Size = { width: 512, height: 384 };

export function gridToImage(point: Point, image: Size): Point {
  return [point[0] * image.width / GRID_SIZE.width, point[1] * image.height / GRID_SIZE.height];
}
export function imageToGrid(point: Point, image: Size): Point {
  return [point[0] * GRID_SIZE.width / image.width, point[1] * GRID_SIZE.height / image.height];
}
export function imageToScreen(point: Point, view: ViewState): Point {
  return [point[0] * view.s + view.tx, point[1] * view.s + view.ty];
}
export function screenToImage(point: Point, view: ViewState): Point {
  return [(point[0] - view.tx) / view.s, (point[1] - view.ty) / view.s];
}
export function gridToScreen(point: Point, view: ViewState, image: Size): Point {
  return imageToScreen(gridToImage(point, image), view);
}
export function screenToGrid(point: Point, view: ViewState, image: Size): Point {
  return imageToGrid(screenToImage(point, view), image);
}
export function coverScale(image: Size, viewport: Size): number {
  return Math.max(viewport.width / image.width, viewport.height / image.height);
}
function clampScale(s: number, image: Size, viewport: Size): number {
  const cover = coverScale(image, viewport);
  return Math.min(cover * 4, Math.max(cover, s));
}
export function clampView(view: ViewState, image: Size, viewport: Size): ViewState {
  const s = clampScale(view.s, image, viewport);
  return { s, tx: Math.min(0, Math.max(viewport.width - image.width * s, view.tx)),
    ty: Math.min(0, Math.max(viewport.height - image.height * s, view.ty)) };
}
export function panView(view: ViewState, delta: Point, image: Size, viewport: Size): ViewState {
  return clampView({ s: view.s, tx: view.tx + delta[0], ty: view.ty + delta[1] }, image, viewport);
}
export function zoomAt(view: ViewState, scale: number, point: Point, image: Size, viewport: Size,
  destination: Point = point): ViewState {
  const s = clampScale(scale, image, viewport);
  // A moving pinch midpoint translates and scales together, before the single edge clamp.
  return clampView({ s, tx: destination[0] - (point[0] - view.tx) * s / view.s,
    ty: destination[1] - (point[1] - view.ty) * s / view.s }, image, viewport);
}
export function centerOnGrid(view: ViewState, point: Point, image: Size, viewport: Size): ViewState {
  const s = clampScale(view.s, image, viewport); const pixel = gridToImage(point, image);
  return clampView({ s, tx: viewport.width / 2 - pixel[0] * s,
    ty: viewport.height / 2 - pixel[1] * s }, image, viewport);
}
/** Keep the old viewport centre's map point; only change scale when the new limits require it. */
export function resizeView(view: ViewState, image: Size, before: Size, after: Size): ViewState {
  const centre = screenToImage([before.width / 2, before.height / 2], view);
  const s = clampScale(view.s, image, after);
  return clampView({ s, tx: after.width / 2 - centre[0] * s,
    ty: after.height / 2 - centre[1] * s }, image, after);
}
export function nearestOpenNode<T extends ViewNode>(nodes: readonly T[], point: Point,
  view: ViewState, image: Size, radius = 28): T | null {
  let nearest: T | null = null; let distance = radius * radius;
  for (const node of nodes) {
    if (!node.open) continue;
    const screen = gridToScreen(node.point, view, image);
    const squared = (point[0] - screen[0]) ** 2 + (point[1] - screen[1]) ** 2;
    if (squared < distance || (squared === distance && (!nearest || node.id < nearest.id))) {
      nearest = node; distance = squared;
    }
  }
  return nearest;
}
export function drawableRoads<T extends ViewRoad>(roads: readonly T[], nodes: readonly ViewNode[], era: string): T[] {
  const open = new Set(nodes.filter(node => node.open).map(node => node.id));
  return roads.filter(road => road.eras.includes(era) && open.has(road.start) && open.has(road.end));
}
export function roadDegrees(roads: readonly ViewRoad[]): ReadonlyMap<string, number> {
  const degrees = new Map<string, number>();
  for (const road of roads) for (const id of [road.start, road.end])
    degrees.set(id, (degrees.get(id) ?? 0) + 1);
  return degrees;
}
export function roadClass(kind: string): string {
  switch (kind) {
    case 'silk_road': case 'caravan_road': return 'road-dashed';
    case 'mountain_road': return 'road-dotted';
    case 'approach': return 'road-approach';
    default: return 'road-solid';
  }
}
/** Display-only terrain path when the map has one (tech/13 §5.1), else the rule polyline. */
export function roadPaths(roads: readonly ViewRoad[], image: Size): RoadPath[] {
  return roads.map(road => ({ key: road.key, className: roadClass(road.kind),
    d: road.path && road.path.length >= 2 ? smoothPathD(road.path, image) : road.points.map((point, index) => {
      const pixel = gridToImage(point, image);
      return `${index === 0 ? 'M' : 'L'} ${pixel[0]} ${pixel[1]}`;
    }).join(' ') }));
}
const round2 = (value: number): number => Math.round(value * 100) / 100;
/** Uniform Catmull-Rom (tension 0.5) as cubic Béziers; ends are pinned by repeating them. */
export function smoothPathD(points: readonly Point[], image: Size): string {
  const pixels = points.map(point => gridToImage(point, image));
  const first = pixels[0]!;
  if (pixels.length === 2) return `M ${round2(first[0])} ${round2(first[1])} L ${round2(pixels[1]![0])} ${round2(pixels[1]![1])}`;
  let d = `M ${round2(first[0])} ${round2(first[1])}`;
  for (let index = 0; index < pixels.length - 1; index += 1) {
    const p0 = pixels[Math.max(0, index - 1)]!; const p1 = pixels[index]!;
    const p2 = pixels[index + 1]!; const p3 = pixels[Math.min(pixels.length - 1, index + 2)]!;
    d += ` C ${round2(p1[0] + (p2[0] - p0[0]) / 6)} ${round2(p1[1] + (p2[1] - p0[1]) / 6)}` +
      ` ${round2(p2[0] - (p3[0] - p1[0]) / 6)} ${round2(p2[1] - (p3[1] - p1[1]) / 6)} ${round2(p2[0])} ${round2(p2[1])}`;
  }
  return d;
}
/** Point at an arc-length fraction of a polyline; `reverse` walks it from the last point. */
export function pointAlongPath(path: readonly Point[], fraction: number, reverse = false): Point {
  if (path.length === 0) return [0, 0];
  const ordered = reverse ? [...path].reverse() : path;
  if (ordered.length === 1) return ordered[0]!;
  let total = 0;
  for (let index = 1; index < ordered.length; index += 1)
    total += Math.hypot(ordered[index]![0] - ordered[index - 1]![0], ordered[index]![1] - ordered[index - 1]![1]);
  let remaining = Math.min(1, Math.max(0, Number.isFinite(fraction) ? fraction : 0)) * total;
  for (let index = 1; index < ordered.length; index += 1) {
    const a = ordered[index - 1]!; const b = ordered[index]!;
    const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (remaining <= length && length > 0) {
      const t = remaining / length;
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    }
    remaining -= length;
  }
  return ordered[ordered.length - 1]!;
}
const TIER_RANK: Readonly<Record<MapTier, number>> = { capital: 4, major: 3, sect: 2, minor: 1, site: 0 };
const MARKER_RANGE: Readonly<Record<MapTier, readonly [number, number]>> = {
  capital: [44, 96], major: [26, 50], sect: [18, 32], minor: [18, 32], site: [16, 26],
};
/** Label font size per tier; fixed on screen at every zoom. */
export const LABEL_FONT: Readonly<Record<MapTier, number>> = { capital: 17, major: 14, sect: 12, minor: 12, site: 12 };
/** Fan-out slots (screen px) for seats that share a town's grid spot: NE, SE, E, N, NW, W. */
const SECT_FAN: readonly Point[] = [[17, -17], [17, 17], [24, 0], [0, -24], [-17, -17], [-24, 0]];
/**
 * Open (O) and hidden-but-triggerable (H) seats are drawn; H stays quiet. P / M are not drawn.
 * Seats within 0.75 grid units of an open town (or of each other) take fan-out slots by id order.
 */
export function sectViewNodes(sects: readonly ViewSect[], towns: readonly ViewNode[] = []): ViewNode[] {
  const drawn = sects.filter(sect => sect.status === 'O' || sect.status === 'H')
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const near = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1]) <= 0.75;
  const taken: Point[] = [];
  return drawn.map(sect => {
    const crowded = towns.some(town => town.open && near(town.point, sect.point)) ||
      drawn.some(other => other !== sect && near(other.point, sect.point));
    const slot = crowded ? taken.filter(point => near(point, sect.point)).length : -1;
    taken.push(sect.point);
    return { id: sect.id, name: sect.name, kind: 'sect' as const, point: sect.point, open: true,
      tier: 'sect' as const, marker: sect.marker, quiet: sect.status === 'H',
      ...(slot >= 0 ? { screenOffset: SECT_FAN[slot % SECT_FAN.length]! } : {}) };
  });
}
/** Marker edge in screen px: lower bound at z = 1, upper bound at z = 4, linear between. */
export function markerSize(tier: MapTier | undefined, z: number): number {
  const [low, high] = MARKER_RANGE[tier ?? 'minor'];
  const t = Math.min(1, Math.max(0, (z - 1) / 3));
  return low + (high - low) * t;
}
export function landmarkForNode(index: readonly LandmarkEntry[], nodeId: string, chapter: string): LandmarkEntry | null {
  let found: LandmarkEntry | null = null;
  for (const entry of index)
    if (entry.node === nodeId && entry.chapters.includes(chapter) && (!found || entry.id < found.id)) found = entry;
  return found;
}
export function cleanNodeName(name: string): string {
  return name.replace(/（待考）|\(待考\)/g, '').replace(/\s*(?:地区)?所指治所\s*$/, '').trim();
}
/** Map label text: the place name without bracketed seat / status notes (the panel keeps them). */
export function shortNodeName(name: string): string {
  const short = cleanNodeName(name).replace(/（[^（）]*）|\([^()]*\)/g, '').trim();
  return short || cleanNodeName(name);
}
export function layoutLabels(nodes: readonly ViewNode[], view: ViewState, image: Size, viewport: Size,
  priority: LabelPriority = {}, degrees: ReadonlyMap<string, number> = new Map(),
  iconHalfHeight: (node: ViewNode) => number = () => 11): NodeLabel[] {
  const important = new Set([priority.selectedId, priority.currentNodeId, priority.destinationId]);
  const ordered = nodes.filter(node => node.open).sort((a, b) =>
    Number(important.has(b.id)) - Number(important.has(a.id)) ||
    TIER_RANK[b.tier ?? 'minor'] - TIER_RANK[a.tier ?? 'minor'] ||
    (degrees.get(b.id) ?? 0) - (degrees.get(a.id) ?? 0) ||
    Number(b.kind === 'town') - Number(a.kind === 'town') || Number(Boolean(a.quiet)) - Number(Boolean(b.quiet)) ||
    (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const occupied: NodeLabel[] = [];
  return ordered.map(node => {
    const base = gridToScreen(node.point, view, image); const nudge = node.screenOffset ?? [0, 0];
    const x = base[0] + nudge[0]; const y = base[1] + nudge[1]; const name = shortNodeName(node.name);
    const font = LABEL_FONT[node.tier ?? 'minor'];
    const width = Math.max(44, [...name].length * (font + 1) + 6); const height = font + 10;
    // The icon (or landmark) is centred on the node; the text box starts 2px below it.
    const labelX = x - width / 2; const labelY = y + iconHalfHeight(node) + 2;
    const onScreen = x >= 0 && x <= viewport.width && y >= 0 && y <= viewport.height;
    const quiet = Boolean(node.quiet);
    const collides = occupied.some(other => labelX < other.labelX + other.width &&
      labelX + width > other.labelX && labelY < other.labelY + other.height && labelY + height > other.labelY);
    // Sect seats always keep their icon; only the name yields to an earlier label.
    const sect = node.kind === 'sect';
    const visible = onScreen && (quiet || sect || !collides);
    const labelHidden = quiet || (sect && collides);
    const label = { id: node.id, name, kind: node.kind, quiet, labelHidden, x, y, width, height, labelX, labelY, visible,
      tier: node.tier ?? 'minor', marker: node.marker ?? (node.kind === 'ruin' ? 'ruin' : sect ? 'sect' : 'city_county'), font };
    if (visible && !labelHidden) occupied.push(label);
    return label;
  });
}
