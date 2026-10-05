<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useUiStore } from '@tianshu/ui/runtime';
import TxCharacterCollection from '@tianshu/ui/components/TxCharacterCollection.vue';
const { projection } = storeToRefs(useUiStore());
</script>
<template><TxCharacterCollection :characters="projection.characters" /></template>
