<script setup lang="ts">
/* global HTMLCanvasElement, PointerEvent, ResizeObserver, cancelAnimationFrame, requestAnimationFrame, window */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import type { WorldMapProjection } from '@tianshu/core';
import type { MapNode } from '@tianshu/data/schemas';
import type { EquipmentVisuals, Dir8 } from '@tianshu/render/rig';
import type { WorldMapScene } from '@tianshu/render/worldmap';
import { useUiStore } from '@tianshu/ui/runtime';
import type { GameController } from '../game-controller';

const { controller } = defineProps<{ controller: GameController }>();
const emit = defineEmits<{ scene: [kind: 'town' | 'ruin'] }>();
const { projection } = storeToRefs(useUiStore());
const canvas = ref<HTMLCanvasElement>();
const hovered = ref<MapNode | null>(null);
const selectedId = ref('');
const zoom = ref(1);
const fastTravel = ref(false);
const renderError = ref('');
const fps = ref(0);
const drawCalls = ref(0); const cpuMs = ref(0);
let view: WorldMapScene | undefined;
let observer: ResizeObserver | undefined;
let disposed = false;
let frame = 0; let stepTimer = 0; let statsAt = 0; let previousPoint: readonly [number, number] | undefined;

const mapView = computed(() => controller.worldmap.value);
const mapStatic = computed(() => projection.value.worldmapStatic);
const openNodes = computed(() => mapStatic.value?.map.nodes.filter((node) => node.open) ?? []);
const selected = computed(() => openNodes.value.find((node) => node.id === selectedId.value) ?? hovered.value);
const selectedReachable = computed(() => !selected.value ||
  (mapView.value?.reachableNodeIds.includes(selected.value.id) ?? false));
const progress = computed(() => {
  const journey = mapView.value?.journey;
  return journey ? Math.floor(journey.travelledLi * 100 / Math.max(1, journey.totalLi)) : 0;
});
function equipment(): EquipmentVisuals {
  return Object.fromEntries(projection.value.equipment.flatMap((row) =>
    row.item ? [[row.slot, row.item.id]] : [])) as EquipmentVisuals;
}
function direction(from: readonly [number, number] | undefined, to: readonly [number, number]): Dir8 {
  if (!from) return 1;
  const dx = to[0] - from[0]; const dy = to[1] - from[1];
  if (Math.abs(dx) > Math.abs(dy) * 2) return dx >= 0 ? 2 : 6;
  if (Math.abs(dy) > Math.abs(dx) * 2) return dy >= 0 ? 0 : 4;
  return dx >= 0 ? (dy >= 0 ? 1 : 3) : (dy < 0 ? 5 : 7);
}
async function updateActor(next: WorldMapProjection): Promise<void> {
  const facing = direction(previousPoint, next.point); previousPoint = next.point;
  await view?.setActor({ point: next.point, walking: next.journey?.status === 'walking',
    direction: facing, equipment: equipment() });
  view?.setDestination(next.journey?.destination ?? (selectedId.value || null));
}
async function mountScene(): Promise<void> {
  const target = canvas.value; const state = mapView.value; const geometry = mapStatic.value;
  if (!target || !state || !geometry) return;
  try {
    const { createWorldMapScene } = await import('@tianshu/render/worldmap');
    if (disposed) return;
    const defaultMapTexture = '/assets/default/baseline/map/ref_map_jianghu__ch01_base01.png';
    const mapTextureUrl = geometry.mapTextureUrl
      ? (geometry.mapTextureUrl.startsWith('/') ? geometry.mapTextureUrl : `/${geometry.mapTextureUrl}`)
      : defaultMapTexture;
    const created = await createWorldMapScene(target, geometry.map, {
      actor: { point: state.point, walking: false, equipment: equipment() },
      mapTextureUrl, zoom: zoom.value,
    });
    if (disposed) { created.dispose(); return; }
    view = created;
    await updateActor(state);
    if (disposed) return;
    observer = new ResizeObserver(([entry]) => {
      if (entry) view?.resize(entry.contentRect.width, entry.contentRect.height, window.devicePixelRatio);
    });
    observer.observe(target); view.resize(target.clientWidth, target.clientHeight, window.devicePixelRatio);
    const animate = (time: number) => {
      if (!view) return; view.render(time);
      if (time - statsAt >= 500) {
        fps.value = view.stats.frameMs > 0 ? 1000 / view.stats.frameMs : 0;
        drawCalls.value = view.stats.drawCalls; cpuMs.value = view.stats.cpuMs; statsAt = time;
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
  } catch (error) {
    if (!disposed) renderError.value = error instanceof Error ? error.message : '地图渲染不可用';
  }
}
function pick(event: PointerEvent): void {
  const target = canvas.value; if (!target || !view) return;
  const node = view.pickNode(event.clientX, event.clientY, target.getBoundingClientRect()) as MapNode | null;
  hovered.value = node; if (event.type === 'click' && node) { selectedId.value = node.id; view.setDestination(node.id); }
}
async function travel(): Promise<void> {
  if (selectedId.value) await controller.worldMapCommand({ t: 'worldmap/travel', nodeId: selectedId.value });
}
function scheduleStep(state: WorldMapProjection): void {
  window.clearTimeout(stepTimer);
  const journey = state.journey; if (!journey || journey.status !== 'walking') return;
  const delay = controller.settings.value.reducedMotion
    ? 200
    : (fastTravel.value ? 12 : 45);
  stepTimer = window.setTimeout(() => {
    if (controller.busy.value) { scheduleStep(state); return; }
    void controller.worldMapCommand({ t: 'worldmap/step', journeyId: journey.id,
      expectedTravelledLi: journey.travelledLi });
  }, delay);
}
watch(mapView, (next) => {
  if (!next) return;
  void updateActor(next); scheduleStep(next);
  if (next.scene) emit('scene', next.scene.kind);
}, { deep: false, immediate: true });
watch(zoom, (next) => view?.setZoom(next));
onMounted(() => { void mountScene(); });
onBeforeUnmount(() => {
  disposed = true;
  window.clearTimeout(stepTimer); cancelAnimationFrame(frame); observer?.disconnect(); view?.dispose(); view = undefined;
});
</script>

<template>
  <section v-if="mapView && mapStatic" class="worldmap-page">
    <div class="worldmap-stage">
      <canvas
        ref="canvas" aria-label="江湖大地图"
        @pointermove="pick" @pointerleave="hovered = null" @click="pick"
      />
      <output v-if="renderError" class="map-error">{{ renderError }}</output>
      <div class="map-legend" aria-hidden="true"><i />城镇 <i class="ruin" />遗迹</div>
      <label class="map-zoom">缩放
        <input v-model.number="zoom" type="range" min="0.65" max="2.5" step="0.05">
      </label>
    </div>
    <aside class="worldmap-panel journey wash">
      <header>
        <span class="note-mark">行路笺</span>
        <small>{{ mapStatic.map.years[0] }}—{{ mapStatic.map.years[1] }} 年 · {{ mapStatic.map.eraBand }}</small>
        <h2>{{ selected ? selected.name : mapStatic.map.name }}</h2>
      </header>
      <template v-if="selected">
        <h4>{{ selected.name }}</h4>
        <p>{{ selected.kind === 'town' ? '城镇' : '野外遗迹' }} · {{ selected.regionId }}</p>
        <p>年代 {{ mapStatic.map.years[0] }}—{{ mapStatic.map.years[1] }} 年</p>
        <p>等级 {{ selected.levelRange ? `${selected.levelRange[0]}—${selected.levelRange[1]}` : '未配置' }}</p>
        <p>{{ selected.levelNote }}</p>
        <p v-if="!selectedReachable" role="status">尚无已登记道路可达此地。</p>
      </template>
      <p v-else>点选地图节点，查看年代与等级并启程。</p>
      <progress v-if="mapView.journey" :value="progress" max="100">{{ progress }}%</progress>
      <p v-if="mapView.journey">{{ mapView.journey.travelledLi }} / {{ mapView.journey.totalLi }} 里 · {{ progress }}%</p>
      <p v-if="mapView.lastMessage" role="status">{{ mapView.lastMessage }}</p>
      <div class="map-actions">
        <button
          v-if="!mapView.journey" type="button"
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
      <small data-testid="worldmap-stats" class="stats-line">
        节点 {{ openNodes.length }} · 路段 {{ mapStatic.map.roads.length }} ·
        {{ drawCalls }} draw · {{ fps.toFixed(0) }} fps · CPU {{ cpuMs.toFixed(2) }} ms
      </small>
    </aside>
  </section>
  <section v-else class="paper-panel reading-panel"><p>本章大地图尚未装载。</p></section>
</template>

<style scoped>
.worldmap-page {
  position: absolute;
  inset: 0;
  overflow: hidden;
}
.worldmap-stage {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.worldmap-stage canvas {
  width: 100%;
  height: 100%;
  display: block;
}
.worldmap-panel {
  position: absolute;
  right: 42px;
  top: 140px;
  width: 250px;
  max-height: calc(100vh - 250px);
  overflow-y: auto;
  z-index: 5;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.worldmap-panel h2 {
  font: 28px/1.3 var(--title);
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
.map-legend {
  position: absolute;
  left: 20px;
  bottom: 90px;
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
.map-zoom {
  position: absolute;
  right: 42px;
  bottom: 90px;
  font-size: 13px;
  background: rgba(243, 234, 214, 0.85);
  padding: 4px 10px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 5;
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
  z-index: 10;
}
.stats-line {
  margin-top: 6px;
  opacity: 0.6;
  font-size: 11px;
}
</style>
