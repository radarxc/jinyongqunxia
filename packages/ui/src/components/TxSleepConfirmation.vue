<script setup lang="ts">
import type { SleepAllocationSourceView } from '../projections';
import { flowM1T } from '../i18n-flow';
defineProps<{ allocation: Readonly<Record<string, number>>; keys: readonly string[]; source: SleepAllocationSourceView; busy?: boolean }>();
defineEmits<{ back: []; confirm: [] }>();
const labels: Readonly<Record<string, string>> = { str: '臂力', con: '根骨', bre: '内息', wis: '悟性', agi: '身法', wil: '定力' };
const sources: Readonly<Record<SleepAllocationSourceView, string>> = { manual: '手动配点', balanced: '一键均衡', default: '跳过默认' };
</script>

<template>
  <section class="tx-sleep-confirm paper-panel" data-testid="sleep-confirmation" role="dialog" aria-modal="true" aria-labelledby="sleep-confirm-heading">
    <h1 id="sleep-confirm-heading">{{ flowM1T('allocationConfirmTitle') }}</h1><p data-testid="flow-text">{{ flowM1T('allocationConfirmBody') }}</p>
    <dl><div v-for="key in keys" :key="key"><dt>{{ labels[key] ?? key }}</dt><dd>{{ allocation[key] }}</dd></div></dl><p>来源：{{ sources[source] }}</p>
    <footer><button data-testid="allocation-back" type="button" :disabled="busy" @click="$emit('back')">{{ flowM1T('cancel') }}</button><button data-testid="allocation-confirm" type="button" :disabled="busy" @click="$emit('confirm')">{{ flowM1T('confirmAllocation') }}</button></footer>
  </section>
</template>

<style scoped>
.tx-sleep-confirm { display: grid; gap: 1rem; max-width: 40rem; margin: auto; padding: 1.5rem; }
dl { display: grid; grid-template-columns: repeat(3, 1fr); gap: .5rem; } dl div { padding: .75rem; border: 1px solid #9f8d6e; text-align: center; }
dt { font-weight: 700; } dd { margin: .25rem 0 0; } footer { display: flex; justify-content: flex-end; gap: .75rem; } button { min-height: 44px; font: inherit; }
</style>
