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
          <span class="save-mark" aria-hidden="true">{{ slot.kind === 'auto' ? '自' : slot.kind === 'quick' ? '快' : '卷' }}</span>
          <span><strong>{{ slot.label }}</strong><small>{{ slot.occupied ? slot.summary : t('saveEmpty') }}</small><small v-if="slot.occupied">{{ slot.savedAt }}</small></span>
        </button>
      </div>
    </div>
    <aside class="save-detail paper-panel">
      <h3>{{ selected?.label ?? t('saveSelected') }}</h3>
      <p>{{ selected?.occupied ? selected.summary : t('saveHint') }}</p>
      <div v-if="selected" class="save-actions">
        <button
          type="button"
          class="primary"
          :disabled="busy || !available || !selected.writable"
          @click="request('save')"
        >
          {{ t('save') }}
        </button>
        <button
          type="button"
          :disabled="busy || !available || !selected.occupied || !selected.readable"
          @click="request('load')"
        >
          {{ t('load') }}
        </button>
        <button
          type="button"
          :disabled="busy || !available || !selected.occupied"
          @click="emit('export', `${selected.id}|json`)"
        >
          {{ t('exportJson') }}
        </button>
        <button
          type="button"
          :disabled="busy || !available || !selected.occupied"
          @click="emit('export', `${selected.id}|tsav`)"
        >
          {{ t('exportTsav') }}
        </button>
        <button type="button" :disabled="busy || !available" @click="emit('export', '*|zip')">
          {{ t('exportAll') }}
        </button>
        <button
          type="button"
          :disabled="busy || !available || !selected.writable"
          @click="importInput?.click()"
        >
          {{ t('import') }}
        </button>
        <button
          type="button"
          class="danger"
          :disabled="busy || !available || !selected.occupied || selected.kind === 'checkpoint'"
          @click="request('remove')"
        >
          {{ t('remove') }}
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
        <h4>{{ t('saveHistory') }}</h4>
        <ol>
          <li v-for="generation in selected.generations" :key="generation.generation">
            <span>第 {{ generation.generation }} 代 · {{ generation.savedAt }}</span>
            <button
              v-if="!generation.current"
              type="button"
              :disabled="busy || !selected.readable"
              @click="emit('load', `${selected.id}|${generation.generation}`)"
            >
              {{ t('restoreGeneration') }}
            </button>
          </li>
        </ol>
      </section>
      <p class="muted">{{ t('exportHint') }}</p>
      <p v-if="persistence" class="muted">{{ t('persistence') }}：{{ persistence }}</p>
      <output role="status" aria-live="polite">{{ busy ? t('saveBusy') : status }}</output>
    </aside>
    <TxModal v-if="pending" :title="t('confirmTitle')" @close="pending = null">
      <p>{{ pending.label }}</p>
      <p>
        {{
          pending.action === 'save'
            ? t('overwrite')
            : pending.action === 'remove'
              ? t('deleteConfirm')
              : pending.action === 'import'
                ? t('importConfirm')
                : t('loadConfirm')
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
  grid-template-columns: minmax(300px, 1fr) minmax(300px, 0.7fr);
  gap: 24px;
  min-height: 0;
}
.save-list {
  overflow: auto;
  display: grid;
  gap: 10px;
  align-content: start;
}
.save-slot {
  display: flex;
  align-items: center;
  gap: 20px;
  text-align: left;
  width: 100%;
  min-height: 110px;
  padding: 14px;
}
.save-slot > span:last-child {
  display: grid;
  gap: 8px;
}
.save-mark {
  font: 28px var(--font-title);
  border: 1px solid var(--line);
  padding: 16px;
}
.save-detail {
  padding: 24px;
  align-self: start;
}
.save-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.save-history ol {
  padding-inline-start: 22px;
}
.save-history li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-block: 8px;
}
.save-detail output {
  display: block;
  overflow-wrap: anywhere;
}
@media (max-width: 780px) {
  .save-page {
    grid-template-columns: 1fr;
  }
  .save-list {
    max-height: 50dvh;
  }
}
</style>
