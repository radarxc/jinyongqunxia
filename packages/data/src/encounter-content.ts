import { EncounterDefSchema, type EncounterDef } from './schemas/encounter';

function deepFreeze<T>(value: T, seen = new Set<object>()): T {
  if (typeof value !== 'object' || value === null || seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) deepFreeze(child, seen);
  return Object.freeze(value);
}

/** Battle-time boundary: full encounter validation is deliberately absent from session startup. */
export function parseEncounterDefinition(value: unknown): EncounterDef {
  return deepFreeze(EncounterDefSchema.parse(value));
}
