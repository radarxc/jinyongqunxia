import type { Camera, Raycaster, Scene, Vector3 } from 'three';
import type { DressupEquipSpec, DressupLayerSpec } from '../dressup/runtime';
import type { RenderQualitySource } from '../quality';

export type ActorRole = 'player' | 'npc' | 'named';
export type ActorGait = 0 | 1 | 2;

export interface ActorLook {
  readonly template: string;
  readonly heightM: number;
  readonly outfit: string;
  readonly seed: number;
  readonly role: ActorRole;
}

export interface ActorLodAsset {
  readonly url: string;
  readonly triangles: number;
  readonly textureSize: 512 | 1024;
}

/** One build-time catalog entry. LOD tuple order is LOD0, then LOD1. */
export interface ActorAssetSet {
  readonly kind: 'glb' | 'dressup';
  readonly lod: readonly [ActorLodAsset, ActorLodAsset];
  readonly clipsUrl: string | null;
  /** HeadTop_End height in model units. */
  readonly statureMu: number;
  /** Native distance travelled at rate 1, measured in character heights per second. */
  readonly nativeHps: { readonly walk: number; readonly run: number };
  readonly dressup?: {
    readonly bodyUrl: string;
    readonly frameUrl: string;
    readonly templateId: string;
  };
}

export interface ActorCatalog {
  resolve(look: ActorLook): ActorAssetSet;
}

export interface ActorEquipment {
  readonly specs: readonly DressupEquipSpec[];
  readonly bodyLayers?: readonly DressupLayerSpec[];
}

export interface ActorStats {
  readonly actors: number;
  readonly visible: number;
  readonly drawCalls: number;
  readonly triangles: number;
  readonly fullDetailActors: number;
  readonly failures: number;
}

export interface ActorPort {
  spawn(id: string, look: ActorLook): void;
  despawn(id: string): void;
  setPose(
    id: string, x: number, y: number, z: number, yawRad: number,
    motion: ActorGait, speedMps: number,
  ): void;
  setEquipment(id: string, equipment: ActorEquipment): void;
  update(dt: number, camera: Camera): void;
  pick(raycaster: Raycaster): string | null;
  restore(): void;
  dispose(): void;
  readonly stats: ActorStats;
}

export interface ActorPortOptions {
  readonly scene: Scene;
  readonly catalog: ActorCatalog;
  readonly quality: RenderQualitySource;
  readonly occluders?: { occludes(point: Vector3): boolean };
}
