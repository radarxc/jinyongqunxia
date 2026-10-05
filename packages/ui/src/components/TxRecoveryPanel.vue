<script setup lang="ts">
import { flowT } from '../i18n-flow';
defineProps<{ reason: string; autosaveLabel?: string | undefined; busy?: boolean | undefined;
  exportAvailable?: boolean | undefined }>();
defineEmits<{ export: []; restore: []; reload: [] }>();
</script>
<template>
  <main class="tx-recovery" aria-labelledby="recovery-heading">
    <section>
      <div class="tx-recovery__mark" aria-hidden="true">!</div>
      <h1 id="recovery-heading">{{ flowT('recoveryTitle') }}</h1>
      <p>{{ flowT('recoveryBody') }}</p><p class="reason">{{ reason }}</p>
      <p v-if="autosaveLabel" class="autosave">{{ flowT('recentAutosave') }}：{{ autosaveLabel }}</p>
      <p v-else class="autosave">{{ flowT('noAutosave') }}</p>
      <nav :aria-label="flowT('recoveryActions')">
        <button type="button" :disabled="busy || !exportAvailable" @click="$emit('export')">{{ flowT('exportSaves') }}</button>
        <button type="button" :disabled="busy || !autosaveLabel" @click="$emit('restore')">{{ flowT('restoreAutosave') }}</button>
        <button type="button" :disabled="busy" @click="$emit('reload')">{{ flowT('reload') }}</button>
      </nav><output role="status" aria-live="assertive"><slot name="status" /></output>
    </section>
  </main>
</template>
<style scoped>
.tx-recovery { min-height: 100dvh; display: grid; place-content: center; padding: 2rem; background: #efe4ca; color: #211c18; }
.tx-recovery section { width: min(36rem, 86vw); border: 1px solid #7b6a50; padding: 2rem; text-align: center; }
.tx-recovery__mark { margin: auto; width: 3rem; line-height: 3rem; border-radius: 50%; background: #7b2724; color: white; font-size: 2rem; }
.reason { font-weight: 700; } .autosave { color: #61594e; } nav { display: grid; gap: .75rem; }
button { min-height: 48px; font: inherit; } output { display: block; min-height: 1.5em; margin-top: 1rem; }
</style>
