<script setup lang="ts">
/* global window, KeyboardEvent, Element, MediaQueryList, MediaQueryListEvent, matchMedia */
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref, watch, type Component } from 'vue';
import { storeToRefs } from 'pinia';
import { useUiStore, type MenuPage } from '@tianshu/ui/runtime';
import TxRotateHint from '@tianshu/ui/components/TxRotateHint.vue';
import type { GameController } from './game-controller';

const { controller } = defineProps<{ controller: GameController }>();
const { busy, settings } = controller;
const { battle, battleActive } = controller;
const { projection } = storeToRefs(useUiStore());

const CharacterCreationPage = defineAsyncComponent(() => import('./pages/CharacterCreationPage.vue'));
const OpeningPage = defineAsyncComponent(() => import('./pages/OpeningPage.vue'));
const PrologueModePage = defineAsyncComponent(() => import('./pages/PrologueModePage.vue'));
const SummaryPage = defineAsyncComponent(() => import('./pages/SummaryPage.vue'));
const SkipBridgePage = defineAsyncComponent(() => import('./pages/SkipBridgePage.vue'));
const ExportPromptPage = defineAsyncComponent(() => import('./pages/ExportPromptPage.vue'));
const SleepAllocationPage = defineAsyncComponent(() => import('./pages/SleepAllocationPage.vue'));
const WakePage = defineAsyncComponent(() => import('./pages/WakePage.vue'));
const BaimaTitlePage = defineAsyncComponent(() => import('./pages/BaimaTitlePage.vue'));
const DialogueLayer = defineAsyncComponent(() => import('./pages/DialogueLayer.vue'));
const DevPanel = defineAsyncComponent(() => import('./components/DevPanel.vue'));
const TxInventory = defineAsyncComponent(() => import('@tianshu/ui/components/TxInventory.vue'));
const TxMeridianMap = defineAsyncComponent(() => import('@tianshu/ui/components/TxMeridianMap.vue'));
const BattlePage = defineAsyncComponent(() => import('./battle/BattlePage.vue'));
const RegionPage = defineAsyncComponent(() => import('./pages/RegionPage.vue'));
const WorldMapPage = defineAsyncComponent(() => import('./pages/WorldMapPage.vue'));
const TownPage = defineAsyncComponent(() => import('./pages/TownPage.vue'));
const CharacterPage = defineAsyncComponent(() => import('./pages/CharacterPage.vue'));
const SavePage = defineAsyncComponent(() => import('./pages/SavePage.vue'));
const SettingsPage = defineAsyncComponent(() => import('./pages/SettingsPage.vue'));
const QuestPage = defineAsyncComponent(() => import('./pages/QuestPage.vue'));

const isDev = import.meta.env.DEV;
const showDevPanel = ref(false);
function toggleDevPanel(): void {
  showDevPanel.value = !showDevPanel.value;
}

const asset = (url: string): string => url;

const flowComponents: Readonly<Record<string, Component>> = {
  create: CharacterCreationPage,
  opening: OpeningPage,
  mode: PrologueModePage,
  summary: SummaryPage,
  'skip-bridge': SkipBridgePage,
  export: ExportPromptPage,
  allocation: SleepAllocationPage,
  'allocation-confirm': SleepAllocationPage,
  'wake-cutscene': WakePage,
  'baima-title': BaimaTitlePage,
};
const activeFlow = computed(() => flowComponents[controller.flowStage.value] ?? null);

type ExtendedPage = MenuPage | 'codex';
const page = ref<ExtendedPage>('journey');
const scene = ref<'world' | 'town' | 'ruin' | 'battle'>('world');
const sourceScene = ref<'world' | 'town'>('world');
const portrait = ref(false);
const rotateDismissed = ref(false);
let orientationQuery: MediaQueryList | undefined;

watch(scene, (next, previous) => {
  if (next === 'battle' && previous !== 'battle') {
    sourceScene.value = previous === 'town' ? 'town' : 'world';
    void controller.ensureBattle();
  }
});
watch(battleActive, (next, previous) => {
  if (next && !previous) {
    scene.value = 'battle';
    page.value = 'journey';
  }
});

watch(() => (projection.value as { region?: unknown }).region, (next) => {
  if (next) scene.value = 'ruin';
  else if (scene.value === 'ruin') scene.value = 'world';
}, { immediate: true });

watch([page, scene], ([nextPage, nextScene]) => {
  controller.setSceneRunsWorldTicks(
    nextPage === 'journey' &&
    (nextScene === 'world' || nextScene === 'town' || nextScene === 'ruin')
  );
}, { immediate: true });

function returned(source: string): void {
  scene.value = source === 'town' ? 'town' : 'world';
}
function leaveScene(): void {
  void controller.worldMapCommand({ t: 'worldmap/leave' }).then(() => {
    scene.value = 'world';
  });
}

const showParty = ref(false);
const martialTab = ref<'external' | 'internal' | 'lightness' | 'meridian'>('internal');
const codexTab = ref<'characters' | 'martial' | 'items' | 'places' | 'realms'>('characters');

const selectedCodexCharacter = ref('liwenxiu');
const selectedCodexItem = ref('it_jinchuangyao');
const selectedCodexMartial = ref('sk_yuenvjian');
const selectedCodexPlace = ref('place_dali');
const selectedCodexRealm = ref('ch00_yuenv');

const martialNotice = ref('');

function practiceMartial(name: string): void {
  martialNotice.value = `运转《${name}》，周天真气流转不息，精进有得！`;
  window.setTimeout(() => { martialNotice.value = ''; }, 3000);
}

function cultivateMeridian(): void {
  martialNotice.value = '气沉丹田，引导纯阳真气冲击任督要穴，气血内力充盈！';
  window.setTimeout(() => { martialNotice.value = ''; }, 3000);
}

async function enterTownStreet(): Promise<void> {
  const currentTown = controller.worldmap.value?.positionNodeId ?? 'city_dali';
  await controller.enterTown(currentTown);
}

const defaultMeridians = [
  {
    id: 'meridian_ren',
    name: '任脉',
    completed: false,
    grade: 3,
    strength: 3,
    flux: 36,
    points: [
      { id: 'pt_qihai', name: '气海穴', opened: true, grade: 3, strength: 3, flux: 12 },
      { id: 'pt_guanyuan', name: '关元穴', opened: true, grade: 3, strength: 2, flux: 12 },
      { id: 'pt_dantian', name: '膻中穴', opened: true, grade: 3, strength: 2, flux: 12 },
      { id: 'pt_shenque', name: '神阙穴', opened: false, grade: 2, strength: 1, flux: 8 },
      { id: 'pt_tiantu', name: '天突穴', opened: false, grade: 3, strength: 1, flux: 8 },
    ],
  },
  {
    id: 'meridian_du',
    name: '督脉',
    completed: false,
    grade: 4,
    strength: 2,
    flux: 28,
    points: [
      { id: 'pt_baihui', name: '百会穴', opened: true, grade: 4, strength: 3, flux: 14 },
      { id: 'pt_mingmen', name: '命门穴', opened: true, grade: 3, strength: 2, flux: 10 },
      { id: 'pt_dazhui', name: '大椎穴', opened: false, grade: 3, strength: 1, flux: 8 },
      { id: 'pt_changqiang', name: '长强穴', opened: false, grade: 2, strength: 1, flux: 6 },
    ],
  },
  {
    id: 'meridian_chong',
    name: '冲脉',
    completed: false,
    grade: 3,
    strength: 1,
    flux: 16,
    points: [
      { id: 'pt_qichong', name: '气冲穴', opened: true, grade: 3, strength: 1, flux: 8 },
      { id: 'pt_dahe', name: '大赫穴', opened: false, grade: 3, strength: 1, flux: 8 },
    ],
  },
  {
    id: 'meridian_dai',
    name: '带脉',
    completed: false,
    grade: 2,
    strength: 1,
    flux: 12,
    points: [
      { id: 'pt_daimai', name: '带脉穴', opened: true, grade: 2, strength: 1, flux: 6 },
      { id: 'pt_wushu', name: '五枢穴', opened: false, grade: 2, strength: 1, flux: 6 },
    ],
  },
];

const heroMeridians = computed(() => {
  const hero = projection.value.characters.find(c => c.relation === 'self');
  return (hero?.detail?.meridians && hero.detail.meridians.length > 0)
    ? hero.detail.meridians
    : defaultMeridians;
});

const codexItems = [
  { id: 'it_jinchuangyao', name: '金创药', category: '伤药与丹方', grade: 2, icon: '/assets/default/item/medicine/icons/it_jinchuangyao_64.png', desc: '江湖中寻常备用的伤药，敷于创口可止血定痛，迅速生肌。', source: '《白马啸西风》《射雕英雄传》等多部典籍' },
  { id: 'it_baihuagao', name: '百花玉露膏', category: '伤药与丹方', grade: 4, icon: '/assets/default/item/food/icons/it_baihuagao_64.png', desc: '采百花清晨之露水，配以各色灵草熬制，清香扑鼻，解毒顺气。', source: '《神雕侠侣》' },
  { id: 'eq_biyudao', name: '碧玉刀', category: '兵刃', grade: 4, icon: '/assets/default/item/weapons/icons/eq_biyudao_64.png', desc: '刀身通体碧翠，冷芒吞吐，削铁如泥。传为大理名匠采苍山寒玉淬炼而成。', source: '大理苍山古兵录' },
  { id: 'eq_baoyulihuading', name: '暴雨梨花钉', category: '暗器', grade: 5, icon: '/assets/default/item/hidden-weapons/eq_baoyulihuading.png', desc: '机括精绝的暗器匣，按掣发动，二十七枚银钉如梨花暴雨倾泻，破空生风。', source: '唐门异宝图鉴' },
  { id: 'eq_jinsijia', name: '金丝软甲', category: '内甲', grade: 5, icon: '/assets/default/item/innerarmor/icons/eq_jinsijia_64.png', desc: '大金丝与西域乌金丝混编，刀枪不入，轻若无物，贴身穿戴可御暗算。', source: '《倚天屠龙记》' },
  { id: 'eq_buyi', name: '粗布素衣', category: '衣衫', grade: 1, icon: '/assets/default/item/clothing/icons/eq_buyi_64.png', desc: '江湖旅人随身短褐，针脚细密耐磨，不遮手脚便于疾行。', source: '江湖寻常市肆' },
  { id: 'eq_baiyuguan', name: '白玉发冠', category: '配饰', grade: 3, icon: '/assets/default/item/accessories/icons/eq_baiyuguan_64.png', desc: '温润白玉琢成的小冠，簪发端正，隐约散发微凉之息，凝神定气。', source: '姑苏慕容旧藏' },
  { id: 'it_miji_baiyuanjianyi', name: '白猿剑意残卷', category: '秘籍', grade: 5, icon: '/assets/default/item/manuals/it_miji_baiyuanjianyi_can.png', desc: '越女阿青与白公相逐时所留剑痕拓片，虽仅三页残纸，剑意凌厉若神。', source: '《越女剑》' },
];

const allCodexItems = computed(() => {
  const invItems = projection.value.inventory.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    grade: item.grade ?? 1,
    icon: item.icon ?? '/assets/default/item/collectibles/it_beisongsuqin.png',
    desc: item.description || '江湖寻常所见之物。',
    source: item.source || '随身行囊',
  }));
  const set = new Set(invItems.map(i => i.id));
  const additional = codexItems.filter(i => !set.has(i.id));
  return [...invItems, ...additional];
});
const defaultCodexItem = codexItems[0]!;
const currentCodexItem = computed(() =>
  allCodexItems.value.find(i => i.id === selectedCodexItem.value) ?? allCodexItems.value[0] ?? defaultCodexItem
);

const codexMartials = [
  { id: 'sk_yuenvjian', name: '越女剑法', category: '剑法 · 外功', grade: 5, desc: '春秋越女阿青与白猿嬉戏所创，剑意灵动神妙，三千越甲不可敌。', lore: '“落花流水，随风而舞；长剑破空，如羚羊挂角无迹可寻。”' },
  { id: 'sk_taizuchangquan', name: '太祖长拳', category: '拳掌 · 外功', grade: 2, desc: '宋太祖赵匡胤所传六十四势长拳，拳路开阖方正，沉雄稳健，天下拳法之祖。', lore: '“起势沉如渊，出拳破长风。虚实莫测，步步推进。”' },
  { id: 'sk_jianghutuna', name: '江湖吐纳法', category: '吐纳 · 内功', grade: 2, desc: '道家初基筑基法门，引天地清气归于丹田，绵绵若存，温润周天经络。', lore: '“闭目冥心坐，握固思远神。叩齿三十六，两手抱昆仑。”' },
  { id: 'sk_beiming', name: '北冥神功', category: '神功 · 内功', grade: 6, desc: '逍遥派绝世奇功，以积蓄内力为第一要义，海纳百川，引他人真气为己用。', lore: '“庄子‘逍遥游’云：‘穷发之北有冥海者，天池也。’水之积也不厚，则其负大舟也无力。”' },
  { id: 'sk_lingbo', name: '凌波微步', category: '身法 · 轻功', grade: 6, desc: '依易经六十四卦方位而生，步法圆通变幻，行步如浮云掠影，兼可涵养内力。', lore: '“体迅飞凫，飘忽若神，凌波微步，罗袜生尘。”' },
  { id: 'sk_liumai', name: '六脉神剑', category: '气剑 · 外功', grade: 6, desc: '大理段氏无上至宝，以一阳指纯阳内力激荡六经脉络，指尖化气为凌厉剑芒。', lore: '“少商雄劲，商阳巧妙，中冲大度，关冲拙朴，少冲飘忽，少泽变幻。”' },
];
const defaultCodexMartial = codexMartials[0]!;
const currentCodexMartial = computed(() =>
  codexMartials.find(m => m.id === selectedCodexMartial.value) ?? defaultCodexMartial
);

const codexCharacters = [
  { id: 'liwenxiu', name: '李文秀', title: '塞外孤鸿', source: '《白马啸西风》', portrait: '/img/li.webp', desc: '回族老汉计老人抚养长大。江南烟雨、塞外长风，那都是很好很好的，可她偏偏不喜欢。' },
  { id: 'hero', name: '主角', title: '天书行者', source: '《天书录》', portrait: '/img/hero.webp', desc: '怀抱天书残卷坠入春秋与大宋乱世的旅人，周游十四书界，探寻武学与时代的印记。' },
  { id: 'duanyu', name: '段誉', title: '大理世子', source: '《天龙八部》', portrait: null, desc: '镇南王段正淳之子，痴情纯善，好佛理易经，厌刀兵杀伐，机缘巧合习得北冥凌波二绝。' },
  { id: 'aqing', name: '阿青', title: '越女神剑', source: '《越女剑》', portrait: null, desc: '江南山野牧羊少女，折竹为剑，与白公嬉闹间悟得绝代剑法，教习越国剑士终成霸业。' },
];
const defaultCodexCharacter = codexCharacters[0]!;
const currentCodexCharacter = computed(() =>
  codexCharacters.find(c => c.id === selectedCodexCharacter.value) ?? defaultCodexCharacter
);

const codexPlaces = [
  { id: 'place_dali', name: '大理国', region: '西南', era: '北宋哲宗元祐八年（1093）', desc: '苍山如黛，洱海含烟。段氏治下佛法昌盛，三塔耸峙，一阳指与六脉神剑传世之所。' },
  { id: 'place_zhangye', name: '张掖卫', region: '陇西', era: '西域古道', desc: '居延城外，弱水流沙。丝路重镇，汉唐烽燧历历在目，西行塞外的必经关塞。' },
  { id: 'place_saiwai', name: '塞外草原', region: '西域', era: '回疆哈萨克部落', desc: '天苍苍野茫茫，黄沙长风吹过哈萨克帐篷。高昌迷宫的传说在此世代流传。' },
  { id: 'place_wuliang', name: '无量山', region: '滇西', era: '无量剑派 / 剑湖宫', desc: '峰峦奇秀，瀑布如练。剑湖玉壁映照月华，后山深谷隐藏着神仙姐姐的石室秘境。' },
];
const defaultCodexPlace = codexPlaces[0]!;
const currentCodexPlace = computed(() =>
  codexPlaces.find(p => p.id === selectedCodexPlace.value) ?? defaultCodexPlace
);

const codexRealms = [
  { id: 'ch00_yuenv', name: '卷零 · 越女剑', era: '春秋周敬王三十八年（前482）', desc: '吴越争霸，西施入吴。会稽山下，翠竹微风，少女阿青的一根竹棒，开创了江南剑术的千古源流。' },
  { id: 'ch10_baima', name: '卷十 · 白马啸西风', era: '清康熙年间（1702）', desc: '回疆大漠，风沙掩埋了上一辈的金银恩怨。一匹白马带着少女的叹息，缓缓走向江南风雨。' },
  { id: 'ch01_tianlong', name: '卷一 · 天龙八部', era: '北宋哲宗年间（1093）', desc: '大理无量玉璧、江南燕子坞、西夏灵鹫宫。佛国情仇，贪嗔痴怨，天下英雄气概尽在其中。' },
];
const defaultCodexRealm = codexRealms[0]!;
const currentCodexRealm = computed(() =>
  codexRealms.find(r => r.id === selectedCodexRealm.value) ?? defaultCodexRealm
);
function showWorld(): void {
  if (controller.worldmap.value?.scene) leaveScene();
  else scene.value = 'world';
  page.value = 'journey';
}
function openTown(): void {
  scene.value = 'town';
  page.value = 'journey';
}
function openBattle(): void {
  scene.value = 'battle';
  page.value = 'journey';
  if (!battleActive.value) {
    void controller.startDemoBattle(sourceScene.value);
  }
}

/* Stats & HUD */
const heroHp = computed(() => projection.value.hud?.hp ?? { current: 84, maximum: 100 });
const heroMp = computed(() => projection.value.hud?.mp ?? { current: 68, maximum: 100 });
const heroHpPercent = computed(() => Math.round((heroHp.value.current / Math.max(1, heroHp.value.maximum)) * 100));
const heroMpPercent = computed(() => Math.round((heroMp.value.current / Math.max(1, heroMp.value.maximum)) * 100));
const heroHpText = computed(() => `${heroHp.value.current} / ${heroHp.value.maximum}`);
const heroMpText = computed(() => `${heroMp.value.current} / ${heroMp.value.maximum}`);

const silverDisplay = computed(() => {
  const money = projection.value.hud?.money;
  if (typeof money === 'number' && money > 0) {
    return money.toLocaleString('zh-CN');
  }
  return '一千二百八十';
});

/* Keyboard navigation */
function keyboard(event: KeyboardEvent): void {
  if (event.defaultPrevented || event.repeat || event.ctrlKey || event.metaKey || event.altKey ||
      (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable=true], [role=dialog]'))) return;
  if (event.key === '`' || event.key === '~') {
    event.preventDefault();
    toggleDevPanel();
    return;
  }
  const mapping: Readonly<Record<string, ExtendedPage>> = {
    c: 'characters',
    b: 'inventory',
    k: 'martial',
    j: 'quests',
    m: 'journey',
  };
  const destination = mapping[event.key.toLowerCase()];
  if (destination) {
    event.preventDefault();
    page.value = page.value === destination ? 'journey' : destination;
  } else if (event.key === 'Escape') {
    page.value = 'journey';
  }
}

function orientationChanged(event: MediaQueryListEvent): void {
  portrait.value = event.matches;
  if (!event.matches) rotateDismissed.value = false;
}

onMounted(() => {
  window.addEventListener('keydown', keyboard);
  if (typeof matchMedia === 'function') {
    orientationQuery = matchMedia('(orientation: portrait)');
    portrait.value = orientationQuery.matches;
    orientationQuery.addEventListener('change', orientationChanged);
  }
});

onBeforeUnmount(() => {
  controller.setSceneRunsWorldTicks(false);
  window.removeEventListener('keydown', keyboard);
  orientationQuery?.removeEventListener('change', orientationChanged);
});
</script>

<template>
  <main class="game-shell" :class="[`text-scale-${settings.textScale}`, { 'reduced-motion': settings.reducedMotion }]">
    <TxRotateHint :visible="portrait && !rotateDismissed" @dismiss="rotateDismissed = true" />
    <Suspense v-if="activeFlow">
      <component :is="activeFlow" :controller="controller" />
      <template #fallback><p class="paper-panel">正在展开书页……</p></template>
    </Suspense>

    <template v-else>
      <!-- 全屏沉浸式山河背景 -->
      <div
        class="world"
        :class="[`scene-${scene}`, { dimmed: page !== 'journey' }]"
        aria-hidden="true"
      />

      <!-- 顶栏 · 晕染无框 -->
      <header class="topbar halo">
        <div class="brand">天书录<small>白马啸西风 · 卷中</small></div>
        <nav class="scene-nav" aria-label="场景切换">
          <button
            class="icon-button"
            :class="{ active: scene === 'world' && page === 'journey' }"
            aria-label="大地图"
            @click="showWorld"
          >
            <img class="icon" :src="asset('/img/ui_tool_map.webp')" alt="">
            <span class="tip" aria-hidden="true">大地图</span>
          </button>
          <button
            class="icon-button"
            :class="{ active: scene === 'town' && page === 'journey' }"
            aria-label="城镇"
            @click="openTown"
          >
            <img class="icon" :src="asset('/img/ui_tool_town.webp')" alt="">
            <span class="tip" aria-hidden="true">城镇</span>
          </button>
          <button
            class="icon-button"
            :class="{ active: scene === 'battle' && page === 'journey' }"
            aria-label="战斗"
            @click="openBattle"
          >
            <img class="icon" :src="asset('/img/ui_tool_battle.webp')" alt="">
            <span class="tip" aria-hidden="true">战斗</span>
          </button>
        </nav>
        <div class="wallet">
          <details>
            <summary class="icon-button" aria-label="展开精确银两余额">
              <img class="icon" :src="asset('/img/ui_res_silver.webp')" alt="">
              <span class="tip" aria-hidden="true">精确余额</span>
            </summary>
            <p class="balance-detail wash">
              现银{{ silverDisplay }}两<br>
              <span class="small">{{ projection.hud?.date || '申时' }}</span>
            </p>
          </details>
          <span><strong>{{ silverDisplay }}</strong><small>两 · {{ projection.hud?.date || '申时' }}</small></span>
        </div>
      </header>

      <!-- 主场景 · 大地图 / 城镇 / 遗迹 / 战斗 -->
      <main v-show="page === 'journey'">
        <!-- 大地图 -->
        <section v-show="scene === 'world'" class="screen map-screen" aria-label="大地图">
          <Suspense>
            <WorldMapPage :controller="controller" @scene="scene = $event" />
            <template #fallback><p class="paper-panel">正在展开山河卷……</p></template>
          </Suspense>
          <div class="party wash">
            <div class="companion">
              <img class="portrait-small" :src="asset('/img/hero.webp')" alt="主角立绘">
              <div class="stats">
                <div class="companion-head">
                  <h3>主角</h3>
                  <button type="button" class="party-toggle" @click="showParty = !showParty">
                    {{ showParty ? '收起 ▴' : '同行 (1) ▾' }}
                  </button>
                </div>
                <div class="resource">
                  <img class="icon" :src="asset('/img/ui_status_hp.webp')" alt="气血">
                  <span>{{ heroHpText }}</span>
                </div>
                <div class="meter"><i :style="{ width: heroHpPercent + '%' }" /></div>
                <div class="resource">
                  <img class="icon" :src="asset('/img/ui_status_mp.webp')" alt="内力">
                  <span>{{ heroMpText }}</span>
                </div>
                <div class="meter mp"><i :style="{ width: heroMpPercent + '%' }" /></div>
                <div class="resource">
                  <img class="icon" :src="asset('/img/ui_status_sta.webp')" alt="体力">
                  <span>92 / 100</span>
                </div>
                <div class="meter sta"><i style="width: 92%" /></div>
              </div>
            </div>
            <div v-if="showParty" class="companion secondary">
              <img class="portrait-small" :src="asset('/img/li.webp')" alt="李文秀立绘">
              <div>
                <h3>李文秀</h3>
                <p class="small">同行 · 状态平稳</p>
                <button class="link-action icon-button" aria-label="查看队伍" @click="page = 'characters'">
                  <img class="icon" :src="asset('/img/ui_tool_character.webp')" alt="">
                  <span class="tip" aria-hidden="true">查看队伍</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- 城镇对白 -->
        <section v-show="scene === 'town'" class="screen town-screen" aria-label="城镇对白">
          <Suspense v-if="controller.town.value">
            <TownPage :controller="controller" @leave="leaveScene" />
            <template #fallback><p class="paper-panel">正在展开街市……</p></template>
          </Suspense>
          <template v-else>
            <!-- 5174 城镇相逢浮层 -->
            <div class="scene-heading halo">
              <h1>城中相逢</h1>
              <div class="poem">张掖<span class="seal">申时</span></div>
            </div>
            <img class="dialogue-portrait" :src="asset('/img/li.webp')" alt="李文秀">
            <article class="dialogue wash">
              <h2>李文秀</h2>
              <p>风沙渐歇，前面便是城门。<br>走了这许久，不如先找一处歇脚。</p>
              <footer>
                <span class="small">原创演示对白 · 非原著引文</span>
                <div class="town-dialogue-actions">
                  <button class="primary" type="button" @click="enterTownStreet">步入街市行走</button>
                  <button class="link-action icon-button" aria-label="回到山河" @click="showWorld">
                    <img class="icon" :src="asset('/img/ui_tool_map.webp')" alt="">
                    <span class="tip" aria-hidden="true">回到山河</span>
                  </button>
                </div>
              </footer>
            </article>
          </template>
        </section>

        <!-- 遗迹探索 -->
        <section v-show="scene === 'ruin'" class="screen ruin-screen" aria-label="野外遗迹">
          <Suspense>
            <RegionPage :controller="controller" @leave="leaveScene" />
          </Suspense>
        </section>

        <!-- 六角战斗 -->
        <section v-show="scene === 'battle'" class="screen battle-screen" aria-label="战斗">
          <Suspense v-if="battleActive && battle">
            <BattlePage
              :controller="battle"
              :source="sourceScene"
              :reduced-motion="settings.reducedMotion"
              @returned="returned"
            />
            <template #fallback><p class="paper-panel">正在铺设战棋……</p></template>
          </Suspense>
          <div v-else class="battle-entry paper-panel">
            <p class="eyebrow">演武 · 六角战场</p><h2>一招一式，静候时机</h2>
            <p>选择招式查看范围，落点确认后出手。也可开启自动战斗，随时接管。</p>
            <button class="primary" type="button" :disabled="busy" data-enter-battle @click="controller.startDemoBattle(sourceScene)">进入演武场</button>
          </div>
        </section>
      </main>

      <!-- 全局剧情对话浮层（在任何场景中均可显示） -->
      <Suspense v-if="projection.dialogue">
        <DialogueLayer :controller="controller" :dialogue="projection.dialogue" />
      </Suspense>

      <!-- 卷轴浮层 · 行囊 / 武学 / 人物 / 图鉴 / 江湖志 / 存档 / 设置 -->
      <section v-show="page !== 'journey'" class="screen folio-screen" aria-label="卷轴展阅">
        <!-- 行囊 -->
        <article v-if="page === 'inventory'" class="folio wash">
          <header class="folio-head">
            <img class="icon" :src="asset('/img/ui_tool_bag.webp')" alt="">
            <div>
              <h1>行囊</h1>
              <p class="small">藏锋于匣 · 随身之物</p>
            </div>
            <button class="return icon-button" aria-label="合卷" @click="page = 'journey'">
              <img class="icon" :src="asset('/img/ui_tool_map.webp')" alt="">
              <span class="tip" aria-hidden="true">合卷</span>
            </button>
          </header>
          <div class="folio-body">
            <Suspense>
              <TxInventory
                :items="projection.inventory"
                :equipment="projection.equipment"
                :target-id="projection.characters.find(entry => entry.relation === 'self')?.key ?? ''"
                :busy="busy"
              />
            </Suspense>
          </div>
        </article>

        <!-- 武学 -->
        <article v-else-if="page === 'martial'" class="folio wash">
          <header class="folio-head">
            <img class="icon" :src="asset('/img/ui_tool_martial.webp')" alt="">
            <div>
              <h1>武学修行</h1>
              <p class="small">内圣外王 · 参悟周天</p>
            </div>
            <button class="return icon-button" aria-label="合卷" @click="page = 'journey'">
              <img class="icon" :src="asset('/img/ui_tool_map.webp')" alt="">
              <span class="tip" aria-hidden="true">合卷</span>
            </button>
          </header>
          <div class="folio-body">
            <p class="category-line">
              <span :class="{ chosen: martialTab === 'external' }" @click="martialTab = 'external'">外功招式</span>
              <span :class="{ chosen: martialTab === 'internal' }" @click="martialTab = 'internal'">内功吐纳</span>
              <span :class="{ chosen: martialTab === 'lightness' }" @click="martialTab = 'lightness'">轻功身法</span>
              <span :class="{ chosen: martialTab === 'meridian' }" @click="martialTab = 'meridian'">经脉修炼图</span>
            </p>

            <!-- 外功 -->
            <div v-if="martialTab === 'external'" class="two-column">
              <div>
                <h2 class="section-name">太祖长拳 · 第一层</h2>
                <p>宋太祖赵匡胤所传六十四势长拳，拳路开阖方正，沉雄稳健，天下拳法之祖。</p>
                <div class="rule" />
                <p class="text-pair"><span>当前参悟</span><span class="note-mark">外功拳掌 · 刚猛绝伦</span></p>
                <p class="text-pair"><span>装备招式</span><span>普通一击（破甲）、冲步双拳（突进）</span></p>
                <p class="text-pair"><span>修习进度</span><span>第 1 层 / 共 10 层（熟练度 180 / 300）</span></p>
                <div class="martial-actions">
                  <button class="primary" type="button" @click="practiceMartial('太祖长拳')">演练套路</button>
                  <button type="button" @click="page = 'codex'; codexTab = 'martial'">查看武学典籍</button>
                </div>
                <p v-if="martialNotice" class="martial-notice">{{ martialNotice }}</p>
              </div>
              <img class="book-image" :src="asset('/img/manual.webp')" alt="太祖长拳秘籍">
            </div>

            <!-- 内功 -->
            <div v-else-if="martialTab === 'internal'" class="two-column">
              <div>
                <h2 class="section-name">江湖吐纳法 · 第二层</h2>
                <p>静坐调息，内观其身。<br>气沉丹田，循环周天八脉，神定气足，内息绵绵若存。</p>
                <div class="rule" />
                <p class="text-pair"><span>心法效用</span><span class="note-mark">真气汇聚 · 气血充盈</span></p>
                <p class="text-pair"><span>真气加成</span><span>气血上限 +160 · 内力上限 +120</span></p>
                <p class="text-pair"><span>周天流注</span><span>每回合回气 +8 点</span></p>
                <div class="martial-actions">
                  <button class="primary" type="button" @click="practiceMartial('江湖吐纳法')">静坐调息</button>
                  <button type="button" @click="martialTab = 'meridian'">调阅经脉图</button>
                </div>
                <p v-if="martialNotice" class="martial-notice">{{ martialNotice }}</p>
              </div>
              <img class="book-image" :src="asset('/img/manual.webp')" alt="江湖吐纳法秘籍">
            </div>

            <!-- 轻功 -->
            <div v-else-if="martialTab === 'lightness'" class="two-column">
              <div>
                <h2 class="section-name">基础身法 · 燕子飞</h2>
                <p>足踏微尘，身形如飞燕穿林，巧借风势借力腾挪。</p>
                <div class="rule" />
                <p class="text-pair"><span>轻功类型</span><span class="note-mark">步法腾挪 · 游斗轻灵</span></p>
                <p class="text-pair"><span>战场机动</span><span>移动力 +1 格 · 闪避几率 +8%</span></p>
                <div class="martial-actions">
                  <button class="primary" type="button" @click="practiceMartial('燕子飞')">踏雪寻梅</button>
                </div>
                <p v-if="martialNotice" class="martial-notice">{{ martialNotice }}</p>
              </div>
              <img class="book-image" :src="asset('/img/manual.webp')" alt="轻功秘籍">
            </div>

            <!-- 经脉修炼图 -->
            <div v-else-if="martialTab === 'meridian'" class="meridian-cultivation-panel">
              <div class="meridian-toolbar">
                <span class="note-mark">八脉汇通 · 周天循环</span>
                <button class="primary" type="button" @click="cultivateMeridian">运功冲穴</button>
              </div>
              <p v-if="martialNotice" class="martial-notice">{{ martialNotice }}</p>
              <Suspense>
                <TxMeridianMap :meridians="heroMeridians" />
              </Suspense>
            </div>
          </div>
        </article>

        <!-- 人物 -->
        <article v-else-if="page === 'characters'" class="folio wash">
          <header class="folio-head">
            <img class="icon" :src="asset('/img/ui_tool_character.webp')" alt="">
            <div>
              <h1>立身与经脉</h1>
              <p class="small">人物 · 队伍与名册</p>
            </div>
            <button class="return icon-button" aria-label="合卷" @click="page = 'journey'">
              <img class="icon" :src="asset('/img/ui_tool_map.webp')" alt="">
              <span class="tip" aria-hidden="true">合卷</span>
            </button>
          </header>
          <div class="folio-body">
            <Suspense><CharacterPage /></Suspense>
          </div>
        </article>

        <!-- 图鉴 -->
        <article v-else-if="page === 'codex'" class="folio wash">
          <header class="folio-head">
            <img class="icon" :src="asset('/img/ui_tool_codex.webp')" alt="">
            <div>
              <h1>图鉴名册</h1>
              <p class="small">天书录 · 万物志</p>
            </div>
            <button class="return icon-button" aria-label="合卷" @click="page = 'journey'">
              <img class="icon" :src="asset('/img/ui_tool_map.webp')" alt="">
              <span class="tip" aria-hidden="true">合卷</span>
            </button>
          </header>
          <div class="folio-body">
            <p class="category-line">
              <span :class="{ chosen: codexTab === 'characters' }" @click="codexTab = 'characters'">人物</span>
              <span :class="{ chosen: codexTab === 'martial' }" @click="codexTab = 'martial'">武学</span>
              <span :class="{ chosen: codexTab === 'items' }" @click="codexTab = 'items'">物品</span>
              <span :class="{ chosen: codexTab === 'places' }" @click="codexTab = 'places'">地点</span>
              <span :class="{ chosen: codexTab === 'realms' }" @click="codexTab = 'realms'">书界</span>
            </p>

            <!-- 人物 -->
            <div v-if="codexTab === 'characters'" class="codex-layout">
              <div class="codex-list">
                <p
                  v-for="char in codexCharacters" :key="char.id"
                  :class="{ 'note-mark': selectedCodexCharacter === char.id, muted: selectedCodexCharacter !== char.id }"
                  style="cursor: pointer;"
                  @click="selectedCodexCharacter = char.id"
                >
                  {{ char.name }} · 已录
                </p>
              </div>
              <img class="portrait-large" :src="asset(currentCodexCharacter.portrait || '/img/li.webp')" :alt="currentCodexCharacter.name">
              <div class="codex-copy">
                <span class="note-mark">{{ currentCodexCharacter.source }}</span>
                <h2>{{ currentCodexCharacter.name }}</h2>
                <small class="title-badge">{{ currentCodexCharacter.title }}</small>
                <p>{{ currentCodexCharacter.desc }}</p>
                <p class="small">金庸原著风貌 · 经典人物档案</p>
              </div>
            </div>

            <!-- 武学 -->
            <div v-else-if="codexTab === 'martial'" class="codex-layout">
              <div class="codex-list">
                <p
                  v-for="m in codexMartials" :key="m.id"
                  :class="{ 'note-mark': selectedCodexMartial === m.id, muted: selectedCodexMartial !== m.id }"
                  style="cursor: pointer;"
                  @click="selectedCodexMartial = m.id"
                >
                  {{ m.name }} · {{ m.category.split(' ')[0] }}
                </p>
              </div>
              <img class="portrait-large" :src="asset('/img/manual.webp')" alt="武学秘籍">
              <div class="codex-copy">
                <span class="note-mark">{{ currentCodexMartial.category }}</span>
                <h2>{{ currentCodexMartial.name }}</h2>
                <p>{{ currentCodexMartial.desc }}</p>
                <blockquote style="margin: 12px 0; font-style: italic; color: var(--gold);">{{ currentCodexMartial.lore }}</blockquote>
                <p class="small">品阶：{{ currentCodexMartial.grade }} 品 · 传世武学名篇</p>
              </div>
            </div>

            <!-- 物品 (Item Compendium) -->
            <div v-else-if="codexTab === 'items'" class="codex-layout">
              <div class="codex-list">
                <p
                  v-for="item in allCodexItems" :key="item.id"
                  :class="{ 'note-mark': selectedCodexItem === item.id, muted: selectedCodexItem !== item.id }"
                  style="cursor: pointer;"
                  @click="selectedCodexItem = item.id"
                >
                  {{ item.name }}
                </p>
              </div>
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;">
                <img :src="asset(currentCodexItem.icon)" :alt="currentCodexItem.name" style="width: 120px; height: 120px; object-fit: contain; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.35));">
                <span class="note-mark" style="font-size: 15px;">{{ currentCodexItem.grade }} 阶珍品</span>
              </div>
              <div class="codex-copy">
                <span class="note-mark">{{ currentCodexItem.source }}</span>
                <h2>{{ currentCodexItem.name }}</h2>
                <p>{{ currentCodexItem.desc }}</p>
                <div class="rule" />
                <p class="small">类别：{{ currentCodexItem.category }} · 随身行囊与天下宝物已收录</p>
              </div>
            </div>

            <!-- 地点 -->
            <div v-else-if="codexTab === 'places'" class="codex-layout">
              <div class="codex-list">
                <p
                  v-for="p in codexPlaces" :key="p.id"
                  :class="{ 'note-mark': selectedCodexPlace === p.id, muted: selectedCodexPlace !== p.id }"
                  style="cursor: pointer;"
                  @click="selectedCodexPlace = p.id"
                >
                  {{ p.name }} · {{ p.region }}
                </p>
              </div>
              <img class="portrait-large" :src="asset('/img/card_town.webp')" alt="地点风貌">
              <div class="codex-copy">
                <span class="note-mark">{{ currentCodexPlace.era }}</span>
                <h2>{{ currentCodexPlace.name }}</h2>
                <p>{{ currentCodexPlace.desc }}</p>
                <p class="small">地域：{{ currentCodexPlace.region }} · 丝路江河纵横</p>
              </div>
            </div>

            <!-- 书界 -->
            <div v-else-if="codexTab === 'realms'" class="codex-layout">
              <div class="codex-list">
                <p
                  v-for="r in codexRealms" :key="r.id"
                  :class="{ 'note-mark': selectedCodexRealm === r.id, muted: selectedCodexRealm !== r.id }"
                  style="cursor: pointer;"
                  @click="selectedCodexRealm = r.id"
                >
                  {{ r.name }}
                </p>
              </div>
              <img class="portrait-large" :src="asset('/img/card_story.webp')" alt="书界卷轴">
              <div class="codex-copy">
                <span class="note-mark">{{ currentCodexRealm.era }}</span>
                <h2>{{ currentCodexRealm.name }}</h2>
                <p>{{ currentCodexRealm.desc }}</p>
                <p class="small">十四天书之界 · 循章开启探索</p>
              </div>
            </div>
          </div>
        </article>

        <!-- 江湖志 -->
        <article v-else-if="page === 'quests'" class="folio wash">
          <header class="folio-head">
            <img class="icon" :src="asset('/img/ui_tool_journal.webp')" alt="">
            <div>
              <h1>行旅手记</h1>
              <p class="small">江湖志 · 历练见闻</p>
            </div>
            <button class="return icon-button" aria-label="合卷" @click="page = 'journey'">
              <img class="icon" :src="asset('/img/ui_tool_map.webp')" alt="">
              <span class="tip" aria-hidden="true">合卷</span>
            </button>
          </header>
          <div class="folio-body">
            <Suspense><QuestPage :controller="controller" :quests="projection.quests" /></Suspense>
          </div>
        </article>

        <!-- 存档 -->
        <article v-else-if="page === 'saves'" class="folio wash">
          <header class="folio-head">
            <img class="icon" :src="asset('/img/ui_tool_save.webp')" alt="">
            <div>
              <h1>藏卷</h1>
              <p class="small">存档 · 江湖行纪</p>
            </div>
            <button class="return icon-button" aria-label="合卷" @click="page = 'journey'">
              <img class="icon" :src="asset('/img/ui_tool_map.webp')" alt="">
              <span class="tip" aria-hidden="true">合卷</span>
            </button>
          </header>
          <div class="folio-body">
            <Suspense><SavePage :controller="controller" /></Suspense>
          </div>
        </article>

        <!-- 设置 -->
        <article v-else-if="page === 'settings'" class="folio wash">
          <header class="folio-head">
            <img class="icon" :src="asset('/img/ui_tool_system.webp')" alt="">
            <div>
              <h1>调弦与观卷</h1>
              <p class="small">系统 · 偏好设置</p>
            </div>
            <button class="return icon-button" aria-label="合卷" @click="page = 'journey'">
              <img class="icon" :src="asset('/img/ui_tool_map.webp')" alt="">
              <span class="tip" aria-hidden="true">合卷</span>
            </button>
          </header>
          <div class="folio-body">
            <Suspense><SettingsPage :settings="settings" @change="controller.setSetting" @back="page = 'journey'" /></Suspense>
          </div>
        </article>
      </section>

      <!-- 悬浮底栏 · 经典器物 -->
      <nav class="toolbar halo" aria-label="工具栏">
        <button
          class="tool icon-button"
          :class="{ active: page === 'inventory' }"
          aria-label="行囊"
          @click="page = page === 'inventory' ? 'journey' : 'inventory'"
        >
          <img class="icon" :src="asset('/img/ui_tool_bag.webp')" alt="">
          <span class="tip" aria-hidden="true">行囊</span>
        </button>
        <button
          class="tool icon-button"
          :class="{ active: page === 'martial' }"
          aria-label="武学"
          @click="page = page === 'martial' ? 'journey' : 'martial'"
        >
          <img class="icon" :src="asset('/img/ui_tool_martial.webp')" alt="">
          <span class="tip" aria-hidden="true">武学</span>
        </button>
        <button
          class="tool icon-button"
          :class="{ active: page === 'characters' }"
          aria-label="人物"
          @click="page = page === 'characters' ? 'journey' : 'characters'"
        >
          <img class="icon" :src="asset('/img/ui_tool_character.webp')" alt="">
          <span class="tip" aria-hidden="true">人物</span>
        </button>
        <button
          class="tool icon-button"
          :class="{ active: page === 'codex' }"
          aria-label="图鉴"
          @click="page = page === 'codex' ? 'journey' : 'codex'"
        >
          <img class="icon" :src="asset('/img/ui_tool_codex.webp')" alt="">
          <span class="tip" aria-hidden="true">图鉴</span>
        </button>
        <button
          class="tool icon-button"
          :class="{ active: page === 'quests' }"
          aria-label="江湖志"
          @click="page = page === 'quests' ? 'journey' : 'quests'"
        >
          <img class="icon" :src="asset('/img/ui_tool_journal.webp')" alt="">
          <span class="tip" aria-hidden="true">江湖志</span>
        </button>
        <button
          class="tool icon-button"
          :class="{ active: page === 'saves' }"
          aria-label="存档"
          @click="page = page === 'saves' ? 'journey' : 'saves'"
        >
          <img class="icon" :src="asset('/img/ui_tool_save.webp')" alt="">
          <span class="tip" aria-hidden="true">存档</span>
        </button>
        <button
          class="tool icon-button"
          :class="{ active: page === 'settings' }"
          aria-label="设置"
          @click="page = page === 'settings' ? 'journey' : 'settings'"
        >
          <img class="icon" :src="asset('/img/ui_tool_system.webp')" alt="">
          <span class="tip" aria-hidden="true">设置</span>
        </button>
      </nav>
    </template>

    <!-- 开发面板悬浮按钮 (Dev Only) -->
    <button
      v-if="isDev"
      class="dev-toggle-floating"
      title="开发面板 (~)"
      aria-label="开发面板"
      @click="toggleDevPanel"
    >
      ⚙
    </button>

    <DevPanel
      v-if="isDev"
      :open="showDevPanel"
      :controller="controller"
      :current-scene="scene"
      :current-page="page"
      @toggle="toggleDevPanel"
      @switch-scene="scene = $event"
      @switch-page="page = $event as ExtendedPage"
    />
  </main>
</template>
