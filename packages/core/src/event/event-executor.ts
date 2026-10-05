import type { EventAction, EventDef, EventPresentationAction, QuestDef } from '@tianshu/data/schemas';
import { compareCodePoints, type JsonValue } from '@tianshu/shared';
import { addInventory, removeInventory } from '../economy';
import { compileCondition, type ConditionFacts, type QuestConditionFact } from '../quest';
import type { CharacterState, GameState, RuleSwitchState, StoryLineState } from '../state';
import { evaluateGate, regionRuntimeForState } from '../world';
import type { CoreTransaction, RejectReason } from '../command';
import type { EventPresentedPayload, PendingDomainEvent } from './index';

const PRESENTATION = new Set<EventAction['op']>([
  'battle/start', 'tutorial/mark', 'story/requestTransmission', 'ui/openAllocation',
  'ui/showTitleCard', 'dialogue/speaker', 'dialogue/start', 'ui/showText',
  'ui/revealText', 'ui/observeOnly', 'world/loadScene',
]);
const EXECUTABLE = new Set<EventAction['op']>([
  'quest/advance',
  'party/giveItem', 'party/takeItem', 'party/restore', 'flag/set',
  'world/openEntrance', 'save/autosave', ...PRESENTATION,
]);
export interface ActionExecutionContext {
  readonly sourceId: string; readonly anchorId: string | null;
  readonly allowDialogueAutosave?: boolean;
  readonly reject: { readonly condition: RejectReason; readonly action: RejectReason;
    readonly reference: RejectReason; readonly inventory: RejectReason;
    readonly quest: RejectReason; readonly battle: RejectReason };
}
const REGION_CONTEXT = (eventId: string, anchorId: string): ActionExecutionContext => ({
  sourceId: eventId, anchorId, reject: { action: 'REGION_EVENT_ACTION',
    reference: 'REGION_EVENT_REFERENCE', inventory: 'REGION_EVENT_INVENTORY',
    condition: 'REGION_EVENT_CONDITION', quest: 'REGION_EVENT_ACTION',
    battle: 'REGION_EVENT_ACTION' },
});
const SOURCE_CONTEXT = (eventId: string, anchorId: string | null): ActionExecutionContext => ({
  sourceId: eventId, anchorId, reject: { condition: 'SOURCE_EVENT_CONDITION',
    action: 'SOURCE_EVENT_ACTION', reference: 'SOURCE_EVENT_REFERENCE',
    inventory: 'SOURCE_EVENT_INVENTORY', quest: 'SOURCE_EVENT_ACTION',
    battle: 'SOURCE_EVENT_ACTION' },
});
const SOURCE_EVENT_TYPES: ReadonlySet<string> = new Set(['chapter/woke']);

function switches(state: Readonly<GameState>): RuleSwitchState {
  const value = state.profile.replayRules;
  if (!value) throw new TypeError('RULES_STATE_MISSING');
  return value;
}
function setSwitch(tx: CoreTransaction, key: string, value: boolean): void {
  const rules = switches(tx.state);
  tx.set(['profile', 'replayRules'], { ...rules,
    switches: { ...rules.switches, [key]: value } });
}
function currentSwitches(tx: CoreTransaction): Readonly<Record<string, boolean>> {
  return switches(tx.state).switches;
}
function restore(character: CharacterState): CharacterState {
  if (character.status !== 'active') return character;
  return { ...character, resources: { hp: character.stats.hpMax, mp: character.stats.mpMax },
    consumable: { ...character.consumable, stamina: character.consumable.staminaMax } };
}
function questFacts(tx: CoreTransaction): ConditionFacts {
  const quests: Record<string, QuestConditionFact> = {};
  for (const definition of tx.content.quests ?? [])
    quests[definition.id] = { state: 'locked', stage: definition.startStageId };
  for (const line of tx.state.chapter.story.lines) {
    const definition = tx.content.quests?.find((entry) => entry.id === line.lineId);
    if (!definition) continue;
    const stage = questCurrentStage(definition, line);
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
  return { flags: currentSwitches(tx), quests, inventory, npcStates, npcRelationships,
    location: { eraLayer: tx.state.chapter.eraLayerId },
    time: { year: tx.state.chapter.worldYear, period: 'day' } };
}
function questCurrentStage(quest: QuestDef, line?: StoryLineState): string {
  if (line?.activeNodeIds[0] !== undefined) return line.activeNodeIds[0];
  if (line?.completedNodeIds.length) return line.completedNodeIds.at(-1)!;
  return quest.startStageId;
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
function questEffectAction(effect: QuestDef['stages'][number]['effects'][number]):
EventAction | null {
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
function questAdvance(tx: CoreTransaction, action: Extract<EventAction, { op: 'quest/advance' }>,
  context: ActionExecutionContext): readonly EventAction[] {
  const quest = tx.content.quests?.find((entry) => entry.id === action.quest);
  const target = quest?.stages.find((entry) => entry.id === action.stage);
  if (!quest || !target || quest.chapterId !== tx.state.chapter.chapterId)
    tx.abort(context.reject.quest);
  const lines = tx.state.chapter.story.lines;
  const current = lines.find((entry) => entry.lineId === quest.id);
  if (current?.status === 'completed' || current?.status === 'expired')
    tx.abort(context.reject.quest);
  const currentStageId = questCurrentStage(quest, current);
  const currentStage = quest.stages.find((entry) => entry.id === currentStageId);
  if (!currentStage) tx.abort(context.reject.quest);
  try {
    if ((!current || current.status === 'locked') && quest.offerWhen !== undefined &&
        !compileCondition(quest.offerWhen as unknown as JsonValue)(questFacts(tx)))
      tx.abort(context.reject.quest);
  } catch { tx.abort(context.reject.quest); }
  let transitionId: string | undefined;
  if (currentStageId !== action.stage) {
    const transition = currentStage.transitions.find((entry) => entry.to === action.stage);
    try {
      if (!transition || !compileCondition(transition.when as unknown as JsonValue)(questFacts(tx)))
        tx.abort(context.reject.quest);
    } catch { tx.abort(context.reject.quest); }
    transitionId = transition.id;
  } else if (current !== undefined) {
    // Result dialogue may reassert the stage already committed by battle settlement.
    // Effects are receipt-protected, so the assertion is an idempotent no-op.
    if (!context.sourceId.startsWith('dialogue:')) tx.abort(context.reject.quest);
    return [];
  }
  const next = questLine(quest, action.stage, current, transitionId);
  const receipt = (effectId: string): string => `${quest.id}/${target.id}/${effectId}`;
  const unapplied = target.effects.filter((effect) =>
    !next.appliedEffectIds.includes(receipt(effect.id)));
  const committed = { ...next, appliedEffectIds: [...next.appliedEffectIds,
    ...unapplied.map((effect) => receipt(effect.id))] };
  tx.emit({ t: target.terminal === 'completed' ? 'quest/succeeded' :
    target.terminal === 'failed' ? 'quest/failed' : 'quest/advanced',
  payload: { questId: quest.id, oldStatus: current?.status ?? 'inactive',
    newStatus: target.terminal ?? 'active', stageKey: action.stage, source: context.sourceId } });
  tx.set(['chapter', 'story', 'lines'], [...lines.filter((line) => line.lineId !== quest.id), committed]
    .sort((left, right) => left.lineId < right.lineId ? -1 : left.lineId > right.lineId ? 1 : 0));
  return unapplied.flatMap((effect) => {
    const mapped = questEffectAction(effect);
    if (!mapped) tx.abort(context.reject.action);
    return [mapped];
  });
}
function executeStateAction(tx: CoreTransaction, action: EventAction,
  context: ActionExecutionContext): void {
  if (action.op === 'flag/set') { setSwitch(tx, action.flagId, action.value); return; }
  if (action.op === 'world/openEntrance') {
    setSwitch(tx, action.entranceId, true);
    tx.emit({ t: 'world/entranceOpened', payload: { entranceId: action.entranceId } }); return;
  }
  if (action.op === 'party/giveItem' || action.op === 'party/takeItem') {
    if (!tx.content.items?.some((item) => item.id === action.item))
      tx.abort(context.reject.reference);
    try {
      const inventory = action.op === 'party/giveItem'
        ? addInventory(tx.state.party.inventory, tx.content.items ?? [], action.item, action.count)
        : removeInventory(tx.state.party.inventory, tx.content.items ?? [], action.item, action.count);
      tx.set(['party', 'inventory'], inventory);
    } catch (error) {
      if (error instanceof Error && (error.message === 'INVENTORY_INSUFFICIENT' ||
          error.message === 'INVENTORY_STACK_LIMIT'))
        tx.abort(context.reject.inventory);
      tx.abort(context.reject.reference);
    }
    return;
  }
  if (action.op === 'party/restore') {
    tx.set(['profile', 'protagonist'], tx.state.profile.protagonist
      ? restore(tx.state.profile.protagonist) : null);
    tx.set(['profile', 'companions'], tx.state.profile.companions.map(restore)); return;
  }
  if (action.op === 'save/autosave') {
    if ((tx.state.dialogue === null || context.allowDialogueAutosave === true) &&
        tx.state.world.navigation.pendingMount === null) {
      const mounted = tx.state.world.navigation.mountedRegion;
      if (!context.allowDialogueAutosave && (context.anchorId === null || mounted === null))
        tx.abort(context.reject.condition);
      tx.emit({ t: 'world/autosaveRequested', payload: {
        regionId: mounted?.regionId ?? null,
        sceneId: tx.state.world.navigation.locationId, anchorId: context.anchorId,
        reason: action.reason } });
    }
    return;
  }
  tx.abort(context.reject.action);
}
function collectPresentationAction(tx: CoreTransaction, action: EventAction,
  context: ActionExecutionContext, presentation: EventPresentationAction[]): void {
  if (!PRESENTATION.has(action.op)) tx.abort(context.reject.action);
  if (action.op === 'battle/start') {
    if (tx.state.battle !== null) tx.abort(context.reject.battle);
    tx.emit({ t: 'world/battleRequested', payload: { anchorId: context.anchorId,
      encounterId: action.encounter } });
    return;
  }
  presentation.push(action as EventPresentationAction);
}

/** Execute one pre-authorized action against the current snapshot. */
export function executeAction(tx: CoreTransaction, action: EventAction,
  context: ActionExecutionContext): void {
  executeActions(tx, [action], context);
}

/** Execute a source-ordered action batch and publish one ordered presentation envelope. */
export function executeActions(tx: CoreTransaction, actions: readonly EventAction[],
  context: ActionExecutionContext): void {
  const presentation: EventPresentationAction[] = [];
  const advancing = new Set<string>();
  const execute = (action: EventAction): void => {
    if (!EXECUTABLE.has(action.op)) tx.abort(context.reject.action);
    if (action.op === 'quest/advance') {
      const key = `${action.quest}/${action.stage}`;
      if (advancing.has(key)) tx.abort(context.reject.quest);
      advancing.add(key);
      for (const effect of questAdvance(tx, action, context)) execute(effect);
      advancing.delete(key);
    } else if (PRESENTATION.has(action.op))
      collectPresentationAction(tx, action, context, presentation);
    else executeStateAction(tx, action, context);
  };
  for (const action of actions) execute(action);
  if (presentation.length > 0) {
    const payload: EventPresentedPayload = { eventId: context.sourceId, steps: presentation };
    tx.emit({ t: 'world/eventPresented', payload: payload as unknown as JsonValue });
  }
}
function conditionMatches(tx: CoreTransaction, event: EventDef, anchorId: string): boolean {
  const condition = event.condition; if (!condition) return true;
  const scene = condition['sceneId']; const anchor = condition['anchorId'];
  if (typeof scene === 'string' && scene !== tx.state.world.navigation.locationId) return false;
  if (typeof anchor === 'string' && anchor !== anchorId) return false;
  if (condition['chapterId'] !== undefined &&
      condition['chapterId'] !== tx.state.chapter.chapterId) return false;
  if (condition['sourceEvent'] !== undefined) return false;
  const gate = condition['gate'];
  if (gate !== undefined) {
    if (!tx.content.region || typeof gate !== 'object' || gate === null || Array.isArray(gate))
      tx.abort('REGION_EVENT_CONDITION');
    try {
      if (!evaluateGate(gate as never, regionRuntimeForState(tx.state, tx.content.region).gateFacts).allowed)
        return false;
    } catch { tx.abort('REGION_EVENT_CONDITION'); }
  }
  return true;
}
function sourceAnchorId(source: PendingDomainEvent): string | null {
  const payload = source.payload;
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const anchorId = (payload as Readonly<Record<string, JsonValue>>)['anchorId'];
  return typeof anchorId === 'string' ? anchorId : null;
}
function sourceConditionMatches(tx: CoreTransaction, event: EventDef,
  source: PendingDomainEvent, anchorId: string | null): boolean {
  const condition = event.condition;
  if (!condition || condition.sourceEvent !== source.t) return false;
  if (condition.sceneId !== undefined &&
      condition.sceneId !== tx.state.world.navigation.locationId) return false;
  if (condition.anchorId !== undefined && condition.anchorId !== anchorId) return false;
  if (condition.chapterId !== undefined &&
      condition.chapterId !== tx.state.chapter.chapterId) return false;
  const gate = condition.gate;
  if (gate === undefined) return true;
  if (!tx.content.region || typeof gate !== 'object' || gate === null || Array.isArray(gate))
    tx.abort('SOURCE_EVENT_CONDITION');
  try {
    return evaluateGate(gate as never,
      regionRuntimeForState(tx.state, tx.content.region).gateFacts).allowed;
  } catch { tx.abort('SOURCE_EVENT_CONDITION'); }
}

export function executeEvent(tx: CoreTransaction, eventId: string, anchorId: string): void {
  const event = tx.content.events?.find((entry) => entry.id === eventId);
  if (!event) tx.abort('REGION_EVENT_UNKNOWN');
  if (event.chapterId !== tx.state.chapter.chapterId) tx.abort('REGION_EVENT_CHAPTER');
  if (event.once && currentSwitches(tx)[event.id] === true) return;
  if (!conditionMatches(tx, event, anchorId)) tx.abort('REGION_EVENT_CONDITION');
  if (event.actions.some((action) => !EXECUTABLE.has(action.op))) tx.abort('REGION_EVENT_ACTION');
  const context = REGION_CONTEXT(event.id, anchorId);
  executeActions(tx, event.actions, context);
  if (event.once) setSwitch(tx, event.id, true);
}

export function isEventDefSourceEvent(eventType: string): boolean {
  return SOURCE_EVENT_TYPES.has(eventType);
}

/** Executes one registered root fact only; transaction recursion guards enforce depth one. */
export function executeSourceEventDefs(tx: CoreTransaction, source: PendingDomainEvent): void {
  const anchorId = sourceAnchorId(source);
  const matches = (tx.content.events ?? []).filter((event) =>
    event.chapterId === tx.state.chapter.chapterId &&
    event.condition?.sourceEvent === source.t).sort((left, right) =>
    compareCodePoints(left.id, right.id));
  for (const event of matches) {
    if (event.once && currentSwitches(tx)[event.id] === true) continue;
    if (!sourceConditionMatches(tx, event, source, anchorId)) continue;
    executeActions(tx, event.actions, SOURCE_CONTEXT(event.id, anchorId));
    if (event.once) setSwitch(tx, event.id, true);
  }
}
