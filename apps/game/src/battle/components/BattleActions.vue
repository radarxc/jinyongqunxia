<script setup lang="ts">
import { computed } from 'vue';
import type { AreaPreview, BattleCapabilities, BattleUiCommand, BattleUnitView } from '../contracts';
const props = defineProps<{ actor: BattleUnitView | null; revision: number; busy: boolean; automatic: boolean;
  capabilities: BattleCapabilities; preview: AreaPreview | null; selectedMove: string | null }>();
const emit = defineEmits<{ command: [command: BattleUiCommand]; move: [moveId: string]; hover: [moveId: string] }>();
const groups = computed(() => {
  const result = new Map<string, { name: string; moves: BattleUnitView['moves'][number][] }>();
  for (const move of props.actor?.moves ?? []) {
    const group = result.get(move.skillId) ?? { name: move.skillName, moves: [] };
    group.moves.push(move); result.set(move.skillId, group);
  }
  return [...result.entries()];
});
const disabled = computed(() => props.busy || props.automatic || props.actor?.control !== 'player');
function intent(action: 'move' | 'defend' | 'gather'): void {
  const actor = props.actor; if (!actor) return;
  const base = { actor: actor.id, revision: props.revision };
  if (action === 'move') emit('command', { t: 'battle/move', ...base, destination: actor });
  else if (action === 'defend') emit('command', { t: 'battle/defend', ...base });
  else emit('command', { t: 'battle/gather', ...base, routeId: actor.meridian.routeId ?? '' });
}
</script>

<template>
  <section class="battle-actions paper-panel" aria-label="行动菜单">
    <header><h3>{{ actor?.name ?? '等待行动' }}</h3><span>{{ actor?.control === 'ai' ? '对方行动中' : '选择行动' }}</span></header>
    <div class="action-row">
      <button type="button" :disabled="disabled || !capabilities.move.enabled" :title="capabilities.move.reason" @click="intent('move')">移动</button>
      <button type="button" :disabled="disabled || !capabilities.item.enabled" :title="capabilities.item.reason">物品</button>
      <button type="button" :disabled="disabled || !capabilities.defend.enabled" :title="capabilities.defend.reason" @click="intent('defend')">防御</button>
      <button type="button" :disabled="disabled || !actor" @click="actor && emit('command', { t: 'battle/wait', actor: actor.id, revision })">待机</button>
    </div>
    <section v-for="[id, group] in groups" :key="id" class="move-group">
      <h4>{{ group.name }}</h4>
      <button
        v-for="move in group.moves" :key="move.id" type="button" class="move-choice" :data-move="move.id"
        :disabled="disabled || !move.available" :aria-pressed="selectedMove === move.id"
        @pointerenter="emit('hover', move.id)" @focus="emit('hover', move.id)" @click="emit('move', move.id)"
      >
        <strong>{{ move.name }}</strong><small>内力 {{ move.mpCost }} · 收招 {{ move.recovery }} · {{ move.hitZone }}</small>
        <small>运气 {{ move.completionBp === null ? '未提供' : `${(move.completionBp / 100).toFixed(0)}%` }}
          · 预计经脉倍率 {{ move.attackBp === null ? '未提供' : `×${(move.attackBp / 10000).toFixed(2)}` }}</small>
      </button>
    </section>
    <div class="gather-choice">
      <button type="button" data-gather :disabled="disabled || !capabilities.gather.enabled" :title="capabilities.gather.reason" @click="intent('gather')">急性聚气</button>
      <small>跳过本回合，继续积攒经脉中的气。<br>在途气量 {{ actor?.meridian.inFlight ?? '—' }} / 承载上限 {{ actor?.meridian.capacity ?? '—' }}</small>
    </div>
    <p v-if="!capabilities.gather.enabled" class="muted">{{ capabilities.gather.reason }}；可使用招式或待机。</p>
    <p v-if="preview" role="status">{{ preview.valid ? `命中 ${preview.targetIds.length} 人，确认后出招。` : preview.reason }}</p>
    <button
      class="primary" type="button" data-confirm-move :disabled="disabled || !preview?.valid || preview.moveId !== selectedMove || preview.revision !== revision"
      @click="preview && emit('command', { t: 'battle/act-at', preview })"
    >
      确认出招
    </button>
  </section>
</template>
