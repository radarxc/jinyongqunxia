<script setup lang="ts">
import { computed } from 'vue';
import TxDialoguePanel from '@tianshu/ui/components/TxDialoguePanel.vue';
import type { DialogueView } from '@tianshu/ui';
import type { GameController } from '../game-controller';
import { useChapterTextCatalog } from '../flow/content-text';
import { presentDialogue } from '../flow/presentation';
const { controller, dialogue } = defineProps<{
  controller: GameController;
  dialogue: DialogueView;
}>();
const catalog = useChapterTextCatalog(controller.chapterId, controller.flowTextSource);
const view = computed(() => presentDialogue(dialogue, catalog.value));
function choose(choiceId: string): void {
  void controller.dialogueChoose(Number(choiceId));
}
</script>
<template>
  <div class="dialogue-layer">
    <TxDialoguePanel
      :dialogue="view"
      :busy="controller.busy.value"
      :reduced-motion="controller.settings.value.reducedMotion"
      @choose="choose"
      @continue="controller.dialogueContinue"
    />
  </div>
</template>
<style scoped>
.dialogue-layer {
  position: fixed;
  z-index: 30;
  inset: auto max(1rem, env(safe-area-inset-right)) max(5rem, env(safe-area-inset-bottom))
    max(1rem, env(safe-area-inset-left));
  max-width: 64rem;
  margin: auto;
  box-shadow: 0 1rem 3rem #0008;
}
</style>
