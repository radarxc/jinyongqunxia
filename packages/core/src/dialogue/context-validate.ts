interface FacilityDialogueContext {
  readonly kind: 'facility'; readonly sceneId: string; readonly facilityKey: string;
  readonly roleKey: string; readonly shopKey: string | null;
}

export function assertFacilityDialogueContext(value: unknown): asserts value is FacilityDialogueContext {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    throw new TypeError('STATE_SHAPE');
  const row = value as Record<string, unknown>;
  const expected = ['kind', 'sceneId', 'facilityKey', 'roleKey', 'shopKey'];
  if (Object.keys(row).length !== expected.length || expected.some((key) => !(key in row)) ||
      row['kind'] !== 'facility') throw new TypeError('STATE_SHAPE');
  for (const key of ['sceneId', 'facilityKey', 'roleKey'])
    if (typeof row[key] !== 'string' || row[key].length === 0) throw new TypeError('STATE_SHAPE');
  if (row['shopKey'] !== null &&
      (typeof row['shopKey'] !== 'string' || row['shopKey'].length === 0))
    throw new TypeError('STATE_SHAPE');
}
