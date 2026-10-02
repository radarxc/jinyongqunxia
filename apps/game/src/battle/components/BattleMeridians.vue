<script setup lang="ts">
import type { BattleUnitView } from '../contracts';
defineProps<{ unit: BattleUnitView | null }>();
const states = { flowing: '运行', blocked: '阻塞', occupied: '占穴', damaged: '损伤' } as const;
</script>

<template>
  <section class="battle-meridians paper-panel" aria-label="经脉运行与受损">
    <h3>经脉 · {{ unit?.name ?? '未选中人物' }}</h3>
    <div class="meridian-body">
      <svg viewBox="0 0 180 180" role="img" aria-label="经脉示意，异常穴位见列表">
        <circle cx="90" cy="23" r="16" /><path d="M90 39V119M49 71L90 51L131 71M49 71L35 113M131 71L145 113M90 119L61 165M90 119L119 165" />
        <path class="route" d="M90 98V58L50 77L37 108M90 98L116 158" />
        <circle class="dantian" :class="{ damaged: unit?.meridian.dantianDamage }" cx="90" cy="98" r="8" />
      </svg>
      <div>
        <p>运气进度：{{ unit?.meridian.completionBp === null ? '尚无运行数据' : `${(unit?.meridian.completionBp ?? 0) / 100}%` }}</p>
        <p>丹田：{{ unit?.meridian.dantianDamage ? `受损 ${unit.meridian.dantianDamage} 级` : '未见损伤' }}</p>
        <ul><li v-for="point in unit?.meridian.points ?? []" :key="point.id" :class="point.state">{{ point.label }} · {{ states[point.state] }} · 气量 {{ point.qi }}</li></ul>
        <p v-if="!unit?.meridian.points.length" class="muted">未见阻塞或占穴。</p>
      </div>
    </div>
    <ul class="status-list"><li v-for="status in unit?.statuses ?? []" :key="status.id"><strong>{{ status.label }}</strong> {{ status.detail }}</li></ul>
  </section>
</template>
