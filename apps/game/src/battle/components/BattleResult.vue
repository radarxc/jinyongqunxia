<script setup lang="ts">
import TxModal from '@tianshu/ui/components/TxModal.vue';
import { battleFullCirculation, battleMartialUse, battleMovementTraining, t } from '@tianshu/ui/runtime';
import type { BattleView } from '../contracts';
defineProps<{ battle: BattleView; busy: boolean }>();
const emit = defineEmits<{ leave: [] }>();
const titles = { win: '此战告捷', lose: '此战失利', draw: '此战言和', retreat: '已撤离战场' };
</script>

<template>
  <TxModal v-if="battle.result" :title="titles[battle.result]" @close="emit('leave')">
    <p>{{ battle.info.title }} · {{ battle.actionNo }} 次行动 · {{ battle.tick }} 刻</p>
    <section>
      <h3>掉落</h3><p v-if="!battle.rewards">本次未提供掉落结算。</p>
      <p v-else-if="battle.rewards?.drops.length === 0">{{ t('battleNoDrops') }}</p>
      <p v-for="(drop, index) in battle.rewards?.drops ?? []" :key="index">{{ drop.name }} × {{ drop.count }}</p>
    </section>
    <section>
      <h3>武学经验 / 熟练度</h3><p v-if="!battle.rewards || battle.rewards.martial === null">本次未提供成长结算。</p>
      <p v-for="(skill, index) in battle.rewards?.martial ?? []" :key="index">{{ skill.name }} · 经验 +{{ skill.experience }} · 熟练度 +{{ skill.proficiency }}</p>
    </section>
    <section v-if="battle.rewards">
      <h3>{{ t('battleCoreTraining') }}</h3>
      <p v-if="battle.rewards.martialUses.length === 0 && battle.rewards.movementTrained.length === 0 && battle.rewards.fullCirculations.length === 0">{{ t('battleNoTraining') }}</p>
      <p v-for="entry in battle.rewards.martialUses" :key="`${entry.unitId}:${entry.skillId}`">{{ battleMartialUse(battle.units.find(unit => unit.id === entry.unitId)?.name ?? entry.unitId, entry.skillId, entry.uses) }}</p>
      <p v-for="unitId in battle.rewards.movementTrained" :key="`move:${unitId}`">{{ battleMovementTraining(battle.units.find(unit => unit.id === unitId)?.name ?? unitId) }}</p>
      <p v-for="entry in battle.rewards.fullCirculations" :key="`cycle:${entry.unitId}`">{{ battleFullCirculation(battle.units.find(unit => unit.id === entry.unitId)?.name ?? entry.unitId, entry.count) }}</p>
    </section>
    <p>完整周天合计：{{ battle.rewards?.cycles ?? '尚未结算' }}</p>
    <p v-if="battle.info.preview" class="muted">演武数据为演示，不计入旅程成长。</p>
    <button type="button" class="primary" :disabled="busy" data-return-scene @click="emit('leave')">返回来源场景</button>
  </TxModal>
</template>
