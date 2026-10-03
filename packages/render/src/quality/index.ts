export { AutoTuner, type AutoTunerOptions, type TunerDecision, type FrameSamplingState } from './auto-tuner';
export {
  GPU_RULES, capTierForDevice, capTierForMemory, classifyGpu, classifyMemory, selectStaticTier,
  type GpuRuleResult, type StaticTierInput, type MemorySignals,
} from './gpu-rules';
export {
  QUALITY_TIERS, QUALITY_TIER_ORDER, effectivePixelRatio, getDefaultRenderQuality,
  isQualityTier, lowerQualityTier, minQualityTier, normalizeRenderScale, setDefaultRenderQuality,
  type MemoryClass, type QualityTier, type QualityTierConfig, type RenderQualitySource,
} from './tiers';
