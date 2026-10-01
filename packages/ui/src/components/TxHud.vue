<script setup lang="ts">
import type { HudView } from '../projections';
import { t } from '../i18n';
import TxResourceBar from './TxResourceBar.vue';
defineProps<{ hud: HudView }>();
</script>

<template>
  <header class="hud paper-panel">
    <div class="identity"><span class="seal" aria-hidden="true">侠</span><div><strong>{{ hud.name }}</strong><small v-if="hud.preview">{{ t('preview') }}</small></div></div>
    <TxResourceBar :label="t('hp')" :resource="hud.hp" tone="hp" />
    <TxResourceBar :label="t('mp')" :resource="hud.mp" tone="mp" />
    <TxResourceBar v-if="hud.action" :label="t('action')" :resource="hud.action" tone="action" />
    <div v-else class="action-rest"><span>{{ t('action') }}</span><small>{{ t('actionIdle') }}</small></div>
    <div class="journey-info"><strong>{{ hud.location }}</strong><span>{{ hud.date }}</span></div>
    <div class="wallet"><small>{{ t('money') }}</small><strong>{{ hud.money.toLocaleString('zh-CN') }} {{ t('wen') }}</strong></div>
  </header>
</template>

<style scoped>
.hud { display: grid; grid-template-columns: 180px repeat(3, minmax(110px, 1fr)) minmax(220px, 1.7fr) auto; gap: 24px; align-items: center; padding: 16px 22px; }
.identity { display: flex; gap: 12px; align-items: center; }
.seal { color: var(--paper); background: var(--vermilion); border: 2px solid var(--paper-silk); outline: 1px solid var(--vermilion); font: 24px var(--font-title); padding: 5px 7px; }
.identity div, .journey-info, .wallet, .action-rest { display: grid; gap: 4px; }
.journey-info, .wallet { text-align: right; }
@media (max-width: 1100px) { .hud { grid-template-columns: 150px repeat(2, minmax(140px, 1fr)) auto; gap: 12px; } .journey-info { grid-column: 1 / 4; text-align: left; display: flex; gap: 20px; } .wallet { grid-column: 4; grid-row: 1 / 3; } .action-rest, .resource.action { grid-column: 1 / 4; display: flex; gap: 16px; align-items: center; } }
@media (max-width: 640px) { .hud { grid-template-columns: 1fr 1fr; padding: 12px; } .identity { grid-column: 1; } .wallet { grid-column: 2; grid-row: 1; } .journey-info { grid-column: 1 / -1; display: grid; gap: 0; } .action-rest, .resource.action { grid-column: 1 / -1; } }
</style>
