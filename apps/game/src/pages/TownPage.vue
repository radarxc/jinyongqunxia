<script setup lang="ts">
/* global createImageBitmap, document, Element, fetch, HTMLCanvasElement, ImageBitmap, ImageData, KeyboardEvent, PointerEvent, ResizeObserver,
  WheelEvent, cancelAnimationFrame, requestAnimationFrame, window */
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import { storeToRefs } from 'pinia';
import type { TownCommand, TownPoint } from '@tianshu/core';
import { createPointerGestures, type PointerGestures } from '@tianshu/platform/input';
import { useUiStore } from '@tianshu/ui/runtime';
import TxMinimap, { type MinimapTravelTarget } from '@tianshu/ui/components/explore/TxMinimap.vue';
import TxContextActions from '@tianshu/ui/components/explore/TxContextActions.vue';
import type { TownAnchorView, TownScene, TownSceneProjection } from '@tianshu/render/town';
import { DEFAULT_PLAYER_HEIGHT_M } from '../../../../packages/render/src/actors/heights';
import type { GameController } from '../game-controller';
import { actionMap, useActionContext } from '../input/action-map';
import { createZoomController, TOWN_ZOOM_OPTIONS } from '../input/zoom';
import { createV1AssembledMinimapMarkers, createV1CameraBasis, dispatchV1MinimapTravel,
  createPaintedMinimapMarkers, generateV1MinimapBitmap, loadV1ActiveTaskNpcIds,
  loadV1PaintedMinimapWithFallback,
  v1MinimapLayoutKey,
  v1TownPointToWorld, v1PlayerHeadingRad, v1WorldToImageMatrix, writeV1Path,
  writeV1ViewQuad } from '../explore/v1-minimap';
import { V1_MINIMAP_STRINGS } from '../explore/v1-minimap.strings';
import { v1ZoomRatio } from '../explore/v1-zoom';
import { createAreaMapController } from '../explore/area-map-control';
import { createV1ContextActions, v1AnchorCommand }
  from '../explore/v1-context-actions';
import { useChapterTextCatalog } from '../flow/content-text';
import { applyTownWheel, TOWN_MOVE_STEP_MS, townDirection, townStep } from './town-input';
import { loadPortraitResolver } from '../runtime/portraits';

const { controller } = defineProps<{ controller: GameController }>();
const { projection } = storeToRefs(useUiStore());
const emit = defineEmits<{ leave: [] }>();
const catalog = useChapterTextCatalog(controller.chapterId, controller.flowTextSource);
const canvas = ref<HTMLCanvasElement>();
const zoom = createZoomController(TOWN_ZOOM_OPTIONS);
const minimapBase = shallowRef<{ bitmap: HTMLCanvasElement | ImageBitmap; minX: number; minZ: number;
  metresPerPx: number; worldToImage?: readonly [number, number, number, number, number, number];
  south?: readonly [number, number] } | null>(null);
const paintedMarkers = shallowRef<ReturnType<typeof createPaintedMinimapMarkers> | null>(null);
const taskNpcIds = shallowRef<ReadonlySet<string>>(new Set());
const zoomPxPerMetre = ref(zoom.value());
const minimapExpanded = ref(false);
const minimapViewQuad = shallowRef<Float32Array | null>(null);
const minimapBasis = createV1CameraBasis();
const viewQuadBuffer = new Float32Array(8);
const renderError = ref('');
const moving = ref(false);
let view: TownScene | undefined;
let observer: ResizeObserver | undefined;
let pointerGestures: PointerGestures | undefined;
let frame = 0;
let fadeTimer = 0;
let moveTimer = 0;
let releaseZoom: (() => void) | undefined;
let minimapIdle: number | undefined;
let minimapUsesIdleCallback = false;
let minimapLoadToken = 0;
let taskNpcLoadToken = 0;

function asset(path: string): string {
  const base = import.meta.env.BASE_URL ?? '/';
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

const runtime = computed(() => controller.townRuntime.value);
const town = computed(() => controller.town.value);
const inside = computed(() => town.value?.scene.buildingPhase === 'inside');
const facilityName = computed(() => {
  const facility = town.value?.facility;
  return facility ? catalog.value[facility.nameKey] : undefined;
});
const contextActions = computed(() => {
  const current = town.value; if (!current) return [];
  return createV1ContextActions({ actor: current.scene.actor.point, anchors: current.scene.anchors,
    facility: current.facility ?? null,
    ...(facilityName.value ? { facilityName: facilityName.value } : {}), inside: inside.value,
    canLeave: current.canLeave, busy: controller.busy.value });
});
const minimapMarkers = computed(() => {
  if (!runtime.value || !town.value) return [];
  const names = new Map(projection.value?.characters?.map(character =>
    [character.key, character.name] as const) ?? []);
  const facility = town.value.facility; const buildingId = town.value.scene.activeBuildingId;
  const markerFacility = facility ? { key: facility.key, kind: facility.kind,
    ...(facilityName.value ? { name: facilityName.value } : {}),
    ...(buildingId ? { buildingId } : {}) } : null;
  return createV1AssembledMinimapMarkers(runtime.value, town.value.scene, paintedMarkers.value,
    names, taskNpcIds.value, markerFacility);
});
const minimapPlayer = computed(() => {
  const definition = runtime.value; const actor = town.value?.scene.actor;
  if (!definition || !actor) return null;
  const [x, z] = v1TownPointToWorld(actor.point, definition.grid.height);
  return { x, z, headingRad: v1PlayerHeadingRad(actor.direction) };
});
const minimapPath = computed(() => {
  const definition = runtime.value;
  return definition ? writeV1Path(town.value?.movementPath, definition.grid.height) : null;
});
const minimapDestination = computed(() => {
  const path = minimapPath.value;
  return path && path.length >= 2 ? { x: path[path.length - 2]!, z: path[path.length - 1]! } : null;
});

function actorAt(scene: TownSceneProjection, point: TownPoint, walking: boolean,
  direction = scene.actor.direction): TownSceneProjection {
  return { ...scene, actor: { ...scene.actor, point, walking,
    ...(direction === undefined ? {} : { direction }) } };
}
async function animatePath(path: readonly TownPoint[] | undefined,
  scene: TownSceneProjection | undefined): Promise<void> {
  if (!view || !scene || !path || path.length < 2) return;
  for (let index = 1; index < path.length; index += 1) {
    const from = path[index - 1]!; const to = path[index]!;
    await view.update(actorAt(scene, to, true, townDirection(from, to)));
    await new Promise<void>((resolve) => { moveTimer = window.setTimeout(resolve, TOWN_MOVE_STEP_MS); });
  }
}
async function command(value: TownCommand): Promise<void> {
  if (controller.busy.value || moving.value) return;
  const before = town.value?.scene;
  moving.value = value.t === 'town/move';
  try { const update = await controller.townCommand(value);
    if (value.t === 'town/move') {
      await animatePath(update?.changes.town?.movementPath, before);
      const settled = town.value?.scene; if (settled) { await view?.update(settled); settleFade(settled); }
    } }
  finally { moving.value = false; }
}
function useAnchor(anchor: TownAnchorView): void {
  const state = town.value;
  if (state) {
    void command(v1AnchorCommand(anchor, state.scene.actor.point));
  }
}
function useContextAction(id: string): void {
  const selected = contextActions.value.find((entry) => entry.id === id && entry.enabled);
  if (!selected) return;
  if (selected.intent.kind === 'leave') emit('leave');
  else void command(selected.intent.command);
}
function usePrimaryContextAction(): boolean {
  const selected = contextActions.value.find((entry) => entry.enabled);
  if (!selected || projection.value.dialogue) return false;
  useContextAction(selected.id); return true;
}
function settleFade(next: TownSceneProjection): void {
  window.clearTimeout(fadeTimer);
  if (next.buildingPhase !== 'fading-in' && next.buildingPhase !== 'fading-out') return;
  fadeTimer = window.setTimeout(() => void command({ t: 'town/settle-building' }),
    controller.settings.value.reducedMotion ? 0 : 260);
}
function applyZoom(next = zoom.value()): void {
  const target = canvas.value;
  if (view && target && target.clientHeight > 0) view.setZoom(v1ZoomRatio(next, target.clientHeight));
}
const areaMap = createAreaMapController({
  isOpen: () => minimapExpanded.value,
  setOpen: open => { minimapExpanded.value = open; },
  holdWorldTicks: () => controller.holdWorldTicks('areaMap'),
  acquireContext: close => actionMap.pushContext('areaMap', {
    zoomIn: () => { zoom.stepIn(); }, zoomOut: () => { zoom.stepOut(); },
    zoomReset: () => { zoom.reset(); },
    toggleAreaMap: close, back: close,
  }),
});
function toggleAreaMap(): void { areaMap.toggle(); }
function toggleMinimapNorthUp(): void {
  controller.setSetting('minimapNorthUp', !controller.settings.value.minimapNorthUp);
}
function minimapTravel(target: MinimapTravelTarget): void {
  const definition = runtime.value; const scene = town.value?.scene;
  if (!definition || !scene) return;
  dispatchV1MinimapTravel(target, definition, scene, command);
}
function createMinimapCanvas(): void {
  minimapIdle = undefined;
  const definition = runtime.value; if (!definition || minimapBase.value) return;
  const generated = generateV1MinimapBitmap(definition);
  const bitmap = document.createElement('canvas'); bitmap.width = generated.width; bitmap.height = generated.height;
  const context = bitmap.getContext('2d');
  if (!context) { renderError.value = V1_MINIMAP_STRINGS.bitmapFailure; return; }
  context.putImageData(new ImageData(new Uint8ClampedArray(generated.pixels),
    generated.width, generated.height), 0, 0);
  minimapBase.value = { bitmap, minX: generated.minX, minZ: generated.minZ,
    metresPerPx: generated.metresPerPx };
}
async function loadPaintedMinimap(): Promise<void> {
  const definition = runtime.value; if (!definition) return;
  const key = v1MinimapLayoutKey(definition); const token = ++minimapLoadToken;
  const painted = await loadV1PaintedMinimapWithFallback(
    key, asset('assets/default/town-minimap'), scheduleMinimapCanvas, fetch, createImageBitmap,
    () => token === minimapLoadToken && runtime.value === definition);
  if (token !== minimapLoadToken || runtime.value !== definition) { painted?.bitmap.close(); return; }
  if (painted === null) return;
  minimapBase.value = { bitmap: painted.bitmap, minX: 0, minZ: 0, metresPerPx: 1,
    worldToImage: v1WorldToImageMatrix(painted.metadata), south: painted.metadata.south };
  paintedMarkers.value = createPaintedMinimapMarkers(painted.metadata);
}
async function loadTaskNpcIds(): Promise<void> {
  const token = ++taskNpcLoadToken;
  const quests = projection.value?.quests ?? [];
  try {
    const ids = await loadV1ActiveTaskNpcIds(controller.chapterId.value, quests, asset('content'));
    if (token === taskNpcLoadToken) taskNpcIds.value = ids;
  } catch (error) {
    if (import.meta.env.DEV) console.warn('TOWN_MINIMAP_TASK_NPCS_UNAVAILABLE', error);
    if (token === taskNpcLoadToken) taskNpcIds.value = new Set();
  }
}
function scheduleMinimapCanvas(): void {
  const requestIdle = window.requestIdleCallback?.bind(window);
  minimapUsesIdleCallback = requestIdle !== undefined;
  minimapIdle = requestIdle ? requestIdle(createMinimapCanvas) : window.setTimeout(createMinimapCanvas, 0);
}
function updateViewQuad(): void {
  if (!view) { minimapViewQuad.value = null; return; }
  const valid = writeV1ViewQuad(view, viewQuadBuffer);
  minimapViewQuad.value = valid ? viewQuadBuffer : null;
}
function wheel(event: WheelEvent): void {
  applyTownWheel(event, zoom, 16, canvas.value?.clientHeight ?? 800);
}

useActionContext('explore', {
  zoomIn: () => { zoom.stepIn(); }, zoomOut: () => { zoom.stepOut(); },
  zoomReset: () => { zoom.reset(); },
  interact: usePrimaryContextAction,
  toggleAreaMap,
});

async function mountScene(): Promise<void> {
  const target = canvas.value; const definition = runtime.value; const townSceneProjection = town.value?.scene;
  if (!target || !definition || !townSceneProjection) return;
  try {
    const { createTownScene } = await import('@tianshu/render/town');
    const spriteFor = await loadPortraitResolver();
    const hero = projection.value?.characters?.find((c) => c.relation === 'self');
    const isFemale = hero?.detail?.identity?.gender === 'female';
    const playerModelUrl = isFemale
      ? '/assets/default/model3d/npc_zhujue__ch00_f/anim_idle_walk_run.glb'
      : '/assets/default/model3d/npc_zhujue__ch00_m/anim_idle_walk_run.glb';
    view = await createTownScene(target, definition, {
      projection: townSceneProjection, zoom: v1ZoomRatio(zoom.value(), Math.max(1, target.clientHeight)),
      spriteFor, playerModelUrl, playerHeightM: DEFAULT_PLAYER_HEIGHT_M[isFemale ? 'female' : 'male'] });
    (window as unknown as { __townView?: unknown }).__townView = view;
    observer = new ResizeObserver(([entry]) => {
      if (entry) { view?.resize(entry.contentRect.width, entry.contentRect.height, window.devicePixelRatio);
        applyZoom(); }
    });
    observer.observe(target);
    view.resize(target.clientWidth, target.clientHeight, window.devicePixelRatio);
    pointerGestures = createPointerGestures(target, {
      onPinchStart: () => zoom.pinchStart(), onPinch: gesture => zoom.pinch(gesture.scale),
      onPinchEnd: () => zoom.pinchEnd(),
    });
    const animate = (time: number): void => {
      if (!view) return;
      view.render(time, controller.settings.value.reducedMotion);
      updateViewQuad();
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
  } catch (error) { renderError.value = error instanceof Error ? error.message : '城镇渲染不可用'; }
}
function pointer(event: PointerEvent): void {
  const target = canvas.value; const scene = town.value?.scene;
  if (!target || !view || !scene || event.type !== 'click') return;
  const bounds = target.getBoundingClientRect();
  const anchor = view.pickAnchor(event.clientX, event.clientY, bounds);
  if (anchor) useAnchor(anchor);
  else { const point = view.pickPoint(event.clientX, event.clientY, bounds);
    if (point) void command({ t: 'town/move', destination: point }); }
}
function keyboard(event: KeyboardEvent): void {
  if (event.defaultPrevented || event.repeat || event.ctrlKey || event.metaKey || event.altKey ||
      (event.target instanceof Element && event.target.closest('input, button, [contenteditable=true]'))) return;
  const actor = town.value?.scene.actor.point;
  const next = actor ? townStep(actor, event.key.length === 1 ? event.key.toLowerCase() : event.key) : null;
  if (next) { event.preventDefault(); void command({ t: 'town/move', destination: next }); }
}
watch(() => town.value?.scene, (next) => {
  if (!next) return;
  if (!moving.value) void view?.update(next);
  if (!moving.value) settleFade(next);
}, { deep: false });
watch(runtime, (next, previous) => {
  if (!next || next === previous) return;
  minimapLoadToken += 1;
  const bitmap = minimapBase.value?.bitmap; if (bitmap && 'close' in bitmap) bitmap.close();
  minimapBase.value = null; paintedMarkers.value = null; void loadPaintedMinimap();
});
watch([() => controller.chapterId.value, () => projection.value?.quests], () => {
  void loadTaskNpcIds();
});
onMounted(() => {
  window.addEventListener('keydown', keyboard);
  releaseZoom = zoom.subscribe(value => { zoomPxPerMetre.value = value; applyZoom(value); });
  void loadPaintedMinimap(); void loadTaskNpcIds(); void mountScene();
});
onBeforeUnmount(() => {
  window.removeEventListener('keydown', keyboard); window.clearTimeout(fadeTimer);
  window.clearTimeout(moveTimer);
  if (minimapIdle !== undefined) {
    if (minimapUsesIdleCallback) window.cancelIdleCallback?.(minimapIdle);
    else window.clearTimeout(minimapIdle);
  }
  areaMap.dispose(); releaseZoom?.(); pointerGestures?.dispose();
  const bitmap = minimapBase.value?.bitmap; if (bitmap && 'close' in bitmap) bitmap.close();
  cancelAnimationFrame(frame); observer?.disconnect(); view?.dispose(); view = undefined;
});
</script>

<template>
  <section v-if="town && runtime" class="town-page">
    <div class="town-stage">
      <canvas ref="canvas" :aria-label="`${town.location}城镇地图`" @click="pointer" @wheel="wheel" />
      <output v-if="renderError" class="map-error">{{ renderError }}</output>
      <TxMinimap
        class="town-minimap" :base="minimapBase" :player="minimapPlayer"
        :basis="minimapBasis" :view-quad="minimapViewQuad" :markers="minimapMarkers"
        :path="minimapPath" :destination="minimapDestination"
        :north-up="controller.settings.value.minimapNorthUp" :expanded="minimapExpanded"
        :size-px="200" :zoom-px-per-metre="zoomPxPerMetre"
        @travel="minimapTravel" @toggle-expanded="toggleAreaMap"
        @zoom="direction => direction > 0 ? zoom.stepIn() : zoom.stepOut()"
        @set-zoom="value => zoom.set(value)"
        @toggle-north-up="toggleMinimapNorthUp"
      />
    </div>

    <TxContextActions
      v-if="!projection.dialogue && contextActions.length"
      class="town-context-actions" :actions="contextActions" @act="useContextAction"
    />
  </section>
  <section v-else class="paper-panel reading-panel"><p>城镇运行时尚未装载。</p></section>
</template>

<style scoped>
.town-page {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: var(--font-calligraphy, 'Kaiti SC', KaiTi, serif);
}
.town-stage {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #d9ccb0;
}
.town-stage canvas {
  width: 100%;
  height: 100%;
  display: block;
  touch-action: none;
}
.town-minimap {
  position: absolute;
  /* below the topbar's time · place · money line so the 司南 on the disc's upper-left stays visible */
  top: 132px;
  right: 38px;
  z-index: 20;
}
.town-minimap.expanded {
  top: 0;
  right: 0;
}
.town-context-actions {
  position: absolute;
  right: max(24px, env(safe-area-inset-right));
  bottom: max(86px, calc(62px + env(safe-area-inset-bottom)));
  z-index: 21;
}
</style>
