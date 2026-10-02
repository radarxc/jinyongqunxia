<script setup lang="ts">
import TxModal from '@tianshu/ui/components/TxModal.vue';
import type { BattleView } from '../contracts';
defineProps<{ battle: BattleView; busy: boolean }>();
const emit = defineEmits<{ leave: [] }>();
const titles = { win: '此战告捷', lose: '此战失利', draw: '此战言和', retreat: '已撤离战场' };
</script>

<template>
  <TxModal v-if="battle.result" :title="titles[battle.result]" @close="emit('leave')">
    <p>{{ battle.info.title }} · {{ battle.actionNo }} 次行动 · {{ battle.tick }} 刻</p>
    <section>
      <h3>掉落</h3><p v-if="battle.rewards?.drops === null">本次未提供掉落结算。</p>
      <p v-for="(drop, index) in battle.rewards?.drops ?? []" :key="index">{{ drop.name }} × {{ drop.count }}</p>
    </section>
    <section>
      <h3>武学经验 / 熟练度</h3><p v-if="battle.rewards?.martial === null">本次未提供成长结算。</p>
      <p v-for="(skill, index) in battle.rewards?.martial ?? []" :key="index">{{ skill.name }} · 经验 +{{ skill.experience }} · 熟练度 +{{ skill.proficiency }}</p>
    </section>
    <p>完整周天：{{ battle.rewards?.cycles ?? '尚未结算' }}</p>
    <p v-if="battle.info.preview" class="muted">演武数据为演示，不计入旅程成长。</p>
    <button type="button" class="primary" :disabled="busy" data-return-scene @click="emit('leave')">返回来源场景</button>
  </TxModal>
</template>
