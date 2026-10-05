<script setup lang="ts">
import { computed } from 'vue';
import TxSummaryCards from '@tianshu/ui/components/TxSummaryCards.vue';
import type { GameController } from '../game-controller';
import { flowCardsFromCatalog, useChapterTextCatalog } from '../flow/content-text';
import { summaryFallback } from '../flow/presentation';
import { prologueCompletion } from '../flow/stage';
const { controller } = defineProps<{ controller: GameController }>();
const catalog = useChapterTextCatalog('ch00_yuenv', controller.flowTextSource);
const cards = computed(() =>
  flowCardsFromCatalog(catalog.value, 'flow.ch00.summary', summaryFallback),
);
async function complete(): Promise<void> {
  if (await controller.settlePrologueMode('summary', prologueCompletion('summary')))
    controller.setFlowStage('export');
}
</script>
<template>
  <TxSummaryCards :cards="cards" :busy="controller.busy.value" @complete="complete" />
</template>
