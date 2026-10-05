<script setup lang="ts">
import { computed, ref } from 'vue';
import TxQuestLog from '@tianshu/ui/components/TxQuestLog.vue';
import type { QuestView } from '@tianshu/ui';
import type { GameController } from '../game-controller';
import { presentQuests } from '../flow/presentation';
const props = defineProps<{ controller: GameController; quests: readonly QuestView[] }>();
const selectedId = ref<string>();
const entries = computed(() => presentQuests(props.quests, props.controller.trackedQuestId.value));
</script>
<template><TxQuestLog :quests="entries" :selected-id="selectedId" @select="selectedId = $event" @track="controller.setTrackedQuest($event)" /></template>
