<script setup lang="ts">
/* global Event, HTMLInputElement, HTMLSelectElement */
import type { CharacterCreationView, FlowSettingsView } from '../projections';
import { flowM1T, flowT } from '../i18n-flow';
const props = defineProps<{ modelValue: CharacterCreationView; settings: FlowSettingsView; busy?: boolean }>();
const emit = defineEmits<{
  change: [key: keyof CharacterCreationView, value: string];
  setting: [key: 'textScale' | 'reducedMotion' | 'subtitles', value: unknown];
  submit: [];
}>();
const origins = [
  ['origin_yixuesheng', '医学生'], ['origin_huwai', '户外领队'],
  ['origin_wenshiguan', '文史编辑'], ['origin_gongchengshi', '工程师'],
  ['origin_shejiren', '视觉设计师'],
] as const;
const difficulties = [
  ['diff_jianghu', 'jianghu'], ['diff_xiake', 'xiake'], ['diff_zongshi', 'zongshi'],
] as const;
function value(event: Event): string { return (event.target as HTMLInputElement | HTMLSelectElement).value; }
</script>

<template>
  <form class="tx-character-creation paper-panel" data-testid="character-creation" @submit.prevent="emit('submit')">
    <header><h1>{{ flowM1T('createTitle') }}</h1><p data-testid="flow-text">{{ flowM1T('createLead') }}</p></header>
    <div class="creation-grid">
      <label>{{ flowM1T('name') }}
        <input data-testid="character-name" required maxlength="12" autocomplete="off" :value="modelValue.name" @input="emit('change', 'name', value($event))">
      </label>
      <fieldset>
        <legend>{{ flowM1T('gender') }}</legend>
        <label v-for="gender in ['female', 'male'] as const" :key="gender"><input type="radio" name="gender" :value="gender" :checked="modelValue.gender === gender" @change="emit('change', 'gender', gender)">{{ flowM1T(gender) }}</label>
      </fieldset>
      <label>{{ flowM1T('appearance') }}
        <select data-testid="character-appearance" :value="modelValue.appearance" @change="emit('change', 'appearance', value($event))"><option value="appearance_default">素净</option><option value="hero_f01">清峻</option></select>
      </label>
      <label>{{ flowM1T('pronoun') }}
        <input data-testid="character-pronoun" required maxlength="8" :value="modelValue.pronoun" @input="emit('change', 'pronoun', value($event))">
      </label>
      <label>{{ flowM1T('origin') }}
        <select data-testid="character-origin" :value="modelValue.originId" @change="emit('change', 'originId', value($event))"><option v-for="origin in origins" :key="origin[0]" :value="origin[0]">{{ origin[1] }}</option></select>
      </label>
      <label>{{ flowT('difficulty') }}
        <select data-testid="character-difficulty" :value="modelValue.difficulty" @change="emit('change', 'difficulty', value($event))"><option v-for="difficulty in difficulties" :key="difficulty[0]" :value="difficulty[0]">{{ flowT(difficulty[1]) }}</option></select>
      </label>
    </div>
    <fieldset data-testid="creation-accessibility">
      <legend>无障碍</legend>
      <label>{{ flowT('textScale') }}<select :value="settings.textScale" @change="emit('setting', 'textScale', Number(value($event)))"><option v-for="scale in [100, 125, 150]" :key="scale" :value="scale">{{ scale }}%</option></select></label>
      <label><input type="checkbox" :checked="settings.reducedMotion" @change="emit('setting', 'reducedMotion', ($event.target as HTMLInputElement).checked)">{{ flowT('reducedMotion') }}</label>
      <label><input type="checkbox" :checked="settings.subtitles" @change="emit('setting', 'subtitles', ($event.target as HTMLInputElement).checked)">{{ flowT('subtitles') }}</label>
    </fieldset>
    <button data-testid="character-submit" class="primary" type="submit" :disabled="busy || !props.modelValue.name.trim() || !props.modelValue.pronoun.trim()">{{ flowM1T('begin') }}</button>
  </form>
</template>

<style scoped>
.tx-character-creation { display: grid; gap: 1rem; max-width: 58rem; margin: auto; padding: 1.5rem; }
h1, p { margin: 0; } .creation-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: .8rem 1rem; }
label { display: grid; gap: .3rem; } fieldset { display: flex; flex-wrap: wrap; gap: .75rem; margin: 0; }
input, select, button { min-height: 44px; font: inherit; } button { justify-self: end; padding-inline: 1.25rem; }
</style>
