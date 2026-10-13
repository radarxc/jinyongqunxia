<script setup lang="ts">
import { computed } from 'vue';
import type { BattleUnitView, BattleView } from '../contracts';

const props = defineProps<{ battle: BattleView; selectedId?: string | null }>();
const emit = defineEmits<{ select: [unitId: string]; hover: [unitId: string | null] }>();

function unitAvatar(name?: string, avatar?: string): string {
  if (avatar) return avatar;
  if (name === '主角') return '/img/hero.webp';
  if (name && (name.includes('李') || name.includes('秀'))) return '/img/li.webp';
  return '';
}

const timelineEntries = computed(() => {
  const unitsMap = new Map(props.battle.units.map(u => [u.id, u]));
  const seen = new Set<string>();
  const list: { unit: BattleUnitView; tickOffset: number; isCurrent: boolean }[] = [];

  for (const entry of props.battle.timeline) {
    const unit = unitsMap.get(entry.unitId);
    if (unit && !seen.has(unit.id)) {
      seen.add(unit.id);
      list.push({
        unit,
        tickOffset: entry.atTick - props.battle.tick,
        isCurrent: list.length === 0,
      });
    }
  }
  for (const unit of props.battle.units) {
    if (!seen.has(unit.id)) {
      seen.add(unit.id);
      list.push({
        unit,
        tickOffset: 99,
        isCurrent: false,
      });
    }
  }
  return list;
});

function getPosture(unit: BattleUnitView): { label: string; cls: string } {
  if (unit.hp <= 0 || !unit.active) return { label: '趴着', cls: 'posture-down' };
  const ratio = unit.hp / Math.max(1, unit.hpMax);
  if (ratio < 0.35) return { label: '半跪', cls: 'posture-kneel' };
  if (ratio < 0.70) return { label: '弯腰', cls: 'posture-stoop' };
  return { label: '站立', cls: 'posture-stand' };
}

function getConditionIcons(unit: BattleUnitView): Array<{ icon: string; label: string; title: string }> {
  const icons: Array<{ icon: string; label: string; title: string }> = [];
  const ratio = unit.hp / Math.max(1, unit.hpMax);

  // 金刚 (guard / shield / defense)
  if (unit.statuses.some(s => s.id.includes('jingang') || s.label.includes('金刚') || s.label.includes('守') || s.label.includes('防'))) {
    icons.push({ icon: '🛡️', label: '金刚', title: '金刚不坏 · 受到外劲大幅减免' });
  }
  // 虚弱 (low hp or weak status)
  if (ratio < 0.35 || unit.statuses.some(s => s.id.includes('weak') || s.label.includes('虚弱'))) {
    icons.push({ icon: '🥀', label: '虚弱', title: '气力衰竭 · 身法与招式威力减退' });
  }
  // 内息混乱 (dantian damage or meridian blocked)
  if (unit.meridian.dantianDamage > 0 || unit.meridian.points.some(p => p.state === 'blocked' || p.state === 'damaged')) {
    icons.push({ icon: '🌀', label: '内乱', title: '经脉受损 · 真气周天流转失序' });
  }
  // 中毒
  if (unit.statuses.some(s => s.id.includes('poison') || s.label.includes('毒'))) {
    icons.push({ icon: '🧪', label: '中毒', title: '体内剧毒流窜 · 每刻损耗气血' });
  }
  // Additional statuses from unit.statuses
  for (const st of unit.statuses) {
    if (!icons.some(i => i.label === st.label)) {
      icons.push({ icon: '✨', label: st.label, title: st.detail });
    }
  }
  return icons;
}
</script>

<template>
  <aside class="battle-timeline-vertical wash" aria-label="速度条与预计出手顺序">
    <header class="timeline-v-header">
      <span class="timeline-v-title">出手顺序</span>
      <small class="timeline-v-round">第 {{ battle.round }} 轮 · {{ battle.tick }} 刻</small>
    </header>

    <div class="timeline-units-queue">
      <div
        v-for="item in timelineEntries"
        :key="item.unit.id"
        class="timeline-card-unit"
        :class="[item.unit.side, { current: item.isCurrent, selected: selectedId === item.unit.id }]"
        :aria-current="item.isCurrent ? 'step' : undefined"
        @pointerenter="emit('hover', item.unit.id)"
        @pointerleave="emit('hover', null)"
        @click="emit('select', item.unit.id)"
      >
        <!-- Unit Header: Avatar, Name, Side, Posture -->
        <div class="card-head">
          <img
            v-if="unitAvatar(item.unit.name)"
            class="portrait-small"
            :src="unitAvatar(item.unit.name)"
            :alt="item.unit.name"
          >
          <span v-else class="avatar-fallback">{{ item.unit.name?.[0] ?? '侠' }}</span>
          <div class="name-col">
            <div class="name-row">
              <strong class="unit-name">{{ item.unit.name }}</strong>
              <span class="side-badge" :class="item.unit.side">
                {{ { player: '我', ally: '友', enemy: '敌', neutral: '立' }[item.unit.side] }}
              </span>
            </div>
            <span class="posture-text" :class="getPosture(item.unit).cls">
              {{ getPosture(item.unit).label }}
            </span>
          </div>
        </div>

        <!-- Health bar (血槽) -->
        <div class="hp-meter-box">
          <div class="hp-bar-track">
            <div
              class="hp-bar-fill"
              :class="item.unit.side"
              :style="{ width: Math.max(0, Math.min(100, Math.round(item.unit.hp * 100 / Math.max(1, item.unit.hpMax)))) + '%' }"
            />
          </div>
          <span class="hp-num">{{ item.unit.hp }}/{{ item.unit.hpMax }}</span>
        </div>

        <!-- Condition Icons (金刚, 虚弱, 内息混乱, 中毒) -->
        <div v-if="getConditionIcons(item.unit).length" class="conditions-row">
          <span
            v-for="cond in getConditionIcons(item.unit)"
            :key="cond.label"
            class="cond-tag"
            :title="cond.title"
          >
            {{ cond.icon }} {{ cond.label }}
          </span>
        </div>
      </div>
    </div>
  </aside>
</template>

