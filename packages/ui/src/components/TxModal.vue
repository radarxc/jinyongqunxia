<script setup lang="ts">
/* global document, HTMLElement, KeyboardEvent */
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { t } from '../i18n';
defineProps<{ title: string }>();
const emit = defineEmits<{ close: [] }>();
const root = ref<HTMLElement>();
let previous: HTMLElement | null = null;
function keydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); emit('close'); }
  if (event.key !== 'Tab') return;
  const elements = root.value?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select, [tabindex="0"]');
  if (!elements?.length) { event.preventDefault(); return; }
  const first = elements[0]; const last = elements[elements.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
}
onMounted(async () => {
  previous = document.activeElement as HTMLElement | null; await nextTick();
  root.value?.querySelector<HTMLElement>('button')?.focus();
});
onBeforeUnmount(() => { previous?.focus(); });
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <section ref="root" class="modal paper-panel" role="dialog" aria-modal="true" :aria-label="title" @keydown="keydown">
      <header class="panel-heading"><h2>{{ title }}</h2><button type="button" @click="emit('close')">{{ t('close') }}</button></header>
      <slot />
    </section>
  </div>
</template>

<style scoped>
.modal-backdrop { position: fixed; inset: 0; z-index: 100; background: #1e1b1899; display: grid; place-items: center; padding: 20px; }
.modal { max-width: 540px; width: 100%; max-height: 90dvh; overflow: auto; padding: 20px; box-shadow: 0 20px 80px #0006; }
</style>
