<script setup lang="ts">
import { computed } from 'vue';
import TxCutscene from '@tianshu/ui/components/TxCutscene.vue';
import type { GameController } from '../game-controller';
import { flowCardsFromCatalog, useChapterTextCatalog } from '../flow/content-text';
import { skipBridgeFallback } from '../flow/presentation';
import { prologueCompletion } from '../flow/stage';
const { controller } = defineProps<{ controller: GameController }>();
const catalog = useChapterTextCatalog('ch00_yuenv', controller.flowTextSource);
const frames = computed(() =>
  flowCardsFromCatalog(catalog.value, 'flow.ch00.skipBridge', skipBridgeFallback),
);
async function complete(): Promise<void> {
  if (await controller.settlePrologueMode('skip', prologueCompletion('skip')))
    controller.setFlowStage('export');
}
</script>
<template>
  <TxCutscene
    title="不可略过的主线收束"
    :frames="frames"
    :reduced-motion="controller.settings.value.reducedMotion"
    @complete="complete"
  />
</template>
