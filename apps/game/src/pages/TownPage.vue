<script setup lang="ts">
/* global Element, HTMLCanvasElement, KeyboardEvent, PointerEvent, ResizeObserver,
  cancelAnimationFrame, requestAnimationFrame, window */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import type { DomainEvent, TownCommand, TownPoint } from '@tianshu/core';
import { useUiStore } from '@tianshu/ui/runtime';
import type { TownAnchorView, TownScene, TownSceneProjection } from '@tianshu/render/town';
import type { GameController } from '../game-controller';
import type { GameUpdate } from '../runtime/contracts';
import { townAnchorIntent, townDirection, townStep } from './town-input';

const { controller } = defineProps<{ controller: GameController }>();
const { projection } = storeToRefs(useUiStore());
const emit = defineEmits<{ leave: [] }>();
const canvas = ref<HTMLCanvasElement>();
const zoom = ref(1);
const renderError = ref('');
const actionNotice = ref('');
const fps = ref(0);
const drawCalls = ref(0);
const triangles = ref(0);
const cpuMs = ref(0);
const moving = ref(false);
let view: TownScene | undefined;
let observer: ResizeObserver | undefined;
let frame = 0;
let statsAt = 0;
let fadeTimer = 0;
let moveTimer = 0;

const runtime = computed(() => controller.townRuntime.value);
const town = computed(() => controller.town.value);
const localAnchors = computed(() => town.value?.scene.anchors.filter((anchor) =>
  anchor.active !== false && samePoint(anchor.point, town.value!.scene.actor.point)) ?? []);
const inside = computed(() => town.value?.scene.buildingPhase === 'inside');
const canTrade = computed(() => {
  const definition = runtime.value; const state = town.value?.scene;
  if (!definition || !state?.activeBuildingId || state.buildingPhase !== 'inside') return false;
  return definition.buildings.some((building) => building.id === state.activeBuildingId &&
    building.interiorKind === 'shop' && building.businessRef !== null);
});
function samePoint(left: TownPoint, right: TownPoint): boolean {
  return left[0] === right[0] && left[1] === right[1];
}
function eventPayload(event: DomainEvent): Record<string, unknown> | undefined {
  if (!('payload' in event) || !event.payload || Array.isArray(event.payload) ||
      typeof event.payload !== 'object') return undefined;
  return event.payload as Record<string, unknown>;
}
function npcName(id: unknown): string {
  if (typeof id !== 'string') return '店内人物';
  return projection.value.characters.find((entry) => entry.key === id)?.name ?? '店内人物';
}
function shopName(): string {
  const id = controller.town.value?.scene.activeBuildingId;
  const building = controller.townRuntime.value?.buildings.find((entry) => entry.id === id);
  return building?.poi ?? ({ shop: '店铺', inn: '客栈', temple: '寺观',
    residence: '宅院', other: '建筑' }[building?.interiorKind ?? 'shop']);
}
function describeUpdate(update: GameUpdate | undefined): void {
  if (!update) return;
  for (const event of update.events) {
    const payload = eventPayload(event);
    if (event.t === 'town/shopRequested')
      actionNotice.value = `已请求打开${shopName()}`;
    else if (event.t === 'town/dialogueRequested')
      actionNotice.value = `已请求交谈：${npcName(payload?.['npcId'])}`;
    else if (event.t === 'progression/meditationInterrupted')
      actionNotice.value = '打坐遇袭，真气岔行，正在切入战斗。';
    else if (event.t === 'town/meditationCompleted') actionNotice.value = '一周天运转完毕。';
  }
}
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
    await new Promise<void>((resolve) => { moveTimer = window.setTimeout(resolve,
      controller.settings.value.reducedMotion ? 0 : 90); });
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
    }
    describeUpdate(update); }
  finally { moving.value = false; }
}
function useAnchor(anchor: TownAnchorView): void {
  const state = town.value;
  if (state) void command(townAnchorIntent(anchor, state.scene.actor.point));
}
function settleFade(next: TownSceneProjection): void {
  window.clearTimeout(fadeTimer);
  if (next.buildingPhase !== 'fading-in' && next.buildingPhase !== 'fading-out') return;
  fadeTimer = window.setTimeout(() => void command({ t: 'town/settle-building' }),
    controller.settings.value.reducedMotion ? 0 : 260);
}
async function mountScene(): Promise<void> {
  const target = canvas.value; const definition = runtime.value; const projection = town.value?.scene;
  if (!target || !definition || !projection) return;
  try {
    const { createTownScene } = await import('@tianshu/render/town');
    view = await createTownScene(target, definition, { projection, zoom: zoom.value });
    observer = new ResizeObserver(([entry]) => {
      if (entry) view?.resize(entry.contentRect.width, entry.contentRect.height, window.devicePixelRatio);
    });
    observer.observe(target);
    view.resize(target.clientWidth, target.clientHeight, window.devicePixelRatio);
    const animate = (time: number): void => {
      if (!view) return;
      view.render(time, controller.settings.value.reducedMotion);
      if (time - statsAt >= 500) {
        fps.value = view.stats.frameMs > 0 ? 1000 / view.stats.frameMs : 0;
        drawCalls.value = view.stats.drawCalls; triangles.value = view.stats.triangles;
        cpuMs.value = view.stats.cpuMs; statsAt = time;
      }
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
watch(zoom, (next) => view?.setZoom(next));
onMounted(() => { window.addEventListener('keydown', keyboard); void mountScene(); });
onBeforeUnmount(() => {
  window.removeEventListener('keydown', keyboard); window.clearTimeout(fadeTimer);
  window.clearTimeout(moveTimer);
  cancelAnimationFrame(frame); observer?.disconnect(); view?.dispose(); view = undefined;
});
</script>

<template>
  <section v-if="town && runtime" class="town-page">
    <div class="town-stage">
      <canvas ref="canvas" :aria-label="`${town.location}城镇地图`" @click="pointer" />
      <output v-if="renderError" class="map-error">{{ renderError }}</output>
      <label class="map-zoom">缩放
        <input v-model.number="zoom" type="range" min="0.65" max="2.5" step="0.05">
      </label>
      <p class="town-help">点击地面寻路 · 点击光标互动 · WASD / QE 移动</p>
    </div>
    <aside class="town-panel paper-panel">
      <header><small>{{ runtime.historicalYear }} 年 · {{ runtime.eraKit }}</small><h3>{{ town.location }}</h3></header>
      <p>格位 {{ town.scene.actor.point[0] }}, {{ town.scene.actor.point[1] }}</p>
      <p v-if="inside">建筑内部 · 外墙已半透明</p>
      <div class="town-actions">
        <button
          v-for="anchor in localAnchors" :key="anchor.id" type="button"
          :disabled="controller.busy.value" @click="useAnchor(anchor)"
        >
          {{ anchor.label }}
        </button>
        <button
          v-if="canTrade" type="button" :disabled="controller.busy.value"
          @click="command({ t: 'town/interact' })"
        >
          打开店铺
        </button>
        <button
          v-if="inside" type="button" :disabled="controller.busy.value"
          @click="command({ t: 'town/exit-building' })"
        >
          走出建筑
        </button>
        <button
          v-if="town.canLeave" type="button" :disabled="controller.busy.value"
          @click="emit('leave')"
        >
          返回大地图
        </button>
      </div>
      <output class="muted" role="status">{{ actionNotice }}</output>
      <small data-testid="town-stats">
        {{ drawCalls }} draw · {{ triangles }} tri · {{ fps.toFixed(0) }} fps · CPU {{ cpuMs.toFixed(2) }} ms
      </small>
    </aside>
  </section>
  <section v-else class="paper-panel reading-panel"><p>城镇运行时尚未装载。</p></section>
</template>
