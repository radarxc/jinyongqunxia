import type { Texture } from 'three';
import type { BattleMarker } from '../battle/types';

export type VfxNature = 'yin' | 'yang' | 'harmony' | 'neutral';
export type VfxTier = 'tian' | 'di' | 'xuan' | 'huang' | 'ungraded';
export type VfxTemplateMode = 'qi_projection' | 'afterimage' | 'plain_strike';
export type VfxAccent = 'hit' | 'repel' | 'foreign-qi' | 'acupoint';

export interface VfxBinding {
  readonly move: string; readonly skill: string; readonly tier: VfxTier;
  readonly grade: number | null; readonly ultimate: boolean; readonly projection: boolean;
  readonly delivery: string; readonly nature: VfxNature; readonly mode: 'bespoke' | 'template';
  readonly suite?: string; readonly template?: VfxTemplateMode; readonly emitter: string | null;
  readonly params: Readonly<Record<string, number>>;
}
export interface VfxFrame {
  readonly file: string; readonly anchor_px: readonly [number, number]; readonly phase: number;
}
export interface VfxEffect {
  readonly size_px: readonly [number, number]; readonly direction: readonly [number, number];
  readonly reference_length_px: number; readonly root_width_px: number;
  readonly blend: 'normal' | 'lighter' | 'screen' | 'multiply'; readonly frames: readonly VfxFrame[];
  readonly source?: { readonly mode: 'grid'; readonly files: readonly string[];
    readonly rects: readonly { readonly file_index: number; readonly rect_px: readonly [number, number, number, number] }[];
    readonly keying?: { readonly method: 'white_key' | 'white_luma'; readonly white_cutoff_8bit: number;
      readonly opaque_luma: number; readonly key_full_8bit: number; readonly epsilon: number; readonly dewhite: boolean } };
}
export interface VfxEmitter {
  readonly file: string; readonly size_px: readonly [number, number];
  readonly emit_point_px: readonly [number, number]; readonly direction: readonly [number, number];
  readonly emission_width_px: number;
}
export interface VfxComposition {
  readonly kind: 'Composition' | 'TemplateComposition'; readonly version: number;
  readonly asset_id?: string; readonly subject_ref?: string; readonly move_ref?: string;
  readonly mode?: string; readonly effect_set?: string; readonly emitter_plate?: string;
  readonly canvas_px: readonly [number, number]; readonly background: string;
  readonly emit_at_px: readonly [number, number]; readonly angle_deg: number;
  readonly range_hex: number; readonly pixels_per_hex: number; readonly length_px?: number;
  readonly scale: readonly [number, number]; readonly emitter_scale: number;
  readonly rhythm: { readonly charge_s: number; readonly release_s: number;
    readonly sustain_s: number; readonly dissipate_s: number };
  readonly transition: { readonly interpolation: 'crossfade' | 'hold'; readonly scale_from: number;
    readonly drift_fraction: number; readonly brightness: readonly [number, number, number, number, number];
    readonly directional_mask?: { readonly enabled: boolean; readonly softness?: number } };
  readonly output: { readonly fps: number; readonly loop: boolean; readonly loop_gap_s: number;
    readonly peak_phase?: number; readonly preview_size_px?: readonly [number, number] };
  readonly template?: { readonly mode: VfxTemplateMode; readonly nature: VfxNature;
    readonly delivery: string; readonly shape?: string | null; readonly color: string;
    readonly params: Readonly<Record<string, number>> };
  readonly effect?: VfxEffect | null; readonly emitter?: VfxEmitter | null;
}
export interface VfxTimelineSample {
  readonly time: number; readonly duration: number; readonly phase: number;
  readonly frameIndex: number; readonly nextFrameIndex: number; readonly mix: number;
  readonly alpha: number; readonly scale: number; readonly driftPx: number; readonly brightness: number;
  readonly stage: string; readonly mask: { readonly enabled: boolean; readonly softness: number;
    readonly reveal: number; readonly erase: number };
  readonly ghosts?: readonly { readonly alpha: number; readonly offsetPx: number; readonly stretch: number }[];
}
export interface ResolvedMoveVfx {
  readonly binding: VfxBinding | null; readonly mode: 'bespoke' | VfxTemplateMode;
  readonly compositionUrl?: string; readonly color: string; readonly durationMs: number;
  readonly fallback: boolean; readonly reason?: 'binding-missing' | 'composition-missing' | 'load-failed';
}
export interface VfxPoint { readonly x: number; readonly y: number; readonly visible?: boolean }
export type VfxProjector = (q: number, r: number, height: number, out: { x: number; y: number; visible: boolean }) => void;
export interface VfxPlayRequest {
  readonly moveId: string; readonly from: BattleMarker; readonly targets: readonly BattleMarker[];
  readonly nature?: VfxNature; readonly accents: readonly VfxAccent[]; readonly reducedMotion?: boolean;
  readonly accentTargets?: Readonly<Partial<Record<VfxAccent, BattleMarker>>>;
  readonly actorSnapshot?: () => { readonly image: HTMLCanvasElement; readonly sizePx: readonly [number, number];
    readonly centerOffsetPx: readonly [number, number] } | undefined;
}
export interface VfxPlayResult { readonly durationMs: number; readonly fallback: boolean }
export interface VfxStageStats { active: number; pooled: number; textures: number; fallbacks: number }
export interface BattleVfxStageOptions {
  readonly assetStore?: { load(moveId: string, nature?: VfxNature): Promise<{
    readonly resolved: ResolvedMoveVfx; readonly composition: VfxComposition;
    readonly effectBaseUrl?: string; readonly emitterBaseUrl?: string;
  }> };
  readonly textureStore?: { readonly size: number; load(url: string): Promise<Texture>; dispose(): void };
  readonly now?: () => number;
}
export interface BattleVfxStage {
  readonly stats: VfxStageStats; play(request: VfxPlayRequest): Promise<VfxPlayResult>;
  setProjector(projector: VfxProjector): void;
  resize(width?: number, height?: number, pixelRatio?: number): void; render(timeMs: number): void; dispose(): void;
}
