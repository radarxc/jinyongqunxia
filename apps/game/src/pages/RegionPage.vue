<script setup lang="ts">
/* global document, Element, HTMLCanvasElement, HTMLElement, KeyboardEvent, PointerEvent, ResizeObserver,
  cancelAnimationFrame, requestAnimationFrame, window */
import { TICKS_PER_HOUR } from '@tianshu/core';
import type { EquipmentVisuals } from '@tianshu/render/rig';
import type { RegionDynamicView, RegionHexPoint, RegionScene } from '@tianshu/render/region';
import { flowT, t, useUiStore } from '@tianshu/ui/runtime';
import { storeToRefs } from 'pinia';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { GameController } from '../game-controller';
import type { GameProjection, GameUpdate } from '../runtime/contracts';
import { dispatchRegionCommand, mountRegionCommand, regionPointerCommand, requestedRegion,
  walkedRegionPath, type RegionInputCommand } from '../region/commands';
import { regionAnchorLabel, regionFacing, regionKeyboardTarget, regionReason } from '../region/presentation';
import { createRenderQuality, type RenderQualityController } from '../render-host';

const { controller } = defineProps<{ controller: GameController }>();
const emit = defineEmits<{ leave: [] }>();
const { projection } = storeToRefs(useUiStore());
const game = computed(() => projection.value as GameProjection);
const definition = computed(() => game.value.regionStatic);
const region = computed(() => game.value.region);
const canvas = ref<HTMLCanvasElement>(); const stage = ref<HTMLElement>();
const zoom = ref(1); const notice = ref(''); const contextState = ref<'ok' | 'lost' | 'failed'>('ok');
const loaded = ref(false); const recovering = ref(false); const canvasGeneration = ref(0);
const drawCalls = ref(0); const triangles = ref(0); const cpuMs = ref(0); const fps = ref(0);
const cameraYaw = ref(45); const cameraRotating = ref(false); const cameraAllow = ref(true);
let view: RegionScene | undefined; let quality: RenderQualityController | undefined;
let observer: ResizeObserver | undefined; let frame = 0; let framePending = false; let lastStats = 0;
let generation = 0; let previewGeneration = 0; let hoverKey = ''; let moving = false; let disposed = false;
let mountedSceneKey = ''; let pendingSceneKey = '';
const anchors = computed(() => region.value?.interactableAnchors ?? []);
const lockedDoors = computed(() => region.value?.doors.filter((door) => door.locked) ?? []);
function equipment(): EquipmentVisuals {
  return Object.fromEntries(game.value.equipment.flatMap((row) =>
    row.item ? [[row.slot, row.item.id]] : [])) as EquipmentVisuals;
}
function requestDraw(): void {
  if (disposed || framePending) return; framePending = true; frame = requestAnimationFrame(draw);
}
function draw(time: number): void {
  framePending = false; if (disposed) return; requestDraw();
  if (document.visibilityState === 'hidden' || !view) return;
  view.render(time, controller.settings.value.reducedMotion);
  cameraYaw.value = view.camera.yawDeg; cameraRotating.value = view.camera.rotating;
  cameraAllow.value = view.camera.allowRotation;
  if (time - lastStats >= 500) { lastStats = time; drawCalls.value = view.stats.drawCalls;
    triangles.value = view.stats.triangles; cpuMs.value = view.stats.cpuMs;
    fps.value = view.stats.frameMs > 0 ? 1_000 / view.stats.frameMs : 0; }
}
function resize(): void {
  if (!view || !stage.value) return;
  view.resize(stage.value.clientWidth, stage.value.clientHeight, window.devicePixelRatio);
}
function releaseScene(): void {
  if (framePending) cancelAnimationFrame(frame); framePending = false; observer?.disconnect(); observer = undefined;
  view?.dispose(); view = undefined; mountedSceneKey = ''; loaded.value = false;
}
async function mountScene(restoredYaw = 45): Promise<boolean> {
  const token = ++generation; const target = canvas.value; const staticView = definition.value;
  const dynamicView = region.value; if (!target || !staticView || !dynamicView) return false;
  const sceneKey = `${staticView.regionId}/${staticView.sceneId}`; pendingSceneKey = sceneKey;
  quality ??= await createRenderQuality(); if (disposed || token !== generation) return false;
  const module = await import('@tianshu/render/region'); if (disposed || token !== generation) return false;
  const created = await module.createRegionScene(target, staticView, { projection: dynamicView,
    playerEquipment: equipment(), quality, reducedMotion: controller.settings.value.reducedMotion,
    onContextStateChange: state => { if (token === generation) contextState.value = state; },
    onContextLoss: () => undefined, onContextRecreate: () => token === generation
      ? recreateScene() : Promise.resolve(false), requestFrame: requestDraw });
  if (disposed || token !== generation) { created.dispose(); return false; }
  view = created; mountedSceneKey = sceneKey; pendingSceneKey = '';
  view.setTimeOfDay((game.value.worldTick / TICKS_PER_HOUR) % 24);
  const steps = Math.round((restoredYaw - view.camera.yawDeg + 360) % 360 / 90);
  for (let index = 0; index < steps && view.camera.allowRotation; index += 1)
    void view.camera.rotate(1, true);
  loaded.value = true; contextState.value = view.contextState; resize();
  if (typeof ResizeObserver === 'function') { observer = new ResizeObserver(resize); observer.observe(stage.value!); }
  requestDraw(); return view.contextState === 'ok';
}
async function recreateScene(): Promise<boolean> {
  if (disposed || recovering.value) return false; recovering.value = true;
  try {
    const yaw = view?.camera.yawDeg ?? cameraYaw.value; generation += 1; releaseScene();
    canvasGeneration.value += 1; await nextTick(); if (disposed) return false;
    const success = await mountScene(yaw); if (disposed) return false;
    contextState.value = success ? 'ok' : 'failed'; return success;
  } finally { recovering.value = false; }
}
async function updateProjection(next: RegionDynamicView): Promise<void> {
  const target = view; const token = generation; if (!target) return;
  await target.update(next, equipment());
  if (disposed || token !== generation || view !== target) return;
  target.setTimeOfDay((game.value.worldTick / TICKS_PER_HOUR) % 24);
}
async function retry(low: boolean): Promise<void> {
  const current = quality ?? await createRenderQuality(); if (disposed) return;
  if (low) current.setTier('low'); await recreateScene(); if (disposed) return;
}
function updateNotice(update: GameUpdate | undefined): void {
  const events = update?.events ?? [];
  if (events.some((event) => event.t === 'world/autosaveRequested'))
    notice.value = flowT('regionAutosaved');
  else if (events.some((event) => event.t === 'world/safeAnchorReached'))
    notice.value = flowT('regionSafe');
}
async function followExit(update: GameUpdate | undefined): Promise<void> {
  const request = requestedRegion(update); if (!request) return; notice.value = flowT('regionTransition');
  const command = mountRegionCommand(request);
  if (!command) { notice.value = flowT('regionCoordinateExit'); return; }
  await dispatchRegionCommand(controller, command); if (disposed) return;
}
async function animateWalk(update: GameUpdate | undefined, before: RegionDynamicView): Promise<void> {
  const path = walkedRegionPath(update); if (!view || path.length < 2) return;
  for (let index = 1; index < path.length; index += 1) {
    if (disposed || !view) return; const from = path[index - 1]!; const to = path[index]!;
    view.setPlayerPose(to, regionFacing(from, to), 1.4);
    if (!controller.settings.value.reducedMotion)
      await new Promise<void>((resolve) => window.setTimeout(resolve, 90));
  }
  if (!disposed && view) await view.update(region.value ?? before, equipment());
}
async function command(value: RegionInputCommand): Promise<void> {
  if (controller.busy.value || moving || !region.value) return; const before = region.value;
  previewGeneration += 1; hoverKey = ''; view?.setPath([]);
  if (value.t === 'world/walkTo') moving = true;
  try {
    const update = await dispatchRegionCommand(controller, value); if (disposed) return;
    if (value.t === 'world/walkTo') await animateWalk(update, before); if (disposed) return;
    updateNotice(update); await followExit(update);
  } finally { moving = false; }
}
async function preview(point: RegionHexPoint): Promise<void> {
  const token = ++previewGeneration; const update = await dispatchRegionCommand(controller,
    { t: 'world/previewRegionPath', hex: point }); if (disposed || token !== previewGeneration) return;
  const result = update?.changes.regionPathPreview;
  view?.setPath(result?.ok ? result.preview.path : []);
  notice.value = result && !result.ok ? regionReason(result.reason) : '';
}
function pointer(event: PointerEvent, commit: boolean): void {
  if (!view || !canvas.value || contextState.value !== 'ok') return;
  const commandValue = regionPointerCommand(view, event.clientX, event.clientY,
    canvas.value.getBoundingClientRect(), commit);
  if (!commandValue) return;
  if (!commit && commandValue.t === 'world/previewRegionPath') {
    const point = commandValue.hex; const key = `${point.q},${point.r}`;
    if (key === hoverKey) return; hoverKey = key; void preview(point); return; }
  void command(commandValue);
}
function rotate(step: -1 | 1): void {
  if (!view || view.camera.rotating || !view.camera.allowRotation || contextState.value !== 'ok') return;
  void view.camera.rotate(step, controller.settings.value.reducedMotion); requestDraw();
}
function keyboard(event: KeyboardEvent): void {
  if (event.defaultPrevented || event.repeat || event.ctrlKey || event.metaKey || event.altKey ||
      (event.target instanceof Element && event.target.closest('input, button, [contenteditable=true]'))) return;
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (key === 'q' || key === 'e') { event.preventDefault(); rotate(key === 'q' ? -1 : 1); return; }
  const actor = region.value?.playerHex;
  const target = actor ? regionKeyboardTarget(actor, key, cameraYaw.value) : null;
  if (target) { event.preventDefault(); void command({ t: 'world/walkTo', hex: target }); }
}
watch([definition, region], ([nextDefinition, next]) => {
  if (!nextDefinition || !next || disposed) return;
  const nextKey = `${nextDefinition.regionId}/${nextDefinition.sceneId}`;
  if (nextKey !== mountedSceneKey && nextKey !== pendingSceneKey) { void recreateScene(); return; }
  if (!moving && nextKey === mountedSceneKey) void updateProjection(next);
}, { deep: false });
watch(zoom, (next) => view?.setZoom(next));
onMounted(async () => { window.addEventListener('keydown', keyboard); window.addEventListener('resize', resize);
  try { await mountScene(); } catch (error) { if (!disposed) { contextState.value = 'failed';
    notice.value = error instanceof Error ? error.message : t('error'); } } });
onBeforeUnmount(() => { disposed = true; generation += 1; previewGeneration += 1;
  window.removeEventListener('keydown', keyboard); window.removeEventListener('resize', resize); releaseScene(); });
</script>

<template>
  <section v-if="region && definition" class="region-page">
    <div ref="stage" class="region-stage">
      <canvas
        :key="canvasGeneration"
        ref="canvas"
        aria-label="区域六角地图"
        data-region-canvas
        @pointermove="pointer($event, false)"
        @pointerleave="hoverKey = ''"
        @click="pointer($event as PointerEvent, true)"
      />
      <p v-if="!loaded && contextState === 'ok'" class="region-overlay" data-region-loading>{{ flowT('regionLoading') }}</p>
      <section v-if="contextState !== 'ok'" class="region-overlay" role="status" aria-live="assertive" data-region-recovery>
        <p>{{ contextState === 'lost' ? t('renderRestoring') : t('renderRecoveryPreserved') }}</p>
        <button v-if="contextState === 'failed'" type="button" :disabled="recovering" @click="retry(false)">{{ t('renderReload') }}</button>
        <button v-if="contextState === 'failed'" type="button" :disabled="recovering" @click="retry(true)">{{ t('renderRetryLow') }}</button>
      </section>
      <nav class="region-camera" :aria-label="flowT('regionCamera')">
        <button type="button" :disabled="!loaded || !cameraAllow || cameraRotating" data-region-camera-left @click="rotate(-1)">{{ t('rotateCameraLeft') }} <kbd>Q</kbd></button>
        <button type="button" :disabled="!loaded || !cameraAllow || cameraRotating" data-region-camera-right @click="rotate(1)">{{ t('rotateCameraRight') }} <kbd>E</kbd></button>
      </nav>
      <label class="map-zoom">缩放 <input v-model.number="zoom" type="range" min="0.65" max="1.4" step="0.05"></label>
      <p class="region-help">{{ flowT('regionHelp') }}</p>
    </div>
    <aside class="region-panel paper-panel">
      <header><small>{{ region.regionId }}</small><h3>{{ projection.hud.location }}</h3></header>
      <p>格位 {{ region.playerHex.q }}, {{ region.playerHex.r }} · 视角 {{ cameraYaw.toFixed(0) }}°</p>
      <h4>{{ flowT('regionAnchors') }}</h4>
      <p v-if="!anchors.length">{{ flowT('regionNoAnchors') }}</p>
      <button
        v-for="anchor in anchors"
        :key="anchor.anchorId"
        type="button"
        :disabled="controller.busy.value || !anchor.enabled"
        :data-region-anchor="anchor.anchorId"
        @click="command({ t: 'world/interact', anchorId: anchor.anchorId })"
      >
        {{ regionAnchorLabel(anchor) }} · {{ anchor.anchorId }}<small v-if="anchor.reason"> {{ regionReason(anchor.reason) }}</small>
      </button>
      <h4 v-if="lockedDoors.length">{{ flowT('regionDoors') }}</h4>
      <p v-for="door in lockedDoors" :key="door.anchorId">{{ door.anchorId }} · {{ regionReason(door.reason) }}</p>
      <button
        v-if="controller.worldmap.value?.scene?.kind === 'ruin'"
        type="button"
        data-region-leave
        @click="emit('leave')"
      >
        {{ flowT('regionLeave') }}
      </button>
      <output role="status" aria-live="polite" data-region-notice>{{ notice }}</output>
      <small data-testid="region-stats" data-region-stats>{{ drawCalls }} draw · {{ triangles }} tri · {{ fps.toFixed(0) }} fps · CPU {{ cpuMs.toFixed(2) }} ms</small>
    </aside>
  </section>
  <section v-else class="paper-panel reading-panel"><p>{{ flowT('regionUnavailable') }}</p></section>
</template>

<style scoped>
.region-page{display:grid;grid-template-columns:minmax(0,1fr) minmax(230px,300px);gap:14px;min-height:360px}.region-stage{position:relative;min-width:0;overflow:hidden;border:1px solid var(--line);background:#d9ccb0}.region-stage canvas{width:100%;height:100%;display:block;cursor:crosshair}.region-panel{display:flex;flex-direction:column;gap:8px;padding:16px;overflow:auto}.region-panel h3,.region-panel h4,.region-panel p{margin:4px 0}.region-panel button{min-height:44px}.region-panel output{min-height:24px}.region-help,.region-camera,.region-overlay{position:absolute;margin:0;padding:6px 9px;background:#efe6d2e8}.region-help{left:10px;bottom:10px}.region-camera{display:flex;gap:6px;left:10px;top:10px}.region-overlay{inset:40% auto auto 50%;transform:translate(-50%,-50%);z-index:2}.region-overlay button{margin:4px}.region-stage .map-zoom{right:10px;bottom:10px}@media(max-width:780px),(orientation:portrait){.region-page{grid-template-columns:1fr}.region-stage{min-height:58vw}.region-panel{max-height:280px}}
</style>
