<script setup lang="ts">
/* global DragEvent */
import { computed, ref } from 'vue';
import type { EquipmentSlot } from '@tianshu/core';
import { ITEM_CATEGORIES, type EquipmentView, type ItemCategory, type ItemView } from '../projections';
import { categoryLabels, gradeLabel, slotLabels, t } from '../i18n';
import { uiBus } from '../ui-bus';
import TxAsset from './TxAsset.vue';
import TxVirtualList from './TxVirtualList.vue';
const props = defineProps<{ items: readonly ItemView[]; equipment: readonly EquipmentView[]; targetId: string; busy?: boolean }>();
const category = ref<ItemCategory | 'all'>('all');
const search = ref('');
const selectedId = ref('');
const selected = computed(() => props.items.find((item) => item.id === selectedId.value) ?? props.equipment.find((entry) => entry.item?.id === selectedId.value)?.item);
const inBag = computed(() => props.items.some((item) => item.id === selectedId.value));
const filtered = computed(() => props.items.filter((item) => (category.value === 'all' || item.category === category.value) && item.name.includes(search.value.trim())));
const virtualKey = computed(() => `${category.value}/${search.value}`);
function equip(item: ItemView, slot = item.slot): void {
  if (!props.busy && slot) uiBus.emit({ type: 'core-command', command: { t: 'inventory/equip', itemId: item.id, slot } });
}
function use(): void {
  if (!props.busy && selected.value?.canUse && props.targetId) uiBus.emit({ type: 'core-command', command: {
    t: 'inventory/use', itemId: selected.value.id, targetId: props.targetId,
  } });
}
function unequip(slot: EquipmentSlot): void {
  if (!props.busy) uiBus.emit({ type: 'core-command', command: { t: 'inventory/unequip', slot } });
}
function drag(event: DragEvent, item: ItemView): void {
  if (!item.slot || props.busy) { event.preventDefault(); return; }
  event.dataTransfer?.setData('application/x-tianshu-item', item.id);
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
}
function drop(event: DragEvent, slot: EquipmentSlot): void {
  event.preventDefault();
  const item = props.items.find((entry) => entry.id === event.dataTransfer?.getData('application/x-tianshu-item'));
  if (item) equip(item, slot);
}
</script>

<template>
  <section class="inventory-page" :aria-label="t('inventory')">
    <div class="inventory-browser">
      <label class="search"><span class="sr-only">{{ t('searchItems') }}</span><input v-model="search" type="search" :placeholder="t('searchItems')"></label>
      <nav class="category-tabs" :aria-label="t('inventory')">
        <button type="button" :aria-pressed="category === 'all'" @click="category = 'all'">{{ t('all') }}</button>
        <button v-for="key in ITEM_CATEGORIES" :key="key" type="button" :aria-pressed="category === key" @click="category = key">{{ categoryLabels[key] }}</button>
        <button v-if="items.some(item => item.category === 'other')" type="button" :aria-pressed="category === 'other'" @click="category = 'other'">{{ t('other') }}</button>
      </nav>
      <TxVirtualList :key="virtualKey" :items="filtered" :item-key="item => item.id" :label="t('inventory')" :row-height="112" :min-width="240" :height="520">
        <template #default="{ item }">
          <button class="item-card" type="button" :data-item-id="item.id" :data-grade="item.grade" :aria-pressed="selectedId === item.id" :draggable="!!item.slot && !busy" @dragstart="drag($event, item)" @click="selectedId = item.id">
            <TxAsset :src="item.icon" :label="item.name" /><span><strong>{{ item.name }}</strong><small>{{ gradeLabel(item.grade) }} · ×{{ item.count }}</small></span>
          </button>
        </template>
      </TxVirtualList>
      <p v-if="!filtered.length" role="status">{{ t('emptyItems') }}</p>
    </div>
    <aside class="inventory-aside">
      <section class="item-detail paper-panel" :aria-label="t('itemDetail')">
        <template v-if="selected">
          <header class="item-title"><TxAsset :src="selected.icon" :label="selected.name" /><div><h3>{{ selected.name }}</h3><small>{{ gradeLabel(selected.grade) }} · {{ selected.ageYears === null ? t('ageUnknown') : `${selected.ageYears}${t('years')}` }}</small></div></header>
          <p>{{ selected.description }}</p>
          <ul v-if="selected.effects.length"><li v-for="effect in selected.effects" :key="effect">{{ effect }}</li></ul>
          <p class="muted">{{ t('source') }}：{{ selected.source }}</p>
          <div class="action-row">
            <button v-if="selected.slot && inBag" type="button" class="primary" :disabled="busy" @click="equip(selected)">{{ t('equip') }} · {{ slotLabels[selected.slot] }}</button>
            <button v-if="!selected.slot && inBag" type="button" class="primary" :disabled="busy || !selected.canUse || !targetId" @click="use">{{ t('use') }}</button>
          </div>
          <p v-if="!selected.slot && selected.useReason" class="muted">{{ selected.useReason }}</p>
        </template>
        <p v-else>{{ t('selectItem') }}</p>
      </section>
      <section class="equipment-panel" :aria-label="t('equipment')">
        <h3>{{ t('equipment') }}</h3><p class="muted">{{ t('slotHint') }}</p>
        <div class="equipment-grid">
          <div v-for="entry in equipment" :key="entry.slot" class="equipment-slot" :data-slot="entry.slot" @dragover.prevent @drop="drop($event, entry.slot)">
            <button type="button" :aria-label="`${slotLabels[entry.slot]}：${entry.item?.name ?? t('emptySlot')}`" @click="selectedId = entry.item?.id ?? selectedId"><small>{{ slotLabels[entry.slot] }}</small><strong>{{ entry.item?.name ?? t('emptySlot') }}</strong></button>
            <button v-if="entry.item" type="button" class="unequip" :disabled="busy" :aria-label="`${t('unequip')}${slotLabels[entry.slot]}`" @click="unequip(entry.slot)">{{ t('unequip') }}</button>
          </div>
        </div>
      </section>
    </aside>
  </section>
</template>

<style scoped>
.inventory-page { display: grid; grid-template-columns: minmax(340px, 1.2fr) minmax(320px, 1fr); gap: 22px; min-height: 0; }
.inventory-browser { min-width: 0; display: flex; flex-direction: column; }
.category-tabs { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0; }
.category-tabs button { padding-inline: 12px; }
.item-card { width: 100%; height: 100%; display: flex; align-items: center; gap: 12px; text-align: left; border-left: 3px solid var(--grade-color, var(--line)); padding: 8px; }
.item-card > span { display: grid; gap: 6px; min-width: 0; }
.item-card strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.inventory-aside { overflow: auto; min-height: 0; }
.item-detail { padding: 18px; min-height: 210px; }
.item-title { display: flex; gap: 14px; align-items: center; }
.item-title h3 { margin: 0 0 6px; }
.equipment-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.equipment-slot { display: flex; border: 1px solid var(--line); }
.equipment-slot > button:first-child { display: grid; gap: 5px; flex: 1; text-align: left; border: none; padding: 10px; }
.unequip { border-block: 0; border-right: 0; padding: 6px; }
@media (max-width: 780px) { .inventory-page { grid-template-columns: 1fr; } .inventory-aside { overflow: visible; } }
</style>
