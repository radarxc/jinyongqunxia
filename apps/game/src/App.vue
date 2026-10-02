<script setup lang="ts">
/* global window, KeyboardEvent, Element */
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { gradeLabel, menuLabels, t, uiBus, useUiStore, type MenuPage } from '@tianshu/ui/runtime';
import TxHud from '@tianshu/ui/components/TxHud.vue';
import type { GameController } from './game-controller';
import ScenePlaceholder from './scenes/ScenePlaceholder.vue';
const { controller } = defineProps<{ controller: GameController }>();
const { busy, notice, settings, saveStatus, storageAvailable } = controller;
const { battle, battleActive } = controller;
const { projection } = storeToRefs(useUiStore());
const CharacterPage = defineAsyncComponent(() => import('./pages/CharacterPage.vue'));
const InventoryPage = defineAsyncComponent(() => import('./pages/InventoryPage.vue'));
const SavePage = defineAsyncComponent(() => import('./pages/SavePage.vue'));
const BattlePage = defineAsyncComponent(() => import('./battle/BattlePage.vue'));
const WorldMapPage = defineAsyncComponent(() => import('./pages/WorldMapPage.vue'));
const TownPage = defineAsyncComponent(() => import('./pages/TownPage.vue'));
const page = ref<MenuPage>('journey');
const scene = ref<'world' | 'town' | 'ruin' | 'battle'>('world');
const sourceScene = ref<'world' | 'town'>('world');
watch(scene, (next, previous) => {
  if (next === 'battle' && previous !== 'battle') {
    sourceScene.value = previous === 'town' ? 'town' : 'world'; void controller.ensureBattle();
  }
});
watch(battleActive, (next, previous) => { if (next && !previous) { scene.value = 'battle'; page.value = 'journey'; } });
function returned(source: string): void { scene.value = source === 'town' ? 'town' : 'world'; }
function openScene(kind: 'town' | 'ruin'): void { scene.value = kind; }
function leaveScene(): void { void controller.worldMapCommand({ t: 'worldmap/leave' }).then(() => { scene.value = 'world'; }); }
function showWorld(): void {
  if (controller.worldmap.value?.scene) leaveScene();
  else scene.value = 'world';
}
const menu: readonly MenuPage[] = ['journey', 'characters', 'inventory', 'martial', 'quests', 'saves', 'settings'];
const shortcuts = computed(() => projection.value.inventory.filter((item) => item.canUse).slice(0, 3));
const skills = computed(() => projection.value.characters.find((entry) => entry.relation === 'self')?.detail?.skills ?? []);
function useQuick(index: number): void {
  const item = shortcuts.value[index];
  const target = projection.value.characters.find((entry) => entry.relation === 'self');
  if (item && target && !busy.value && !battleActive.value) uiBus.emit({ type: 'core-command', command: { t: 'inventory/use', itemId: item.id, targetId: target.key } });
}
function keyboard(event: KeyboardEvent): void {
  if (event.defaultPrevented || event.repeat || event.ctrlKey || event.metaKey || event.altKey ||
      (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable=true], [role=dialog]'))) return;
  const mapping: Readonly<Record<string, MenuPage>> = { c: 'characters', b: 'inventory', k: 'martial', j: 'quests', m: 'journey' };
  const destination = mapping[event.key.toLowerCase()];
  if (destination) { event.preventDefault(); page.value = destination; }
  else if (event.key === 'Escape') { page.value = 'journey'; }
  else if (['1', '2', '3'].includes(event.key)) useQuick(Number(event.key) - 1);
}
onMounted(() => window.addEventListener('keydown', keyboard));
onBeforeUnmount(() => window.removeEventListener('keydown', keyboard));
</script>

<template>
  <main class="game-shell" :class="{ 'large-text': settings.largeText, 'reduced-motion': settings.reducedMotion }">
    <TxHud :hud="projection.hud" />
    <div class="shell-body">
      <nav class="main-menu" :aria-label="t('mainMenu')">
        <div class="menu-brand" aria-hidden="true">天书录</div>
        <button v-for="entry in menu" :key="entry" type="button" :aria-current="page === entry ? 'page' : undefined" @click="page = entry">{{ menuLabels[entry] }}</button>
      </nav>
      <section class="page-surface" :aria-label="menuLabels[page]">
        <header class="page-heading"><div><small>{{ t('tagline') }}</small><h2>{{ menuLabels[page] }}</h2></div><span v-if="projection.hud.preview" class="preview-badge">{{ t('preview') }}</span></header>
        <div v-if="page === 'journey'" class="journey-page">
          <nav class="action-row" :aria-label="t('sceneTabs')">
            <button type="button" :aria-pressed="scene === 'world'" @click="showWorld">{{ t('world') }}</button>
            <button type="button" :aria-pressed="scene === 'battle'" @click="scene = 'battle'">{{ t('battle') }}</button>
          </nav>
          <BattlePage v-if="scene === 'battle' && battle" :controller="battle" :source="sourceScene" :reduced-motion="settings.reducedMotion" @returned="returned" />
          <p v-else-if="scene === 'battle'" class="paper-panel">正在展开战旗……</p>
          <WorldMapPage v-else-if="scene === 'world'" :controller="controller" @scene="openScene" />
          <TownPage v-else-if="scene === 'town'" :controller="controller" @leave="leaveScene" />
          <ScenePlaceholder v-else :scene="scene" @leave="leaveScene" />
          <p v-if="projection.hud.preview" class="muted">{{ t('previewNote') }}</p>
        </div>
        <CharacterPage v-else-if="page === 'characters'" />
        <InventoryPage v-else-if="page === 'inventory'" :busy="busy" />
        <SavePage v-else-if="page === 'saves'" :controller="controller" />
        <section v-else-if="page === 'martial'" class="paper-panel reading-panel"><h3>{{ t('skills') }}</h3><article v-for="skill in skills" :key="skill.id"><h3>{{ skill.name }} · {{ gradeLabel(skill.grade) }} · {{ skill.layer }} {{ t('layer') }}</h3><p>{{ skill.description }}</p></article><p v-if="!skills.length">{{ t('noSkills') }}</p></section>
        <section v-else-if="page === 'quests'" class="paper-panel reading-panel"><h3>{{ t('quests') }}</h3><p v-for="quest in projection.quests" :key="quest.id">{{ quest.name }} · {{ quest.status }}</p><p v-if="!projection.quests.length">{{ t('noQuests') }}</p></section>
        <section v-else class="paper-panel reading-panel"><p>{{ t('settingsHint') }}</p><label class="setting-row"><input type="checkbox" :checked="settings.largeText" @change="controller.setSetting('largeText', ($event.target as HTMLInputElement).checked)">{{ t('largeText') }}</label><label class="setting-row"><input type="checkbox" :checked="settings.reducedMotion" @change="controller.setSetting('reducedMotion', ($event.target as HTMLInputElement).checked)">{{ t('reducedMotion') }}</label></section>
      </section>
    </div>
    <footer class="bottom-bar paper-panel">
      <nav class="quickbar" :aria-label="t('quickbar')"><button v-for="(item, index) in shortcuts" :key="item.id" type="button" :disabled="busy" @click="useQuick(index)"><kbd>{{ index + 1 }}</kbd> {{ item.name }} <small>×{{ item.count }}</small></button></nav>
      <output role="status" aria-live="polite">{{ notice || saveStatus }}</output>
      <button type="button" :disabled="busy || !storageAvailable || battleActive" @click="controller.saveAction('save', 'save_quick')">{{ t('quickSave') }}</button>
    </footer>
  </main>
</template>
