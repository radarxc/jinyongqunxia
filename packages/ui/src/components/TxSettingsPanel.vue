<script setup lang="ts">
import type { FlowSettingsView } from '../projections';
import { flowT } from '../i18n-flow';

defineProps<{ modelValue: FlowSettingsView; difficultyReadOnly?: boolean }>();
type SettingKey = keyof FlowSettingsView | keyof FlowSettingsView['volume'];
const emit = defineEmits<{ change: [key: SettingKey, value: unknown]; back: [] }>();

const volumes = [
  ['master', 'masterVolume'],
  ['music', 'musicVolume'],
  ['effects', 'effectsVolume'],
  ['voice', 'voiceVolume'],
] as const;
</script>

<template>
  <section class="tx-settings paper-panel" aria-labelledby="settings-heading">
    <header class="settings-header">
      <div class="header-title-box">
        <h2 id="settings-heading">{{ flowT('settings') }}</h2>
        <span class="header-subtitle">行囊调序 · 视听参详</span>
      </div>
      <button type="button" class="back-text-btn" @click="emit('back')">
        {{ flowT('back') }}
      </button>
    </header>

    <div class="settings-body">
      <!-- 1. Text Scale -->
      <div class="setting-item-row">
        <span class="setting-label">{{ flowT('textScale') }}</span>
        <fieldset class="segmented-control">
          <label
            v-for="scale in [100, 125, 150] as const"
            :key="scale"
            class="seg-pill"
            :class="{ active: modelValue.textScale === scale }"
          >
            <input
              type="radio"
              name="textScale"
              :value="scale"
              :checked="modelValue.textScale === scale"
              class="sr-only"
              @change="emit('change', 'textScale', scale)"
            >
            <span>{{ scale }}%</span>
          </label>
        </fieldset>
      </div>

      <!-- 2. Reduced Motion -->
      <div class="setting-item-row">
        <span class="setting-label">{{ flowT('reducedMotion') }}</span>
        <label class="wuxia-toggle">
          <input
            type="checkbox"
            :checked="modelValue.reducedMotion"
            class="toggle-checkbox"
            @change="emit('change', 'reducedMotion', ($event.target as HTMLInputElement).checked)"
          >
          <span class="toggle-display">{{ modelValue.reducedMotion ? '启用减动' : '自然灵动' }}</span>
        </label>
      </div>

      <!-- 小地图朝向（城镇探索 v2，AR-114） -->
      <div class="setting-item-row">
        <span class="setting-label">{{ flowT('minimapNorthUp') }}</span>
        <label class="wuxia-toggle">
          <input
            type="checkbox"
            :checked="modelValue.minimapNorthUp === true"
            :aria-label="flowT('minimapNorthUp')"
            class="toggle-checkbox"
            @change="emit('change', 'minimapNorthUp', ($event.target as HTMLInputElement).checked)"
          >
          <span class="toggle-display">{{ modelValue.minimapNorthUp ? '上北下南' : '随镜头转' }}</span>
        </label>
      </div>

      <!-- 3. Subtitles -->
      <div class="setting-item-row">
        <span class="setting-label">{{ flowT('subtitles') }}</span>
        <label class="wuxia-toggle">
          <input
            type="checkbox"
            :checked="modelValue.subtitles"
            class="toggle-checkbox"
            @change="emit('change', 'subtitles', ($event.target as HTMLInputElement).checked)"
          >
          <span class="toggle-display">{{ modelValue.subtitles ? '显录文辞' : '静默无声' }}</span>
        </label>
      </div>

      <!-- 4. Quality -->
      <div class="setting-item-row">
        <span class="setting-label">{{ flowT('quality') }}</span>
        <div class="select-wrapper">
          <select
            :value="modelValue.quality"
            class="wuxia-select"
            @change="emit('change', 'quality', ($event.target as HTMLSelectElement).value)"
          >
            <option value="auto">{{ flowT('auto') }} · 天地随宜</option>
            <option value="low">{{ flowT('low') }} · 疏简留白</option>
            <option value="mid">{{ flowT('medium') }} · 寻常造诣</option>
            <option value="high">{{ flowT('high') }} · 丹青雅韵</option>
            <option value="ultra">{{ flowT('ultra') }} · 浑然绝景</option>
          </select>
        </div>
      </div>

      <!-- 5. Difficulty -->
      <div class="setting-item-row">
        <span class="setting-label">{{ flowT('difficulty') }}</span>
        <div class="select-wrapper">
          <select
            :value="modelValue.difficulty"
            :disabled="difficultyReadOnly"
            class="wuxia-select"
            @change="emit('change', 'difficulty', ($event.target as HTMLSelectElement).value)"
          >
            <option value="diff_jianghu">{{ flowT('jianghu') }} · 初入江湖</option>
            <option value="diff_xiake">{{ flowT('xiake') }} · 侠客行藏</option>
            <option value="diff_zongshi">{{ flowT('zongshi') }} · 一代宗师</option>
          </select>
        </div>
      </div>

      <!-- 6. Volumes -->
      <div class="volumes-group">
        <div v-for="item in volumes" :key="item[0]" class="setting-item-row volume-row">
          <span class="setting-label">{{ flowT(item[1]) }}</span>
          <div class="slider-box">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              :aria-label="flowT(item[1])"
              :value="modelValue.volume[item[0]]"
              class="wuxia-range"
              @input="emit('change', item[0], Number(($event.target as HTMLInputElement).value))"
            >
            <output class="volume-val">{{ modelValue.volume[item[0]] }}%</output>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.tx-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 36rem;
  margin: 0 auto;
  padding: 20px 24px;
  background: rgba(249, 246, 238, 0.96);
  border: 1px solid rgba(148, 115, 69, 0.35);
  border-radius: 8px;
  font-family: '方正侠客体', '方正字迹-侠客体简', 'FZXiaKeTi-S-GB', 'FZXKT', 'Xingkai SC', 'STKaiti', cursive, serif;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(148, 115, 69, 0.25);
  padding-bottom: 12px;
}

.header-title-box {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.header-title-box h2 {
  margin: 0;
  font-size: 24px;
  color: var(--seal, #8a2a18);
  letter-spacing: 2px;
}

.header-subtitle {
  font-size: 13px;
  color: var(--muted, #6a5e4d);
}

.back-text-btn {
  background: transparent;
  border: none;
  color: var(--seal, #8a2a18);
  font-family: inherit;
  font-size: 16px;
  letter-spacing: 2px;
  cursor: pointer;
  padding: 4px 10px;
  transition: all 0.2s ease;
}

.back-text-btn:hover {
  color: #b84732;
  transform: scale(1.05);
}

.settings-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.setting-item-row {
  display: grid;
  grid-template-columns: 100px 1fr;
  align-items: center;
  gap: 16px;
  min-height: 38px;
}

.setting-label {
  font-size: 15px;
  color: var(--ink, #28241e);
  letter-spacing: 1px;
}

/* Segmented Control */
.segmented-control {
  border: none;
  padding: 0;
  margin: 0;
  display: inline-flex;
  gap: 6px;
}

.seg-pill {
  padding: 4px 14px;
  border: 1px solid rgba(148, 115, 69, 0.35);
  border-radius: 4px;
  background: rgba(148, 115, 69, 0.08);
  color: var(--ink, #28241e);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.seg-pill:hover {
  background: rgba(148, 115, 69, 0.18);
}

.seg-pill.active {
  background: var(--seal, #8a2a18);
  border-color: var(--seal, #8a2a18);
  color: #fff;
  font-weight: bold;
}

/* Wuxia Toggle */
.wuxia-toggle {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.toggle-checkbox {
  margin-right: 8px;
  accent-color: var(--seal, #8a2a18);
  width: 16px;
  height: 16px;
}

.toggle-display {
  font-size: 14px;
  color: var(--ink, #28241e);
}

/* Select */
.select-wrapper {
  position: relative;
  display: inline-block;
  max-width: 240px;
}

.wuxia-select {
  width: 100%;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(148, 115, 69, 0.4);
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
  color: var(--ink, #28241e);
  cursor: pointer;
}

.wuxia-select:focus {
  outline: none;
  border-color: var(--seal, #8a2a18);
}

/* Volume Slider */
.volumes-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-top: 1px dashed rgba(148, 115, 69, 0.25);
  padding-top: 12px;
}

.volume-row {
  min-height: 32px;
}

.slider-box {
  display: flex;
  align-items: center;
  gap: 12px;
}

.wuxia-range {
  flex: 1;
  accent-color: var(--seal, #8a2a18);
  cursor: pointer;
}

.volume-val {
  min-width: 42px;
  text-align: right;
  font-size: 13px;
  color: var(--muted, #6a5e4d);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
