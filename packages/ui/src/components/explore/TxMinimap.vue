<script setup lang="ts">
/* global HTMLElement, HTMLCanvasElement, CanvasRenderingContext2D, KeyboardEvent, PointerEvent,
  ResizeObserver, clearTimeout, getComputedStyle, setTimeout, window */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import { compassAngleRad, hitMarker, minimapToWorld } from '../../explore/minimap-math';
import type { MinimapView } from '../../explore/minimap-math';
import { drawMinimapBase, drawMinimapOverlay, projectMinimapMarkers } from '../../explore/minimap-painter';
import type { MarkerTarget, MinimapBase, MinimapDestination, MinimapMarker, MinimapOverlay,
  MinimapPaintContext, MinimapPalette, MinimapPlayer } from '../../explore/minimap-painter';
import { minimapDistanceText, TX_MINIMAP_STRINGS as strings } from './TxMinimap.strings';

export type MinimapTravelTarget = MarkerTarget
  | { readonly kind: 'point'; readonly x: number; readonly z: number };
interface Props {
  readonly base: MinimapBase | null; readonly player: MinimapPlayer | null;
  readonly basis: Float32Array | null; readonly viewQuad: Float32Array | null;
  readonly markers: readonly MinimapMarker[]; readonly path: Float32Array | null;
  readonly destination: MinimapDestination | null; readonly northUp: boolean;
  readonly expanded: boolean; readonly sizePx: number;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  travel: [target: MinimapTravelTarget]; toggleExpanded: []; zoom: [direction: -1 | 1];
  toggleNorthUp: []; hover: [target: MinimapTravelTarget | null];
  dwell: [target: MinimapTravelTarget];
}>();

const root = ref<HTMLElement | null>(null);
const mapDisk = ref<HTMLElement | null>(null);
const baseCanvas = ref<HTMLCanvasElement | null>(null);
const overlayCanvas = ref<HTMLCanvasElement | null>(null);
const hoveredMarker = shallowRef<MinimapMarker | null>(null);
const expandedSize = ref(640);
const compassAngle = ref(-Math.PI / 2);
const canvasSize = computed(() => props.expanded ? expandedSize.value : props.sizePx);
const facilityMarkers = computed(() => props.markers.filter(marker => marker.kind === 'facility'));
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
  inkMedium: '#4a433c', vermilion: '#b5382b', blue: '#2f6e8e', green: '#3f8a6e' };
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
  view.metresPerPx = props.base?.metresPerPx ?? 0.25;
  view.sizePx = canvasSize.value; view.northUp = props.expanded || props.northUp;
  view.basis = props.basis;
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
  compassAngle.value = compassAngleRad(view);
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
}
function basisContentsChanged(): boolean {
  if (props.expanded || props.northUp) return false;
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
    green: style.getPropertyValue('--green').trim() || palette.green };
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
const compassTransform = computed(() => `rotate(${compassAngle.value + Math.PI / 2}rad)`);
watch([
  () => props.base, () => props.player, () => props.basis, () => props.viewQuad,
  () => props.markers, () => props.path, () => props.destination, () => props.northUp,
  () => props.expanded, () => props.sizePx,
], () => { updateExpandedSize(); void nextTick(redraw); }, { flush: 'post' });

onMounted(() => {
  readPalette(); updateExpandedSize(); redraw();
  basisFrame = window.requestAnimationFrame(pollBasisContents);
  if (typeof ResizeObserver !== 'undefined' && root.value !== null) {
    resizeObserver = new ResizeObserver(() => { updateExpandedSize(); void nextTick(redraw); });
    resizeObserver.observe(root.value);
  }
});
onBeforeUnmount(() => {
  clearDwell(); resizeObserver?.disconnect();
  if (basisFrame !== undefined) window.cancelAnimationFrame(basisFrame);
});
</script>

<template>
  <section ref="root" class="minimap-shell" :class="{ expanded }" :aria-label="strings.label">
    <div class="map-column">
      <div ref="mapDisk" class="map-disk" :style="{ width: `${canvasSize}px`, height: `${canvasSize}px` }">
        <canvas ref="baseCanvas" class="map-layer" :width="canvasSize" :height="canvasSize" aria-hidden="true" />
        <canvas
          ref="overlayCanvas" class="map-layer map-interactive" :width="canvasSize"
          :height="canvasSize" :aria-label="strings.label" @pointermove="handlePointerMove"
          @pointerleave="handlePointerLeave" @pointerup="handlePointerUp"
        />
        <div class="compass" :title="strings.compass" aria-hidden="true" :style="{ transform: compassTransform }">▲</div>
        <div class="map-controls controls-left">
          <button type="button" :aria-label="strings.zoomIn" @click="emit('zoom', 1)">+</button>
          <button type="button" :aria-label="strings.zoomOut" @click="emit('zoom', -1)">−</button>
        </div>
        <div class="map-controls controls-right">
          <button
            type="button" :aria-label="expanded ? strings.collapse : strings.expand"
            @click="emit('toggleExpanded')"
          >
            {{ expanded ? strings.collapseShort : strings.expandShort }}
          </button>
          <button
            type="button" :aria-pressed="expanded || northUp"
            :disabled="expanded" :aria-label="northUp ? strings.cameraUp : strings.northUp"
            @click="emit('toggleNorthUp')"
          >
            {{ strings.northShort }}
          </button>
        </div>
        <output v-if="hoveredMarker" class="marker-tooltip">{{ markerDescription(hoveredMarker) }}</output>
      </div>
      <ul class="sr-only" role="list" :aria-label="strings.markerList">
        <li v-for="marker in markers" :key="marker.id">
          <button type="button" @click="travelToMarker(marker)" @keydown="handleMarkerKey($event, marker)">
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
          <button type="button" @click="travelToMarker(marker)" @keydown="handleMarkerKey($event, marker)">
            <span aria-hidden="true">{{ marker.icon }}</span>{{ marker.label }}
          </button>
        </li>
      </ul>
    </aside>
  </section>
</template>

<style scoped>
.minimap-shell { position: relative; display: flex; gap: 24px; color: var(--ink-text); }
.map-column { position: relative; }
.map-disk { position: relative; max-width: min(100%, 100vmin); max-height: min(100%, 100vmin);
  border-radius: 50%; overflow: visible; isolation: isolate; background: var(--paper);
  box-shadow: inset 0 0 22px 11px color-mix(in srgb, var(--ink) 14%, transparent),
    0 0 18px 9px color-mix(in srgb, var(--paper) 70%, transparent); }
.map-disk::after { content: ''; position: absolute; inset: 0; z-index: 3; pointer-events: none;
  border-radius: 50%; box-shadow: inset 0 0 18px 8px var(--paper); }
.map-layer { position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; border-radius: 50%;
  mask-image: radial-gradient(circle, #000 78%, transparent 100%); }
.map-interactive { z-index: 2; touch-action: none; cursor: crosshair; }
.compass { position: absolute; z-index: 5; top: -22px; left: calc(50% - 22px); width: 44px; height: 44px;
  display: grid; place-items: center; color: var(--vermilion); transform-origin: center; font-size: 24px; pointer-events: none; }
.map-controls { position: absolute; z-index: 5; top: 50%; display: grid; gap: 8px; transform: translateY(-50%); }
.controls-left { left: -22px; } .controls-right { right: -22px; }
.map-controls button { min-width: 44px; width: 44px; min-height: 44px; height: 44px; padding: 0; border: 0; border-radius: 50%;
  background: color-mix(in srgb, var(--paper) 88%, transparent); box-shadow: 0 2px 8px color-mix(in srgb, var(--ink) 20%, transparent); }
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
  .minimap-shell:not(.expanded) .map-disk { width: 132px !important; height: 132px !important; }
  .expanded { padding: 12px; gap: 12px; } .expanded .map-disk { max-width: calc(100vw - 208px); }
  .map-sidebar { width: 160px; max-height: calc(100vh - 24px); padding: 8px; }
}
</style>
