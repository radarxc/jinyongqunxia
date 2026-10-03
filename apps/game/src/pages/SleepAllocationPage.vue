<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import TxSleepAllocation from '@tianshu/ui/components/TxSleepAllocation.vue';
import TxSleepConfirmation from '@tianshu/ui/components/TxSleepConfirmation.vue';
import type { SleepAllocationRulesView } from '@tianshu/ui';
import type { GameController } from '../game-controller';
import { changeAllocation, initialAllocation, presetAllocation, resetAllocation,
  type AllocationDraft } from '../flow/allocation';
const { controller } = defineProps<{ controller: GameController }>();
const draft = ref<AllocationDraft | null>(null);
watch(controller.firstSleepAllocation, (rules) => {
  if (rules && !draft.value) draft.value = initialAllocation(rules);
}, { immediate: true });
const rulesView = computed<SleepAllocationRulesView | null>(() => {
  const rules = controller.firstSleepAllocation.value;
  return rules ? { ...rules, balanced: rules.presets.balanced } : null;
});
function change(key: string, value: number): void {
  const rules = controller.firstSleepAllocation.value;
  if (rules && draft.value) draft.value = changeAllocation(rules, draft.value, key, value);
}
function reset(): void { const rules = controller.firstSleepAllocation.value; if (rules) draft.value = resetAllocation(rules); }
function preset(source: 'balanced' | 'default'): void { const rules = controller.firstSleepAllocation.value; if (rules) draft.value = presetAllocation(rules, source); }
async function confirm(): Promise<void> {
  if (!draft.value) return;
  if (await controller.commitFirstSleep(draft.value.values, draft.value.source))
    controller.setFlowStage('wake-cutscene');
}
function review(): void { controller.setFlowStage('allocation-confirm'); }
function back(): void { controller.setFlowStage('allocation'); }
</script>

<template>
  <TxSleepConfirmation v-if="controller.flowStage.value === 'allocation-confirm' && rulesView && draft" :allocation="draft.values" :keys="rulesView.keys" :source="draft.source" :busy="controller.busy.value" @back="back" @confirm="confirm" />
  <TxSleepAllocation v-else-if="rulesView && draft" :rules="rulesView" :allocation="draft.values" :source="draft.source" :busy="controller.busy.value" @change="change" @reset="reset" @balance="preset('balanced')" @default="preset('default')" @review="review" />
  <section v-else class="paper-panel reading-panel" data-testid="sleep-allocation-unavailable"><p>初眠规则尚未装载。</p></section>
</template>
