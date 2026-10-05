import { QuestDefSchema, type QuestDef } from './schemas/quest';

/** Full Quest validation belongs to the dialogue command's lazy closure. */
export function parseDialogueQuests(values: readonly unknown[]): readonly QuestDef[] {
  return Object.freeze(values.map((value) => QuestDefSchema.parse(value)));
}
