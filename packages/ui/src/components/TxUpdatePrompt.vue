<script setup lang="ts">
import { t } from '../i18n';
defineProps<{ phase: 'idle' | 'offlineReady' | 'needRefresh' | 'deltaSync' | 'ready' | 'activating';
  safeToActivate?: boolean; forced?: boolean; error?: string | null; remindAt?: number | null }>();
defineEmits<{ activate: []; later: []; forceUpdate: []; retry: [] }>();
</script>
<template>
  <section
    v-if="phase !== 'idle' && !(phase === 'needRefresh' && remindAt != null)"
    class="tx-update" role="status" aria-live="polite"
  >
    <span v-if="phase === 'offlineReady'">{{ t('offlineReady') }}</span>
    <span v-else-if="phase === 'needRefresh'">{{ t('updateFound') }}</span>
    <span v-else-if="phase === 'deltaSync'">{{ t('updateSyncing') }}</span>
    <span v-else-if="phase === 'activating'">{{ t('updateActivating') }}</span>
    <template v-else-if="phase === 'ready'">
      <span>{{ t('updateReady') }}</span>
      <button type="button" :disabled="safeToActivate === false" @click="$emit('activate')">{{ t('updateNow') }}</button>
      <button v-if="!forced" type="button" @click="$emit('later')">{{ t('updateLater') }}</button>
      <span v-if="safeToActivate === false">{{ t('updateUnsafe') }}</span>
    </template>
    <button v-if="phase === 'needRefresh' || error" type="button" :disabled="safeToActivate === false" @click="$emit('forceUpdate')">
      {{ t('forceUpdate') }}
    </button>
    <small v-if="error">{{ error }}</small>
    <button v-if="error && phase === 'deltaSync'" type="button" @click="$emit('retry')">{{ t('retryUpdate') }}</button>
  </section>
</template>
<style scoped>
.tx-update { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; padding: .5rem;
  border: 1px solid #806a47; background: #f4ead5; color: #2d2419; }
button { min-height: 44px; font: inherit; }
</style>
