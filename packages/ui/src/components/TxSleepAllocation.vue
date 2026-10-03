<script setup lang="ts">
import { computed } from 'vue';
import type { SleepAllocationRulesView, SleepAllocationSourceView } from '../projections';
import { flowM1T } from '../i18n-flow';
const props = defineProps<{ rules: SleepAllocationRulesView; allocation: Readonly<Record<string, number>>; source: SleepAllocationSourceView; busy?: boolean }>();
const emit = defineEmits<{ change: [key: string, value: number]; reset: []; balance: []; default: []; review: [] }>();
const labels: Readonly<Record<string, string>> = { str: '臂力', con: '根骨', bre: '内息', wis: '悟性', agi: '身法', wil: '定力', luk: '福缘', cha: '魅力' };
const used = computed(() => props.rules.keys.reduce((sum, key) => sum + (props.allocation[key] ?? 0), 0));
const remaining = computed(() => props.rules.requiredTotal - used.value);
function step(key: string, delta: number): void {
  const current = props.allocation[key] ?? props.rules.base;
  emit('change', key, Math.min(props.rules.max, Math.max(props.rules.min, current + delta)));
}
function amount(key: string): number { return props.allocation[key] ?? props.rules.base; }
</script>

<template>
  <section class="tx-sleep-allocation paper-panel" data-testid="sleep-allocation" aria-labelledby="sleep-heading">
    <header><h1 id="sleep-heading">{{ flowM1T('allocationTitle') }}</h1><p data-testid="flow-text">{{ flowM1T('allocationLead') }}</p><strong data-testid="allocation-remaining">{{ flowM1T('remaining') }}：{{ remaining }}</strong></header>
    <div class="allocation-grid"><div v-for="key in rules.keys" :key="key" class="stepper" :data-testid="`allocation-${key}`"><span>{{ labels[key] ?? key }}</span><button type="button" :aria-label="`${labels[key] ?? key}减少`" :disabled="busy || amount(key) <= rules.min" @click="step(key, -1)">−</button><output>{{ amount(key) }}</output><button type="button" :aria-label="`${labels[key] ?? key}增加`" :disabled="busy || amount(key) >= rules.max || remaining <= 0" @click="step(key, 1)">＋</button><small>{{ rules.min }}–{{ rules.max }}</small></div></div>
    <div class="locked-list"><p v-for="key in rules.lockedKeys" :key="key" :data-testid="`allocation-${key}-locked`"><strong>{{ labels[key] ?? key }}</strong> · {{ flowM1T('locked') }}</p></div>
    <footer><button data-testid="allocation-reset" type="button" :disabled="busy" @click="emit('reset')">{{ flowM1T('reset') }}</button><button data-testid="allocation-balanced" type="button" :disabled="busy" @click="emit('balance')">{{ flowM1T('balance') }}</button><button data-testid="allocation-default" type="button" :disabled="busy" @click="emit('default')">{{ flowM1T('useDefault') }}</button><button data-testid="allocation-review" type="button" :disabled="busy || remaining !== 0" @click="emit('review')">{{ flowM1T('reviewAllocation') }}</button></footer>
  </section>
</template>

<style scoped>
.tx-sleep-allocation { display: grid; gap: 1rem; max-width: 60rem; margin: auto; padding: 1.5rem; }
.allocation-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); gap: .75rem; }
.stepper { display: grid; grid-template-columns: 1fr auto auto auto; align-items: center; gap: .5rem; padding: .75rem; border: 1px solid #9f8d6e; }
.stepper small { grid-column: 1 / -1; } button { min-width: 44px; min-height: 44px; font: inherit; }
.locked-list { display: flex; flex-wrap: wrap; gap: .75rem; } footer { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: .5rem; }
</style>
