<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue';
import TxShop from '@tianshu/ui/components/explore/TxShop.vue';
import type { ShopIntent, ShopPanelView } from '@tianshu/ui/components/explore/TxShop.types.ts';
import type { ItemView } from '@tianshu/ui';
import type { ShopView } from '@tianshu/core/shop-command';
import type { GameController } from '../game-controller';
import { useChapterTextCatalog } from '../flow/content-text';
import { SHOP_LAYER_STRINGS as strings, shopRejectionText } from './ShopLayer.strings';

const { controller } = defineProps<{ readonly controller: GameController }>();
const view = shallowRef<ShopView | null>(null);
const items = shallowRef<readonly ItemView[]>([]);
const busy = shallowRef(false);
const notice = shallowRef('');
const open = shallowRef(false);
const catalog = useChapterTextCatalog(controller.chapterId, controller.flowTextSource);
let generation = 0;
let resumeTicks = false;
const itemMap = computed(() => new Map(items.value.map((item) => [item.id, item])));
const panel = computed<ShopPanelView | null>(() => view.value ? {
  title: itemTitle(view.value.nameKey),
  facilityKind: strings.facilityKinds[view.value.facilityKind],
  moneyWen: view.value.money, busy: busy.value,
  rows: {
    buy: view.value.offers.map((row) => projectRow(row.itemId, row.unitBuyPrice, row.stock,
      itemMap.value.get(row.itemId)?.count ?? 0, row.reason)),
    sell: view.value.buys.map((row) => projectRow(row.itemId, row.unitSellPrice, null,
      row.owned, null)),
  },
} : null);

function itemTitle(nameKey: string): string {
  return catalog.value[nameKey] ?? nameKey;
}
function projectRow(itemId: string, unitPriceWen: number, stock: number | null, owned: number,
  disabledReason: string | null): ShopPanelView['rows']['buy'][number] {
  const item = itemMap.value.get(itemId);
  return { itemId, name: item?.name ?? itemId, icon: item?.icon ?? null, grade: item?.grade ?? 1,
    unitPriceWen, stock, owned, disabledReason: disabledReason
      ? shopRejectionText(disabledReason) : null };
}
async function refresh(shopKey: string, current: number): Promise<void> {
  const result = await controller.queryShop(shopKey);
  if (current !== generation) return;
  view.value = result.view; items.value = result.items;
}
async function show(shopKey: string): Promise<void> {
  const current = ++generation; busy.value = true; notice.value = '';
  if (!open.value) {
    resumeTicks = controller.sceneRunsWorldTicks.value;
    controller.setSceneRunsWorldTicks(false); open.value = true;
  }
  try { await refresh(shopKey, current); }
  catch { if (current === generation) notice.value = strings.queryFailed; }
  finally { if (current === generation) busy.value = false; }
}
function close(): void {
  generation += 1; open.value = false; view.value = null; items.value = []; notice.value = '';
  controller.setSceneRunsWorldTicks(resumeTicks); resumeTicks = false;
}
async function transact(kind: 'buy' | 'sell', intent: ShopIntent): Promise<void> {
  const currentView = view.value; if (!currentView || busy.value) return;
  const current = generation; busy.value = true; notice.value = '';
  try {
    const result = await controller.shopCommand({ t: `shop/${kind}`,
      shopKey: currentView.instanceKey, itemId: intent.itemId, count: intent.count,
      expectedUnitPrice: intent.unitPriceWen });
    if (!result.accepted) notice.value = shopRejectionText(result.error);
  } catch (error) {
    notice.value = shopRejectionText(error instanceof Error ? error.message : undefined);
  } finally {
    try { await refresh(currentView.instanceKey, current); }
    catch { if (current === generation && !notice.value) notice.value = strings.queryFailed; }
    if (current === generation) busy.value = false;
  }
}
watch(controller.shopRequest, (request) => { if (request) void show(request.shopKey); },
  { immediate: true });
onBeforeUnmount(() => { if (open.value) close(); });
</script>

<template>
  <div v-if="open" class="shop-layer" aria-live="polite">
    <TxShop
      v-if="panel" :view="panel" @buy="transact('buy', $event)"
      @sell="transact('sell', $event)" @close="close"
    />
    <section v-else class="shop-loading paper-panel" role="dialog" aria-modal="true">
      <p>{{ notice || strings.loading }}</p><button type="button" @click="close">合上货簿</button>
    </section>
    <p v-if="notice && panel" class="shop-notice" role="status">{{ notice }}</p>
  </div>
</template>

<style scoped>
.shop-layer { position: fixed; inset: 0; z-index: 40; display: grid; place-items: center;
  padding: 16px; background: color-mix(in srgb, var(--paper) 28%, transparent); }
.shop-loading { min-width: min(28rem, calc(100vw - 2rem)); padding: 2rem; text-align: center; }
.shop-loading button { min-height: 44px; margin-top: 1rem; padding: .5rem 1rem; }
.shop-notice { position: fixed; left: 50%; bottom: max(1rem, env(safe-area-inset-bottom));
  transform: translateX(-50%); margin: 0; padding: .5rem 1.2rem; color: var(--seal);
  background: color-mix(in srgb, var(--paper) 92%, transparent); border-radius: 50%; }
</style>
