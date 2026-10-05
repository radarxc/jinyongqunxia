import { lowerQualityTier, minQualityTier, type MemoryClass, type QualityTier } from './tiers';

export type GpuRuleResult = QualityTier | 'benchmark';

export const GPU_RULES: ReadonlyArray<readonly [RegExp, GpuRuleResult]> = [
  [/SwiftShader|llvmpipe|Software/i, 'low'],
  [/Adreno \(TM\) (3\d\d|4\d\d|5\d\d|60\d|61\d)\b/, 'low'],
  [/Adreno \(TM\) (6[2-9]\d|7[0-2]\d)\b/, 'mid'],
  [/Adreno \(TM\) (7[3-9]\d|8\d\d)\b/, 'high'],
  [/Mali-T|Mali-G(5\d|7[12])\b/, 'low'],
  [/Mali-G(68|7[6-8])\b|Mali-G6[1-9]\d/, 'mid'],
  [/Mali-G7[1-9]\d|Mali-G1\b|Mali-G1-|Immortalis/, 'high'],
  [/PowerVR Rogue|PowerVR B-Series|BXM/i, 'low'],
  [/PowerVR (D-Series|DXT)|Imagination.*DXT/i, 'mid'],
  [/Maleoon/i, 'mid'],
  [/Xclipse 5\d\d/, 'mid'],
  [/Xclipse 9\d\d/, 'high'],
  [/Apple GPU/, 'benchmark'],
  [/NVIDIA|GeForce|RTX|Radeon|AMD|Intel.*(Arc|Iris Xe)|Apple M\d/i, 'high'],
  [/Intel.*UHD|Intel.*HD Graphics/i, 'mid'],
];

export function classifyGpu(renderer: string): GpuRuleResult {
  for (const [pattern, tier] of GPU_RULES) if (pattern.test(renderer)) return tier;
  return 'benchmark';
}

export function capTierForMemory(tier: QualityTier, memClass: MemoryClass): QualityTier {
  return minQualityTier(tier, memClass === 'S' ? 'mid' : memClass === 'M' ? 'high' : 'ultra');
}

export interface StaticTierInput {
  readonly gpu: string;
  readonly memClass: MemoryClass;
  readonly mobile?: boolean;
  readonly inAppBrowser?: boolean;
  readonly halfFloatColorBuffer?: boolean;
  readonly maxTextureSize?: number;
}

export interface MemorySignals {
  readonly registeredClass?: MemoryClass;
  readonly deviceMemory?: number;
  readonly verifiedRamGB?: number;
  readonly mobile: boolean;
  readonly ipad?: boolean;
}

export function classifyMemory(input: MemorySignals): MemoryClass {
  if (input.registeredClass) return input.registeredClass;
  if (input.verifiedRamGB !== undefined && input.verifiedRamGB >= 12) return 'L';
  if (input.deviceMemory !== undefined && input.deviceMemory <= 4) return 'S';
  if (input.deviceMemory === 8) return 'M';
  if (input.ipad) return 'M';
  return input.mobile ? 'S' : 'L';
}

export function capTierForDevice(tier: QualityTier, input: Omit<StaticTierInput, 'gpu'>): QualityTier {
  let capped = tier;
  if ((input.maxTextureSize ?? 4096) < 4096) capped = 'low';
  if (input.halfFloatColorBuffer === false) capped = minQualityTier(capped, 'mid');
  capped = capTierForMemory(capped, input.memClass);
  return capped;
}

export function selectStaticTier(input: StaticTierInput): GpuRuleResult {
  const matched = classifyGpu(input.gpu);
  if (matched === 'benchmark') return matched;
  const capped = capTierForDevice(matched, input);
  return input.inAppBrowser ? lowerQualityTier(capped) : capped;
}
