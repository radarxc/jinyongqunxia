<script setup lang="ts">
import TxRecoveryPanel from '@tianshu/ui/components/TxRecoveryPanel.vue';
defineProps<{ reason: string; autosaveLabel?: string | undefined; busy?: boolean | undefined;
  exportAvailable?: boolean | undefined; status?: string | undefined }>();
defineEmits<{ export: []; restore: []; reload: [] }>();
</script>
<template><TxRecoveryPanel v-bind="$props" @export="$emit('export')" @restore="$emit('restore')" @reload="$emit('reload')"><template #status>{{ status }}</template></TxRecoveryPanel></template>
