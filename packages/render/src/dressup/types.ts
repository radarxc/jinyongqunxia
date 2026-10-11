import type {
  ColorRepresentation, Group, Skeleton, Texture,
} from 'three';
import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export enum DressupError {
  InvalidHeight = 'DRESSUP_INVALID_HEIGHT',
  NoSkinnedBody = 'DRESSUP_NO_SKINNED_BODY',
  RegionAttributeMissing = 'DRESSUP_REGION_ATTRIBUTE_MISSING',
  RegionUnknown = 'DRESSUP_REGION_UNKNOWN',
  RegionLimit = 'DRESSUP_REGION_LIMIT',
  SocketUnknown = 'DRESSUP_SOCKET_UNKNOWN',
  SocketBoneUnknown = 'DRESSUP_SOCKET_BONE_UNKNOWN',
  BoneUnknown = 'DRESSUP_BONE_UNKNOWN',
  BoneLengthRange = 'DRESSUP_BONE_LENGTH_RANGE',
  BoneLengthLate = 'DRESSUP_BONE_LENGTH_LATE',
  PoseOffsetRange = 'DRESSUP_POSE_OFFSET_RANGE',
  ClipUnknown = 'DRESSUP_CLIP_UNKNOWN',
  Disposed = 'DRESSUP_DISPOSED',
}

export type DressupVec3 = readonly [number, number, number];
export type DressupQuat = readonly [number, number, number, number];
export type DressupMat4 = readonly number[];

export interface DressupSourceRef {
  readonly file: string;
  readonly sha256: string;
  readonly generator?: string;
}

export interface DressupSocketFrame {
  readonly bone: string;
  readonly pos: DressupVec3;
  readonly quat: DressupQuat;
  readonly normalLocal?: DressupVec3;
  readonly palmNormalLocal?: DressupVec3;
  readonly palmOffsetMu?: number;
  readonly radiusMu?: number;
}

export interface DressupNeckRingSample {
  readonly pos: DressupVec3;
  readonly normal: DressupVec3;
  readonly weights: Readonly<Record<string, number>>;
}

export interface DressupNeckRing {
  readonly localYMu: number;
  readonly centerMu: DressupVec3;
  readonly radiusMu: Readonly<{ x: number; z: number }>;
  readonly samples: number;
  readonly profile: readonly DressupNeckRingSample[];
  readonly lipOffsetMu: number;
  readonly sha256: string;
}

export interface DressupMeasures {
  readonly headWidthMu: number;
  readonly headDepthMu: number;
  readonly headCircumferenceMu: number;
  readonly headTopMu: DressupVec3;
  readonly shoulderSkinWidthMu: number;
  readonly chestWidthMu: number;
  readonly waistWidthMu: number;
  readonly hipWidthMu: number;
  readonly handLengthMu: Readonly<{ L: number; R: number }>;
  readonly handThicknessMu: Readonly<{ L: number; R: number }>;
  readonly footLengthMu: number;
}

export interface DressupRegions {
  readonly ids: Readonly<Record<string, number>>;
  readonly jointToRegion: Readonly<Record<string, string>>;
  readonly file: string;
  readonly triangleRule?: string;
  readonly triangles?: number;
  readonly crossTriangleRatio?: number;
}

export interface DressupSkeletonFrame {
  readonly schema: 'tianshu-dressup-skeleton.v1';
  readonly source: DressupSourceRef;
  readonly unit: 'mu';
  readonly heightMu: number;
  readonly defaultHeightM: number;
  readonly mPerMu: number;
  readonly joints: readonly string[];
  readonly parents: readonly number[];
  readonly bindWorld: Readonly<Record<string, DressupMat4>>;
  readonly restPose: Readonly<{ armAngleDeg: number; forearmAngleDeg: number }>;
  readonly measures: DressupMeasures;
  readonly neckRing: DressupNeckRing;
  readonly skullProfile: Readonly<{ file: string; stepMu: number; sha256: string }>;
  readonly sockets: Readonly<Record<string, DressupSocketFrame>>;
  readonly regions: DressupRegions;
  readonly fingerPose: Readonly<{
    fist: Readonly<Record<string, DressupQuat>>;
    tightenDeg?: Readonly<Record<string, number>>;
  }>;
}

/** 衣物声明的姿势偏移；validate、遮罩烘焙与 fit_garment 姿势蒙皮按同一角度采样。 */
export interface DressupPoseOffset {
  /** 左右 Arm 骨（连同子骨）绕模型 +Z（身体前向）在肩关节处向外转的角度，0..20 度。 */
  readonly armAbductionDeg?: number;
}

export interface DressupGripAdjust {
  readonly pos: DressupVec3;
  readonly quat: DressupQuat;
}

export interface DressupFit {
  readonly schema: 'tianshu-dressup-fit.v1';
  readonly kind: 'garment' | 'hair' | 'prop' | 'head';
  readonly id: string;
  readonly template?: string;
  readonly slot?: string;
  readonly socket?: string;
  readonly anchor?: string;
  readonly gripAdjust?: DressupGripAdjust;
  readonly hideRegions?: readonly string[];
  readonly neverHide?: readonly string[];
  readonly hideMask?: Readonly<{ file: string; size?: number; [key: string]: unknown }>;
  readonly fitVersion?: number;
  readonly class?: string;
  readonly source?: DressupSourceRef;
  readonly body?: DressupSourceRef;
  readonly weights?: Readonly<{
    method?: string; highConfidence?: number; maxBones?: number;
    jointsAllowed?: readonly string[];
  }>;
  readonly align?: Readonly<Record<string, unknown>>;
  readonly skinTint?: readonly [number, number, number];
  readonly poseOffset?: DressupPoseOffset;
  readonly [key: string]: unknown;
}

export interface DressupEquipSpec {
  readonly kind: 'garment' | 'hair' | 'prop' | 'head';
  readonly id: string;
  readonly url: string;
  readonly fit: DressupFit;
  readonly hideMapUrl?: string;
}

export interface DressupLayerSpec {
  readonly id: string;
  readonly url: string;
  readonly order?: number;
}

/** A compositor returns a newly owned texture; the actor cache controls its disposal. */
export interface DressupLayerCompositor {
  composite(base: Texture, layers: readonly DressupLayerSpec[]): Promise<Texture>;
}

export interface DressupHideMapSpec {
  readonly id: string;
  readonly url: string;
  readonly size?: number;
}
/** Independent of body baseColor size; returns a newly owned data texture. */
export interface DressupHideMapCompositor {
  composite(maps: readonly DressupHideMapSpec[]): Promise<Texture>;
}

export interface DressupStats {
  readonly drawCalls: number;
  readonly triangles: number;
  readonly boneTextureUploads: number;
  readonly bodyLayers: readonly string[];
  readonly layerTextureBytes: number;
  readonly hideMaps: readonly string[];
  /** Absent when no hide map is active. */
  readonly hideMapSize?: number;
  /** Present after a failed composition; cleared on retry or removal. */
  readonly hideMapError?: string;
  /** Present while an equipped garment declares a non-zero arm abduction (max over garments). */
  readonly armAbductionDeg?: number;
}

export interface DressupActor {
  readonly root: Group;
  readonly skeleton: Skeleton;
  readonly frame: DressupSkeletonFrame;
  setHead(url: string | null, options?: { readonly skinTint?: ColorRepresentation }): Promise<void>;
  setBodyLayers(layers: readonly DressupLayerSpec[]): Promise<void>;
  equip(spec: DressupEquipSpec): Promise<void>;
  unequip(id: string): void;
  setHideMask(regions: readonly string[]): void;
  setHideMapEnabled(on: boolean): void;
  setBoneLength(tweaks: Readonly<Record<string, number>>): void;
  playClip(name: string, fade?: number): void;
  update(dt: number): void;
  stats(): DressupStats;
  dispose(): void;
}

export interface DressupActorOptions {
  readonly bodyUrl: string;
  readonly frameUrl: string;
  readonly heightM: number;
  readonly loader?: GLTFLoader;
  readonly unlit?: boolean;
  readonly compositor?: DressupLayerCompositor;
  readonly hideMapCompositor?: DressupHideMapCompositor;
  readonly templateId?: string;
}
