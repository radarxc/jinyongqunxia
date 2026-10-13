<script setup lang="ts">
/* global performance, cancelAnimationFrame, requestAnimationFrame */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { uiBus, useUiStore, type MenuPage } from '@tianshu/ui/runtime';
import { defaultAudioManager, SOUND_EFFECT_CUES, type TrackMeta } from '@tianshu/platform';
import type { Command } from '@tianshu/core';
import type { GameController } from '../game-controller';
import type { M1FlowStage } from '../flow/stage';

const props = defineProps<{
  controller: GameController;
  currentScene: 'world' | 'town' | 'ruin' | 'battle';
  currentPage: string;
  open: boolean;
}>();

const emit = defineEmits<{
  toggle: [];
  'switch-scene': [scene: 'world' | 'town' | 'ruin' | 'battle'];
  'switch-page': [page: string];
  'toggle-immersion': [immersive: boolean];
}>();

const { projection } = storeToRefs(useUiStore());
const fps = ref(60);
let frameCount = 0;
let lastFpsTime = performance.now();
let animHandle = 0;

function updateFps(now: number): void {
  frameCount++;
  if (now >= lastFpsTime + 1000) {
    fps.value = Math.round((frameCount * 1000) / (now - lastFpsTime));
    frameCount = 0;
    lastFpsTime = now;
  }
  animHandle = requestAnimationFrame(updateFps);
}

onMounted(() => {
  animHandle = requestAnimationFrame(updateFps);
});

onBeforeUnmount(() => {
  if (animHandle) cancelAnimationFrame(animHandle);
});

const hero = computed(() =>
  projection.value.characters.find((entry) => entry.relation === 'self') ?? projection.value.characters[0]
);

const position = computed(() => {
  const pt = props.controller.worldmap.value?.point;
  return pt ? `(${pt[0]}, ${pt[1]})` : '无';
});

const clean3d = ref(false);
function toggleClean3d(): void {
  clean3d.value = !clean3d.value;
  emit('toggle-immersion', clean3d.value);
}

function selectScene(scene: 'world' | 'town' | 'ruin' | 'battle'): void {
  emit('switch-scene', scene);
  if (scene === 'battle') {
    void props.controller.startDemoBattle();
  }
}

function selectPage(page: MenuPage): void {
  emit('switch-page', page);
}

function changeFlowStage(stage: M1FlowStage): void {
  props.controller.setFlowStage(stage);
}

function triggerBattle(): void {
  emit('switch-page', 'journey');
  emit('switch-scene', 'battle');
  void props.controller.startDemoBattle();
}

function triggerTick(): void {
  void props.controller.tick();
}

function triggerSave(): void {
  void props.controller.saveAction('save', 'save_quick');
}

function useHealingItem(): void {
  const target = hero.value?.key ?? 'self';
  uiBus.emit({
    type: 'core-command',
    command: { t: 'inventory/use', itemId: 'it_jinchuangyao', targetId: target } as Command,
  });
}

async function mountZhulin(): Promise<void> {
  emit('switch-page', 'journey');
  await props.controller.mountRegion('rg_jiangnan_taihu', 'sc_00_zhulin', 'bookfall');
  emit('switch-scene', 'ruin');
}

async function mountFeiyi(): Promise<void> {
  emit('switch-page', 'journey');
  await props.controller.mountRegion('rg_xiyu_beijiang', 'sc_10_fengshi_feiyi', 'cold_open');
  emit('switch-scene', 'ruin');
}

const novelList = [
  '越女剑', '天龙八部', '射雕英雄传', '神雕侠侣', '倚天屠龙记',
  '笑傲江湖', '侠客行', '碧血剑', '鹿鼎记', '书剑恩仇录',
  '连城诀', '雪山飞狐', '飞狐外传', '白马啸西风', '鸳鸯刀',
] as const;

const currentPlayingTrack = ref<TrackMeta | null>(defaultAudioManager.getCurrentTrack());
const currentPlayingBook = ref<string | null>(defaultAudioManager.getCurrentBook());

function playBookMusic(book: string): void {
  currentPlayingBook.value = book;
  const track = defaultAudioManager.playRandomByBook(book);
  if (track) {
    currentPlayingTrack.value = track;
  }
}

function stopMusic(): void {
  defaultAudioManager.stopMusic();
  currentPlayingTrack.value = null;
  currentPlayingBook.value = null;
}

function playSfx(cue: string): void {
  defaultAudioManager.playSfx(cue);
}

const sfxCategoryFilter = ref<'all' | 'novel' | 'combat' | 'item_life'>('novel');
const selectedNovelSfx = ref<string>('all');

const filteredSfxList = computed(() => {
  return SOUND_EFFECT_CUES.filter((s) => {
    if (sfxCategoryFilter.value === 'novel') {
      if (s.category !== 'novel') return false;
      if (selectedNovelSfx.value !== 'all' && s.book !== selectedNovelSfx.value) return false;
      return true;
    }
    if (sfxCategoryFilter.value === 'combat') {
      return s.category === 'combat';
    }
    if (sfxCategoryFilter.value === 'item_life') {
      return s.category === 'item' || s.category === 'life' || s.category === 'ui';
    }
    return true;
  });
});

function getSfxIcon(cue: string): string {
  if (cue.includes('bamboo') || cue.includes('stick') || cue.includes('dagou')) return '🎋';
  if (cue.includes('liumai') || cue.includes('laser')) return '⚡';
  if (cue.includes('beiming') || cue.includes('absorb') || cue.includes('xixing')) return '🌀';
  if (cue.includes('lingbo') || cue.includes('steps') || cue.includes('dodge')) return '💨';
  if (cue.includes('xianglong') || cue.includes('dragon')) return '🐉';
  if (cue.includes('xuantie') || cue.includes('tulong') || cue.includes('cleave')) return '🪓';
  if (cue.includes('anran') || cue.includes('palm') || cue.includes('punch') || cue.includes('baihua')) return '👊';
  if (cue.includes('needle') || cue.includes('dart') || cue.includes('cone') || cue.includes('tanzhi')) return '🎯';
  if (cue.includes('yitian') || cue.includes('draw') || cue.includes('sword') || cue.includes('dugu') || cue.includes('bixie') || cue.includes('miaojia') || cue.includes('rouyun') || cue.includes('jinshe')) return '⚔️';
  if (cue.includes('saber') || cue.includes('hujia') || cue.includes('xuedao') || cue.includes('dual')) return '🔪';
  if (cue.includes('musket') || cue.includes('thunder') || cue.includes('bomb')) return '💣';
  if (cue.includes('dice')) return '🎲';
  if (cue.includes('horse')) return '🐎';
  if (cue.includes('wind') || cue.includes('snow') || cue.includes('desert') || cue.includes('jump')) return '🌪️';
  if (cue.includes('potion') || cue.includes('drink')) return '🍶';
  if (cue.includes('food') || cue.includes('eating')) return '🥢';
  if (cue.includes('book') || cue.includes('flip')) return '📜';
  if (cue.includes('click') || cue.includes('token')) return '🔔';
  if (cue.includes('taiji') || cue.includes('circle') || cue.includes('qiankun') || cue.includes('taixuan') || cue.includes('shenzhao') || cue.includes('renzhe')) return '☯️';
  return '🔊';
}
</script>

<template>
  <aside class="dev-panel-container" :class="{ 'is-collapsed': !open }">
    <!-- Trigger badge -->
    <button
      type="button"
      class="dev-badge"
      title="切换 DEV 控制台 (按 ` 键)"
      @click="emit('toggle')"
    >
      <span class="dev-badge-icon">🛠️</span>
      <span class="dev-badge-text">DEV</span>
      <span class="dev-badge-fps" :class="{ 'fps-low': fps < 30 }">{{ fps }} FPS</span>
    </button>

    <!-- Dev Panel Modal / Drawer -->
    <div v-if="open" class="dev-drawer">
      <header class="dev-header">
        <div class="dev-title">
          <span class="dev-tag">DEV CONSOLE</span>
          <h3>天书录 · 沉浸渲染调试台</h3>
        </div>
        <div class="dev-header-actions">
          <span class="dev-stat-chip">{{ fps }} FPS</span>
          <button type="button" class="dev-close-btn" @click="emit('toggle')">✕</button>
        </div>
      </header>

      <div class="dev-body">
        <!-- Scene Switcher -->
        <section class="dev-section">
          <div class="dev-section-title">🕹️ 即时场景切换 (不要表单，直达渲染)</div>
          <div class="dev-button-grid">
            <button
              type="button"
              class="dev-btn"
              :class="{ active: currentScene === 'world' }"
              @click="selectScene('world')"
            >
              🗺️ 大地图 (World)
            </button>
            <button
              type="button"
              class="dev-btn"
              :class="{ active: currentScene === 'town' }"
              @click="selectScene('town')"
            >
              🏮 城镇街市 (Town)
            </button>
            <button
              type="button"
              class="dev-btn"
              :class="{ active: currentScene === 'battle' }"
              @click="selectScene('battle')"
            >
              ⚔️ 六角战棋 (Battle)
            </button>
            <button
              type="button"
              class="dev-btn"
              :class="{ active: currentScene === 'ruin' }"
              @click="selectScene('ruin')"
            >
              🏛️ 秘境遗迹 (Ruin)
            </button>
          </div>
        </section>

        <!-- 3D Character Showcase Direct Access -->
        <section class="dev-section">
          <div class="dev-section-title">💃 3D 人物模型专页 (高精素体 · 动作检视)</div>
          <div class="dev-button-row">
            <a
              href="/character-3d"
              class="dev-btn dev-btn-primary"
              style="text-decoration: none; text-align: center; display: block; width: 100%;"
            >
              🌟 进入 3D 角色模型检视台 (/character-3d)
            </a>
          </div>
        </section>

        <!-- Chapter 1 & Prologue Fast Access -->
        <section class="dev-section">
          <div class="dev-section-title">🏞️ 章节场景直达 (首章与序章)</div>
          <div class="dev-button-grid">
            <button
              type="button"
              class="dev-btn"
              @click="mountZhulin"
            >
              🎋 进入太湖竹林 (序章)
            </button>
            <button
              type="button"
              class="dev-btn"
              @click="mountFeiyi"
            >
              🏜️ 进入西域废驿 (白马)
            </button>
          </div>
        </section>

        <!-- Battle Controls -->
        <section class="dev-section">
          <div class="dev-section-title">⚔️ 战棋演练与调试</div>
          <div class="dev-button-row">
            <button type="button" class="dev-btn dev-btn-primary" @click="triggerBattle">
              💥 立即发起战棋战斗演练
            </button>
            <button type="button" class="dev-btn" @click="selectScene('world')">
              🏳️ 退出战斗返回大地图
            </button>
          </div>
        </section>

        <!-- Flow Stages -->
        <section class="dev-section">
          <div class="dev-section-title">🔄 流程跳转 (跳过冗长开场)</div>
          <div class="dev-button-grid">
            <button
              type="button"
              class="dev-btn"
              :class="{ active: controller.flowStage.value === 'game' }"
              @click="changeFlowStage('game')"
            >
              🎮 沉浸江湖 (game)
            </button>
            <button
              type="button"
              class="dev-btn"
              :class="{ active: controller.flowStage.value === 'baima-title' }"
              @click="changeFlowStage('baima-title')"
            >
              📜 白马扉页 (baima-title)
            </button>
            <button
              type="button"
              class="dev-btn"
              :class="{ active: controller.flowStage.value === 'opening' }"
              @click="changeFlowStage('opening')"
            >
              📖 开场对白 (opening)
            </button>
            <button
              type="button"
              class="dev-btn"
              :class="{ active: controller.flowStage.value === 'create' }"
              @click="changeFlowStage('create')"
            >
              👤 创角表单 (create)
            </button>
          </div>
        </section>

        <!-- Pages -->
        <section class="dev-section">
          <div class="dev-section-title">📑 界面页面直达</div>
          <div class="dev-tag-row">
            <button
              v-for="p in (['journey', 'characters', 'inventory', 'martial', 'quests', 'saves', 'settings'] as MenuPage[])"
              :key="p"
              type="button"
              class="dev-pill"
              :class="{ active: currentPage === p }"
              @click="selectPage(p)"
            >
              {{ p }}
            </button>
          </div>
        </section>

        <!-- Quick Cheats -->
        <section class="dev-section">
          <div class="dev-section-title">⚡ 快速调试操作</div>
          <div class="dev-button-row">
            <button type="button" class="dev-btn" @click="triggerTick">
              ⏱️ 推进 1 刻 (Tick)
            </button>
            <button type="button" class="dev-btn" @click="triggerSave">
              💾 快速即时存档 (F5)
            </button>
            <button type="button" class="dev-btn" @click="useHealingItem">
              💊 服用伤药恢复
            </button>
            <button
              type="button"
              class="dev-btn"
              :class="{ active: clean3d }"
              @click="toggleClean3d"
            >
              {{ clean3d ? '👁️ 恢复 UI' : '👁️ 纯净 3D 沉浸' }}
            </button>
          </div>
        </section>

        <!-- Jin Yong Novel Music Jukebox -->
        <section class="dev-section">
          <div class="dev-section-title">🎵 经典武侠书目配乐（按书目随机播放）</div>
          <div v-if="currentPlayingTrack" class="dev-audio-current">
            <span class="dev-audio-title">▶ {{ currentPlayingTrack.title }}</span>
            <button type="button" class="dev-audio-stop" @click="stopMusic">⏹ 停止</button>
          </div>
          <div class="dev-tag-row">
            <button
              v-for="b in novelList"
              :key="b"
              type="button"
              class="dev-pill"
              :class="{ active: currentPlayingBook === b }"
              @click="playBookMusic(b)"
            >
              {{ b }}
            </button>
          </div>
        </section>

        <!-- Martial Arts & Life Sound Effects -->
        <section class="dev-section">
          <div class="dev-section-title">💥 金庸天书与江湖音效库 ({{ SOUND_EFFECT_CUES.length }} 款)</div>
          
          <!-- Category Tabs -->
          <div class="dev-tag-row" style="margin-bottom: 8px;">
            <button
              type="button"
              class="dev-pill"
              :class="{ active: sfxCategoryFilter === 'novel' }"
              @click="sfxCategoryFilter = 'novel'"
            >
              📖 天书绝技 (37)
            </button>
            <button
              type="button"
              class="dev-pill"
              :class="{ active: sfxCategoryFilter === 'combat' }"
              @click="sfxCategoryFilter = 'combat'"
            >
              ⚔️ 刀剑拳脚 (10)
            </button>
            <button
              type="button"
              class="dev-pill"
              :class="{ active: sfxCategoryFilter === 'item_life' }"
              @click="sfxCategoryFilter = 'item_life'"
            >
              🍶 药食翻书 (4)
            </button>
            <button
              type="button"
              class="dev-pill"
              :class="{ active: sfxCategoryFilter === 'all' }"
              @click="sfxCategoryFilter = 'all'"
            >
              🌟 全部 (51)
            </button>
          </div>

          <!-- Book Filter (active when novel category is selected) -->
          <div v-if="sfxCategoryFilter === 'novel'" class="dev-tag-row" style="margin-bottom: 8px; max-height: 80px; overflow-y: auto;">
            <button
              type="button"
              class="dev-pill"
              :class="{ active: selectedNovelSfx === 'all' }"
              @click="selectedNovelSfx = 'all'"
            >
              全部书目
            </button>
            <button
              v-for="b in novelList"
              :key="b"
              type="button"
              class="dev-pill"
              :class="{ active: selectedNovelSfx === b }"
              @click="selectedNovelSfx = b"
            >
              {{ b }}
            </button>
          </div>

          <!-- Sound Cues Grid -->
          <div class="dev-button-grid" style="max-height: 200px; overflow-y: auto;">
            <button
              v-for="sfx in filteredSfxList"
              :key="sfx.cue"
              type="button"
              class="dev-btn"
              :title="sfx.desc || sfx.name"
              @click="playSfx(sfx.cue)"
            >
              {{ getSfxIcon(sfx.cue) }} {{ sfx.name }}
            </button>
          </div>
        </section>

        <!-- Telemetry Info -->
        <section class="dev-section dev-telemetry">
          <div class="dev-section-title">📊 运行时状态</div>
          <div class="dev-stats-grid">
            <div class="dev-stat-box">
              <span class="label">主角</span>
              <span class="val">{{ hero?.name ?? '无' }}</span>
            </div>
            <div class="dev-stat-box">
              <span class="label">世界坐标</span>
              <span class="val">{{ position }}</span>
            </div>
            <div class="dev-stat-box">
              <span class="label">银两</span>
              <span class="val">{{ projection.hud.money }} 两</span>
            </div>
            <div class="dev-stat-box">
              <span class="label">章节</span>
              <span class="val">{{ controller.chapterId.value }}</span>
            </div>
            <div class="dev-stat-box">
              <span class="label">行囊物品</span>
              <span class="val">{{ projection.inventory.length }} 种</span>
            </div>
            <div class="dev-stat-box">
              <span class="label">当前场景</span>
              <span class="val">{{ currentScene }}</span>
            </div>
          </div>
        </section>
      </div>

      <footer class="dev-footer">
        <small>按 <code>`</code> 键可快速开闭调试台 · 沉浸模式直接渲染 3D 画布与大地图</small>
      </footer>
    </div>
  </aside>
</template>

<style scoped>
.dev-panel-container {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 9999;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", sans-serif;
  -webkit-user-select: none;
  user-select: none;
  opacity: 0.4;
  transition: opacity 0.2s ease;
}

.dev-panel-container:hover,
.dev-panel-container:has(.dev-drawer) {
  opacity: 1;
}

.dev-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(18, 18, 22, 0.92);
  color: #f0e6d2;
  border: 1px solid rgba(212, 175, 55, 0.45);
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  backdrop-filter: blur(8px);
  transition: all 0.2s ease;
}

.dev-badge:hover {
  background: rgba(30, 30, 38, 0.96);
  border-color: #d4af37;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.25);
}

.dev-badge-fps {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 11px;
  color: #5cdb95;
  background: rgba(92, 219, 149, 0.15);
  padding: 2px 6px;
  border-radius: 4px;
}

.dev-badge-fps.fps-low {
  color: #e27d60;
  background: rgba(226, 125, 96, 0.15);
}

.dev-drawer {
  position: fixed;
  bottom: 60px;
  right: 16px;
  width: 440px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  background: rgba(20, 22, 26, 0.96);
  color: #efe5d0;
  border: 1px solid rgba(212, 175, 55, 0.35);
  border-radius: 12px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(16px);
  overflow: hidden;
}

.dev-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(10, 12, 16, 0.8);
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
}

.dev-tag {
  font-size: 10px;
  letter-spacing: 0.1em;
  color: #d4af37;
  font-weight: 700;
  text-transform: uppercase;
}

.dev-title h3 {
  margin: 2px 0 0;
  font-size: 15px;
  font-weight: 600;
  color: #f7ede2;
}

.dev-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dev-stat-chip {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 12px;
  color: #5cdb95;
  background: rgba(92, 219, 149, 0.15);
  padding: 2px 8px;
  border-radius: 4px;
}

.dev-close-btn {
  background: transparent;
  border: none;
  color: #b0a898;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
}

.dev-close-btn:hover {
  color: #ffffff;
}

.dev-body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
  max-height: calc(100vh - 180px);
}

.dev-section-title {
  font-size: 12px;
  font-weight: 600;
  color: #d4af37;
  margin-bottom: 8px;
  letter-spacing: 0.05em;
}

.dev-button-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.dev-button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dev-tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.dev-btn {
  padding: 8px 12px;
  font-size: 12px;
  background: rgba(40, 44, 52, 0.7);
  color: #e0d8c3;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;
}

.dev-btn:hover {
  background: rgba(60, 66, 78, 0.9);
  border-color: rgba(212, 175, 55, 0.5);
  color: #fff;
}

.dev-btn.active {
  background: rgba(181, 56, 43, 0.35);
  border-color: #b5382b;
  color: #ff9b90;
  font-weight: 600;
}

.dev-btn-primary {
  flex: 1;
  background: rgba(47, 110, 142, 0.6);
  border-color: #2f6e8e;
  color: #ffffff;
  font-weight: 600;
}

.dev-btn-primary:hover {
  background: rgba(47, 110, 142, 0.85);
  border-color: #517998;
}

.dev-pill {
  padding: 4px 10px;
  font-size: 11px;
  background: rgba(35, 38, 44, 0.6);
  color: #c0b8a4;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  cursor: pointer;
}

.dev-pill:hover,
.dev-pill.active {
  background: rgba(212, 175, 55, 0.2);
  border-color: #d4af37;
  color: #ffd97d;
}

.dev-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.dev-stat-box {
  background: rgba(12, 14, 18, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
}

.dev-stat-box .label {
  font-size: 10px;
  color: #8c8272;
}

.dev-stat-box .val {
  font-size: 12px;
  font-weight: 600;
  color: #f7ede2;
  font-family: ui-monospace, SFMono-Regular, monospace;
}

.dev-footer {
  padding: 8px 16px;
  background: rgba(10, 12, 16, 0.85);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  color: #8c8272;
  font-size: 11px;
  text-align: center;
}

.dev-footer code {
  color: #d4af37;
  background: rgba(212, 175, 55, 0.15);
  padding: 1px 4px;
  border-radius: 3px;
}

.dev-audio-current {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 6px 10px;
  background: rgba(212, 175, 55, 0.12);
  border: 1px solid rgba(212, 175, 55, 0.35);
  border-radius: 6px;
  font-size: 11px;
}

.dev-audio-title {
  color: #ffd97d;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dev-audio-stop {
  background: rgba(181, 56, 43, 0.5);
  border: 1px solid #b5382b;
  color: #fff;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 10px;
  cursor: pointer;
}

.dev-audio-stop:hover {
  background: rgba(181, 56, 43, 0.85);
}
</style>
