<script setup lang="ts">
/* global Event, HTMLImageElement, HTMLInputElement, HTMLElement, MouseEvent, PointerEvent, ResizeObserver, WheelEvent, cancelAnimationFrame, fetch, requestAnimationFrame, window */
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import { storeToRefs } from 'pinia';
import type { WorldMapProjection } from '@tianshu/core';
import type { WorldMapRuntimeDefinition } from '@tianshu/data/schemas';
import { useUiStore } from '@tianshu/ui/runtime';
import type { GameController } from '../game-controller';
import { GRID_SIZE, centerOnGrid, clampView, cleanNodeName, coverScale, drawableRoads,
  gridToImage, gridToScreen, landmarkForNode, layoutLabels, markerSize, nearestOpenNode, panView,
  pointAlongPath, resizeView, roadDegrees, roadPaths, screenToGrid, sectViewNodes, shortNodeName,
  zoomAt } from '../worldmap/painted-view';
import type { LandmarkEntry, NodeLabel, Point, Size, ViewNode, ViewSect, ViewState } from '../worldmap/painted-view';

type MapNode = WorldMapRuntimeDefinition['nodes'][number];
const { controller } = defineProps<{ controller: GameController }>();
const emit = defineEmits<{ scene: [kind: 'town' | 'ruin'] }>();
const { projection } = storeToRefs(useUiStore());
const stage = ref<HTMLElement>();
const plane = ref<HTMLElement>();
const paintedImage = ref<HTMLImageElement>();
const hovered = shallowRef<MapNode | null>(null);
const selectedId = ref('');
const zoom = ref(1.6);
const fastTravel = ref(false);
const renderError = ref('');
const imageReady = ref(false);
const imageSize = shallowRef<Size>(GRID_SIZE);
const nodeMarkers = shallowRef<readonly NodeLabel[]>([]);
const actorScreen = shallowRef<Point>([0, 0]);
const destinationScreen = shallowRef<Point | null>(null);
const facingLeft = ref(false);
const roadTransform = ref('');
const panelCollapsed = ref(false);
const markerZoom = ref(1.6);
/** Kit marker atlas (tech/13 §5.2); null keeps the legacy single icon. */
interface MarkerAtlas {
  readonly url: string; readonly width: number; readonly height: number;
  readonly markers: Readonly<Record<string, { x: number; y: number; w: number; h: number; anchor: Point }>>;
}
const markerAtlas = shallowRef<MarkerAtlas | null>(null);
const landmarkIndex = shallowRef<readonly LandmarkEntry[]>([]);
const mapView = computed(() => controller.worldmap.value);
const mapStatic = computed(() => projection.value.worldmapStatic);
const mapDefinition = computed(() => mapStatic.value?.map);
const openNodes = computed(() => mapDefinition.value?.nodes.filter(node => node.open) ?? []);
/** Sect seats of this chapter (tech/13 §5.4): presentation only, travel goes through the anchor city. */
const sects = computed<readonly ViewSect[]>(() => mapDefinition.value?.sects ?? []);
const sectNodes = computed(() => sectViewNodes(sects.value, openNodes.value));
const labelNodes = computed<readonly ViewNode[]>(() => [...openNodes.value, ...sectNodes.value]);
const selectedSectId = ref('');
const hoveredSectId = ref('');
const focusedSect = computed(() => sects.value.find(sect => sect.id === (selectedSectId.value || hoveredSectId.value)) ?? null);
const sectCity = computed(() => {
  const id = focusedSect.value?.cityId;
  return id ? openNodes.value.find(node => node.id === id) ?? null : null;
});
const SECT_STATUS: Readonly<Record<ViewSect['status'], string>> = { O: '开放', H: '隐世', P: '前身', M: '仅提及' };
const selected = computed(() => openNodes.value.find(node => node.id === selectedId.value) ?? hovered.value);
const selectedReachable = computed(() => !selected.value ||
  (mapView.value?.reachableNodeIds.includes(selected.value.id) ?? false));
const destinationId = computed(() => mapView.value?.journey?.destination ?? selectedId.value);
const reducedMotion = computed(() => controller.settings.value.reducedMotion);
const walking = computed(() => mapView.value?.journey?.status === 'walking');
const mapTextureUrl = computed(() => {
  const url = mapStatic.value?.mapTextureUrl;
  return url ? (url.startsWith('/') ? url : '/' + url) : '';
});
const roadData = computed(() => {
  const map = mapDefinition.value;
  const roads = map ? drawableRoads(map.roads, map.nodes, map.era) : [];
  // Cache polylines per map definition. The inner SVG group converts grid units to image pixels.
  return { paths: roadPaths(roads, GRID_SIZE), degrees: roadDegrees(roads) };
});
/** Landmark vignettes for open nodes of this chapter, positioned in painted-image pixels. */
const landmarks = computed(() => {
  const map = mapDefinition.value; const index = landmarkIndex.value;
  if (!map || index.length === 0) return [];
  const gridPx = imageSize.value.width / GRID_SIZE.width;
  return openNodes.value.flatMap((node) => {
    const entry = landmarkForNode(index, node.id, map.era);
    if (!entry || entry.width <= 0 || entry.height <= 0) return [];
    const [ix, iy] = gridToImage(node.point, imageSize.value);
    const width = entry.footprintGrid * gridPx; const k = width / entry.width;
    return [{ id: entry.id, node: node.id, url: entry.url, footprint: width, k,
      ax: entry.anchor[0] * k, ay: entry.anchor[1] * k,
      left: ix - entry.anchor[0] * k, top: iy - entry.anchor[1] * k,
      width, height: entry.height * k, below: (entry.height - entry.anchor[1]) * k }];
  });
});
const landmarkByNode = computed(() => new Map(landmarks.value.map((row) => [row.node, row])));
/** Display position: along the current road's terrain path when walking, else core's point (tech/13 §5.1). */
function displayPoint(state: WorldMapProjection | null | undefined): Point {
  if (!state) return [0, 0];
  const journey = state.journey; const map = mapDefinition.value;
  const leg = journey && journey.legIndex < journey.legs.length ? journey.legs[journey.legIndex] : undefined;
  const road = leg && map ? map.roads.find((row) => row.key === leg.roadKey) : undefined;
  if (!journey || !leg || !road || road.distanceLi <= 0) return state.point;
  const line = road.path && road.path.length >= 2 ? road.path : road.points;
  return pointAlongPath(line, journey.offsetLi / road.distanceLi, leg.from !== road.start);
}
const actorPoint = computed(() => displayPoint(mapView.value));
const roadImageTransform = computed(() => 'scale(' + imageSize.value.width / GRID_SIZE.width + ' ' +
  imageSize.value.height / GRID_SIZE.height + ')');
const progress = computed(() => {
  const journey = mapView.value?.journey;
  return journey ? Math.floor(journey.travelledLi * 100 / Math.max(1, journey.totalLi)) : 0;
});

// View state stays outside Vue's reactive tree; a pending frame is the only DOM commit point.
let view: ViewState = { s: 1, tx: 0, ty: 0 };
let viewport: Size = { width: 0, height: 0 };
let following = true;
let mounted = false;
let disposed = false;
let frame = 0;
let stepTimer = 0;
let lastTransform = '';
let labelInputs: readonly unknown[] = [];
let observer: ResizeObserver | undefined;
let boundStage: HTMLElement | undefined;
let cleanupInputs: (() => void) | undefined;
let cleanupDebug: (() => void) | undefined;
let animation: { from: ViewState; to: ViewState; start: number } | undefined;
const ready = () => viewport.width > 0 && viewport.height > 0 && !disposed;
const viewportCentre = (): Point => [viewport.width / 2, viewport.height / 2];

function queueFrame(): void {
  if (mounted && stage.value && ready() && !frame) frame = requestAnimationFrame(paintFrame);
}
function paintFrame(time: number): void {
  frame = 0;
  if (!stage.value || !ready()) return;
  if (animation) {
    const fraction = Math.min(1, Math.max(0, (time - animation.start) / 200));
    const eased = 1 - (1 - fraction) ** 3;
    view = clampView({ s: view.s,
      tx: animation.from.tx + (animation.to.tx - animation.from.tx) * eased,
      ty: animation.from.ty + (animation.to.ty - animation.from.ty) * eased }, imageSize.value, viewport);
    if (fraction === 1) animation = undefined;
  }
  const transform = 'translate3d(' + view.tx + 'px, ' + view.ty + 'px, 0) scale(' + view.s + ')';
  if (plane.value && transform !== lastTransform) {
    plane.value.style.transform = transform; lastTransform = transform;
  }
  roadTransform.value = 'translate(' + view.tx + ' ' + view.ty + ') scale(' + view.s + ')';
  zoom.value = view.s / coverScale(imageSize.value, viewport);
  const z = view.s / coverScale(imageSize.value, viewport);
  plane.value?.style.setProperty('--map-s', String(view.s));
  const inputs = [view.s, view.tx, view.ty, viewport.width, viewport.height, imageSize.value,
    labelNodes.value, roadData.value.degrees, selectedId.value, mapView.value?.positionNodeId,
    destinationId.value, landmarkByNode.value, selectedSectId.value, markerAtlas.value];
  if (inputs.some((value, index) => value !== labelInputs[index])) {
    const halfHeight = (node: ViewNode): number => {
      const landmark = landmarkByNode.value.get(node.id);
      // Below-anchor part of the vignette on screen, honouring its 56px minimum width.
      if (landmark) return landmark.below * view.s * Math.max(1, 56 / (landmark.footprint * view.s));
      const size = markerSize(node.tier, z); const cell = markerAtlas.value?.markers[node.marker ?? ''];
      // The node sits on the cell anchor, so the label clears the part of the icon below it.
      return cell ? (cell.h - cell.anchor[1]) * size / Math.max(cell.w, cell.h) : size / 2;
    };
    nodeMarkers.value = layoutLabels(labelNodes.value, view, imageSize.value, viewport, {
      selectedId: selectedSectId.value || selectedId.value, currentNodeId: mapView.value?.positionNodeId ?? null,
      destinationId: destinationId.value,
    }, roadData.value.degrees, halfHeight);
    markerZoom.value = z;
    labelInputs = inputs;
  }
  actorScreen.value = gridToScreen(actorPoint.value, view, imageSize.value);
  const destination = openNodes.value.find(node => node.id === destinationId.value);
  destinationScreen.value = destination ? gridToScreen(destination.point, view, imageSize.value) : null;
  // Only the bounded 200ms follow transition requests another frame.
  if (animation) queueFrame();
}
function resize(width: number, height: number): void {
  if (disposed || width <= 0 || height <= 0 || (width === viewport.width && height === viewport.height)) return;
  const next = { width, height };
  animation = undefined;
  view = ready() ? resizeView(view, imageSize.value, viewport, next)
    : centerOnGrid({ s: coverScale(imageSize.value, next) * 1.6, tx: 0, ty: 0 },
      mapView.value?.point ?? [256, 192], imageSize.value, next);
  viewport = next; queueFrame();
}
function changeImageSize(next: Size): void {
  if (next.width === imageSize.value.width && next.height === imageSize.value.height) return;
  if (ready()) {
    const centre = screenToGrid(viewportCentre(), view, imageSize.value);
    const z = view.s / coverScale(imageSize.value, viewport);
    view = centerOnGrid({ s: coverScale(next, viewport) * z, tx: 0, ty: 0 }, centre, next, viewport);
  }
  imageSize.value = next; animation = undefined; queueFrame();
}
function onImageLoad(event: Event): void {
  const image = event.currentTarget as HTMLImageElement;
  if (disposed || image !== paintedImage.value) return;
  const width = image.naturalWidth; const height = image.naturalHeight;
  if (!width || !height || Math.abs((width / height) / (4 / 3) - 1) > 0.005) {
    imageReady.value = false; changeImageSize(GRID_SIZE);
    renderError.value = '地图底图比例不符，道路与城镇仍可操作。'; return;
  }
  changeImageSize({ width, height }); imageReady.value = true; renderError.value = '';
}
function onImageError(event: Event): void {
  if (disposed || event.currentTarget !== paintedImage.value) return;
  imageReady.value = false; changeImageSize(GRID_SIZE);
  renderError.value = '地图底图暂不可用，道路与城镇仍可操作。';
}
function setZoom(z: number, point: Point = viewportCentre()): void {
  if (!ready() || !Number.isFinite(z)) return;
  animation = undefined;
  view = zoomAt(view, z * coverScale(imageSize.value, viewport), point, imageSize.value, viewport);
  queueFrame();
}
function onZoomInput(event: Event): void { setZoom(Number((event.target as HTMLInputElement).value)); }
function locateProtagonist(): void {
  if (!ready() || !mapView.value) return;
  following = true; animation = undefined;
  view = centerOnGrid(view, actorPoint.value, imageSize.value, viewport); queueFrame();
}
function followProtagonist(state: WorldMapProjection): void {
  if (!ready() || !following || state.journey?.status !== 'walking') return;
  const point = displayPoint(state);
  const [x, y] = gridToScreen(point, view, imageSize.value);
  if (!animation && x >= viewport.width * 0.2 && x <= viewport.width * 0.8 &&
    y >= viewport.height * 0.2 && y <= viewport.height * 0.8) return;
  const target = centerOnGrid(view, point, imageSize.value, viewport);
  if (target.tx === view.tx && target.ty === view.ty) { animation = undefined; return; }
  if (reducedMotion.value) { view = target; animation = undefined; }
  else if (animation) animation.to = target;
  else animation = { from: view, to: target, start: window.performance.now() };
  queueFrame();
}

const activePointers = new Map<number, Point>();
let dragDistance = 0;
let dragOrigin: Point = [0, 0];
let dragStarted = false;
let pressOnBadge = false;
let suppressBadgeClick = false;
let usedPinch = false;
let pinch: { distance: number; midpoint: Point; view: ViewState } | undefined;
let gesture: { midpoint: Point; view: ViewState } | undefined;
function localPoint(clientX: number, clientY: number): Point {
  const bounds = stage.value?.getBoundingClientRect();
  return [clientX - (bounds?.left ?? 0), clientY - (bounds?.top ?? 0)];
}
function pointerPair(): { distance: number; midpoint: Point } | undefined {
  const [a, b] = [...activePointers.values()];
  return a && b ? { distance: Math.hypot(b[0] - a[0], b[1] - a[1]),
    midpoint: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] } : undefined;
}
function releasePointer(id: number): void {
  try { boundStage?.releasePointerCapture?.(id); } catch { /* Capture may already be released. */ }
}
function clearPointers(): void {
  // Touch devices may send pointerleave between a completed tap and its click.
  suppressBadgeClick ||= activePointers.size > 0 || Boolean(gesture);
  for (const id of activePointers.keys()) releasePointer(id);
  activePointers.clear(); pinch = undefined; gesture = undefined; dragDistance = 0; usedPinch = false;
  dragStarted = false;
  pressOnBadge = false;
}
function onPointerDown(event: PointerEvent): void {
  if (!ready() || (event.button !== 0 && event.pointerType !== 'touch')) return;
  if (activePointers.size === 0) {
    dragDistance = 0; usedPinch = false; suppressBadgeClick = false;
    dragOrigin = localPoint(event.clientX, event.clientY); dragStarted = false;
    pressOnBadge = Boolean((event.target as HTMLElement).closest('[data-node-id]'));
  }
  if (!pressOnBadge) event.preventDefault();
  animation = undefined;
  activePointers.set(event.pointerId, localPoint(event.clientX, event.clientY));
  const pair = pointerPair();
  if (pair) { usedPinch = true; suppressBadgeClick = true; pinch = { ...pair, view }; }
}
function onPointerMove(event: PointerEvent): void {
  if (!ready()) return;
  const point = localPoint(event.clientX, event.clientY);
  if (point[0] < 0 || point[0] > viewport.width || point[1] < 0 || point[1] > viewport.height) {
    onPointerLeave(); return;
  }
  const previous = activePointers.get(event.pointerId);
  if (!previous) {
    const badgeId = (event.target as HTMLElement).closest('[data-node-id]')?.getAttribute('data-node-id');
    hovered.value = openNodes.value.find(node => node.id === badgeId) ??
      nearestOpenNode(openNodes.value, point, view, imageSize.value); return;
  }
  activePointers.set(event.pointerId, point);
  if (gesture) return; // Safari also emits pointer events for its native pinch gesture.
  const pair = pointerPair();
  if (pair && pinch && pinch.distance > 0) {
    const delta: Point = [pair.midpoint[0] - pinch.midpoint[0], pair.midpoint[1] - pinch.midpoint[1]];
    view = zoomAt(pinch.view, pinch.view.s * pair.distance / pinch.distance,
      pinch.midpoint, imageSize.value, viewport, pair.midpoint);
    if (Math.hypot(...delta) > 6) following = false;
    hovered.value = null; queueFrame(); return;
  }
  const delta: Point = [point[0] - previous[0], point[1] - previous[1]];
  dragDistance += Math.hypot(...delta);
  if (dragDistance <= 6) return;
  following = false; suppressBadgeClick = true; hovered.value = null;
  boundStage?.setPointerCapture?.(event.pointerId);
  const movement: Point = dragStarted ? delta : [point[0] - dragOrigin[0], point[1] - dragOrigin[1]];
  dragStarted = true;
  view = panView(view, movement, imageSize.value, viewport); queueFrame();
}
function onPointerUp(event: PointerEvent): void {
  const previous = activePointers.get(event.pointerId); if (!previous) return;
  const point = localPoint(event.clientX, event.clientY);
  dragDistance += Math.hypot(point[0] - previous[0], point[1] - previous[1]);
  if (dragDistance > 6) following = false;
  activePointers.delete(event.pointerId); releasePointer(event.pointerId);
  if (activePointers.size > 0) {
    pinch = undefined; usedPinch = true; dragDistance = 7; dragStarted = true; return;
  }
  suppressBadgeClick = dragDistance > 6 || usedPinch || Boolean(gesture);
  if (!suppressBadgeClick && !pressOnBadge) {
    const node = nearestOpenNode(openNodes.value, localPoint(event.clientX, event.clientY), view, imageSize.value);
    hovered.value = node; if (node) selectNode(node.id);
  }
  pinch = undefined; pressOnBadge = false;
}
function onPointerLeave(): void { hovered.value = null; clearPointers(); }
function onBadgeClick(nodeId: string, event: MouseEvent): void {
  if (event.detail > 0 && suppressBadgeClick) return;
  if (sects.value.some(sect => sect.id === nodeId)) { selectSect(nodeId); return; }
  selectNode(nodeId);
}
function selectNode(nodeId: string): void {
  if (disposed || !openNodes.value.some(node => node.id === nodeId)) return;
  selectedSectId.value = ''; selectedId.value = nodeId; queueFrame(); void travel();
}
/** A sect only opens its note; travelling is the anchor city's button (no new rules). */
function selectSect(sectId: string): void {
  if (disposed) return;
  selectedId.value = ''; hovered.value = null;
  selectedSectId.value = sectId; panelCollapsed.value = false; queueFrame();
}
function onBadgeEnter(nodeId: string): void {
  if (sects.value.some(sect => sect.id === nodeId)) { hovered.value = null; hoveredSectId.value = nodeId; return; }
  hoveredSectId.value = ''; hovered.value = openNodes.value.find(node => node.id === nodeId) ?? null;
}
async function travel(): Promise<void> {
  if (selectedId.value) await controller.worldMapCommand({ t: 'worldmap/travel', nodeId: selectedId.value });
}
function scheduleStep(state: WorldMapProjection | null): void {
  window.clearTimeout(stepTimer); stepTimer = 0;
  const journey = state?.journey;
  if (disposed || !journey || journey.status !== 'walking') return;
  const delay = reducedMotion.value ? 200 : (fastTravel.value ? 12 : 45);
  stepTimer = window.setTimeout(() => {
    stepTimer = 0;
    if (disposed) return;
    if (controller.busy.value) { scheduleStep(mapView.value); return; }
    void controller.worldMapCommand({ t: 'worldmap/step', journeyId: journey.id,
      expectedTravelledLi: journey.travelledLi });
  }, delay);
}
function bindStage(target: HTMLElement | undefined): void {
  if (target === boundStage) return;
  cleanupInputs?.(); observer?.disconnect(); clearPointers(); gesture = undefined; animation = undefined;
  if (frame) cancelAnimationFrame(frame);
  frame = 0; boundStage = target; viewport = { width: 0, height: 0 }; lastTransform = ''; labelInputs = [];
  if (!target || disposed) return;
  const onWheel = (event: WheelEvent) => {
    event.preventDefault();
    if (gesture) return;
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.height : 1);
    setZoom(view.s / coverScale(imageSize.value, viewport) * Math.exp(-delta * 0.002),
      localPoint(event.clientX, event.clientY));
  };
  const gesturePoint = (event: Event): Point => {
    const e = event as Event & { clientX?: number; clientY?: number };
    return typeof e.clientX === 'number' && typeof e.clientY === 'number'
      ? localPoint(e.clientX, e.clientY) : pointerPair()?.midpoint ?? viewportCentre();
  };
  const onGestureStart = (event: Event) => {
    event.preventDefault(); animation = undefined; usedPinch = true; suppressBadgeClick = true;
    gesture = { midpoint: gesturePoint(event), view };
  };
  const onGestureChange = (event: Event) => {
    event.preventDefault();
    const scale = (event as Event & { scale?: number }).scale;
    if (!gesture || typeof scale !== 'number' || !Number.isFinite(scale) || scale <= 0 || !ready()) return;
    const midpoint = gesturePoint(event);
    if (Math.hypot(midpoint[0] - gesture.midpoint[0], midpoint[1] - gesture.midpoint[1]) > 6) following = false;
    view = zoomAt(gesture.view, gesture.view.s * scale, gesture.midpoint, imageSize.value, viewport, midpoint);
    queueFrame();
  };
  const onGestureEnd = (event: Event) => {
    event.preventDefault(); gesture = undefined;
    const pair = pointerPair(); pinch = pair ? { ...pair, view } : undefined;
  };
  target.addEventListener('wheel', onWheel, { passive: false });
  target.addEventListener('gesturestart', onGestureStart, { passive: false });
  target.addEventListener('gesturechange', onGestureChange, { passive: false });
  target.addEventListener('gestureend', onGestureEnd, { passive: false });
  cleanupInputs = () => {
    target.removeEventListener('wheel', onWheel);
    target.removeEventListener('gesturestart', onGestureStart);
    target.removeEventListener('gesturechange', onGestureChange);
    target.removeEventListener('gestureend', onGestureEnd);
  };
  observer = new ResizeObserver(([entry]) => {
    if (!disposed && boundStage === target && entry) resize(entry.contentRect.width, entry.contentRect.height);
  });
  observer.observe(target);
  const bounds = target.getBoundingClientRect(); resize(bounds.width, bounds.height);
}

watch(mapTextureUrl, url => {
  imageReady.value = false; renderError.value = url ? '' : '地图底图暂不可用，道路与城镇仍可操作。';
  changeImageSize(GRID_SIZE);
}, { immediate: true });
watch(mapView, (next, previous) => {
  scheduleStep(next);
  if (!next) return;
  if (previous) {
    const now = displayPoint(next)[0]; const before = displayPoint(previous)[0];
    if (Math.abs(now - before) > 1e-6) facingLeft.value = now < before;
  }
  const newJourney = next.journey && (next.journey.id !== previous?.journey?.id ||
    next.journey.destination !== previous?.journey?.destination);
  if (newJourney) following = true;
  const moved = !previous || next.point[0] !== previous.point[0] || next.point[1] !== previous.point[1] ||
    next.journey?.offsetLi !== previous.journey?.offsetLi || next.journey?.legIndex !== previous.journey?.legIndex;
  if (moved || newJourney) followProtagonist(next);
  if (moved || next.positionNodeId !== previous?.positionNodeId) queueFrame();
  if (next.scene) emit('scene', next.scene.kind);
}, { immediate: true });
watch([selectedId, destinationId, openNodes], queueFrame);
watch(mapDefinition, () => {
  selectedId.value = ''; hovered.value = null; following = true; animation = undefined; clearPointers();
  if (ready()) view = centerOnGrid({ s: coverScale(imageSize.value, viewport) * 1.6, tx: 0, ty: 0 },
    mapView.value?.point ?? [256, 192], imageSize.value, viewport);
  queueFrame();
});
watch(selected, next => { if (next) panelCollapsed.value = false; });
watch([fastTravel, reducedMotion], () => {
  scheduleStep(mapView.value);
  if (reducedMotion.value && animation) { view = animation.to; animation = undefined; queueFrame(); }
});
watch(stage, target => { if (mounted) bindStage(target); }, { flush: 'post' });
watch(landmarkByNode, queueFrame);
/** Optional overlays: a missing or malformed file simply keeps the fallback (tech/13 §5.2–§5.3). */
async function loadOverlays(): Promise<void> {
  const json = async (url: string): Promise<unknown> => {
    try { const response = await fetch(url); return response.ok ? await response.json() : null; } catch { return null; }
  };
  const [atlas, index] = await Promise.all([json('/assets/default/map/markers/atlas.json'),
    json('/assets/default/map/landmark/index.json')]);
  if (disposed) return;
  markerAtlas.value = parseAtlas(atlas);
  if (Array.isArray(index)) landmarkIndex.value = index.filter(isLandmarkRow);
}
const positive = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0;
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const pair = (value: unknown): value is Point => Array.isArray(value) && value.length === 2 && value.every(finite);
/** Whole-atlas check: one malformed cell drops the atlas and the legacy icon stays (tech/13 §5.2). */
function parseAtlas(value: unknown): MarkerAtlas | null {
  const atlas = value as { image?: unknown; width?: unknown; height?: unknown; markers?: unknown } | null;
  if (!atlas || typeof atlas.image !== 'string' || !/^[\w.-]+$/.test(atlas.image) ||
      !positive(atlas.width) || !positive(atlas.height) || !atlas.markers || typeof atlas.markers !== 'object') return null;
  const markers: Record<string, MarkerAtlas['markers'][string]> = {};
  for (const [key, raw] of Object.entries(atlas.markers as Record<string, unknown>)) {
    const cell = raw as { x?: unknown; y?: unknown; w?: unknown; h?: unknown; anchor?: unknown } | null;
    if (!cell || !finite(cell.x) || !finite(cell.y) || cell.x < 0 || cell.y < 0 || !positive(cell.w) ||
        !positive(cell.h) || cell.x + cell.w > atlas.width || cell.y + cell.h > atlas.height || !pair(cell.anchor) ||
        cell.anchor[0] < 0 || cell.anchor[0] > cell.w || cell.anchor[1] < 0 || cell.anchor[1] > cell.h) return null;
    markers[key] = { x: cell.x, y: cell.y, w: cell.w, h: cell.h, anchor: cell.anchor };
  }
  return { url: '/assets/default/map/markers/' + atlas.image, width: atlas.width, height: atlas.height, markers };
}
/** Landmark rows are filtered one by one; a bad row only loses its own vignette. */
function isLandmarkRow(value: unknown): value is LandmarkEntry {
  const row = value as Partial<Record<keyof LandmarkEntry, unknown>> | null;
  return Boolean(row) && typeof row!.id === 'string' && typeof row!.node === 'string' &&
    Array.isArray(row!.chapters) && row!.chapters.every((chapter) => typeof chapter === 'string') &&
    typeof row!.url === 'string' && row!.url.startsWith('/assets/') && pair(row!.anchor) &&
    positive(row!.footprintGrid) && positive(row!.width) && positive(row!.height) &&
    row!.anchor[0] >= 0 && row!.anchor[0] <= row!.width && row!.anchor[1] >= 0 && row!.anchor[1] <= row!.height;
}
/** Background style for one atlas marker scaled to `size` px, anchor centred on the node. */
function markerStyle(marker: string, size: number): Record<string, string> | null {
  const atlas = markerAtlas.value; const cell = atlas?.markers[marker];
  if (!atlas || !cell) return null;
  const k = size / Math.max(cell.w, cell.h);
  return { width: cell.w * k + 'px', height: cell.h * k + 'px',
    backgroundImage: `url('${atlas.url}')`, backgroundSize: `${atlas.width * k}px ${atlas.height * k}px`,
    backgroundPosition: `${-cell.x * k}px ${-cell.y * k}px`,
    marginLeft: (cell.w / 2 - cell.anchor[0]) * k + 'px', marginTop: (cell.h / 2 - cell.anchor[1]) * k + 'px' };
}
onMounted(() => {
  mounted = true; bindStage(stage.value); void loadOverlays();
  if (import.meta.env.DEV) {
    const handle = Object.freeze({
      state: () => Object.freeze({ ...view, z: ready() ? view.s / coverScale(imageSize.value, viewport) : 1.6,
        viewport: Object.freeze({ ...viewport }), image: Object.freeze({ ...imageSize.value }), following }),
      focus: (nodeId: string) => {
        const node = openNodes.value.find(row => row.id === nodeId);
        if (!node || !ready()) return;
        animation = undefined; view = centerOnGrid(view, node.point, imageSize.value, viewport); queueFrame();
      },
      setZoom: (z: number) => setZoom(z),
    });
    const debugWindow = window as unknown as { __worldMapView?: typeof handle };
    Object.defineProperty(debugWindow, '__worldMapView', { value: handle, configurable: true, writable: false });
    cleanupDebug = () => { if (debugWindow.__worldMapView === handle) delete debugWindow.__worldMapView; };
  }
});
onBeforeUnmount(() => {
  disposed = true; mounted = false;
  window.clearTimeout(stepTimer); stepTimer = 0;
  bindStage(undefined); cleanupDebug?.();
});
</script>

<template>
  <section v-if="mapView && mapStatic" class="worldmap-page" :class="{ 'reduced-motion': reducedMotion }">
    <div
      ref="stage" class="worldmap-stage" aria-label="江湖大地图"
      @pointerdown="onPointerDown" @pointerup="onPointerUp" @pointercancel="clearPointers"
      @pointermove="onPointerMove" @pointerleave="onPointerLeave" @contextmenu.prevent
    >
      <div ref="plane" class="map-painted-plane">
        <img
          v-if="mapTextureUrl" v-show="imageReady" :key="mapTextureUrl" ref="paintedImage"
          class="map-painted-image" :src="mapTextureUrl" alt="" decoding="async" draggable="false"
          :width="imageSize.width" :height="imageSize.height" @load="onImageLoad" @error="onImageError"
        >
        <img
          v-for="mark in landmarks" v-show="imageReady" :key="mark.id" class="map-landmark" :src="mark.url" alt=""
          decoding="async" draggable="false" :data-landmark-node="mark.node"
          :style="{ left: mark.left + 'px', top: mark.top + 'px', width: mark.width + 'px', height: mark.height + 'px',
                    transformOrigin: mark.ax + 'px ' + mark.ay + 'px', '--fp': String(mark.footprint) }"
        >
      </div>
      <svg class="map-roads" aria-hidden="true">
        <g :transform="roadTransform">
          <g :transform="roadImageTransform">
            <g v-for="road in roadData.paths" :key="road.key" class="map-road" :class="road.className">
              <path :d="road.d" class="map-road-under" vector-effect="non-scaling-stroke" />
              <path :d="road.d" class="map-road-ink" vector-effect="non-scaling-stroke" />
            </g>
          </g>
        </g>
      </svg>
      <div
        v-if="destinationScreen" class="map-destination" aria-hidden="true"
        :style="{ left: destinationScreen[0] - 13 + 'px', top: destinationScreen[1] - 13 + 'px' }"
      />
      <div class="map-badges-layer">
        <button
          v-for="marker in nodeMarkers" v-show="marker.visible" :key="marker.id" type="button"
          class="map-city-badge" :data-node-id="marker.id" :data-tier="marker.tier"
          :class="[marker.kind, { quiet: marker.quiet, 'no-label': marker.labelHidden,
                                  selected: selectedId === marker.id || selectedSectId === marker.id,
                                  hovered: hovered?.id === marker.id || hoveredSectId === marker.id }]"
          :style="{ left: marker.x + 'px', top: marker.y + 'px' }"
          @click.stop="onBadgeClick(marker.id, $event)" @pointerenter="onBadgeEnter(marker.id)"
          @pointerleave="hoveredSectId = ''"
        >
          <span
            v-if="!landmarkByNode.has(marker.id)" class="city-icon" :class="[marker.kind, { atlas: markerAtlas }]"
            :style="markerStyle(marker.marker, markerSize(marker.tier, markerZoom)) ??
              { width: markerSize(marker.tier, markerZoom) + 'px', height: markerSize(marker.tier, markerZoom) + 'px' }"
          />
          <span class="city-name" :style="{ fontSize: marker.font + 'px', top: marker.labelY - marker.y + 'px' }">{{ marker.name }}</span>
        </button>
      </div>
      <div
        class="map-hero" :class="{ walking, 'facing-left': facingLeft }" aria-label="主角当前位置"
        :style="{ left: actorScreen[0] + 'px', top: actorScreen[1] + 'px' }"
      >
        <i class="map-hero-halo" />
        <div class="map-hero-bob"><img :src="'/img/hero_cutout.png'" alt="" height="64" draggable="false"></div>
      </div>
    </div>
    <output v-if="renderError" class="map-error" role="status">{{ renderError }}</output>
    <div class="map-legend" aria-hidden="true"><i />城镇 <i class="ruin" />遗迹</div>
    <div class="map-view-controls">
      <button type="button" class="locate-btn" title="定位主角位置" @click="locateProtagonist">📍 定位</button>
      <label class="map-zoom">缩放
        <input :value="zoom" type="range" min="1" max="4" step="0.05" @input="onZoomInput">
      </label>
    </div>
    <aside class="worldmap-panel journey" :class="{ collapsed: panelCollapsed }">
      <header @click="panelCollapsed = !panelCollapsed">
        <div class="panel-header-titles">
          <span class="note-mark">行路笺</span>
          <small>{{ mapStatic.map.years[0] }}—{{ mapStatic.map.years[1] }} 年</small>
        </div>
        <div class="panel-header-row">
          <h2>{{ focusedSect ? shortNodeName(focusedSect.name) : selected ? cleanNodeName(selected.name) : mapStatic.map.name }}</h2>
          <button type="button" class="collapse-toggle" :title="panelCollapsed ? '展开' : '折叠'">
            {{ panelCollapsed ? '▾' : '▴' }}
          </button>
        </div>
      </header>
      <div v-show="!panelCollapsed" class="panel-content">
        <template v-if="focusedSect">
          <h4>{{ shortNodeName(focusedSect.name) }}</h4>
          <p>门派驻地 · {{ focusedSect.siteName || shortNodeName(focusedSect.name) }}</p>
          <p>{{ SECT_STATUS[focusedSect.status] }}{{ focusedSect.status === 'H' ? '（需机缘触发）' : '' }}</p>
          <p v-if="sectCity">依附 {{ shortNodeName(sectCity.name) }}</p>
          <p v-else>附近暂无可通行的城镇。</p>
        </template>
        <template v-else-if="selected">
          <h4>{{ cleanNodeName(selected.name) }}</h4>
          <p>{{ selected.kind === 'town' ? '城镇' : '野外遗迹' }} · {{ selected.regionId }}</p>
          <p>年代 {{ mapStatic.map.years[0] }}—{{ mapStatic.map.years[1] }} 年</p>
          <p>等级 {{ selected.levelRange ? `${selected.levelRange[0]}—${selected.levelRange[1]}` : '未配置' }}</p>
          <p>{{ selected.levelNote }}</p>
          <p v-if="!selectedReachable" role="status">尚无已登记道路可达此地。</p>
        </template>
        <p v-else class="idle-tip">点选地图城镇或遗迹启程。</p>
        <progress v-if="mapView.journey" :value="progress" max="100">{{ progress }}%</progress>
        <p v-if="mapView.journey">{{ mapView.journey.travelledLi }} / {{ mapView.journey.totalLi }} 里 · {{ progress }}%</p>
        <p v-if="mapView.lastMessage" role="status">{{ mapView.lastMessage }}</p>
        <div class="map-actions">
          <button
            v-if="!mapView.journey && focusedSect && sectCity" type="button"
            :disabled="!mapView.reachableNodeIds.includes(sectCity.id) || controller.busy.value"
            @click="selectNode(sectCity.id)"
          >
            前往{{ shortNodeName(sectCity.name) }}
          </button>
          <button
            v-else-if="!mapView.journey" type="button"
            :disabled="!selectedId || !selectedReachable || controller.busy.value" @click="travel"
          >
            前往
          </button>
          <button
            v-else-if="mapView.journey.status === 'walking'" type="button" :disabled="controller.busy.value"
            @click="controller.worldMapCommand({ t: 'worldmap/cancel' })"
          >
            停步
          </button>
          <button
            v-if="mapView.journey && mapView.journey.status === 'walking'" type="button"
            :style="fastTravel ? 'color: var(--gold); border-color: var(--gold);' : ''"
            @click="fastTravel = !fastTravel"
          >
            {{ fastTravel ? '⚡ 疾行中' : '疾行' }}
          </button>
          <button
            v-else-if="mapView.journey" type="button" :disabled="controller.busy.value"
            @click="controller.worldMapCommand({ t: 'worldmap/resume' })"
          >
            继续
          </button>
          <button
            v-if="mapView.positionNodeId && !mapView.journey" type="button" :disabled="controller.busy.value"
            @click="controller.worldMapCommand({ t: 'worldmap/enter' })"
          >
            进入此地
          </button>
        </div>
      </div>
    </aside>
  </section>
  <section v-else class="paper-panel reading-panel"><p>本章大地图尚未装载。</p></section>
</template>

<style scoped>
.worldmap-page {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #e9dfc8;
}
.worldmap-stage {
  position: absolute;
  inset: 0;
  overflow: hidden;
  touch-action: none;
  user-select: none;
  cursor: grab;
}
.worldmap-stage:active { cursor: grabbing; }
.map-painted-plane {
  position: absolute;
  left: 0;
  top: 0;
  transform-origin: 0 0;
  pointer-events: none;
}
.map-painted-image { display: block; max-width: none; }
.map-roads { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.map-road { fill: none; stroke-linejoin: round; stroke-linecap: round; }
.map-road-under { stroke: #e9dfc8; stroke-width: 4.5px; stroke-opacity: 0.7; }
.map-road-ink { stroke: #7a5a3a; stroke-width: 2.2px; }
.road-dashed path { stroke-dasharray: 7 4; }
.road-dotted path, .road-approach path { stroke-dasharray: 2 4; }
.road-approach .map-road-ink { stroke-width: 1.4px; }
.map-destination {
  position: absolute;
  width: 26px;
  height: 26px;
  box-sizing: border-box;
  border: 2px solid #b5382b;
  border-radius: 50%;
  pointer-events: none;
  animation: destination-pulse 1.6s ease-in-out infinite;
}
@keyframes destination-pulse { 50% { opacity: 0.55; scale: 1.15; } }
.map-badges-layer { position: absolute; inset: 0; pointer-events: none; }
.map-landmark {
  position: absolute;
  max-width: none;
  pointer-events: none;
  /* Scales with the map; never narrower than 56 screen px (tech/13 §5.3). */
  transform: scale(max(1, calc(56 / (var(--fp) * var(--map-s, 1)))));
}
.map-city-badge {
  position: absolute;
  pointer-events: auto;
  display: block;
  width: 0;
  min-width: 0;
  min-height: 0;
  height: 0;
  background: transparent;
  border: none;
  padding: 0;
  border-radius: 0;
  font-family: '方正侠客体', '方正字迹-侠客体简', 'FZXiaKeTi-S-GB', var(--font-calligraphy, 'Kaiti SC', KaiTi, serif);
  font-size: 13px;
  font-weight: bold;
  color: #7a2214;
  cursor: pointer;
  box-shadow: none;
  text-shadow: 1px 1px 2px #fff, -1px -1px 2px #fff;
  white-space: nowrap;
  transition: none;
}
.city-icon {
  position: absolute;
  left: 0;
  top: 0;
  display: block;
  transform: translate(-50%, -50%);
  background: url('/img/ui_map_city.png') center / contain no-repeat;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.45));
}
.city-icon.atlas {
  background-repeat: no-repeat;
  filter: drop-shadow(0 1px 2px rgba(60, 45, 30, 0.35));
}
.city-icon.ruin { filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.45)) sepia(0.85) hue-rotate(65deg); }
.city-icon.atlas.ruin { filter: drop-shadow(0 1px 2px rgba(60, 45, 30, 0.35)); }
.city-name {
  position: absolute;
  left: 0;
  transform: translateX(-50%);
  line-height: 1.6;
  letter-spacing: 0;
}
.map-city-badge[data-tier='capital'] .city-name { letter-spacing: 1px; }
.map-city-badge.sect { color: #9e3b2f; }
.map-city-badge.quiet .city-icon { opacity: 0.55; }
.map-city-badge.no-label .city-name { display: none; }
.map-city-badge.no-label.hovered .city-name, .map-city-badge.no-label.selected .city-name { display: block; z-index: 1; }
.map-city-badge.ruin { color: #3b5045; }
.map-city-badge:hover, .map-city-badge.hovered { color: #b5382b; }
.map-city-badge.selected { color: #6d1c0e; text-shadow: 0 0 6px #ffd700, 1px 1px 0 #fff; }
.map-city-badge.selected .city-icon, .map-city-badge.hovered .city-icon {
  filter: drop-shadow(0 0 5px rgba(245, 158, 11, 0.8));
}
.map-hero { position: absolute; width: 0; height: 0; pointer-events: none; }
.map-hero-halo {
  position: absolute;
  left: -16px;
  top: -6px;
  width: 32px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid #cfab53;
  border-radius: 50%;
  background: rgba(235, 190, 80, 0.22);
  box-shadow: 0 0 8px #e8c768;
}
.map-hero-bob { position: absolute; bottom: 0; left: -24px; width: 48px; height: 64px; display: flex; justify-content: center; align-items: flex-end; }
.map-hero-bob img { display: block; height: 64px; width: auto; max-width: none; flex: none; }
.map-hero.facing-left img { scale: -1 1; }
.map-hero.walking .map-hero-bob { animation: hero-walk 0.6s ease-in-out infinite; }
@keyframes hero-walk { 50% { translate: 0 -2px; } }
.reduced-motion .map-destination, .reduced-motion .map-hero-bob { animation: none; }
@media (prefers-reduced-motion: reduce) {
  .map-destination, .map-hero.walking .map-hero-bob { animation: none; }
}
.worldmap-panel {
  position: absolute;
  right: 28px;
  top: 96px;
  width: 250px;
  max-height: calc(100vh - 180px);
  overflow-y: auto;
  z-index: 5;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: rgba(246, 240, 226, 0.94);
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.16);
  border: 1px solid rgba(138, 120, 95, 0.35);
  backdrop-filter: blur(4px);
  transition: max-height 0.25s ease, padding 0.25s ease;
}
.worldmap-panel.collapsed {
  max-height: 52px;
  padding: 8px 14px;
  overflow: hidden;
}
.worldmap-panel header {
  cursor: pointer;
  user-select: none;
}
.panel-header-titles {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.panel-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2px;
}
.collapse-toggle {
  background: transparent !important;
  border: none !important;
  font-size: 15px;
  color: #7a2214;
  cursor: pointer;
  padding: 0 4px;
  box-shadow: none !important;
  min-height: auto !important;
}
.panel-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 4px;
}
.idle-tip {
  font-size: 13px;
  color: #6a5a48;
  margin: 4px 0;
}
.worldmap-panel h2 {
  font: 26px/1.3 var(--title);
  letter-spacing: 3px;
  margin: 4px 0;
}
.worldmap-panel h4 {
  font-size: 18px;
  margin: 2px 0;
}
.worldmap-panel p {
  font-size: 14px;
  line-height: 1.6;
  margin: 3px 0;
}
.map-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}
.map-actions button {
  min-height: 36px;
  padding: 6px 14px;
  font-size: 14px;
}
@media (max-width: 768px) {
  .worldmap-panel {
    right: 12px;
    top: auto;
    bottom: calc(75px + env(safe-area-inset-bottom, 0px));
    width: min(280px, calc(100vw - 24px));
    max-height: 48vh;
    padding: 8px 12px;
  }
  .worldmap-panel h2 {
    font-size: 20px;
    margin: 2px 0;
  }
}
.map-legend {
  position: absolute;
  right: 28px;
  bottom: 138px;
  font-size: 13px;
  display: flex;
  gap: 12px;
  align-items: center;
  background: rgba(243, 234, 214, 0.85);
  padding: 4px 10px;
  border-radius: 4px;
  z-index: 5;
}
.map-legend i {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #375e62;
}
.map-legend i.ruin {
  background: #b5382b;
}
.map-view-controls {
  position: absolute;
  right: 28px;
  bottom: 90px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 5;
}
.locate-btn {
  background: rgba(243, 234, 214, 0.88);
  border: 1px solid rgba(138, 120, 95, 0.35);
  border-radius: 6px;
  padding: 5px 12px;
  font-size: 13px;
  color: #5c4738;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transition: background 0.15s, color 0.15s;
}
.locate-btn:hover {
  background: #fdfbf7;
  color: #7a2214;
}
.map-zoom {
  font-size: 13px;
  background: rgba(243, 234, 214, 0.88);
  padding: 5px 12px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(138, 120, 95, 0.25);
}
.map-zoom input[type="range"] {
  appearance: none;
  -webkit-appearance: none;
  width: 110px;
  height: 6px;
  background: rgba(120, 100, 75, 0.25);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
  margin: 0;
}
.map-zoom input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #7a2214;
  border: 2px solid #fdfbf7;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
  transition: transform 0.1s ease;
}
.map-zoom input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}
.map-error {
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(181, 56, 43, 0.9);
  color: #fff;
  padding: 6px 16px;
  border-radius: 4px;
  max-width: calc(100% - 24px);
  box-sizing: border-box;
  white-space: nowrap;
  font-size: 13px;
  z-index: 10;
}
</style>
