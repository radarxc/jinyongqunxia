import type { EventAction, EventDef, EventPresentationAction } from '@tianshu/data/schemas';
import { compareCodePoints, type JsonValue } from '@tianshu/shared';
import { addInventory, removeInventory } from '../economy';
import type { CharacterState, GameState, RuleSwitchState } from '../state';
import { evaluateGate, regionRuntimeForState } from '../world';
import type { CoreTransaction, RejectReason } from '../command';
import type { EventPresentedPayload, PendingDomainEvent } from './index';
import { advanceQuestAction, type QuestActionContext } from './quest-actions';

export const EVENT_PRESENTATION_OPS = new Set<EventAction['op']>([
  'battle/start',
  'tutorial/mark',
  'story/requestTransmission',
  'ui/openAllocation',
  'ui/showTitleCard',
  'dialogue/speaker',
  'dialogue/start',
  'ui/showText',
  'ui/revealText',
  'ui/observeOnly',
  'world/loadScene',
]);
export const EVENT_EXECUTABLE_OPS = new Set<EventAction['op']>([
  'quest/advance',
  'party/giveItem',
  'party/takeItem',
  'party/restore',
  'flag/set',
  'world/openEntrance',
  'save/autosave',
  ...EVENT_PRESENTATION_OPS,
]);
export interface EventFailureReasons {
  readonly condition: RejectReason;
  readonly action: RejectReason;
  readonly reference: RejectReason;
  readonly inventory: RejectReason;
  readonly quest: RejectReason;
  readonly battle: RejectReason;
}
const REGION_FAILURES: EventFailureReasons = {
  condition: 'REGION_EVENT_CONDITION',
  action: 'REGION_EVENT_ACTION',
  reference: 'REGION_EVENT_REFERENCE',
  inventory: 'REGION_EVENT_INVENTORY',
  quest: 'REGION_EVENT_ACTION',
  battle: 'REGION_EVENT_ACTION',
};
const SOURCE_FAILURES: EventFailureReasons = {
  condition: 'SOURCE_EVENT_CONDITION',
  action: 'SOURCE_EVENT_ACTION',
  reference: 'SOURCE_EVENT_REFERENCE',
  inventory: 'SOURCE_EVENT_INVENTORY',
  quest: 'SOURCE_EVENT_ACTION',
  battle: 'SOURCE_EVENT_ACTION',
};
export type DialogueActionExecutor = (
  tx: CoreTransaction,
  actions: readonly EventAction[],
  sourceId: string,
) => void;
let dialogueActionExecutor: DialogueActionExecutor | undefined;

/** Installed by the dialogue command chunk; the first-session executor never imports it. */
export function registerDialogueActionExecutor(executor: DialogueActionExecutor): void {
  dialogueActionExecutor = executor;
}
export function executeDialogueActions(
  tx: CoreTransaction,
  actions: readonly EventAction[],
  sourceId: string,
): void {
  if (!dialogueActionExecutor) tx.abort('DIALOGUE_INTENT_ACTION');
  dialogueActionExecutor(tx, actions, sourceId);
}
const SOURCE_EVENT_TYPES: ReadonlySet<string> = new Set(['chapter/woke']);

function switches(state: Readonly<GameState>): RuleSwitchState {
  const value = state.profile.replayRules;
  if (!value) throw new TypeError('RULES_STATE_MISSING');
  return value;
}
function setSwitch(tx: CoreTransaction, key: string, value: boolean): void {
  const rules = switches(tx.state);
  tx.set(['profile', 'replayRules'], {
    ...rules,
    switches: {
      ...rules.switches,
      [key]: value,
    },
  });
}
function currentSwitches(tx: CoreTransaction): Readonly<Record<string, boolean>> {
  return switches(tx.state).switches;
}

// Region, source and dialogue actions share deterministic state mutations. Dialogue-only
// tag validation and dispatch registration are installed from intent-actions.ts.
function restore(character: CharacterState): CharacterState {
  if (character.status !== 'active') return character;
  return {
    ...character,
    resources: {
      hp: character.stats.hpMax,
      mp: character.stats.mpMax,
    },
    consumable: {
      ...character.consumable,
      stamina: character.consumable.staminaMax,
    },
  };
}
export function executeEventStateAction(
  tx: CoreTransaction,
  action: EventAction,
  anchorId: string | null,
  failures: EventFailureReasons,
): void {
  if (action.op === 'flag/set') { setSwitch(tx, action.flagId, action.value); return; }
  if (action.op === 'world/openEntrance') {
    setSwitch(tx, action.entranceId, true);
    tx.emit({
      t: 'world/entranceOpened',
      payload: { entranceId: action.entranceId },
    });
    return;
  }
  if (action.op === 'party/giveItem' || action.op === 'party/takeItem') {
    if (!tx.content.items?.some((item) => item.id === action.item))
      tx.abort(failures.reference);
    try {
      const inventory = action.op === 'party/giveItem'
        ? addInventory(tx.state.party.inventory, tx.content.items ?? [], action.item, action.count)
        : removeInventory(
            tx.state.party.inventory,
            tx.content.items ?? [],
            action.item,
            action.count,
          );
      tx.set(['party', 'inventory'], inventory);
    } catch (error) {
      if (error instanceof Error && (error.message === 'INVENTORY_INSUFFICIENT' ||
          error.message === 'INVENTORY_STACK_LIMIT'))
        tx.abort(failures.inventory);
      tx.abort(failures.reference);
    }
    return;
  }
  if (action.op === 'party/restore') {
    const protagonist = tx.state.profile.protagonist;
    tx.set(['profile', 'protagonist'], protagonist ? restore(protagonist) : null);
    tx.set(['profile', 'companions'], tx.state.profile.companions.map(restore));
    return;
  }
  if (action.op === 'save/autosave') {
    if (tx.state.dialogue === null && tx.state.world.navigation.pendingMount === null) {
      const mounted = tx.state.world.navigation.mountedRegion;
      if (anchorId === null || mounted === null) tx.abort(failures.condition);
      tx.emit({
        t: 'world/autosaveRequested',
        payload: {
          regionId: mounted.regionId,
          sceneId: tx.state.world.navigation.locationId,
          anchorId,
          reason: action.reason,
        },
      });
    }
    return;
  }
  tx.abort(failures.action);
}
function executeEventActions(
  tx: CoreTransaction,
  event: EventDef,
  anchorId: string | null,
  failures: EventFailureReasons,
): void {
  // A battle request is a domain event, not a presentation step. Keeping that
  // distinction here preserves the region/source contract without importing battle.
  const presentation: EventPresentationAction[] = [];
  const advancing = new Set<string>();
  const questContext: QuestActionContext = { sourceId: event.id,
    actionFailure: failures.action, questFailure: failures.quest };
  const execute = (action: EventAction): void => {
    if (action.op === 'quest/advance') {
      const key = `${action.quest}/${action.stage}`;
      if (advancing.has(key)) tx.abort(failures.quest);
      advancing.add(key);
      try { for (const effect of advanceQuestAction(tx, action, questContext)) execute(effect); }
      finally { advancing.delete(key); }
      return;
    }
    if (action.op === 'battle/start') {
      if (tx.state.battle !== null) tx.abort(failures.battle);
      tx.emit({
        t: 'world/battleRequested',
        payload: { anchorId, encounterId: action.encounter },
      });
    } else if (EVENT_PRESENTATION_OPS.has(action.op))
      presentation.push(action as EventPresentationAction);
    else executeEventStateAction(tx, action, anchorId, failures);
  };
  for (const action of event.actions) execute(action);
  if (presentation.length > 0) {
    const payload: EventPresentedPayload = { eventId: event.id, steps: presentation };
    tx.emit({ t: 'world/eventPresented', payload: payload as unknown as JsonValue });
  }
}
function conditionMatches(tx: CoreTransaction, event: EventDef, anchorId: string): boolean {
  const condition = event.condition;
  if (!condition) return true;
  const scene = condition['sceneId'];
  const anchor = condition['anchorId'];
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

// Source-event predicates are evaluated after the source fact joins the current
// transaction, while derived events remain protected by the transaction depth guard.
function sourceConditionMatches(
  tx: CoreTransaction,
  event: EventDef,
  source: PendingDomainEvent,
  anchorId: string | null,
): boolean {
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
    const runtime = regionRuntimeForState(tx.state, tx.content.region);
    return evaluateGate(gate as never, runtime.gateFacts).allowed;
  } catch { tx.abort('SOURCE_EVENT_CONDITION'); }
}

export function executeEvent(tx: CoreTransaction, eventId: string, anchorId: string): void {
  const event = tx.content.events?.find((entry) => entry.id === eventId);
  if (!event) tx.abort('REGION_EVENT_UNKNOWN');
  if (event.chapterId !== tx.state.chapter.chapterId) {
    tx.abort('REGION_EVENT_CHAPTER');
  }
  if (event.once && currentSwitches(tx)[event.id] === true) return;
  if (!conditionMatches(tx, event, anchorId)) {
    tx.abort('REGION_EVENT_CONDITION');
  }
  const includesUnsupportedAction = event.actions.some(
    (action) => !EVENT_EXECUTABLE_OPS.has(action.op),
  );
  if (includesUnsupportedAction) {
    tx.abort('REGION_EVENT_ACTION');
  }
  executeEventActions(tx, event, anchorId, REGION_FAILURES);
  if (event.once) setSwitch(tx, event.id, true);
}

export function isEventDefSourceEvent(eventType: string): boolean {
  return SOURCE_EVENT_TYPES.has(eventType);
}

/** Executes one registered root fact only; transaction recursion guards enforce depth one. */
export function executeSourceEventDefs(tx: CoreTransaction, source: PendingDomainEvent): void {
  const anchorId = sourceAnchorId(source);
  const matches = (tx.content.events ?? [])
    .filter((event) =>
      event.chapterId === tx.state.chapter.chapterId &&
      event.condition?.sourceEvent === source.t)
    .sort((left, right) => compareCodePoints(left.id, right.id));
  for (const event of matches) {
    if (event.once && currentSwitches(tx)[event.id] === true) continue;
    if (!sourceConditionMatches(tx, event, source, anchorId)) continue;
    executeEventActions(tx, event, anchorId, SOURCE_FAILURES);
    if (event.once) setSwitch(tx, event.id, true);
  }
}
