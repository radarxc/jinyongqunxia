<script setup lang="ts">
import { flowT } from '../i18n-flow';
defineProps<{
  canContinue: boolean; continueSummary?: string | undefined; newGameAvailable: boolean;
  newGameReason?: string | undefined; busy?: boolean | undefined; demoAvailable?: boolean | undefined;
}>();
defineEmits<{ continue: []; newGame: []; settings: []; demo: [] }>();
</script>

<template>
  <section class="tx-title" aria-labelledby="tx-title-heading">
    <div class="tx-title__seal" aria-hidden="true">侠</div>
    <p>{{ flowT('tagline') }}</p>
    <h1 id="tx-title-heading">{{ flowT('title') }}</h1>
    <nav :aria-label="flowT('titleMenu')">
      <button type="button" :disabled="busy || !canContinue" @click="$emit('continue')">{{ flowT('continue') }}</button>
      <small v-if="continueSummary">{{ continueSummary }}</small>
      <small v-else>{{ flowT('noSave') }}</small>
      <button type="button" :disabled="busy || !newGameAvailable" @click="$emit('newGame')">{{ flowT('newGame') }}</button>
      <small v-if="!newGameAvailable && newGameReason">{{ newGameReason }}</small>
      <button type="button" :disabled="busy" @click="$emit('settings')">{{ flowT('settings') }}</button>
      <button v-if="demoAvailable" type="button" :disabled="busy" @click="$emit('demo')">{{ flowT('demo') }}</button>
    </nav>
    <output role="status" aria-live="polite"><slot name="status" /></output>
  </section>
</template>

<style scoped>
.tx-title { min-height: 100dvh; display: grid; place-content: center; justify-items: center; gap: .75rem; padding: 2rem; text-align: center; }
.tx-title__seal { padding: .55rem .7rem; color: #f5ead1; background: #7b2724; font-size: 2rem; }
h1 { margin: 0; font-size: clamp(2rem, 7vw, 4.5rem); letter-spacing: .12em; }
p, small { color: #6b6257; } nav { display: grid; width: min(22rem, 82vw); gap: .5rem; }
button { min-height: 48px; border: 1px solid #806f55; background: #f5ead1; color: #201b17; font: inherit; cursor: pointer; }
button:disabled { cursor: not-allowed; opacity: .55; } output { min-height: 1.5em; }
</style>
