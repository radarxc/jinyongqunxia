import type { MeshWriter, Yaw4 } from '../../types';

export type PropLod = 0 | 1;

/** `assets/default/buildkit/props/manifest.yaml` layer order. */
export const PROP_LAYER = Object.freeze({
  woodFurniture: 0,
  woodRough: 1,
  ceramicGlaze: 2,
  iron: 3,
  clothBolt: 4,
  paperBooks: 5,
  strawBasket: 6,
  medicineDrawers: 7,
} as const);
export type PropLayer = (typeof PROP_LAYER)[keyof typeof PROP_LAYER];

export interface PropSink {
  readonly writer: MeshWriter;
  readonly placement?: PropPlacement;
}

export type PropRecipe = (
  wMm: number,
  dMm: number,
  hMm: number,
  variant: number,
  lod: PropLod,
  sink: PropSink,
) => void;

export interface PropDefinition {
  readonly idx: number;
  readonly name: string;
  readonly wMm: number;
  readonly dMm: number;
  readonly hMm: number;
  readonly blocks: 0 | 1;
  readonly triangleBudget: readonly [lod0: number, lod1: number];
  readonly recipe: PropRecipe;
}

export interface LampPointMm {
  readonly xMm: number;
  readonly yMm: number;
  readonly zMm: number;
}

export interface PropPlacement {
  readonly originMm: readonly [xMm: number, yMm: number, zMm: number];
  readonly yaw: Yaw4;
  readonly unit: number;
  readonly localGroundMm: number;
  readonly lamps: readonly LampPointMm[];
}

export interface InteriorDiagnostic {
  readonly code:
    | 'PROP_LOD_DOWNGRADED'
    | 'PROP_SKIPPED_BUDGET'
    | 'PROP_BLOCKING_PROXY'
    | 'INTERIOR_TRIANGLE_BUDGET_EXCEEDED';
  readonly fixtureIndex?: number;
  readonly message: string;
}

export interface InteriorSink {
  readonly interior: MeshWriter;
  readonly diagnostics: InteriorDiagnostic[];
}

export interface InteriorBuildStats {
  readonly triangles: number;
  readonly fixtures: number;
  readonly downgraded: number;
  readonly skipped: number;
  readonly proxied: number;
  readonly lamps: readonly LampPointMm[];
}
