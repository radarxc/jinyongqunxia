<script setup lang="ts">
import type { BattleSpeed } from '../controller';
defineProps<{ automatic: boolean; speed: BattleSpeed; forbidden: boolean; ended: boolean }>();
const emit = defineEmits<{ auto: [value: boolean]; speed: [value: BattleSpeed] }>();
</script>

<template>
  <nav class="battle-controls" aria-label="自动战斗与速度">
    <button
      type="button" role="switch" :aria-checked="automatic" :disabled="forbidden || ended"
      :title="forbidden ? '本场禁止自动战斗' : '按速度条逐行动自动出手'" data-auto @click="emit('auto', !automatic)"
    >
      {{ automatic ? '接管 · 切回手动' : '开启自动战斗' }}
    </button>
    <button
      v-for="value in ([1, 2, 'skip'] as const)" :key="value" type="button" :aria-pressed="speed === value"
      :data-speed="value" @click="emit('speed', value)"
    >
      {{ value === 'skip' ? '跳过演出' : `${value}×` }}
    </button>
    <span v-if="automatic" class="muted">自动模拟按出手顺序结算，不考虑站位。</span>
  </nav>
</template>
