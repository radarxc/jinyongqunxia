<script setup lang="ts" generic="T">
/* global window, HTMLElement, ResizeObserver, Event, KeyboardEvent */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
const props = withDefaults(defineProps<{
  items: readonly T[]; itemKey: (item: T) => string; label: string;
  rowHeight?: number; minWidth?: number; height?: number;
}>(), { rowHeight: 100, minWidth: 240, height: 420 });
const root = ref<HTMLElement>();
const width = ref(0);
const viewport = ref(props.height);
const scrollTop = ref(0);
const columns = computed(() => Math.max(1, Math.floor(width.value / props.minWidth)));
const rowCount = computed(() => Math.ceil(props.items.length / columns.value));
const firstRow = computed(() => Math.max(0, Math.floor(scrollTop.value / props.rowHeight) - 2));
const lastRow = computed(() => Math.min(rowCount.value, firstRow.value + Math.ceil(viewport.value / props.rowHeight) + 5));
const visible = computed(() => props.items.slice(firstRow.value * columns.value, lastRow.value * columns.value));
let observer: ResizeObserver | undefined;
function measure(): void {
  width.value = root.value?.clientWidth ?? 0;
  viewport.value = root.value?.clientHeight || props.height;
}
function scroll(event: Event): void { scrollTop.value = (event.currentTarget as HTMLElement).scrollTop; }
function reset(): void { if (root.value) root.value.scrollTop = 0; scrollTop.value = 0; }
watch(() => props.items, () => {
  const maximum = Math.max(0, rowCount.value * props.rowHeight - viewport.value);
  if (scrollTop.value > maximum) { scrollTop.value = maximum; if (root.value) root.value.scrollTop = maximum; }
});
async function keyboard(event: KeyboardEvent): Promise<void> {
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-virtual-index]');
  if (!target || !['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  const current = Number(target.dataset['virtualIndex']);
  const delta = { ArrowDown: columns.value, ArrowUp: -columns.value, ArrowLeft: -1, ArrowRight: 1 }[event.key] ?? 0;
  const index = Math.min(props.items.length - 1, Math.max(0, event.key === 'Home' ? 0 : event.key === 'End' ? props.items.length - 1 : current + delta));
  const y = Math.floor(index / columns.value) * props.rowHeight;
  if (root.value && (y < scrollTop.value || y + props.rowHeight > scrollTop.value + viewport.value)) {
    root.value.scrollTop = y; scrollTop.value = y;
  }
  event.preventDefault(); await nextTick();
  root.value?.querySelector<HTMLElement>(`[data-virtual-index="${index}"] button`)?.focus({ preventScroll: true });
}
onMounted(() => {
  measure();
  if (typeof ResizeObserver === 'function' && root.value) { observer = new ResizeObserver(measure); observer.observe(root.value); }
  window.addEventListener('resize', measure);
});
onBeforeUnmount(() => { observer?.disconnect(); window.removeEventListener('resize', measure); });
defineExpose({ reset });
</script>

<template>
  <div ref="root" class="virtual-list" role="list" :aria-label="label" :style="{ height: `${height}px` }" @scroll.passive="scroll" @keydown="keyboard">
    <div class="virtual-spacer" :style="{ height: `${rowCount * rowHeight}px` }">
      <div class="virtual-window" :style="{ transform: `translateY(${firstRow * rowHeight}px)`, gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }">
        <div v-for="(item, offset) in visible" :key="itemKey(item)" role="listitem" :aria-posinset="firstRow * columns + offset + 1" :aria-setsize="items.length" :data-virtual-index="firstRow * columns + offset" :style="{ height: `${rowHeight}px` }">
          <slot :item="item" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.virtual-list { overflow: auto; min-height: 140px; max-height: 100%; overscroll-behavior: contain; contain: strict; }
.virtual-spacer { position: relative; }
.virtual-window { position: absolute; inset: 0 0 auto; display: grid; }
.virtual-window > div { padding: 5px; min-width: 0; }
</style>
