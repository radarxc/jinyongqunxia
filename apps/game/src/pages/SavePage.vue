<script setup lang="ts">
import TxSaveSlots from '@tianshu/ui/components/TxSaveSlots.vue';
import type { GameController } from '../game-controller';
const { controller } = defineProps<{ controller: GameController }>();
const { slots, busy, storageAvailable, saveStatus } = controller;
</script>
<template>
  <TxSaveSlots
    :slots="slots" :busy="busy" :available="storageAvailable" :status="saveStatus"
    @save="controller.saveAction('save', $event)" @load="controller.saveAction('load', $event)"
    @remove="controller.saveAction('remove', $event)" @export="controller.saveAction('export', $event)" @import="controller.importFile"
  />
</template>
