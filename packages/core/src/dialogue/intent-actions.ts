import { EventActionSchema, type EventAction, type EventPresentationAction,
  type QuestDef } from '@tianshu/data/schemas';
import { parseDialogueQuests } from '../../../data/src/dialogue-content';
import type { JsonValue } from '@tianshu/shared';
import type { CoreTransaction } from '../command';
import { EVENT_EXECUTABLE_OPS, EVENT_PRESENTATION_OPS, executeEventStateAction,
  registerDialogueActionExecutor, type EventFailureReasons } from '../event/event-executor';
import { advanceQuestAction } from '../event/quest-actions';
import type { AuthorizedDialogueIntent } from './state';

const validatedQuests = new WeakMap<CoreTransaction['content'], readonly QuestDef[]>();
export function dialogueQuests(content: CoreTransaction['content']): readonly QuestDef[] {
  const cached = validatedQuests.get(content);
  if (cached) return cached;
  const parsed = parseDialogueQuests(content.quests ?? []);
  validatedQuests.set(content, parsed);
  return parsed;
}

export function authorizedDialogueIntents(state: NonNullable<CoreTransaction['state']['dialogue']>):
readonly AuthorizedDialogueIntent[] {
  return state.pendingIntents.map((value) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value))
      throw new TypeError('DIALOGUE_INTENT_INVALID');
    const row = value as Readonly<Record<string, JsonValue>>;
    if (typeof row['key'] !== 'string' || row['key'].length === 0)
      throw new TypeError('DIALOGUE_INTENT_INVALID');
    const parsed = EventActionSchema.safeParse(row['action']);
    if (!parsed.success) throw new TypeError('DIALOGUE_INTENT_INVALID');
    return { key: row['key'], action: parsed.data };
  });
}

const FAILURES: EventFailureReasons = { condition: 'DIALOGUE_INTENT_ACTION',
  action: 'DIALOGUE_INTENT_ACTION', reference: 'DIALOGUE_INTENT_REFERENCE',
  inventory: 'DIALOGUE_INTENT_INVENTORY', quest: 'DIALOGUE_INTENT_QUEST',
  battle: 'DIALOGUE_INTENT_BATTLE' };
registerDialogueActionExecutor((tx, actions, sourceId) => {
  const quests = dialogueQuests(tx.content);
  const presentation: EventPresentationAction[] = [];
  const advancing = new Set<string>();
  const execute = (action: EventAction): void => {
    if (action.op === 'quest/advance') {
      const key = `${action.quest}/${action.stage}`;
      if (advancing.has(key)) tx.abort('DIALOGUE_INTENT_QUEST');
      advancing.add(key);
      try {
        for (const effect of advanceQuestAction(tx, action, { sourceId,
          actionFailure: FAILURES.action, questFailure: FAILURES.quest }, quests)) execute(effect);
      }
      finally { advancing.delete(key); }
      return;
    }
    if (!EVENT_EXECUTABLE_OPS.has(action.op)) tx.abort('DIALOGUE_INTENT_ACTION');
    if (action.op === 'save/autosave') {
      if (tx.state.world.navigation.pendingMount === null) {
        const mounted = tx.state.world.navigation.mountedRegion;
        tx.emit({ t: 'world/autosaveRequested', payload: { regionId: mounted?.regionId ?? null,
          sceneId: tx.state.world.navigation.locationId, anchorId: 'dialogue',
          reason: action.reason } });
      }
    } else if (action.op === 'battle/start') {
      if (tx.state.battle !== null) tx.abort('DIALOGUE_INTENT_BATTLE');
      tx.emit({ t: 'world/battleRequested', payload: { anchorId: 'dialogue',
        encounterId: action.encounter } });
    } else if (EVENT_PRESENTATION_OPS.has(action.op))
      presentation.push(action as EventPresentationAction);
    else executeEventStateAction(tx, action, 'dialogue', FAILURES);
  };
  for (const action of actions) execute(action);
  if (presentation.length > 0) tx.emit({ t: 'world/eventPresented',
    payload: { eventId: sourceId, steps: presentation } as unknown as JsonValue });
});
