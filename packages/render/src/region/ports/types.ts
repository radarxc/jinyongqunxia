import type { Camera, Raycaster } from 'three';
import type { DressupEquipSpec, DressupLayerSpec } from '../../dressup/types';
import type { BuildingLayer, BuildingLayerInput } from '../../buildgen/types';

export type { BuildingLayer, BuildingLayerInput } from '../../buildgen/types';

export interface BuildingLayerPort {
  create(input: BuildingLayerInput): Promise<BuildingLayer>;
}

export interface ActorLook {
  readonly template: string;
  readonly heightM: number;
  readonly outfit: string;
  readonly seed: number;
  readonly role: 'player' | 'npc' | 'named';
}

export interface ActorEquipment {
  readonly specs: readonly DressupEquipSpec[];
  readonly bodyLayers?: readonly DressupLayerSpec[];
}

export interface ActorStats {
  readonly actors: number;
  readonly drawCalls: number;
  readonly triangles: number;
  readonly templates: number;
  readonly failures: number;
}

export interface ActorPort {
  spawn(id: string, look: ActorLook): void;
  despawn(id: string): void;
  setPose(
    id: string,
    x: number,
    y: number,
    z: number,
    yawRad: number,
    motion: 0 | 1 | 2,
    speedMps: number,
  ): void;
  setEquipment(id: string, equipment: ActorEquipment): void;
  update(dt: number, camera: Camera): void;
  pick(raycaster: Raycaster): string | null;
  restore(): void;
  dispose(): void;
  readonly stats: ActorStats;
}
