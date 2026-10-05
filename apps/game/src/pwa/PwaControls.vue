<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { pwaController, isUpdateSafe } from '@tianshu/platform/pwa';
import { t } from '@tianshu/ui/runtime';
import TxOfflineBadge from '@tianshu/ui/components/TxOfflineBadge.vue';
import TxUpdatePrompt from '@tianshu/ui/components/TxUpdatePrompt.vue';
import TxDownloadPanel from '@tianshu/ui/components/TxDownloadPanel.vue';
import { downloadActive, downloadRows, loadDownloads, pauseDownloads, removeDownload, startDownload } from './downloads';
const props = defineProps<{ transactionComplete: boolean; inBattle: boolean; dialogueCommitting: boolean }>();
const pwa = ref(pwaController.snapshot()); const stop = pwaController.subscribe(value => { pwa.value = value; });
const safety = () => ({ localTransactionComplete: props.transactionComplete && !downloadActive.value,
  inBattle: props.inBattle, dialogueCommitting: props.dialogueCommitting });
pwaController.setSafetyProvider(safety);
const safe = computed(() => isUpdateSafe(safety()));
const controlled = ref(false); const panelOpen = ref(false); const loading = ref(false);
const status = ref('');
const iosHint = /iPad|iPhone|iPod/u.test(globalThis.navigator.userAgent) ||
  globalThis.navigator.platform === 'MacIntel' && globalThis.navigator.maxTouchPoints > 1;
const iosInstallHint = iosHint && !(globalThis.matchMedia?.('(display-mode: standalone)').matches);
const networkEnabled = computed(() => controlled.value && pwa.value.network.status === 'online' &&
  pwa.value.update.phase !== 'deltaSync' && pwa.value.update.phase !== 'activating');
const refreshControl = () => { controlled.value = !!globalThis.navigator.serviceWorker?.controller; };
const visibility = () => { if (globalThis.document.visibilityState === 'hidden') pauseDownloads(); };
watch(() => [props.inBattle, props.dialogueCommitting], ([battle, dialogue]) => {
  if (battle || dialogue) pauseDownloads();
});
async function toggleDownloads(): Promise<void> {
  panelOpen.value = !panelOpen.value;
  if (!panelOpen.value || !controlled.value) return;
  loading.value = true; status.value = '';
  try { await loadDownloads(); } catch { status.value = t('offlineLoadFailed'); }
  finally { loading.value = false; }
}
async function activate(): Promise<void> {
  if (!await pwaController.activate()) status.value = t('updateUnsafe');
}
async function force(): Promise<void> {
  if (!safe.value) return;
  try { await pwaController.forceUpdate(); } catch { status.value = t('offlineLoadFailed'); }
}
async function remove(chapter: string): Promise<void> {
  try { await removeDownload(chapter); } catch { status.value = t('offlineLoadFailed'); }
}
onMounted(() => {
  refreshControl(); globalThis.navigator.serviceWorker?.addEventListener('controllerchange', refreshControl);
  globalThis.document.addEventListener('visibilitychange', visibility);
});
onBeforeUnmount(() => {
  stop(); pwaController.setSafetyProvider(undefined); pauseDownloads();
  globalThis.navigator.serviceWorker?.removeEventListener('controllerchange', refreshControl);
  globalThis.document.removeEventListener('visibilitychange', visibility);
});
</script>
<template>
  <TxOfflineBadge :status="pwa.network.status" />
  <TxUpdatePrompt
    :phase="pwa.update.phase" :remind-at="pwa.update.remindAt" :safe-to-activate="safe"
    :error="pwa.update.error ? t('offlineLoadFailed') : null" @activate="activate"
    @later="pwaController.remindLater()" @retry="pwaController.retryUpdate()" @force-update="force"
  />
  <button type="button" :aria-expanded="panelOpen" @click="toggleDownloads">{{ t('offlineDownloads') }}</button>
  <section v-if="panelOpen" class="offline-drawer paper-panel" :aria-label="t('offlineDownloads')">
    <button type="button" @click="panelOpen = false">{{ t('close') }}</button>
    <p v-if="!controlled">{{ t('offlineUnsupported') }}</p>
    <p v-if="loading" role="status" aria-live="polite">{{ t('loading') }}</p>
    <output v-if="status" role="status" aria-live="polite">{{ status }}</output>
    <TxDownloadPanel
      v-for="row in controlled ? downloadRows : []" :key="row.chapter"
      :chapter="t('offlineChapter') + ' ' + row.chapter.slice(2, 4)"
      :data-chapter="row.chapter" :bytes="row.closure.totals.bytes" :verified-bytes="row.verifiedBytes"
      :state="row.state" :last-verified-at="row.lastVerifiedAt" :eta-seconds="row.etaSeconds"
      :can-download="networkEnabled && !downloadActive" :safe-to-update="safe"
      :ios-install-hint="iosInstallHint" :can-remove="!downloadActive"
      :error="row.error?.includes('QUOTA') ? t('offlineQuota') : row.error ? t('offlineLoadFailed') : null"
      @download="startDownload(row.chapter)" @remove="remove(row.chapter)" @pause="pauseDownloads"
      @force-update="force"
    />
  </section>
</template>
<style scoped>
.offline-drawer { position: fixed; z-index: 40; inset: 10% 8% 8%; overflow: auto; padding: 1rem;
  display: grid; gap: .75rem; }
button { min-height: 44px; font: inherit; }
</style>
