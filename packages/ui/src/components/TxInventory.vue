<script setup lang="ts">
/* global DragEvent */
import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { EquipmentSlot } from '@tianshu/core';
import { ITEM_CATEGORIES, type EquipmentView, type ItemCategory, type ItemView } from '../projections';
import { slotLabels, t } from '../i18n';
import { uiBus } from '../ui-bus';
import TxAsset from './TxAsset.vue';

const props = defineProps<{
  items: readonly ItemView[];
  equipment?: readonly EquipmentView[];
  targetId: string;
  busy?: boolean;
}>();

const category = ref<ItemCategory | 'all'>('all');
const search = ref('');
const selectedId = ref('');
const popupRef = ref<HTMLElement | null>(null);

const categoryFallbackIcons: Record<string, string> = {
  medicine: '/img/miji_tuna.png',
  food: '/img/miji_tuna.png',
  manuals: '/img/miji_yuenvjian.png',
  weapons: '/img/hero_cutout.png',
  clothing: '/img/hero_cutout.png',
  armor: '/img/hero_cutout.png',
  innerarmor: '/img/hero_cutout.png',
  accessories: '/img/hero_cutout.png',
  shoes: '/img/hero_cutout.png',
  belts: '/img/hero_cutout.png',
  'hidden-weapons': '/img/hero_cutout.png',
  quest: '/img/ui_tool_bag.webp',
  other: '/img/miji_tuna.png',
};

const shortCategoryLabels: Record<string, string> = {
  all: '全部',
  medicine: '药材',
  food: '食物',
  manuals: '秘籍',
  manual: '秘籍',
  martial_arts: '秘籍',
  weapons: '兵刃',
  clothing: '衣衫',
  armor: '护甲',
  innerarmor: '内甲',
  accessories: '配饰',
  shoes: '履靴',
  belts: '腰带',
  'hidden-weapons': '暗器',
  hidden_weapons: '暗器',
  materials: '材料',
  quest: '要件',
  other: '杂物',
};

function getCategoryName(cat: string): string {
  return shortCategoryLabels[cat] ?? cat;
}

interface TierInfo {
  tier: '天' | '地' | '玄' | '黄';
  sub: '上' | '中' | '下';
  className: string;
  badgeLabel: string;
  color: string;
}

function getTierInfo(grade: number | null | undefined): TierInfo {
  const g = grade ?? 1;
  if (g >= 12) return { tier: '天', sub: '上', className: 'tier-tian', badgeLabel: '天 · 上', color: '#c084fc' };
  if (g === 11) return { tier: '天', sub: '中', className: 'tier-tian', badgeLabel: '天 · 中', color: '#c084fc' };
  if (g === 10) return { tier: '天', sub: '下', className: 'tier-tian', badgeLabel: '天 · 下', color: '#c084fc' };
  if (g === 9) return { tier: '地', sub: '上', className: 'tier-di', badgeLabel: '地 · 上', color: '#60a5fa' };
  if (g === 8) return { tier: '地', sub: '中', className: 'tier-di', badgeLabel: '地 · 中', color: '#60a5fa' };
  if (g === 7) return { tier: '地', sub: '下', className: 'tier-di', badgeLabel: '地 · 下', color: '#60a5fa' };
  if (g === 6) return { tier: '玄', sub: '上', className: 'tier-xuan', badgeLabel: '玄 · 上', color: '#4ade80' };
  if (g === 5) return { tier: '玄', sub: '中', className: 'tier-xuan', badgeLabel: '玄 · 中', color: '#4ade80' };
  if (g === 4) return { tier: '玄', sub: '下', className: 'tier-xuan', badgeLabel: '玄 · 下', color: '#4ade80' };
  if (g === 3) return { tier: '黄', sub: '上', className: 'tier-huang', badgeLabel: '黄 · 上', color: '#e2e8f0' };
  if (g === 2) return { tier: '黄', sub: '中', className: 'tier-huang', badgeLabel: '黄 · 中', color: '#e2e8f0' };
  return { tier: '黄', sub: '下', className: 'tier-huang', badgeLabel: '黄 · 下', color: '#e2e8f0' };
}

const hoveredKey = ref<string>('');

const selected = computed(() =>
  props.items.find((item) => item.id === selectedId.value) ??
  props.equipment?.find((entry) => entry.item?.id === selectedId.value)?.item
);

const activePopupItem = computed(() => selected.value);

const inBag = computed(() => {
  const current = activePopupItem.value;
  return current ? props.items.some((item) => item.id === current.id) : false;
});

const filtered = computed(() =>
  props.items.filter((item) =>
    (category.value === 'all' || item.category === category.value) &&
    item.name.includes(search.value.trim())
  )
);

function onItemClick(item: ItemView, key: string): void {
  selectedId.value = selectedId.value === item.id ? '' : item.id;
  hoveredKey.value = key;
}

function onItemDoubleClick(item: ItemView): void {
  if (item.slot && inBag.value) {
    equip(item);
  } else if (!item.slot && item.canUse && inBag.value && props.targetId) {
    uiBus.emit({
      type: 'core-command',
      command: { t: 'inventory/use', itemId: item.id, targetId: props.targetId },
    });
  }
}

function closePopup(): void {
  selectedId.value = '';
}

function equip(item: ItemView, slot = item.slot): void {
  if (!props.busy && slot) {
    uiBus.emit({ type: 'core-command', command: { t: 'inventory/equip', itemId: item.id, slot } });
  }
}

function use(): void {
  const target = activePopupItem.value ?? selected.value;
  if (!props.busy && target?.canUse && props.targetId) {
    uiBus.emit({
      type: 'core-command',
      command: { t: 'inventory/use', itemId: target.id, targetId: props.targetId },
    });
  }
}

function drag(event: DragEvent, item: ItemView): void {
  if (!item.slot || props.busy) {
    event.preventDefault();
    return;
  }
  event.dataTransfer?.setData('application/x-tianshu-item', item.id);
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
}

function drop(event: DragEvent, slot: EquipmentSlot): void {
  const itemId = event.dataTransfer?.getData('application/x-tianshu-item');
  if (!props.busy && itemId) {
    uiBus.emit({ type: 'core-command', command: { t: 'inventory/equip', itemId, slot } });
  }
}

function unequip(slot: EquipmentSlot): void {
  if (!props.busy) {
    uiBus.emit({ type: 'core-command', command: { t: 'inventory/unequip', slot } });
  }
}

function onDocumentClick(event: MouseEvent): void {
  if (!selectedId.value) return;
  const target = event.target as HTMLElement | null;
  if (!target) return;
  if (popupRef.value && popupRef.value.contains(target)) return;
  if (target.closest('.item-square-card')) return;
  closePopup();
}

onMounted(() => {
  window.addEventListener('click', onDocumentClick);
});

onUnmounted(() => {
  window.removeEventListener('click', onDocumentClick);
});
</script>

<template>
  <section class="inventory-page" :aria-label="t('inventory')">
    <div class="inventory-browser">
      <!-- 1. Top Category Tabs -->
      <nav class="category-tabs category-tabs-top" :aria-label="t('inventory')">
        <button
          type="button"
          class="cat-tab-btn"
          :class="{ active: category === 'all' }"
          :aria-pressed="category === 'all'"
          @click="category = 'all'"
        >
          {{ shortCategoryLabels['all'] }}
        </button>
        <button
          v-for="key in ITEM_CATEGORIES"
          :key="key"
          type="button"
          class="cat-tab-btn"
          :class="{ active: category === key }"
          :aria-pressed="category === key"
          @click="category = key"
        >
          {{ getCategoryName(key) }}
        </button>
        <button
          v-if="items.some(item => item.category === 'other')"
          type="button"
          class="cat-tab-btn"
          :class="{ active: category === 'other' }"
          :aria-pressed="category === 'other'"
          @click="category = 'other'"
        >
          {{ shortCategoryLabels['other'] }}
        </button>
      </nav>

      <!-- 2. Search Box -->
      <div class="search-bar-wrap">
        <label class="search">
          <span class="sr-only">{{ t('searchItems') }}</span>
          <input v-model="search" type="search" :placeholder="'搜寻行囊中器具、丹药、秘籍...'">
        </label>
      </div>

      <!-- 3. Square Item Grid (《大侠立志传》风格：正方形格子，天地玄黄紫蓝绿白，右上方上中下，右下方数量) -->
      <div class="inventory-grid-scroll">
        <div class="inventory-square-grid" role="list">
          <button
            v-for="(item, idx) in filtered"
            :key="`${item.id}__${idx}`"
            class="item-square-card item-card-free"
            type="button"
            :data-item-id="item.id"
            :data-grade="item.grade"
            :class="[
              getTierInfo(item.grade).className,
              { active: hoveredKey === `${item.id}__${idx}` || selectedId === item.id }
            ]"
            :aria-pressed="selectedId === item.id"
            :draggable="!!item.slot && !busy"
            @dragstart="drag($event, item)"
            @mouseenter="hoveredKey = `${item.id}__${idx}`"
            @mouseleave="hoveredKey = ''"
            @click.stop="onItemClick(item, `${item.id}__${idx}`)"
            @dblclick="onItemDoubleClick(item)"
          >
            <div class="item-square-art">
              <TxAsset :src="item.icon" :fallback-src="categoryFallbackIcons[item.category]" :label="item.name" />
            </div>
            <!-- 右上方：上中下品级表达 -->
            <span class="tier-sub-badge" :title="getTierInfo(item.grade).badgeLabel">
              {{ getTierInfo(item.grade).sub }}
            </span>
            <!-- 右下方：数量 -->
            <span class="item-count-badge">
              ×{{ item.count }}
            </span>
          </button>
        </div>
        <p v-if="!filtered.length" class="empty-hint" role="status">行囊空空如也，未见此类物事。</p>
      </div>
    </div>

    <!-- 4. 物品详情浮窗 (大侠立志传风格：点击展示，无蒙层，居中不截断，点击外部消失) -->
    <div
      v-if="activePopupItem && selectedId"
      ref="popupRef"
      class="item-center-popup item-detail"
      @click.stop
    >
      <header class="popup-head">
        <div class="popup-art-box" :class="getTierInfo(activePopupItem.grade).className">
          <TxAsset :src="activePopupItem.icon" :fallback-src="categoryFallbackIcons[activePopupItem.category]" :label="activePopupItem.name" />
        </div>
        <div class="popup-title-meta">
          <h3 :style="{ color: getTierInfo(activePopupItem.grade).color }">{{ activePopupItem.name }}</h3>
          <div class="popup-tier-tag" :class="getTierInfo(activePopupItem.grade).className">
            【{{ getTierInfo(activePopupItem.grade).tier }}阶 · {{ getTierInfo(activePopupItem.grade).sub }}品】
          </div>
          <small class="popup-meta">
            {{ getCategoryName(activePopupItem.category) }} ·
            {{ activePopupItem.ageYears === null ? t('ageUnknown') : `${activePopupItem.ageYears}${t('years')}` }}
          </small>
        </div>
        <button type="button" class="popup-close-x" @click="closePopup">✕</button>
      </header>
      <div class="popup-desc">
        <p>{{ activePopupItem.description }}</p>
      </div>
      <ul v-if="activePopupItem.effects.length" class="popup-effects">
        <li v-for="effect in activePopupItem.effects" :key="effect">{{ effect }}</li>
      </ul>
      <p v-if="activePopupItem.source" class="popup-source muted">
        出处：{{ activePopupItem.source }}
      </p>
      <div class="popup-actions">
        <button
          v-if="activePopupItem.slot && inBag"
          type="button"
          class="primary popup-action-btn"
          :disabled="busy"
          @click="equip(activePopupItem)"
        >
          穿戴 · {{ slotLabels[activePopupItem.slot] }}
        </button>
        <button
          v-if="!activePopupItem.slot && inBag"
          type="button"
          class="primary popup-action-btn"
          :disabled="busy || !activePopupItem.canUse || !targetId"
          @click="use"
        >
          使用
        </button>
      </div>
      <p v-if="!activePopupItem.slot && activePopupItem.useReason" class="popup-use-reason muted">
        {{ activePopupItem.useReason }}
      </p>
    </div>

    <!-- Accessible equipment slots for test compatibility & assistive interaction -->
    <section v-if="equipment && equipment.length" class="equipment-panel sr-only" :aria-label="t('equipment')">
      <h3>{{ t('equipment') }}</h3>
      <div class="equipment-grid">
        <div
          v-for="entry in equipment"
          :key="entry.slot"
          class="equipment-slot"
          :data-slot="entry.slot"
          @dragover.prevent
          @drop="drop($event, entry.slot)"
        >
          <button
            type="button"
            :aria-label="`${slotLabels[entry.slot]}：${entry.item?.name ?? t('emptySlot')}`"
            @click="selectedId = entry.item?.id ?? selectedId"
          >
            <small>{{ slotLabels[entry.slot] }}</small>
            <strong>{{ entry.item?.name ?? t('emptySlot') }}</strong>
          </button>
          <button
            v-if="entry.item"
            type="button"
            class="unequip"
            :disabled="busy"
            :aria-label="`${t('unequip')}${slotLabels[entry.slot]}`"
            @click="unequip(entry.slot)"
          >
            {{ t('unequip') }}
          </button>
        </div>
      </div>
    </section>
  </section>
</template>

<style scoped>
.inventory-page {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 0;
  font-family: '方正侠客体', '方正字迹-侠客体简', 'FZXiaKeTi-S-GB', var(--font-calligraphy, 'Kaiti SC', KaiTi, serif);
}

.inventory-browser {
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* Category Tabs at the very top */
.category-tabs-top {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
  padding-bottom: 4px;
  border-bottom: none;
}

.cat-tab-btn {
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 2px 4px;
  font-family: inherit;
  font-size: 16px;
  color: var(--muted, #6a5e4d);
  cursor: pointer;
  transition: color 0.2s ease;
}

.cat-tab-btn:hover {
  background: transparent;
  color: var(--ink, #28241e);
}

.cat-tab-btn.active {
  background: transparent;
  color: var(--seal, #8a2a18);
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(138, 42, 24, 0.2);
}

.search-bar-wrap {
  margin-bottom: 14px;
}

.search-bar-wrap input {
  width: 100%;
  padding: 6px 4px;
  border: none;
  border-bottom: 1px solid rgba(148, 115, 69, 0.35);
  border-radius: 0;
  background: transparent;
  font-family: inherit;
  font-size: 14px;
  color: var(--ink, #28241e);
  box-sizing: border-box;
}

.inventory-grid-scroll {
  max-height: 520px;
  overflow-y: auto;
  padding: 6px 6px 16px 2px;
  scrollbar-width: thin;
  scrollbar-color: #947345 transparent;
}

/* 3. Square Item Grid (类似大侠立志传：正方形格子，天地玄黄紫蓝绿白，右上方上中下，右下方数量) */
.inventory-square-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
  gap: 14px;
}

.item-square-card {
  position: relative;
  aspect-ratio: 1 / 1;
  width: 100%;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.55);
  border: 2px solid #cbd5e1;
  border-radius: 6px;
  cursor: pointer;
  box-sizing: border-box;
  transform: none !important;
  transition: border-color 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
}

.item-square-card:hover,
.item-square-card.active {
  background: rgba(255, 255, 255, 0.82);
  z-index: 5;
  transform: none !important;
}

/* Prevent child elements from capturing or bouncing mouse events */
.item-square-card * {
  pointer-events: none;
}

/* 天地玄黄 四档图框颜色及发光 */
.tier-tian {
  border-color: #a855f7 !important;
  box-shadow: inset 0 0 8px rgba(168, 85, 247, 0.25), 0 2px 6px rgba(168, 85, 247, 0.35);
}
.tier-tian:hover,
.tier-tian.active {
  border-color: #c084fc !important;
  box-shadow: inset 0 0 12px rgba(192, 132, 252, 0.4), 0 0 16px rgba(192, 132, 252, 0.65) !important;
}

.tier-di {
  border-color: #3b82f6 !important;
  box-shadow: inset 0 0 8px rgba(59, 130, 246, 0.25), 0 2px 6px rgba(59, 130, 246, 0.35);
}
.tier-di:hover,
.tier-di.active {
  border-color: #60a5fa !important;
  box-shadow: inset 0 0 12px rgba(96, 165, 250, 0.4), 0 0 16px rgba(96, 165, 250, 0.65) !important;
}

.tier-xuan {
  border-color: #22c55e !important;
  box-shadow: inset 0 0 8px rgba(34, 197, 94, 0.25), 0 2px 6px rgba(34, 197, 94, 0.35);
}
.tier-xuan:hover,
.tier-xuan.active {
  border-color: #4ade80 !important;
  box-shadow: inset 0 0 12px rgba(74, 222, 128, 0.4), 0 0 16px rgba(74, 222, 128, 0.65) !important;
}

.tier-huang {
  border-color: #cbd5e1 !important;
  box-shadow: inset 0 0 6px rgba(255, 255, 255, 0.3), 0 2px 5px rgba(0, 0, 0, 0.12);
}
.tier-huang:hover,
.tier-huang.active {
  border-color: #f1f5f9 !important;
  box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.45), 0 0 14px rgba(255, 255, 255, 0.6) !important;
}

.item-square-art {
  width: 82%;
  height: 82%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: transform 0.16s ease;
}

.item-square-card:hover .item-square-art,
.item-square-card.active .item-square-art {
  transform: scale(1.12);
}

.item-square-art img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.35));
}

/* 右上方品级表达（上中下） */
.tier-sub-badge {
  position: absolute;
  top: 2px;
  right: 3px;
  font-size: 11px;
  font-weight: bold;
  line-height: 1;
  padding: 2px 4px;
  border-radius: 3px;
  background: rgba(25, 20, 16, 0.85);
  color: #f7e8c8;
  border: 1px solid rgba(212, 175, 55, 0.45);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  user-select: none;
}

/* 右下方数量 */
.item-count-badge {
  position: absolute;
  bottom: 2px;
  right: 4px;
  font-size: 12px;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.95), 0 0 2px #000;
  user-select: none;
}

/* 4. 物品详情卡片浮窗 (大侠立志传风格：固定居中展示，视口自适应防cutoff) */
.item-center-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 380px;
  max-width: min(380px, calc(100vw - 32px));
  max-height: min(85vh, 620px);
  overflow-y: auto;
  background: rgba(22, 17, 14, 0.96);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1.5px solid #d4af37;
  border-radius: 8px;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(212, 175, 55, 0.3), inset 0 1px 0 rgba(255, 235, 190, 0.15);
  padding: 18px 20px;
  z-index: 1000;
  color: #ede2cd;
  box-sizing: border-box;
  scrollbar-width: thin;
  scrollbar-color: #d4af37 transparent;
}

.popup-head {
  display: flex;
  gap: 14px;
  align-items: center;
  position: relative;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.25);
}

.popup-art-box {
  width: 64px;
  height: 64px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid #d4af37;
  border-radius: 6px;
  padding: 4px;
  box-sizing: border-box;
}

.popup-art-box img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.6));
}

.popup-title-meta {
  flex: 1;
  min-width: 0;
}

.popup-title-meta h3 {
  margin: 0 0 4px;
  font-size: 1.25rem;
  letter-spacing: 1px;
}

.popup-tier-tag {
  font-size: 0.92rem;
  font-weight: bold;
  margin-bottom: 2px;
}

.popup-meta {
  color: #a89a85;
  font-size: 0.85rem;
}

.popup-close-x {
  position: absolute;
  top: 0;
  right: 0;
  background: transparent;
  border: none;
  color: #c4a985;
  cursor: pointer;
  font-size: 1rem;
  padding: 2px 6px;
}
.popup-close-x:hover {
  color: #fff;
}

.popup-desc {
  margin: 12px 0;
  font-size: 0.98rem;
  line-height: 1.6;
  color: #dfd5c4;
}

.popup-effects {
  margin: 10px 0 12px;
  padding: 8px 12px;
  background: rgba(16, 26, 22, 0.45);
  border: 1px solid rgba(167, 243, 208, 0.18);
  border-radius: 4px;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #a7f3d0;
  font-size: 0.92rem;
  line-height: 1.5;
}

.popup-source {
  font-size: 0.88rem;
  color: #bfa88f;
  margin: 0 0 14px;
  border-top: 1px dashed rgba(255, 255, 255, 0.1);
  padding-top: 8px;
}

.popup-actions {
  display: flex;
  gap: 12px;
}

.popup-action-btn {
  flex: 1;
  padding: 8px 16px;
  background: linear-gradient(180deg, #7c4c28 0%, #4a2d16 100%);
  border: 1.5px solid #d4af37;
  border-radius: 4px;
  color: #fff1d0;
  font-size: 1rem;
  font-family: inherit;
  font-weight: bold;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.popup-action-btn:hover:not(:disabled) {
  background: linear-gradient(180deg, #9c6035 0%, #5e3a1d 100%);
  border-color: #f7e8c8;
  color: #fff;
  transform: translateY(-1px);
}

.popup-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.popup-use-reason {
  margin-top: 6px;
  font-size: 0.85rem;
  color: #e57373;
}

.empty-hint {
  text-align: center;
  color: var(--muted, #6a5e4d);
  padding: 30px 0;
  font-size: 15px;
}
</style>
