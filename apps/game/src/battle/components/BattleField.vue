<script setup lang="ts">
/* global window, document, ResizeObserver, requestAnimationFrame, cancelAnimationFrame, PointerEvent, KeyboardEvent, Element, HTMLElement, HTMLCanvasElement, setTimeout, clearTimeout */
import { TICKS_PER_HOUR } from '@tianshu/core';
import { t } from '@tianshu/ui/runtime';
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, triggerRef, watch } from 'vue';
import type { BattleCell, BattleRenderer, ScreenPoint } from '@tianshu/render/battle';
import type { BattleView } from '../contracts';
import type { BattleLogEntry } from '../controller';
import type { BattleController } from '../controller';
import { bindBattleVfx } from '../vfx';
const props = defineProps<{
  controller: BattleController;
  battle: BattleView;
  selected: string | null;
  reducedMotion: boolean;
  floating: readonly BattleLogEntry[];
  skip: boolean;
}>();
const emit = defineEmits<{
  cell: [cell: BattleCell];
  hover: [cell: BattleCell];
  select: [id: string];
}>();
const root = ref<HTMLElement>();
const canvas = ref<HTMLCanvasElement>();
const vfxCanvas = ref<HTMLCanvasElement>();
const failed = ref(false);
const loaded = ref(false);
const stats = ref('');
type ProjectedUnit = ScreenPoint & { q: number; r: number; height: number };
const positions = shallowRef<ReadonlyMap<string, ProjectedUnit>>(new Map());
let renderer: BattleRenderer | undefined;
let resizeObserver: ResizeObserver | undefined;
let vfxStage: { resize(): void; render(time: number): void } | undefined;
let offVfx: (() => void) | undefined;
let disposed = false;
let frame = 0;
let lastStats = 0;
let hovered = '';
const floatingVisible = ref(true);
const floatingPending = ref(false);
const floatDuration = ref(600);
const floatCycle = ref(0);
const cameraYaw = ref(45);
const cameraRotating = ref(false);
let floatTimer: ReturnType<typeof setTimeout> | undefined;
const area = computed(
  () => new Set(props.battle.preview?.cells.map((cell) => `${cell.q},${cell.r}`) ?? []),
);
const directionLabels = ['东', '东北', '西北', '西', '西南', '东南'];
function project(force = false): void {
  if (!renderer) return;
  const next = positions.value as Map<string, ProjectedUnit>;
  for (const unit of props.battle.units) {
    const previous = next.get(unit.id);
    if (
      !force &&
      previous?.q === unit.q &&
      previous.r === unit.r &&
      previous.height === unit.height
    )
      continue;
    const point = previous ?? {
      x: 0,
      y: 0,
      visible: false,
      q: unit.q,
      r: unit.r,
      height: unit.height,
    };
    point.q = unit.q;
    point.r = unit.r;
    point.height = unit.height;
    renderer.project(unit.q, unit.r, unit.height, point);
    next.set(unit.id, point);
  }
  triggerRef(positions);
}
function highlights(): void {
  const actor = props.battle.units.find((unit) => unit.id === props.battle.actorId);
  const selected = props.battle.units.find((unit) => unit.id === props.selected);
  renderer?.setHighlights({
    selected: selected ? `${selected.q},${selected.r}` : null,
    ready: actor ? `${actor.q},${actor.r}` : null,
    reachable: [],
    area: [...area.value],
  });
}
function sync(): void {
  renderer?.updateUnits(props.battle.units);
  project();
  highlights();
}
function resize(): void {
  if (!root.value || !renderer) return;
  renderer.resize(root.value.clientWidth, root.value.clientHeight, window.devicePixelRatio);
  project(true);
  vfxStage?.resize();
}
function draw(time: number): void {
  if (disposed) return;
  frame = requestAnimationFrame(draw);
  if (document.visibilityState === 'hidden') return;
  renderer?.render(time, props.reducedMotion || props.skip);
  if (renderer) {
    const yaw = renderer.camera.yawDeg;
    cameraRotating.value = renderer.camera.rotating;
    if (yaw !== cameraYaw.value) {
      cameraYaw.value = yaw;
      project(true);
    }
  }
  vfxStage?.render(time);
  if (renderer && time - lastStats > 1000) {
    lastStats = time;
    stats.value = `${renderer.stats.drawCalls} draw · CPU ${renderer.stats.cpuMs.toFixed(2)} ms · ${renderer.stats.characters} 人`;
  }
}
function rotateCamera(step: -1 | 1): void {
  if (!renderer || renderer.camera.rotating) return;
  void renderer.camera.rotate(step, props.reducedMotion || props.skip);
  cameraYaw.value = renderer.camera.yawDeg;
  cameraRotating.value = true;
  project(true);
}
function keyboard(event: KeyboardEvent): void {
  if (
    event.defaultPrevented ||
    event.repeat ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    (event.target instanceof Element &&
      event.target.closest('input, textarea, select, [contenteditable=true], [role=dialog]'))
  )
    return;
  const key = event.key.toLowerCase();
  if (key === 'q' || key === 'e') {
    event.preventDefault();
    rotateCamera(key === 'q' ? -1 : 1);
  }
}
function pointer(event: PointerEvent, commit: boolean): void {
  if (!renderer || !canvas.value) return;
  const bounds = canvas.value.getBoundingClientRect();
  const cell = renderer.pick(event.clientX - bounds.left, event.clientY - bounds.top);
  if (!cell) return;
  const key = `${cell.q},${cell.r}`;
  if (commit) emit('cell', cell);
  else if (key !== hovered) {
    hovered = key;
    emit('hover', cell);
  }
}
watch(() => props.battle.units, sync);
watch(() => [props.battle.preview, props.selected], highlights);
watch(
  () => props.floating,
  () => {
    floatingVisible.value = !floatingPending.value;
    if (floatTimer) clearTimeout(floatTimer);
    if (floatingPending.value) return;
    floatTimer = setTimeout(
      () => {
        floatingVisible.value = false;
      },
      props.reducedMotion ? 1 : floatDuration.value,
    );
  },
);
onMounted(async () => {
  window.addEventListener('keydown', keyboard);
  try {
    const { createBattleRenderer } = await import('@tianshu/render/battle');
    if (disposed || !canvas.value) return;
    const world = await createBattleRenderer(canvas.value, props.battle.info.cells);
    if (disposed) {
      world.dispose();
      return;
    }
    renderer = world;
    renderer.setTimeOfDay((props.battle.info.setup.entry.worldTick / TICKS_PER_HOUR) % 24);
    cameraYaw.value = renderer.camera.yawDeg;
    loaded.value = true;
    sync();
    resize();
    if (vfxCanvas.value)
      offVfx = bindBattleVfx(props.controller, vfxCanvas.value, {
        reducedMotion: () => props.reducedMotion || props.skip,
        snapshotActor: (id) => renderer?.snapshot(id),
        onPending() {
          floatingPending.value = true;
          floatingVisible.value = false;
          if (floatTimer) clearTimeout(floatTimer);
        },
        onDuration(durationMs) {
          floatingPending.value = false;
          floatDuration.value = Math.max(1, durationMs);
          floatCycle.value += 1;
          floatingVisible.value = true;
          if (floatTimer) clearTimeout(floatTimer);
          floatTimer = setTimeout(
            () => {
              floatingVisible.value = false;
            },
            props.reducedMotion ? 1 : durationMs,
          );
        },
        onReady(stage) {
          vfxStage = stage;
          stage.setProjector((q, r, height, out) => renderer?.project(q, r, height, out));
          stage.resize();
        },
      });
    if (typeof ResizeObserver === 'function') {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(root.value!);
    }
    window.addEventListener('resize', resize);
    frame = requestAnimationFrame(draw);
  } catch {
    if (!disposed) failed.value = true;
  }
});
onBeforeUnmount(() => {
  disposed = true;
  cancelAnimationFrame(frame);
  resizeObserver?.disconnect();
  window.removeEventListener('resize', resize);
  window.removeEventListener('keydown', keyboard);
  if (floatTimer) clearTimeout(floatTimer);
  renderer?.dispose();
  offVfx?.();
  vfxStage = undefined;
});
</script>

<template>
  <section class="battle-field-wrap" aria-label="六角战场">
    <div ref="root" class="battle-field">
      <canvas
        v-show="!failed"
        ref="canvas"
        aria-label="六角地形与分层角色"
        @pointermove="pointer($event, false)"
        @click="pointer($event as PointerEvent, true)"
      />
      <canvas v-show="!failed" ref="vfxCanvas" class="battle-vfx" aria-hidden="true" />
      <nav class="battle-camera-controls" :aria-label="t('battleCamera')">
        <button
          type="button"
          :disabled="!loaded || cameraRotating"
          data-camera-left
          @click="rotateCamera(-1)"
        >
          {{ t('rotateCameraLeft') }} <kbd>Q</kbd>
        </button>
        <button
          type="button"
          :disabled="!loaded || cameraRotating"
          data-camera-right
          @click="rotateCamera(1)"
        >
          {{ t('rotateCameraRight') }} <kbd>E</kbd>
        </button>
      </nav>
      <p v-if="failed" class="field-notice">画面暂不可用，可在下方选择人物与落点继续战斗。</p>
      <p v-else-if="!loaded" class="field-notice">正在展开战场…</p>
      <button
        v-for="unit in battle.units"
        v-show="positions.get(unit.id)?.visible && loaded && unit.active"
        :key="unit.id"
        type="button"
        class="unit-label"
        :class="[
          unit.side,
          {
            selected: selected === unit.id,
            current: battle.actorId === unit.id,
            hit: area.has(`${unit.q},${unit.r}`),
          },
        ]"
        :style="{
          left: `${positions.get(unit.id)?.x ?? 0}px`,
          top: `${positions.get(unit.id)?.y ?? 0}px`,
        }"
        @click="emit('select', unit.id)"
      >
        <strong>
          {{ unit.name }}
          <span aria-label="朝向">{{ directionLabels[unit.facing] }}</span>
        </strong>
        <meter
          :value="unit.hp"
          :max="unit.hpMax"
          min="0"
          :aria-label="`${unit.name} 气血 ${unit.hp}/${unit.hpMax}`"
        />
        <meter
          class="mp"
          :value="unit.mp"
          :max="unit.mpMax"
          min="0"
          :aria-label="`${unit.name} 内力 ${unit.mp}/${unit.mpMax}`"
        />
        <meter
          class="ct"
          :value="Math.max(0, Math.min(1000, unit.ct))"
          max="1000"
          min="0"
          :aria-label="`行动槽 ${unit.ct}`"
        />
        <small>{{ unit.ct < 0 ? `收招 ${-unit.ct}` : `CT ${unit.ct}` }}</small>
        <span
          v-for="status in unit.statuses"
          :key="status.id"
          class="status-icon"
          :title="`${status.label} ${status.detail}`"
        >
          {{ status.label }}
        </span>
      </button>
      <div v-if="floatingVisible && !skip" class="battle-floats" aria-hidden="true">
        <span
          v-for="entry in floating"
          :key="`${entry.key}:${floatCycle}`"
          class="float-text"
          :class="{ still: reducedMotion }"
          :style="{
            left: `${positions.get(entry.event.target ?? entry.event.actor ?? '')?.x ?? 20}px`,
            top: `${(positions.get(entry.event.target ?? entry.event.actor ?? '')?.y ?? 120) - 110}px`,
            '--float-duration': `${floatDuration}ms`,
          }"
        >
          {{ entry.text }} {{ entry.event.amount ?? '' }}
        </span>
      </div>
      <details class="render-stats">
        <summary>画面统计</summary>
        {{ stats }}
      </details>
    </div>
    <details :open="failed" class="board-access">
      <summary>人物与落点列表（键盘 / 触屏）</summary>
      <div class="action-row">
        <button
          v-for="unit in battle.units"
          :key="unit.id"
          type="button"
          @click="emit('select', unit.id)"
        >
          {{ unit.name }} · 气血 {{ unit.hp }}/{{ unit.hpMax }} · 内力 {{ unit.mp }}/{{
            unit.mpMax
          }}
        </button>
      </div>
      <div class="cell-list">
        <button
          v-for="cell in battle.info.cells"
          :key="`${cell.q},${cell.r}`"
          type="button"
          :class="{ hit: area.has(`${cell.q},${cell.r}`) }"
          @focus="emit('hover', cell)"
          @click="emit('cell', cell)"
        >
          {{ cell.q }},{{ cell.r }} · {{ cell.label }} · 高 {{ cell.height }}
        </button>
      </div>
    </details>
  </section>
</template>
