<script setup lang="ts">
import { reactive } from 'vue';
import type { CharacterCreationView } from '@tianshu/ui';
import TxCharacterCreation from '@tianshu/ui/components/TxCharacterCreation.vue';
import type { GameController } from '../game-controller';
const { controller } = defineProps<{ controller: GameController }>();
const draft = reactive<CharacterCreationView>({ name: '', gender: 'female',
  appearance: 'hero_f01', pronoun: '她', originId: 'origin_wenshiguan',
  difficulty: controller.settings.value.difficulty });
function change(key: keyof CharacterCreationView, value: string): void {
  Object.assign(draft, { [key]: value });
  if (key === 'gender') Object.assign(draft, { pronoun: value === 'female' ? '她' : '他' });
}
function submit(): void {
  void controller.startNewGame({ identity: { name: draft.name.trim(), gender: draft.gender,
    appearance: draft.appearance, pronoun: draft.pronoun.trim(), originId: draft.originId },
  difficulty: draft.difficulty });
}
</script>

<template>
  <TxCharacterCreation :model-value="draft" :settings="controller.settings.value" :busy="controller.busy.value" @change="change" @setting="controller.setSetting" @submit="submit" />
</template>
