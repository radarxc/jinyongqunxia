import type { EquipmentVisuals, RigManifestInput } from '../rig';

/** Coordinates are supplied by core; this package only projects them to world/screen. */
export interface BattleCell {
  readonly q: number; readonly r: number; readonly height: number;
  readonly terrain: string; readonly label: string; readonly color: number;
}
export interface BattleMarker {
  readonly id: string; readonly index: number; readonly q: number; readonly r: number;
  readonly height: number; readonly facing: 0 | 1 | 2 | 3 | 4 | 5;
  readonly equipment: EquipmentVisuals; readonly active: boolean;
}
export interface BattleHighlights {
  readonly selected: string | null; readonly ready: string | null;
  readonly reachable: readonly string[]; readonly area: readonly string[];
}
export interface BattleRenderStats {
  drawCalls: number; characters: number; instances: number;
  cpuMs: number; frameMs: number; placeholders: number;
}
export interface ScreenPoint { x: number; y: number; visible: boolean }
export interface BattleRenderer {
  readonly stats: BattleRenderStats;
  updateUnits(units: readonly BattleMarker[]): void;
  setHighlights(highlights: BattleHighlights): void;
  render(timeMs: number, reducedMotion?: boolean): void;
  resize(width: number, height: number, pixelRatio?: number): void;
  project(q: number, r: number, height: number, out: ScreenPoint): void;
  pick(x: number, y: number): BattleCell | null;
  dispose(): void;
}
export interface BattleRendererOptions { readonly rig?: RigManifestInput }
