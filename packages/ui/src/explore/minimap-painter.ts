import { worldToMinimap } from './minimap-math';
import type { MinimapView } from './minimap-math';

export type MarkerKind = 'facility' | 'shop' | 'inn' | 'temple' | 'pagoda' | 'gate' | 'office'
  | 'exit' | 'npc' | 'quest' | 'meditation';
export type MarkerTarget = { readonly kind: 'anchor'; readonly anchorId: string }
  | { readonly kind: 'building'; readonly buildingId: string }
  | { readonly kind: 'point'; readonly x: number; readonly z: number };
export interface MinimapMarker {
  readonly id: string; readonly kind: MarkerKind; readonly x: number; readonly z: number;
  readonly icon: string; readonly label: string; readonly target: MarkerTarget;
}
export interface MinimapBase {
  readonly bitmap: ImageBitmap | HTMLCanvasElement | HTMLImageElement;
  readonly minX: number; readonly minZ: number; readonly metresPerPx: number;
  /** Optional source-image affine: image pixels = matrix * world XZ + offset. */
  readonly worldToImage?: readonly [number, number, number, number, number, number];
  readonly south?: readonly [number, number];
}
export interface MinimapPlayer { readonly x: number; readonly z: number; readonly headingRad: number }
export interface MinimapDestination { readonly x: number; readonly z: number }

export interface MinimapPaintContext {
  fillStyle: string; strokeStyle: string; lineWidth: number; globalAlpha: number; font: string;
  imageSmoothingEnabled?: boolean; imageSmoothingQuality?: ImageSmoothingQuality;
  textAlign: CanvasTextAlign; textBaseline: CanvasTextBaseline;
  beginPath(): void; moveTo(x: number, y: number): void; lineTo(x: number, y: number): void;
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number): void;
  fill(): void; stroke(): void;
  drawImage(image: CanvasImageSource, dx: number, dy: number): void;
  setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void;
  save(): void; restore(): void; fillText(text: string, x: number, y: number): void;
  translate?(x: number, y: number): void; rotate?(angle: number): void; scale?(x: number, y: number): void;
}

export interface MinimapPalette {
  readonly paper: string; readonly paperSilk: string; readonly ink: string;
  readonly inkMedium: string; readonly vermilion: string; readonly blue: string; readonly green: string;
  readonly markerShop: string; readonly markerInn: string; readonly markerSacred: string;
  readonly markerCivic: string;
}
export interface MinimapOverlay {
  readonly player: MinimapPlayer | null; readonly viewQuad: Float32Array | null;
  readonly markers: readonly MinimapMarker[]; readonly path: Float32Array | null;
  readonly destination: MinimapDestination | null;
}

const point = new Float32Array(2);
const tau = Math.PI * 2;

export function drawMinimapBase(
  context: MinimapPaintContext, view: MinimapView, base: MinimapBase | null,
): void {
  const half = view.sizePx * 0.5;
  context.setTransform(1, 0, 0, 1, 0, 0);
  if (base === null) return;
  context.imageSmoothingEnabled = true; context.imageSmoothingQuality = 'high';
  const basis = view.basis;
  const rx = view.northUp || basis === null ? 1 : basis[0]!;
  const rz = view.northUp || basis === null ? 0 : basis[1]!;
  const ux = view.northUp || basis === null ? 0 : basis[2]!;
  const uz = view.northUp || basis === null ? -1 : basis[3]!;
  if (base.worldToImage !== undefined) {
    const [a, b, c, d, e, f] = base.worldToImage;
    const determinant = a * d - b * c;
    const ia = d / determinant; const ib = -b / determinant;
    const ic = -c / determinant; const id = a / determinant;
    const ie = -(ia * e + ic * f); const iff = -(ib * e + id * f);
    const screenA = rx / view.metresPerPx; const screenB = -ux / view.metresPerPx;
    const screenC = rz / view.metresPerPx; const screenD = -uz / view.metresPerPx;
    context.save();
    context.setTransform(screenA * ia + screenC * ib, screenB * ia + screenD * ib,
      screenA * ic + screenC * id, screenB * ic + screenD * id,
      half + screenA * (ie - view.centerX) + screenC * (iff - view.centerZ),
      half + screenB * (ie - view.centerX) + screenD * (iff - view.centerZ));
    context.drawImage(base.bitmap, 0, 0); context.restore();
    return;
  }
  const ratio = base.metresPerPx / view.metresPerPx;
  const dx = base.minX - view.centerX;
  const dz = base.minZ - view.centerZ;
  context.save();
  context.setTransform(rx * ratio, -ux * ratio, rz * ratio, -uz * ratio,
    half + (dx * rx + dz * rz) / view.metresPerPx,
    half - (dx * ux + dz * uz) / view.metresPerPx);
  context.drawImage(base.bitmap, 0, 0);
  context.restore();
}

function drawPolyline(
  context: MinimapPaintContext, values: Float32Array, view: MinimapView, close: boolean,
): void {
  if (values.length < 4) return;
  context.beginPath();
  for (let index = 0; index + 1 < values.length; index += 2) {
    worldToMinimap(values[index]!, values[index + 1]!, view, point);
    if (index === 0) context.moveTo(point[0]!, point[1]!);
    else context.lineTo(point[0]!, point[1]!);
  }
  if (close) {
    worldToMinimap(values[0]!, values[1]!, view, point);
    context.lineTo(point[0]!, point[1]!);
  }
  context.stroke();
}

function drawPlayer(
  context: MinimapPaintContext, view: MinimapView, player: MinimapPlayer, palette: MinimapPalette,
): void {
  worldToMinimap(player.x, player.z, view, point);
  const sin = Math.sin(player.headingRad);
  const cos = Math.cos(player.headingRad);
  const basis = view.basis;
  const rx = view.northUp || basis === null ? 1 : basis[0]!;
  const rz = view.northUp || basis === null ? 0 : basis[1]!;
  const ux = view.northUp || basis === null ? 0 : basis[2]!;
  const uz = view.northUp || basis === null ? -1 : basis[3]!;
  const forwardX = sin * rx - cos * rz;
  const forwardY = -(sin * ux - cos * uz);
  const sideX = -forwardY;
  const sideY = forwardX;
  context.fillStyle = palette.vermilion;
  context.strokeStyle = palette.paper;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(point[0]! + forwardX * 9, point[1]! + forwardY * 9);
  context.lineTo(point[0]! - forwardX * 6 + sideX * 5, point[1]! - forwardY * 6 + sideY * 5);
  context.lineTo(point[0]! - forwardX * 3, point[1]! - forwardY * 3);
  context.lineTo(point[0]! - forwardX * 6 - sideX * 5, point[1]! - forwardY * 6 - sideY * 5);
  context.lineTo(point[0]! + forwardX * 9, point[1]! + forwardY * 9);
  context.fill(); context.stroke();
}

function drawDestination(
  context: MinimapPaintContext, view: MinimapView, destination: MinimapDestination,
  palette: MinimapPalette,
): void {
  worldToMinimap(destination.x, destination.z, view, point);
  context.strokeStyle = palette.vermilion; context.fillStyle = palette.vermilion; context.lineWidth = 2;
  context.beginPath(); context.moveTo(point[0]! - 4, point[1]! + 7);
  context.lineTo(point[0]! - 4, point[1]! - 8); context.stroke();
  context.beginPath(); context.moveTo(point[0]! - 3, point[1]! - 8);
  context.lineTo(point[0]! + 7, point[1]! - 4); context.lineTo(point[0]! - 3, point[1]!);
  context.lineTo(point[0]! - 3, point[1]! - 8); context.fill();
}

export function projectMinimapMarkers(
  markers: readonly MinimapMarker[], view: MinimapView, markersXY: Float32Array,
): void {
  for (let index = 0; index < markers.length; index += 1) {
    const marker = markers[index]!;
    point[0] = 0; point[1] = 0; worldToMinimap(marker.x, marker.z, view, point);
    markersXY[index * 2] = point[0]!; markersXY[index * 2 + 1] = point[1]!;
  }
}

/** Steady-state redraw: callers grow markersXY before calling; this function allocates nothing. */
export function drawMinimapOverlay(
  context: MinimapPaintContext, view: MinimapView, overlay: MinimapOverlay,
  markersXY: Float32Array, palette: MinimapPalette,
): void {
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.globalAlpha = 1;
  if (overlay.viewQuad !== null) {
    context.strokeStyle = palette.blue; context.lineWidth = 1;
    drawPolyline(context, overlay.viewQuad, view, true);
  }
  if (overlay.path !== null) {
    context.strokeStyle = palette.vermilion; context.lineWidth = 2;
    drawPolyline(context, overlay.path, view, false);
  }
  if (overlay.destination !== null) drawDestination(context, view, overlay.destination, palette);
  projectMinimapMarkers(overlay.markers, view, markersXY);
  context.font = '15px KaiTi, serif'; context.textAlign = 'center'; context.textBaseline = 'middle';
  for (let index = 0; index < overlay.markers.length; index += 1) {
    const kind = overlay.markers[index]!.kind;
    if (kind === 'npc') {
      context.fillStyle = palette.vermilion; context.beginPath();
      context.arc(markersXY[index * 2]!, markersXY[index * 2 + 1]!, 3, 0, tau); context.fill();
      continue;
    }
    const ring = kind === 'inn' ? palette.markerInn
      : kind === 'temple' || kind === 'pagoda' || kind === 'quest' ? palette.markerSacred
        : kind === 'gate' || kind === 'office' || kind === 'exit' ? palette.markerCivic
          : palette.markerShop;
    context.fillStyle = palette.paper; context.strokeStyle = ring; context.lineWidth = 1.5;
    context.beginPath(); context.arc(markersXY[index * 2]!, markersXY[index * 2 + 1]!, 9, 0, tau);
    context.fill(); context.stroke(); context.fillStyle = palette.ink;
    context.fillText(overlay.markers[index]!.icon, markersXY[index * 2]!, markersXY[index * 2 + 1]!);
  }
  if (overlay.player !== null) drawPlayer(context, view, overlay.player, palette);
}
