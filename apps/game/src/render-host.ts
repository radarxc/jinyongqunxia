/* global document, location, navigator, localStorage, screen, devicePixelRatio, performance */
import type { FrameSamplingState, MemoryClass, QualityTier, RenderQualitySource, TunerDecision } from '@tianshu/render';

const CACHE_KEY = 'tianshu.render.quality.v1';
const MANUAL_KEY = 'tianshu.render.quality.manual.v1';
const LOSSES_KEY = 'tianshu.render.context-losses.v1';
const CACHE_MS = 30 * 24 * 60 * 60 * 1_000;
const LOSS_WINDOW_MS = 7 * 24 * 60 * 60 * 1_000;
const MEMORY_BUDGET = { S: 128, M: 256, L: 512 } as const;

interface CachedTier { readonly fingerprint: string; readonly tier: QualityTier; readonly detectedAt: number }
interface LossRecord { readonly timestamps: readonly number[] }
interface Probe {
  readonly gpu: string; readonly deviceMemory: number | undefined; readonly mobile: boolean; readonly ipad: boolean;
  readonly inAppBrowser: boolean; readonly halfFloatColorBuffer: boolean; readonly maxTextureSize: number;
  readonly fingerprint: string;
}

export interface RenderQualityController extends RenderQualitySource {
  readonly requestedTier: QualityTier | 'auto';
  readonly detectedTier: QualityTier;
  readonly memoryClass: MemoryClass;
  readonly locked: boolean;
  readonly contextLosses7d: number;
  readonly targetFps: number;
  readonly detectedFpsCeiling: 30 | 60;
  readonly benchmarkPending: boolean;
  readonly tierReasons: readonly string[];
  readonly lastDecision: TunerDecision;
  setTier(tier: QualityTier | 'auto'): void;
  clearCachedDetection(): void;
}

/** The game owner supplies storage/core operations; render never accesses either. */
export interface RenderRecoveryHandlers {
  onContextLoss?(): void | Promise<void>;
  reloadLatestAutosave(): Promise<boolean>;
}
let recoveryHandlers: RenderRecoveryHandlers | undefined;
export function setRenderRecoveryHandlers(handlers: RenderRecoveryHandlers): () => void {
  recoveryHandlers = handlers;
  return () => { if (recoveryHandlers === handlers) recoveryHandlers = undefined; };
}
export async function reloadLatestRenderAutosave(): Promise<boolean> {
  try { return await recoveryHandlers?.reloadLatestAutosave() ?? false; }
  catch { return false; }
}

function readJson<T>(key: string): T | undefined {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : undefined; }
  catch { return undefined; }
}
function writeJson(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage may be denied */ }
}
function removeStored(key: string): void {
  try { localStorage.removeItem(key); } catch { /* storage may be denied */ }
}

function versionPart(userAgent: string, pattern: RegExp): string {
  return userAgent.match(pattern)?.[1] ?? 'unknown';
}

function probeDevice(): Probe {
  const userAgent = navigator.userAgent;
  const ipad = /iPad/i.test(userAgent) || (/Macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1);
  const mobile = ipad || /Android|iPhone|iPod|Mobile/i.test(userAgent);
  const inAppBrowser = /MicroMessenger|FBAN|FBAV|Instagram|TikTok|BytedanceWebview|; wv\)/i.test(userAgent);
  const canvas = document.createElement('canvas');
  let gl: WebGL2RenderingContext | null = null;
  let gpu = 'WebGL2 unavailable'; let maxTextureSize = 0; let halfFloatColorBuffer = false;
  try {
    gl = canvas.getContext('webgl2', { powerPreference: 'high-performance' });
    if (gl) {
      const debug = gl.getExtension('WEBGL_debug_renderer_info');
      gpu = String(debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
      maxTextureSize = Number(gl.getParameter(gl.MAX_TEXTURE_SIZE));
      halfFloatColorBuffer = Boolean(gl.getExtension('EXT_color_buffer_float')
        || gl.getExtension('EXT_color_buffer_half_float'));
    }
  } catch { /* A denied or failed probe must still reach the DOM recovery path. */ }
  finally {
    try { gl?.getExtension('WEBGL_lose_context')?.loseContext(); } catch { /* Probe already lost. */ }
  }
  const deviceMemory = (navigator as Navigator & { readonly deviceMemory?: number }).deviceMemory;
  const browser = versionPart(userAgent, /(?:Chrome|CriOS|Firefox|FxiOS|Version)\/(\d+)/);
  const os = versionPart(userAgent, /(?:Android |OS |Mac OS X |Windows NT )(\d+)/);
  const fingerprint = [gpu, browser, os, screen.width, screen.height, devicePixelRatio,
    maxTextureSize, halfFloatColorBuffer ? 1 : 0, deviceMemory, mobile, ipad, inAppBrowser].join('|');
  return { gpu, deviceMemory, mobile, ipad, inAppBrowser, halfFloatColorBuffer, maxTextureSize, fingerprint };
}

function recentLosses(now: number): number[] {
  const record = readJson<LossRecord>(LOSSES_KEY);
  if (!Array.isArray(record?.timestamps)) return [];
  return record.timestamps.filter(value => Number.isFinite(value) && value >= now - LOSS_WINDOW_MS && value <= now);
}

let singleton: Promise<RenderQualityController> | undefined;

/** Creates the sole per-page quality controller; render itself never reads storage. */
export function createRenderQuality(): Promise<RenderQualityController> {
  singleton ??= (async () => {
    const render = await import('@tianshu/render'); const probe = probeDevice(); const now = Date.now();
    const memoryClass = render.classifyMemory({ mobile: probe.mobile, ipad: probe.ipad,
      ...(probe.deviceMemory === undefined ? {} : { deviceMemory: probe.deviceMemory }) });
    const capability = { memClass: memoryClass, halfFloatColorBuffer: probe.halfFloatColorBuffer,
      maxTextureSize: probe.maxTextureSize };
    let losses = recentLosses(now); let unstable = losses.length >= 3;
    const query = new URLSearchParams(location.search).get('tier');
    const queryTier = query === 'auto' || render.isQualityTier(query) ? query : undefined;
    const storedManual = readJson<unknown>(MANUAL_KEY);
    let requestedTier: QualityTier | 'auto' = queryTier ?? (render.isQualityTier(storedManual) ? storedManual : 'auto');
    const cached = readJson<CachedTier>(CACHE_KEY);
    const validCache = !unstable && cached?.fingerprint === probe.fingerprint && render.isQualityTier(cached.tier)
      && typeof cached.detectedAt === 'number' && Number.isFinite(cached.detectedAt)
      && now - cached.detectedAt >= 0 && now - cached.detectedAt <= CACHE_MS;
    const selected = render.selectStaticTier({ gpu: probe.gpu, ...capability,
      mobile: probe.mobile, inAppBrowser: probe.inAppBrowser });
    const fallback = probe.mobile ? 'mid' : 'high';
    const fallbackTier = render.capTierForDevice(fallback, capability);
    const staticTier = selected === 'benchmark'
      ? probe.inAppBrowser ? render.lowerQualityTier(fallbackTier) : fallbackTier : selected;
    const hardCap = render.capTierForDevice(render.classifyGpu(probe.gpu) === 'low' ? 'low' : 'ultra', capability);
    const detectedTier = render.minQualityTier(validCache ? cached.tier : staticTier, hardCap);
    const startupSafetyCap = unstable ? render.lowerQualityTier(detectedTier) : 'ultra';
    if (unstable) removeStored(CACHE_KEY);
    else if (!validCache) writeJson(CACHE_KEY, { fingerprint: probe.fingerprint, tier: detectedTier, detectedAt: now });
    const resolveTier = (): QualityTier => render.minQualityTier(startupSafetyCap,
      render.minQualityTier(requestedTier === 'auto' ? detectedTier : requestedTier, hardCap));
    const tierReasons = Object.freeze(['gpu:' + probe.gpu + ':' + selected, 'memory:' + memoryClass,
      'cap:' + hardCap, ...(probe.inAppBrowser ? ['in-app:one-tier-down'] : []),
      ...(unstable ? ['context-loss:one-tier-down,budget-25%'] : [])]);
    let tier = resolveTier();
    const tuner = new render.AutoTuner(tier, 1_000 / render.QUALITY_TIERS[tier].targetFps);
    tuner.setStableSince(performance.now());
    tuner.setLocked(requestedTier !== 'auto');
    tuner.onTierDropRequested(next => {
      if (requestedTier !== 'auto') return;
      tier = render.minQualityTier(tier, next);
      tuner.setTier(tier, tuner.renderScale);
    });
    const controller: RenderQualityController = {
      get requestedTier() { return requestedTier; },
      get detectedTier() { return detectedTier; },
      get memoryClass() { return memoryClass; },
      get locked() { return requestedTier !== 'auto'; },
      get contextLosses7d() { return losses.length; },
      get targetFps() { return Math.min(render.QUALITY_TIERS[tier].targetFps, tuner.detectedFpsCeiling); },
      get detectedFpsCeiling() { return tuner.detectedFpsCeiling; },
      get benchmarkPending() { return selected === 'benchmark'; },
      get tierReasons() { return tierReasons; },
      get lastDecision() { return tuner.lastDecision; },
      get tier() { return tier; },
      get renderScale() { return tuner.renderScale; },
      get gpuMemoryBudgetMB() {
        const base = Math.min(render.QUALITY_TIERS[tier].gpuMemoryMB, MEMORY_BUDGET[memoryClass]);
        return Math.floor(base * (unstable ? 0.75 : 1));
      },
      effectivePixelRatio: (dpr) => render.effectivePixelRatio(dpr, tier, tuner.renderScale),
      sample(interval: number, work?: number, time?: number, state?: FrameSamplingState) {
        tuner.sample(interval, work, time, state);
      },
      markSizeChanged(time = performance.now()) { tuner.setStableSince(time); },
      invalidateSamples(time = performance.now()) { tuner.setStableSince(time); },
      reportContextLoss() {
        const timestamp = Date.now(); losses = [...recentLosses(timestamp), timestamp];
        writeJson(LOSSES_KEY, { timestamps: losses });
        if (losses.length >= 3) { unstable = true; removeStored(CACHE_KEY); }
        try { void Promise.resolve(recoveryHandlers?.onContextLoss?.()).catch(() => undefined); }
        catch { /* Persistence failure must not interrupt context recovery. */ }
      },
      setTier(next) {
        if (next !== 'auto' && !render.isQualityTier(next)) return;
        requestedTier = next;
        if (next === 'auto') removeStored(MANUAL_KEY); else writeJson(MANUAL_KEY, next);
        tier = resolveTier(); tuner.setLocked(next !== 'auto');
        tuner.setTier(tier, render.QUALITY_TIERS[tier].renderScale.initial, performance.now());
      },
      clearCachedDetection() { removeStored(CACHE_KEY); },
    };
    render.setDefaultRenderQuality(controller);
    return controller;
  })();
  return singleton;
}
