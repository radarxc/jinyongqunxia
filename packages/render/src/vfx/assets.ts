import { VFX_COLORS, createBindingIndex, resolveMoveVfx } from './bindings';
import { durationOf } from './timeline';
import type { ResolvedMoveVfx, VfxBinding, VfxComposition, VfxNature } from './types';

interface CatalogPart<T> { readonly baseUrl: string; readonly effect?: T; readonly emitter?: T }
interface VfxCatalog {
  readonly schema: 'tianshu-vfx-catalog.v1'; readonly palette: Readonly<Record<VfxNature, string>>;
  readonly effects: Readonly<Record<string, CatalogPart<VfxComposition['effect']>>>;
  readonly emitters: Readonly<Record<string, CatalogPart<VfxComposition['emitter']>>>;
}
interface VfxBindingsPayload {
  readonly schema: 'tianshu-vfx-bindings.v1'; readonly bindings: readonly VfxBinding[];
}
interface VfxRuntimeDocument<T> {
  readonly schemaVersion: 'event.v1'; readonly actions: readonly { readonly payload?: T }[];
}
export interface VfxAssetPlan {
  readonly resolved: ResolvedMoveVfx; readonly composition: VfxComposition;
  readonly effectBaseUrl?: string; readonly emitterBaseUrl?: string;
}
export interface VfxAssetStoreOptions {
  readonly fetch?: typeof fetch; readonly bindingsUrl?: string; readonly catalogUrl?: string;
  readonly warn?: (message: string) => void;
}

function shapeFor(binding: VfxBinding): string | null {
  if (binding.template === 'afterimage') return null;
  if (binding.template === 'plain_strike') {
    if (binding.delivery === 'unknown') return ['sword', 'sabre', 'staff', 'spear', 'whip', 'fan'].includes(binding.emitter ?? '')
      ? 'arc' : binding.emitter === 'palm' ? 'wave' : 'impact';
    return binding.delivery === 'palm' ? 'wave' : binding.delivery === 'weapon' ? 'arc' : 'impact';
  }
  if (binding.delivery === 'sonic' || binding.emitter === 'instrument') return 'rings';
  if (binding.delivery === 'palm') return 'fan';
  return binding.delivery === 'finger' || (binding.delivery === 'weapon' && binding.emitter === 'sword') ? 'beam' : 'impact';
}
function safeBase(compositionUrl: string, relative: string | undefined): string | undefined {
  if (!relative || relative.includes('\\')) return undefined;
  const url = new URL(relative, `https://vfx.invalid${compositionUrl}`);
  if (url.origin !== 'https://vfx.invalid' || !url.pathname.startsWith('/assets/default/') || url.search || url.hash)
    throw new Error('VFX_ASSET_PATH_INVALID');
  return url.pathname.slice(0, url.pathname.lastIndexOf('/') + 1);
}
function runtimePayload<T extends { readonly schema: string }>(value: VfxRuntimeDocument<T>, schema: T['schema']): T {
  const payload = value.actions[0]?.payload;
  if (value.schemaVersion !== 'event.v1' || payload?.schema !== schema) throw new Error('VFX_RUNTIME_SCHEMA');
  return payload;
}
function templateComposition(binding: VfxBinding, nature: VfxNature, catalog: VfxCatalog): VfxAssetPlan {
  const mode = binding.template!; const shape = shapeFor(binding);
  const effectPart = shape ? catalog.effects[`${mode}/${shape}`] : undefined;
  const emitterPart = mode !== 'afterimage' && binding.emitter ? catalog.emitters[binding.emitter] : undefined;
  const duration = binding.params['duration_s'] ?? ({ qi_projection: 0.6, afterimage: 0.48, plain_strike: 0.32 } as const)[mode];
  const ratios = mode === 'qi_projection' ? [1 / 6, 7 / 30, 4 / 15, 1 / 3] : [0.18, 0.12, 0, 0.7];
  const effect = effectPart?.effect ?? null; const emitter = emitterPart?.emitter ?? null;
  const emitterScale = emitter ? Math.min(260 / emitter.size_px[0], 320 / emitter.size_px[1]) : 1;
  const thickness = emitter ? emitterScale * emitter.emission_width_px : 1;
  const transverse = effect ? (mode === 'plain_strike' ? 200 : 270) / effect.size_px[1]
    * effect.root_width_px / thickness : 1;
  const composition: VfxComposition = { kind: 'TemplateComposition', version: 1,
    template: { mode, nature, delivery: binding.delivery, shape, color: catalog.palette[nature] ?? VFX_COLORS[nature],
      params: binding.params }, canvas_px: [1024, 512], background: '#282623', emit_at_px: [300, 256],
    angle_deg: 0, emitter_scale: emitterScale, scale: [1, transverse],
    length_px: mode === 'plain_strike' ? 240 : 560, range_hex: 0, pixels_per_hex: 100,
    rhythm: { charge_s: duration * ratios[0]!, release_s: duration * ratios[1]!,
      sustain_s: duration * ratios[2]!, dissipate_s: duration * ratios[3]! },
    transition: { interpolation: 'crossfade', scale_from: 1, drift_fraction: 0,
      brightness: [1, 1, 1, 1, 1], directional_mask: { enabled: false, softness: 0.08 } },
    output: { fps: 20, loop: false, loop_gap_s: 0, peak_phase: mode === 'qi_projection' ? 0.4 : 0.18 },
    effect, emitter };
  return { resolved: { binding, mode, color: VFX_COLORS[nature], durationMs: duration * 1000, fallback: false },
    composition, ...(effectPart ? { effectBaseUrl: effectPart.baseUrl } : {}),
    ...(emitterPart ? { emitterBaseUrl: emitterPart.baseUrl } : {}) };
}

export class VfxAssetStore {
  private readonly fetcher: typeof fetch; private readonly jsonCache = new Map<string, Promise<unknown>>();
  private bindings: Promise<ReadonlyMap<string, VfxBinding>> | undefined;
  private catalog: Promise<VfxCatalog> | undefined;
  private readonly bindingsUrl: string; private readonly catalogUrl: string; private readonly warn: (message: string) => void;
  private readonly warned = new Set<string>();
  constructor(options: VfxAssetStoreOptions = {}) {
    this.fetcher = options.fetch ?? fetch; this.bindingsUrl = options.bindingsUrl ?? '/content/vfx/bindings.json';
    this.catalogUrl = options.catalogUrl ?? '/content/vfx/catalog.json'; this.warn = options.warn ?? console.warn;
  }
  private json<T>(url: string): Promise<T> {
    let pending = this.jsonCache.get(url) as Promise<T> | undefined;
    if (!pending) { pending = this.fetcher(url).then(response => {
      if (!response.ok) throw new Error(`VFX_ASSET_HTTP_${response.status}:${url}`); return response.json() as Promise<T>;
    }).catch((failure: unknown) => { this.jsonCache.delete(url); throw failure; }); this.jsonCache.set(url, pending); }
    return pending;
  }
  private bindingIndex() {
    return this.bindings ??= this.json<VfxRuntimeDocument<VfxBindingsPayload>>(this.bindingsUrl)
      .then(value => createBindingIndex(runtimePayload(value, 'tianshu-vfx-bindings.v1').bindings))
      .catch((failure: unknown) => { this.bindings = undefined; throw failure; });
  }
  private readCatalog() {
    return this.catalog ??= this.json<VfxRuntimeDocument<VfxCatalog>>(this.catalogUrl)
      .then(value => runtimePayload(value, 'tianshu-vfx-catalog.v1'))
      .catch((failure: unknown) => { this.catalog = undefined; throw failure; });
  }
  async load(moveId: string, actorNature?: VfxNature): Promise<VfxAssetPlan> {
    let index: ReadonlyMap<string, VfxBinding>;
    try { index = await this.bindingIndex(); } catch { return this.fallback(moveId, actorNature ?? 'neutral', null, 'load-failed'); }
    const binding = index.get(moveId);
    if (!binding) return this.fallback(moveId, actorNature ?? 'neutral', null, 'binding-missing');
    const nature = actorNature ?? binding.nature;
    if (binding.mode === 'template') {
      try { return templateComposition(binding, nature, await this.readCatalog()); }
      catch { return this.fallback(moveId, nature, binding, 'load-failed'); }
    }
    const primary = (await resolveMoveVfx(index, moveId, nature)).compositionUrl!;
    const candidates = [primary, `/assets/default/baseline/vfx/${moveId}/composition.json`,
      `/assets/default/baseline/vfx/${binding.skill}/composition.json`];
    for (const compositionUrl of candidates) try {
      const composition = await this.json<VfxComposition>(compositionUrl); const durationMs = durationOf(composition) * 1000;
      return { resolved: { binding, mode: 'bespoke', compositionUrl, color: VFX_COLORS[nature], durationMs,
        fallback: compositionUrl !== primary, ...(compositionUrl !== primary ? { reason: 'composition-missing' as const } : {}) },
        composition, ...(safeBase(compositionUrl, composition.effect_set) ? { effectBaseUrl: safeBase(compositionUrl, composition.effect_set)! } : {}),
        ...(safeBase(compositionUrl, composition.emitter_plate) ? { emitterBaseUrl: safeBase(compositionUrl, composition.emitter_plate)! } : {}) };
    } catch { /* try approved baseline, then template fallback */ }
    return this.fallback(moveId, nature, binding, 'load-failed');
  }
  private async fallback(moveId: string, nature: VfxNature, binding: VfxBinding | null,
    reason: 'binding-missing' | 'load-failed'): Promise<VfxAssetPlan> {
    this.warnOnce(`${moveId}:${reason}`, `[VFX] ${moveId} uses plain_strike fallback (${reason})`);
    const substitute: VfxBinding = binding ? { ...binding, mode: 'template', template: 'plain_strike', params: { duration_s: 0.32 } }
      : { move: moveId, skill: 'sk_unknown', tier: 'ungraded', grade: null, ultimate: false, projection: false,
        delivery: 'unknown', nature, mode: 'template', template: 'plain_strike', emitter: null, params: { duration_s: 0.32 } };
    const empty: VfxCatalog = { schema: 'tianshu-vfx-catalog.v1', palette: VFX_COLORS, effects: {}, emitters: {} };
    const plan = templateComposition(substitute, nature, await this.readCatalog().catch(() => empty));
    return { ...plan, resolved: { ...plan.resolved, binding, fallback: true, reason } };
  }
  private warnOnce(key: string, message: string): void {
    if (this.warned.has(key)) return;
    this.warned.add(key); this.warn(message);
  }
}
