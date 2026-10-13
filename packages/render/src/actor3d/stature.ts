export const ACTOR_HEIGHT_MIN_M = 1.2;
export const ACTOR_HEIGHT_MAX_M = 2.3;

/** Uses the catalogued HeadTop_End stature; runtime bounds never define actor height. */
export function actorScale(heightM: number, statureMu: number): number {
  if (!Number.isFinite(heightM) || heightM < ACTOR_HEIGHT_MIN_M || heightM > ACTOR_HEIGHT_MAX_M)
    throw new RangeError('ACTOR_HEIGHT_RANGE');
  if (!Number.isFinite(statureMu) || statureMu <= 0)
    throw new RangeError('ACTOR_STATURE_INVALID');
  return heightM / statureMu;
}
