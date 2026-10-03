import { InkJsDialogueBridge, dialogueStateFromSession, sessionFromDialogue } from '../dialogue';
import type { GameState } from '../state';
import type { CommandHandler, CoreContent, DialogueCommand,
  QuestChoiceCommand, RulesCommand } from '.';

const DIFFICULTIES = new Set(['diff_jianghu', 'diff_xiake', 'diff_zongshi']);
const PROLOGUE_OPTIONS = new Set(['full', 'summary', 'skip']);
const PROLOGUE_ROUTES = {
  full: { routeNodeId: 'n_c01', completionNodeId: 'n_full_complete',
    receipt: 'dc_00_01/full/settled' },
  summary: { routeNodeId: 'n_summary', completionNodeId: 'n_summary_complete',
    receipt: 'dc_00_01/summary/settled' },
  skip: { routeNodeId: 'n_skip_direct', completionNodeId: 'n_skip_complete',
    receipt: 'dc_00_01/skip/settled' },
} as const;
const PROLOGUE_EXIT = 'first_sleep_to_baima' as const;
const PROLOGUE_EXIT_RECEIPT = 'dc_00_01/first_sleep_to_baima';
function story(content: CoreContent, storyId: string) {
  return content.inkStories?.find((entry) => entry.storyId === storyId);
}
function bridge(content: CoreContent): InkJsDialogueBridge {
  return new InkJsDialogueBridge((storyId) => {
    const entry = story(content, storyId);
    if (!entry) throw new Error('DIALOGUE_STORY_UNKNOWN');
    return entry.storyJson;
  });
}
function history(state: NonNullable<GameState['dialogue']>) {
  const previous = state.history ?? []; const textKey = state.textKey ?? null;
  return textKey === null ? previous : [...previous,
    { speakerId: state.speakerId ?? 'narrator', textKey }];
}
function assertStoryHash(state: NonNullable<GameState['dialogue']>, content: CoreContent): void {
  if (story(content, state.storyId)?.storyHash !== state.storyHash)
    throw new TypeError('DIALOGUE_STORY_HASH');
}

export const difficultyHandler: CommandHandler<RulesCommand> = {
  validate(state, command) {
    if (!DIFFICULTIES.has(command.difficulty)) return 'RULES_DIFFICULTY_INVALID';
    if (state.battle !== null) return 'RULES_BATTLE_ACTIVE';
    return null;
  },
  apply(tx, command) {
    const current = tx.state.profile.replayRules;
    if (!current) throw new TypeError('RULES_STATE_MISSING');
    const revision = current.ruleRevision + 1;
    tx.set(['profile', 'replayRules'], { ...current, difficulty: command.difficulty,
      ruleRevision: revision, difficultyLog: [...current.difficultyLog,
        { difficulty: command.difficulty, worldTick: tx.state.meta.worldTick, revision }] });
    tx.emit({ t: 'rules/changed', payload: { from: current.difficulty,
      difficulty: command.difficulty, worldTick: tx.state.meta.worldTick, revision } });
  },
};

export const dialogueHandler: CommandHandler<DialogueCommand> = {
  validate(state, command, content) {
    if (command.t === 'dialogue/start') {
      if (state.dialogue !== null) return 'DIALOGUE_ACTIVE';
      if (!story(content, command.storyId)) return 'DIALOGUE_STORY_UNKNOWN';
      return null;
    }
    if (state.dialogue === null) return 'DIALOGUE_INACTIVE';
    assertStoryHash(state.dialogue, content);
    if (command.t === 'dialogue/continue') {
      const restored = bridge(content).restore(state.dialogue.storyId, state.dialogue.storyJsonState);
      if (restored.canContinue) return null;
      return (state.dialogue.choices ?? []).length === 0
        ? null : 'DIALOGUE_CONTINUE_UNAVAILABLE';
    }
    return (state.dialogue.choices ?? []).some((choice) => choice.choiceIndex === command.choiceIndex &&
      choice.unavailableReason === null) ? null : 'DIALOGUE_CHOICE_UNAVAILABLE';
  },
  apply(tx, command) {
    const adapter = bridge(tx.content);
    if (command.t === 'dialogue/start') {
      const definition = story(tx.content, command.storyId)!;
      const randomSeed = tx.rng('world').nextU32();
      const session = adapter.start(command.storyId, command.entryKey, randomSeed);
      tx.set(['dialogue'], dialogueStateFromSession({ storyId: command.storyId,
        storyHash: definition.storyHash, entryKey: command.entryKey, randomSeed, session }));
      tx.emit({ t: 'dialogue/started', payload: { storyId: command.storyId,
        entryKey: command.entryKey } });
      return;
    }
    const current = tx.state.dialogue!;
    const restored = sessionFromDialogue(current);
    if (command.t === 'dialogue/continue' && !adapter.restore(
      current.storyId, current.storyJsonState).canContinue) {
      tx.set(['dialogue'], null);
      tx.emit({ t: 'dialogue/completed', payload: { storyId: current.storyId } });
      return;
    }
    const next = command.t === 'dialogue/continue'
      ? adapter.continue!(restored) : adapter.choose(restored, String(command.choiceIndex));
    const complete = !next.canContinue && next.choices.length === 0 && next.lines.length === 0;
    tx.set(['dialogue'], complete ? null : dialogueStateFromSession({ storyId: current.storyId,
      storyHash: current.storyHash, entryKey: current.entryKey, randomSeed: current.randomSeed,
      session: next, history: history(current) }));
    if (command.t === 'dialogue/choose')
      tx.emit({ t: 'dialogue/choiceCommitted', payload: { storyId: current.storyId,
        choiceIndex: command.choiceIndex } });
    if (complete)
      tx.emit({ t: 'dialogue/completed', payload: { storyId: current.storyId } });
    else if (command.t === 'dialogue/continue')
      tx.emit({ t: 'dialogue/continued', payload: { storyId: current.storyId } });
  },
};

export const questChoiceHandler: CommandHandler<QuestChoiceCommand> = {
  validate(state, command) {
    if (state.chapter.chapterId !== 'ch00_yuenv' || command.questId !== 'dc_00_01' ||
        !PROLOGUE_OPTIONS.has(command.optionId) ||
        (command.phase !== undefined && command.phase !== 'select' && command.phase !== 'settle'))
      return 'QUEST_CHOICE_UNKNOWN';
    const mode = command.optionId as keyof typeof PROLOGUE_ROUTES;
    const prologue = state.chapter.prologue;
    if ((command.phase ?? 'select') === 'select') {
      if (command.completionNodeId !== undefined) return 'QUEST_ROUTE_MISMATCH';
      return (prologue?.mode ?? null) === null ? null : 'QUEST_CHOICE_COMMITTED';
    }
    if ((prologue?.mode ?? null) === null) return 'QUEST_ROUTE_NOT_SELECTED';
    if (prologue?.mode !== mode || command.completionNodeId !== PROLOGUE_ROUTES[mode].completionNodeId)
      return 'QUEST_ROUTE_MISMATCH';
    return (prologue.exitKey ?? null) === null ? null : 'QUEST_CHOICE_COMMITTED';
  },
  apply(tx, command) {
    const mode = command.optionId as keyof typeof PROLOGUE_ROUTES;
    const route = PROLOGUE_ROUTES[mode];
    if ((command.phase ?? 'select') === 'settle') {
      tx.set(['chapter', 'prologue'], { mode, routeNodeId: route.routeNodeId,
        completionNodeId: route.completionNodeId, exitKey: PROLOGUE_EXIT,
        receipts: [route.receipt, PROLOGUE_EXIT_RECEIPT] });
      tx.emit({ t: 'story/prologueRouteSettled', payload: { mode,
        completionNodeId: route.completionNodeId, routeReceipt: route.receipt,
        exitReceipt: PROLOGUE_EXIT_RECEIPT,
        exitKey: PROLOGUE_EXIT } });
      return;
    }
    tx.set(['chapter', 'prologue'], { mode, routeNodeId: route.routeNodeId,
      completionNodeId: null, exitKey: null, receipts: [] });
    tx.emit({ t: 'story/choiceCommitted', payload: { questId: command.questId, optionId: mode } });
    tx.emit({ t: 'story/prologueRouteSelected', payload: { mode, nextNodeId: route.routeNodeId } });
  },
};
