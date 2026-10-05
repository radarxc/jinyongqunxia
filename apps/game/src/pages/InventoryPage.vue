<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useUiStore } from '@tianshu/ui/runtime';
import TxInventory from '@tianshu/ui/components/TxInventory.vue';
defineProps<{ busy: boolean }>();
const { projection } = storeToRefs(useUiStore());
</script>
<template>
  <TxInventory :items="projection.inventory" :equipment="projection.equipment" :target-id="projection.characters.find(entry => entry.relation === 'self')?.key ?? ''" :busy="busy" />
</template>
