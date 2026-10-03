import type { JsonValue } from '@tianshu/shared';
import type { StoryNode } from '@tianshu/data/schemas';
import { startDialogue } from '../dialogue';
import { despawnNpc, spawnNpc } from '../npc';
import type { CompiledStoryNode } from './compile';
import type { ConditionFacts } from './condition';
import type { StoryRuntimePorts, StoryRuntimeSnapshot, StoryWait } from './runtime-models';

export interface ExecutionResult {
  readonly snapshot: StoryRuntimeSnapshot; readonly wait: StoryWait | null; readonly completes: boolean;
  readonly endingTags?: readonly string[];
}
function executeActor(
  snapshot: StoryRuntimeSnapshot, lineId: string, node: Extract<StoryNode, { type: 'spawn' | 'despawn' }>,
): ExecutionResult {
  const npc = node.type === 'spawn'
    ? spawnNpc(snapshot.npc, { ...node.payload, sourceLineId: lineId, sourceNodeId: node.id })
    : despawnNpc(snapshot.npc, node.payload.npcId, node.payload.eraLayer);
  return { snapshot: { ...snapshot, npc }, wait: null, completes: true };
}
export function executeNode(
  snapshot: StoryRuntimeSnapshot, lineId: string, compiled: CompiledStoryNode,
  ports: StoryRuntimePorts, facts: ConditionFacts,
): ExecutionResult {
  const node = compiled.node;
  if (node.type === 'spawn' || node.type === 'despawn') return executeActor(snapshot, lineId, node);
  if (node.type === 'dialogue') {
    const session = startDialogue(node, ports.dialogue, ports.inkSeed ?? 0);
    return { snapshot, wait: { kind: 'dialogue', lineId, nodeId: node.id, session }, completes: false };
  }
  if (node.type === 'quest') {
    const receipt = `${lineId}/${node.id}/activate`;
    if ('questId' in node.payload) {
      ports.quest.commit([{ type: 'activate', questId: node.payload.questId, receiptId: receipt }]);
      const facts = { ...snapshot.facts, quests: { ...snapshot.facts.quests,
        [node.payload.questId]: 'active' as const } };
      const eventTicks = { ...snapshot.eventTicks,
        [`quest/accepted/${node.payload.questId}`]: snapshot.nowTick };
      return { snapshot: { ...snapshot, facts, eventTicks },
        wait: { kind: 'quest', lineId, nodeId: node.id,
        questId: node.payload.questId }, completes: false };
    }
    ports.quest.commit([{ type: 'executeEvent', eventKey: node.payload.inlineEvent.eventKey,
      actions: node.payload.inlineEvent.actions as readonly Readonly<Record<string, JsonValue>>[],
      receiptId: receipt }]);
    return { snapshot, wait: null, completes: true };
  }
  if (node.type === 'choice') {
    const options = node.payload.options.filter((option) =>
      compiled.optionConditions[option.key]?.(facts) ?? true).map((option) => option.key);
    return { snapshot, wait: { kind: 'choice', lineId, nodeId: node.id, options }, completes: false };
  }
  if (node.type === 'condition') {
    if (!(compiled.gate?.(facts) ?? false))
      return { snapshot, wait: null, completes: false };
    return { snapshot, wait: null, completes: true };
  }
  if (node.type === 'end') return { snapshot, wait: null, completes: true,
    endingTags: node.payload.endingTags };
  return { snapshot, wait: null, completes: true };
}

