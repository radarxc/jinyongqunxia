import type { Object3D } from 'three';

export type CharacterPresetView = 'full' | 'face' | 'neck' | 'back' | 'legs';

export interface CharacterViewerStats {
  readonly fps: number;
  readonly frameTimeMs: number;
  readonly currentClip: string;
  readonly currentTime: number;
  readonly duration: number;
  readonly isPlaying: boolean;
  readonly triangles: number;
  readonly skinnedMeshes: number;
  readonly joints: number;
}

export interface CharacterModelMeta {
  readonly name: string;
  readonly triangles: number;
  readonly meshes: number;
  readonly skinnedMeshes: number;
  readonly joints: number;
  readonly clips: readonly string[];
  readonly heightM: number;
  readonly headRatio?: number;
  readonly legRatio?: number;
}

export interface AttachedPropOptions {
  slot: 'head' | 'hips' | 'rightHand' | 'leftHand' | 'chest' | 'spine' | 'root';
  offset?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}

export interface CharacterViewerController {
  loadModel(url: string, heightM?: number): Promise<CharacterModelMeta>;
  playClip(name: string, fadeDuration?: number): void;
  pauseAnimation(): void;
  resumeAnimation(): void;
  setTimeScale(scale: number): void;
  seekTime(seconds: number): void;
  setCameraPreset(preset: CharacterPresetView, smooth?: boolean): void;
  setWireframe(enabled: boolean): void;
  setSkeleton(enabled: boolean): void;
  setGrid(enabled: boolean): void;
  setAutoRotate(enabled: boolean, speed?: number): void;
  setExposure(exposure: number): void;
  setLightIntensity(factor: number): void;
  resize(width: number, height: number, dpr?: number): void;
  getStats(): CharacterViewerStats;
  captureScreenshot(mimeType?: string, quality?: number): string;
  attachProp(id: string, url: string, options: AttachedPropOptions): Promise<void>;
  detachProp(id: string): void;
  clearProps(): void;
  getAttachedProps(): readonly string[];
  attachExternal(root: Object3D): void;
  detachExternal(root: Object3D): void;
  setUnlitMode(on: boolean): void;
  dispose(): void;
  scene?: unknown;
  camera?: unknown;
}
