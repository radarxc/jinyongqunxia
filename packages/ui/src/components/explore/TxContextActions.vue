<script setup lang="ts">
import { computed } from 'vue';
import { TX_CONTEXT_ACTIONS_STRINGS as strings } from './TxContextActions.strings';

export interface ContextAction {
  readonly id: string; readonly verb: string; readonly label: string; readonly enabled: boolean;
  readonly reason: string; readonly hotkey: string;
}
const props = defineProps<{ readonly actions: readonly ContextAction[] }>();
const emit = defineEmits<{ act: [id: string] }>();
const visibleActions = computed(() => props.actions.slice(0, 3));
</script>

<template>
  <nav class="context-actions" :aria-label="strings.label">
    <div v-for="action in visibleActions" :key="action.id" class="action-entry">
      <button
        type="button" :disabled="!action.enabled" :aria-label="action.label"
        :aria-describedby="!action.enabled && action.reason ? `action-reason-${action.id}` : undefined"
        @click="emit('act', action.id)"
      >
        <span class="verb">{{ action.verb }}</span>
        <kbd v-if="action.hotkey">{{ action.hotkey }}</kbd>
      </button>
      <small v-if="!action.enabled" :id="`action-reason-${action.id}`" class="reason">
        {{ action.reason || strings.unavailable }}
      </small>
    </div>
  </nav>
</template>

<style scoped>
.context-actions { display: flex; justify-content: flex-end; align-items: flex-end; gap: 10px; }
.action-entry { display: grid; justify-items: end; gap: 4px; }
button { min-width: 112px; min-height: 44px; display: inline-flex; align-items: center; justify-content: center;
  gap: 12px; padding: 8px 14px; color: var(--ink-text); background: color-mix(in srgb, var(--paper) 90%, transparent);
  border: 0; border-radius: 24px 10px 24px 10px; box-shadow: 0 3px 10px color-mix(in srgb, var(--ink) 16%, transparent); }
button:hover:not(:disabled) { color: var(--vermilion); background: var(--paper-silk); }
.verb { font-family: var(--font-title); font-size: 18px; }
kbd { min-width: 24px; min-height: 24px; display: inline-grid; place-items: center; padding: 0 5px; font: 14px var(--font-body);
  color: var(--paper); background: var(--ink-medium); border-radius: 5px; box-shadow: inset 0 -2px color-mix(in srgb, var(--ink) 50%, transparent); }
.reason { max-width: 180px; color: var(--ink-medium); text-align: right; }
@media (any-pointer: coarse) { button { min-height: 60px; } }
</style>
