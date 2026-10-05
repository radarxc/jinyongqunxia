<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { battleItemChoice, battleMovePlan, battleQiSummary, battleRouteChoice,
  battleReason, battleTargetChoice, battleTargetPreview, t } from '@tianshu/ui/runtime';
import type { AreaPreview, BattleCapabilities, BattleControllerCommand, BattleUnitView } from '../contracts';
const props = defineProps<{ actor: BattleUnitView | null; revision: number; busy: boolean; automatic: boolean;
  capabilities: BattleCapabilities; preview: AreaPreview | null; selectedMove: string | null;
  concedeAllowed: boolean; demonstrationReplayId: string | null;
  subdueActorId: string | null; subdueTargets: readonly BattleUnitView[] }>();
const emit = defineEmits<{ command: [command: BattleControllerCommand];
  move: [moveId: string]; hover: [moveId: string] }>();
const itemOpen = ref(false); const routeOpen = ref(false);
const selectedItem = ref(''); const selectedTarget = ref(''); const selectedRoute = ref('');
const waitPending = ref(false); const defendPending = ref(false);
const draftedDestination = computed(() => props.capabilities.move.selected);
const groups = computed(() => {
  const result = new Map<string, { name: string; moves: BattleUnitView['moves'][number][] }>();
  for (const move of props.actor?.moves ?? []) {
    const group = result.get(move.skillId) ?? { name: move.skillName, moves: [] };
    group.moves.push(move); result.set(move.skillId, group);
  }
  return [...result.entries()];
});
const disabled = computed(() => props.busy || props.automatic || props.actor?.control !== 'player');
const walkTo = computed(() => draftedDestination.value && draftedDestination.value.cost > 0
  ? { q: draftedDestination.value.q, r: draftedDestination.value.r } : undefined);
const waitCapability = computed(() => props.capabilities.wait);
const defendCapability = computed(() => props.capabilities.defend);
const items = computed(() => props.capabilities.items ?? []);
const routes = computed(() => props.capabilities.routes ?? []);
const item = computed(() => items.value.find(row => row.id === selectedItem.value));
const target = computed(() => item.value?.targets.find(row => row.id === selectedTarget.value));
const itemPlan = computed(() => target.value?.capability);
const route = computed(() => routes.value.find(row => row.routeId === selectedRoute.value));
const movementText = computed(() => draftedDestination.value == null ? '' : battleMovePlan(
  draftedDestination.value.cost, draftedDestination.value.path.length - 1, draftedDestination.value.dangerCount));
watch(() => props.revision, () => { itemOpen.value = false; routeOpen.value = false; waitPending.value = false;
  defendPending.value = false;
  selectedItem.value = ''; selectedTarget.value = ''; selectedRoute.value = ''; });
watch(item, value => {
  if (value && !value.targets.some(row => row.id === selectedTarget.value && row.capability.enabled))
    selectedTarget.value = value.targets.find(row => row.capability.enabled)?.id ?? '';
});
function withMove<T extends object>(base: T): T & { readonly walkTo?: { readonly q: number; readonly r: number } } {
  return walkTo.value === undefined ? base : { ...base, walkTo: walkTo.value };
}
function submitWait(): void {
  if (!props.actor || !waitCapability.value.enabled) return;
  emit('command', withMove({ t: 'battle/wait' as const, actor: props.actor.id, revision: props.revision }));
}
function wait(): void {
  if (!props.actor || !waitCapability.value.enabled) return;
  defendPending.value = false;
  if (walkTo.value === undefined) { submitWait(); return; }
  waitPending.value = true; itemOpen.value = false; routeOpen.value = false;
  emit('command', { t: 'battle/movement-mode', enabled: false });
}
function submitDefend(): void {
  if (!props.actor || !defendCapability.value.enabled) return;
  emit('command', withMove({ t: 'battle/defend' as const, actor: props.actor.id, revision: props.revision }));
}
function defend(): void {
  if (!props.actor || !defendCapability.value.enabled) return;
  defendPending.value = true; waitPending.value = false; itemOpen.value = false; routeOpen.value = false;
  emit('command', { t: 'battle/movement-mode', enabled: false });
}
function useItem(): void {
  const selected = target.value;
  if (!props.actor || !item.value || !selected || !itemPlan.value?.enabled) return;
  emit('command', withMove({ t: 'battle/item' as const, actor: props.actor.id,
    itemId: item.value.id, targetId: selected.id, revision: props.revision }));
}
function gather(): void {
  if (!props.actor || !route.value?.capability.enabled) return;
  emit('command', { t: 'battle/gather' as const, actor: props.actor.id,
    routeId: route.value.routeId, revision: props.revision });
}
function beginMovement(): void { itemOpen.value = false; routeOpen.value = false; waitPending.value = false;
  defendPending.value = false;
  emit('command', { t: 'battle/movement-mode', enabled: true }); }
function chooseMove(moveId: string): void { itemOpen.value = false; routeOpen.value = false; waitPending.value = false;
  defendPending.value = false;
  emit('command', { t: 'battle/movement-mode', enabled: false });
  emit('move', moveId); }
function openItems(): void { itemOpen.value = !itemOpen.value; routeOpen.value = false; waitPending.value = false;
  defendPending.value = false;
  if (itemOpen.value) emit('command', { t: 'battle/movement-mode', enabled: false }); }
function openRoutes(): void { routeOpen.value = !routeOpen.value; itemOpen.value = false; waitPending.value = false;
  defendPending.value = false;
  if (routeOpen.value) emit('command', { t: 'battle/movement-mode', enabled: false }); }
function confirm(): void {
  if (waitPending.value) { waitPending.value = false; submitWait(); return; }
  if (defendPending.value) { defendPending.value = false; submitDefend(); return; }
  if (props.preview) emit('command', { t: 'battle/act-at', preview: props.preview });
}
function cancel(): void { itemOpen.value = false; routeOpen.value = false; waitPending.value = false;
  defendPending.value = false; selectedItem.value = '';
  selectedTarget.value = ''; selectedRoute.value = '';
  emit('command', { t: 'battle/cancel-plan', revision: props.revision });
}
</script>

<template>
  <section class="battle-actions paper-panel" aria-label="行动菜单">
    <header><h3>{{ actor?.name ?? '等待行动' }}</h3><span>{{ actor?.control === 'ai' ? '对方行动中' : '选择行动' }}</span></header>
    <p v-if="draftedDestination" class="plan-summary" role="status">{{ movementText }}<br>{{ t('battleMoveReady') }}</p>
    <div class="action-row">
      <button type="button" data-movement :aria-pressed="!!draftedDestination" :disabled="disabled || !capabilities.move.enabled" :title="capabilities.move.reason" @click="beginMovement">{{ t('battleMove') }}</button>
      <button type="button" data-item :aria-pressed="itemOpen" :disabled="disabled || !capabilities.item.enabled" :title="capabilities.item.reason" @click="openItems">{{ t('battleItem') }}</button>
      <button type="button" data-defend :aria-pressed="defendPending" :disabled="disabled || !defendCapability.enabled" :title="defendCapability.reason" @click="defend">{{ t('battleDefend') }}</button>
      <button type="button" data-wait :aria-pressed="waitPending" :disabled="disabled || !waitCapability.enabled" :title="waitCapability.reason" @click="wait">{{ t('battleWait') }}</button>
    </div>
    <ul class="capability-reasons" aria-live="polite">
      <li v-if="!capabilities.move.enabled && capabilities.move.reason">{{ t('battleMove') }}：{{ capabilities.move.reason }}</li>
      <li v-if="!capabilities.item.enabled && capabilities.item.reason">{{ t('battleItem') }}：{{ t('battleItemLimit') }} {{ capabilities.itemUses }}/{{ capabilities.itemMaxUses }} · {{ capabilities.item.reason }}</li>
      <li v-if="!defendCapability.enabled && defendCapability.reason">{{ t('battleDefend') }}：{{ defendCapability.reason }}</li>
      <li v-if="!waitCapability.enabled && waitCapability.reason">{{ t('battleWait') }}：{{ waitCapability.reason }}</li>
    </ul>
    <section v-if="itemOpen" class="action-picker" :aria-label="t('battleItemPicker')">
      <p>{{ t('battleItemLimit') }} {{ capabilities.itemUses }}/{{ capabilities.itemMaxUses }}</p>
      <label>{{ t('battleChooseItem') }}<select v-model="selectedItem"><option value="" disabled>{{ t('battleChoosePlaceholder') }}</option><option v-for="row in items" :key="row.id" :value="row.id" :disabled="!row.capability.enabled">{{ battleItemChoice(row.name, row.count, row.capability.reason) }}</option></select></label>
      <label v-if="item">{{ t('battleChooseTarget') }}<select v-model="selectedTarget"><option value="" disabled>{{ t('battleChoosePlaceholder') }}</option><option v-for="row in item.targets" :key="row.id" :value="row.id" :disabled="!row.capability.enabled">{{ battleTargetChoice(row.name, row.capability.reason) }}</option></select></label>
      <p v-if="itemPlan && !itemPlan.enabled" class="muted">{{ itemPlan.reason }}</p>
      <button type="button" data-confirm-item :disabled="disabled || !itemPlan?.enabled" @click="useItem">{{ t('battleConfirmAction') }}</button>
    </section>
    <section v-for="[id, group] in groups" :key="id" class="move-group">
      <h4>{{ group.name }}</h4>
      <button v-for="move in group.moves" :key="move.id" type="button" class="move-choice" :data-move="move.id" :disabled="disabled || !move.available" :title="battleReason(move.reason)" :aria-pressed="selectedMove === move.id" @pointerenter="emit('hover', move.id)" @focus="emit('hover', move.id)" @click="chooseMove(move.id)">
        <strong>{{ move.name }}</strong><small>内力 {{ move.mpCost }} · 收招 {{ move.recovery }} · {{ move.hitZone }}</small>
        <small>运气 {{ move.completionBp === null ? '未提供' : `${(move.completionBp / 100).toFixed(0)}%` }} · 预计经脉倍率 {{ move.attackBp === null ? '未提供' : `×${(move.attackBp / 10000).toFixed(2)}` }}</small>
      </button>
    </section>
    <div class="gather-choice">
      <button type="button" data-gather :aria-pressed="routeOpen" :disabled="disabled || !capabilities.gather.enabled" :title="capabilities.gather.reason" @click="openRoutes">{{ t('battleGather') }}</button>
      <small>{{ t('battleGatherHelp') }}</small>
    </div>
    <section v-if="routeOpen" class="action-picker" :aria-label="t('battleRoutePicker')">
      <label>{{ t('battleChooseRoute') }}<select v-model="selectedRoute"><option value="" disabled>{{ t('battleChoosePlaceholder') }}</option><option v-for="row in routes" :key="row.routeId" :value="row.routeId" :disabled="!row.capability.enabled">{{ battleRouteChoice(row.routeId, row.completionBp, row.inFlight, row.capacity, row.capability.reason) }}</option></select></label>
      <p v-if="route">{{ battleQiSummary(route.dantianQi, route.routeQualityBp) }}</p>
      <button type="button" data-confirm-gather :disabled="disabled || !route?.capability.enabled" @click="gather">{{ t('battleConfirmAction') }}</button>
    </section>
    <p v-if="!capabilities.gather.enabled" class="muted">{{ capabilities.gather.reason }}</p>
    <button
      v-if="concedeAllowed && actor && actor.side === 'player'"
      type="button" data-concede :disabled="disabled"
      @click="emit('command', { t: 'battle/concede', revision })"
    >
      主动认输
    </button>
    <button
      v-if="demonstrationReplayId"
      type="button" data-demonstration :disabled="busy"
      @click="emit('command', { t: 'battle/demonstration', replayId: demonstrationReplayId, revision })"
    >
      接受书灵示范
    </button>
    <button
      v-for="subdueTarget in subdueTargets" :key="subdueTarget.id" type="button" data-subdue
      :disabled="busy || automatic || !subdueActorId"
      @click="subdueActorId && emit('command', { t: 'battle/subdue', actor: subdueActorId, target: subdueTarget.id, revision })"
    >
      止战·制服 {{ subdueTarget.name }}
    </button>
    <p v-if="preview" role="status">{{ preview.valid ? battleTargetPreview(preview.targetIds.length) : preview.reason }}</p>
    <button class="primary" type="button" data-confirm-move :disabled="disabled || !waitPending && !defendPending && (!preview?.valid || preview.moveId !== selectedMove || preview.revision !== revision)" @click="confirm">{{ t('battleConfirmAction') }}</button>
    <button v-if="preview || draftedDestination || itemOpen || routeOpen || waitPending || defendPending" type="button" data-cancel-plan :disabled="disabled" @click="cancel">{{ t('battleCancelPlan') }}</button>
  </section>
</template>
