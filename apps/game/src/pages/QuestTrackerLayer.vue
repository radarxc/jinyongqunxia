<script setup lang="ts">
import { computed } from 'vue';
import TxQuestTracker from '@tianshu/ui/components/TxQuestTracker.vue';
import type { QuestView } from '@tianshu/ui';
import type { GameController } from '../game-controller';
import { presentQuests, presentTracker } from '../flow/presentation';
const props = defineProps<{ controller: GameController; quests: readonly QuestView[] }>();
const tracker = computed(() => {
  const quests = presentQuests(props.quests, props.controller.trackedQuestId.value);
  return presentTracker(quests, props.controller.trackedQuestId.value);
});
defineEmits<{ open: [questId: string] }>();
</script>
<template><TxQuestTracker :quest="tracker" @open="$emit('open', $event)" /></template>
