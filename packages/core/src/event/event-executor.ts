import type { EventAction, EventDef, EventPresentationAction } from '@tianshu/data/schemas';
import { compareCodePoints, type JsonValue } from '@tianshu/shared';
import { addInventory, removeInventory } from '../economy';
import type { CharacterState, GameState, RuleSwitchState } from '../state';
import { evaluateGate, regionRuntimeForState } from '../world';
import type { CoreTransaction, RejectReason } from '../command';
import type { EventPresentedPayload, PendingDomainEvent } from './index';

const PRESENTATION = new Set<EventAction['op']>([
  'battle/start', 'tutorial/mark', 'story/requestTransmission', 'ui/openAllocation',
  'ui/showTitleCard', 'dialogue/speaker', 'dialogue/start', 'ui/showText',
  'ui/revealText', 'ui/observeOnly', 'world/loadScene',
]);
const EXECUTABLE = new Set<EventAction['op']>([
  'party/giveItem', 'party/takeItem', 'party/restore', 'flag/set',
  'world/openEntrance', 'save/autosave', ...PRESENTATION,
]);
interface EventFailureReasons {
  readonly condition: RejectReason; readonly action: RejectReason;
  readonly reference: RejectReason; readonly inventory: RejectReason;
}
const REGION_FAILURES: EventFailureReasons = {
  condition: 'REGION_EVENT_CONDITION', action: 'REGION_EVENT_ACTION',
  reference: 'REGION_EVENT_REFERENCE', inventory: 'REGION_EVENT_INVENTORY',
};
const SOURCE_FAILURES: EventFailureReasons = {
  condition: 'SOURCE_EVENT_CONDITION', action: 'SOURCE_EVENT_ACTION',
  reference: 'SOURCE_EVENT_REFERENCE', inventory: 'SOURCE_EVENT_INVENTORY',
};
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
function executeStateAction(tx: CoreTransaction, action: EventAction, anchorId: string | null,
  failures: EventFailureReasons): void {
  if (action.op === 'flag/set') { setSwitch(tx, action.flagId, action.value); return; }
  if (action.op === 'world/openEntrance') {
    setSwitch(tx, action.entranceId, true);
    tx.emit({ t: 'world/entranceOpened', payload: { entranceId: action.entranceId } }); return;
  }
  if (action.op === 'party/giveItem' || action.op === 'party/takeItem') {
    if (!tx.content.items?.some((item) => item.id === action.item))
      tx.abort(failures.reference);
    try {
      const inventory = action.op === 'party/giveItem'
        ? addInventory(tx.state.party.inventory, tx.content.items ?? [], action.item, action.count)
        : removeInventory(tx.state.party.inventory, tx.content.items ?? [], action.item, action.count);
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
    tx.set(['profile', 'protagonist'], tx.state.profile.protagonist
      ? restore(tx.state.profile.protagonist) : null);
    tx.set(['profile', 'companions'], tx.state.profile.companions.map(restore)); return;
  }
  if (action.op === 'save/autosave') {
    if (tx.state.dialogue === null && tx.state.world.navigation.pendingMount === null) {
      const mounted = tx.state.world.navigation.mountedRegion;
      if (anchorId === null || mounted === null) tx.abort(failures.condition);
      tx.emit({ t: 'world/autosaveRequested', payload: {
        regionId: mounted.regionId,
        sceneId: tx.state.world.navigation.locationId, anchorId, reason: action.reason } });
    }
    return;
  }
  tx.abort(failures.action);
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
    tx.abort(SOURCE_FAILURES.condition);
  try {
    return evaluateGate(gate as never,
      regionRuntimeForState(tx.state, tx.content.region).gateFacts).allowed;
  } catch { tx.abort(SOURCE_FAILURES.condition); }
}
function executeActions(tx: CoreTransaction, event: EventDef, anchorId: string | null,
  failures: EventFailureReasons): void {
  if (event.actions.some((action) => !EXECUTABLE.has(action.op))) tx.abort(failures.action);
  const presentation: EventPresentationAction[] = [];
  for (const action of event.actions) {
    if (PRESENTATION.has(action.op)) presentation.push(action as EventPresentationAction);
    else executeStateAction(tx, action, anchorId, failures);
  }
  if (event.once) setSwitch(tx, event.id, true);
  if (presentation.length > 0) {
    const payload: EventPresentedPayload = { eventId: event.id, steps: presentation };
    tx.emit({ t: 'world/eventPresented', payload: payload as unknown as JsonValue });
  }
}

export function executeEvent(tx: CoreTransaction, eventId: string, anchorId: string): void {
  const event = tx.content.events?.find((entry) => entry.id === eventId);
  if (!event) tx.abort('REGION_EVENT_UNKNOWN');
  if (event.chapterId !== tx.state.chapter.chapterId) tx.abort('REGION_EVENT_CHAPTER');
  if (event.once && currentSwitches(tx)[event.id] === true) return;
  if (!conditionMatches(tx, event, anchorId)) tx.abort('REGION_EVENT_CONDITION');
  executeActions(tx, event, anchorId, REGION_FAILURES);
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
    executeActions(tx, event, anchorId, SOURCE_FAILURES);
  }
}
