import { buildEncounter, type EncounterBuildContext,
  type EncounterBuildResult } from '@tianshu/core/battle';
import { parseEncounterDefinition } from '@tianshu/data/tooling';
import type { EncounterDef } from '@tianshu/data/schemas';

export function parseBattleEncounter(value: unknown): EncounterDef {
  try {
    return parseEncounterDefinition(value);
  } catch (error) {
    if (error instanceof Error && error.message === 'BATTLE_ENCOUNTER_INVALID') throw error;
    throw new Error('BATTLE_ENCOUNTER_INVALID', { cause: error });
  }
}

/** Full authored encounter boundary; parser and builder are reached only after battle is requested. */
export function buildBattleEncounter(value: unknown, context: EncounterBuildContext):
EncounterBuildResult {
  try {
    return buildEncounter(parseBattleEncounter(value), context);
  } catch (error) {
    if (error instanceof Error && error.message === 'BATTLE_ENCOUNTER_INVALID') throw error;
    throw new Error('BATTLE_ENCOUNTER_INVALID', { cause: error });
  }
}
