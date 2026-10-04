<script setup lang="ts">
/* global window, document, ResizeObserver, requestAnimationFrame, cancelAnimationFrame, PointerEvent, KeyboardEvent, Element, HTMLElement, HTMLCanvasElement, setTimeout, clearTimeout */
import { TICKS_PER_HOUR } from '@tianshu/core';
import { t } from '@tianshu/ui/runtime';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, triggerRef, watch } from 'vue';
import type { BattleCell, BattleRenderer, ScreenPoint } from '@tianshu/render/battle';
import type { BattleView } from '../contracts';
import type { BattleLogEntry } from '../controller';
import type { BattleController } from '../controller';
import { bindBattleVfx } from '../vfx';
import { createRenderQuality, reloadLatestRenderAutosave } from '../../render-host';
import { battleUnitLabelPosition } from '../unit-label';
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
const contextState = ref<'ok' | 'lost' | 'failed'>('ok');
const canvasGeneration = ref(0);
const recovering = ref(false);
const lossCount = ref(0);
const recoveryNotice = ref('');
let quality: Awaited<ReturnType<typeof createRenderQuality>> | undefined;
const restoreFailedText = computed(() => lossCount.value >= 3
  ? t('renderRestartBrowser') : t('renderRestoreFailed'));
const stats = ref('');
type ProjectedUnit = ScreenPoint & { q: number; r: number; height: number };
const positions = shallowRef<ReadonlyMap<string, ProjectedUnit>>(new Map());
const viewportWidth = ref(1280);
let renderer: BattleRenderer | undefined;
let resizeObserver: ResizeObserver | undefined;
type VfxStage = ReturnType<typeof import('@tianshu/render/vfx')['createBattleVfxStage']>;
let vfxStage: VfxStage | undefined;
let battleState: 'ok' | 'lost' | 'failed' = 'ok';
let effectsState: 'ok' | 'lost' | 'failed' = 'ok';
let resumeBattle = false;
let recovery: Promise<boolean> | undefined;
let offVfx: (() => void) | undefined;
let disposed = false;
let frame = 0;
let framePending = false;
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
    renderer.projectUnit(unit.id, unit.q, unit.r, unit.height, point);
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
  viewportWidth.value = root.value.clientWidth;
  renderer.resize(root.value.clientWidth, root.value.clientHeight, window.devicePixelRatio);
  project(true);
  vfxStage?.resize();
}
function draw(time: number): void {
  framePending = false;
  if (disposed) return;
  requestDraw();
  if (document.visibilityState === 'hidden') return;
  renderer?.render(time, props.reducedMotion || props.skip);
  if (renderer?.stats.modelMoving) project(true);
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
    stats.value = `${renderer.stats.drawCalls} draw · CPU ${renderer.stats.cpuMs.toFixed(2)} ms · ${renderer.stats.modelCharacters} 个 3D / ${renderer.stats.characters} 个 2D`;
  }
}
function requestDraw(): void {
  if (disposed || framePending) return;
  framePending = true;
  frame = requestAnimationFrame(draw);
}
function updateContextState(): void {
  if (disposed) return;
  const next = battleState === 'failed' || effectsState === 'failed'
    ? 'failed' : recovering.value || battleState === 'lost' || effectsState === 'lost' ? 'lost' : 'ok';
  if (contextState.value === 'ok' && next !== 'ok') {
    resumeBattle = props.controller.active.value;
    props.controller.setActive(false);
  }
  contextState.value = next;
  if (next === 'ok' && resumeBattle) { resumeBattle = false; props.controller.setActive(true); }
}
function recordLoss(): void { lossCount.value = Math.max(lossCount.value + 1, quality?.contextLosses7d ?? 0); }
async function reload(): Promise<void> {
  if (recovering.value) return;
  if (await reloadLatestRenderAutosave()) return;
  recoveryNotice.value = t('renderRetryCurrent');
  await recreateRenderers();
}
async function retryLow(): Promise<void> {
  if (recovering.value) return;
  const current = quality ?? await createRenderQuality();
  current.setTier('low');
  await recreateRenderers();
}
function rotateCamera(step: -1 | 1): void {
  if (!renderer || renderer.camera.rotating || contextState.value !== 'ok') return;
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
async function mountRenderers(rebuildEffects = false, yaw = 45): Promise<boolean> {
  const generation = canvasGeneration.value;
  try {
    const { createBattleRenderer } = await import('@tianshu/render/battle');
    if (disposed || generation !== canvasGeneration.value || !canvas.value || !quality) return false;
    const world = await createBattleRenderer(canvas.value, props.battle.info.cells, { quality,
      onContextStateChange: state => {
        if (generation !== canvasGeneration.value) return;
        battleState = state; updateContextState();
      },
      onContextLoss: recordLoss, onContextRecreate: recreateRenderers,
      requestFrame: requestDraw });
    if (disposed || generation !== canvasGeneration.value) {
      world.dispose();
      return false;
    }
    renderer = world;
    renderer.setTimeOfDay((props.battle.info.setup.entry.worldTick / TICKS_PER_HOUR) % 24);
    const steps = Math.round((yaw - 45 + 360) % 360 / 90);
    for (let step = 0; step < steps; step += 1) void renderer.camera.rotate(1, true);
    battleState = world.contextState;
    cameraYaw.value = renderer.camera.yawDeg;
    loaded.value = true;
    sync();
    resize();
    if (vfxCanvas.value) {
      const importStage = async () => {
        const module = await import('@tianshu/render/vfx');
        return { createBattleVfxStage: (target: HTMLCanvasElement): VfxStage => {
          const stage = module.createBattleVfxStage(target, { quality: quality!,
            onContextStateChange: state => {
              if (generation !== canvasGeneration.value) return;
              effectsState = state; updateContextState();
            }, onContextLoss: recordLoss, onContextRecreate: recreateRenderers,
            requestFrame: requestDraw });
          return stage;
        } };
      };
      const ready = (stage: VfxStage): void => {
        if (disposed || generation !== canvasGeneration.value) { stage.dispose(); return; }
        vfxStage = stage; effectsState = stage.contextState; updateContextState();
        stage.setProjector((q, r, height, out) => renderer?.project(q, r, height, out));
        stage.resize();
      };
      let restoredStage: VfxStage | undefined;
      if (rebuildEffects) {
        const module = await importStage();
        if (disposed || generation !== canvasGeneration.value) return false;
        restoredStage = module.createBattleVfxStage(vfxCanvas.value);
        ready(restoredStage);
      }
      offVfx = bindBattleVfx(props.controller, vfxCanvas.value, {
        importStage: async () => restoredStage
          ? { createBattleVfxStage: () => restoredStage! } : importStage(),
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
          // The bridge's public base type predates the supplied recoverable factory.
          ready(stage as VfxStage);
        },
      });
    }
    requestDraw();
    return renderer.contextState === 'ok' && (!vfxStage || vfxStage.contextState === 'ok');
  } catch {
    if (!disposed && generation === canvasGeneration.value) {
      failed.value = true; battleState = 'failed'; updateContextState();
    }
    return false;
  }
}
function releaseRenderers(): void {
  offVfx?.(); offVfx = undefined;
  vfxStage?.dispose(); vfxStage = undefined;
  renderer?.dispose(); renderer = undefined;
}
function recreateRenderers(): Promise<boolean> {
  if (disposed) return Promise.resolve(false);
  if (recovery) return recovery;
  recovery = (async () => {
    const yaw = renderer?.camera.yawDeg ?? cameraYaw.value;
    const rebuildEffects = vfxStage !== undefined;
    recovering.value = true; updateContextState();
    canvasGeneration.value += 1;
    releaseRenderers();
    if (!rebuildEffects) effectsState = 'ok';
    loaded.value = false; failed.value = false;
    floatingPending.value = false; floatingVisible.value = false;
    if (floatTimer) clearTimeout(floatTimer);
    await nextTick();
    if (disposed) return false;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const success = await Promise.race([mountRenderers(rebuildEffects, yaw), new Promise<boolean>(resolve => {
      timeout = setTimeout(() => { canvasGeneration.value += 1; resolve(false); }, 5_000);
    })]);
    if (timeout) clearTimeout(timeout);
    if (!success && !disposed) {
      releaseRenderers(); battleState = 'failed'; failed.value = true;
    }
    return success;
  })().finally(() => {
    recovering.value = false; recovery = undefined; updateContextState();
  });
  return recovery;
}
onMounted(async () => {
  window.addEventListener('keydown', keyboard);
  try {
    quality = await createRenderQuality();
    lossCount.value = quality.contextLosses7d;
    await mountRenderers();
    if (disposed) return;
    if (typeof ResizeObserver === 'function') {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(root.value!);
    }
    window.addEventListener('resize', resize);
  } catch {
    if (!disposed) { failed.value = true; battleState = 'failed'; updateContextState(); }
  }
});
onBeforeUnmount(() => {
  disposed = true;
  if (framePending) cancelAnimationFrame(frame);
  framePending = false;
  resizeObserver?.disconnect();
  window.removeEventListener('resize', resize);
  window.removeEventListener('keydown', keyboard);
  if (floatTimer) clearTimeout(floatTimer);
  releaseRenderers();
});
</script>

<template>
  <section class="battle-field-wrap" aria-label="六角战场">
    <div ref="root" class="battle-field">
      <canvas
        v-show="!failed"
        :key="'battle-' + canvasGeneration"
        ref="canvas"
        aria-label="六角地形与分层角色"
        @pointermove="pointer($event, false)"
        @click="pointer($event as PointerEvent, true)"
      />
      <canvas v-show="!failed" :key="'effects-' + canvasGeneration" ref="vfxCanvas" class="battle-vfx" aria-hidden="true" />
      <section v-if="contextState !== 'ok'" class="render-recovery" role="status" aria-live="assertive" :aria-busy="recovering">
        <h3>{{ contextState === 'lost' ? t('renderRestoring') : restoreFailedText }}</h3>
        <p v-if="contextState === 'failed'">{{ recoveryNotice || t('renderRecoveryPreserved') }}</p>
        <div v-if="contextState === 'failed'" class="action-row">
          <button type="button" :disabled="recovering" @click="reload">{{ t('renderReload') }}</button>
          <button type="button" :disabled="recovering" @click="retryLow">{{ t('renderRetryLow') }}</button>
        </div>
      </section>
      <nav class="battle-camera-controls" :aria-label="t('battleCamera')">
        <button
          type="button"
          :disabled="!loaded || cameraRotating || contextState !== 'ok'"
          data-camera-left
          @click="rotateCamera(-1)"
        >
          {{ t('rotateCameraLeft') }} <kbd>Q</kbd>
        </button>
        <button
          type="button"
          :disabled="!loaded || cameraRotating || contextState !== 'ok'"
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
          left: `${battleUnitLabelPosition(positions.get(unit.id)?.x ?? 0,
                                           positions.get(unit.id)?.y ?? 0, viewportWidth, unit.index).left}px`,
          top: `${battleUnitLabelPosition(positions.get(unit.id)?.x ?? 0,
                                          positions.get(unit.id)?.y ?? 0, viewportWidth, unit.index).top}px`,
          '--unit-label-width': `${battleUnitLabelPosition(0, 0, viewportWidth, unit.index).metrics.width}px`,
          '--unit-avatar-size': `${battleUnitLabelPosition(0, 0, viewportWidth, unit.index).metrics.avatar}px`,
          '--unit-name-font': `${battleUnitLabelPosition(0, 0, viewportWidth, unit.index).metrics.nameFont}px`,
          '--unit-aux-font': `${battleUnitLabelPosition(0, 0, viewportWidth, unit.index).metrics.auxiliaryFont}px`,
        }"
        @click="emit('select', unit.id)"
      >
        <span class="unit-avatar" aria-hidden="true">
          <img v-if="unit.portraitUrl" :src="'/' + unit.portraitUrl" alt="">
          <span v-else>{{ unit.name.slice(0, 1) }}</span>
        </span>
        <span class="unit-label-copy">
          <strong>{{ unit.name }}<span aria-label="朝向">{{ directionLabels[unit.facing] }}</span></strong>
          <span class="unit-meters">
            <meter
              :value="unit.hp" :max="unit.hpMax" min="0"
              :aria-label="`${unit.name} 气血 ${unit.hp}/${unit.hpMax}`"
            />
            <meter
              class="mp" :value="unit.mp" :max="unit.mpMax" min="0"
              :aria-label="`${unit.name} 内力 ${unit.mp}/${unit.mpMax}`"
            />
            <meter
              class="ct" :value="Math.max(0, Math.min(1000, unit.ct))" max="1000" min="0"
              :aria-label="`行动槽 ${unit.ct}`"
            />
          </span>
          <small>{{ unit.ct < 0 ? `收招 ${-unit.ct}` : `CT ${unit.ct}` }}</small>
        </span>
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
