export interface FacilityDialogueContext {
  readonly kind: 'facility'; readonly sceneId: string; readonly facilityKey: string;
  readonly roleKey: string; readonly shopKey: string | null;
  readonly interlocutorNameKey: string;
}

export function assertFacilityDialogueContext(value: unknown): asserts value is FacilityDialogueContext {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    throw new TypeError('STATE_SHAPE');
  const row = value as Record<string, unknown>;
  const required = ['kind', 'sceneId', 'facilityKey', 'roleKey', 'shopKey',
    'interlocutorNameKey'];
  const keys = Object.keys(row);
  if (keys.length !== required.length || required.some((key) => !(key in row)) ||
      row['kind'] !== 'facility') throw new TypeError('STATE_SHAPE');
  for (const key of ['sceneId', 'facilityKey', 'roleKey', 'interlocutorNameKey'])
    if (typeof row[key] !== 'string' || row[key].length === 0) throw new TypeError('STATE_SHAPE');
  if (row['shopKey'] !== null &&
      (typeof row['shopKey'] !== 'string' || row['shopKey'].length === 0))
    throw new TypeError('STATE_SHAPE');
}
