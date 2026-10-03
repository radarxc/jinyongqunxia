import type { GameState } from '../state';
import type { DialogueSession } from '.';

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
  readonly history?: DialogueView['history'] }): NonNullable<GameState['dialogue']> {
  if (input.session.mode !== 'ink' || input.session.serializedState === undefined)
    throw new TypeError('DIALOGUE_SESSION_INVALID');
  const line = input.session.lines[0];
  return { storyId: input.storyId, storyHash: input.storyHash, entryKey: input.entryKey,
    storyJsonState: input.session.serializedState, randomSeed: input.randomSeed,
    pendingIntents: [], consumedTagKeys: [], speakerId: line?.speakerId ?? 'narrator',
    textKey: line ? textKey(line.textKey) : null, choices: input.session.choices.map((choice) => ({
      choiceIndex: Number(choice.key), textKey: textKey(choice.textKey), unavailableReason: null,
    })), history: input.history ?? [] };
}

export function dialogueStateWithLegacyDefaults(state: NonNullable<GameState['dialogue']>):
NonNullable<GameState['dialogue']> {
  return { ...state, speakerId: state.speakerId ?? 'narrator', textKey: state.textKey ?? null,
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
