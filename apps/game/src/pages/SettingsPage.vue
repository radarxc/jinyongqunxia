<script setup lang="ts">
import TxSettingsPanel from '@tianshu/ui/components/TxSettingsPanel.vue';
import type { GameSettingKey, GameSettings } from '../settings';
defineProps<{ settings: GameSettings; difficultyReadOnly?: boolean }>();
defineEmits<{ change: [key: GameSettingKey, value: unknown]; back: [] }>();
</script>
<template><TxSettingsPanel :model-value="settings" :difficulty-read-only="difficultyReadOnly" @change="(key, value) => $emit('change', key, value)" @back="$emit('back')" /></template>
