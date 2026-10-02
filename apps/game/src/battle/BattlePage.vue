<script setup lang="ts">
/* global document */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { BattleCell } from '@tianshu/render/battle';
import type { HexAim, HexAim12, HexDir } from '@tianshu/core';
import type { BattleController } from './controller';
import BattleActions from './components/BattleActions.vue';
import BattleControls from './components/BattleControls.vue';
import BattleField from './components/BattleField.vue';
import BattleLog from './components/BattleLog.vue';
import BattleMeridians from './components/BattleMeridians.vue';
import BattleResult from './components/BattleResult.vue';
import BattleTimeline from './components/BattleTimeline.vue';
import './battle.css';
const props = defineProps<{ controller: BattleController; source: 'world' | 'town'; reducedMotion: boolean }>();
const emit = defineEmits<{ returned: [scene: string] }>();
const { view, logs, floating, busy, error, speed } = props.controller;
const selected = ref<string | null>(null); const selectedMove = ref<string | null>(null);
const direction = ref(0); const anchor = ref<BattleCell | null>(null);
const actor = computed(() => view.value?.units.find(unit => unit.id === view.value?.actorId) ?? null);
const inspected = computed(() => view.value?.units.find(unit => unit.id === selected.value) ?? actor.value);
const selectedDefinition = computed(() => actor.value?.moves.find(move => move.id === selectedMove.value));
const aimDirectionCount = computed<6 | 12>(() => selectedDefinition.value?.shape.tpl === 'aoe_cone'
  ? selectedDefinition.value.shape.dirCount : 6);
const directionLabels = ['东', '东偏北', '东北', '北', '西北', '西偏北',
  '西', '西偏南', '西南', '南', '东南', '东偏南'];
function preview(moveId: string, cell = anchor.value): void {
  const state = view.value; const unit = actor.value; if (!state || !unit || state.auto) return;
  const target = cell ?? state.info.cells.find(tile => {
    const enemy = state.units.find(candidate => candidate.active && state.info.setup.relations[unit.side][candidate.side] === 'hostile');
    return enemy?.q === tile.q && enemy.r === tile.r;
  });
  if (!target) return;
  const shape = unit.moves.find(move => move.id === moveId)?.shape;
  const count = shape?.tpl === 'aoe_cone' ? shape.dirCount : 6;
  const aim: HexAim = count === 12
    ? { dirCount: 12, dir: direction.value as HexAim12 }
    : { dirCount: 6, dir: direction.value as HexDir };
  props.controller.preview({ revision: state.revision, actor: unit.id, moveId, anchor: target, aim });
}
function chooseMove(id: string): void { selectedMove.value = id; direction.value = 0; preview(id); }
function chooseCell(cell: BattleCell): void { anchor.value = cell; if (selectedMove.value) preview(selectedMove.value, cell); }
function hoverCell(cell: BattleCell): void { if (selectedMove.value) preview(selectedMove.value, cell); }
function chooseUnit(id: string): void {
  selected.value = id; const unit = view.value?.units.find(row => row.id === id);
  const cell = view.value?.info.cells.find(row => row.q === unit?.q && row.r === unit.r);
  if (cell) chooseCell(cell);
}
function visibility(): void { props.controller.setActive(document.visibilityState !== 'hidden'); }
watch(() => view.value?.revision, () => { selectedMove.value = null; anchor.value = null; selected.value = actor.value?.id ?? null; });
onMounted(() => { visibility(); document.addEventListener('visibilitychange', visibility); });
onBeforeUnmount(() => { props.controller.setActive(false); document.removeEventListener('visibilitychange', visibility); });
async function leave(): Promise<void> {
  if (await props.controller.command({ t: 'battle/leave' })) emit('returned', props.controller.returnScene.value);
}
</script>

<template>
  <section class="battle-page" aria-label="战斗">
    <div v-if="!view" class="battle-entry paper-panel">
      <p class="eyebrow">演武 · 六角战场</p><h2>一招一式，静候时机</h2>
      <p>选择招式查看范围，落点确认后出手。也可开启自动战斗，随时接管。</p>
      <p class="muted">此处为独立演武示例（原创扩展），复用战斗核心的固定回放数据。</p>
      <button class="primary" type="button" :disabled="busy" data-enter-battle @click="controller.command({ t: 'battle/demo', source })">进入演武场</button>
    </div>
    <template v-else>
      <header class="battle-heading">
        <div><small>六角战旗 · {{ view.info.preview ? '演武' : '江湖战事' }}</small><h2>{{ view.info.title }}</h2></div>
        <BattleControls :automatic="view.auto" :speed="speed" :forbidden="view.info.setup.rules.noAuto" :ended="!!view.result" @auto="controller.setAuto" @speed="speed = $event" />
      </header>
      <BattleTimeline :battle="view" />
      <details class="battle-setup">
        <summary>参战人物与结束条件</summary>
        <p v-for="unit in view.units" :key="unit.id">{{ unit.name }} · {{ { player: '我方', ally: '友方', enemy: '敌方', neutral: '中立' }[unit.side] }}</p>
        <template v-for="[label, conditions] in ([['胜利', view.info.setup.end.winCond], ['失败', view.info.setup.end.loseCond], ['平局', view.info.setup.end.drawCond]] as const)" :key="label">
          <p v-for="(condition, index) in conditions" :key="index">{{ label }}：{{ condition.kind === 'allHostileDown' ? '所有敌对人物失去行动能力' : condition.kind === 'unitDown' ? `${view.units.find(unit => unit.id === condition.unitRef)?.name ?? '指定人物'} 倒地` : condition.kind === 'surviveRounds' ? `坚持 ${condition.rounds} 轮` : `达到 ${condition.actions} 次行动` }}</p>
        </template>
        <p>轮数上限：{{ view.info.setup.rules.roundLimit }}；达到上限时{{ view.info.setup.rules.boss ? '判平' : '判胜' }}。</p>
      </details>
      <div class="battle-layout">
        <div>
          <BattleField :key="view.id" :controller="controller" :battle="view" :selected="selected" :floating="floating" :reduced-motion="reducedMotion" :skip="speed === 'skip'" @cell="chooseCell" @hover="hoverCell" @select="chooseUnit" />
          <fieldset v-if="selectedDefinition?.shape.tpl === 'aoe_line' || selectedDefinition?.shape.tpl === 'aoe_cone'" class="aim-control">
            <legend>招式朝向</legend>
            <button
              v-for="dir in aimDirectionCount" :key="dir" type="button" :aria-pressed="direction === dir - 1"
              @click="direction = dir - 1; selectedMove && preview(selectedMove)"
            >
              {{ aimDirectionCount === 12 ? directionLabels[dir - 1] : directionLabels[(dir - 1) * 2] }}
            </button>
          </fieldset>
          <BattleLog :entries="logs" :units="view.units" />
        </div>
        <aside>
          <BattleActions :actor="actor" :revision="view.revision" :busy="busy" :automatic="view.auto" :capabilities="view.info.capabilities" :preview="view.preview" :selected-move="selectedMove" @command="controller.command" @move="chooseMove" @hover="preview" />
          <BattleMeridians :unit="inspected" />
        </aside>
      </div>
      <BattleResult :battle="view" :busy="busy" @leave="leave" />
    </template>
    <p v-if="error" role="alert">{{ error }} <button type="button" @click="error = ''">继续</button></p>
  </section>
</template>
