import { lowerQualityTier, normalizeRenderScale, QUALITY_TIERS, type QualityTier } from './tiers';

const CAPACITY = 60;
const MIN_SAMPLES = 30;
const SAMPLE_MS = 500;
const STABLE_MS = 2_000;
const TIER_DROP_MS = 5_000;
const OVER = 1.05;
const SCALE_STEP = 0.05;

export interface AutoTunerOptions {
  readonly initialScale?: number;
  readonly workBudgetMs?: number;
}

/** Caller-owned flags; omit for an eligible continuous render frame. */
export interface FrameSamplingState {
  readonly visible?: boolean;
  readonly continuous?: boolean;
  readonly loading?: boolean;
  readonly compiling?: boolean;
  readonly uploading?: boolean;
  readonly video?: boolean;
  readonly devtools?: boolean;
  readonly waking?: boolean;
  readonly longTask?: boolean;
}

export type TunerDecision = 'hold' | 'scale-down' | 'cpu-shed' | 'tier-down' | 'vblank-cap';

/** Fixed-size, allocation-free runtime sampler. Automatic changes are session-monotonic. */
export class AutoTuner {
  private readonly intervals = new Float32Array(CAPACITY);
  private readonly work = new Float32Array(CAPACITY);
  private readonly longTasks = new Uint8Array(CAPACITY);
  private readonly scratch = new Float32Array(CAPACITY);
  private cursor = 0;
  private count = 0;
  private sampleClock = 0;
  private lastEvaluation = -Infinity;
  private stableSince = 0;
  private overBudgetSince = -1;
  private probeWindows = 0;
  private probeOverage = 0;
  private nonPixelBound = false;
  private tierDrop?: (to: QualityTier) => void;
  private tierDropSent = false;
  private scale: number;
  private fpsCeiling: 30 | 60 = 60;
  private decision: TunerDecision = 'hold';
  private currentTier: QualityTier;
  private frameBudgetMs: number;
  private locked = false;

  constructor(
    tier: QualityTier,
    budgetMs: number,
    private readonly options: AutoTunerOptions = {},
  ) {
    this.currentTier = tier;
    this.frameBudgetMs = budgetMs;
    this.scale = normalizeRenderScale(options.initialScale ?? QUALITY_TIERS[tier].renderScale.initial, tier);
  }

  get renderScale(): number { return this.scale; }
  get tier(): QualityTier { return this.currentTier; }
  get budgetMs(): number { return this.frameBudgetMs; }
  get detectedFpsCeiling(): 30 | 60 { return this.fpsCeiling; }
  get lastDecision(): TunerDecision { return this.decision; }

  onTierDropRequested(callback: (to: QualityTier) => void): void { this.tierDrop = callback; }
  setLocked(locked: boolean): void { this.locked = locked; }

  /** Explicit host action, also used after a drop; preserves allocated sample buffers. */
  setTier(tier: QualityTier, scale: number, timeMs = this.sampleClock): void {
    this.currentTier = tier;
    this.frameBudgetMs = 1_000 / QUALITY_TIERS[tier].targetFps;
    this.scale = normalizeRenderScale(scale, tier);
    this.tierDropSent = false;
    this.setStableSince(timeMs);
  }

  setStableSince(timeMs: number): void {
    this.stableSince = timeMs;
    this.count = 0;
    this.cursor = 0;
    this.lastEvaluation = -Infinity;
    this.overBudgetSince = -1;
    this.probeWindows = 0;
    this.nonPixelBound = false;
    this.decision = 'hold';
  }

  sample(frameIntervalMs: number, workMs = 0, timeMs?: number, state?: FrameSamplingState): void {
    if (!(frameIntervalMs > 0) || !Number.isFinite(frameIntervalMs) || !Number.isFinite(workMs)) return;
    this.sampleClock = timeMs ?? this.sampleClock + frameIntervalMs;
    if (!Number.isFinite(this.sampleClock)) return;
    if (state && (state.visible === false || state.continuous === false || state.loading ||
      state.compiling || state.uploading || state.video || state.devtools || state.waking)) {
      this.setStableSince(this.sampleClock); return;
    }
    const becameFull = this.count === CAPACITY - 1;
    this.intervals[this.cursor] = frameIntervalMs;
    this.work[this.cursor] = Math.max(0, workMs);
    this.longTasks[this.cursor] = state?.longTask ? 1 : 0;
    this.cursor = (this.cursor + 1) % CAPACITY;
    this.count = Math.min(CAPACITY, this.count + 1);
    if (becameFull && this.sampleClock - this.stableSince >= STABLE_MS) this.observeCeiling();
    if (this.count < MIN_SAMPLES || this.sampleClock - this.stableSince < STABLE_MS ||
      this.sampleClock - this.lastEvaluation < SAMPLE_MS) return;
    if (this.sampleClock - this.lastEvaluation > SAMPLE_MS * 3) this.overBudgetSince = -1;
    this.lastEvaluation = this.sampleClock;
    this.evaluate();
  }

  private observeCeiling(): void {
    let capped = 0; let busy = 0;
    for (let index = 0; index < this.count; index += 1) {
      if (Math.abs(this.intervals[index]! - 33.3) <= 2.5) capped += 1;
      if (this.work[index]! > 10 || this.longTasks[index]) busy += 1;
    }
    if (capped >= CAPACITY * 0.8 && busy < CAPACITY * 0.1 &&
      this.percentile(this.intervals, 0.95) <= 35.8) {
      this.fpsCeiling = 30; this.overBudgetSince = -1; this.decision = 'vblank-cap';
    }
  }

  private percentile(values: Float32Array, percentile = 0.9): number {
    for (let index = 0; index < this.count; index += 1) this.scratch[index] = values[index]!;
    for (let index = 1; index < this.count; index += 1) {
      const value = this.scratch[index]!; let before = index - 1;
      while (before >= 0 && this.scratch[before]! > value) {
        this.scratch[before + 1] = this.scratch[before]!; before -= 1;
      }
      this.scratch[before + 1] = value;
    }
    return this.scratch[Math.min(this.count - 1, Math.floor(this.count * percentile))]!;
  }

  private evaluate(): void {
    let capped = 0; let hasLongTask = false;
    for (let index = 0; index < this.count; index += 1) {
      if (Math.abs(this.intervals[index]! - 33.3) <= 2.5) capped += 1;
      if (this.longTasks[index]) hasLongTask = true;
    }
    const intervalP90 = this.percentile(this.intervals);
    const workP90 = this.percentile(this.work);
    const possibleCap = capped / this.count >= 0.8;
    const workBudget = this.fpsCeiling === 30 ? 10 : (this.options.workBudgetMs ?? 10);
    if (workP90 > workBudget * OVER || hasLongTask) {
      this.decision = 'cpu-shed'; this.overBudgetSince = -1;
      this.probeWindows = 0; this.nonPixelBound = true; return;
    }
    if (possibleCap && this.count < CAPACITY) { this.decision = 'hold'; return; }
    if (possibleCap && this.percentile(this.intervals, 0.95) <= 35.8) this.fpsCeiling = 30;
    const activeBudget = Math.max(this.budgetMs, this.fpsCeiling === 30 ? 33.4 : 0);
    const overage = intervalP90 - activeBudget;
    if (overage <= activeBudget * (OVER - 1)) {
      this.decision = possibleCap ? 'vblank-cap' : 'hold'; this.overBudgetSince = -1;
      if (this.probeWindows > 0) this.probeWindows -= 1;
      return;
    }
    if (this.locked) { this.decision = 'hold'; this.overBudgetSince = -1; return; }
    if (this.nonPixelBound) { this.decision = 'hold'; return; }
    if (this.probeWindows > 0) {
      this.probeWindows -= 1;
      if (this.probeWindows > 0) { this.decision = 'hold'; return; }
      if ((this.probeOverage - overage) / Math.max(this.probeOverage, 0.001) < 0.2) {
        this.nonPixelBound = true; this.overBudgetSince = -1; this.decision = 'hold'; return;
      }
    }
    const minimum = QUALITY_TIERS[this.tier].renderScale.min;
    if (this.scale <= minimum) {
      if (this.overBudgetSince < 0) this.overBudgetSince = this.sampleClock;
      if (!this.tierDropSent && this.sampleClock - this.overBudgetSince >= TIER_DROP_MS) {
        const next = lowerQualityTier(this.tier);
        this.tierDropSent = true;
        this.decision = next === this.tier ? 'hold' : 'tier-down';
        if (next !== this.tier) this.tierDrop?.(next);
      } else this.decision = 'hold';
      return;
    }
    this.scale = normalizeRenderScale(this.scale - SCALE_STEP, this.tier);
    this.probeOverage = overage; this.probeWindows = 2; this.decision = 'scale-down';
  }
}
