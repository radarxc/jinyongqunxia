<script setup lang="ts">
import { computed } from 'vue';
import TxCutscene from '@tianshu/ui/components/TxCutscene.vue';
import type { GameController } from '../game-controller';
import { flowCardsFromCatalog, useChapterTextCatalog } from '../flow/content-text';
import { openingFallback } from '../flow/presentation';
const { controller } = defineProps<{ controller: GameController }>();
const catalog = useChapterTextCatalog('ch00_yuenv', controller.flowTextSource);
const frames = computed(() =>
  flowCardsFromCatalog(catalog.value, 'flow.ch00.opening', openingFallback),
);
function complete(): void {
  controller.setFlowStage('mode');
}
</script>
<template>
  <TxCutscene
    title="雨夜·无字残卷"
    :frames="frames"
    :reduced-motion="controller.settings.value.reducedMotion"
    skippable
    @complete="complete"
    @skip="complete"
  />
</template>
