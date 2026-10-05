<script setup lang="ts">
import type { FlowSettingsView } from '../projections';
import { flowT } from '../i18n-flow';
defineProps<{ modelValue: FlowSettingsView; difficultyReadOnly?: boolean }>();
type SettingKey = keyof FlowSettingsView | keyof FlowSettingsView['volume'];
const emit = defineEmits<{ change: [key: SettingKey, value: unknown]; back: [] }>();
const volumes = [
  ['master', 'masterVolume'], ['music', 'musicVolume'],
  ['effects', 'effectsVolume'], ['voice', 'voiceVolume'],
] as const;
</script>

<template>
  <section class="tx-settings paper-panel" aria-labelledby="settings-heading">
    <header><h2 id="settings-heading">{{ flowT('settings') }}</h2><button type="button" @click="emit('back')">{{ flowT('back') }}</button></header>
    <fieldset><legend>{{ flowT('textScale') }}</legend><label v-for="scale in [100, 125, 150] as const" :key="scale"><input type="radio" name="textScale" :value="scale" :checked="modelValue.textScale === scale" @change="emit('change', 'textScale', scale)">{{ scale }}%</label></fieldset>
    <label class="setting-row"><input type="checkbox" :checked="modelValue.reducedMotion" @change="emit('change', 'reducedMotion', ($event.target as HTMLInputElement).checked)">{{ flowT('reducedMotion') }}</label>
    <label class="setting-row"><input type="checkbox" :checked="modelValue.subtitles" @change="emit('change', 'subtitles', ($event.target as HTMLInputElement).checked)">{{ flowT('subtitles') }}</label>
    <label>{{ flowT('quality') }}<select :value="modelValue.quality" @change="emit('change', 'quality', ($event.target as HTMLSelectElement).value)"><option value="auto">{{ flowT('auto') }}</option><option value="low">{{ flowT('low') }}</option><option value="mid">{{ flowT('medium') }}</option><option value="high">{{ flowT('high') }}</option><option value="ultra">{{ flowT('ultra') }}</option></select></label>
    <label>{{ flowT('difficulty') }}<select :value="modelValue.difficulty" :disabled="difficultyReadOnly" @change="emit('change', 'difficulty', ($event.target as HTMLSelectElement).value)"><option value="diff_jianghu">{{ flowT('jianghu') }}</option><option value="diff_xiake">{{ flowT('xiake') }}</option><option value="diff_zongshi">{{ flowT('zongshi') }}</option></select></label>
    <label v-for="item in volumes" :key="item[0]">{{ flowT(item[1]) }}<input type="range" min="0" max="100" step="1" :aria-label="flowT(item[1])" :value="modelValue.volume[item[0]]" @input="emit('change', item[0], Number(($event.target as HTMLInputElement).value))"><output>{{ modelValue.volume[item[0]] }}%</output></label>
  </section>
</template>

<style scoped>
.tx-settings { display: grid; gap: 1rem; max-width: 42rem; margin: auto; padding: 1.5rem; }
header { display: flex; justify-content: space-between; align-items: center; } h2 { margin: 0; }
fieldset { display: flex; flex-wrap: wrap; gap: 1rem; } label { display: flex; gap: .65rem; align-items: center; justify-content: space-between; min-height: 44px; }
select, button { min-height: 44px; font: inherit; } input[type=range] { flex: 1; } output { min-width: 3.5em; text-align: right; }
</style>
