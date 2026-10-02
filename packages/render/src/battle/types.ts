import type { EquipmentVisuals, RigManifestInput, RigSnapshot } from '../rig';

/** Coordinates are supplied by core; this package only projects them to world/screen. */
export interface BattleCell {
  readonly q: number;
  readonly r: number;
  readonly height: number;
  readonly terrain: string;
  readonly label: string;
  readonly color: number;
}
export interface BattleMarker {
  readonly id: string;
  readonly index: number;
  readonly q: number;
  readonly r: number;
  readonly height: number;
  readonly facing: 0 | 1 | 2 | 3 | 4 | 5;
  /** Presentation-only projection supplied by the game; VFX never derives gameplay affinity. */
  readonly qiNature?: 'yin' | 'yang' | 'harmony' | 'neutral';
  readonly equipment: EquipmentVisuals;
  readonly active: boolean;
}
export interface BattleHighlights {
  readonly selected: string | null;
  readonly ready: string | null;
  readonly reachable: readonly string[];
  readonly area: readonly string[];
}
export interface BattleRenderStats {
  drawCalls: number;
  characters: number;
  instances: number;
  cpuMs: number;
  frameMs: number;
  placeholders: number;
}
export interface ScreenPoint {
  x: number;
  y: number;
  visible: boolean;
}
export interface BattleCameraControl {
  readonly yawDeg: number;
  readonly rotating: boolean;
  rotate(step: -1 | 1, reducedMotion?: boolean): Promise<void>;
}
export type BattleSnapshot = RigSnapshot & {
  readonly sizePx: readonly [number, number];
  readonly centerOffsetPx: readonly [number, number];
};
export interface BattleRenderer {
  readonly stats: BattleRenderStats;
  readonly camera: BattleCameraControl;
  updateUnits(units: readonly BattleMarker[]): void;
  setHighlights(highlights: BattleHighlights): void;
  render(timeMs: number, reducedMotion?: boolean): void;
  resize(width: number, height: number, pixelRatio?: number): void;
  project(q: number, r: number, height: number, out: ScreenPoint): void;
  snapshot(id: string): BattleSnapshot | undefined;
  setTimeOfDay(hours: number): void;
  pick(x: number, y: number): BattleCell | null;
  dispose(): void;
}
export interface BattleRendererOptions {
  readonly rig?: RigManifestInput;
  readonly reducedMotion?: boolean;
}
