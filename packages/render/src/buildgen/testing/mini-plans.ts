import {
  ROOF_STYLE,
  type BuildingPlanView,
  type BuildKitView,
  type FacilityKind,
  type RoofStyleCode,
  type Yaw4,
} from '../types';

interface MiniInput {
  readonly id: string;
  readonly archetype: string;
  readonly centre: readonly [number, number];
  readonly size: readonly [number, number];
  readonly yaw: Yaw4;
  readonly roofStyle: RoofStyleCode;
  readonly storeys?: 1 | 2;
  readonly eave: number;
  readonly ridge: number;
  readonly platform: number;
  readonly facility: FacilityKind;
  readonly kit?: string;
}
function miniFloorInsets(input: MiniInput): readonly [number, number] {
  // tech/16 section 3 goldens: shop 4.4 x 3.1, house 5.2 x 3.2, temple 10.8 x 8.8 m.
  const golden: Readonly<Record<string, readonly [number, number]>> = {
    shop: [800, 950],
    house: [400, 900],
    temple_hall: [600, 600],
  };
  return golden[input.archetype] ?? [350, 300];
}
function mini(input: MiniInput): BuildingPlanView {
  const [cx, cz] = input.centre;
  const [width, depth] = input.size;
  const worldWidth = input.yaw % 2 === 0 ? width : depth;
  const worldDepth = input.yaw % 2 === 0 ? depth : width;
  const base = 0;
  const floorY = input.platform;
  // Shared mini plans carry the exact tech/16 section 3 interior goldens.
  const [widthInset, depthInset] = miniFloorInsets(input);
  const worldXInset = input.yaw % 2 === 0 ? widthInset : depthInset;
  const worldZInset = input.yaw % 2 === 0 ? depthInset : widthInset;
  return {
    id: input.id,
    archetype: input.archetype,
    kit: input.kit ?? 'song_dali',
    seed: 0x1000 + input.yaw,
    footprint: [cx, cz, width, depth],
    yaw: input.yaw,
    storeys: input.storeys ?? 1,
    roof: [input.roofStyle, input.eave, input.ridge],
    entrances: [[0, 0, input.archetype === 'market_stall' ? 1_200 : 1_400]],
    enterable: input.archetype !== 'market_stall',
    elev: [base, input.platform],
    floors: [
      [
        cx - worldWidth / 2 + worldXInset,
        cz - worldDepth / 2 + worldZInset,
        cx + worldWidth / 2 - worldXInset,
        cz + worldDepth / 2 - worldZInset,
      ],
    ],
    floorY: [floorY],
    fixtures: [],
    signage: null,
    facility: input.facility,
  };
}

/** Six complete, hand-authored millimetre plans shared by buildgen tasks r0-r9. */
export const MINI_BUILDING_PLANS: readonly BuildingPlanView[] = Object.freeze([
  mini({
    id: 'mini_shop_y0',
    archetype: 'shop',
    centre: [0, 0],
    size: [6_000, 5_000],
    yaw: 0,
    roofStyle: ROOF_STYLE.Xuanshan,
    eave: 3_070,
    ridge: 4_566,
    platform: 150,
    facility: 'general_store',
  }),
  mini({
    id: 'mini_house_y1',
    archetype: 'house',
    centre: [9_000, 0],
    size: [6_000, 5_000],
    yaw: 1,
    roofStyle: ROOF_STYLE.Yingshan,
    eave: 2_910,
    ridge: 4_419,
    platform: 300,
    facility: 'residence',
  }),
  mini({
    id: 'mini_inn_y2',
    archetype: 'inn',
    centre: [20_000, 0],
    size: [10_000, 8_000],
    yaw: 2,
    roofStyle: ROOF_STYLE.Xieshan,
    storeys: 2,
    eave: 6_130,
    ridge: 8_547,
    platform: 300,
    facility: 'inn',
  }),
  mini({
    id: 'mini_stall_y3',
    archetype: 'market_stall',
    centre: [29_000, 0],
    size: [3_000, 2_000],
    yaw: 3,
    roofStyle: ROOF_STYLE.Canopy,
    eave: 2_300,
    ridge: 2_550,
    platform: 0,
    facility: 'stall_goods',
  }),
  mini({
    id: 'mini_temple_y0',
    archetype: 'temple_hall',
    centre: [39_000, 0],
    size: [12_000, 10_000],
    yaw: 0,
    roofStyle: ROOF_STYLE.Xieshan,
    eave: 4_575,
    ridge: 8_483,
    platform: 900,
    facility: 'temple',
  }),
  mini({
    id: 'mini_xiyu_y1',
    archetype: 'xiyu_house',
    centre: [49_000, 0],
    size: [6_000, 5_000],
    yaw: 1,
    roofStyle: ROOF_STYLE.Flat,
    eave: 3_300,
    ridge: 3_750,
    platform: 150,
    facility: 'residence',
    kit: 'xiyu',
  }),
]);
export const MINI_BUILD_KIT = Object.freeze({
  schemaVersion: 'buildkit-runtime.v1',
  id: 'mini',
  style: 'timber',
  profile: 'song_zhe',
  dims: {
    vernacular: { platform: 300, column: 2_800, eave: 700, rise: 2_625, lift: [180, 120] },
    shop: { platform: 150, column: 3_000, eave: 800, rise: 2_625, lift: [180, 120] },
    middle: {
      platform: 300,
      column: 3_200,
      upperStorey: 2_700,
      eave: 900,
      rise: 2_700,
      lift: [300, 220],
    },
    hall: {
      platform: 900,
      column: 4_200,
      eave: 1_300,
      rise: 3_330,
      lift: [480, 360],
    },
  },
  door: { clearH: 2_150, single: 900, double: 1_400, threshold: 120, frame: 100 },
  window: { sill: 900, head: 2_050, width: 1_000, pattern: ['zhileng', 'fangge'] },
  walls: {
    gable: { layer: 'earth_plaster', t: 350 },
    back: { layer: 'earth_plaster', t: 300 },
    front: { layer: 'timber_raw', t: 120 },
    enclosure: { layer: 'plaster_lime', t: 300, h: 2_400, coping: 'tile' },
  },
  ridge: { h: 320, ends: 'dali_square', hallEnds: 'chiwei' },
  palette: { timber: ['#6e4b39', [300, 600]] },
  layers: Array.from({ length: 16 }, (_, index) => ({
    id: `mini_layer_${index}`,
    repeatMm: [1_000, 1_000] as const,
  })),
  archetypes: {
    shop: { recipe: 'hall' },
    house: { recipe: 'hall' },
    inn: { recipe: 'storeyed' },
    market_stall: { recipe: 'stall' },
    temple_hall: { recipe: 'hall' },
    xiyu_house: { recipe: 'adobe' },
  },
  landmarks: {
    bld_lm_pagoda: { recipe: 'pagoda_dense' },
  },
  variants: { doorColour: ['natural'], awning: 4_000, lanterns: 6_000 },
  cityWall: {
    h: 6_000,
    top: 4_000,
    batter: 1_600,
    merlon: [1_800, 1_200, 500],
    gate: { opening: 'trapezoid', w: 4_500, h: 5_200 },
  },
} satisfies BuildKitView);
