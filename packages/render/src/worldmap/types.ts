import type { Dir8, EquipmentVisuals } from '../rig/types';

/** Navigation-grid drawing coordinates. They are not combat hexes or metres. */
export type MapPoint = readonly [number, number];
export interface MapNodeView {
  readonly id: string; readonly name: string; readonly kind: 'town' | 'ruin';
  readonly point: MapPoint; readonly open?: boolean;
}
export interface MapRoadView {
  readonly key: string; readonly start: string; readonly end: string;
  readonly points: readonly MapPoint[];
}
export interface MapGeometryView {
  readonly grid: { readonly width: number; readonly height: number };
  readonly nodes: readonly MapNodeView[]; readonly roads: readonly MapRoadView[];
  readonly terrain: { readonly land: readonly (readonly MapPoint[])[];
    readonly rivers: readonly (readonly MapPoint[])[]; readonly mountains: readonly (readonly MapPoint[])[] };
}
export interface MapActorView {
  readonly point: MapPoint; readonly walking: boolean; readonly equipment: EquipmentVisuals;
  readonly direction?: Dir8;
}
export interface WorldMapStats {
  drawCalls: number; triangles: number; frameMs: number; cpuMs: number;
  nodes: number; roads: number; instances: number;
}
export interface WorldMapSceneOptions {
  readonly actor: MapActorView; readonly zoom?: number; readonly mapTextureUrl?: string;
}
export interface WorldMapScene {
  readonly stats: WorldMapStats;
  render(timeMs: number): void;
  resize(width: number, height: number, pixelRatio?: number): void;
  setActor(actor: MapActorView): Promise<void>;
  setDestination(nodeId: string | null): void;
  setZoom(zoom: number): void;
  pickNode(clientX: number, clientY: number, bounds: DOMRect): MapNodeView | null;
  dispose(): void;
}
