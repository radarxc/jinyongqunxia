<script setup lang="ts">
import { computed } from 'vue';
import { t } from '../i18n';
const props = withDefaults(defineProps<{ chapter: string; bytes: number; verifiedBytes: number;
  state: 'not-downloaded' | 'downloading' | 'complete' | 'partial' | 'error';
  lastVerifiedAt?: number | null; etaSeconds?: number | null; canDownload?: boolean;
  iosInstallHint?: boolean; canRemove?: boolean; safeToUpdate?: boolean; error?: string | null }>(),
{ lastVerifiedAt: null, etaSeconds: null, canDownload: true, iosInstallHint: false,
  canRemove: true, safeToUpdate: true, error: null });
defineEmits<{ download: []; remove: []; forceUpdate: []; pause: [] }>();
const percent = computed(() => props.bytes <= 0 ? 0 : Math.min(100,
  Math.floor(props.verifiedBytes * 100 / props.bytes)));
const size = computed(() => `${(props.bytes / 1024 / 1024).toFixed(1)} MiB`);
</script>
<template>
  <section class="tx-download-panel" :aria-label="t('offlineDownloads')">
    <header><h3>{{ chapter }}</h3><span>{{ size }}</span></header>
    <progress :value="verifiedBytes" :max="Math.max(bytes, 1)">{{ percent }}%</progress>
    <output aria-live="polite">
      {{ t(`downloadState_${state}`) }} · {{ percent }}%
      <span v-if="etaSeconds != null"> · {{ etaSeconds }} {{ t('secondsRemaining') }}</span>
    </output>
    <p v-if="lastVerifiedAt">{{ t('lastVerified') }}：{{ new Date(lastVerifiedAt).toLocaleString('zh-CN') }}</p>
    <p v-if="iosInstallHint">{{ t('iosInstallHint') }}</p>
    <p v-if="error" role="alert">{{ error }}</p>
    <div class="actions">
      <button v-if="state === 'downloading'" type="button" @click="$emit('pause')">{{ t('pauseDownload') }}</button>
      <button v-else type="button" :disabled="canDownload === false" @click="$emit('download')">{{ t('downloadOffline') }}</button>
      <button type="button" :disabled="state === 'not-downloaded' || !canRemove" @click="$emit('remove')">{{ t('deleteDownload') }}</button>
      <button type="button" :disabled="!safeToUpdate" @click="$emit('forceUpdate')">{{ t('forceUpdate') }}</button>
    </div>
  </section>
</template>
<style scoped>
.tx-download-panel { display: grid; gap: .65rem; padding: 1rem; border: 1px solid #806a47; }
header,.actions { display: flex; align-items: center; justify-content: space-between; gap: .5rem; flex-wrap: wrap; }
h3 { margin: 0; } progress { width: 100%; } button { min-height: 44px; font: inherit; }
</style>
