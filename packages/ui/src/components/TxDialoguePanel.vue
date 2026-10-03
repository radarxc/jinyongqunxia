<script setup lang="ts">
import type { DialoguePanelView } from '../projections';
import { flowT } from '../i18n-flow';
defineProps<{ dialogue: DialoguePanelView; busy?: boolean }>();
defineEmits<{ choose: [choiceId: string]; continue: []; close: [] }>();
</script>
<template>
  <section class="tx-dialogue" role="dialog" aria-modal="true" :aria-label="dialogue.speaker">
    <header><h2>{{ dialogue.speaker }}</h2><button type="button" @click="$emit('close')">{{ flowT('close') }}</button></header>
    <p class="tx-dialogue__text">{{ dialogue.text }}</p>
    <ol v-if="dialogue.choices.length"><li v-for="choice in dialogue.choices" :key="choice.id"><button type="button" :disabled="busy || !!choice.disabledReason" :title="choice.disabledReason" @click="$emit('choose', choice.id)">{{ choice.label }}</button><small v-if="choice.disabledReason">{{ choice.disabledReason }}</small></li></ol>
    <button v-else-if="dialogue.canContinue" type="button" :disabled="busy" @click="$emit('continue')">{{ flowT('next') }}</button>
    <details v-if="dialogue.history.length"><summary>{{ flowT('dialogueHistory') }}</summary><p v-for="(line, index) in dialogue.history" :key="index"><strong>{{ line.speaker }}</strong>：{{ line.text }}</p></details>
  </section>
</template>
<style scoped>
.tx-dialogue { display: grid; gap: 1rem; padding: 1.25rem; background: #f4ead3; color: #201b17; }
header { display: flex; justify-content: space-between; } h2 { margin: 0; } .tx-dialogue__text { font-size: 1.1em; line-height: 1.8; }
ol { display: grid; gap: .5rem; padding: 0; list-style: none; } li { display: grid; } button { min-height: 44px; font: inherit; }
</style>
