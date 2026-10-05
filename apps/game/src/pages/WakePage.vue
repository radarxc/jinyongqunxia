<script setup lang="ts">
import { computed } from 'vue';
import TxCutscene from '@tianshu/ui/components/TxCutscene.vue';
import type { GameController } from '../game-controller';
import { flowCardsFromCatalog, useChapterTextCatalog } from '../flow/content-text';
import { wakeFallback } from '../flow/presentation';
const { controller } = defineProps<{ controller: GameController }>();
const catalog = useChapterTextCatalog('ch10_baima', controller.flowTextSource);
const frames = computed(() => flowCardsFromCatalog(catalog.value, 'flow.ch10.wake', wakeFallback));
function complete(): void {
  controller.setFlowStage('baima-title');
}
</script>
<template>
  <TxCutscene
    title="长白山至西州"
    :frames="frames"
    :reduced-motion="controller.settings.value.reducedMotion"
    skippable
    @complete="complete"
    @skip="complete"
  />
</template>
