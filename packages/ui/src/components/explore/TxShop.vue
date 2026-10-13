<script setup lang="ts">
/* global Event, HTMLElement, HTMLInputElement, KeyboardEvent */
import { computed, nextTick, onMounted, ref } from 'vue';
import { gradeLabel } from '../../i18n';
import { formatWen, maxAffordable } from '../../explore/money';
import TxAsset from '../TxAsset.vue';
import { TX_SHOP_STRINGS as strings } from './TxShop.strings';
import type { ShopIntent, ShopPanelView, ShopRow } from './TxShop.types';

type ShopTab = 'buy' | 'sell';
const props = defineProps<{ readonly view: ShopPanelView }>();
const emit = defineEmits<{ buy: [intent: ShopIntent]; sell: [intent: ShopIntent]; close: [] }>();
const root = ref<HTMLElement>();
const tab = ref<ShopTab>('buy');
const counts = ref<Record<string, number>>({});
const rows = computed(() => props.view.rows[tab.value]);

function quantityKey(row: ShopRow): string {
  return `${tab.value}:${row.itemId}`;
}
function limit(row: ShopRow): number {
  if (row.disabledReason || row.unitPriceWen <= 0) return 0;
  return tab.value === 'buy'
    ? maxAffordable(props.view.moneyWen, row.unitPriceWen, row.stock ?? 0)
    : row.owned;
}
function quantity(row: ShopRow): number {
  const current = counts.value[quantityKey(row)] ?? 1;
  return Math.max(1, Math.min(current, Math.max(1, limit(row))));
}
function step(row: ShopRow, delta: -1 | 1): void {
  const maximum = limit(row);
  if (maximum < 1) return;
  counts.value[quantityKey(row)] = Math.max(1, Math.min(quantity(row) + delta, maximum));
}
function setQuantity(row: ShopRow, event: Event): void {
  const input = event.target as HTMLInputElement;
  const requested = Number(input.value);
  const maximum = limit(row);
  if (maximum < 1 || !Number.isSafeInteger(requested)) {
    input.value = String(quantity(row));
    return;
  }
  const clamped = Math.max(1, Math.min(requested, maximum));
  counts.value[quantityKey(row)] = clamped;
  input.value = String(clamped);
}
function confirm(row: ShopRow): void {
  if (props.view.busy || row.disabledReason || limit(row) < 1) return;
  const intent = { itemId: row.itemId, count: quantity(row), unitPriceWen: row.unitPriceWen };
  if (tab.value === 'buy') emit('buy', intent);
  else emit('sell', intent);
}
async function selectTab(next: ShopTab): Promise<void> {
  tab.value = next;
  await nextTick();
  focusFirstRow();
}
function focusFirstRow(): void {
  const target = root.value?.querySelector<HTMLElement>('.shop-row button:not(:disabled)')
    ?? root.value?.querySelector<HTMLElement>('.close');
  target?.focus();
}
function keydown(event: KeyboardEvent): void {
  if (event.key !== 'Escape') return;
  event.preventDefault();
  event.stopPropagation();
  emit('close');
}
onMounted(async () => {
  await nextTick();
  focusFirstRow();
});
</script>

<template>
  <section ref="root" class="shop-panel paper-panel" role="dialog" aria-modal="true" :aria-label="view.title" @keydown="keydown">
    <header class="shop-heading">
      <div><small>{{ view.facilityKind }}</small><h2>{{ view.title }}</h2></div>
      <p class="money"><span>{{ strings.money }}</span><strong>{{ formatWen(view.moneyWen) }}</strong></p>
      <button type="button" class="close" :aria-label="strings.close" @click="emit('close')">×</button>
    </header>

    <nav class="shop-tabs" :aria-label="strings.tabsLabel">
      <button type="button" :aria-pressed="tab === 'buy'" @click="selectTab('buy')">{{ strings.buyTab }}</button>
      <button type="button" :aria-pressed="tab === 'sell'" @click="selectTab('sell')">{{ strings.sellTab }}</button>
    </nav>

    <div class="shop-list">
      <article
        v-for="row in rows" :key="row.itemId" class="shop-row"
        :class="{ 'row-disabled': !!row.disabledReason }" :data-item-id="row.itemId" :data-grade="row.grade"
      >
        <TxAsset :src="row.icon" :label="row.name" />
        <div class="item-copy">
          <strong>{{ row.name }}</strong>
          <small>{{ gradeLabel(row.grade) }}</small>
        </div>
        <dl class="item-numbers">
          <div><dt>{{ strings.unitPrice }}</dt><dd>{{ formatWen(row.unitPriceWen) }}</dd></div>
          <div><dt>{{ tab === 'buy' ? strings.stock : strings.owned }}</dt><dd>{{ tab === 'buy' ? row.stock : row.owned }}</dd></div>
        </dl>
        <div class="quantity" :aria-label="`${row.name}${strings.quantity}`">
          <button type="button" :aria-label="`${row.name}${strings.quantity}减一`" :disabled="!!row.disabledReason || quantity(row) <= 1" @click="step(row, -1)">−</button>
          <input
            class="quantity-value" type="number" inputmode="numeric" step="1" :aria-label="`${row.name}${strings.quantity}`"
            :min="1" :max="Math.max(1, limit(row))" :value="quantity(row)" :disabled="!!row.disabledReason || limit(row) < 1"
            @change="setQuantity(row, $event)"
          >
          <button type="button" :aria-label="`${row.name}${strings.quantity}加一`" :disabled="!!row.disabledReason || quantity(row) >= limit(row)" @click="step(row, 1)">+</button>
        </div>
        <button
          type="button" class="confirm primary"
          :disabled="view.busy || !!row.disabledReason || limit(row) < 1" @click="confirm(row)"
        >
          {{ tab === 'buy' ? strings.buy : strings.sell }}
        </button>
        <p v-if="row.disabledReason" class="disabled-reason" role="note">{{ row.disabledReason }}</p>
        <p v-else-if="limit(row) < 1" class="disabled-reason" role="note">{{ strings.unavailableQuantity }}</p>
      </article>
      <p v-if="rows.length === 0" class="empty" role="status">{{ tab === 'buy' ? strings.emptyBuy : strings.emptySell }}</p>
    </div>
  </section>
</template>

<style scoped>
.shop-panel { width: min(920px, calc(100vw - 32px)); max-height: min(760px, calc(100dvh - 32px)); overflow: auto; padding: 20px;
  color: var(--ink-text); border: 0; border-radius: 18px 8px 18px 8px; box-shadow: 0 18px 54px color-mix(in srgb, var(--ink) 28%, transparent); }
.shop-heading { display: grid; grid-template-columns: 1fr auto 44px; align-items: center; gap: 18px; padding: 2px 2px 14px;
  border-bottom: 1px solid color-mix(in srgb, var(--line) 65%, transparent); }
.shop-heading h2 { margin: 3px 0 0; }
.shop-heading small { letter-spacing: .12em; }
.money { display: grid; gap: 2px; margin: 0; text-align: right; }
.money span { color: var(--ink-medium); font-size: 14px; }
.money strong { font-family: var(--font-title); font-size: 18px; }
.close { min-width: 44px; min-height: 44px; padding: 0; border: 0; border-radius: 50%; font-size: 28px; line-height: 1; }
.shop-tabs { display: flex; gap: 6px; margin: 14px 0; }
.shop-tabs button { min-width: 96px; border: 0; border-bottom: 2px solid transparent; background: transparent; }
.shop-tabs button[aria-pressed='true'] { color: var(--vermilion); border-bottom-color: var(--vermilion); }
.shop-list { display: grid; gap: 8px; }
.shop-row { display: grid; grid-template-columns: 64px minmax(130px, 1fr) minmax(200px, auto) auto auto; align-items: center; gap: 12px;
  padding: 12px 8px 12px 12px; border-left: 3px solid var(--grade-color, var(--line)); background: color-mix(in srgb, var(--paper-silk) 35%, transparent); }
.item-copy { display: grid; gap: 5px; min-width: 0; }
.item-copy strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item-numbers { display: flex; gap: 18px; margin: 0; }
.item-numbers div { display: grid; gap: 4px; }
.item-numbers dt { color: var(--ink-medium); font-size: 13px; }
.item-numbers dd { margin: 0; font-variant-numeric: tabular-nums; }
.quantity { display: grid; grid-template-columns: 44px minmax(40px, auto) 44px; align-items: center; text-align: center; }
.quantity button { min-width: 44px; min-height: 44px; padding: 0; border-color: color-mix(in srgb, var(--line) 72%, transparent); }
.quantity-value { width: 56px; min-width: 44px; min-height: 44px; box-sizing: border-box; padding: 4px; color: var(--ink-text);
  background: color-mix(in srgb, var(--paper) 80%, transparent); border: 1px solid color-mix(in srgb, var(--line) 72%, transparent);
  text-align: center; font-variant-numeric: tabular-nums; appearance: textfield; }
.quantity-value::-webkit-inner-spin-button { appearance: none; }
.confirm { min-width: 78px; min-height: 44px; }
.disabled-reason { grid-column: 2 / -1; margin: -4px 0 0; color: var(--vermilion); font-size: 14px; line-height: 1.5; }
.row-disabled { opacity: .72; }
.row-disabled .confirm, .row-disabled .quantity { opacity: .75; }
.empty { margin: 24px 0; text-align: center; color: var(--ink-medium); }
@media (max-width: 760px) {
  .shop-panel { width: min(100%, calc(100vw - 20px)); max-height: calc(100dvh - 20px); padding: 14px; }
  .shop-heading { grid-template-columns: 1fr 44px; }
  .money { grid-column: 1 / -1; grid-row: 2; text-align: left; }
  .close { grid-column: 2; grid-row: 1; }
  .shop-row { grid-template-columns: 64px 1fr auto; }
  .item-numbers { grid-column: 2 / -1; }
  .quantity { grid-column: 2; justify-self: start; }
  .confirm { grid-column: 3; }
  .disabled-reason { grid-column: 2 / -1; }
}
@media (any-pointer: coarse) {
  .close, .quantity button, .confirm { min-height: 60px; }
  .close, .quantity button { min-width: 60px; }
  .quantity { grid-template-columns: 60px minmax(44px, auto) 60px; }
}
</style>
