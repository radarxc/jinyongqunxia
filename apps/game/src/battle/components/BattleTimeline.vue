<script setup lang="ts">
import type { BattleView } from '../contracts';
defineProps<{ battle: BattleView }>();
</script>

<template>
  <section class="battle-timeline" aria-label="速度条与预计出手顺序">
    <div class="timeline-heading"><strong>速度条 · CT</strong><small>第 {{ battle.round }} 轮 · {{ battle.tick }} 刻</small></div>
    <ol>
      <li v-for="(entry, index) in battle.timeline" :key="index" :class="{ current: index === 0 }" :aria-current="index === 0 ? 'step' : undefined">
        <span>{{ index === 0 ? '当前行动' : `预计 ${index + 1}` }}</span>
        <strong>{{ battle.units.find(unit => unit.id === entry.unitId)?.name }}</strong>
        <small>{{ entry.opening ? '首轮先机' : `+${entry.atTick - battle.tick} 刻` }}</small>
      </li>
    </ol>
    <p class="muted">后续顺序按各人的首个招式收招估计，行动与状态变化后更新。</p>
  </section>
</template>
