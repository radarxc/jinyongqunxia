<script setup lang="ts">
import type { QuestTrackerView } from '../projections';
import { flowT } from '../i18n-flow';
defineProps<{ quest: QuestTrackerView | null }>();
defineEmits<{ open: [questId: string] }>();
</script>
<template>
  <aside v-if="quest" class="tx-quest-tracker" data-testid="quest-tracker" :aria-label="flowT('trackedQuest')"><button type="button" @click="$emit('open', quest.questId)"><small>{{ flowT('trackedQuest') }}</small><strong data-testid="quest-tracker-name">{{ quest.name }}</strong><span data-testid="quest-tracker-objective">{{ quest.objective }}</span><progress v-if="quest.target !== undefined" :max="quest.target" :value="quest.current ?? 0" /></button></aside>
</template>
<style scoped>
.tx-quest-tracker { max-width: 22rem; } button { display: grid; width: 100%; min-height: 44px; gap: .2rem; padding: .75rem; text-align: left; font: inherit; } progress { width: 100%; }
</style>
