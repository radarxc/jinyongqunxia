import { compareCodePoints } from '@tianshu/shared';
import type { StoryLineState } from '../state';
import type { ConditionFacts } from './condition';
import type { StoryRuntimeSnapshot } from './runtime-models';

export function replaceLine(
  snapshot: StoryRuntimeSnapshot, next: StoryLineState,
): StoryRuntimeSnapshot {
  const lines = snapshot.lines.filter((line) => line.lineId !== next.lineId);
  lines.push(next); lines.sort((left, right) => compareCodePoints(left.lineId, right.lineId));
  return { ...snapshot, lines };
}
export function findLine(snapshot: StoryRuntimeSnapshot, lineId: string): StoryLineState {
  const line = snapshot.lines.find((entry) => entry.lineId === lineId);
  if (line === undefined) throw new TypeError(`STORY_STATE_LINE:${lineId}`);
  return line;
}
export function addUnique(values: readonly string[], value: string): readonly string[] {
  if (values.includes(value)) return values;
  const next = [...values, value]; next.sort(compareCodePoints); return next;
}
export function nodeReceipt(lineId: string, nodeId: string): string {
  return `${lineId}/${nodeId}/completed`;
}
export function deriveStoryFacts(snapshot: StoryRuntimeSnapshot): ConditionFacts {
  const storyNodes: Record<string, 'completed' | 'expired'> = {
    ...(snapshot.facts.storyNodes ?? {}),
  };
  for (const line of snapshot.lines) {
    for (const nodeId of line.completedNodeIds) storyNodes[`${line.lineId}/${nodeId}`] = 'completed';
    for (const nodeId of line.expiredNodeIds) storyNodes[`${line.lineId}/${nodeId}`] = 'expired';
  }
  const npcStates: Record<string, string> = { ...(snapshot.facts.npcStates ?? {}) };
  for (const presence of snapshot.npc.presences) npcStates[presence.npcId] = 'alive';
  const npcRelationships = { ...(snapshot.facts.npcRelationships ?? {}) };
  for (const relation of snapshot.npc.relationships) npcRelationships[relation.npcId] = {
    affinity: relation.affinity, bond: relation.bond, resentment: relation.resentment,
  };
  return { ...snapshot.facts, storyNodes, npcStates, npcRelationships };
}
export function updateLine(
  line: StoryLineState, patch: Partial<StoryLineState>,
): StoryLineState {
  return { ...line, ...patch, revision: line.revision + 1 };
}

