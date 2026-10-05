import type { EventAction } from '@tianshu/data/schemas';
import type { JsonValue } from '@tianshu/shared';
import type { GameState } from '../state';
import type { DialogueSession } from '.';

export interface AuthorizedDialogueIntent {
  readonly key: string;
  readonly action: EventAction;
}

// Keep this module limited to serializable dialogue state. Runtime validation of
// an intent's action belongs to intent-actions.ts, which is reached only through
// the dialogue command entry and therefore stays outside the first-session graph.

export interface DialogueChoiceView { readonly choiceIndex: number; readonly textKey: string;
  readonly unavailableReason: string | null }
export interface DialogueView {
  readonly storyId: string; readonly storyHash: string; readonly entryKey: string;
  readonly speakerId: string; readonly textKey: string | null;
  readonly choices: readonly DialogueChoiceView[];
  readonly history: readonly { readonly speakerId: string; readonly textKey: string }[];
}
function textKey(value: string): string {
  return value.replace(/(?:\r\n|\n|\r)$/u, '');
}

export function dialogueStateFromSession(input: { readonly storyId: string; readonly storyHash: string;
  readonly entryKey: string; readonly randomSeed: number; readonly session: DialogueSession;
  readonly anchorId?: string;
  readonly history?: DialogueView['history']; readonly pendingIntents?: readonly JsonValue[];
  readonly consumedTagKeys?: readonly string[] }): NonNullable<GameState['dialogue']> {
  if (input.session.mode !== 'ink' || input.session.serializedState === undefined)
    throw new TypeError('DIALOGUE_SESSION_INVALID');
  const line = input.session.lines[0];
  const pending = [...(input.pendingIntents ?? []), ...(input.session.intents ?? []).map((intent) => ({
    key: `${input.storyHash}:${intent.sourcePath}:${intent.visitCounter}:${intent.tagOrdinal}`,
    action: intent.action,
  }) as unknown as JsonValue)];
  return { storyId: input.storyId, storyHash: input.storyHash, entryKey: input.entryKey,
    ...(input.anchorId === undefined ? {} : { anchorId: input.anchorId }),
    storyJsonState: input.session.serializedState, randomSeed: input.randomSeed,
    pendingIntents: pending, consumedTagKeys: input.consumedTagKeys ?? [],
    speakerId: line?.speakerId ?? 'narrator',
    textKey: line ? textKey(line.textKey) : null, choices: input.session.choices.map((choice) => ({
      choiceIndex: Number(choice.key), textKey: textKey(choice.textKey), unavailableReason: null,
    })), history: input.history ?? [] };
}

export function dialogueStateWithLegacyDefaults(state: NonNullable<GameState['dialogue']>):
NonNullable<GameState['dialogue']> {
  return { ...state, speakerId: state.speakerId ?? 'narrator', textKey: state.textKey ?? null,
    pendingIntents: state.pendingIntents ?? [], consumedTagKeys: state.consumedTagKeys ?? [],
    choices: state.choices ?? [], history: state.history ?? [] };
}

export function sessionFromDialogue(state: NonNullable<GameState['dialogue']>): DialogueSession {
  return { mode: 'ink', storyId: state.storyId, knot: state.entryKey, lines: [],
    choices: (state.choices ?? []).map((choice) => ({ key: String(choice.choiceIndex),
      textKey: choice.textKey })), canContinue: state.textKey !== null,
    serializedState: state.storyJsonState };
}

export function projectDialogue(state: Readonly<GameState>): DialogueView | null {
  const dialogue = state.dialogue;
  if (!dialogue) return null;
  return { storyId: dialogue.storyId, storyHash: dialogue.storyHash,
    entryKey: dialogue.entryKey, speakerId: dialogue.speakerId ?? 'narrator',
    textKey: dialogue.textKey ?? null, choices: dialogue.choices ?? [],
    history: dialogue.history ?? [] };
}
