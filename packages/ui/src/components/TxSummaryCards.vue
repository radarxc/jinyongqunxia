<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { FlowCardView } from '../projections';
import { flowM1T } from '../i18n-flow';
const props = defineProps<{ cards: readonly FlowCardView[]; busy?: boolean }>();
const emit = defineEmits<{ complete: [] }>();
const index = ref(0);
watch(() => props.cards, () => { index.value = 0; });
const card = computed(() => props.cards[index.value]);
</script>

<template>
  <section class="tx-summary paper-panel" data-testid="summary-cards" aria-labelledby="summary-heading">
    <p class="counter" aria-live="polite">{{ cards.length ? index + 1 : 0 }} / {{ cards.length }}</p>
    <article v-if="card" :key="card.key"><h1 id="summary-heading" data-testid="summary-title">{{ card.title }}</h1><p data-testid="summary-text">{{ card.body }}</p></article>
    <p v-else data-testid="summary-empty">{{ flowM1T('contentUnavailable') }}</p>
    <footer><button data-testid="summary-previous" type="button" :disabled="index === 0" @click="index -= 1">{{ flowM1T('previous') }}</button><button v-if="index < cards.length - 1" data-testid="summary-next" type="button" @click="index += 1">{{ flowM1T('nextCard') }}</button><button v-else data-testid="summary-confirm" type="button" :disabled="busy || !cards.length" @click="emit('complete')">{{ flowM1T('finishCards') }}</button></footer>
  </section>
</template>

<style scoped>
.tx-summary { display: grid; gap: 1rem; max-width: 48rem; min-height: 24rem; margin: auto; padding: 2rem; }
.counter { text-align: right; } article { align-self: center; } article p { font-size: 1.1em; line-height: 1.9; }
footer { display: flex; justify-content: space-between; margin-top: auto; } button { min-height: 44px; font: inherit; }
</style>
