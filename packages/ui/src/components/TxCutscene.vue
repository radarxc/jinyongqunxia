<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { FlowCardView } from '../projections';
import { flowM1T } from '../i18n-flow';
const props = defineProps<{ title: string; frames: readonly FlowCardView[]; reducedMotion?: boolean; skippable?: boolean }>();
const emit = defineEmits<{ complete: []; skip: [] }>();
const index = ref(0);
watch(() => props.frames, () => { index.value = 0; });
const frame = computed(() => props.frames[index.value]);
function advance(): void {
  if (index.value < props.frames.length - 1) index.value += 1;
  else emit('complete');
}
</script>

<template>
  <section class="tx-cutscene paper-panel" data-testid="cutscene" :aria-label="title">
    <div class="tx-cutscene__image" :class="{ still: reducedMotion }" aria-hidden="true"><span>墨</span></div>
    <article v-if="frame" aria-live="polite"><small>{{ title }}</small><h1 data-testid="cutscene-title">{{ frame.title }}</h1><p data-testid="cutscene-text">{{ frame.body }}</p></article>
    <footer><button v-if="skippable" data-testid="cutscene-skip" type="button" @click="emit('skip')">{{ flowM1T('skipCutscene') }}</button><button data-testid="cutscene-next" type="button" @click="advance">{{ flowM1T('continueCutscene') }}</button></footer>
  </section>
</template>

<style scoped>
.tx-cutscene { display: grid; grid-template-columns: minmax(12rem, 1fr) minmax(18rem, 1fr); gap: 1.5rem; min-height: 22rem; padding: 1.5rem; }
.tx-cutscene__image { display: grid; place-items: center; min-height: 16rem; background: radial-gradient(circle, #e8dcc0, #4a4035); }
.tx-cutscene__image span { font: 6rem serif; opacity: .45; } article { align-self: center; } p { font-size: 1.1em; line-height: 1.8; }
footer { grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: .75rem; } button { min-height: 44px; font: inherit; }
@media (max-width: 640px) { .tx-cutscene { grid-template-columns: 1fr; } footer { grid-column: auto; } }
</style>
