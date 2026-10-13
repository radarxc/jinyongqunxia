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
const selectedDefinition = computed(() => actor.value?.moves.find(move => move.id === selectedMove.value));
const aimDirectionCount = computed<6 | 12>(() => selectedDefinition.value?.shape.tpl === 'aoe_cone'
  ? selectedDefinition.value.shape.dirCount : 6);
const directionLabels = ['东', '东偏北', '东北', '北', '西北', '西偏北',
  '西', '西偏南', '西南', '南', '东南', '东偏南'];
function hexDist(a: { q: number; r: number }, b: { q: number; r: number }): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
}
function preview(moveId: string, cell = anchor.value): void {
  const state = view.value; const unit = actor.value; if (!state || !unit || state.auto) return;
  const target = cell ?? state.info.cells.find(tile => {
    const enemy = state.units.find(candidate => candidate.active && state.info.setup.relations[unit.side][candidate.side] === 'hostile');
    return enemy?.q === tile.q && enemy.r === tile.r;
  });
  if (!target) return;
  const moveDef = unit.moves.find(move => move.id === moveId);
  const shape = moveDef?.shape;
  const range = moveDef?.range ?? 1;
  const count = shape?.tpl === 'aoe_cone' ? shape.dirCount : 6;
  const aim: HexAim = count === 12
    ? { dirCount: 12, dir: direction.value as HexAim12 }
    : { dirCount: 6, dir: direction.value as HexDir };
  let walkTo: { q: number; r: number } | undefined;
  if (hexDist(unit, target) > range && state.capabilities.move.reachable.length > 0) {
    const candidates = state.capabilities.move.reachable
      .filter(candidate => hexDist(candidate, target) <= range)
      .sort((a, b) => a.cost - b.cost);
    if (candidates[0]) {
      walkTo = { q: candidates[0].q, r: candidates[0].r };
    }
  }
  props.controller.preview({ revision: state.revision, actor: unit.id, moveId, anchor: target, aim, ...(walkTo ? { walkTo } : {}) });
}
function chooseMove(id: string): void { selectedMove.value = id; direction.value = 0; preview(id); }
function chooseCell(cell: BattleCell): void {
  const currentPreview = view.value?.preview;
  const previousCell = anchor.value;
  anchor.value = cell;
  if (selectedMove.value) {
    const isTargetHit = currentPreview?.valid && (
      (previousCell && previousCell.q === cell.q && previousCell.r === cell.r) ||
      (currentPreview.anchor.q === cell.q && currentPreview.anchor.r === cell.r) ||
      (view.value?.units.some(u => currentPreview.targetIds.includes(u.id) && u.q === cell.q && u.r === cell.r))
    );
    if (isTargetHit && currentPreview) {
      void props.controller.command({ t: 'battle/act-at', preview: currentPreview });
      return;
    }
    preview(selectedMove.value, cell);
  } else {
    const enemy = view.value?.units.find(u => u.active && u.q === cell.q && u.r === cell.r && view.value?.info.setup.relations[actor.value?.side ?? 'player'][u.side] === 'hostile');
    if (enemy && actor.value?.moves[0]) {
      chooseMove(actor.value.moves[0].id);
      preview(actor.value.moves[0].id, cell);
    }
  }
}
function hoverCell(cell: BattleCell): void { if (selectedMove.value) preview(selectedMove.value, cell); }
function chooseUnit(id: string): void {
  selected.value = id; const unit = view.value?.units.find(row => row.id === id);
  const cell = view.value?.info.cells.find(row => row.q === unit?.q && row.r === unit.r);
  if (cell) chooseCell(cell);
}
function onSpace(): void {
  const state = view.value;
  if (!state || busy.value || state.auto) return;
  if (state.preview?.valid) {
    void props.controller.command({ t: 'battle/act-at', preview: state.preview });
  } else if (state.capabilities.move.selected) {
    void props.controller.command({ t: 'battle/wait', actor: actor.value?.id ?? '', revision: state.revision, walkTo: { q: state.capabilities.move.selected.q, r: state.capabilities.move.selected.r } });
  } else {
    props.controller.setMovement(!props.controller.movement.value);
  }
}
function onCancel(): void {
  selectedMove.value = null;
  anchor.value = null;
  props.controller.setMovement(false);
  if (view.value) void props.controller.preview({ kind: 'cancel', revision: view.value.revision });
}
const hoveredUnitId = ref<string | null>(null);
const hoveredUnitObj = computed(() =>
  view.value?.units.find(u => u.id === hoveredUnitId.value) ?? null
);
function onHoverUnit(id: string | null): void {
  hoveredUnitId.value = id;
}

function getPosture(unit: import('./contracts').BattleUnitView): { label: string; cls: string } {
  if (unit.hp <= 0 || !unit.active) return { label: '趴着', cls: 'posture-down' };
  const ratio = unit.hp / Math.max(1, unit.hpMax);
  if (ratio < 0.35) return { label: '半跪', cls: 'posture-kneel' };
  if (ratio < 0.70) return { label: '弯腰', cls: 'posture-stoop' };
  return { label: '站立', cls: 'posture-stand' };
}

function getConditionIcons(unit: import('./contracts').BattleUnitView): Array<{ icon: string; label: string; title: string }> {
  const icons: Array<{ icon: string; label: string; title: string }> = [];
  const ratio = unit.hp / Math.max(1, unit.hpMax);

  if (unit.statuses.some(s => s.id.includes('jingang') || s.label.includes('金刚') || s.label.includes('守') || s.label.includes('防'))) {
    icons.push({ icon: '🛡️', label: '金刚', title: '金刚不坏 · 受到外劲大幅减免' });
  }
  if (ratio < 0.35 || unit.statuses.some(s => s.id.includes('weak') || s.label.includes('虚弱'))) {
    icons.push({ icon: '🥀', label: '虚弱', title: '气力衰竭 · 身法与招式威力减退' });
  }
  if (unit.meridian.dantianDamage > 0 || unit.meridian.points.some(p => p.state === 'blocked' || p.state === 'damaged')) {
    icons.push({ icon: '🌀', label: '内乱', title: '经脉受损 · 真气周天流转失序' });
  }
  if (unit.statuses.some(s => s.id.includes('poison') || s.label.includes('毒'))) {
    icons.push({ icon: '🧪', label: '中毒', title: '体内剧毒流窜 · 每刻损耗气血' });
  }
  for (const st of unit.statuses) {
    if (!icons.some(i => i.label === st.label)) {
      icons.push({ icon: '✨', label: st.label, title: st.detail });
    }
  }
  return icons;
}

function visibility(): void { props.controller.setActive(document.visibilityState !== 'hidden'); }
watch(() => view.value?.revision, () => {
  anchor.value = null;
  selected.value = actor.value?.id ?? null;
  selectedMove.value = null;
}, { immediate: true });
onMounted(() => {
  visibility();
  document.addEventListener('visibilitychange', visibility);
  if (!view.value && !busy.value) {
    void props.controller.command({ t: 'battle/demo', source: props.source });
  }
});
onBeforeUnmount(() => { props.controller.setActive(false); document.removeEventListener('visibilitychange', visibility); });
async function leave(): Promise<void> {
  if (await props.controller.command({ t: 'battle/leave' })) emit('returned', props.controller.returnScene.value);
}
</script>

<template>
  <section class="battle-page" aria-label="战斗">
    <div v-if="!view" class="battle-loading paper-panel">
      <p>正在展开六角战旗……</p>
    </div>
    <template v-else>
      <header class="battle-heading">
        <div><small>六角战旗 · {{ view.info.preview ? '演武' : '江湖战事' }}</small><h2>{{ view.info.title }}</h2></div>
        <BattleControls :automatic="view.auto" :speed="speed" :forbidden="view.info.setup.rules.noAuto" :ended="!!view.result" @auto="controller.setAuto" @speed="speed = $event" />
      </header>

      <details class="battle-setup">
        <summary>参战人物与结束条件</summary>
        <p v-for="unit in view.units" :key="unit.id">{{ unit.name }} · {{ { player: '我方', ally: '友方', enemy: '敌方', neutral: '中立' }[unit.side] }}</p>
        <template v-for="[label, conditions] in ([['胜利', view.info.setup.end.winCond], ['失败', view.info.setup.end.loseCond], ['平局', view.info.setup.end.drawCond]] as const)" :key="label">
          <p v-for="(condition, index) in conditions" :key="index">{{ label }}：{{ condition.kind === 'allHostileDown' ? '所有敌对人物失去行动能力' : condition.kind === 'unitDown' ? `${view.units.find(unit => unit.id === condition.unitRef)?.name ?? '指定人物'} 倒地` : condition.kind === 'surviveRounds' ? `坚持 ${condition.rounds} 轮` : `达到 ${condition.actions} 次行动` }}</p>
        </template>
        <p>轮数上限：{{ view.info.setup.rules.roundLimit }}；达到上限时{{ view.info.setup.rules.boss ? '判平' : '判胜' }}。</p>
      </details>

      <!-- Huan Shi Lu SRPG Layout: Left Timeline, Center Field, Hexagonal Actions, Dark Hover Card -->
      <div class="battle-layout-huanshitu">
        <!-- 1. Left Huan Shi Lu Timeline: Unit Queue with Health Bar, Posture, and Condition Icons -->
        <BattleTimeline
          :battle="view"
          :selected-id="selected"
          @select="chooseUnit"
          @hover="onHoverUnit"
        />

        <!-- 2. Main Center: Battlefield -->
        <div class="battle-center-stage">
          <BattleField
            :key="view.id"
            :controller="controller"
            :battle="view"
            :selected="selected"
            :selected-move="selectedMove"
            :floating="floating"
            :reduced-motion="reducedMotion"
            :skip="speed === 'skip'"
            @cell="chooseCell"
            @hover="hoverCell"
            @hover-unit="onHoverUnit"
            @select="chooseUnit"
            @space="onSpace"
            @cancel="onCancel"
            @choose-move="chooseMove"
          />

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

        <!-- 3. Actions Dock -->
        <aside class="battle-actions-dock">
          <BattleActions
            :actor="actor"
            :revision="view.revision"
            :busy="busy"
            :automatic="view.auto"
            :capabilities="view.info.capabilities"
            :preview="view.preview"
            :selected-move="selectedMove"
            @command="controller.command"
            @move="chooseMove"
            @hover="preview"
          />
        </aside>

        <!-- 4. Hover Dark Glass Panel (黑色半透明 panel, 上面基本属性，下方内息运转图) -->
        <div
          v-if="hoveredUnitObj"
          class="hover-dark-glass-panel"
          @pointerleave="hoveredUnitId = null"
        >
          <div class="glass-header">
            <span class="glass-side" :class="hoveredUnitObj.side">
              {{ { player: '我方', ally: '同盟', enemy: '敌手', neutral: '中立' }[hoveredUnitObj.side] }}
            </span>
            <strong class="glass-name">{{ hoveredUnitObj.name }}</strong>
            <span class="glass-posture" :class="getPosture(hoveredUnitObj).cls">
              {{ getPosture(hoveredUnitObj).label }}
            </span>
          </div>
          <div class="glass-res-row">
            <span class="glass-res hp">气血 {{ hoveredUnitObj.hp }} / {{ hoveredUnitObj.hpMax }}</span>
            <span class="glass-res mp">内力 {{ hoveredUnitObj.mp }} / {{ hoveredUnitObj.mpMax }}</span>
          </div>
          <div v-if="getConditionIcons(hoveredUnitObj).length" class="glass-conds">
            <span v-for="c in getConditionIcons(hoveredUnitObj)" :key="c.label" class="cond-pill" :title="c.title">
              {{ c.icon }} {{ c.label }}
            </span>
          </div>
          <!-- Internal Qi circulation diagram on the bottom -->
          <div class="glass-qi-section">
            <BattleMeridians :unit="hoveredUnitObj" />
          </div>
        </div>
      </div>

      <BattleResult :battle="view" :busy="busy" @leave="leave" />
    </template>
    <p v-if="error" role="alert">{{ error }} <button type="button" @click="error = ''">继续</button></p>
  </section>
</template>
