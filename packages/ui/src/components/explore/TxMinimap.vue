<script setup lang="ts">
/* global Event, HTMLElement, HTMLCanvasElement, CanvasRenderingContext2D, HTMLInputElement, KeyboardEvent, PointerEvent,
  ResizeObserver, clearTimeout, getComputedStyle, setTimeout, window */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import { hitMarker, minimapToWorld, worldToMinimap } from '../../explore/minimap-math';
import type { MinimapView } from '../../explore/minimap-math';
import { drawMinimapBase, drawMinimapOverlay, projectMinimapMarkers } from '../../explore/minimap-painter';
import type { MarkerTarget, MinimapBase, MinimapDestination, MinimapMarker, MinimapOverlay,
  MinimapPaintContext, MinimapPalette, MinimapPlayer } from '../../explore/minimap-painter';
import { minimapDistanceText, TX_MINIMAP_STRINGS as strings } from './TxMinimap.strings';
import TxSinan from './TxSinan.vue';

export type MinimapTravelTarget = MarkerTarget
  | { readonly kind: 'point'; readonly x: number; readonly z: number };
interface Props {
  readonly base: MinimapBase | null; readonly player: MinimapPlayer | null;
  readonly basis: Float32Array | null; readonly viewQuad: Float32Array | null;
  readonly markers: readonly MinimapMarker[]; readonly path: Float32Array | null;
  readonly destination: MinimapDestination | null; readonly northUp: boolean;
  readonly expanded: boolean; readonly sizePx: number; readonly zoomPxPerMetre?: number;
}
const props = withDefaults(defineProps<Props>(), { zoomPxPerMetre: 80 });
const emit = defineEmits<{
  travel: [target: MinimapTravelTarget]; toggleExpanded: []; zoom: [direction: -1 | 1];
  setZoom: [value: number];
  toggleNorthUp: []; hover: [target: MinimapTravelTarget | null];
  dwell: [target: MinimapTravelTarget];
}>();

const root = ref<HTMLElement | null>(null);
const mapDisk = ref<HTMLElement | null>(null);
const baseCanvas = ref<HTMLCanvasElement | null>(null);
const overlayCanvas = ref<HTMLCanvasElement | null>(null);
const hoveredMarker = shallowRef<MinimapMarker | null>(null);
const focusedMarker = shallowRef<MinimapMarker | null>(null);
const expandedSize = ref(640);
const narrowViewport = ref(false);
const coarsePointer = ref(false);
const mapStampHitPx = computed(() => coarsePointer.value ? 60 : 44);
const controlGutterPx = computed(() => props.expanded ? 0 : coarsePointer.value ? 62 : 54);
const redrawRevision = ref(0);
const canvasSize = computed(() => props.expanded ? expandedSize.value
  : narrowViewport.value ? 132 : props.sizePx);
const facilityMarkers = computed(() => props.markers.filter(
  marker => marker.kind !== 'npc' && marker.kind !== 'quest' && marker.kind !== 'meditation'));
const nearestMarkers = computed(() => {
  const revision = redrawRevision.value;
  void revision;
  if (props.expanded) return props.markers;
  if (props.player === null) return props.markers.slice(0, 3);
  return [...props.markers].filter(marker => marker.kind !== 'npc')
    .sort((left, right) => (left.x - props.player!.x) ** 2 + (left.z - props.player!.z) ** 2
      - (right.x - props.player!.x) ** 2 - (right.z - props.player!.z) ** 2).slice(0, 3);
});
const southWorld = computed<readonly [number, number]>(() => {
  const direction = props.base?.south ?? [0, 1] as const; const matrix = props.base?.worldToImage;
  if (matrix === undefined) return direction;
  const [a, b, c, d] = matrix; const determinant = a * d - b * c;
  const x = (d * direction[0] - c * direction[1]) / determinant;
  const z = (-b * direction[0] + a * direction[1]) / determinant; const length = Math.hypot(x, z) || 1;
  return [x / length, z / length];
});
const view: MinimapView = { centerX: 0, centerZ: 0, metresPerPx: 0.25, sizePx: 1,
  northUp: false, basis: null };
const overlay: { player: MinimapPlayer | null; viewQuad: Float32Array | null;
  markers: readonly MinimapMarker[]; path: Float32Array | null;
  destination: MinimapDestination | null } = {
    player: null, viewQuad: null, markers: [], path: null, destination: null,
  };
let markerXY = new Float32Array(16);
const worldPoint = new Float32Array(2);
const pointerPoint = new Float32Array(2);
let pointerScale = 1;
let dwellTimer: ReturnType<typeof setTimeout> | undefined;
let dwellTarget: MarkerTarget | null = null;
let lastBase: MinimapBase | null = null;
let lastCenterX = Number.NaN; let lastCenterZ = Number.NaN; let lastMpp = Number.NaN;
let lastSize = Number.NaN; let lastNorthUp = false;
let lastBasis0 = Number.NaN; let lastBasis1 = Number.NaN;
let lastBasis2 = Number.NaN; let lastBasis3 = Number.NaN;
let lastQuad0 = Number.NaN; let lastQuad1 = Number.NaN;
let lastQuad2 = Number.NaN; let lastQuad3 = Number.NaN;
let lastQuad4 = Number.NaN; let lastQuad5 = Number.NaN;
let lastQuad6 = Number.NaN; let lastQuad7 = Number.NaN;
let palette: MinimapPalette = { paper: '#efe6d2', paperSilk: '#e3d3b1', ink: '#1e1b18',
  inkMedium: '#4a433c', vermilion: '#b5382b', blue: '#2f6e8e', green: '#3f8a6e',
  markerShop: '#9a5735', markerInn: '#2f6e8e', markerSacred: '#b5382b', markerCivic: '#1e1b18' };
let resizeObserver: ResizeObserver | undefined;
let basisFrame: number | undefined;

function growMarkerBuffer(): void {
  const required = props.markers.length * 2;
  if (required <= markerXY.length) return;
  let capacity = markerXY.length;
  while (capacity < required) capacity *= 2;
  markerXY = new Float32Array(capacity);
}
function syncView(): void {
  view.centerX = props.player?.x ?? props.destination?.x ?? 0;
  view.centerZ = props.player?.z ?? props.destination?.z ?? 0;
  view.metresPerPx = 1 / Math.min(7, Math.max(2.5, props.zoomPxPerMetre / 16));
  view.sizePx = canvasSize.value; view.northUp = props.northUp;
  view.basis = props.basis;
  if (props.expanded && props.base?.worldToImage !== undefined) {
    const [a, b, c, d, e, f] = props.base.worldToImage; const determinant = a * d - b * c;
    const image = props.base.bitmap; const width = image.width; const height = image.height;
    const unproject = (px: number, py: number): readonly [number, number] => [
      (d * (px - e) - c * (py - f)) / determinant,
      (-b * (px - e) + a * (py - f)) / determinant,
    ];
    const corners = [unproject(0, 0), unproject(width, 0), unproject(width, height),
      unproject(0, height)];
    const xs = corners.map(point => point[0]); const zs = corners.map(point => point[1]);
    const minX = Math.min(...xs); const maxX = Math.max(...xs);
    const minZ = Math.min(...zs); const maxZ = Math.max(...zs);
    view.centerX = (minX + maxX) / 2; view.centerZ = (minZ + maxZ) / 2;
    const basis = view.basis;
    const rx = view.northUp || basis === null ? 1 : basis[0]!;
    const rz = view.northUp || basis === null ? 0 : basis[1]!;
    const ux = view.northUp || basis === null ? 0 : basis[2]!;
    const uz = view.northUp || basis === null ? -1 : basis[3]!;
    const right = corners.map(point => point[0] * rx + point[1] * rz);
    const up = corners.map(point => point[0] * ux + point[1] * uz);
    view.metresPerPx = Math.max(Math.max(...right) - Math.min(...right),
      Math.max(...up) - Math.min(...up)) / Math.max(1, view.sizePx - 24);
  }
  overlay.player = props.player; overlay.viewQuad = props.viewQuad; overlay.markers = props.markers;
  overlay.path = props.path; overlay.destination = props.destination;
  growMarkerBuffer(); projectMinimapMarkers(props.markers, view, markerXY);
}
function canvasContext(canvas: HTMLCanvasElement | null): CanvasRenderingContext2D | null {
  return canvas?.getContext('2d') ?? null;
}
function baseViewChanged(): boolean {
  const basis = view.basis;
  return lastBase !== props.base || lastCenterX !== view.centerX || lastCenterZ !== view.centerZ
    || lastMpp !== view.metresPerPx || lastSize !== view.sizePx || lastNorthUp !== view.northUp
    || lastBasis0 !== (basis?.[0] ?? 0) || lastBasis1 !== (basis?.[1] ?? 0)
    || lastBasis2 !== (basis?.[2] ?? 0) || lastBasis3 !== (basis?.[3] ?? 0);
}
function rememberBaseView(): void {
  const basis = view.basis; lastBase = props.base; lastCenterX = view.centerX; lastCenterZ = view.centerZ;
  lastMpp = view.metresPerPx; lastSize = view.sizePx; lastNorthUp = view.northUp;
  lastBasis0 = basis?.[0] ?? 0; lastBasis1 = basis?.[1] ?? 0;
  lastBasis2 = basis?.[2] ?? 0; lastBasis3 = basis?.[3] ?? 0;
}
function redraw(): void {
  syncView();
  if (baseViewChanged()) {
    const context = canvasContext(baseCanvas.value);
    if (context !== null) {
      context.setTransform(1, 0, 0, 1, 0, 0); context.clearRect(0, 0, view.sizePx, view.sizePx);
      drawMinimapBase(context as MinimapPaintContext, view, props.base);
    }
    rememberBaseView();
  }
  const context = canvasContext(overlayCanvas.value);
  if (context !== null) {
    context.setTransform(1, 0, 0, 1, 0, 0); context.clearRect(0, 0, view.sizePx, view.sizePx);
    drawMinimapOverlay(context as MinimapPaintContext, view, overlay as MinimapOverlay, markerXY, palette);
  }
  rememberViewQuad();
  redrawRevision.value += 1;
}
function basisContentsChanged(): boolean {
  if (props.northUp) return false;
  const basis = props.basis;
  return lastBasis0 !== (basis?.[0] ?? 0) || lastBasis1 !== (basis?.[1] ?? 0)
    || lastBasis2 !== (basis?.[2] ?? 0) || lastBasis3 !== (basis?.[3] ?? 0);
}
function viewQuadContentsChanged(): boolean {
  const quad = props.viewQuad;
  return lastQuad0 !== (quad?.[0] ?? 0) || lastQuad1 !== (quad?.[1] ?? 0)
    || lastQuad2 !== (quad?.[2] ?? 0) || lastQuad3 !== (quad?.[3] ?? 0)
    || lastQuad4 !== (quad?.[4] ?? 0) || lastQuad5 !== (quad?.[5] ?? 0)
    || lastQuad6 !== (quad?.[6] ?? 0) || lastQuad7 !== (quad?.[7] ?? 0);
}
function rememberViewQuad(): void {
  const quad = props.viewQuad;
  lastQuad0 = quad?.[0] ?? 0; lastQuad1 = quad?.[1] ?? 0;
  lastQuad2 = quad?.[2] ?? 0; lastQuad3 = quad?.[3] ?? 0;
  lastQuad4 = quad?.[4] ?? 0; lastQuad5 = quad?.[5] ?? 0;
  lastQuad6 = quad?.[6] ?? 0; lastQuad7 = quad?.[7] ?? 0;
}
function pollBasisContents(): void {
  if (basisContentsChanged() || viewQuadContentsChanged()) redraw();
  basisFrame = window.requestAnimationFrame(pollBasisContents);
}
function readPalette(): void {
  if (root.value === null) return;
  const style = getComputedStyle(root.value);
  palette = { paper: style.getPropertyValue('--paper').trim() || palette.paper,
    paperSilk: style.getPropertyValue('--paper-silk').trim() || palette.paperSilk,
    ink: style.getPropertyValue('--ink').trim() || palette.ink,
    inkMedium: style.getPropertyValue('--ink-medium').trim() || palette.inkMedium,
    vermilion: style.getPropertyValue('--vermilion').trim() || palette.vermilion,
    blue: style.getPropertyValue('--blue').trim() || palette.blue,
    green: style.getPropertyValue('--green').trim() || palette.green,
    markerShop: style.getPropertyValue('--tx-minimap-marker-shop').trim() || palette.markerShop,
    markerInn: style.getPropertyValue('--tx-minimap-marker-inn').trim() || palette.markerInn,
    markerSacred: style.getPropertyValue('--tx-minimap-marker-sacred').trim() || palette.markerSacred,
    markerCivic: style.getPropertyValue('--tx-minimap-marker-civic').trim() || palette.markerCivic };
}
function updateExpandedSize(): void {
  if (!props.expanded) return;
  const rect = root.value?.getBoundingClientRect();
  const width = rect && rect.width > 0 ? rect.width : window.innerWidth;
  const height = rect && rect.height > 0 ? rect.height : window.innerHeight;
  const reservedWidth = width <= 844 ? 196 : 312;
  const reservedHeight = width <= 844 ? 24 : 48;
  expandedSize.value = Math.max(1, Math.floor(Math.min(width - reservedWidth, height - reservedHeight)));
}
function updateViewportMode(): void { narrowViewport.value = window.innerWidth <= 844; }
function eventCanvasPoint(event: PointerEvent): void {
  const rect = overlayCanvas.value?.getBoundingClientRect();
  if (rect === undefined || rect.width <= 0 || rect.height <= 0) {
    pointerScale = 1; pointerPoint[0] = event.offsetX; pointerPoint[1] = event.offsetY; return;
  }
  pointerScale = view.sizePx / rect.width;
  pointerPoint[0] = (event.clientX - rect.left) * pointerScale;
  pointerPoint[1] = (event.clientY - rect.top) * view.sizePx / rect.height;
}
function markerAtEvent(event: PointerEvent): MinimapMarker | null {
  syncView(); eventCanvasPoint(event);
  const radius = (event.pointerType === 'touch' ? 60 : 44) * pointerScale;
  const index = hitMarker(pointerPoint[0]!, pointerPoint[1]!, markerXY, props.markers.length, radius);
  return index < 0 ? null : props.markers[index]!;
}
function clearDwell(): void {
  if (dwellTimer !== undefined) clearTimeout(dwellTimer);
  dwellTimer = undefined; dwellTarget = null;
}
function emitDwell(): void {
  dwellTimer = undefined;
  if (dwellTarget !== null) emit('dwell', dwellTarget);
}
function beginHover(marker: MinimapMarker | null): void {
  if (hoveredMarker.value === marker) return;
  clearDwell(); hoveredMarker.value = marker; emit('hover', marker?.target ?? null);
  if (marker !== null) {
    dwellTarget = marker.target; dwellTimer = setTimeout(emitDwell, 300);
  }
}
function handlePointerMove(event: PointerEvent): void { beginHover(markerAtEvent(event)); }
function handlePointerLeave(): void { beginHover(null); }
function handlePointerUp(event: PointerEvent): void {
  const marker = markerAtEvent(event);
  if (marker !== null) { emit('travel', marker.target); return; }
  minimapToWorld(pointerPoint[0]!, pointerPoint[1]!, view, worldPoint);
  emit('travel', { kind: 'point', x: worldPoint[0]!, z: worldPoint[1]! });
}
function travelToMarker(marker: MinimapMarker): void { emit('travel', marker.target); }
function handleMarkerKey(event: KeyboardEvent, marker: MinimapMarker): void {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault(); travelToMarker(marker);
}
function markerDescription(marker: MinimapMarker): string {
  if (props.player === null) return `${strings.goTo}${marker.label}`;
  const dx = marker.x - props.player.x; const dz = marker.z - props.player.z;
  return minimapDistanceText(marker.label, Math.sqrt(dx * dx + dz * dz));
}
const labelledMarkers = computed(() => {
  const result = [...nearestMarkers.value];
  if (hoveredMarker.value !== null && !result.includes(hoveredMarker.value)) result.push(hoveredMarker.value);
  if (focusedMarker.value !== null && !result.includes(focusedMarker.value)) result.push(focusedMarker.value);
  if (props.destination !== null && props.markers.length > 0) {
    const destination = [...props.markers].sort((left, right) =>
      Math.hypot(left.x - props.destination!.x, left.z - props.destination!.z)
      - Math.hypot(right.x - props.destination!.x, right.z - props.destination!.z))[0];
    if (destination && Math.hypot(destination.x - props.destination.x,
      destination.z - props.destination.z) <= 16 && !result.includes(destination)) result.push(destination);
  }
  return result;
});
function markerLabelStyle(marker: MinimapMarker): Record<string, string> {
  const revision = redrawRevision.value; void revision;
  syncView(); worldToMinimap(marker.x, marker.z, view, pointerPoint);
  return { left: `${pointerPoint[0]! + 12}px`, top: `${pointerPoint[1]! - 10}px` };
}
function handleSliderInput(event: Event): void {
  emit('setZoom', Number((event.target as HTMLInputElement).value));
}
function handleSliderKey(event: KeyboardEvent): void {
  const direction = event.key === 'ArrowUp' || event.key === 'ArrowRight' ? 1
    : event.key === 'ArrowDown' || event.key === 'ArrowLeft' ? -1 : 0;
  if (direction === 0) return;
  event.preventDefault();
  emit('setZoom', Math.min(112, Math.max(40, Math.round(props.zoomPxPerMetre) + direction)));
}
function focusMarker(marker: MinimapMarker): void { focusedMarker.value = marker; }
function blurMarker(marker: MinimapMarker): void {
  if (focusedMarker.value === marker) focusedMarker.value = null;
}
watch([
  () => props.base, () => props.player, () => props.basis, () => props.viewQuad,
  () => props.markers, () => props.path, () => props.destination, () => props.northUp,
  () => props.expanded, canvasSize, () => props.zoomPxPerMetre,
], () => { updateExpandedSize(); void nextTick(redraw); }, { flush: 'post' });

onMounted(() => {
  readPalette(); updateViewportMode();
  coarsePointer.value = window.matchMedia?.('(pointer: coarse)').matches === true;
  updateExpandedSize(); redraw();
  window.addEventListener('resize', updateViewportMode);
  basisFrame = window.requestAnimationFrame(pollBasisContents);
  if (typeof ResizeObserver !== 'undefined' && root.value !== null) {
    resizeObserver = new ResizeObserver(() => { updateExpandedSize(); void nextTick(redraw); });
    resizeObserver.observe(root.value);
  }
});
onBeforeUnmount(() => {
  clearDwell(); resizeObserver?.disconnect();
  window.removeEventListener('resize', updateViewportMode);
  if (basisFrame !== undefined) window.cancelAnimationFrame(basisFrame);
});
</script>

<template>
  <section ref="root" class="minimap-shell" :class="{ expanded }" :aria-label="strings.label">
    <div class="map-column" :style="{ paddingRight: `${controlGutterPx}px` }">
      <div ref="mapDisk" class="map-disk" :style="{ width: `${canvasSize}px`, height: `${canvasSize}px` }">
        <canvas ref="baseCanvas" class="map-layer" :width="canvasSize" :height="canvasSize" aria-hidden="true" />
        <canvas
          ref="overlayCanvas" class="map-layer map-interactive" :width="canvasSize"
          :height="canvasSize" :aria-label="strings.label" @pointermove="handlePointerMove"
          @pointerleave="handlePointerLeave" @pointerup="handlePointerUp"
        />
        <TxSinan
          class="map-sinan" :south="southWorld" :basis="basis"
          :north-up="northUp" :revision="redrawRevision" @toggle="emit('toggleNorthUp')"
        />
        <span
          v-for="marker in labelledMarkers" :key="`label-${marker.id}`"
          class="marker-name" :style="markerLabelStyle(marker)"
        >{{ marker.label }}</span>
        <div class="zoom-bar">
          <button
            type="button" :aria-label="strings.zoomIn"
            :style="{ width: `${mapStampHitPx}px`, minWidth: `${mapStampHitPx}px`,
                      height: `${mapStampHitPx}px`, minHeight: `${mapStampHitPx}px` }"
            @click="emit('zoom', 1)"
          >
            ＋
          </button>
          <div class="slider-wrap">
            <i
              v-for="tick in [48, 64, 80, 96]" :key="tick" class="zoom-tick"
              :style="{ bottom: `${(tick - 40) / 72 * 100}%` }"
            />
            <input
              type="range" role="slider" class="zoom-slider" min="40" max="112" step="1"
              :value="zoomPxPerMetre" :aria-valuenow="Math.round(zoomPxPerMetre)"
              aria-valuemin="40" aria-valuemax="112" :aria-label="strings.zoomSlider"
              @input="handleSliderInput" @keydown="handleSliderKey"
            >
          </div>
          <button
            type="button" :aria-label="strings.zoomOut"
            :style="{ width: `${mapStampHitPx}px`, minWidth: `${mapStampHitPx}px`,
                      height: `${mapStampHitPx}px`, minHeight: `${mapStampHitPx}px` }"
            @click="emit('zoom', -1)"
          >
            －
          </button>
        </div>
        <div class="map-controls controls-map">
          <button
            class="map-stamp"
            :style="{ width: `${mapStampHitPx}px`, minWidth: `${mapStampHitPx}px`,
                      height: `${mapStampHitPx}px`, minHeight: `${mapStampHitPx}px` }"
            type="button" :aria-label="expanded ? strings.collapse : strings.expand"
            @click="emit('toggleExpanded')"
          >
            <span class="map-stamp-face" style="width: 38px; height: 38px">{{ strings.mapShort }}</span>
          </button>
        </div>
        <output v-if="hoveredMarker" class="marker-tooltip">{{ markerDescription(hoveredMarker) }}</output>
      </div>
      <ul class="sr-only" role="list" :aria-label="strings.markerList">
        <li v-for="marker in markers" :key="marker.id">
          <button
            type="button" @click="travelToMarker(marker)" @keydown="handleMarkerKey($event, marker)"
            @focus="focusMarker(marker)" @blur="blurMarker(marker)"
          >
            {{ markerDescription(marker) }}
          </button>
        </li>
      </ul>
    </div>
    <aside v-if="expanded" class="map-sidebar">
      <h2>{{ strings.legend }}</h2>
      <ul class="legend">
        <li v-for="item in strings.legendItems" :key="item">{{ item }}</li>
      </ul>
      <h2>{{ strings.facilities }}</h2>
      <p v-if="facilityMarkers.length === 0" class="empty">{{ strings.emptyFacilities }}</p>
      <ul v-else class="facility-list">
        <li v-for="marker in facilityMarkers" :key="marker.id">
          <button
            type="button" @click="travelToMarker(marker)" @keydown="handleMarkerKey($event, marker)"
            @focus="focusMarker(marker)" @blur="blurMarker(marker)"
          >
            <span aria-hidden="true">{{ marker.icon }}</span>{{ marker.label }}
          </button>
        </li>
      </ul>
    </aside>
  </section>
</template>

<style scoped>
.minimap-shell { --minimap-bronze: #a88a52d9; --minimap-jade: #92ad91;
  --tx-minimap-marker-shop: var(--minimap-marker-shop, #9a5735);
  --tx-minimap-marker-inn: var(--minimap-marker-inn, var(--blue, #2f6e8e));
  --tx-minimap-marker-sacred: var(--minimap-marker-sacred, var(--vermilion, #b5382b));
  --tx-minimap-marker-civic: var(--minimap-marker-civic, var(--ink, #1e1b18));
  position: relative; display: flex; gap: 24px; color: var(--ink-text); }
.map-column { position: relative; }
.map-disk { position: relative; max-width: min(100%, 100vmin); max-height: min(100%, 100vmin);
  border: 2px solid var(--minimap-bronze); outline: 1px solid color-mix(in srgb, var(--paper) 80%, white);
  outline-offset: -4px; border-radius: 50%; overflow: visible; isolation: isolate; background: var(--paper);
  box-shadow: inset 0 0 24px 9px color-mix(in srgb, var(--ink) 18%, transparent),
    0 0 18px 9px color-mix(in srgb, var(--paper) 70%, transparent); }
.map-disk::after { content: ''; position: absolute; inset: 0; z-index: 3; pointer-events: none;
  border-radius: 50%; background: radial-gradient(circle, transparent 63%, color-mix(in srgb, var(--ink) 20%, transparent)); }
.map-layer { position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; border-radius: 50%;
  clip-path: circle(50%); }
.map-interactive { z-index: 2; touch-action: none; cursor: crosshair; }
.map-sinan { position: absolute; z-index: 7; top: -15px; left: -15px; }
.map-controls { position: absolute; z-index: 5; top: 50%; display: grid; gap: 8px; transform: translateY(-50%); }
.controls-map { left: -14px; top: auto; bottom: 8px; transform: none; }
.map-controls button { min-width: 44px; width: 44px; min-height: 44px; height: 44px; padding: 0; border: 0; border-radius: 50%;
  background: color-mix(in srgb, var(--paper) 88%, transparent); box-shadow: 0 2px 8px color-mix(in srgb, var(--ink) 20%, transparent); }
.map-controls .map-stamp { display: grid; place-items: center; background: transparent; box-shadow: none; }
.map-stamp-face { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 5px;
  color: var(--paper); background: var(--vermilion); font: 22px var(--font-calligraphy, KaiTi, serif);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--ink) 20%, transparent); }
.zoom-bar { position: absolute; z-index: 7; right: -54px; top: 50%; transform: translateY(-50%);
  width: 48px; display: grid; justify-items: center; }
.zoom-bar button { width: 44px; height: 44px; border: 0; background: transparent; color: var(--ink); font-size: 24px; }
.slider-wrap { position: relative; width: 44px; height: 120px; }
.zoom-slider { appearance: slider-vertical; writing-mode: vertical-lr; direction: rtl; position: absolute; inset: 0;
  width: 44px; height: 120px; margin: 0; accent-color: var(--minimap-jade); cursor: ns-resize; }
.zoom-slider::-webkit-slider-runnable-track { width: 4px; background: var(--minimap-bronze); }
.zoom-slider::-webkit-slider-thumb { appearance: none; width: 14px; height: 14px; margin-left: -5px;
  border: 1px solid #526b55; border-radius: 50%; background: var(--minimap-jade); box-shadow: inset 0 0 2px white; }
.zoom-tick { position: absolute; z-index: -1; left: 13px; width: 18px; height: 1px; background: var(--minimap-bronze); }
.marker-name { position: absolute; z-index: 6; padding: 2px 5px; pointer-events: none; white-space: nowrap;
  color: var(--ink-text); background: color-mix(in srgb, var(--paper) 82%, transparent); font-size: 12px; }
.marker-tooltip { position: absolute; z-index: 6; left: 50%; bottom: 10%; transform: translateX(-50%);
  padding: 6px 10px; white-space: nowrap; color: var(--ink-text); background: color-mix(in srgb, var(--paper) 90%, transparent); }
.expanded { position: fixed; z-index: 40; inset: 0; justify-content: center; align-items: center; padding: 24px;
  background: color-mix(in srgb, var(--paper) 92%, transparent); backdrop-filter: blur(6px); }
.expanded .map-disk { max-width: calc(100vw - 328px); max-height: calc(100vh - 48px); }
.map-sidebar { align-self: stretch; width: 240px; max-height: calc(100vh - 48px); overflow: auto; padding: 16px;
  background: color-mix(in srgb, var(--paper) 82%, transparent); }
.map-sidebar h2 { margin: 8px 0; font-size: 20px; }
.legend, .facility-list { list-style: none; padding: 0; margin: 0 0 20px; display: grid; gap: 6px; }
.facility-list button { width: 100%; min-height: 44px; display: flex; gap: 10px; align-items: center; text-align: left;
  border: 0; background: transparent; }
.empty { color: var(--ink-medium); }
@media (max-width: 844px) {
  .expanded { padding: 12px; gap: 12px; } .expanded .map-disk { max-width: calc(100vw - 208px); }
  .map-sidebar { width: 160px; max-height: calc(100vh - 24px); padding: 8px; }
}
@media (pointer: coarse) { .zoom-bar button, .map-controls .map-stamp { width: 60px; height: 60px; }
  .zoom-bar { right: -62px; width: 60px; } }
</style>
