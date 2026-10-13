<script setup lang="ts">
/* global CanvasRenderingContext2D, HTMLCanvasElement, MouseEvent, TouchEvent, cancelAnimationFrame, requestAnimationFrame, window */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import {
  ACESFilmicToneMapping,
  AmbientLight,
  Box3,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
  type Object3D,
} from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { MeridianView } from '../projections';
import { gradeLabel } from '../i18n';

interface Point3D {
  id: string;
  name: string;
  meridianId: string;
  meridianName: string;
  pos: Vector3;
  normal: Vector3;
  opened: boolean;
  grade: number;
  flux: number;
  strength: number;
  desc?: string;
}

interface QiParticle {
  pathIndex: number;
  progress: number;
  speed: number;
  size: number;
  alpha: number;
  color: string;
}

interface BreakthroughVfx {
  x: number;
  y: number;
  elapsed: number;
  duration: number;
  particles: { x: number; y: number; vx: number; vy: number; alpha: number; size: number }[];
}

const props = withDefaults(defineProps<{
  meridians: readonly MeridianView[];
  modelUrl?: string;
}>(), {
  modelUrl: '/assets/default/model3d/npc_zhujue__ch00_m/anim_idle_walk_run.glb',
});
const emit = defineEmits<{ cultivate: [pointId: string] }>();

const webglCanvasRef = ref<HTMLCanvasElement>();
const overlayCanvasRef = ref<HTMLCanvasElement>();
const activeMeridianTab = ref<string>('all');
const selectedPointId = ref<string>('pt_baihui');
const hoveredPointId = ref<string | null>(null);
const cultivationNotice = ref<string>('');
const viewPreset = ref<'front' | 'back' | 'side' | null>('front');
const autoSpin = ref(false);
const modelLoading = ref(true);

// Internal copy of meridians to allow local interactive breakthrough
const localMeridians = ref<MeridianView[]>(JSON.parse(JSON.stringify(props.meridians)));
const locallyOpened = ref<Set<string>>(new Set());
watch(() => props.meridians, (next) => {
  localMeridians.value = JSON.parse(JSON.stringify(next));
}, { deep: true });

const acupointDescriptions: Record<string, string> = {
  pt_baihui: '百会穴：诸阳之会，百脉之宗。位于头顶巅顶，贯通后神明安和，内力流转全身畅达无阻。',
  pt_mingmen: '命门穴：一身生发之本，藏真阳元气。位于腰脊第十四节下，通之则精血充盈，内息雄浑。',
  pt_dazhui: '大椎穴：手足三阳及督脉之交会穴，统摄诸阳经之气血，通之能消百病风邪，筋骨强劲。',
  pt_changqiang: '长强穴：督脉初发之络，守阴阳转换之关。通之真气下沉归源，步履轻灵稳如磐石。',
  pt_qihai: '气海穴：下丹田气汇之渊，男子生气之源。位于脐下一寸五分，通之真气绵绵不绝。',
  pt_guanyuan: '关元穴：元阴元阳交蓄之室。通之培元固本，回阳救逆，真元充塞四肢百骸。',
  pt_dantian: '膻中穴：宗气聚会之海，调畅上焦之气机。通之胸中开朗，出招威势激荡若长风。',
  pt_shenque: '神阙穴：先天造化命蒂之所，调和脾胃真元，沟通阴阳水火。',
  pt_tiantu: '天突穴：任脉通喉之要，纳清吐浊，通达咽喉气道，发声清越如鹤唳长空。',
  pt_qichong: '气冲穴：冲脉之发轫，引气血横贯下焦，蓄积爆发之力。',
  pt_dahe: '大赫穴：冲脉与足少阴会穴，冲气大盛，周流无滞。',
  pt_daimai: '带脉穴：环腰一周如束带，总束诸经经脉，使真气不致下陷遗失。',
  pt_wushu: '五枢穴：带脉转枢之所，疏畅腰跨枢纽，行步乘风。',
  pt_zhubin: '筑宾穴：阴维脉之郄穴，蓄积一身阴柔真气，通之化解滞毒，经络柔韧。',
  pt_fushe: '府舍穴：足太阴与阴维之交会，通调中焦脏腑气机。',
  pt_qimen: '期门穴：肝经募穴，阴维脉所终，疏肝理气，内息运行顺畅无阻。',
  pt_jinmen: '金门穴：阳维脉之郄穴，导引足太阳之气，通之筋骨坚韧。',
  pt_naoshu: '臑俞穴：手太阳与阳维之交会，贯通臂膀经络，出掌威劲激增。',
  pt_fengchi: '风池穴：胆经与阳维之交会，清头明目，通之神志清明，耳目通灵。',
  pt_zhaohai: '照海穴：阴跷脉之所生，滋阴固肾，通之身法轻健，步履如履平地。',
  pt_jiaoxin: '交信穴：阴跷脉之郄穴，调畅少阴经气，回阳固真。',
  pt_shenmai: '申脉穴：阳跷脉之所生，统领一身阳刚动势，通之提气轻身。',
  pt_pucan: '仆参穴：足太阳与阳跷之会，安神定志，强筋健足。',
};

// Precise 3D coordinates [x, y, z, nx, ny, nz] mapped to humanoid anatomy
const defaultAcupoint3DMap: Record<string, [number, number, number, number, number, number]> = {
  // === 1. 任脉 (Ren Meridian - 前正中线) ===
  ap_renmai_chengjiang: [0, 1.44, 0.11, 0, 0.2, 1],
  pt_chengjiang: [0, 1.44, 0.11, 0, 0.2, 1],
  ap_renmai_tiantu: [0, 1.34, 0.08, 0, 0.3, 1],
  pt_tiantu: [0, 1.34, 0.08, 0, 0.3, 1],
  ap_renmai_danzhong: [0, 1.20, 0.11, 0, 0.1, 1],
  pt_dantian: [0, 1.20, 0.11, 0, 0.1, 1],
  ap_renmai_zhongwan: [0, 1.08, 0.11, 0, 0, 1],
  pt_zhongwan: [0, 1.08, 0.11, 0, 0, 1],
  ap_renmai_shuifen: [0, 1.02, 0.105, 0, 0, 1],
  ap_renmai_shenque: [0, 0.98, 0.10, 0, 0, 1],
  pt_shenque: [0, 0.98, 0.10, 0, 0, 1],
  ap_renmai_yinjiao: [0, 0.95, 0.10, 0, 0, 1],
  ap_renmai_qihai: [0, 0.92, 0.10, 0, 0, 1],
  pt_qihai: [0, 0.92, 0.10, 0, 0, 1],
  ap_renmai_shimen: [0, 0.89, 0.095, 0, 0, 1],
  ap_renmai_guanyuan: [0, 0.86, 0.09, 0, -0.1, 1],
  pt_guanyuan: [0, 0.86, 0.09, 0, -0.1, 1],
  ap_renmai_zhongji: [0, 0.81, 0.085, 0, -0.2, 1],
  ap_renmai_qugu: [0, 0.76, 0.08, 0, -0.3, 1],
  ap_renmai_huiyin: [0, 0.70, 0.02, 0, -1, 0],

  // === 2. 督脉 (Du Meridian - 后正中线) ===
  ap_dumai_baihui: [0, 1.68, 0.00, 0, 1, 0],
  pt_baihui: [0, 1.68, 0.00, 0, 1, 0],
  ap_dumai_shangxing: [0, 1.62, 0.07, 0, 0.8, 0.6],
  ap_dumai_shuigou: [0, 1.48, 0.11, 0, 0.2, 1],
  ap_dumai_dazhui: [0, 1.36, -0.095, 0, 0.2, -1],
  pt_dazhui: [0, 1.36, -0.095, 0, 0.2, -1],
  ap_dumai_shenzhu: [0, 1.26, -0.10, 0, 0, -1],
  pt_shenzhu: [0, 1.26, -0.10, 0, 0, -1],
  ap_dumai_shendao: [0, 1.20, -0.10, 0, 0, -1],
  pt_shendao: [0, 1.20, -0.10, 0, 0, -1],
  ap_dumai_zhiyang: [0, 1.13, -0.098, 0, 0, -1],
  pt_zhiyang: [0, 1.13, -0.098, 0, 0, -1],
  ap_dumai_jizhong: [0, 1.06, -0.096, 0, 0, -1],
  pt_jizhong: [0, 1.06, -0.096, 0, 0, -1],
  ap_dumai_mingmen: [0, 0.98, -0.092, 0, 0, -1],
  pt_mingmen: [0, 0.98, -0.092, 0, 0, -1],
  ap_dumai_yaoyangguan: [0, 0.91, -0.090, 0, 0, -1],
  pt_yaoyangguan: [0, 0.91, -0.090, 0, 0, -1],
  ap_dumai_yaoshu: [0, 0.83, -0.085, 0, -0.2, -1],
  ap_dumai_changqiang: [0, 0.75, -0.080, 0, -0.5, -1],
  pt_changqiang: [0, 0.75, -0.080, 0, -0.5, -1],

  // === 3. 冲脉 (Chong Meridian - 腹部前行) ===
  ap_chongmai_youmen: [0.038, 1.08, 0.105, 0.3, 0, 1],
  pt_youmen: [0.038, 1.08, 0.105, 0.3, 0, 1],
  ap_chongmai_futonggu: [0.038, 1.02, 0.103, 0.3, 0, 1],
  pt_tonggu: [0.038, 1.02, 0.103, 0.3, 0, 1],
  ap_chongmai_yindu: [0.038, 0.97, 0.10, 0.3, 0, 1],
  pt_yindu: [0.038, 0.97, 0.10, 0.3, 0, 1],
  ap_chongmai_shiguan: [0.038, 0.93, 0.098, 0.3, 0, 1],
  ap_chongmai_shangqu: [0.038, 0.90, 0.095, 0.3, 0, 1],
  ap_chongmai_huangshu: [0.038, 0.88, 0.093, 0.3, 0, 1],
  ap_chongmai_zhongzhu: [0.038, 0.86, 0.092, 0.3, 0, 1],
  ap_chongmai_siman: [0.038, 0.84, 0.090, 0.3, 0, 1],
  ap_chongmai_qixue: [0.038, 0.82, 0.088, 0.3, 0, 1],
  ap_chongmai_dahe: [0.038, 0.80, 0.085, 0.3, 0, 1],
  pt_dahe: [0.038, 0.80, 0.085, 0.3, 0, 1],
  ap_chongmai_henggu: [0.038, 0.77, 0.080, 0.3, 0, 1],
  ap_chongmai_qichong: [0.048, 0.74, 0.078, 0.4, 0, 0.9],
  pt_qichong: [0.048, 0.74, 0.078, 0.4, 0, 0.9],

  // === 4. 带脉 (Dai Meridian - 环腰束身) ===
  ap_daimai_daimai: [0.138, 0.95, 0.01, 1, 0, 0],
  pt_daimai: [0.138, 0.95, 0.01, 1, 0, 0],
  ap_daimai_wushu: [0.125, 0.88, 0.05, 0.8, -0.2, 0.5],
  pt_wushu: [0.125, 0.88, 0.05, 0.8, -0.2, 0.5],
  ap_daimai_weidao: [0.115, 0.82, 0.07, 0.7, -0.3, 0.6],
  pt_weidao: [0.115, 0.82, 0.07, 0.7, -0.3, 0.6],
  ap_daimai_zhangmen: [0.120, 1.05, 0.06, 0.8, 0, 0.6],
  ap_daimai_jingmen: [0.125, 1.02, -0.05, 0.8, 0, -0.6],
  ap_daimai_zulinqi: [0.085, 0.05, 0.08, 0.6, 0, 0.8],

  // === 5. 阴维脉 (Yinwei Meridian) ===
  ap_yinwei_zhubin: [0.068, 0.28, -0.02, 0.5, 0, -0.5],
  pt_zhubin: [0.068, 0.28, -0.02, 0.5, 0, -0.5],
  ap_yinwei_fushe: [0.105, 0.79, 0.07, 0.6, 0, 0.8],
  pt_fushe: [0.105, 0.79, 0.07, 0.6, 0, 0.8],
  ap_yinwei_daheng: [0.105, 0.98, 0.09, 0.6, 0, 0.8],
  ap_yinwei_fuai: [0.102, 1.05, 0.09, 0.6, 0, 0.8],
  ap_yinwei_qimen: [0.092, 1.14, 0.09, 0.5, 0, 0.8],
  pt_qimen: [0.092, 1.14, 0.09, 0.5, 0, 0.8],
  ap_yinwei_tiantu: [0, 1.34, 0.08, 0, 0.3, 1],
  ap_yinwei_lianquan: [0, 1.40, 0.09, 0, 0.3, 1],

  // === 6. 阳维脉 (Yangwei Meridian) ===
  ap_yangwei_jinmen: [0.105, 0.09, -0.04, 0.8, 0, -0.5],
  pt_jinmen: [0.105, 0.09, -0.04, 0.8, 0, -0.5],
  ap_yangwei_yangjiao: [0.112, 0.32, -0.03, 0.8, 0, -0.4],
  ap_yangwei_tianliao: [0.145, 1.32, -0.04, 0.6, 0.5, -0.5],
  ap_yangwei_jianjing: [0.150, 1.34, -0.02, 0.5, 0.8, -0.3],
  ap_yangwei_naoshu: [0.165, 1.28, -0.07, 0.7, 0.2, -0.6],
  pt_naoshu: [0.165, 1.28, -0.07, 0.7, 0.2, -0.6],
  ap_yangwei_fengchi: [0.065, 1.48, -0.08, 0.5, 0.3, -0.8],
  pt_fengchi: [0.065, 1.48, -0.08, 0.5, 0.3, -0.8],
  ap_yangwei_yamen: [0, 1.45, -0.09, 0, 0.2, -1],
  ap_yangwei_fengfu: [0, 1.48, -0.088, 0, 0.2, -1],
  ap_yangwei_benshen: [0.072, 1.62, 0.06, 0.5, 0.5, 0.7],
  ap_yangwei_toulinqi: [0.060, 1.64, 0.05, 0.4, 0.6, 0.6],

  // === 7. 阴跷脉 (Yinqiao Meridian) ===
  ap_yinqiao_zhaohai: [0.052, 0.08, 0.01, 0.8, 0, 0.4],
  pt_zhaohai: [0.052, 0.08, 0.01, 0.8, 0, 0.4],
  ap_yinqiao_jiaoxin: [0.056, 0.18, 0.01, 0.8, 0, 0.4],
  pt_jiaoxin: [0.056, 0.18, 0.01, 0.8, 0, 0.4],
  ap_yinqiao_sanyinjiao: [0.058, 0.24, 0.01, 0.8, 0, 0.4],
  ap_yinqiao_lougu: [0.062, 0.32, 0.02, 0.8, 0, 0.4],
  ap_yinqiao_lieque: [0.185, 0.98, 0.06, 0.8, 0, 0.6],
  ap_yinqiao_jingming: [0.018, 1.54, 0.09, 0.2, 0, 1],

  // === 8. 阳跷脉 (Yangqiao Meridian) ===
  ap_yangqiao_shenmai: [0.105, 0.09, -0.02, 0.9, 0, -0.3],
  pt_shenmai: [0.105, 0.09, -0.02, 0.9, 0, -0.3],
  ap_yangqiao_pucan: [0.102, 0.06, -0.05, 0.8, -0.2, -0.5],
  pt_pucan: [0.102, 0.06, -0.05, 0.8, -0.2, -0.5],
  ap_yangqiao_fuyang: [0.108, 0.20, -0.03, 0.8, 0, -0.4],
  ap_yangqiao_juliao: [0.145, 0.75, 0.02, 0.9, 0, 0.2],
  ap_yangqiao_naoshu: [0.165, 1.28, -0.07, 0.7, 0.2, -0.6],
  ap_yangqiao_jianyu: [0.195, 1.30, 0.01, 0.9, 0.3, 0.2],
  ap_yangqiao_jugu: [0.160, 1.34, 0.00, 0.7, 0.6, 0.1],
  ap_yangqiao_dicang: [0.032, 1.45, 0.105, 0.3, 0, 1],
  ap_yangqiao_juliao_wei: [0.038, 1.48, 0.10, 0.3, 0, 1],
};

function normalizeMeridianId(id: string): string {
  if (id.includes('ren')) return 'ren';
  if (id.includes('dumai') || id.includes('du')) return 'du';
  if (id.includes('chong')) return 'chong';
  if (id.includes('dai')) return 'dai';
  if (id.includes('yinwei')) return 'yinwei';
  if (id.includes('yangwei')) return 'yangwei';
  if (id.includes('yinqiao')) return 'yinqiao';
  if (id.includes('yangqiao')) return 'yangqiao';
  return id;
}

function isYinMeridian(id: string): boolean {
  const norm = normalizeMeridianId(id);
  return norm === 'ren' || norm === 'chong' || norm === 'yinwei' || norm === 'yinqiao';
}

function getPoint3D(pt: { id: string; name?: string; meridianId?: string }): { pos: Vector3; normal: Vector3 } {
  if (defaultAcupoint3DMap[pt.id]) {
    const raw = defaultAcupoint3DMap[pt.id]!;
    return {
      pos: new Vector3(raw[0], raw[1], raw[2]),
      normal: new Vector3(raw[3], raw[4], raw[5]).normalize(),
    };
  }
  for (const [key, raw] of Object.entries(defaultAcupoint3DMap)) {
    if (key.endsWith(pt.id) || pt.id.endsWith(key.replace(/^ap_[a-z]+_/u, ''))) {
      return {
        pos: new Vector3(raw[0], raw[1], raw[2]),
        normal: new Vector3(raw[3], raw[4], raw[5]).normalize(),
      };
    }
  }
  const isYin = isYinMeridian(pt.meridianId ?? '');
  return {
    pos: new Vector3(0, 1.0, isYin ? 0.10 : -0.09),
    normal: new Vector3(0, 0, isYin ? 1 : -1),
  };
}

function getAcupointDesc(pt: { id: string; name: string; meridianName?: string }): string {
  if (acupointDescriptions[pt.id]) return acupointDescriptions[pt.id]!;
  for (const desc of Object.values(acupointDescriptions)) {
    if (desc.startsWith(pt.name)) return desc;
  }
  return `${pt.name}穴：隶属${pt.meridianName || '经脉'}，汇通一身气血真元，贯通后可壮大周天内力，百脉通达。`;
}

const allPoint3DList = computed<Point3D[]>(() => {
  const result: Point3D[] = [];
  for (const m of localMeridians.value) {
    for (const pt of m.points) {
      const { pos, normal } = getPoint3D({ id: pt.id, name: pt.name, meridianId: m.id });
      result.push({
        id: pt.id,
        name: pt.name,
        meridianId: m.id,
        meridianName: m.name,
        pos,
        normal,
        opened: pt.opened || locallyOpened.value.has(pt.id),
        grade: pt.grade ?? 1,
        flux: pt.flux ?? 8,
        strength: pt.strength ?? 1,
        desc: getAcupointDesc({ id: pt.id, name: pt.name, meridianName: m.name }),
      });
    }
  }
  return result;
});

const displayedPoints = computed(() => {
  if (activeMeridianTab.value === 'all') return allPoint3DList.value;
  const targetNorm = normalizeMeridianId(activeMeridianTab.value);
  return allPoint3DList.value.filter(p => normalizeMeridianId(p.meridianId) === targetNorm);
});

const currentSelectedPoint = computed(() => {
  return displayedPoints.value.find(p => p.id === selectedPointId.value)
    ?? displayedPoints.value[0]
    ?? allPoint3DList.value.find(p => p.id === selectedPointId.value)
    ?? allPoint3DList.value[0];
});

// Three.js Scene State
let renderer: WebGLRenderer | null = null;
let scene: Scene | null = null;
let camera: PerspectiveCamera | null = null;
let characterGroup: Group | null = null;
let animFrame = 0;
let lastTime = 0;

let targetRotY = 0;
let currentRotY = 0;
let targetRotX = 0;
let currentRotX = 0;
let isDragging = false;
let startPointerX = 0;
let startPointerY = 0;
let hasDragged = false;

const projectedPointsMap = new Map<string, { px: number; py: number; facing: boolean; pt: Point3D }>();
const particles: QiParticle[] = [];
const vfxList: BreakthroughVfx[] = [];

function initParticles(): void {
  particles.length = 0;
  for (let i = 0; i < 30; i += 1) {
    particles.push({
      pathIndex: i % 2,
      progress: Math.random(),
      speed: 0.12 + Math.random() * 0.08,
      size: 1.8 + Math.random() * 1.5,
      alpha: 0.6 + Math.random() * 0.4,
      color: i % 2 === 0 ? '#ffb703' : '#00e5ff',
    });
  }
}

function createProceduralMannequin(group: Group): void {
  const mat = new MeshStandardMaterial({ color: 0xede6dc, roughness: 0.35, metalness: 0.05 });
  const head = new Mesh(new SphereGeometry(0.10, 24, 24), mat);
  head.position.set(0, 1.58, 0);
  const torso = new Mesh(new CylinderGeometry(0.14, 0.11, 0.60, 24), mat);
  torso.position.set(0, 1.10, 0);
  const hips = new Mesh(new CylinderGeometry(0.11, 0.13, 0.22, 24), mat);
  hips.position.set(0, 0.74, 0);
  const leftLeg = new Mesh(new CylinderGeometry(0.05, 0.038, 0.72, 16), mat);
  leftLeg.position.set(-0.065, 0.36, 0);
  const rightLeg = new Mesh(new CylinderGeometry(0.05, 0.038, 0.72, 16), mat);
  rightLeg.position.set(0.065, 0.36, 0);
  group.add(head, torso, hips, leftLeg, rightLeg);
}

function initThreeJs(): void {
  const webglCanvas = webglCanvasRef.value;
  if (!webglCanvas) return;

  const width = webglCanvas.width || 540;
  const height = webglCanvas.height || 480;

  renderer = new WebGLRenderer({
    canvas: webglCanvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x13151a, 1);
  renderer.setSize(width, height, false);

  scene = new Scene();
  camera = new PerspectiveCamera(34, width / height, 0.1, 50);
  camera.position.set(0, 0.96, 2.75);
  camera.lookAt(0, 0.96, 0);

  const ambientLight = new AmbientLight(0xfff6ec, 1.5);
  scene.add(ambientLight);

  const dirLight = new DirectionalLight(0xffeedd, 1.8);
  dirLight.position.set(2, 4, 3);
  scene.add(dirLight);

  const backLight = new DirectionalLight(0x77ccee, 1.3);
  backLight.position.set(-2, 3, -3);
  scene.add(backLight);

  characterGroup = new Group();
  scene.add(characterGroup);

  function loadModel(targetUrl: string): void {
    if (!characterGroup) return;
    modelLoading.value = true;
    while (characterGroup.children.length > 0) {
      characterGroup.remove(characterGroup.children[0]!);
    }

    const loader = new GLTFLoader();
    const resolvedUrl = targetUrl || props.modelUrl || '/assets/default/model3d/npc_zhujue__ch00_m/anim_idle_walk_run.glb';

    loader.load(
      resolvedUrl,
      (gltf: GLTF) => {
        const model = gltf.scene;
        model.traverse((child: Object3D) => {
          if ((child as Mesh).isMesh) {
            const mesh = child as Mesh;
            if (mesh.material) {
              const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              mats.forEach((m) => {
                if (m instanceof MeshStandardMaterial) {
                  m.transparent = true;
                  m.opacity = 0.88;
                  m.depthWrite = true;
                  m.roughness = Math.max(0.32, m.roughness);
                  m.emissive = new Color(0x0c2233);
                  m.emissiveIntensity = 0.35;
                }
              });
            }
          }
        });
        const box = new Box3().setFromObject(model);
        const center = box.getCenter(new Vector3());
        const size = box.getSize(new Vector3());
        const targetHeight = 1.70;
        const scale = targetHeight / (size.y || 1);
        model.scale.setScalar(scale);
        model.position.x = -center.x * scale;
        model.position.y = -box.min.y * scale;
        model.position.z = -center.z * scale;
        characterGroup?.add(model);
        modelLoading.value = false;
      },
      undefined,
      () => {
        if (characterGroup) {
          createProceduralMannequin(characterGroup);
        }
        modelLoading.value = false;
      }
    );
  }

  loadModel(props.modelUrl || '/assets/default/model3d/npc_zhujue__ch00_m/anim_idle_walk_run.glb');

  watch(() => props.modelUrl, (next) => {
    if (next) loadModel(next);
  });
}

function setPreset(preset: 'front' | 'back' | 'side'): void {
  viewPreset.value = preset;
  autoSpin.value = false;
  targetRotX = 0;
  if (preset === 'front') targetRotY = 0;
  else if (preset === 'back') targetRotY = Math.PI;
  else if (preset === 'side') targetRotY = Math.PI * 0.5;
}

// Pointer event handlers on overlay canvas
function onPointerDown(e: MouseEvent): void {
  isDragging = true;
  hasDragged = false;
  startPointerX = e.clientX;
  startPointerY = e.clientY;
}

function onPointerMove(e: MouseEvent): void {
  const dx = e.clientX - startPointerX;
  const dy = e.clientY - startPointerY;
  if (isDragging) {
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDragged = true;
    targetRotY += (e.movementX || 0) * 0.012;
    targetRotX = Math.max(-0.35, Math.min(0.35, targetRotX + (e.movementY || 0) * 0.008));
    autoSpin.value = false;
    viewPreset.value = null;
  } else {
    // Hover check
    const canvas = overlayCanvasRef.value;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
      const my = (e.clientY - rect.top) * (canvas.height / rect.height);
      let found: string | null = null;
      for (const [id, item] of projectedPointsMap.entries()) {
        if (item.facing) {
          const dist = Math.hypot(item.px - mx, item.py - my);
          if (dist <= 14) {
            found = id;
            break;
          }
        }
      }
      hoveredPointId.value = found;
    }
  }
}

function onPointerUp(e: MouseEvent): void {
  if (!hasDragged) {
    const canvas = overlayCanvasRef.value;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
      const my = (e.clientY - rect.top) * (canvas.height / rect.height);
      let closestId: string | null = null;
      let minDist = 18;
      for (const [id, item] of projectedPointsMap.entries()) {
        if (item.facing) {
          const dist = Math.hypot(item.px - mx, item.py - my);
          if (dist < minDist) {
            minDist = dist;
            closestId = id;
          }
        }
      }
      if (closestId) {
        selectedPointId.value = closestId;
      }
    }
  }
  isDragging = false;
}

function onPointerLeave(): void {
  isDragging = false;
  hoveredPointId.value = null;
}

function onTouchStart(e: TouchEvent): void {
  if (e.touches.length === 1) {
    const touch = e.touches[0]!;
    isDragging = true;
    hasDragged = false;
    startPointerX = touch.clientX;
    startPointerY = touch.clientY;
  }
}

function onTouchMove(e: TouchEvent): void {
  if (isDragging && e.touches.length === 1) {
    const touch = e.touches[0]!;
    const dx = touch.clientX - startPointerX;
    const dy = touch.clientY - startPointerY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDragged = true;
    targetRotY += dx * 0.008;
    targetRotX = Math.max(-0.35, Math.min(0.35, targetRotX + dy * 0.006));
    startPointerX = touch.clientX;
    startPointerY = touch.clientY;
    autoSpin.value = false;
    viewPreset.value = null;
  }
}

function onTouchEnd(): void {
  isDragging = false;
}

function renderOverlay(timeMs: number, dt: number): void {
  const canvas = overlayCanvasRef.value;
  if (!canvas || !camera || !characterGroup) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  projectedPointsMap.clear();

  // Project all displayed points to 2D
  for (const pt of displayedPoints.value) {
    const worldPos = pt.pos.clone().applyEuler(characterGroup.rotation);
    const screenPos = worldPos.clone().project(camera);
    const px = (screenPos.x * 0.5 + 0.5) * w;
    const py = (-screenPos.y * 0.5 + 0.5) * h;

    const worldNormal = pt.normal.clone().applyEuler(characterGroup.rotation);
    const camDir = camera.position.clone().sub(worldPos).normalize();
    const facingDot = worldNormal.dot(camDir);
    const facing = facingDot > -0.05;

    projectedPointsMap.set(pt.id, { px, py, facing, pt });
  }

  // Draw 3D connection channels between points of the same meridian
  drawChannels(ctx);

  // Draw acupoints (User feedback: "穴道显示太大了，可以亮一些小一些")
  for (const [, item] of projectedPointsMap.entries()) {
    const { px, py, facing, pt } = item;
    const isSelected = selectedPointId.value === pt.id;
    const isHovered = hoveredPointId.value === pt.id;
    const isYin = isYinMeridian(pt.meridianId);

    ctx.save();
    // Non-facing (back of body) points are softly faded to convey 3D depth
    ctx.globalAlpha = facing ? 1.0 : 0.22;

    const qiColor = isYin ? '#00e5ff' : '#ffaa00';
    const glowColor = isYin ? 'rgba(0, 229, 255, 0.95)' : 'rgba(255, 170, 0, 0.95)';
    const coreColor = isYin ? '#e0ffff' : '#fff7cc';

    if (pt.opened) {
      if (facing) {
        // Rotating Qi-vortex: delicate, small, radiant
        ctx.save();
        ctx.translate(px, py);
        const dir = isYin ? -1 : 1;
        const angle = (timeMs * 0.0035 * dir + (pt.pos.y * 10)) % (Math.PI * 2);
        ctx.rotate(angle);

        // 3 swirling curved arms (radius ~3.2px, delicate and sharp)
        for (let arm = 0; arm < 3; arm++) {
          const armAngle = (arm * Math.PI * 2) / 3;
          ctx.beginPath();
          const rStart = 1.0;
          const rEnd = 3.6;
          for (let step = 0; step <= 6; step++) {
            const t = step / 6;
            const r = rStart + (rEnd - rStart) * t;
            const a = armAngle + t * 1.4;
            const sx = Math.cos(a) * r;
            const sy = Math.sin(a) * r;
            if (step === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.strokeStyle = qiColor;
          ctx.lineWidth = isSelected || isHovered ? 1.3 : 0.9;
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = 8;
          ctx.stroke();
        }
        ctx.restore();
      }

      // Central radiant pearl: small & luminous (radius 1.7px / 1.2px)
      ctx.beginPath();
      ctx.arc(px, py, facing ? 1.7 : 1.2, 0, Math.PI * 2);
      ctx.fillStyle = coreColor;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = facing ? 10 : 3;
      ctx.fill();

      // Pulsing aura ring (radius ~3.8px)
      if (facing) {
        const pulse = Math.sin(timeMs * 0.006 + pt.pos.y * 12) * 0.7;
        ctx.beginPath();
        ctx.arc(px, py, 3.8 + pulse, 0, Math.PI * 2);
        ctx.strokeStyle = qiColor;
        ctx.lineWidth = 0.8;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 6;
        ctx.stroke();
      }
    } else {
      // Locked/unopened acupoint: small crisp dot (radius 1.4px / 1.0px)
      ctx.beginPath();
      ctx.arc(px, py, facing ? 1.4 : 1.0, 0, Math.PI * 2);
      ctx.fillStyle = facing ? '#e2e8f0' : '#64748b';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 0.6;
      ctx.shadowColor = facing ? 'rgba(0, 229, 255, 0.7)' : 'transparent';
      ctx.shadowBlur = facing ? 4 : 0;
      ctx.fill();
      ctx.stroke();
    }

    // Selected cursor halo
    if (isSelected && facing) {
      ctx.beginPath();
      ctx.arc(px, py, 6.2, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1.3;
      ctx.setLineDash([2, 2]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Calligraphy text label
    const shouldDrawLabel = facing && (isSelected || isHovered || activeMeridianTab.value !== 'all');
    if (shouldDrawLabel) {
      ctx.font = 'bold 12px "方正侠客体", "方正字迹-侠客体简", "FZXiaKeTi-S-GB", "Xingkai SC", cursive, serif';
      ctx.fillStyle = pt.opened ? (isYin ? '#00e5ff' : '#ffaa00') : '#e2e8f0';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 4;
      const textOffset = px < w * 0.5 ? -7 : 7;
      ctx.textAlign = px < w * 0.5 ? 'right' : 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(pt.name, px + textOffset, py);
    }
    ctx.restore();
  }

  // Draw breakthrough explosion VFX
  updateAndDrawVfx(ctx, dt);
}

function drawChannels(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  const byMeridian = new Map<string, Array<{ px: number; py: number; facing: boolean; pt: Point3D }>>();
  for (const [, item] of projectedPointsMap.entries()) {
    if (!byMeridian.has(item.pt.meridianId)) {
      byMeridian.set(item.pt.meridianId, []);
    }
    byMeridian.get(item.pt.meridianId)!.push(item);
  }

  for (const [merId, pts] of byMeridian.entries()) {
    if (pts.length < 2) continue;
    const isYin = isYinMeridian(merId);
    const strokeColor = isYin ? 'rgba(0, 229, 255, 0.45)' : 'rgba(255, 170, 0, 0.45)';

    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 2]);

    for (let i = 0; i < pts.length; i++) {
      const p = pts[i]!;
      if (i === 0) ctx.moveTo(p.px, p.py);
      else ctx.lineTo(p.px, p.py);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function updateAndDrawVfx(ctx: CanvasRenderingContext2D, dt: number): void {
  for (let i = vfxList.length - 1; i >= 0; i -= 1) {
    const v = vfxList[i]!;
    v.elapsed += dt;
    const progress = Math.min(1, v.elapsed / v.duration);

    ctx.save();
    // Expanding shockwave ring
    const ringRadius = progress * 38;
    ctx.beginPath();
    ctx.arc(v.x, v.y, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 215, 60, ${1 - progress})`;
    ctx.lineWidth = 2.0 * (1 - progress);
    ctx.stroke();

    // Swirling spark particles
    for (const p of v.particles) {
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.alpha = Math.max(0, 1 - progress);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 225, 80, ${p.alpha})`;
      ctx.fill();
    }
    ctx.restore();

    if (progress >= 1) {
      vfxList.splice(i, 1);
    }
  }
}

let fallbackTimer: number | undefined;

function renderStep(timeMs: number): void {
  const dt = lastTime ? Math.min(0.1, (timeMs - lastTime) / 1000) : 0.016;
  lastTime = timeMs;

  if (autoSpin.value) {
    targetRotY += dt * 0.4;
  }

  // Smooth rotational damping
  const diffY = targetRotY - currentRotY;
  const diffX = targetRotX - currentRotX;
  if (Math.abs(diffY) > 0.001 || Math.abs(diffX) > 0.001) {
    currentRotY += diffY * 0.25;
    currentRotX += diffX * 0.25;
  } else {
    currentRotY = targetRotY;
    currentRotX = targetRotX;
  }

  if (characterGroup) {
    characterGroup.rotation.y = currentRotY;
    characterGroup.rotation.x = currentRotX;
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }

  renderOverlay(timeMs, dt);
}

function renderLoop(timeMs: number): void {
  animFrame = requestAnimationFrame(renderLoop);
  renderStep(timeMs);
}

function triggerBreakthrough(): void {
  const target = currentSelectedPoint.value;
  if (!target || target.opened) return;

  const proj = projectedPointsMap.get(target.id);
  const targetPx = proj ? proj.px : 270;
  const targetPy = proj ? proj.py : 240;

  // Spawn visual breakthrough explosion at target position
  const sparks = [];
  for (let i = 0; i < 20; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.0 + Math.random() * 2.8;
    sparks.push({
      x: targetPx,
      y: targetPy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      size: 1.2 + Math.random() * 2.0,
    });
  }

  vfxList.push({
    x: targetPx,
    y: targetPy,
    elapsed: 0,
    duration: 0.7,
    particles: sparks,
  });

  // Mark opened in local state
  locallyOpened.value.add(target.id);
  target.opened = true;

  cultivationNotice.value = `【冲穴成功】已贯通 ${target.name}！真气通量提升，气血内力充沛！`;
  emit('cultivate', target.id);
  window.setTimeout(() => { cultivationNotice.value = ''; }, 3500);
}

function isMeridianLocked(meridianId: string): boolean {
  const norm = normalizeMeridianId(meridianId);
  const pts = allPoint3DList.value.filter(p => normalizeMeridianId(p.meridianId) === norm);
  return pts.length > 0 && pts.every(p => !p.opened);
}

function selectMeridianTab(tabId: string): void {
  activeMeridianTab.value = tabId;
  const targetNorm = tabId === 'all' ? null : normalizeMeridianId(tabId);
  const first = allPoint3DList.value.find(p => !targetNorm || normalizeMeridianId(p.meridianId) === targetNorm);
  if (first) {
    selectedPointId.value = first.id;
  }
  // Auto face the meridian
  if (tabId === 'meridian_du') setPreset('back');
  else if (tabId === 'meridian_ren' || tabId === 'meridian_chong') setPreset('front');
  else if (tabId === 'meridian_dai' || tabId.includes('wei') || tabId.includes('qiao')) setPreset('side');
}

onMounted(() => {
  initParticles();
  initThreeJs();
  animFrame = requestAnimationFrame(renderLoop);
  fallbackTimer = window.setInterval(() => {
    renderStep(window.performance.now());
  }, 33);
  (window as unknown as { __meridianDebug?: unknown }).__meridianDebug = {
    get targetRotY() { return targetRotY; },
    get currentRotY() { return currentRotY; },
    get animFrame() { return animFrame; },
    setTargetRotY(v: number) { targetRotY = v; },
    setPreset,
    renderStep,
  };
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animFrame);
  if (fallbackTimer) {
    window.clearInterval(fallbackTimer);
  }
  if (renderer) {
    renderer.dispose();
  }
});
</script>

<template>
  <div class="meridian-canvas-container">
    <!-- Top Meridian Category Switcher Tabs (奇经八脉全席) -->
    <div class="meridian-category-tabs">
      <button
        type="button"
        class="tab-btn"
        :class="{ active: activeMeridianTab === 'all' }"
        @click="selectMeridianTab('all')"
      >
        周天全览
      </button>
      <button
        type="button"
        class="tab-btn"
        :class="{ active: activeMeridianTab === 'meridian_ren', locked: isMeridianLocked('meridian_ren') }"
        @click="selectMeridianTab('meridian_ren')"
      >
        任脉 · 阴
      </button>
      <button
        type="button"
        class="tab-btn"
        :class="{ active: activeMeridianTab === 'meridian_du', locked: isMeridianLocked('meridian_du') }"
        @click="selectMeridianTab('meridian_du')"
      >
        督脉 · 阳
      </button>
      <button
        type="button"
        class="tab-btn"
        :class="{ active: activeMeridianTab === 'meridian_chong', locked: isMeridianLocked('meridian_chong') }"
        @click="selectMeridianTab('meridian_chong')"
      >
        冲脉
      </button>
      <button
        type="button"
        class="tab-btn"
        :class="{ active: activeMeridianTab === 'meridian_dai', locked: isMeridianLocked('meridian_dai') }"
        @click="selectMeridianTab('meridian_dai')"
      >
        带脉
      </button>
      <button
        type="button"
        class="tab-btn"
        :class="{ active: activeMeridianTab === 'meridian_yinwei', locked: isMeridianLocked('meridian_yinwei') }"
        @click="selectMeridianTab('meridian_yinwei')"
      >
        阴维脉
      </button>
      <button
        type="button"
        class="tab-btn"
        :class="{ active: activeMeridianTab === 'meridian_yangwei', locked: isMeridianLocked('meridian_yangwei') }"
        @click="selectMeridianTab('meridian_yangwei')"
      >
        阳维脉
      </button>
      <button
        type="button"
        class="tab-btn"
        :class="{ active: activeMeridianTab === 'meridian_yinqiao', locked: isMeridianLocked('meridian_yinqiao') }"
        @click="selectMeridianTab('meridian_yinqiao')"
      >
        阴跷脉
      </button>
      <button
        type="button"
        class="tab-btn"
        :class="{ active: activeMeridianTab === 'meridian_yangqiao', locked: isMeridianLocked('meridian_yangqiao') }"
        @click="selectMeridianTab('meridian_yangqiao')"
      >
        阳跷脉
      </button>
    </div>

    <!-- Main 3D Canvas & Detail Split View -->
    <div class="meridian-workspace">
      <!-- 3D Rotatable Character & Meridian Simulation -->
      <div class="canvas-wrap">
        <canvas
          ref="webglCanvasRef"
          width="540"
          height="480"
          class="meridian-webgl-canvas"
        />
        <canvas
          ref="overlayCanvasRef"
          width="540"
          height="480"
          class="meridian-overlay-canvas"
          title="按住鼠标拖拽可 360° 旋转 3D 人体经脉模型，点击穴道运功冲穴"
          @mousedown="onPointerDown"
          @mousemove="onPointerMove"
          @mouseup="onPointerUp"
          @mouseleave="onPointerLeave"
          @touchstart.passive="onTouchStart"
          @touchmove.passive="onTouchMove"
          @touchend="onTouchEnd"
        />

        <!-- 3D Quick View Controls -->
        <div class="meridian-3d-controls">
          <button type="button" class="btn-ctrl" :class="{ active: viewPreset === 'front' }" @click="setPreset('front')">正面 · 任脉</button>
          <button type="button" class="btn-ctrl" :class="{ active: viewPreset === 'back' }" @click="setPreset('back')">背面 · 督脉</button>
          <button type="button" class="btn-ctrl" :class="{ active: viewPreset === 'side' }" @click="setPreset('side')">侧身 · 维带</button>
          <button type="button" class="btn-ctrl" :class="{ active: autoSpin }" @click="autoSpin = !autoSpin">
            {{ autoSpin ? '⏸ 暂停旋转' : '⟳ 慢速巡转' }}
          </button>
        </div>

        <div class="canvas-legend">
          <span><i class="dot du" /> 阳脉 (金辉)</span>
          <span><i class="dot ren" /> 阴脉 (青华)</span>
          <span><i class="dot opened" /> 气旋贯通</span>
          <span><i class="dot locked" /> 未通关</span>
        </div>
      </div>

      <!-- Selected Acupoint Detail Card -->
      <div v-if="currentSelectedPoint" class="acupoint-detail-card paper-panel">
        <header class="card-head">
          <span class="meridian-badge">{{ currentSelectedPoint.meridianName }}</span>
          <h2>{{ currentSelectedPoint.name }}</h2>
          <span
            class="status-pill"
            :class="{ opened: currentSelectedPoint.opened, locked: !currentSelectedPoint.opened }"
          >
            {{ currentSelectedPoint.opened ? '● 已贯通' : '○ 穴位封阻' }}
          </span>
        </header>

        <p class="acupoint-desc">{{ currentSelectedPoint.desc }}</p>

        <div class="stat-rows">
          <div class="stat-item">
            <span class="label">穴道品阶</span>
            <span class="val">{{ gradeLabel(currentSelectedPoint.grade) }}</span>
          </div>
          <div class="stat-item">
            <span class="label">真气通量</span>
            <span class="val">{{ currentSelectedPoint.flux }} 丝/候</span>
          </div>
          <div class="stat-item">
            <span class="label">护体内劲</span>
            <span class="val">+{{ currentSelectedPoint.strength * 4 }} 抵御</span>
          </div>
        </div>

        <div v-if="cultivationNotice" class="cultivation-alert">
          {{ cultivationNotice }}
        </div>

        <div class="card-actions">
          <button
            type="button"
            class="cultivate-btn"
            :disabled="currentSelectedPoint.opened"
            @click="triggerBreakthrough"
          >
            {{ currentSelectedPoint.opened ? '周天已通 · 功力温养中' : '运功冲穴 · 贯通经络' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.meridian-canvas-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
}

.meridian-category-tabs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  padding-bottom: 4px;
}

.tab-btn {
  background: transparent;
  border: none;
  padding: 4px 12px;
  font-family: '方正侠客体', '方正字迹-侠客体简', 'FZXiaKeTi-S-GB', 'Xingkai SC', 'STXingkai', 'STKaiti', cursive, serif;
  font-size: 16px;
  color: var(--ink-medium, #554433);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  color: var(--seal, #a33e2b);
}

.tab-btn.active {
  background: transparent;
  color: var(--seal, #a33e2b);
  font-weight: bold;
  text-decoration: underline;
  text-underline-offset: 4px;
  box-shadow: none;
}

.tab-btn.locked {
  color: rgba(145, 130, 115, 0.55);
}

.meridian-workspace {
  display: grid;
  grid-template-columns: 540px 1fr;
  gap: 20px;
  align-items: start;
}

@media (max-width: 900px) {
  .meridian-workspace {
    grid-template-columns: 1fr;
  }
}

.canvas-wrap {
  position: relative;
  width: 540px;
  height: 480px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 0 24px rgba(0, 0, 0, 0.5), 0 4px 16px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(148, 115, 69, 0.25);
  background: radial-gradient(circle at 50% 45%, #22262e 0%, #16181f 75%, #0f1014 100%);
}

.meridian-webgl-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.meridian-overlay-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: grab;
  z-index: 2;
}

.meridian-overlay-canvas:active {
  cursor: grabbing;
}

.meridian-3d-controls {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 6px;
  z-index: 3;
}

.btn-ctrl {
  background: rgba(20, 24, 30, 0.75);
  border: 1px solid rgba(180, 150, 110, 0.35);
  border-radius: 4px;
  color: #dfd8cc;
  font-size: 12px;
  padding: 3px 8px;
  cursor: pointer;
  backdrop-filter: blur(4px);
  transition: all 0.15s ease;
}

.btn-ctrl:hover {
  background: rgba(45, 55, 70, 0.85);
  border-color: rgba(230, 180, 80, 0.7);
  color: #fff;
}

.btn-ctrl.active {
  background: rgba(140, 45, 30, 0.85);
  border-color: #ffaa33;
  color: #fff;
  box-shadow: 0 0 6px rgba(255, 170, 50, 0.4);
}

.canvas-legend {
  position: absolute;
  bottom: 10px;
  left: 10px;
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: rgba(220, 210, 195, 0.85);
  background: rgba(15, 18, 22, 0.75);
  padding: 4px 10px;
  border-radius: 4px;
  pointer-events: none;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(148, 115, 69, 0.2);
  z-index: 3;
}

.canvas-legend span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.canvas-legend .dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.canvas-legend .dot.du {
  background: #ffaa00;
  box-shadow: 0 0 5px #ffaa00;
}

.canvas-legend .dot.ren {
  background: #00e5ff;
  box-shadow: 0 0 5px #00e5ff;
}

.canvas-legend .dot.opened {
  background: #fff;
  border: 1px solid #ffd700;
}

.canvas-legend .dot.locked {
  background: #64748b;
}

.acupoint-detail-card {
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 440px;
  background: #fbf7ee;
  border: 1px solid rgba(148, 115, 69, 0.3);
  box-shadow: 0 4px 16px rgba(48, 46, 41, 0.08);
  border-radius: 6px;
}

.card-head {
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgba(148, 115, 69, 0.2);
  padding-bottom: 8px;
}

.card-head h2 {
  font-size: 24px;
  font-family: '方正侠客体', 'FZXKT', 'Xingkai SC', 'STKaiti', cursive;
  margin: 0;
  color: var(--ink-dark, #241c14);
}

.meridian-badge {
  font-size: 13px;
  padding: 2px 8px;
  background: var(--ink-faint, #f0e6d6);
  color: var(--ink-medium, #554433);
  border-radius: 3px;
  font-family: '方正侠客体', 'FZXKT', 'Xingkai SC', 'STKaiti', cursive;
}

.status-pill {
  margin-left: auto;
  font-size: 13px;
  padding: 2px 8px;
  border-radius: 12px;
}

.status-pill.opened {
  background: rgba(34, 197, 94, 0.12);
  color: #15803d;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-pill.locked {
  background: rgba(145, 130, 115, 0.15);
  color: #7a6a5a;
  border: none;
}

.acupoint-desc {
  font-size: 14px;
  line-height: 1.7;
  color: var(--ink, #382c20);
  font-family: '方正侠客体', 'FZXKT', 'Xingkai SC', 'STKaiti', cursive;
  margin: 0;
}

.stat-rows {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 8px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.stat-item .label {
  font-size: 12px;
  color: var(--ink-light, #7c6d5e);
}

.stat-item .val {
  font-size: 15px;
  font-weight: 600;
  color: var(--seal, #a33e2b);
  font-family: '方正侠客体', 'FZXKT', 'Xingkai SC', 'STKaiti', cursive;
}

.cultivation-alert {
  padding: 8px 12px;
  background: rgba(230, 160, 40, 0.15);
  border: none;
  color: #8a5812;
  border-radius: 4px;
  font-size: 13px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.card-actions {
  margin-top: 6px;
  display: flex;
  justify-content: center;
}

.cultivate-btn {
  display: inline-block;
  padding: 8px 24px;
  background: transparent;
  color: #8a2a18;
  border: none;
  font-family: '方正侠客体', 'FZXKT', 'Xingkai SC', 'STKaiti', cursive;
  font-size: 22px;
  letter-spacing: 4px;
  cursor: pointer;
  box-shadow: none;
  transition: all 0.2s ease;
  text-shadow: 0 0 6px rgba(138, 42, 24, 0.2);
}

.cultivate-btn:hover:not(:disabled) {
  color: #b84732;
  text-shadow: 0 0 10px rgba(184, 71, 50, 0.4);
  transform: scale(1.04);
}

.cultivate-btn:disabled {
  color: rgba(90, 75, 65, 0.5);
  cursor: not-allowed;
  transform: none;
  text-shadow: none;
}
</style>
