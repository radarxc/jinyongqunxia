<script setup lang="ts">
/* global HTMLElement */
import { nextTick, ref, watch } from 'vue';
import type { BattleLogEntry } from '../controller';
import type { BattleUnitView } from '../contracts';
const props = defineProps<{ entries: readonly BattleLogEntry[]; units: readonly BattleUnitView[] }>();
const list = ref<HTMLElement>();
const follow = ref(true);
function name(id?: string): string { return props.units.find(unit => unit.id === id)?.name ?? ''; }
watch(() => props.entries.length ? props.entries[props.entries.length - 1]?.key : 0, async () => {
  if (!follow.value) return;
  await nextTick(); if (list.value) list.value.scrollTop = list.value.scrollHeight;
});
</script>

<template>
  <section class="battle-log paper-panel" aria-label="结算日志">
    <header><h3>战况记录</h3><label><input v-model="follow" type="checkbox">跟随最新</label></header>
    <ol ref="list" tabindex="0" aria-label="最近二百条战斗事件">
      <li v-for="entry in entries" :key="entry.key" :data-event="entry.event.t">
        <details>
          <summary>
            <small>#{{ entry.event.actionNo }}</small> {{ name(entry.event.target ?? entry.event.actor) }} · {{ entry.text }}
            <strong v-if="entry.event.amount !== undefined"> {{ entry.event.amount }}</strong>
          </summary>
          <dl>
            <dt>出手者</dt><dd>{{ name(entry.event.actor) || '—' }}</dd><dt>目标</dt><dd>{{ name(entry.event.target) || '—' }}</dd>
            <template v-if="entry.event.amount !== undefined"><dt>结算量</dt><dd>{{ entry.event.amount }}</dd></template>
            <template v-if="entry.event.shieldSpent !== undefined"><dt>护体消耗</dt><dd>{{ entry.event.shieldSpent }}</dd></template>
            <template v-if="entry.event.level !== undefined"><dt>层级</dt><dd>{{ entry.event.level }}</dd></template>
          </dl>
          <p v-if="entry.event.t === 'battle/damageResolved'" class="muted">当前记录为实际气血损失；逐乘区明细尚未提供。</p>
        </details>
      </li>
    </ol>
    <p v-if="!entries.length" class="muted">战端将启。选择招式，再选择落点。</p>
    <p class="sr-only" role="status" aria-live="polite">{{ entries[entries.length - 1]?.text }}</p>
  </section>
</template>
