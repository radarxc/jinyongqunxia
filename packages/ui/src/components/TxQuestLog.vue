<script setup lang="ts">
import type { QuestLogEntryView } from '../projections';
import { flowT } from '../i18n-flow';
defineProps<{ quests: readonly QuestLogEntryView[]; selectedId?: string | undefined }>();
defineEmits<{ select: [questId: string]; track: [questId: string] }>();
</script>
<template>
  <section class="tx-quest-log" aria-labelledby="quest-log-heading">
    <h2 id="quest-log-heading">{{ flowT('questLog') }}</h2>
    <ul><li v-for="quest in quests" :key="quest.id" :class="{ selected: selectedId === quest.id }"><button type="button" @click="$emit('select', quest.id)"><strong>{{ quest.name }}</strong><span>{{ quest.category }} · {{ quest.status }}</span><small>{{ quest.summary }}</small></button><button type="button" :aria-pressed="quest.tracked" @click="$emit('track', quest.id)">{{ quest.tracked ? flowT('untrack') : flowT('track') }}</button></li></ul>
    <p v-if="!quests.length">{{ flowT('noQuests') }}</p>
  </section>
</template>
<style scoped>
.tx-quest-log ul { display: grid; gap: .75rem; padding: 0; list-style: none; } li { display: grid; grid-template-columns: 1fr auto; border: 1px solid #9f8d6e; }
li.selected { border-color: #7b2724; } button { min-height: 44px; font: inherit; } li>button:first-child { display: grid; gap: .25rem; text-align: left; }
</style>
