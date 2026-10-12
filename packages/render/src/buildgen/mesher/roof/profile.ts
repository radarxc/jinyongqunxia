export const EAVE_SLOPE = 0.4;
export const FLY_RAFTER_LIFT_MM = 40;

export interface RoofProfile {
  /** Horizontal stations in mm, ordered ridge -> eave. */
  readonly runsMm: readonly number[];
  /** Heights above the eave bearer in mm, ordered ridge -> eave. */
  readonly heightsMm: readonly number[];
}

function positive(value: number, name: string): void {
  if (!(value > 0) || !Number.isFinite(value)) throw new RangeError(`BUILDGEN_ROOF_${name}`);
}

/**
 * Song `zhe` heights, ordered ridge -> purlin seams -> eave bearer. `steps` is the
 * number of equal horizontal rafter bays, so the returned array has steps + 1 entries.
 */
export function songZhe(halfRunMm: number, riseMm: number, steps: number): readonly number[] {
  positive(halfRunMm, 'INVALID_RUN');
  positive(riseMm, 'INVALID_RISE');
  if (!Number.isInteger(steps) || steps < 1) throw new RangeError('BUILDGEN_ROOF_INVALID_STEPS');

  const heights = [riseMm];
  let fromRun = 0;
  let fromHeight = riseMm;
  for (let seam = 1; seam < steps; seam += 1) {
    const run = (halfRunMm * seam) / steps;
    const lineHeight = (fromHeight * (halfRunMm - run)) / (halfRunMm - fromRun);
    const fold = riseMm / (10 * 2 ** (seam - 1));
    const height = lineHeight - fold;
    if (!(height > 0) || height >= fromHeight)
      throw new RangeError('BUILDGEN_ROOF_DEGENERATE_PROFILE');
    heights.push(height);
    fromRun = run;
    fromHeight = height;
  }
  heights.push(0);
  return heights;
}

/** Song profile with explicit (possibly unequal) ridge-to-eave purlin stations. */
export function songZheAt(runsRidgeToEaveMm: readonly number[], riseMm: number): RoofProfile {
  positive(riseMm, 'INVALID_RISE');
  if (runsRidgeToEaveMm.length < 2 || runsRidgeToEaveMm[0] !== 0)
    throw new RangeError('BUILDGEN_ROOF_INVALID_STATIONS');
  for (let index = 1; index < runsRidgeToEaveMm.length; index += 1)
    if (!(runsRidgeToEaveMm[index]! > runsRidgeToEaveMm[index - 1]!))
      throw new RangeError('BUILDGEN_ROOF_INVALID_STATIONS');
  const eaveRun = runsRidgeToEaveMm.at(-1)!;
  const heights = [riseMm];
  for (let seam = 1; seam < runsRidgeToEaveMm.length - 1; seam += 1) {
    const run = runsRidgeToEaveMm[seam]!;
    const fromRun = runsRidgeToEaveMm[seam - 1]!;
    const fromHeight = heights[seam - 1]!;
    const lineHeight = (fromHeight * (eaveRun - run)) / (eaveRun - fromRun);
    heights.push(lineHeight - riseMm / (10 * 2 ** (seam - 1)));
  }
  heights.push(0);
  if (heights.some((height, index) => index > 0 && height >= heights[index - 1]!))
    throw new RangeError('BUILDGEN_ROOF_DEGENERATE_PROFILE');
  return { runsMm: [...runsRidgeToEaveMm], heightsMm: heights };
}

/**
 * Qing rise-by-rafter ratios. Runs and ratios are ordered eave -> ridge; returned seam heights
 * use the common roof-profile order ridge -> eave.
 */
export function qingJujia(
  runsMm: readonly number[],
  ratios: readonly number[] = [0.5, 0.65, 0.75, 0.9],
): readonly number[] {
  if (runsMm.length === 0 || runsMm.length !== ratios.length)
    throw new RangeError('BUILDGEN_ROOF_JUJIA_LENGTH');
  const eaveToRidge = [0];
  for (let index = 0; index < runsMm.length; index += 1) {
    positive(runsMm[index]!, 'INVALID_RUN');
    positive(ratios[index]!, 'INVALID_RATIO');
    eaveToRidge.push(eaveToRidge[index]! + runsMm[index]! * ratios[index]!);
  }
  return eaveToRidge.reverse();
}

/** Piecewise-linear height at horizontal fraction t, where t runs eave -> ridge. */
export function profileHeightAt(heightsRidgeToEave: readonly number[], t: number): number {
  if (heightsRidgeToEave.length < 2 || !Number.isFinite(t))
    throw new RangeError('BUILDGEN_ROOF_INVALID_PROFILE');
  const clamped = Math.max(0, Math.min(1, t));
  const scaled = (1 - clamped) * (heightsRidgeToEave.length - 1);
  const low = Math.floor(scaled);
  const high = Math.min(heightsRidgeToEave.length - 1, low + 1);
  const mix = scaled - low;
  return heightsRidgeToEave[low]! * (1 - mix) + heightsRidgeToEave[high]! * mix;
}

/** Height lookup for explicit stations; t remains eave -> ridge. */
export function roofProfileHeightAt(profile: RoofProfile, t: number): number {
  if (!Number.isFinite(t)) throw new RangeError('BUILDGEN_ROOF_INVALID_PROFILE');
  const eaveRun = profile.runsMm.at(-1)!;
  const run = eaveRun * (1 - Math.max(0, Math.min(1, t)));
  let high = 1;
  while (high < profile.runsMm.length - 1 && profile.runsMm[high]! < run) high += 1;
  const low = high - 1;
  const mix = (run - profile.runsMm[low]!) / (profile.runsMm[high]! - profile.runsMm[low]!);
  return profile.heightsMm[low]! * (1 - mix) + profile.heightsMm[high]! * mix;
}

/** Drip-edge height below the eave bearer, including the 40 mm fly-rafter lift. */
export function dripHeightMm(eaveBearerHeightMm: number, projectionMm: number): number {
  positive(projectionMm, 'INVALID_EAVE');
  return eaveBearerHeightMm - projectionMm * EAVE_SLOPE + FLY_RAFTER_LIFT_MM;
}
