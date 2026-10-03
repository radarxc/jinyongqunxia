<script setup lang="ts">
import { ref, watch } from 'vue';
import type { FlowChoiceView } from '../projections';
import { flowM1T } from '../i18n-flow';
const props = defineProps<{ title: string; lead: string; choices: readonly FlowChoiceView[]; busy?: boolean }>();
const emit = defineEmits<{ confirm: [choiceId: string] }>();
const selected = ref('');
watch(() => props.choices, () => { selected.value = ''; });
</script>

<template>
  <section class="tx-flow-choice paper-panel" data-testid="prologue-mode" aria-labelledby="flow-choice-heading">
    <header><h1 id="flow-choice-heading">{{ title }}</h1><p data-testid="flow-text">{{ lead }}</p></header>
    <div class="choice-list"><label v-for="choice in choices" :key="choice.id" :class="{ selected: selected === choice.id }" :data-testid="`mode-${choice.id}`"><input v-model="selected" type="radio" name="flow-choice" :value="choice.id"><strong>{{ choice.title }} · {{ choice.duration }}</strong><span>{{ choice.description }}</span><small>{{ choice.confirmation }}</small></label></div>
    <button data-testid="mode-confirm" type="button" :disabled="busy || !selected" @click="emit('confirm', selected)">{{ flowM1T('confirmChoice') }}</button>
  </section>
</template>

<style scoped>
.tx-flow-choice { display: grid; gap: 1rem; max-width: 56rem; margin: auto; padding: 1.5rem; }
h1, p { margin-top: 0; } .choice-list { display: grid; gap: .75rem; }
label { display: grid; grid-template-columns: auto 1fr; gap: .25rem .75rem; padding: 1rem; border: 1px solid #9f8d6e; }
label.selected { border-color: #7b2724; } label input { grid-row: 1 / 4; } label span, label small { grid-column: 2; }
button { justify-self: end; min-height: 44px; font: inherit; }
</style>
