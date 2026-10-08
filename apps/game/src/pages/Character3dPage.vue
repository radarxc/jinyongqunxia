<script setup lang="ts">
/* global window, location, clearInterval, HTMLCanvasElement, HTMLInputElement, Event */
import { ref, shallowRef, onMounted, onBeforeUnmount, reactive, computed } from 'vue';
import {
  createCharacterViewer,
  createCharacterViewerLoader,
  type CharacterModelMeta,
  type CharacterPresetView,
  type CharacterViewerController,
} from '@tianshu/render/character-viewer';
import type { DressupActor, DressupFit, DressupStats } from '@tianshu/render';
import { useDressupIndex, type DressupIndexEntry } from './useDressupIndex';

const canvasRef = ref<HTMLCanvasElement | null>(null);
let viewer: CharacterViewerController | null = null;
let statsTimer = 0;

const isLoading = ref(true);
const loadingProgress = ref('正在加载 3D 模型...');

const DRESSUP_INDEX_URL = '/assets/default/model3d/dressup/index.json';
const dressupActor = shallowRef<DressupActor | null>(null);
const { index: dressupIndex, templates: dressupTemplates, equipmentGroups: dressupGroups,
  layers: dressupLayers, load: loadDressupIndex } = useDressupIndex(window.fetch.bind(window));
let dressupFrameId = 0;
let dressupLastFrame = 0;
let dressupLoadSeq = 0;
const dressupEquipSeq: Record<string, number> = {};
const pendingDressupSlots = reactive<Record<string, string>>({});
const dressupReady = ref(false);
const dressupError = ref('');
const selectedTemplate = ref('tpl_f_medium');
const selectedDressupClip = ref('idle');
const isUnlitMode = ref(true);
const equippedDressupSlots = reactive<Record<string, string>>({});
const selectedBodyLayers = ref<string[]>([]);
const bodyLayersPending = ref(false);
type MutableDressupStats = { -readonly [Key in keyof DressupStats]: DressupStats[Key] };
const dressupStats = reactive<MutableDressupStats>({
  drawCalls: 0, triangles: 0, boneTextureUploads: 0, bodyLayers: [], layerTextureBytes: 0,
});

function dressupSlot(entry: DressupIndexEntry): string {
  return entry.slot ?? entry.socket ?? entry.kind;
}
function dressupLayerLabel(entry: DressupIndexEntry): string {
  const id = entry.id.replace(/^dressup__layer__/u, '');
  return id === 'eq_jinzhuang' ? '贴图层 · 江湖劲装' : `贴图层 · ${id}`;
}

function setDressupDebug(): void {
  (window as unknown as { __dressup?: unknown }).__dressup = {
    actor: dressupActor.value, viewer, index: dressupIndex.value,
    layers: [...selectedBodyLayers.value],
    stats: () => dressupActor.value?.stats() ?? null,
  };
}

function syncDressupStats(): void {
  const next = dressupActor.value?.stats();
  if (!next) return;
  dressupStats.drawCalls = next.drawCalls;
  dressupStats.triangles = next.triangles;
  dressupStats.boneTextureUploads = next.boneTextureUploads;
  dressupStats.bodyLayers = next.bodyLayers;
  dressupStats.layerTextureBytes = next.layerTextureBytes;
}

function dressupLoop(now: number): void {
  if (dressupActor.value) {
    const dt = dressupLastFrame === 0 ? 0 : Math.min((now - dressupLastFrame) / 1000, 0.1);
    dressupLastFrame = now;
    dressupActor.value.update(dt);
    syncDressupStats();
  }
  dressupFrameId = window.requestAnimationFrame(dressupLoop);
}

interface ModelOption {
  readonly id: string;
  readonly label: string;
  readonly url: string;
  readonly defaultPreset: CharacterPresetView;
  readonly desc: string;
}

const MODEL_OPTIONS: readonly ModelOption[] = [
  {
    id: 'npc_zhujue__ch00_f_bald_base_body',
    label: '🌟 主角女 · 裸模素体 (7.7头身 高挑身姿 · 20万面高精面容)',
    url: '/assets/default/model3d/npc_zhujue__ch00_f_bald_base_body/anim_idle_walk_run.glb?v=fresh_fullbody_v2',
    defaultPreset: 'full',
    desc: '7.7 头身古典高挑比例，53.4% 猎豹长腿，面容已祛痣净化，接缝法线平滑对齐',
  },
  {
    id: 'npc_zhujue__ch00_f',
    label: '主角女 · 越女便装',
    url: '/assets/default/model3d/npc_zhujue__ch00_f/anim_idle_walk_run.glb',
    defaultPreset: 'full',
    desc: '越女阿青同款江湖布衣',
  },
  {
    id: 'npc_zhujue__ch00_m',
    label: '主角男 · 青年便装',
    url: '/assets/default/model3d/npc_zhujue__ch00_m/anim_idle_walk_run.glb',
    defaultPreset: 'full',
    desc: '标准男性江湖主角素模',
  },
  {
    id: 'npc_generic_f',
    label: '通用女性 · 素衣',
    url: '/assets/default/model3d/npc_generic_f/anim_idle_walk_run.glb',
    defaultPreset: 'full',
    desc: 'NPC 通用女性基底模型',
  },
  {
    id: 'npc_generic_m',
    label: '通用男性 · 素衣',
    url: '/assets/default/model3d/npc_generic_m/anim_idle_walk_run.glb',
    defaultPreset: 'full',
    desc: 'NPC 通用男性基底模型',
  },
  {
    id: 'npc_aqing__ch00_youth',
    label: '阿青 · 越女剑 (静态骨骼)',
    url: '/assets/default/model3d/npc_aqing__ch00_youth/model_rig.glb',
    defaultPreset: 'full',
    desc: '越女剑主阿青专用绑定',
  },
  {
    id: 'npc_duanyu',
    label: '段誉 · 大理世子 (静态骨骼)',
    url: '/assets/default/model3d/npc_duanyu/model_rig.glb',
    defaultPreset: 'full',
    desc: '大理世子段誉模型',
  },
  {
    id: 'npc_xiaofeng',
    label: '萧峰 · 丐帮帮主 (静态骨骼)',
    url: '/assets/default/model3d/npc_xiaofeng/model_rig.glb',
    defaultPreset: 'full',
    desc: '丐帮帮主萧峰高大体格',
  },
];

const selectedModelId = ref<string>('');
const currentPreset = ref<CharacterPresetView>('full');
const modelMeta = ref<CharacterModelMeta | null>(null);

// ========================
// 纸娃娃与 3D 装备库定义
// ========================
type EquipCategory = 'hair' | 'clothing' | 'weapon' | 'luxury';

interface EquipmentItem {
  readonly id: string;
  readonly name: string;
  readonly category: EquipCategory;
  readonly icon: string;
  readonly url: string;
  readonly slot: 'head' | 'root' | 'hips' | 'chest';
  readonly offset: [number, number, number];
  readonly rotation: [number, number, number];
  readonly scale: number | [number, number, number];
  readonly desc: string;
  readonly tag: string;
}

const ALL_EQUIPMENT: readonly EquipmentItem[] = [
  // --- 发型 / 头部装扮 (4款) ---
  {
    id: 'hair_ponytail',
    name: '女侠高马尾',
    category: 'hair',
    icon: '💇',
    url: '/models/props/hair_ponytail.glb',
    slot: 'head',
    offset: [0, 0.03, -0.015],
    rotation: [0, Math.PI, 0],
    scale: 0.30,
    desc: '清爽利落英姿飒爽，束发红带随风飘扬',
    tag: '英气利落',
  },
  {
    id: 'hair_long_flow',
    name: '温婉流云发',
    category: 'hair',
    icon: '🪮',
    url: '/models/props/hair_long_flow.glb',
    slot: 'head',
    offset: [0, 0.02, 0.01],
    rotation: [0, 0, 0],
    scale: 0.32,
    desc: '长发垂肩随风舞动，灵动飘逸仙气盎然',
    tag: '温婉出尘',
  },
  {
    id: 'hair_bun_fairy',
    name: '飞仙双鬟髻',
    category: 'hair',
    icon: '✨',
    url: '/models/props/hair_bun_fairy.glb',
    slot: 'head',
    offset: [0, 0.08, -0.02],
    rotation: [0, Math.PI, 0],
    scale: 0.34,
    desc: '古典高髻步摇簪花，名门仙子端庄之态',
    tag: '华美端庄',
  },
  {
    id: 'item_bamboo_hat',
    name: '江湖竹编斗笠',
    category: 'hair',
    icon: '👒',
    url: '/models/props/item_bamboo_hat.glb',
    slot: 'head',
    offset: [0, 0.04, 0.0],
    rotation: [0, Math.PI, 0],
    scale: 0.40,
    desc: '青竹编织轻便斗笠，雨夜独行隐匿行藏',
    tag: '江湖孤客',
  },

  // --- 传世锦衣 (5套) ---
  {
    id: 'cloth_xianxia_dress',
    name: '仙侠流仙裙',
    category: 'clothing',
    icon: '👗',
    url: '/models/props/cloth_xianxia_dress.glb',
    slot: 'root',
    offset: [0, 0.88, 0],
    rotation: [0, -Math.PI / 2, 0],
    scale: 1.25,
    desc: '天青流云织锦双层长裙，广袖流仙出尘脱俗',
    tag: '青云流仙',
  },
  {
    id: 'cloth_crimson_gown',
    name: '赤霞织金袍',
    category: 'clothing',
    icon: '👘',
    url: '/models/props/cloth_crimson_gown.glb',
    slot: 'root',
    offset: [0, 0.93, 0],
    rotation: [0, -Math.PI / 2, 0],
    scale: 1.30,
    desc: '朱红云锦金凤纹饰长袍，华贵威仪气吞八荒',
    tag: '魔教尊者',
  },
  {
    id: 'cloth_black_assassin',
    name: '玄天夜行衣',
    category: 'clothing',
    icon: '🥷',
    url: '/models/props/cloth_black_assassin.glb',
    slot: 'root',
    offset: [0, 0.95, 0],
    rotation: [0, -Math.PI / 2, 0],
    scale: 1.30,
    desc: '玄黑修身刺客轻甲劲装，无声潜行快意恩仇',
    tag: '暗影刺客',
  },
  {
    id: 'cloth_kunlun_taoist',
    name: '昆仑素雪道袍',
    category: 'clothing',
    icon: '🥋',
    url: '/models/props/cloth_kunlun_taoist.glb',
    slot: 'root',
    offset: [0, 0.88, 0],
    rotation: [0, -Math.PI / 2, 0],
    scale: 1.25,
    desc: '素白底衬天蓝流云道袍，仙风道骨名门正宗',
    tag: '昆仑正宗',
  },
  {
    id: 'cloth_golden_armor',
    name: '紫金龙纹锦甲',
    category: 'clothing',
    icon: '🛡️',
    url: '/models/props/cloth_golden_armor.glb',
    slot: 'root',
    offset: [0, 0.96, 0],
    rotation: [0, -Math.PI / 2, 0],
    scale: 1.30,
    desc: '金丝织锦云龙软甲战袍，威震武林豪杰风范',
    tag: '金甲战神',
  },

  // --- 兵刃奇物 (5件) ---
  {
    id: 'item_qingfeng_sword',
    name: '三尺青锋宝剑',
    category: 'weapon',
    icon: '🗡️',
    url: '/models/props/item_qingfeng_sword.glb',
    slot: 'hips',
    offset: [-0.14, -0.05, 0.05],
    rotation: [0.15, Math.PI - 0.2, 0.3],
    scale: 0.50,
    desc: '玄铁淬火龙纹剑鞘，出鞘寒芒夺目诛邪破魔',
    tag: '吹毛断发',
  },
  {
    id: 'item_iron_dagger',
    name: '玄铁冷月短匕',
    category: 'weapon',
    icon: '🔪',
    url: '/models/props/item_iron_dagger.glb',
    slot: 'hips',
    offset: [0.14, -0.08, 0.05],
    rotation: [-0.2, -Math.PI / 2, -0.4],
    scale: 0.24,
    desc: '贴身防身玄铁短匕，牛皮缠金鞘迅疾致命',
    tag: '冷月无声',
  },
  {
    id: 'item_wine_gourd',
    name: '武林朱砂酒葫芦',
    category: 'weapon',
    icon: '🍶',
    url: '/models/props/item_wine_gourd.glb',
    slot: 'hips',
    offset: [0.12, -0.08, 0.08],
    rotation: [0.1, 0.3, 0.2],
    scale: 0.16,
    desc: '红绳系挂陈年佳酿，豪气干云一醉解千愁',
    tag: '豪侠狂饮',
  },
  {
    id: 'item_folding_fan',
    name: '逍遥青玉折扇',
    category: 'weapon',
    icon: '🪭',
    url: '/models/props/item_folding_fan.glb',
    slot: 'hips',
    offset: [-0.08, -0.05, 0.12],
    rotation: [0.2, 0, 0.4],
    scale: 0.24,
    desc: '青玉为骨素绢作面，风雅翩翩暗藏点穴杀机',
    tag: '风雅无双',
  },
  {
    id: 'item_bamboo_scroll',
    name: '天书秘籍竹简',
    category: 'weapon',
    icon: '📜',
    url: '/models/props/item_bamboo_scroll.glb',
    slot: 'hips',
    offset: [-0.12, -0.06, -0.05],
    rotation: [0.1, 0.2, -0.4],
    scale: 0.22,
    desc: '古籍天书十四经卷，刻录无上心法奥义',
    tag: '神功秘卷',
  },

  // --- 随身奢品 (4件) ---
  {
    id: 'luxury_jade_pendant',
    name: '羊脂双龙玉佩',
    category: 'luxury',
    icon: '📿',
    url: '/models/props/luxury_jade_pendant.glb',
    slot: 'hips',
    offset: [0.10, -0.15, 0.10],
    rotation: [0, 0, 0],
    scale: 0.14,
    desc: '和田上等羊脂白玉，双龙戏珠流苏世家珍藏',
    tag: '温润美玉',
  },
  {
    id: 'luxury_gold_pomander',
    name: '玲珑金丝香囊',
    category: 'luxury',
    icon: '🪙',
    url: '/models/props/luxury_gold_pomander.glb',
    slot: 'hips',
    offset: [0.09, -0.15, 0.10],
    rotation: [0, 0, 0],
    scale: 0.15,
    desc: '唐宫镂金葡萄花鸟纹香囊，香溢四座奢华尊崇',
    tag: '金丝玲珑',
  },
  {
    id: 'item_silk_pouch',
    name: '刺绣金丝荷包',
    category: 'luxury',
    icon: '👛',
    url: '/models/props/item_silk_pouch.glb',
    slot: 'hips',
    offset: [0.09, -0.15, 0.10],
    rotation: [0, 0, 0],
    scale: 0.15,
    desc: '苏绣织金百花锦囊，贴身装储灵丹妙药',
    tag: '百花金丝',
  },
  {
    id: 'item_buddhist_beads',
    name: '菩提沉香念珠',
    category: 'luxury',
    icon: '📿',
    url: '/models/props/item_buddhist_beads.glb',
    slot: 'chest',
    offset: [0, 0.08, 0.06],
    rotation: [Math.PI / 4, 0, 0],
    scale: 0.30,
    desc: '百年沉香菩提佛珠，凝神静气除杂念庇佑平安',
    tag: '佛门禅心',
  },
];

// 一键预设套装
interface OutfitPreset {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly desc: string;
  readonly hairId?: string;
  readonly clothingId?: string;
  readonly weaponId?: string;
  readonly luxuryId?: string;
}

const PRESET_OUTFITS: readonly OutfitPreset[] = [
  {
    id: 'preset_xianxia',
    name: '越女剑仙',
    icon: '🗡️',
    desc: '天青流仙裙配高挑马尾，手提青锋宝剑，佩百花金丝锦囊',
    hairId: 'hair_ponytail',
    clothingId: 'cloth_xianxia_dress',
    weaponId: 'item_qingfeng_sword',
    luxuryId: 'item_silk_pouch',
  },
  {
    id: 'preset_kunlun',
    name: '昆仑仙子',
    icon: '🌸',
    desc: '昆仑素雪流云道袍，飞仙双鬟髻，腰佩羊脂双龙玉佩',
    hairId: 'hair_bun_fairy',
    clothingId: 'cloth_kunlun_taoist',
    weaponId: 'item_qingfeng_sword',
    luxuryId: 'luxury_jade_pendant',
  },
  {
    id: 'preset_crimson',
    name: '魔教教主',
    icon: '🔥',
    desc: '赤霞织金凤袍大氅，流云青丝，青玉折扇与镂金香囊',
    hairId: 'hair_long_flow',
    clothingId: 'cloth_crimson_gown',
    weaponId: 'item_folding_fan',
    luxuryId: 'luxury_gold_pomander',
  },
  {
    id: 'preset_assassin',
    name: '暗夜刺客',
    icon: '🥷',
    desc: '玄天夜行衣配竹编斗笠，腰悬玄铁短匕与天书秘籍',
    hairId: 'item_bamboo_hat',
    clothingId: 'cloth_black_assassin',
    weaponId: 'item_iron_dagger',
    luxuryId: 'item_bamboo_scroll',
  },
  {
    id: 'preset_golden',
    name: '金甲战神',
    icon: '🛡️',
    desc: '紫金龙纹锦甲软袍，英姿马尾，悬挂朱砂酒葫芦狂放不羁',
    hairId: 'hair_ponytail',
    clothingId: 'cloth_golden_armor',
    weaponId: 'item_wine_gourd',
    luxuryId: 'luxury_gold_pomander',
  },
  {
    id: 'preset_naked',
    name: '解甲素体',
    icon: '🧘',
    desc: '一键卸下全部外挂服饰与装备，检视 7.7 头身高精无瑕裸模',
  },
];

// 当前穿戴记录
const currentEquip = reactive<Record<EquipCategory, string | null>>({
  hair: 'hair_ponytail',
  clothing: 'cloth_xianxia_dress',
  weapon: 'item_qingfeng_sword',
  luxury: 'luxury_jade_pendant',
});

// UI 选项卡
const activeTab = ref<'dressupV2' | 'wardrobe' | 'specs'>('dressupV2');
const wardrobeCategory = ref<'all' | EquipCategory>('all');

const filteredEquipment = computed(() => {
  if (wardrobeCategory.value === 'all') return ALL_EQUIPMENT;
  return ALL_EQUIPMENT.filter((item) => item.category === wardrobeCategory.value);
});

const equippedCount = computed(() => {
  let count = 0;
  if (currentEquip.hair) count++;
  if (currentEquip.clothing) count++;
  if (currentEquip.weapon) count++;
  if (currentEquip.luxury) count++;
  return count;
});

function clearDressupActor(): void {
  const actor = dressupActor.value;
  if (!actor) return;
  viewer?.detachExternal(actor.root);
  actor.dispose();
  dressupActor.value = null;
  for (const slot of Object.keys(dressupEquipSeq)) dressupEquipSeq[slot] = (dressupEquipSeq[slot] ?? 0) + 1;
  for (const slot of Object.keys(pendingDressupSlots)) delete pendingDressupSlots[slot];
  for (const slot of Object.keys(equippedDressupSlots)) delete equippedDressupSlots[slot];
  dressupStats.drawCalls = 0;
  dressupStats.triangles = 0;
  dressupStats.boneTextureUploads = 0;
  dressupStats.bodyLayers = [];
  dressupStats.layerTextureBytes = 0;
  setDressupDebug();
}

async function loadDressupTemplate(templateId: string, restoreIds: readonly string[] = []): Promise<void> {
  if (!viewer || !dressupIndex.value) return;
  const template = dressupIndex.value.groups.template.find(entry => entry.template === templateId);
  if (!template?.skeleton || !template.heightM) {
    dressupError.value = `模板 ${templateId} 缺少 skeleton 或 heightM`;
    return;
  }
  const seq = ++dressupLoadSeq;
  dressupReady.value = false;
  dressupError.value = '';
  loadingProgress.value = `正在加载换装模板 ${templateId}...`;
  isLoading.value = true;
  try {
    const { createDressupActor } = await import('@tianshu/render/dressup');
    const next = await createDressupActor({
      bodyUrl: template.file, frameUrl: template.skeleton, heightM: template.heightM,
      loader: createCharacterViewerLoader(),
      unlit: isUnlitMode.value,
    });
    if (seq !== dressupLoadSeq || !viewer) { next.dispose(); return; }
    clearDressupActor();
    dressupActor.value = next;
    selectedTemplate.value = templateId;
    selectedModelId.value = '';
    viewer.attachExternal(next.root);
    viewer.clearProps();
    viewer.setUnlitMode(isUnlitMode.value);
    next.playClip(selectedDressupClip.value, 0);
    for (const id of restoreIds) {
      const entry = Object.values(dressupIndex.value.groups).flat().find(value =>
        value.id === id && value.template === templateId);
      if (entry) await toggleDressup(entry);
    }
    await applyBodyLayers();
    dressupReady.value = true;
    syncDressupStats();
    setDressupDebug();
  } catch (error) {
    dressupError.value = error instanceof Error ? error.message : String(error);
    console.error('Failed to load dressup template', error);
  } finally {
    if (seq === dressupLoadSeq) isLoading.value = false;
  }
}

async function toggleDressup(entry: DressupIndexEntry): Promise<void> {
  if (!dressupActor.value || !entry.fit || entry.template !== selectedTemplate.value) return;
  const slot = dressupSlot(entry);
  if (pendingDressupSlots[slot] === entry.id) return;
  const current = equippedDressupSlots[slot];
  if (current === entry.id) {
    dressupActor.value.unequip(entry.id);
    delete equippedDressupSlots[slot];
    syncDressupStats();
    return;
  }
  if (current) dressupActor.value.unequip(current);
  const actor = dressupActor.value;
  const seq = (dressupEquipSeq[slot] ?? 0) + 1;
  dressupEquipSeq[slot] = seq;
  pendingDressupSlots[slot] = entry.id;
  dressupError.value = '';
  try {
    const response = await window.fetch(entry.fit);
    if (!response.ok) throw new Error(`FIT_HTTP_${response.status}`);
    const fit = await response.json() as DressupFit;
    if (entry.socket && !fit.socket) {
      Object.assign(fit, { socket: entry.socket });
    }
    if (entry.kind !== 'garment' && entry.kind !== 'hair' && entry.kind !== 'prop') return;
    await actor.equip({ kind: entry.kind, id: entry.id, url: entry.file, fit });
    if (seq !== dressupEquipSeq[slot] || actor !== dressupActor.value) {
      actor.unequip(entry.id);
      return;
    }
    equippedDressupSlots[slot] = entry.id;
    syncDressupStats();
  } catch (error) {
    if (seq !== dressupEquipSeq[slot] || actor !== dressupActor.value) return;
    dressupError.value = error instanceof Error ? error.message : String(error);
    console.error('Failed to equip dressup asset', error);
  } finally {
    if (seq === dressupEquipSeq[slot]) delete pendingDressupSlots[slot];
  }
}

async function applyBodyLayers(): Promise<void> {
  const actor = dressupActor.value;
  if (!actor) return;
  const entries = dressupLayers.value.filter(entry => selectedBodyLayers.value.includes(entry.id));
  bodyLayersPending.value = true; dressupError.value = '';
  try {
    await actor.setBodyLayers(entries.map((entry, order) => ({
      id: entry.id, url: entry.file, order,
    })));
    if (actor === dressupActor.value) { syncDressupStats(); setDressupDebug(); }
  } catch (error) {
    if (actor === dressupActor.value) {
      dressupError.value = error instanceof Error ? error.message : String(error);
      console.error('Failed to apply dressup body layers', error);
    }
  } finally {
    if (actor === dressupActor.value) bodyLayersPending.value = false;
  }
}

async function toggleBodyLayer(entry: DressupIndexEntry): Promise<void> {
  const selected = selectedBodyLayers.value;
  selectedBodyLayers.value = selected.includes(entry.id)
    ? selected.filter(id => id !== entry.id) : [...selected, entry.id];
  setDressupDebug();
  await applyBodyLayers();
}

function playDressupClip(name: string): void {
  selectedDressupClip.value = name;
  try { dressupActor.value?.playClip(name, 0.16); }
  catch (error) { dressupError.value = error instanceof Error ? error.message : String(error); }
}

async function toggleUnlitMode(): Promise<void> {
  const restoreIds = Object.values(equippedDressupSlots);
  isUnlitMode.value = !isUnlitMode.value;
  viewer?.setUnlitMode(isUnlitMode.value);
  await loadDressupTemplate(selectedTemplate.value, restoreIds);
}

// 装备穿脱操作
async function toggleEquip(item: EquipmentItem): Promise<void> {
  if (!viewer) return;
  const current = currentEquip[item.category];

  if (current === item.id) {
    // 已经穿戴，执行脱下
    viewer.detachProp(item.id);
    currentEquip[item.category] = null;
    return;
  }

  // 若该部位已有其他装备，先卸下
  if (current) {
    viewer.detachProp(current);
  }

  try {
    await viewer.attachProp(item.id, item.url, {
      slot: item.slot,
      offset: item.offset,
      rotation: item.rotation,
      scale: item.scale,
    });
    currentEquip[item.category] = item.id;
  } catch (err) {
    console.error(`Failed to equip ${item.name}`, err);
  }
}

function unequipCategory(cat: EquipCategory): void {
  const current = currentEquip[cat];
  if (current && viewer) {
    viewer.detachProp(current);
  }
  currentEquip[cat] = null;
}

let equipSeq = 0;

async function applyOutfitPreset(preset: OutfitPreset): Promise<void> {
  if (!viewer) return;
  const seq = ++equipSeq;

  viewer.clearProps();
  currentEquip.hair = null;
  currentEquip.clothing = null;
  currentEquip.weapon = null;
  currentEquip.luxury = null;

  const toLoad: string[] = [];
  if (preset.hairId) toLoad.push(preset.hairId);
  if (preset.clothingId) toLoad.push(preset.clothingId);
  if (preset.weaponId) toLoad.push(preset.weaponId);
  if (preset.luxuryId) toLoad.push(preset.luxuryId);

  for (const id of toLoad) {
    if (seq !== equipSeq) return;
    const item = ALL_EQUIPMENT.find((e) => e.id === id);
    if (item) {
      try {
        await viewer.attachProp(item.id, item.url, {
          slot: item.slot,
          offset: item.offset,
          rotation: item.rotation,
          scale: item.scale,
        });
        if (seq !== equipSeq) {
          viewer.detachProp(item.id);
          return;
        }
        currentEquip[item.category] = item.id;
      } catch (e) {
        console.warn(`Failed to attach preset item ${id}:`, e);
      }
    }
  }
}

function resetToNaked(): void {
  applyOutfitPreset(PRESET_OUTFITS[PRESET_OUTFITS.length - 1]!);
}

// 统计信息
interface MutableStats {
  fps: number;
  frameTimeMs: number;
  currentClip: string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  triangles: number;
  skinnedMeshes: number;
  joints: number;
}

const stats = reactive<MutableStats>({
  fps: 60,
  frameTimeMs: 16.6,
  currentClip: '',
  currentTime: 0,
  duration: 0,
  isPlaying: true,
  triangles: 0,
  skinnedMeshes: 0,
  joints: 0,
});

// Toggles & Settings
const isWireframe = ref(false);
const isSkeleton = ref(false);
const isGrid = ref(true);
const isTurntable = ref(false);
const exposure = ref(1.0);
const lightIntensity = ref(1.0);
const timeScale = ref(1.0);

const selectedModel = computed(() =>
  MODEL_OPTIONS.find((m) => m.id === selectedModelId.value),
);

async function switchModel(id: string): Promise<void> {
  const target = MODEL_OPTIONS.find((m) => m.id === id);
  if (!target || !viewer) return;

  selectedModelId.value = id;
  if (dressupActor.value) { clearDressupActor(); dressupReady.value = false; viewer.setUnlitMode(false); }
  isLoading.value = true;
  loadingProgress.value = `正在加载 ${target.label}...`;

  try {
    const meta = await viewer.loadModel(target.url);
    modelMeta.value = meta;
    viewer.setCameraPreset(target.defaultPreset, false);
    currentPreset.value = target.defaultPreset;

    // 如果切回主角素模，自动挂载当前选中的纸娃娃装扮
    if (id === 'npc_zhujue__ch00_f_bald_base_body') {
      await restoreCurrentEquipment();
    } else {
      // 切换到带衣服的原版 NPC，清除额外挂件以防穿模
      viewer.clearProps();
    }
  } catch (err) {
    console.error('Failed to load 3D model', err);
    loadingProgress.value = `加载失败: ${err instanceof Error ? err.message : String(err)}`;
  } finally {
    isLoading.value = false;
  }
}

async function restoreCurrentEquipment(): Promise<void> {
  if (!viewer) return;
  viewer.clearProps();
  const list = [
    currentEquip.hair,
    currentEquip.clothing,
    currentEquip.weapon,
    currentEquip.luxury,
  ].filter(Boolean) as string[];

  for (const id of list) {
    const item = ALL_EQUIPMENT.find((e) => e.id === id);
    if (item) {
      try {
        await viewer.attachProp(item.id, item.url, {
          slot: item.slot,
          offset: item.offset,
          rotation: item.rotation,
          scale: item.scale,
        });
      } catch (e) {
        console.warn('Equip error', e);
      }
    }
  }
}

function selectPreset(preset: CharacterPresetView): void {
  currentPreset.value = preset;
  viewer?.setCameraPreset(preset, true);
}

function selectClip(clipName: string): void {
  viewer?.playClip(clipName, 0.3);
}

function togglePlay(): void {
  if (!viewer) return;
  if (stats.isPlaying) {
    viewer.pauseAnimation();
  } else {
    viewer.resumeAnimation();
  }
}

function onSpeedChange(speed: number): void {
  timeScale.value = speed;
  viewer?.setTimeScale(speed);
}

function onScrub(event: Event): void {
  const target = event.target as HTMLInputElement;
  const time = parseFloat(target.value);
  viewer?.seekTime(time);
}

function toggleWireframe(): void {
  isWireframe.value = !isWireframe.value;
  viewer?.setWireframe(isWireframe.value);
}

function toggleSkeleton(): void {
  isSkeleton.value = !isSkeleton.value;
  viewer?.setSkeleton(isSkeleton.value);
}

function toggleGrid(): void {
  isGrid.value = !isGrid.value;
  viewer?.setGrid(isGrid.value);
}

function toggleTurntable(): void {
  isTurntable.value = !isTurntable.value;
  viewer?.setAutoRotate(isTurntable.value, 1.0);
}

function onExposureChange(event: Event): void {
  const val = parseFloat((event.target as HTMLInputElement).value);
  exposure.value = val;
  viewer?.setExposure(val);
}

function onLightChange(event: Event): void {
  const val = parseFloat((event.target as HTMLInputElement).value);
  lightIntensity.value = val;
  viewer?.setLightIntensity(val);
}

function goHome(): void {
  location.href = '/';
}

function handleResize(): void {
  if (!canvasRef.value || !viewer) return;
  const rect = canvasRef.value.getBoundingClientRect();
  viewer.resize(rect.width, rect.height, window.devicePixelRatio || 1);
}

onMounted(async () => {
  if (!canvasRef.value) return;
  viewer = createCharacterViewer(canvasRef.value);
  (window as unknown as Record<string, unknown>)['__viewer'] = viewer;
  (window as unknown as Record<string, unknown>)['__applyOutfitPreset'] = applyOutfitPreset;
  (window as unknown as Record<string, unknown>)['__PRESET_OUTFITS'] = PRESET_OUTFITS;
  handleResize();
  window.addEventListener('resize', handleResize);

  try {
    await loadDressupIndex(DRESSUP_INDEX_URL);
    await loadDressupTemplate(selectedTemplate.value);
  } catch (error) {
    dressupError.value = error instanceof Error ? error.message : String(error);
    console.error('Failed to initialize dressup v2', error);
    isLoading.value = false;
    setDressupDebug();
  }
  dressupFrameId = window.requestAnimationFrame(dressupLoop);

  statsTimer = window.setInterval(() => {
    if (!viewer) return;
    const s = viewer.getStats();
    stats.fps = s.fps;
    stats.frameTimeMs = s.frameTimeMs;
    stats.currentClip = s.currentClip;
    stats.currentTime = s.currentTime;
    stats.duration = s.duration;
    stats.isPlaying = s.isPlaying;
    stats.triangles = s.triangles;
    stats.skinnedMeshes = s.skinnedMeshes;
    stats.joints = s.joints;
  }, 100);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  clearInterval(statsTimer);
  window.cancelAnimationFrame(dressupFrameId);
  clearDressupActor();
  viewer?.dispose();
  viewer = null;
});
</script>

<template>
  <div class="character-viewer-page">
    <!-- Viewport 3D Canvas -->
    <canvas ref="canvasRef" class="viewport-canvas" />

    <!-- Top Navigation Bar -->
    <header class="top-nav">
      <div class="top-nav-left">
        <button type="button" class="back-btn" @click="goHome">
          <span class="back-icon">←</span> 返回游戏
        </button>
        <div class="brand-title">
          <h1>天书录 · 3D 纸娃娃装扮与角色检视台</h1>
          <span class="brand-badge">STUDIO</span>
        </div>
      </div>

      <!-- Model Selector -->
      <div class="top-nav-center">
        <label class="model-select-label">
          <span class="label-icon">👤</span> 检视底模：
          <select
            :value="selectedModelId"
            class="model-select"
            @change="(e) => switchModel((e.target as HTMLSelectElement).value)"
          >
            <option value="" disabled>换装 v2 当前模板</option>
            <option
              v-for="opt in MODEL_OPTIONS"
              :key="opt.id"
              :value="opt.id"
            >
              {{ opt.label }}
            </option>
          </select>
        </label>
      </div>

      <div class="top-nav-right">
        <div class="fps-chip" :class="{ 'fps-low': stats.fps < 30 }">
          {{ stats.fps }} FPS
        </div>
      </div>
    </header>

    <!-- Left Floating Controls: Camera Presets & Animation -->
    <aside class="left-panel">
      <!-- Camera Presets -->
      <div class="glass-card">
        <div class="card-header">
          <span class="card-icon">🎥</span>
          <h3>特写与检视视角</h3>
        </div>
        <div class="preset-buttons">
          <button
            type="button"
            class="ctrl-btn"
            :class="{ active: currentPreset === 'full' }"
            @click="selectPreset('full')"
          >
            🎯 全身检视 (7.7 头身 / 53.4% 猎豹长腿)
          </button>
          <button
            type="button"
            class="ctrl-btn highlight"
            :class="{ active: currentPreset === 'face' }"
            @click="selectPreset('face')"
          >
            ✨ 面部特写 (检视无痣洁面与五官)
          </button>
          <button
            type="button"
            class="ctrl-btn highlight"
            :class="{ active: currentPreset === 'neck' }"
            @click="selectPreset('neck')"
          >
            🔗 颈部平滑 (单 Mesh 连续无缝)
          </button>
          <button
            type="button"
            class="ctrl-btn"
            :class="{ active: currentPreset === 'back' }"
            @click="selectPreset('back')"
          >
            🔄 背部剪影 (体态与背部肩胛线条)
          </button>
          <button
            type="button"
            class="ctrl-btn"
            :class="{ active: currentPreset === 'legs' }"
            @click="selectPreset('legs')"
          >
            👠 下肢比例 (修长足踝与长腿走势)
          </button>
        </div>
      </div>

      <!-- Animation Player -->
      <div class="glass-card">
        <div class="card-header">
          <span class="card-icon">🏃</span>
          <h3>动作与步态播放</h3>
        </div>

        <div v-if="modelMeta && modelMeta.clips.length > 0" class="anim-clips">
          <div class="clip-selector">
            <button
              v-for="clip in modelMeta.clips"
              :key="clip"
              type="button"
              class="clip-btn"
              :class="{ active: stats.currentClip === clip }"
              @click="selectClip(clip)"
            >
              {{ clip === 'idle' ? '🧘 待机呼吸' : clip === 'walk' ? '🚶 行走步态' : clip === 'run' ? '🏃 奔跑冲刺' : clip }}
            </button>
          </div>

          <!-- Timeline scrubber -->
          <div v-if="stats.duration > 0" class="timeline-row">
            <button type="button" class="play-pause-btn" @click="togglePlay">
              {{ stats.isPlaying ? '⏸️' : '▶️' }}
            </button>
            <input
              type="range"
              class="timeline-slider"
              min="0"
              :max="stats.duration"
              step="0.01"
              :value="stats.currentTime"
              @input="onScrub"
            >
            <span class="timeline-time">
              {{ stats.currentTime.toFixed(1) }}s / {{ stats.duration.toFixed(1) }}s
            </span>
          </div>

          <!-- Speed slider -->
          <div class="speed-row">
            <span class="speed-label">播放速率:</span>
            <div class="speed-buttons">
              <button
                v-for="spd in [0.25, 0.5, 1.0, 1.5]"
                :key="spd"
                type="button"
                class="speed-btn"
                :class="{ active: timeScale === spd }"
                @click="onSpeedChange(spd)"
              >
                {{ spd }}x{{ spd === 0.25 ? ' (慢放)' : '' }}
              </button>
            </div>
          </div>
        </div>

        <div v-else class="empty-anim-tip">
          当前模型为纯骨骼素模 (无内嵌片段)，处于标准 T-Pose / 绑定姿态。
        </div>
      </div>
    </aside>

    <!-- Right Floating Panel: Wardrobe & Inspector -->
    <aside class="right-panel">
      <!-- Main Tab Switcher -->
      <div class="tab-header-card">
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'dressupV2' }"
          @click="activeTab = 'dressupV2'"
        >
          🧩 换装 v2
          <span class="badge-count">
            {{ Object.keys(equippedDressupSlots).length + selectedBodyLayers.length }}
          </span>
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'wardrobe' }"
          @click="activeTab = 'wardrobe'"
        >
          👘 纸娃娃与装备库
          <span class="badge-count">{{ equippedCount }}</span>
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'specs' }"
          @click="activeTab = 'specs'"
        >
          📊 质检与渲染
        </button>
      </div>

      <!-- TAB 1: 换装 v2 索引驱动面板 -->
      <div v-if="activeTab === 'dressupV2'" class="wardrobe-container">
        <div class="glass-card compact dressup-v2-card">
          <div class="card-header-row">
            <div class="card-header-title"><span class="card-icon">🧍</span><h3>体型模板</h3></div>
            <span class="v2-ready" :class="{ ready: dressupReady }">
              {{ dressupReady ? '已挂载' : '未就绪' }}
            </span>
          </div>
          <div class="v2-button-grid">
            <button
              v-for="entry in dressupTemplates"
              :key="entry.id"
              type="button"
              class="toggle-btn"
              :class="{ active: selectedTemplate === entry.template }"
              @click="loadDressupTemplate(entry.template)"
            >
              {{ entry.template.replace('tpl_f_', '') }} · {{ entry.heightM?.toFixed(2) }} m
              <span class="v2-status" :class="entry.status">{{ entry.status }}</span>
            </button>
          </div>
        </div>

        <div class="glass-card compact dressup-v2-card">
          <div class="card-header"><span class="card-icon">🏃</span><h3>动作与观感</h3></div>
          <div class="v2-button-grid">
            <button
              v-for="clip in ['idle', 'walk', 'run']"
              :key="clip"
              type="button"
              class="toggle-btn"
              :class="{ active: selectedDressupClip === clip }"
              @click="playDressupClip(clip)"
            >
              {{ clip }}
            </button>
            <button type="button" class="toggle-btn" :class="{ active: isUnlitMode }" @click="toggleUnlitMode">
              {{ isUnlitMode ? 'unlit（Tripo）' : '原灯光（ACES）' }}
            </button>
          </div>
        </div>

        <div v-for="group in dressupGroups" :key="group.kind" class="glass-card compact dressup-v2-card">
          <div class="card-header"><span class="card-icon">📦</span><h3>{{ group.label }}</h3></div>
          <p v-if="group.entries.length === 0" class="v2-empty">索引暂无可用素材；后续合入会自动出现。</p>
          <button
            v-for="entry in group.entries"
            :key="entry.id + ':' + entry.template"
            type="button"
            class="v2-equip-row"
            :class="{ equipped: equippedDressupSlots[dressupSlot(entry)] === entry.id }"
            :disabled="entry.template !== selectedTemplate || !entry.fit"
            @click="toggleDressup(entry)"
          >
            <span>{{ entry.id.replace(/^dressup__(?:garment|hair|prop)__/u, '') }}</span>
            <span class="v2-status" :class="entry.status">{{ entry.status }}</span>
            <small>{{ entry.socket || entry.slot || '—' }} · {{ entry.template }}</small>
          </button>
        </div>

        <div class="glass-card compact dressup-v2-card">
          <div class="card-header"><span class="card-icon">🎨</span><h3>贴图层</h3></div>
          <p class="v2-empty">可多选并按列表顺序叠加；可与网格衣物同时启用作对比。</p>
          <p v-if="dressupLayers.length === 0" class="v2-empty">索引暂无可用素材；E3 合入后会自动出现。</p>
          <button
            v-for="entry in dressupLayers"
            :key="entry.id"
            type="button"
            class="v2-equip-row"
            :class="{ equipped: selectedBodyLayers.includes(entry.id) }"
            :disabled="!dressupReady || bodyLayersPending"
            @click="toggleBodyLayer(entry)"
          >
            <span>{{ dressupLayerLabel(entry) }}</span>
            <span class="v2-status" :class="entry.status">{{ entry.status }}</span>
            <small>{{ entry.slot || 'body' }} · 三体型共 UV</small>
          </button>
        </div>

        <div class="glass-card compact dressup-v2-card">
          <div class="card-header"><span class="card-icon">📈</span><h3>Actor stats</h3></div>
          <div class="v2-stats">
            <span>draw {{ dressupStats.drawCalls }}</span>
            <span>tri {{ dressupStats.triangles.toLocaleString() }}</span>
            <span>boneTexture {{ dressupStats.boneTextureUploads }}</span>
            <span>layers {{ dressupStats.bodyLayers.join(' → ') || '—' }}</span>
            <span>layerTexture {{ (dressupStats.layerTextureBytes / 1048576).toFixed(1) }} MiB</span>
          </div>
          <p v-if="dressupError" class="v2-error">{{ dressupError }}</p>
        </div>
      </div>

      <!-- TAB 2: 旧纸娃娃与换装面板（保留） -->
      <div v-if="activeTab === 'wardrobe'" class="wardrobe-container">
        <!-- 1. 一键神装预设 -->
        <div class="glass-card compact">
          <div class="card-header-row">
            <div class="card-header-title">
              <span class="card-icon">⚡</span>
              <h3>一键传世神装</h3>
            </div>
            <button
              type="button"
              class="clear-all-btn"
              title="卸下所有装备与服饰"
              @click="resetToNaked"
            >
              🧹 一键素体
            </button>
          </div>

          <div class="preset-outfit-grid">
            <button
              v-for="p in PRESET_OUTFITS.slice(0, 5)"
              :key="p.id"
              type="button"
              class="preset-outfit-btn"
              @click="applyOutfitPreset(p)"
            >
              <span class="p-icon">{{ p.icon }}</span>
              <span class="p-name">{{ p.name }}</span>
            </button>
          </div>
        </div>

        <!-- 2. 部位分类切换 -->
        <div class="glass-card wardrobe-main-card">
          <div class="category-tabs">
            <button
              type="button"
              class="cat-tab-btn"
              :class="{ active: wardrobeCategory === 'all' }"
              @click="wardrobeCategory = 'all'"
            >
              全部
            </button>
            <button
              type="button"
              class="cat-tab-btn"
              :class="{ active: wardrobeCategory === 'hair' }"
              @click="wardrobeCategory = 'hair'"
            >
              💇 发型
            </button>
            <button
              type="button"
              class="cat-tab-btn"
              :class="{ active: wardrobeCategory === 'clothing' }"
              @click="wardrobeCategory = 'clothing'"
            >
              👗 锦衣 (5套)
            </button>
            <button
              type="button"
              class="cat-tab-btn"
              :class="{ active: wardrobeCategory === 'weapon' }"
              @click="wardrobeCategory = 'weapon'"
            >
              ⚔️ 兵刃 (5件)
            </button>
            <button
              type="button"
              class="cat-tab-btn"
              :class="{ active: wardrobeCategory === 'luxury' }"
              @click="wardrobeCategory = 'luxury'"
            >
              💎 奢品 (4件)
            </button>
          </div>

          <!-- 装备项目列表 -->
          <div class="equipment-scroll-list">
            <div
              v-for="item in filteredEquipment"
              :key="item.id"
              class="equipment-card"
              :class="{ equipped: currentEquip[item.category] === item.id }"
              @click="toggleEquip(item)"
            >
              <div class="equip-icon-box">
                <span class="item-icon">{{ item.icon }}</span>
                <span v-if="currentEquip[item.category] === item.id" class="equipped-badge">✓ 已穿戴</span>
              </div>
              <div class="equip-info">
                <div class="equip-name-row">
                  <span class="equip-name">{{ item.name }}</span>
                  <span class="equip-tag">{{ item.tag }}</span>
                </div>
                <p class="equip-desc">{{ item.desc }}</p>
              </div>
              <div class="equip-action">
                <button
                  type="button"
                  class="action-btn"
                  :class="{ remove: currentEquip[item.category] === item.id }"
                >
                  {{ currentEquip[item.category] === item.id ? '卸下' : '穿戴' }}
                </button>
              </div>
            </div>
          </div>

          <!-- 部位卸下操作条 -->
          <div v-if="wardrobeCategory !== 'all' && currentEquip[wardrobeCategory]" class="category-footer-bar">
            <button type="button" class="unequip-cat-btn" @click="unequipCategory(wardrobeCategory)">
              ✕ 卸下当前部位装扮
            </button>
          </div>
        </div>
      </div>

      <!-- TAB 3: 模型质检与参数面板 -->
      <div v-else-if="activeTab === 'specs'" class="specs-container">
        <!-- Model Specifications Card -->
        <div class="glass-card">
          <div class="card-header">
            <span class="card-icon">📊</span>
            <h3>模型质检与身姿参数</h3>
          </div>

          <div class="spec-grid">
            <div class="spec-item">
              <span class="spec-label">身姿标尺</span>
              <span class="spec-val">1.68 m (标准高挑)</span>
            </div>
            <div class="spec-item highlight">
              <span class="spec-label">黄金头身比</span>
              <span class="spec-val">7.7 头身 (古典高挑身姿)</span>
            </div>
            <div class="spec-item highlight">
              <span class="spec-label">猎豹腿身比</span>
              <span class="spec-val">53.4% (腿长 0.898m)</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">高精三角面</span>
              <span class="spec-val">{{ stats.triangles.toLocaleString() }} 面</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Mixamo 骨骼</span>
              <span class="spec-val">{{ stats.joints }} 关节全套</span>
            </div>
            <div class="spec-item success">
              <span class="spec-label">面容微瑕祛除</span>
              <span class="spec-val">已纯净化 (无痣)</span>
            </div>
            <div class="spec-item success">
              <span class="spec-label">颈部接缝法线</span>
              <span class="spec-val">0.999997 (连续无缝)</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">材质贴图规范</span>
              <span class="spec-val">2K PBR 三通道</span>
            </div>
          </div>

          <p class="model-desc-text">
            {{ selectedModel?.desc }}
          </p>
        </div>

        <!-- View & Material Toggles -->
        <div class="glass-card">
          <div class="card-header">
            <span class="card-icon">🛠️</span>
            <h3>视图与渲染开关</h3>
          </div>

          <div class="toggle-grid">
            <button
              type="button"
              class="toggle-btn"
              :class="{ active: isWireframe }"
              @click="toggleWireframe"
            >
              🕸️ 线框拓扑 (Wireframe)
            </button>
            <button
              type="button"
              class="toggle-btn"
              :class="{ active: isSkeleton }"
              @click="toggleSkeleton"
            >
              🦴 骨骼关节点 (Bones)
            </button>
            <button
              type="button"
              class="toggle-btn"
              :class="{ active: isGrid }"
              @click="toggleGrid"
            >
              📐 地面网格 (Grid)
            </button>
            <button
              type="button"
              class="toggle-btn"
              :class="{ active: isTurntable }"
              @click="toggleTurntable"
            >
              💫 360° 转台 (Turntable)
            </button>
          </div>

          <!-- Sliders -->
          <div class="slider-group">
            <div class="slider-row">
              <span class="slider-label">曝光度: {{ exposure.toFixed(2) }}</span>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                :value="exposure"
                @input="onExposureChange"
              >
            </div>
            <div class="slider-row">
              <span class="slider-label">布光强度: {{ lightIntensity.toFixed(2) }}</span>
              <input
                type="range"
                min="0.4"
                max="2.2"
                step="0.05"
                :value="lightIntensity"
                @input="onLightChange"
              >
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Bottom Instructions Footer -->
    <footer class="bottom-footer">
      <span>🖱️ 鼠标左键：360° 旋转检视 · 右键：平移画布 · 滚轮：推拉缩放 · 点击装备一键穿脱随动骨骼</span>
    </footer>

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-box">
        <div class="loading-spinner" />
        <p>{{ loadingProgress }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.character-viewer-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #121316;
  color: #efe5d0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", sans-serif;
  user-select: none;
}

.viewport-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
}

/* Top Nav */
.top-nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: rgba(14, 15, 18, 0.88);
  border-bottom: 1px solid rgba(212, 175, 55, 0.25);
  backdrop-filter: blur(12px);
  z-index: 100;
}

.top-nav-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: rgba(30, 32, 38, 0.9);
  color: #e5dac2;
  border: 1px solid rgba(212, 175, 55, 0.4);
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.back-btn:hover {
  background: rgba(212, 175, 55, 0.2);
  border-color: #d4af37;
  color: #fff;
}

.brand-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-title h1 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #f7ede2;
  letter-spacing: 0.04em;
}

.brand-badge {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #d4af37;
  background: rgba(212, 175, 55, 0.15);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.top-nav-center {
  display: flex;
  align-items: center;
}

.model-select-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #d4af37;
  font-weight: 500;
}

.model-select {
  padding: 6px 12px;
  font-size: 13px;
  background: rgba(26, 28, 34, 0.95);
  color: #f7ede2;
  border: 1px solid rgba(212, 175, 55, 0.45);
  border-radius: 6px;
  cursor: pointer;
  outline: none;
}

.model-select:focus {
  border-color: #d4af37;
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
}

.top-nav-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.fps-chip {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 12px;
  color: #5cdb95;
  background: rgba(92, 219, 149, 0.15);
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid rgba(92, 219, 149, 0.3);
}

.fps-chip.fps-low {
  color: #e27d60;
  background: rgba(226, 125, 96, 0.15);
  border-color: rgba(226, 125, 96, 0.3);
}

/* Floating Panels */
.left-panel {
  position: absolute;
  top: 72px;
  left: 20px;
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  z-index: 90;
  pointer-events: none;
}

.right-panel {
  position: absolute;
  top: 72px;
  right: 20px;
  width: 380px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 90;
  pointer-events: none;
  max-height: calc(100vh - 100px);
}

.glass-card {
  pointer-events: auto;
  background: rgba(18, 20, 24, 0.92);
  border: 1px solid rgba(212, 175, 55, 0.28);
  border-radius: 10px;
  padding: 14px 16px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(14px);
}

.glass-card.compact {
  padding: 10px 12px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.card-header h3 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #d4af37;
  letter-spacing: 0.05em;
}

.card-icon {
  font-size: 14px;
}

.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.card-header-title {
  display: flex;
  align-items: center;
  gap: 6px;
}

.card-header-title h3 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #d4af37;
}

.clear-all-btn {
  background: rgba(180, 50, 40, 0.2);
  border: 1px solid rgba(180, 50, 40, 0.4);
  color: #ff9b90;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.clear-all-btn:hover {
  background: rgba(180, 50, 40, 0.4);
  color: #fff;
}

/* Main Tab Header */
.tab-header-card {
  pointer-events: auto;
  display: flex;
  background: rgba(22, 25, 31, 0.9);
  padding: 4px;
  border-radius: 8px;
  border: 1px solid rgba(212, 175, 55, 0.3);
  backdrop-filter: blur(12px);
  gap: 4px;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 500;
  color: #baa992;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tab-btn:hover {
  color: #f7ede2;
  background: rgba(255, 255, 255, 0.05);
}

.tab-btn.active {
  color: #ffd97d;
  background: rgba(212, 175, 55, 0.22);
  border: 1px solid rgba(212, 175, 55, 0.4);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.badge-count {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 10px;
  background: #d4af37;
  color: #121316;
  font-weight: 700;
}

/* Wardrobe Containers */
.wardrobe-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: calc(100vh - 170px);
}

.dressup-v2-card {
  display: grid;
  gap: 10px;
}

.v2-button-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.v2-ready {
  color: #a99f8c;
  font-size: 11px;
}

.v2-ready.ready { color: #8bd49c; }

.v2-status {
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  color: #d9cdb8;
  font-size: 9px;
  padding: 1px 5px;
}

.v2-status.candidate { border-color: rgba(91, 205, 124, 0.7); color: #8bd49c; }
.v2-status.draft { border-color: rgba(241, 177, 73, 0.7); color: #f1b149; }

.v2-equip-row {
  align-items: center;
  background: rgba(15, 16, 19, 0.75);
  border: 1px solid rgba(212, 175, 55, 0.18);
  border-radius: 6px;
  color: #efe5d0;
  cursor: pointer;
  display: grid;
  gap: 4px 8px;
  grid-template-columns: 1fr auto;
  padding: 8px 10px;
  text-align: left;
}

.v2-equip-row small { color: #918876; grid-column: 1 / -1; }
.v2-equip-row.equipped { border-color: #d4af37; background: rgba(111, 84, 23, 0.35); }
.v2-equip-row:disabled { cursor: not-allowed; opacity: 0.38; }
.v2-empty { color: #918876; font-size: 12px; margin: 0; }
.v2-stats { display: flex; flex-wrap: wrap; gap: 10px; color: #cdbf9e; font-size: 11px; }
.v2-error { color: #ff8e8e; font-size: 11px; margin: 0; overflow-wrap: anywhere; }

.preset-outfit-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}

.preset-outfit-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 4px;
  background: rgba(30, 33, 40, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  color: #e5dac2;
  cursor: pointer;
  transition: all 0.15s ease;
}

.preset-outfit-btn:hover {
  background: rgba(212, 175, 55, 0.2);
  border-color: #d4af37;
  color: #fff;
  transform: translateY(-1px);
}

.preset-outfit-btn .p-icon {
  font-size: 16px;
  margin-bottom: 2px;
}

.preset-outfit-btn .p-name {
  font-size: 10px;
  font-weight: 500;
  white-space: nowrap;
}

.wardrobe-main-card {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  padding: 10px 12px;
}

.category-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 8px;
}

.cat-tab-btn {
  flex: 1;
  padding: 4px 6px;
  font-size: 11px;
  background: rgba(30, 33, 40, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  color: #baa992;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  text-align: center;
}

.cat-tab-btn:hover {
  background: rgba(45, 50, 62, 0.8);
  color: #fff;
}

.cat-tab-btn.active {
  background: rgba(212, 175, 55, 0.25);
  border-color: #d4af37;
  color: #ffd97d;
  font-weight: 600;
}

.equipment-scroll-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  max-height: calc(100vh - 350px);
  padding-right: 4px;
}

.equipment-scroll-list::-webkit-scrollbar {
  width: 4px;
}

.equipment-scroll-list::-webkit-scrollbar-thumb {
  background: rgba(212, 175, 55, 0.3);
  border-radius: 2px;
}

.equipment-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: rgba(25, 28, 35, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.equipment-card:hover {
  background: rgba(38, 42, 54, 0.95);
  border-color: rgba(212, 175, 55, 0.4);
}

.equipment-card.equipped {
  background: rgba(212, 175, 55, 0.12);
  border-color: #d4af37;
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.2);
}

.equip-icon-box {
  position: relative;
  width: 40px;
  height: 40px;
  background: rgba(14, 16, 20, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.equipped .equip-icon-box {
  border-color: #d4af37;
  background: rgba(212, 175, 55, 0.2);
}

.equipped-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  font-size: 8px;
  background: #5cdb95;
  color: #0b1d13;
  padding: 1px 3px;
  border-radius: 3px;
  font-weight: 700;
}

.equip-info {
  flex: 1;
  min-width: 0;
}

.equip-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.equip-name {
  font-size: 12px;
  font-weight: 600;
  color: #f7ede2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.equipped .equip-name {
  color: #ffd97d;
}

.equip-tag {
  font-size: 9px;
  color: #d4af37;
  background: rgba(212, 175, 55, 0.15);
  padding: 1px 4px;
  border-radius: 3px;
  white-space: nowrap;
}

.equip-desc {
  margin: 0;
  font-size: 10px;
  color: #8c8272;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.equip-action {
  margin-left: auto;
}

.action-btn {
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid rgba(212, 175, 55, 0.4);
  background: rgba(30, 34, 42, 0.9);
  color: #e5dac2;
  transition: all 0.15s ease;
}

.action-btn:hover {
  background: #d4af37;
  color: #121316;
}

.action-btn.remove {
  border-color: rgba(226, 125, 96, 0.5);
  color: #ff9b90;
  background: rgba(180, 50, 40, 0.2);
}

.action-btn.remove:hover {
  background: #b5382b;
  color: #fff;
}

.category-footer-bar {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.unequip-cat-btn {
  width: 100%;
  padding: 5px;
  font-size: 11px;
  background: rgba(30, 33, 40, 0.6);
  border: 1px dashed rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  color: #baa992;
  cursor: pointer;
}

.unequip-cat-btn:hover {
  color: #ff9b90;
  border-color: #ff9b90;
  background: rgba(180, 50, 40, 0.2);
}

/* Specs Containers */
.specs-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  max-height: calc(100vh - 170px);
}

/* Preset Buttons */
.preset-buttons {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ctrl-btn {
  padding: 8px 12px;
  font-size: 12px;
  background: rgba(32, 35, 42, 0.85);
  color: #d8cfbe;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
}

.ctrl-btn:hover {
  background: rgba(50, 56, 68, 0.9);
  border-color: rgba(212, 175, 55, 0.4);
  color: #ffffff;
}

.ctrl-btn.active {
  background: rgba(180, 50, 40, 0.35);
  border-color: #b5382b;
  color: #ff9b90;
  font-weight: 600;
}

.ctrl-btn.highlight {
  border-color: rgba(212, 175, 55, 0.25);
}

.ctrl-btn.highlight.active {
  background: rgba(212, 175, 55, 0.25);
  border-color: #d4af37;
  color: #ffd97d;
  font-weight: 600;
}

/* Animation Player */
.anim-clips {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.clip-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.clip-btn {
  padding: 6px 8px;
  font-size: 11px;
  background: rgba(30, 33, 40, 0.8);
  color: #cfc5b2;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 5px;
  cursor: pointer;
  text-align: center;
  transition: all 0.15s ease;
}

.clip-btn:hover {
  background: rgba(45, 50, 62, 0.9);
  color: #fff;
}

.clip-btn.active {
  background: rgba(212, 175, 55, 0.25);
  border-color: #d4af37;
  color: #ffd97d;
  font-weight: 600;
}

.timeline-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.play-pause-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  padding: 4px 6px;
  font-size: 12px;
}

.timeline-slider {
  flex: 1;
  accent-color: #d4af37;
}

.timeline-time {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 10px;
  color: #a89d8b;
  min-width: 65px;
  text-align: right;
}

.speed-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.speed-label {
  font-size: 11px;
  color: #a89d8b;
}

.speed-buttons {
  display: flex;
  gap: 4px;
}

.speed-btn {
  padding: 2px 6px;
  font-size: 10px;
  background: rgba(30, 33, 40, 0.8);
  color: #b0a796;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  cursor: pointer;
}

.speed-btn.active {
  background: rgba(212, 175, 55, 0.25);
  border-color: #d4af37;
  color: #ffd97d;
  font-weight: 600;
}

.empty-anim-tip {
  font-size: 11px;
  color: #8c8272;
  line-height: 1.5;
  padding: 4px 0;
}

/* Specifications Grid */
.spec-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 10px;
}

.spec-item {
  background: rgba(12, 14, 18, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
}

.spec-item .spec-label {
  font-size: 10px;
  color: #8c8272;
}

.spec-item .spec-val {
  font-size: 12px;
  font-weight: 600;
  color: #f7ede2;
  margin-top: 2px;
}

.spec-item.highlight {
  border-color: rgba(212, 175, 55, 0.35);
  background: rgba(212, 175, 55, 0.08);
}

.spec-item.highlight .spec-val {
  color: #ffd97d;
}

.spec-item.success {
  border-color: rgba(92, 219, 149, 0.35);
  background: rgba(92, 219, 149, 0.08);
}

.spec-item.success .spec-val {
  color: #5cdb95;
}

.model-desc-text {
  margin: 6px 0 0;
  font-size: 11px;
  color: #a89d8b;
  line-height: 1.5;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 8px;
}

/* Toggles & View */
.toggle-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
  margin-bottom: 12px;
}

.toggle-btn {
  padding: 8px;
  font-size: 11px;
  background: rgba(30, 33, 40, 0.8);
  color: #cfc5b2;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;
}

.toggle-btn:hover {
  background: rgba(45, 50, 62, 0.9);
  color: #fff;
}

.toggle-btn.active {
  background: rgba(47, 110, 142, 0.5);
  border-color: #2f6e8e;
  color: #ffffff;
  font-weight: 600;
}

.slider-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 10px;
}

.slider-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.slider-label {
  font-size: 11px;
  color: #a89d8b;
}

.slider-row input[type='range'] {
  accent-color: #d4af37;
}

/* Footer Instructions */
.bottom-footer {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 18px;
  background: rgba(14, 16, 20, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  font-size: 12px;
  color: #9c9282;
  letter-spacing: 0.03em;
  backdrop-filter: blur(8px);
  z-index: 100;
  pointer-events: none;
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(12, 14, 18, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  backdrop-filter: blur(8px);
}

.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  color: #efe5d0;
  font-size: 14px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(212, 175, 55, 0.2);
  border-top-color: #d4af37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
