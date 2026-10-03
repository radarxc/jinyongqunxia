<script setup lang="ts">
import TxTitleScreen from '@tianshu/ui/components/TxTitleScreen.vue';
defineProps<{ canContinue: boolean; continueSummary?: string | undefined; newGameAvailable: boolean;
  newGameReason?: string | undefined; busy?: boolean | undefined; demoAvailable?: boolean | undefined;
  status?: string | undefined }>();
defineEmits<{ continue: []; newGame: []; settings: []; demo: [] }>();
</script>
<template><TxTitleScreen v-bind="$props" @continue="$emit('continue')" @new-game="$emit('newGame')" @settings="$emit('settings')" @demo="$emit('demo')"><template #status>{{ status }}</template></TxTitleScreen></template>
