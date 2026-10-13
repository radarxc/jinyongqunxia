<script setup lang="ts">
import { computed } from 'vue';
import TxDialoguePanel from '@tianshu/ui/components/TxDialoguePanel.vue';
import type { DialogueView } from '@tianshu/ui';
import type { GameController } from '../game-controller';
import { useChapterTextCatalog } from '../flow/content-text';
import { presentDialogue } from '../flow/presentation';
import { usePortrait } from '../runtime/portraits';
const { controller, dialogue } = defineProps<{
  controller: GameController;
  dialogue: DialogueView;
}>();
const catalog = useChapterTextCatalog(controller.chapterId, controller.flowTextSource);
const view = computed(() => presentDialogue(dialogue, catalog.value));
const portrait = usePortrait(() => dialogue.speakerId);
function choose(choiceId: string): void {
  void controller.dialogueChoose(Number(choiceId));
}
</script>
<template>
  <div class="dialogue-layer">
    <TxDialoguePanel
      :dialogue="view"
      :portrait="portrait"
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
  z-index: 35;
  left: 50%;
  transform: translateX(-50%);
  bottom: max(1.8rem, env(safe-area-inset-bottom));
  width: calc(100% - 3rem);
  max-width: 58rem;
  pointer-events: auto;
}
</style>
