<script setup lang="ts">
import TxChapterTitle from '@tianshu/ui/components/TxChapterTitle.vue';
import type { GameController } from '../game-controller';
const { controller } = defineProps<{ controller: GameController }>();
function complete(): void { controller.setFlowStage('game'); }
</script>
<template><TxChapterTitle v-if="controller.wakeYear.value !== null" :year="controller.wakeYear.value" location="西州以北" @continue="complete" /><p v-else class="paper-panel" data-testid="baima-year-unavailable">苏醒年代尚未装载。</p></template>
