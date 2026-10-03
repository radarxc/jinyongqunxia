<script setup lang="ts">
import { flowM1T } from '../i18n-flow';
defineProps<{ busy?: boolean; available?: boolean; status?: string }>();
defineEmits<{ export: []; continue: [] }>();
</script>

<template>
  <section class="tx-export-prompt paper-panel" data-testid="export-prompt" aria-labelledby="export-prompt-heading">
    <h1 id="export-prompt-heading">{{ flowM1T('exportTitle') }}</h1><p data-testid="flow-text">{{ flowM1T('exportBody') }}</p>
    <output v-if="status" role="status">{{ status }}</output>
    <footer><button data-testid="export-now" type="button" :disabled="busy || !available" @click="$emit('export')">{{ flowM1T('exportNow') }}</button><button data-testid="export-later" type="button" :disabled="busy" @click="$emit('continue')">{{ flowM1T('exportLater') }}</button></footer>
  </section>
</template>

<style scoped>
.tx-export-prompt { display: grid; gap: 1rem; max-width: 42rem; margin: auto; padding: 1.5rem; }
footer { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: .75rem; } button { min-height: 44px; font: inherit; }
</style>
