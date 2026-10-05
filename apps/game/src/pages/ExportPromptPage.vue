<script setup lang="ts">
import TxExportPrompt from '@tianshu/ui/components/TxExportPrompt.vue';
import type { GameController } from '../game-controller';
const { controller } = defineProps<{ controller: GameController }>();
async function exportSaves(): Promise<void> { await controller.saveAction('export', '*'); }
function next(): void { controller.setFlowStage('allocation'); }
</script>
<template><TxExportPrompt :busy="controller.busy.value" :available="controller.storageAvailable.value" :status="controller.notice.value || controller.saveStatus.value" @export="exportSaves" @continue="next" /></template>
