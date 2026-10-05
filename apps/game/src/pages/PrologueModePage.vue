<script setup lang="ts">
import TxFlowChoice from '@tianshu/ui/components/TxFlowChoice.vue';
import type { FlowChoiceView } from '@tianshu/ui';
import type { GameController } from '../game-controller';
import { stageAfterMode, type PrologueMode } from '../flow/stage';
const { controller } = defineProps<{ controller: GameController }>();
const choices: readonly FlowChoiceView[] = [
  { id: 'full', title: '完整序章', duration: '30 分钟', description: '探索、对话与战斗教学；手动初眠配点。', confirmation: '可快进已读表现；传功与配点不会被快进跳过。' },
  { id: 'summary', title: '交互摘要', duration: '≤90 秒', description: '七张水墨卡；补第一层并进入配点。', confirmation: '会跳过可玩教学，不跳过主线功法与属性确认。' },
  { id: 'skip', title: '直接跳过', duration: '确认 <10 秒', description: '保留阿青传功与雪崩画面，再选配点方式。', confirmation: '不会获得序章武学；随后进入白马。' },
];
async function confirm(value: string): Promise<void> {
  const mode = value as PrologueMode;
  if (await controller.choosePrologueMode(mode)) controller.setFlowStage(stageAfterMode(mode));
}
</script>
<template><TxFlowChoice title="如何走过序章" lead="三条路径抵达同一初眠配点与白马入口。" :choices="choices" :busy="controller.busy.value" @confirm="confirm" /></template>
