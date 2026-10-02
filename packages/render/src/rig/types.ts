import type { Texture } from 'three';

export const RIG_VIEWS = ['front34', 'back34', 'side'] as const;
export type RigView = (typeof RIG_VIEWS)[number];
export const RIG_NEAR_SIDE = 'L' as const;
export type RigSide = 'L' | 'R';

export const RIG_SOURCE_PARTS = [
  'head',
  'hair_or_headgear',
  'torso',
  'pelvis_skirt',
  'upper_arm_L',
  'upper_arm_R',
  'forearm_L',
  'forearm_R',
  'hand_L',
  'hand_R',
  'thigh_shared',
  'shin_shared',
  'foot_shared',
] as const;
export type RigSourcePart = (typeof RIG_SOURCE_PARTS)[number];

export const RIG_PARTS = [
  'head',
  'hair_or_headgear',
  'torso',
  'pelvis_skirt',
  'upper_arm_L',
  'upper_arm_R',
  'forearm_L',
  'forearm_R',
  'hand_L',
  'hand_R',
  'thigh_L',
  'thigh_R',
  'shin_L',
  'shin_R',
  'foot_L',
  'foot_R',
] as const;
export type RigPart = (typeof RIG_PARTS)[number];

export const RIG_ATTACHMENT_SLOTS = ['weapon_R', 'weapon_L', 'pauldron_near', 'utility'] as const;
export type RigAttachmentSlot = (typeof RIG_ATTACHMENT_SLOTS)[number];
export type Dir8 = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type WeightClass = 'light' | 'medium' | 'heavy';
export type MotionMode = 'idle' | 'walk' | 'run';
export type TintSlot =
  | false
  | 'clothPrimary'
  | 'clothSecondary'
  | 'footwear'
  | 'hair';

export interface RigManifestPart {
  readonly id: RigSourcePart;
  readonly file: string;
  readonly view: RigView;
  readonly pivot: readonly [number, number];
  readonly childJoint: Readonly<Record<string, readonly [number, number]>>;
  readonly size: readonly [number, number];
  readonly restAngle?: number;
  readonly zOrder: number;
  readonly tintable: TintSlot;
  readonly placeholder?: boolean;
  readonly jointSource?: string;
  readonly sourceOrigin?: readonly [number, number];
}

export interface RigManifest {
  readonly schema: 'tianshu-rig.v1';
  readonly set: string;
  readonly ppm: number;
  readonly heightM: number;
  readonly nearSide: typeof RIG_NEAR_SIDE;
  readonly views: readonly RigView[];
  readonly palette: Readonly<Record<string, string>>;
  readonly parts: readonly RigManifestPart[];
  readonly placeholder?: boolean;
  readonly notes?: string;
  readonly baseUrl?: string;
}

export interface AtlasCell {
  readonly key: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly u0: number;
  readonly v0: number;
  readonly du: number;
  readonly dv: number;
}

export interface RigSet {
  readonly manifest: RigManifest;
  readonly texture: Texture;
  readonly cells: ReadonlyMap<string, AtlasCell>;
  readonly runtimePpm: number;
  readonly atlasWidth: number;
  readonly atlasHeight: number;
  readonly placeholderCount: number;
  dispose(): void;
}

export interface EquipmentAsset {
  readonly id: string;
  readonly tint?: string | number;
  readonly hands?: 1 | 2 | 'pair';
  readonly heavy?: boolean;
  readonly visibleHolster?: boolean;
}

export type EquipmentRef = string | EquipmentAsset;

// Read-only projection boundary until core publishes its Equipment view.
export interface EquipmentVisuals {
  readonly mainHand?: EquipmentRef;
  readonly offHand?: EquipmentRef;
  readonly head?: EquipmentRef;
  readonly body?: EquipmentRef;
  readonly innerBody?: EquipmentRef;
  readonly hands?: EquipmentRef;
  readonly shoulder?: EquipmentRef;
  readonly cape?: EquipmentRef;
  readonly waist?: EquipmentRef;
  readonly feet?: EquipmentRef;
  readonly accessory?: EquipmentRef;
}
