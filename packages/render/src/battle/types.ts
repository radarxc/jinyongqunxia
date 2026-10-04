import type { EquipmentVisuals, RigManifestInput, RigSnapshot } from '../rig';
import type { ContextFailure, ContextState } from '../core/context-guard';
import type { RenderQualitySource } from '../quality/tiers';
import type { createBattleModelStage } from './model-stage';

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
  /** Resolved by the app/build projection. Omitted/null keeps the retained 2D rig. */
  readonly model?: BattleModelVisual | null;
  readonly active: boolean;
}
export interface BattleModelVisual {
  readonly key: string;
  readonly kind: 'dedicated' | 'generic' | 'fallback';
  readonly gender: 'male' | 'female';
  readonly modelUrl: string;
  /** Separate motion source for dedicated static rigs; same as modelUrl for combined GLBs. */
  readonly animationUrl?: string;
  readonly heightM: number;
}
export interface BattleModelCatalog {
  readonly schema: 'battle-models.v1';
  readonly generic: Readonly<Partial<Record<'male' | 'female', BattleModelVisual>>>;
  readonly protagonist: Readonly<Partial<Record<'male' | 'female', BattleModelVisual>>>;
  /** An explicit null prevents a non-human NPC from falling through to a humanoid model. */
  readonly npcs: Readonly<Record<string, BattleModelVisual | null>>;
  readonly templates: Readonly<Record<string, BattleModelVisual>>;
}
export interface BattleHighlights {
  readonly selected: string | null;
  readonly ready: string | null;
  readonly reachable: readonly string[];
  readonly area: readonly string[];
  readonly path: readonly string[];
  readonly ghost: string | null;
}
export interface BattleRenderStats {
  drawCalls: number;
  characters: number;
  instances: number;
  cpuMs: number;
  frameMs: number;
  placeholders: number;
  modelCharacters: number;
  modelDrawCalls: number;
  modelFailures: number;
  modelMoving: number;
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
  readonly contextState: ContextState;
  updateUnits(units: readonly BattleMarker[]): void;
  setHighlights(highlights: BattleHighlights): void;
  render(timeMs: number, reducedMotion?: boolean): void;
  resize(width: number, height: number, pixelRatio?: number): void;
  project(q: number, r: number, height: number, out: ScreenPoint): void;
  projectUnit(id: string, q: number, r: number, height: number, out: ScreenPoint): void;
  snapshot(id: string): BattleSnapshot | undefined;
  setTimeOfDay(hours: number): void;
  pick(x: number, y: number): BattleCell | null;
  dispose(): void;
}
export interface BattleRendererOptions {
  readonly rig?: RigManifestInput;
  readonly reducedMotion?: boolean;
  readonly quality?: RenderQualitySource;
  readonly onContextStateChange?: (state: ContextState) => void;
  readonly onContextLoss?: (sessionLossCount: number) => void;
  readonly onContextRecreate?: () => Promise<boolean>;
  readonly onContextFatal?: (kind: ContextFailure) => void;
  readonly requestFrame?: () => void;
  /** Test seam; production uses the dynamic model-stage import. */
  readonly loadModelStage?: () => Promise<{
    createBattleModelStage: typeof createBattleModelStage;
  }>;
}
