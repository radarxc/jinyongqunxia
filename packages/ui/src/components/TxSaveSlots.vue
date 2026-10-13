<script setup lang="ts">
/* global File, HTMLInputElement, Event */
import { computed, ref } from 'vue';
import type { SaveSlotView } from '../projections';
import { t } from '../i18n';
import TxModal from './TxModal.vue';
const props = defineProps<{
  slots: readonly SaveSlotView[];
  busy: boolean;
  available: boolean;
  status: string;
  persistence?: string;
}>();
const emit = defineEmits<{
  save: [slot: string];
  load: [request: string];
  remove: [slot: string];
  export: [request: string];
  import: [slot: string, file: File];
}>();
const selectedId = ref('save_manual_01');
const selected = computed(
  () => props.slots.find((entry) => entry.id === selectedId.value) ?? props.slots[0],
);
const pending = ref<{
  action: 'save' | 'load' | 'remove' | 'import';
  slot: string;
  label: string;
  file?: File;
} | null>(null);
const importInput = ref<HTMLInputElement>();
function request(action: 'save' | 'load' | 'remove'): void {
  const slot = selected.value;
  if (!slot || props.busy || !props.available) return;
  if (action === 'save' && !slot.occupied) {
    emit('save', slot.id);
    return;
  }
  pending.value = { action, slot: slot.id, label: slot.label };
}
function pickFile(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file && selected.value)
    pending.value = {
      action: 'import',
      slot: selected.value.id,
      label: selected.value.label,
      file,
    };
  input.value = '';
}
function confirm(): void {
  const intent = pending.value;
  pending.value = null;
  if (!intent || props.busy) return;
  if (intent.action === 'import' && intent.file) emit('import', intent.slot, intent.file);
  else if (intent.action === 'save') emit('save', intent.slot);
  else if (intent.action === 'load') emit('load', intent.slot);
  else if (intent.action === 'remove') emit('remove', intent.slot);
}
</script>

<template>
  <section class="save-page" :aria-label="t('saves')" :aria-busy="busy">
    <div class="save-list" role="list" :aria-label="t('saves')">
      <div v-for="slot in slots" :key="slot.id" role="listitem">
        <button
          type="button"
          class="save-slot"
          :data-save-slot="slot.id"
          :aria-pressed="selected?.id === slot.id"
          @click="selectedId = slot.id"
        >
          <span class="save-mark scroll-mark" aria-hidden="true">
            <template v-if="slot.kind === 'auto'">自</template>
            <template v-else-if="slot.kind === 'quick'">快</template>
            <svg v-else class="save-scroll-svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 17V5a2 2 0 0 0-2-2H4" />
              <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
            </svg>
          </span>
          <span class="save-info"><strong>{{ slot.label }}</strong><small class="slot-desc">{{ slot.occupied ? slot.summary : '虚席待卷 · 未载事迹' }}</small><small v-if="slot.occupied" class="slot-time">{{ slot.savedAt }}</small></span>
        </button>
      </div>
    </div>
    <aside class="save-detail paper-panel">
      <header class="detail-header">
        <span class="detail-mark-icon">📜</span>
        <div>
          <h3>{{ selected?.label ?? '卷册纪要' }}</h3>
          <p class="summary-text">{{ selected?.occupied ? selected.summary : '选定槽位后，可秉笔记载江湖行止或忆及前尘。' }}</p>
        </div>
      </header>
      <div v-if="selected" class="save-actions">
        <button
          type="button"
          class="primary save-btn"
          :disabled="busy || !available || !selected.writable"
          @click="request('save')"
        >
          记载事迹
        </button>
        <button
          type="button"
          class="save-btn"
          :disabled="busy || !available || !selected.occupied || !selected.readable"
          @click="request('load')"
        >
          进入回忆
        </button>
        <button
          type="button"
          class="save-btn"
          :disabled="busy || !available || !selected.occupied"
          @click="emit('export', `${selected.id}|tsav`)"
        >
          导出
        </button>
        <button
          type="button"
          class="save-btn"
          :disabled="busy || !available || !selected.writable"
          @click="importInput?.click()"
        >
          导入
        </button>
        <button
          type="button"
          class="danger save-btn"
          :disabled="busy || !available || !selected.occupied || selected.kind === 'checkpoint'"
          @click="request('remove')"
        >
          焚卷抹迹
        </button>
      </div>
      <input
        ref="importInput"
        class="sr-only"
        type="file"
        accept=".json,.tsav,.tsui,.zip,application/json,application/octet-stream,application/zip"
        tabindex="-1"
        :aria-label="t('file')"
        @change="pickFile"
      >
      <section v-if="selected?.generations.length" class="save-history">
        <h4>卷册历代演变</h4>
        <ol>
          <li v-for="generation in selected.generations" :key="generation.generation">
            <span>第 {{ generation.generation }} 代 · {{ generation.savedAt }}</span>
            <button
              v-if="!generation.current"
              type="button"
              class="history-restore-btn"
              :disabled="busy || !selected.readable"
              @click="emit('load', `${selected.id}|${generation.generation}`)"
            >
              溯回此代
            </button>
          </li>
        </ol>
      </section>
      <output role="status" aria-live="polite" class="save-status-msg">{{ busy ? t('saveBusy') : status }}</output>
    </aside>
    <TxModal v-if="pending" :title="t('confirmTitle')" @close="pending = null">
      <p>{{ pending.label }}</p>
      <p>
        {{
          pending.action === 'save'
            ? '将以此番行止覆盖原有篇卷，是否确信？'
            : pending.action === 'remove'
              ? '焚去此卷篇幅，事迹将归于虚无，不可逆转。'
              : pending.action === 'import'
                ? '导入之旧卷将载入槽位，是否确认？'
                : '忆及旧日梦境，当前旅程将溯回彼时，是否启程？'
        }}
      </p>
      <p v-if="pending.file">{{ pending.file.name }}</p>
      <div class="action-row">
        <button type="button" @click="pending = null">{{ t('cancel') }}</button><button type="button" class="primary" data-confirm :disabled="busy" @click="confirm">
          {{ t('confirm') }}
        </button>
      </div>
    </TxModal>
  </section>
</template>

<style scoped>
.save-page {
  display: grid;
  grid-template-columns: minmax(280px, 1.1fr) minmax(240px, 0.9fr);
  gap: 14px;
  min-height: 0;
  font-family: '方正侠客体', '方正字迹-侠客体简', 'FZXiaKeTi-S-GB', var(--font-calligraphy, 'Kaiti SC', KaiTi, serif);
}
.save-list {
  overflow: auto;
  display: grid;
  gap: 8px;
  align-content: start;
}
.save-slot {
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  width: 100%;
  min-height: 62px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(148, 115, 69, 0.3);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;
}
.save-slot:hover {
  background: rgba(243, 234, 214, 0.85);
  border-color: rgba(148, 115, 69, 0.6);
  transform: translateY(-1px);
}
.save-slot[aria-pressed='true'] {
  background: rgba(243, 234, 214, 0.95);
  border-color: var(--seal, #8a2a18);
  box-shadow: 0 0 0 1px var(--seal, #8a2a18);
}
.save-info {
  display: grid;
  gap: 2px;
  min-width: 0;
}
.save-info strong {
  font-size: 15px;
  letter-spacing: 1.5px;
  color: var(--ink, #28241e);
}
.slot-desc {
  font-size: 12px;
  color: var(--muted, #6a5e4d);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.slot-time {
  font-size: 11px;
  color: #8c7b64;
}
.save-mark {
  font-size: 16px;
  border: 1px solid rgba(148, 115, 69, 0.4);
  border-radius: 4px;
  padding: 6px 10px;
  background: rgba(148, 115, 69, 0.08);
  color: var(--seal, #8a2a18);
  font-weight: bold;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.save-detail {
  padding: 14px;
  align-self: start;
  background: rgba(249, 246, 238, 0.96);
  border: 1px solid rgba(148, 115, 69, 0.35);
  border-radius: 6px;
}
.detail-header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  border-bottom: 1px solid rgba(148, 115, 69, 0.2);
  padding-bottom: 12px;
  margin-bottom: 16px;
}
.detail-mark-icon {
  font-size: 28px;
}
.detail-header h3 {
  margin: 0 0 6px;
  font-size: 20px;
  color: var(--seal, #8a2a18);
  letter-spacing: 2px;
}
.summary-text {
  margin: 0;
  font-size: 13px;
  color: var(--muted, #6a5e4d);
  line-height: 1.5;
}
.save-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 16px;
}
.save-btn {
  background: rgba(148, 115, 69, 0.12);
  border: 1px solid rgba(148, 115, 69, 0.45);
  border-radius: 4px;
  padding: 8px 12px;
  font-family: inherit;
  font-size: 15px;
  color: var(--ink, #28241e);
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 40px;
}
.save-btn:hover {
  background: rgba(148, 115, 69, 0.25);
  border-color: rgba(148, 115, 69, 0.7);
}
.save-btn.primary {
  background: rgba(138, 42, 24, 0.12);
  border-color: var(--seal, #8a2a18);
  color: var(--seal, #8a2a18);
  font-weight: bold;
}
.save-btn.primary:hover {
  background: var(--seal, #8a2a18);
  color: #fff;
}
.save-btn.danger {
  color: #8a3224;
  border-color: rgba(138, 42, 24, 0.35);
}
.save-btn.danger:hover {
  background: rgba(138, 42, 24, 0.15);
}
.save-history {
  border-top: 1px solid rgba(148, 115, 69, 0.2);
  padding-top: 12px;
  margin-top: 12px;
}
.save-history h4 {
  margin: 0 0 8px;
  font-size: 14px;
  color: var(--muted, #6a5e4d);
}
.save-history ol {
  padding-inline-start: 18px;
  margin: 0;
}
.save-history li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-block: 6px;
  font-size: 13px;
}
.history-restore-btn {
  background: transparent;
  border: none;
  color: #2b6c7a;
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
}
.save-status-msg {
  display: block;
  margin-top: 10px;
  font-size: 12px;
  color: var(--muted, #6a5e4d);
}
@media (max-width: 780px) {
  .save-page {
    grid-template-columns: 1fr;
  }
}
</style>
