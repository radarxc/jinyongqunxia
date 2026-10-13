<script setup lang="ts">
/* global window */
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { uiBus, useUiStore } from '@tianshu/ui/runtime';
import type { EquipmentSlot } from '@tianshu/core';
import TxMeridianMap from '@tianshu/ui/components/TxMeridianMap.vue';
import { slotLabels, type ItemView, type MeridianView } from '@tianshu/ui';

const { projection } = storeToRefs(useUiStore());

const activeSubTab = ref<'attributes' | 'meridian'>('attributes');
const selectedKey = ref('hero');

function asset(path: string): string {
  const base = import.meta.env.BASE_URL ?? '/';
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

const characters = computed(() => {
  const list = projection.value.characters;
  if (!list || list.length === 0) {
    return [
      { key: 'hero', name: '主角', relation: 'self' as const, faction: '无门无派', affinity: null, biography: '', portrait: null, detail: null },
      { key: 'companion', name: '李文秀', relation: 'met' as const, faction: '晋阳镖局', affinity: 40, biography: '', portrait: '/img/li.webp', detail: null },
    ];
  }
  return list;
});

const hero = computed(() => characters.value.find(c => c.relation === 'self') ?? characters.value[0]);

const heroModelUrl = computed(() => {
  const gender = hero.value?.detail?.identity?.gender;
  return gender === 'female'
    ? '/assets/default/model3d/npc_zhujue__ch00_f/anim_idle_walk_run.glb'
    : '/assets/default/model3d/npc_zhujue__ch00_m/anim_idle_walk_run.glb';
});

const currentCharacter = computed(() => {
  if (selectedKey.value === 'hero') {
    return hero.value;
  }
  return characters.value.find(c => c.key === selectedKey.value) ?? hero.value;
});

const currentCharacterName = computed(() => {
  if (currentCharacter.value?.relation === 'self') return '主角';
  if (currentCharacter.value?.relation === 'unseen') return '未遇之人';
  return currentCharacter.value?.name ?? '主角';
});

const portraitSrc = computed(() => {
  if (currentCharacter.value?.relation === 'self')
    return asset('/assets/default/character/female/ch00/por_npc_zhujue__ch00_f_charmhigh_base.png');
  if (currentCharacter.value?.name === '李文秀' || selectedKey.value === 'companion')
    return asset('/assets/default/character/female/ch10/por_npc_liwenxiu__ch10_youth_astuo_base.png');
  if (currentCharacter.value?.portrait) return asset(currentCharacter.value.portrait);
  return asset('/img/hero_cutout.png');
});

const defaultBiographies: Record<string, { title: string; desc: string }> = {
  hero: {
    title: '天书行者 · 独步江湖',
    desc: '怀抱天书残卷坠入春秋与大宋乱世的异世行者。虽无门无派，然骨骼清奇，兼习儒墨道武，自有一番求索武道真意之志。',
  },
  companion: {
    title: '塞外孤鸿 · 同行故交',
    desc: '自幼长于回疆哈萨克部族，心思明澈如雪山清泉。江南烟雨虽好，塞外大漠长风却更系于心。白马啸西风，策马走天涯。',
  },
};

const currentCharacterBio = computed(() => {
  const key = selectedKey.value === 'hero' || currentCharacter.value?.relation === 'self' ? 'hero' : 'companion';
  return defaultBiographies[key] ?? {
    title: currentCharacter.value?.faction || '武林同道',
    desc: currentCharacter.value?.biography || '行走江湖，行迹飘忽，待深交方见真性情。',
  };
});

// Innate attributes (先天八项)
const innateStats = computed(() => {
  const baseInnate = currentCharacter.value?.detail?.stats ?? hero.value?.detail?.stats;
  const getStat = (label: string, fallback = 60) => {
    const found = baseInnate?.find(s => s.label === label || s.key === label);
    return found ? found.value : fallback;
  };
  return [
    { label: '根骨', value: getStat('con', 60), desc: '生机体魄，关乎气血上限与受击抵御' },
    { label: '臂力', value: getStat('str', 60), desc: '出招力道，关乎外功拳脚与兵刃伤害' },
    { label: '身法', value: getStat('agi', 60), desc: '飘忽进退，关乎出手先后与闪避化劲' },
    { label: '悟性', value: getStat('wis', 60), desc: '灵犀慧根，关乎武学领会与招式参透' },
    { label: '定力', value: getStat('wil', 60), desc: '心神沉凝，关乎抗封穴与守御心智' },
    { label: '福缘', value: getStat('luk', 60), desc: '冥冥运数，关乎秘籍奇遇与暴击机缘' },
    { label: '魅力', value: getStat('cha', 60), desc: '风仪气度，关乎江湖结交与同道向心' },
    { label: '内息', value: getStat('bre', 60), desc: '周天流转，关乎内力生克与运气吐纳' },
  ];
});

// Resource bars
const hp = computed(() => {
  const current = projection.value.hud?.hp?.current ?? 84;
  const maximum = projection.value.hud?.hp?.maximum ?? 100;
  return { current, maximum, percent: Math.round((current / Math.max(1, maximum)) * 100) };
});

const mp = computed(() => {
  const current = projection.value.hud?.mp?.current ?? 68;
  const maximum = projection.value.hud?.mp?.maximum ?? 100;
  return { current, maximum, percent: Math.round((current / Math.max(1, maximum)) * 100) };
});

const sta = computed(() => ({ current: 92, maximum: 100, percent: 92 }));

// 10 Equipment slots arranged anatomically around the doll figure
// Left: Head (冠), Shoulder (肩), Body (衫), MainHand (刃), Hands (腕)
// Right: Cape (氅), InnerBody (甲), OffHand (匕), Waist (带), Feet (靴)
const dollLeftSlots: readonly EquipmentSlot[] = ['head', 'shoulder', 'body', 'mainHand', 'hands'];
const dollRightSlots: readonly EquipmentSlot[] = ['cape', 'innerBody', 'offHand', 'waist', 'feet'];

const slotIcons: Record<string, string> = {
  head: '冠',
  innerBody: '甲',
  mainHand: '刃',
  hands: '腕',
  waist: '带',
  shoulder: '肩',
  cape: '氅',
  body: '衫',
  offHand: '匕',
  feet: '靴',
  accessory: '佩',
};

function getEquipItem(slot: EquipmentSlot) {
  return projection.value.equipment?.find(e => e.slot === slot)?.item;
}


const selectedSlot = ref<EquipmentSlot | null>(null);
const equipNotice = ref<string>('');

function showNotice(msg: string): void {
  equipNotice.value = msg;
  window.setTimeout(() => { equipNotice.value = ''; }, 2500);
}

// Compatible equipment in inventory
const availableItemsForSlot = computed(() => {
  if (!selectedSlot.value) return [];
  const slot = selectedSlot.value;
  return (projection.value.inventory ?? []).filter((item) => item.slot === slot);
});

function handleEquip(item: ItemView, slot: EquipmentSlot): void {
  uiBus.emit({
    type: 'core-command',
    command: { t: 'inventory/equip', itemId: item.id, slot },
  });
  showNotice(`已装备【${item.name}】！`);
  selectedSlot.value = null;
}

function handleUnequip(slot: EquipmentSlot): void {
  uiBus.emit({
    type: 'core-command',
    command: { t: 'inventory/unequip', slot },
  });
  showNotice(`已卸下【${slotLabels[slot] ?? slot}】装备！`);
  selectedSlot.value = null;
}

// Meridians data
const meridiansData = computed<readonly MeridianView[]>(() => {
  if (currentCharacter.value?.detail?.meridians?.length) {
    return currentCharacter.value.detail.meridians;
  }
  return [
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
      ],
    },
    {
      id: 'meridian_du',
      name: '督脉',
      completed: false,
      grade: 3,
      strength: 4,
      flux: 48,
      points: [
        { id: 'pt_baihui', name: '百会穴', opened: true, grade: 3, strength: 3, flux: 12 },
        { id: 'pt_dazhui', name: '大椎穴', opened: true, grade: 3, strength: 3, flux: 12 },
        { id: 'pt_mingmen', name: '命门穴', opened: false, grade: 2, strength: 0, flux: 12 },
        { id: 'pt_changqiang', name: '长强穴', opened: false, grade: 2, strength: 0, flux: 12 },
      ],
    },
    {
      id: 'meridian_chong',
      name: '冲脉',
      completed: false,
      grade: 2,
      strength: 2,
      flux: 24,
      points: [
        { id: 'pt_youmen', name: '幽门穴', opened: true, grade: 2, strength: 2, flux: 12 },
        { id: 'pt_tonggu', name: '通谷穴', opened: false, grade: 2, strength: 0, flux: 12 },
        { id: 'pt_yindu', name: '阴都穴', opened: false, grade: 2, strength: 0, flux: 12 },
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
        { id: 'pt_daimai', name: '带脉穴', opened: true, grade: 2, strength: 1, flux: 12 },
        { id: 'pt_wushu', name: '五枢穴', opened: false, grade: 2, strength: 0, flux: 12 },
        { id: 'pt_weidao', name: '维道穴', opened: false, grade: 2, strength: 0, flux: 12 },
      ],
    },
    {
      id: 'meridian_yinwei',
      name: '阴维脉',
      completed: false,
      grade: 3,
      strength: 0,
      flux: 1,
      points: [
        { id: 'pt_zhubin', name: '筑宾穴', opened: false, grade: 3, strength: 0, flux: 1 },
        { id: 'pt_fushe', name: '府舍穴', opened: false, grade: 3, strength: 0, flux: 1 },
        { id: 'pt_qimen', name: '期门穴', opened: false, grade: 3, strength: 0, flux: 1 },
      ],
    },
    {
      id: 'meridian_yangwei',
      name: '阳维脉',
      completed: false,
      grade: 3,
      strength: 0,
      flux: 1,
      points: [
        { id: 'pt_jinmen', name: '金门穴', opened: false, grade: 3, strength: 0, flux: 1 },
        { id: 'pt_naoshu', name: '臑俞穴', opened: false, grade: 3, strength: 0, flux: 1 },
        { id: 'pt_fengchi', name: '风池穴', opened: false, grade: 3, strength: 0, flux: 1 },
      ],
    },
    {
      id: 'meridian_yinqiao',
      name: '阴跷脉',
      completed: false,
      grade: 2,
      strength: 0,
      flux: 1,
      points: [
        { id: 'pt_zhaohai', name: '照海穴', opened: false, grade: 2, strength: 0, flux: 1 },
        { id: 'pt_jiaoxin', name: '交信穴', opened: false, grade: 2, strength: 0, flux: 1 },
      ],
    },
    {
      id: 'meridian_yangqiao',
      name: '阳跷脉',
      completed: false,
      grade: 2,
      strength: 0,
      flux: 1,
      points: [
        { id: 'pt_shenmai', name: '申脉穴', opened: false, grade: 2, strength: 0, flux: 1 },
        { id: 'pt_pucan', name: '仆参穴', opened: false, grade: 2, strength: 0, flux: 1 },
      ],
    },
  ];
});
</script>

<template>
  <div class="character-page character-sheet-container">
    <!-- Top character switcher & sub-nav -->
    <div class="sheet-tabs-row">
      <div class="character-selector">
        <button
          v-for="char in characters"
          :key="char.key"
          type="button"
          class="char-tab"
          :class="{ active: (selectedKey === 'hero' && char.relation === 'self') || selectedKey === char.key }"
          @click="selectedKey = char.relation === 'self' ? 'hero' : char.key"
        >
          {{ char.relation === 'self' ? '主角' : char.name }}
        </button>
      </div>

      <div class="sub-nav-toggles">
        <button
          type="button"
          class="sub-toggle"
          :class="{ active: activeSubTab === 'attributes' }"
          @click="activeSubTab = 'attributes'"
        >
          立身属性
        </button>
        <button
          type="button"
          class="sub-toggle"
          :class="{ active: activeSubTab === 'meridian' }"
          @click="activeSubTab = 'meridian'"
        >
          经脉周天
        </button>
      </div>
    </div>

    <!-- TOP BANNER: Biography & Title at the top of content -->
    <div v-if="activeSubTab === 'attributes'" class="char-top-hero-banner">
      <div class="hero-intro-box">
        <div class="hero-identity-row">
          <h2 class="hero-display-name">{{ currentCharacterName }}</h2>
          <span class="hero-title-pill">{{ currentCharacterBio.title }}</span>
          <span class="hero-faction-pill">{{ currentCharacter?.faction || '无门无派' }}</span>
        </div>
        <p class="hero-bio-paragraph">{{ currentCharacterBio.desc }}</p>
        <div class="hero-quick-meters">
          <span class="meter-pill"><i class="dot hp" /> 气血 {{ hp.current }} / {{ hp.maximum }}</span>
          <span class="meter-pill"><i class="dot mp" /> 内力 {{ mp.current }} / {{ mp.maximum }}</span>
          <span class="meter-pill"><i class="dot sta" /> 体力 {{ sta.current }} / {{ sta.maximum }}</span>
        </div>
      </div>
    </div>

    <!-- MAIN VIEW: 2-Column layout: Left Anatomical Doll (10 slots around character portrait), Right Innate 8 + resource meters -->
    <div v-if="activeSubTab === 'attributes'" class="sheet-main-grid">
      <!-- COLUMN 1: Anatomical Equipment Doll (Character in center, slots arranged anatomically) -->
      <div class="col-doll-equip">
        <div class="doll-stage">
          <!-- Left anatomical slots (Head, Shoulder, Body, MainHand, Hands) -->
          <div class="equip-column equip-col-left">
            <button
              v-for="slot in dollLeftSlots"
              :key="slot"
              type="button"
              class="equip-slot-box"
              :class="{ 'has-item': getEquipItem(slot), selected: selectedSlot === slot }"
              :title="'点击装配或更换 ' + (slotLabels[slot] ?? slot)"
              @click="selectedSlot = slot"
            >
              <div class="slot-box-inner">
                <span class="slot-tag">{{ slotLabels[slot] ?? slot }}</span>
                <template v-if="getEquipItem(slot)">
                  <span class="slot-item-text">{{ getEquipItem(slot)?.name }}</span>
                </template>
                <template v-else>
                  <span class="slot-empty-icon">{{ slotIcons[slot] ?? '佩' }}</span>
                </template>
              </div>
            </button>
          </div>

          <!-- Center Character Portrait Doll -->
          <div class="doll-center-figure">
            <div class="doll-glow" />
            <img
              class="doll-character-img"
              :src="portraitSrc"
              :alt="currentCharacterName + '立绘'"
            >
            <div class="doll-pedestal" />
          </div>

          <!-- Right anatomical slots (Cape, InnerBody, OffHand, Waist, Feet) -->
          <div class="equip-column equip-col-right">
            <button
              v-for="slot in dollRightSlots"
              :key="slot"
              type="button"
              class="equip-slot-box"
              :class="{ 'has-item': getEquipItem(slot), selected: selectedSlot === slot }"
              :title="'点击装配或更换 ' + (slotLabels[slot] ?? slot)"
              @click="selectedSlot = slot"
            >
              <div class="slot-box-inner">
                <span class="slot-tag">{{ slotLabels[slot] ?? slot }}</span>
                <template v-if="getEquipItem(slot)">
                  <span class="slot-item-text">{{ getEquipItem(slot)?.name }}</span>
                </template>
                <template v-else>
                  <span class="slot-empty-icon">{{ slotIcons[slot] ?? '佩' }}</span>
                </template>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- COLUMN 2: 先天八项 & 资源进度条 & 经脉入口 -->
      <div class="col-stats-panel">
        <h3 class="section-heading">先天八项</h3>
        <div class="innate-grid">
          <div
            v-for="stat in innateStats"
            :key="stat.label"
            class="innate-item"
            :title="stat.desc"
          >
            <span class="innate-name">{{ stat.label }}</span>
            <span class="innate-val">{{ stat.value }}</span>
          </div>
        </div>

        <div class="resource-meters">
          <!-- 气血 -->
          <div class="meter-group">
            <div class="meter-label-row">
              <span class="meter-name">
                <img class="meter-icon" :src="asset('/img/ui_status_hp.webp')" alt="气血">
                气血
              </span>
              <span class="meter-numbers">{{ hp.current }} / {{ hp.maximum }}</span>
            </div>
            <div class="meter-track hp-track">
              <div class="meter-fill hp-fill" :style="{ width: hp.percent + '%' }" />
            </div>
          </div>

          <!-- 内力 -->
          <div class="meter-group">
            <div class="meter-label-row">
              <span class="meter-name">
                <img class="meter-icon" :src="asset('/img/ui_status_mp.webp')" alt="内力">
                内力
              </span>
              <span class="meter-numbers">{{ mp.current }} / {{ mp.maximum }}</span>
            </div>
            <div class="meter-track mp-track">
              <div class="meter-fill mp-fill" :style="{ width: mp.percent + '%' }" />
            </div>
          </div>

          <!-- 体力 -->
          <div class="meter-group">
            <div class="meter-label-row">
              <span class="meter-name">
                <img class="meter-icon" :src="asset('/img/ui_status_sta.webp')" alt="体力">
                体力
              </span>
              <span class="meter-numbers">{{ sta.current }} / {{ sta.maximum }}</span>
            </div>
            <div class="meter-track sta-track">
              <div class="meter-fill sta-fill" :style="{ width: sta.percent + '%' }" />
            </div>
          </div>
        </div>

        <button
          type="button"
          class="meridian-jump-btn"
          @click="activeSubTab = 'meridian'"
        >
          调阅经脉图
        </button>
      </div>

      <!-- Equipment Modal Dialog when a slot is clicked -->
      <div v-if="selectedSlot" class="equip-modal-overlay" @click.self="selectedSlot = null">
        <div class="equip-modal-content paper-panel">
          <div class="picker-header">
            <h4>【{{ slotLabels[selectedSlot] ?? selectedSlot }}】装备更换</h4>
            <button type="button" class="close-picker" @click="selectedSlot = null">✕</button>
          </div>

          <!-- Current equipped item (if any) -->
          <div v-if="getEquipItem(selectedSlot)" class="current-equipped-section">
            <span class="section-label">当前穿戴：</span>
            <div class="current-item-row">
              <strong class="item-name">{{ getEquipItem(selectedSlot)?.name }}</strong>
              <button
                type="button"
                class="unequip-text-btn"
                @click="handleUnequip(selectedSlot!)"
              >
                卸下装备
              </button>
            </div>
          </div>

          <!-- Available in inventory -->
          <div class="available-section">
            <span class="section-label">行囊可穿戴器具：</span>
            <div v-if="availableItemsForSlot.length" class="picker-items">
              <div
                v-for="avail in availableItemsForSlot"
                :key="avail.id"
                class="picker-item-row"
              >
                <img v-if="avail.icon" :src="asset(avail.icon)" class="picker-icon" alt="">
                <div class="picker-item-details">
                  <strong>{{ avail.name }}</strong>
                  <small>{{ avail.description }}</small>
                </div>
                <button
                  type="button"
                  class="equip-text-btn"
                  @click="handleEquip(avail, selectedSlot!)"
                >
                  穿戴
                </button>
              </div>
            </div>
            <div v-else class="picker-empty">
              <p>行囊中暂无适合【{{ slotLabels[selectedSlot] }}】的器具或防具。</p>
              <small>可前往城镇市肆采购，或在江湖历练中获取。</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MERIDIAN VIEW: Interactive Canvas Meridian Map -->
    <div v-else class="sheet-meridian-wrap">
      <div class="meridian-view-header">
        <button
          type="button"
          class="return-stats-btn"
          @click="activeSubTab = 'attributes'"
        >
          ❮ 返回人物立身属性
        </button>
        <span class="meridian-sub-tip">点击经脉穴位可引真气贯通 · 金色流光示内息循环</span>
      </div>
      <TxMeridianMap :meridians="meridiansData" :model-url="heroModelUrl" />
    </div>

    <!-- Floating Notice -->
    <div v-if="equipNotice" class="equip-toast-floating">
      {{ equipNotice }}
    </div>
  </div>
</template>

<style scoped>
.character-sheet-container {
  font-family: '方正侠客体', '方正字迹-侠客体简', 'FZXiaKeTi-S-GB', 'FZXKT', 'Xingkai SC', 'STXingkai', var(--font-calligraphy, 'Kaiti SC', KaiTi, cursive, serif);
  max-width: 860px;
  margin: 0 auto;
  padding: 12px 18px 16px;
  color: var(--ink, #28241e);
  user-select: none;
  box-sizing: border-box;
}

/* Tabs Header */
.sheet-tabs-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: none;
  padding-bottom: 8px;
  margin-bottom: 14px;
}

.character-selector {
  display: flex;
  gap: 12px;
}

.char-tab {
  background: transparent;
  border: none;
  padding: 4px 12px;
  font-family: inherit;
  font-size: 17px;
  color: var(--muted, #6a5e4d);
  cursor: pointer;
  transition: all 0.2s ease;
}

.char-tab.active,
.char-tab:hover {
  background: transparent;
  color: var(--seal, #8a2a18);
  font-weight: bold;
  text-decoration: underline;
  text-underline-offset: 4px;
}

.sub-nav-toggles {
  display: flex;
  gap: 8px;
}

.sub-toggle {
  background: transparent;
  border: none;
  font-family: inherit;
  font-size: 15px;
  color: var(--muted, #6a5e4d);
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.sub-toggle.active {
  background: rgba(138, 42, 24, 0.1);
  color: var(--seal, #8a2a18);
  font-weight: bold;
}

/* Hero Top Banner: Cutout portrait + identity + biography */
.char-top-hero-banner {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 16px;
  padding: 14px 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.55) 0%, rgba(239, 230, 213, 0.6) 100%);
  border-radius: 8px;
  border: 1px solid rgba(148, 115, 69, 0.25);
  box-shadow: 0 4px 16px rgba(48, 46, 41, 0.06);
}

.hero-cutout-box {
  width: 100px;
  height: 135px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  flex-shrink: 0;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.22));
}

.hero-standing-cutout {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.hero-intro-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hero-identity-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-display-name {
  font-size: 26px;
  margin: 0;
  letter-spacing: 4px;
  color: var(--ink, #28241e);
  font-family: inherit;
  font-weight: bold;
}

.hero-title-pill {
  font-size: 13px;
  padding: 2px 8px;
  border-radius: 4px;
  letter-spacing: 1px;
  background: rgba(138, 42, 24, 0.12);
  color: var(--seal, #8a2a18);
  border: 1px solid rgba(138, 42, 24, 0.25);
}

.hero-faction-pill {
  font-size: 13px;
  padding: 2px 8px;
  border-radius: 4px;
  letter-spacing: 1px;
  background: rgba(43, 76, 110, 0.1);
  color: #2b4c6e;
  border: 1px solid rgba(43, 76, 110, 0.22);
}

.hero-bio-paragraph {
  margin: 2px 0 6px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--muted, #5c5243);
  text-indent: 2em;
}

.hero-quick-meters {
  display: flex;
  gap: 14px;
  font-size: 13px;
}

.meter-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--ink, #28241e);
}

.meter-pill .dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.meter-pill .dot.hp {
  background: #b91c1c;
}

.meter-pill .dot.mp {
  background: #1d4ed8;
}

.meter-pill .dot.sta {
  background: #047857;
}

/* 2-Column Main Grid */
.sheet-main-grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 20px;
  align-items: start;
}

/* Column 1: Anatomical Doll Stage with Standing Figure */
.col-doll-equip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.doll-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  position: relative;
  background: radial-gradient(circle at 50% 50%, rgba(243, 234, 214, 0.45) 0%, rgba(243, 234, 214, 0.08) 68%, transparent 100%);
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(148, 115, 69, 0.18);
}

.doll-center-figure {
  position: relative;
  width: 175px;
  height: 330px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}

.doll-glow {
  position: absolute;
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
  width: 160px;
  height: 240px;
  background: radial-gradient(ellipse at center, rgba(230, 200, 140, 0.35) 0%, rgba(230, 200, 140, 0) 70%);
  pointer-events: none;
  border-radius: 50%;
  z-index: 1;
}

.doll-character-img {
  position: relative;
  z-index: 2;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.28));
  user-select: none;
  pointer-events: none;
}

.doll-pedestal {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 130px;
  height: 14px;
  background: radial-gradient(ellipse at center, rgba(60, 45, 30, 0.35) 0%, rgba(60, 45, 30, 0) 75%);
  border-radius: 50%;
  z-index: 1;
}

.equip-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 108px;
}

.equip-slot-box {
  border: 1px solid rgba(148, 115, 69, 0.35);
  border-radius: 4px;
  padding: 4px 6px;
  background: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 40px;
  display: flex;
  align-items: center;
}

.equip-slot-box:hover {
  background: rgba(243, 234, 214, 0.85);
  border-color: rgba(148, 115, 69, 0.6);
  transform: translateY(-1px);
}

.equip-slot-box.selected {
  border-color: var(--seal, #8a2a18);
  box-shadow: 0 0 0 1px var(--seal, #8a2a18);
  background: rgba(243, 234, 214, 0.95);
}

.equip-slot-box.has-item {
  background: rgba(243, 234, 214, 0.7);
  border-color: rgba(148, 115, 69, 0.5);
}

.slot-box-inner {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.slot-tag {
  font-size: 11px;
  color: var(--muted, #8c7b64);
  line-height: 1.1;
}

.slot-item-text {
  font-size: 13px;
  color: #2b4c6e;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

.slot-empty-icon {
  font-size: 14px;
  opacity: 0.6;
  margin-top: 2px;
}

/* Column 2: 先天八项 & 资源条 */
.col-stats-panel {
  display: flex;
  flex-direction: column;
  padding-left: 10px;
}

.section-heading {
  font-size: 18px;
  letter-spacing: 2px;
  margin: 0 0 10px 0;
  color: var(--ink, #28241e);
  font-weight: normal;
  border-bottom: 1px solid rgba(148, 115, 69, 0.2);
  padding-bottom: 4px;
}

.innate-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 18px;
  margin-bottom: 14px;
}

.innate-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  padding: 2px 0;
}

.innate-name {
  color: var(--muted, #6a5e4d);
  letter-spacing: 3px;
}

.innate-val {
  color: var(--seal, #8a2a18);
  font-size: 16px;
  font-weight: bold;
}

/* Resource Meters */
.resource-meters {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

.meter-group {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.meter-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.meter-name {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--ink, #28241e);
}

.meter-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
}

.meter-numbers {
  font-size: 12px;
  color: var(--muted, #6a5e4d);
}

.meter-track {
  width: 100%;
  height: 5px;
  background: rgba(148, 115, 69, 0.18);
  border-radius: 3px;
  overflow: hidden;
}

.meter-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.hp-fill {
  background: linear-gradient(90deg, #aa3322, #cc4433);
}

.mp-fill {
  background: linear-gradient(90deg, #2b6c7a, #3fa0b2);
}

.sta-fill {
  background: linear-gradient(90deg, #b27a33, #d99a45);
}

.meridian-jump-btn {
  margin-top: 14px;
  background: transparent;
  border: 1px dashed rgba(148, 115, 69, 0.45);
  border-radius: 4px;
  padding: 6px 12px;
  font-family: inherit;
  font-size: 14px;
  color: var(--seal, #8a2a18);
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;
}

.meridian-jump-btn:hover {
  background: rgba(148, 115, 69, 0.1);
  border-style: solid;
}

/* Equipment Modal Overlay */
.equip-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(20, 18, 16, 0.55);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.equip-modal-content {
  width: 380px;
  max-width: 90vw;
  padding: 16px 18px;
  background: rgba(249, 246, 238, 0.98);
  border: 1px solid rgba(148, 115, 69, 0.5);
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(148, 115, 69, 0.25);
  padding-bottom: 6px;
  margin-bottom: 12px;
}

.picker-header h4 {
  margin: 0;
  font-size: 16px;
  color: var(--seal, #8a2a18);
  font-weight: 600;
}

.close-picker {
  background: transparent;
  border: none;
  font-size: 16px;
  color: var(--muted, #8c7b64);
  cursor: pointer;
}

.current-equipped-section {
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px dashed rgba(148, 115, 69, 0.2);
}

.section-label {
  font-size: 13px;
  color: var(--muted, #6a5e4d);
  display: block;
  margin-bottom: 6px;
}

.current-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(243, 234, 214, 0.6);
  padding: 6px 10px;
  border-radius: 4px;
}

.item-name {
  font-size: 14px;
  color: #2b4c6e;
}

.unequip-text-btn {
  background: transparent;
  border: none;
  color: var(--seal, #8a2a18);
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
  padding: 2px 6px;
}

.unequip-text-btn:hover {
  text-decoration: underline;
}

.available-section {
  display: flex;
  flex-direction: column;
}

.picker-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.picker-item-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(148, 115, 69, 0.2);
  border-radius: 4px;
}

.picker-icon {
  width: 32px;
  height: 32px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid rgba(148, 115, 69, 0.3);
}

.picker-item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.picker-item-details strong {
  font-size: 13px;
  color: var(--ink, #28241e);
}

.picker-item-details small {
  font-size: 11px;
  color: var(--muted, #6a5e4d);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.equip-text-btn {
  background: transparent;
  border: none;
  color: #2b6c7a;
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
  padding: 2px 6px;
  font-weight: bold;
}

.equip-text-btn:hover {
  text-decoration: underline;
}

.picker-empty {
  text-align: center;
  padding: 10px 6px;
  color: var(--muted, #6a5e4d);
}

.picker-empty p {
  margin: 0 0 4px;
  font-size: 13px;
}

.picker-empty small {
  font-size: 11px;
  opacity: 0.8;
}

/* Floating Notice */
.equip-toast-floating {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(30, 26, 22, 0.88);
  color: #f7eedc;
  border: 1px solid rgba(148, 115, 69, 0.6);
  border-radius: 4px;
  padding: 6px 18px;
  font-size: 14px;
  z-index: 2000;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  animation: fadeInOut 2.5s ease forwards;
}

/* Meridian View Mode */
.sheet-meridian-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.meridian-view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 6px;
}

.return-stats-btn {
  background: transparent;
  border: 1px solid rgba(148, 115, 69, 0.4);
  border-radius: 4px;
  padding: 4px 12px;
  font-family: inherit;
  font-size: 14px;
  color: var(--seal, #8a2a18);
  cursor: pointer;
  transition: all 0.2s ease;
}

.return-stats-btn:hover {
  background: rgba(148, 115, 69, 0.12);
}

.meridian-sub-tip {
  font-size: 12px;
  color: var(--muted, #6a5e4d);
}
</style>

