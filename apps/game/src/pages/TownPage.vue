<script setup lang="ts">
/* global Element, HTMLCanvasElement, KeyboardEvent, PointerEvent, ResizeObserver,
  cancelAnimationFrame, requestAnimationFrame, window */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import type { DomainEvent, TownCommand, TownPoint } from '@tianshu/core';
import { useUiStore } from '@tianshu/ui/runtime';
import type { TownAnchorView, TownScene, TownSceneProjection } from '@tianshu/render/town';
import type { GameController } from '../game-controller';
import type { GameUpdate } from '../runtime/contracts';
import { townAnchorIntent, townDirection, townStep } from './town-input';
import { loadPortraitResolver, usePortrait } from '../runtime/portraits';

const { controller } = defineProps<{ controller: GameController }>();
const { projection } = storeToRefs(useUiStore());
const emit = defineEmits<{ leave: [] }>();
const canvas = ref<HTMLCanvasElement>();
const zoom = ref(2.2);
const renderError = ref('');
const actionNotice = ref('');
const fps = ref(0);
const drawCalls = ref(0);
const triangles = ref(0);
const cpuMs = ref(0);
const moving = ref(false);
let view: TownScene | undefined;
let observer: ResizeObserver | undefined;
let frame = 0;
let statsAt = 0;
let fadeTimer = 0;
let moveTimer = 0;

function asset(path: string): string {
  const base = import.meta.env.BASE_URL ?? '/';
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

const runtime = computed(() => controller.townRuntime.value);
const town = computed(() => controller.town.value);
const localAnchors = computed(() => town.value?.scene.anchors.filter((anchor) =>
  anchor.active !== false && samePoint(anchor.point, town.value!.scene.actor.point)) ?? []);
const inside = computed(() => town.value?.scene.buildingPhase === 'inside');
const canTrade = computed(() => {
  const definition = runtime.value; const state = town.value?.scene;
  if (!definition || !state?.activeBuildingId || state.buildingPhase !== 'inside') return false;
  return definition.buildings.some((building) => building.id === state.activeBuildingId &&
    building.interiorKind === 'shop' && building.businessRef !== null);
});

/* Market Shop Modal State */
interface ShopItem {
  id: string;
  name: string;
  icon: string;
  price: number;
  type: 'medicine' | 'equipment';
  desc: string;
}

const shopItems: ShopItem[] = [
  { id: 'it_jinchuangyao', name: '金创药', icon: '/img/medicine.webp', price: 20, type: 'medicine', desc: '江湖必备疗伤散剂，涂抹伤口可立止刀兵流血，恢复气血 35 点。' },
  { id: 'it_yangqidan', name: '养气丹', icon: '/img/pill.webp', price: 35, type: 'medicine', desc: '道家秘炼黄芽丹，服之滋养丹田气海，调息吐纳，恢复内力 30 点。' },
  { id: 'it_jiuhuayulu', name: '九花玉露丸', icon: '/img/pill.webp', price: 120, type: 'medicine', desc: '东海桃花岛秘制灵药，集九种名花清晨凝露合炼，服之气血内息尽复。' },
  { id: 'eq_qinggangjian', name: '青钢剑', icon: '/img/sword.webp', price: 150, type: 'equipment', desc: '百炼青钢所铸三尺青锋，剑身森然有秋水寒芒，攻击力 +18。' },
];

const showShopModal = ref(false);
const playerSilver = ref(1280);
const purchaseNotice = ref('');

function buyItem(item: ShopItem): void {
  if (playerSilver.value < item.price) {
    purchaseNotice.value = '盘缠银两不足！';
    return;
  }
  playerSilver.value -= item.price;
  purchaseNotice.value = `已购得【${item.name}】× 1，花费 ${item.price} 文。`;
}

/* Xuan-Yuan Sword Style Bottom Dialogue State */
interface NpcDialogueSession {
  npcId: string;
  name: string;
  avatar: string;
  title: string;
  text: string;
  options: { label: string; reply: string }[];
}

const activeDialogue = ref<NpcDialogueSession | null>({
  npcId: 'npc_liwenxiu',
  name: '李文秀',
  avatar: '/img/li.webp',
  title: '塞外孤鸿 · 同行',
  text: '风沙渐歇，前面便是繁华街肆。走了这许多路途，不如先在城中店铺采买些金创药与干粮补给。',
  options: [
    {
      label: '请教近期江湖风声',
      reply: '听闻大理国都无量山剑气冲霄，各方武林人士皆已动身，少侠若往，须得备足丹药兵刃。',
    },
    {
      label: '前往市肆采买',
      reply: '好嘞！少侠且看货架，都是一等一的疗伤良药与趁手兵器。',
    },
    {
      label: '稍作歇息 · 街市漫步',
      reply: '且去市井各处走走，若有差池，文秀随时在侧策应。',
    },
  ],
});

const dialoguePortrait = usePortrait(() => activeDialogue.value?.npcId);

function openNpcDialogue(npcId = 'npc_liwenxiu', name = '李文秀'): void {
  activeDialogue.value = {
    npcId,
    name,
    avatar: npcId === 'npc_liwenxiu' ? '/img/li_cutout.png' : '/img/hero_cutout.png',
    title: npcId === 'npc_liwenxiu' ? '塞外孤鸿 · 同行' : '市井故交 · 见闻',
    text: npcId === 'npc_liwenxiu'
      ? '风沙渐歇，前面便是街肆。城中市井繁华，可寻处药肆铁匠采买些随身补给。'
      : '客官里面请！小店专备名贵药材与精钢兵刃，童叟无欺，价钱公道。',
    options: [
      {
        label: '请教近期江湖风声',
        reply: '近来各派英雄云集，少侠且多留心身后。',
      },
      {
        label: '前往市肆采买',
        reply: '好嘞！货架之上皆为精挑细选之上品。',
      },
      {
        label: '抱拳告辞',
        reply: '江湖路远，少侠多加保重！',
      },
    ],
  };
}

function handleDialogueOption(option: { label: string; reply: string }): void {
  if (option.label === '前往市肆采买') {
    showShopModal.value = true;
    return;
  }
  if (option.label === '稍作歇息 · 街市漫步' || option.label === '抱拳告辞') {
    activeDialogue.value = null;
    return;
  }
  if (activeDialogue.value) {
    activeDialogue.value.text = option.reply;
  }
}

function samePoint(left: TownPoint, right: TownPoint): boolean {
  return left[0] === right[0] && left[1] === right[1];
}
function eventPayload(event: DomainEvent): Record<string, unknown> | undefined {
  if (!('payload' in event) || !event.payload || Array.isArray(event.payload) ||
      typeof event.payload !== 'object') return undefined;
  return event.payload as Record<string, unknown>;
}
function npcName(id: unknown): string {
  if (typeof id !== 'string') return '店内人物';
  return projection.value?.characters?.find((entry) => entry.key === id)?.name ?? '店内人物';
}
function shopName(): string {
  const id = controller.town.value?.scene.activeBuildingId;
  const building = controller.townRuntime.value?.buildings.find((entry) => entry.id === id);
  return building?.poi ?? ({ shop: '店铺', inn: '客栈', temple: '寺观',
    residence: '宅院', other: '建筑' }[building?.interiorKind ?? 'shop']);
}
function describeUpdate(update: GameUpdate | undefined): void {
  if (!update) return;
  for (const event of update.events) {
    const payload = eventPayload(event);
    if (event.t === 'town/shopRequested') {
      actionNotice.value = `已请求打开${shopName()}`;
      showShopModal.value = true;
    } else if (event.t === 'town/dialogueRequested') {
      const name = npcName(payload?.['npcId']);
      actionNotice.value = `已请求交谈：${name}`;
      openNpcDialogue(typeof payload?.['npcId'] === 'string' ? payload['npcId'] : 'npc_resident', name);
    } else if (event.t === 'progression/meditationInterrupted')
      actionNotice.value = '打坐遇袭，真气岔行，正在切入战斗。';
    else if (event.t === 'town/meditationCompleted') actionNotice.value = '一周天运转完毕。';
  }
}
function actorAt(scene: TownSceneProjection, point: TownPoint, walking: boolean,
  direction = scene.actor.direction): TownSceneProjection {
  return { ...scene, actor: { ...scene.actor, point, walking,
    ...(direction === undefined ? {} : { direction }) } };
}
async function animatePath(path: readonly TownPoint[] | undefined,
  scene: TownSceneProjection | undefined): Promise<void> {
  if (!view || !scene || !path || path.length < 2) return;
  for (let index = 1; index < path.length; index += 1) {
    const from = path[index - 1]!; const to = path[index]!;
    await view.update(actorAt(scene, to, true, townDirection(from, to)));
    await new Promise<void>((resolve) => { moveTimer = window.setTimeout(resolve,
      controller.settings.value.reducedMotion ? 80 : 140); });
  }
}
async function command(value: TownCommand): Promise<void> {
  if (controller.busy.value || moving.value) return;
  const before = town.value?.scene;
  moving.value = value.t === 'town/move';
  try { const update = await controller.townCommand(value);
    if (value.t === 'town/move') {
      await animatePath(update?.changes.town?.movementPath, before);
      const settled = town.value?.scene; if (settled) { await view?.update(settled); settleFade(settled); }
    }
    describeUpdate(update); }
  finally { moving.value = false; }
}
function useAnchor(anchor: TownAnchorView): void {
  const state = town.value;
  if (state) {
    if (anchor.kind === 'npc') {
      openNpcDialogue(anchor.npcId ?? 'npc_resident', anchor.label);
    }
    void command(townAnchorIntent(anchor, state.scene.actor.point));
  }
}
function settleFade(next: TownSceneProjection): void {
  window.clearTimeout(fadeTimer);
  if (next.buildingPhase !== 'fading-in' && next.buildingPhase !== 'fading-out') return;
  fadeTimer = window.setTimeout(() => void command({ t: 'town/settle-building' }),
    controller.settings.value.reducedMotion ? 0 : 260);
}
let townFallbackTimer: number | undefined;

async function mountScene(): Promise<void> {
  const target = canvas.value; const definition = runtime.value; const townSceneProjection = town.value?.scene;
  if (!target || !definition || !townSceneProjection) return;
  try {
    const { createTownScene } = await import('@tianshu/render/town');
    const spriteFor = await loadPortraitResolver();
    const hero = projection.value?.characters?.find((c) => c.relation === 'self');
    const isFemale = hero?.detail?.identity?.gender === 'female';
    const playerModelUrl = isFemale
      ? '/assets/default/model3d/npc_zhujue__ch00_f/anim_idle_walk_run.glb'
      : '/assets/default/model3d/npc_zhujue__ch00_m/anim_idle_walk_run.glb';
    view = await createTownScene(target, definition, {
      projection: townSceneProjection, zoom: zoom.value, spriteFor, playerModelUrl });
    (window as unknown as { __townView?: unknown }).__townView = view;
    observer = new ResizeObserver(([entry]) => {
      if (entry) view?.resize(entry.contentRect.width, entry.contentRect.height, window.devicePixelRatio);
    });
    observer.observe(target);
    view.resize(target.clientWidth, target.clientHeight, window.devicePixelRatio);
    const animate = (time: number): void => {
      if (!view) return;
      view.render(time, controller.settings.value.reducedMotion);
      if (time - statsAt >= 500) {
        fps.value = view.stats.frameMs > 0 ? 1000 / view.stats.frameMs : 0;
        drawCalls.value = view.stats.drawCalls; triangles.value = view.stats.triangles;
        cpuMs.value = view.stats.cpuMs; statsAt = time;
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    townFallbackTimer = window.setInterval(() => {
      if (view) {
        view.render(window.performance.now(), controller.settings.value.reducedMotion);
      }
    }, 40);
  } catch (error) { renderError.value = error instanceof Error ? error.message : '城镇渲染不可用'; }
}
function pointer(event: PointerEvent): void {
  const target = canvas.value; const scene = town.value?.scene;
  if (!target || !view || !scene || event.type !== 'click') return;
  const bounds = target.getBoundingClientRect();
  const anchor = view.pickAnchor(event.clientX, event.clientY, bounds);
  if (anchor) useAnchor(anchor);
  else { const point = view.pickPoint(event.clientX, event.clientY, bounds);
    if (point) void command({ t: 'town/move', destination: point }); }
}
function keyboard(event: KeyboardEvent): void {
  if (event.defaultPrevented || event.repeat || event.ctrlKey || event.metaKey || event.altKey ||
      (event.target instanceof Element && event.target.closest('input, button, [contenteditable=true]'))) return;
  const actor = town.value?.scene.actor.point;
  const next = actor ? townStep(actor, event.key.length === 1 ? event.key.toLowerCase() : event.key) : null;
  if (next) { event.preventDefault(); void command({ t: 'town/move', destination: next }); }
}
watch(() => town.value?.scene, (next) => {
  if (!next) return;
  if (!moving.value) void view?.update(next);
  if (!moving.value) settleFade(next);
}, { deep: false });
watch(zoom, (next) => view?.setZoom(next));
onMounted(() => { window.addEventListener('keydown', keyboard); void mountScene(); });
onBeforeUnmount(() => {
  window.removeEventListener('keydown', keyboard); window.clearTimeout(fadeTimer);
  window.clearTimeout(moveTimer);
  if (townFallbackTimer) window.clearInterval(townFallbackTimer);
  cancelAnimationFrame(frame); observer?.disconnect(); view?.dispose(); view = undefined;
});
</script>

<template>
  <section v-if="town && runtime" class="town-page">
    <div class="town-stage">
      <canvas ref="canvas" :aria-label="`${town.location}城镇地图`" @click="pointer" />
      <output v-if="renderError" class="map-error">{{ renderError }}</output>
      <label class="map-zoom">缩放
        <input v-model.number="zoom" type="range" min="0.65" max="2.5" step="0.05">
      </label>
      <p class="town-help">点击地面寻路 · 点击光标交互 · WASD / QE 移动 · 街道视角</p>
    </div>

    <!-- HUD Control Panel -->
    <aside class="town-panel paper-panel">
      <header>
        <small>{{ runtime.historicalYear }} 年 · {{ runtime.eraKit }}</small>
        <h3>{{ town.location }}</h3>
      </header>
      <p>格位 {{ town.scene.actor.point[0] }}, {{ town.scene.actor.point[1] }}</p>
      <p v-if="inside">建筑内部 · 外墙已半透明</p>
      <div class="town-actions">
        <button
          type="button"
          class="primary-action"
          @click="showShopModal = true"
        >
          🛒 市肆采买
        </button>
        <button
          type="button"
          @click="openNpcDialogue('npc_liwenxiu', '李文秀')"
        >
          💬 与同行交谈
        </button>
        <button
          v-for="anchor in localAnchors" :key="anchor.id" type="button"
          :disabled="controller.busy.value" @click="useAnchor(anchor)"
        >
          {{ anchor.label }}
        </button>
        <button
          v-if="canTrade" type="button" :disabled="controller.busy.value"
          @click="showShopModal = true"
        >
          打开店铺
        </button>
        <button
          v-if="inside" type="button" :disabled="controller.busy.value"
          @click="command({ t: 'town/exit-building' })"
        >
          走出建筑
        </button>
        <button
          v-if="town.canLeave" type="button" :disabled="controller.busy.value"
          @click="emit('leave')"
        >
          返回大地图
        </button>
      </div>
      <output class="muted" role="status">{{ actionNotice }}</output>
      <small data-testid="town-stats">
        {{ drawCalls }} draw · {{ triangles }} tri · {{ fps.toFixed(0) }} fps · CPU {{ cpuMs.toFixed(2) }} ms
      </small>
    </aside>

    <!-- 大侠立志传式底端固定半透明对白框（匹配图4：立绘在左，文字在右，古风姓名牌） -->
    <article v-if="activeDialogue" class="town-street-dialogue">
      <figure class="town-dialogue-figure">
        <img :src="asset(activeDialogue.avatar || dialoguePortrait || '/img/li_cutout.png')" alt="" draggable="false">
      </figure>
      <div class="town-dialogue-body">
        <div class="town-dialogue-speaker-tag">
          <span class="speaker-title">{{ activeDialogue.name }}</span>
          <span v-if="activeDialogue.title" class="speaker-sub">{{ activeDialogue.title }}</span>
        </div>
        <p class="dialogue-body-text">
          <span class="quote-mark">「</span>
          {{ activeDialogue.text }}
          <span class="quote-mark">」</span>
        </p>
        <div class="town-dialogue-actions">
          <button
            v-for="opt in activeDialogue.options"
            :key="opt.label"
            type="button"
            class="town-choice-btn"
            @click="handleDialogueOption(opt)"
          >
            <span class="choice-arrow">◆</span>
            <span>{{ opt.label }}</span>
          </button>
        </div>
      </div>
    </article>

    <!-- Market Shop Modal (市肆采买) -->
    <div v-if="showShopModal" class="shop-modal-overlay" @click.self="showShopModal = false">
      <article class="shop-modal paper-panel">
        <header class="shop-header">
          <div>
            <h2>大理市肆 · 百货药铺</h2>
            <p class="small">童叟无欺 · 银货两讫</p>
          </div>
          <div class="silver-badge">
            <img class="silver-icon" :src="asset('/img/ui_res_silver.webp')" alt="银两">
            <span>{{ playerSilver }} 文</span>
          </div>
        </header>

        <p v-if="purchaseNotice" class="shop-notice">{{ purchaseNotice }}</p>

        <div class="shop-items-grid">
          <div v-for="item in shopItems" :key="item.id" class="shop-item-card">
            <img class="item-icon" :src="asset(item.icon)" :alt="item.name">
            <div class="item-info">
              <h4>{{ item.name }}</h4>
              <p class="item-desc">{{ item.desc }}</p>
              <span class="item-price">{{ item.price }} 文</span>
            </div>
            <button
              type="button"
              class="buy-btn"
              :disabled="playerSilver < item.price"
              @click="buyItem(item)"
            >
              采买
            </button>
          </div>
        </div>

        <footer class="shop-footer">
          <button type="button" class="close-shop-btn" @click="showShopModal = false">
            退出店铺
          </button>
        </footer>
      </article>
    </div>
  </section>
  <section v-else class="paper-panel reading-panel"><p>城镇运行时尚未装载。</p></section>
</template>

<style scoped>
.town-page {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: var(--font-calligraphy, 'Kaiti SC', KaiTi, serif);
}
.town-stage {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #d9ccb0;
}
.town-stage canvas {
  width: 100%;
  height: 100%;
  display: block;
}
.town-panel {
  position: absolute;
  right: 20px;
  top: 96px;
  width: 230px;
  max-height: calc(100vh - 240px);
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  overflow: auto;
  z-index: 10;
  background: rgba(243, 234, 214, 0.88);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(148, 115, 69, 0.35);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(48, 46, 41, 0.16);
}
.town-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.primary-action {
  background: rgba(138, 42, 24, 0.12) !important;
  color: var(--seal, #8a2a18) !important;
  font-weight: bold;
  border-color: var(--seal, #8a2a18) !important;
}
.town-help, .map-zoom {
  position: absolute;
  margin: 0;
  padding: 6px 12px;
  background: rgba(239, 230, 210, 0.90);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(148, 115, 69, 0.3);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(48, 46, 41, 0.12);
  z-index: 10;
}
.town-help {
  left: 20px;
  bottom: calc(20px + var(--safe, 0px));
  font-size: 13px;
  letter-spacing: 1px;
}
.map-zoom {
  right: 20px;
  bottom: calc(20px + var(--safe, 0px));
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 大侠立志传式底端固定半透明对白框（匹配图4：立绘在左，文字在右，古风姓名牌） */
.town-street-dialogue {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(80px + var(--safe, 0px));
  width: min(860px, calc(100vw - 36px));
  max-width: 860px;
  z-index: 25;
  display: grid;
  grid-template-columns: clamp(140px, 20vw, 220px) 1fr;
  align-items: flex-end;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0;
}

.town-dialogue-figure {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  margin: 0;
  z-index: 2;
  pointer-events: none;
}

.town-dialogue-figure img {
  display: block;
  height: clamp(200px, 42vh, 340px);
  width: auto;
  max-width: 125%;
  margin-bottom: -10px;
  object-fit: contain;
  object-position: bottom center;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.75));
  user-select: none;
}

.town-dialogue-body {
  position: relative;
  flex: 1;
  min-width: 0;
  background: linear-gradient(180deg, rgba(34, 26, 20, 0.94) 0%, rgba(20, 15, 12, 0.96) 100%);
  border: 1px solid rgba(212, 175, 55, 0.45);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 235, 190, 0.15);
  border-radius: 6px;
  padding: 1.6rem 1.8rem 1.4rem;
  margin-bottom: 8px;
  backdrop-filter: blur(10px);
  z-index: 1;
}

.town-dialogue-speaker-tag {
  position: absolute;
  top: -16px;
  left: 24px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(180deg, #7c4c28 0%, #4a2d16 100%);
  border: 1.5px solid #d4af37;
  padding: 3px 20px;
  border-radius: 3px;
  clip-path: polygon(10px 0%, calc(100% - 10px) 0%, 100% 50%, calc(100% - 10px) 100%, 10px 100%, 0% 50%);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 230, 160, 0.4);
  z-index: 3;
}

.speaker-title {
  font-family: var(--font-calligraphy, 'Kaiti SC', KaiTi, serif);
  font-size: 1.15rem;
  font-weight: bold;
  letter-spacing: 3px;
  color: #fff1d0;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
}

.speaker-sub {
  font-size: 0.8rem;
  color: #dfba82;
  letter-spacing: 1px;
}

.dialogue-body-text {
  font-size: 1.12rem;
  line-height: 1.85;
  letter-spacing: 0.5px;
  color: #f3ebd7;
  margin: 0.4rem 0 1rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

.quote-mark {
  color: #d4af37;
  font-weight: bold;
  font-size: 1.25rem;
  margin: 0 4px;
}

.town-dialogue-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.town-choice-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.55rem 1.1rem;
  background: linear-gradient(90deg, rgba(60, 45, 35, 0.8) 0%, rgba(45, 32, 24, 0.6) 100%);
  border: 1px solid rgba(212, 175, 55, 0.35);
  border-radius: 4px;
  color: #f7ebd0;
  font-size: 1rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.town-choice-btn:hover {
  background: linear-gradient(90deg, rgba(120, 80, 45, 0.9) 0%, rgba(85, 55, 30, 0.7) 100%);
  border-color: #d4af37;
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.5);
}

.choice-arrow {
  color: #d4af37;
  font-size: 0.8rem;
}

/* Shop Modal */
.shop-modal-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 25;
  backdrop-filter: blur(4px);
}
.shop-modal {
  width: min(720px, 92vw);
  max-height: 80vh;
  overflow: auto;
  background: rgba(246, 239, 224, 0.96) !important;
  border: 1px solid rgba(148, 115, 69, 0.5);
  border-radius: 8px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.35);
  padding: 24px 30px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.shop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(148, 115, 69, 0.3);
  padding-bottom: 12px;
}
.shop-header h2 {
  font-size: 26px;
  margin: 0;
  color: var(--seal, #8a2a18);
}
.silver-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(148, 115, 69, 0.15);
  border: 1px solid rgba(148, 115, 69, 0.35);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 15px;
  font-weight: bold;
  color: #604a25;
}
.silver-icon {
  width: 20px;
  height: 20px;
}
.shop-notice {
  background: rgba(138, 42, 24, 0.1);
  border: 1px solid rgba(138, 42, 24, 0.25);
  padding: 8px 14px;
  border-radius: 4px;
  color: var(--seal, #8a2a18);
  font-size: 14px;
  margin: 0;
}
.shop-items-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
@media (max-width: 600px) {
  .shop-items-grid {
    grid-template-columns: 1fr;
  }
}
.shop-item-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(148, 115, 69, 0.25);
  border-radius: 6px;
}
.item-icon {
  width: 48px;
  height: 48px;
  object-fit: contain;
}
.item-info {
  flex: 1;
}
.item-info h4 {
  margin: 0 0 2px;
  font-size: 16px;
  color: var(--ink, #28241e);
}
.item-desc {
  margin: 0 0 4px;
  font-size: 12px;
  color: var(--muted, #6a5e4d);
  line-height: 1.3;
}
.item-price {
  font-size: 13px;
  color: #8a5a18;
  font-weight: bold;
}
.buy-btn {
  background: rgba(138, 42, 24, 0.12);
  border: 1px solid var(--seal, #8a2a18);
  color: var(--seal, #8a2a18);
  border-radius: 4px;
  padding: 6px 14px;
  font-family: inherit;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.buy-btn:hover:not(:disabled) {
  background: var(--seal, #8a2a18);
  color: #fff;
}
.buy-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.shop-footer {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid rgba(148, 115, 69, 0.25);
  padding-top: 12px;
}
.close-shop-btn {
  background: transparent;
  border: 1px solid rgba(148, 115, 69, 0.4);
  border-radius: 4px;
  padding: 6px 18px;
  font-family: inherit;
  font-size: 14px;
  cursor: pointer;
}
</style>
