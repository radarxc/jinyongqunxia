import type { EventAction, QuestDef } from '@tianshu/data/schemas';
import type { JsonValue } from '@tianshu/shared';
import type { CoreTransaction, RejectReason } from '../command';
import { compileCondition } from '../quest/condition';
import type { ConditionFacts, QuestConditionFact } from '../quest/condition-types';
import type { StoryLineState } from '../state';

export interface QuestActionContext {
  readonly sourceId: string;
  readonly actionFailure: RejectReason;
  readonly questFailure: RejectReason;
}

function currentStage(quest: QuestDef, line?: StoryLineState): string {
  if (line?.activeNodeIds[0] !== undefined) return line.activeNodeIds[0];
  if (line?.completedNodeIds.length) return line.completedNodeIds.at(-1)!;
  return quest.startStageId;
}
function facts(tx: CoreTransaction, definitions: readonly QuestDef[]): ConditionFacts {
  const rules = tx.state.profile.replayRules;
  if (!rules) throw new TypeError('RULES_STATE_MISSING');
  const quests: Record<string, QuestConditionFact> = {};
  for (const definition of definitions)
    quests[definition.id] = { state: 'locked', stage: definition.startStageId };
  for (const line of tx.state.chapter.story.lines) {
    const definition = definitions.find((entry) => entry.id === line.lineId);
    if (!definition) continue;
    const stage = currentStage(definition, line);
    const terminal = definition.stages.find((entry) => entry.id === stage)?.terminal;
    quests[line.lineId] = {
      state: line.status === 'expired' && terminal === 'failed' ? 'failed' : line.status, stage,
    };
  }
  const inventory = Object.fromEntries(tx.state.party.inventory.stacks.map((entry) =>
    [entry.itemId, entry.count]));
  const npcStates = Object.fromEntries(tx.state.chapter.npcs.map((entry) =>
    [entry.npcId, entry.character?.status ?? 'unknown']));
  const npcRelationships = Object.fromEntries(tx.state.chapter.npcs.map((entry) =>
    [entry.npcId, { affinity: entry.affinity, bond: 0, resentment: 0 }]));
  return { flags: rules.switches, quests, inventory, npcStates,
    npcRelationships, location: { eraLayer: tx.state.chapter.eraLayerId },
    time: { year: tx.state.chapter.worldYear, period: 'day' } };
}
function questLine(quest: QuestDef, stageId: string, previous?: StoryLineState,
  transitionId?: string): StoryLineState {
  const stage = quest.stages.find((entry) => entry.id === stageId)!;
  const completed = previous === undefined ? (stageId === quest.startStageId ? [] : [quest.startStageId])
    : previous.activeNodeIds.length === 0 ? previous.completedNodeIds
    : [...previous.completedNodeIds, previous.activeNodeIds[0]!];
  const completedNodeIds = [...new Set(stage.terminal ? [...completed, stageId] : completed)];
  return { lineId: quest.id, status: stage.terminal === undefined ? 'active' :
    stage.terminal === 'completed' ? 'completed' : 'expired',
    activeNodeIds: stage.terminal ? [] : [stageId], completedNodeIds,
    expiredNodeIds: previous?.expiredNodeIds ?? [], chosenOptions: previous?.chosenOptions ?? {},
    branchPath: [...new Set([...(previous?.branchPath ?? []),
      ...(transitionId === undefined ? [] : [transitionId])])],
    resolvedWindows: previous?.resolvedWindows ?? {},
    appliedEffectIds: previous?.appliedEffectIds ?? [], revision: (previous?.revision ?? -1) + 1 };
}
function effectAction(effect: QuestDef['stages'][number]['effects'][number]): EventAction | null {
  if (effect.op === 'flag/set') return { op: 'flag/set', flagId: effect.flagId, value: true };
  if (effect.op === 'flag/clear') return { op: 'flag/set', flagId: effect.flagId, value: false };
  if (effect.op === 'reward/item')
    return { op: 'party/giveItem', item: effect.itemId, count: effect.count };
  if (effect.op === 'battle/start') return { op: 'battle/start', encounter: effect.encounterId };
  if (effect.op === 'dialogue/start')
    return { op: 'dialogue/start', storyId: effect.storyId, knot: effect.knot };
  if (effect.op === 'quest/advance')
    return { op: 'quest/advance', quest: effect.questId, stage: effect.toStage };
  return null;
}

export function advanceQuestAction(
  tx: CoreTransaction,
  action: Extract<EventAction, { op: 'quest/advance' }>,
  context: QuestActionContext,
  definitions: readonly QuestDef[] = tx.content.quests ?? [],
): readonly EventAction[] {
  const quest = definitions.find((entry) => entry.id === action.quest);
  const target = quest?.stages.find((entry) => entry.id === action.stage);
  if (!quest || !target || quest.chapterId !== tx.state.chapter.chapterId)
    tx.abort(context.questFailure);
  const lines = tx.state.chapter.story.lines;
  const previous = lines.find((entry) => entry.lineId === quest.id);
  if (previous?.status === 'completed' || previous?.status === 'expired')
    tx.abort(context.questFailure);
  const stageId = currentStage(quest, previous);
  const stage = quest.stages.find((entry) => entry.id === stageId);
  if (!stage) tx.abort(context.questFailure);
  try {
    if ((!previous || previous.status === 'locked') && quest.offerWhen !== undefined &&
        !compileCondition(quest.offerWhen as unknown as JsonValue)(facts(tx, definitions)))
      tx.abort(context.questFailure);
  } catch { tx.abort(context.questFailure); }
  let transitionId: string | undefined;
  if (stageId !== action.stage) {
    const transition = stage.transitions.find((entry) => entry.to === action.stage);
    try {
      if (!transition || !compileCondition(transition.when as unknown as JsonValue)(facts(tx, definitions)))
        tx.abort(context.questFailure);
    } catch { tx.abort(context.questFailure); }
    transitionId = transition.id;
  } else if (previous !== undefined) {
    // Result dialogue may reassert the stage already committed by battle settlement.
    // Effects are receipt-protected, so the assertion is an idempotent no-op.
    if (!context.sourceId.startsWith('dialogue:')) tx.abort(context.questFailure);
    return [];
  }
  const next = questLine(quest, action.stage, previous, transitionId);
  const receipt = (effectId: string): string => `${quest.id}/${target.id}/${effectId}`;
  const unapplied = target.effects.filter((effect) =>
    !next.appliedEffectIds.includes(receipt(effect.id)));
  const committed = { ...next, appliedEffectIds: [...next.appliedEffectIds,
    ...unapplied.map((effect) => receipt(effect.id))] };
  tx.emit({ t: target.terminal === 'completed' ? 'quest/succeeded' :
    target.terminal === 'failed' ? 'quest/failed' : 'quest/advanced',
  payload: { questId: quest.id, oldStatus: previous?.status ?? 'inactive',
    newStatus: target.terminal ?? 'active', stageKey: action.stage, source: context.sourceId } });
  tx.set(['chapter', 'story', 'lines'], [...lines.filter((line) => line.lineId !== quest.id), committed]
    .sort((left, right) => left.lineId < right.lineId ? -1 : left.lineId > right.lineId ? 1 : 0));
  return unapplied.flatMap((effect) => {
    const mapped = effectAction(effect);
    if (!mapped) tx.abort(context.actionFailure);
    return [mapped];
  });
}
