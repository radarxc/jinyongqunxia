<script setup lang="ts">
import { computed } from 'vue';
import { t } from '../i18n';
const props = withDefaults(defineProps<{ status: 'online' | 'offline' | 'checking'; missingBytes?: number }>(),
  { missingBytes: 0 });
const text = computed(() => props.status === 'online' ? t('networkOnline')
  : props.status === 'checking' ? t('networkChecking')
  : props.missingBytes > 0 ? `${t('networkOffline')} · ${props.missingBytes} B ${t('offlineMissing')}`
  : t('networkOffline'));
</script>
<template>
  <output
    class="tx-offline-badge" role="status" aria-live="polite" :data-status="status"
  >
    {{ text }}
  </output>
</template>
<style scoped>
.tx-offline-badge { display: inline-flex; min-height: 2rem; align-items: center; padding: 0 .65rem;
  border: 1px solid currentcolor; border-radius: 999px; font-size: .85rem; }
.tx-offline-badge[data-status="offline"] { color: #b34d32; }
</style>
