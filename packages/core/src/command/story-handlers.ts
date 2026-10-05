import { InkJsDialogueBridge, dialogueStateFromSession,
  inkExternalQuery, sessionFromDialogue } from '../dialogue';
import { authorizedDialogueIntents, dialogueQuests } from '../dialogue/intent-actions';
import { executeDialogueActions } from '../event';
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
function bridge(content: CoreContent, state: Readonly<GameState>): InkJsDialogueBridge {
  return new InkJsDialogueBridge((storyId) => {
    const entry = story(content, storyId);
    if (!entry) throw new Error('DIALOGUE_STORY_UNKNOWN');
    return entry.storyJson;
  }, inkExternalQuery(state, dialogueQuests(content)));
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
function commitDialogueIntents(tx: Parameters<typeof dialogueHandler.apply>[0],
  state: NonNullable<GameState['dialogue']>): readonly string[] {
  const consumed = new Set(state.consumedTagKeys);
  const queued = new Set<string>();
  const pending = authorizedDialogueIntents(state).filter((intent) => {
    if (consumed.has(intent.key) || queued.has(intent.key)) return false;
    queued.add(intent.key); return true;
  });
  if (pending.length === 0) return [...consumed];
  const actions = pending.map((intent) => intent.action).filter((action) =>
    action.op !== 'dialogue/speaker');
  if (actions.length > 0) executeDialogueActions(tx, actions, `dialogue:${state.storyId}`);
  for (const intent of pending) consumed.add(intent.key);
  return [...consumed];
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
      const restored = bridge(content, state).restore(
        state.dialogue.storyId, state.dialogue.storyJsonState);
      if (restored.canContinue) return null;
      return (state.dialogue.choices ?? []).length === 0
        ? null : 'DIALOGUE_CONTINUE_UNAVAILABLE';
    }
    return (state.dialogue.choices ?? []).some((choice) => choice.choiceIndex === command.choiceIndex &&
      choice.unavailableReason === null) ? null : 'DIALOGUE_CHOICE_UNAVAILABLE';
  },
  apply(tx, command) {
    const adapter = bridge(tx.content, tx.state);
    if (command.t === 'dialogue/start') {
      const definition = story(tx.content, command.storyId)!;
      const randomSeed = tx.rng('world').nextU32();
      const session = adapter.start(command.storyId, command.entryKey, randomSeed);
      const next = dialogueStateFromSession({ storyId: command.storyId,
        storyHash: definition.storyHash, entryKey: command.entryKey, randomSeed, session });
      tx.set(['dialogue'], next);
      tx.emit({ t: 'dialogue/started', payload: { storyId: command.storyId,
        entryKey: command.entryKey } });
      const consumedTagKeys = commitDialogueIntents(tx, next);
      tx.set(['dialogue', 'pendingIntents'], []);
      tx.set(['dialogue', 'consumedTagKeys'], consumedTagKeys);
      return;
    }
    const current = tx.state.dialogue!;
    const restored = sessionFromDialogue(current);
    if (command.t === 'dialogue/continue' && !adapter.restore(
      current.storyId, current.storyJsonState).canContinue) {
      tx.emit({ t: 'dialogue/completed', payload: { storyId: current.storyId } });
      commitDialogueIntents(tx, current);
      tx.set(['dialogue'], null);
      return;
    }
    const next = command.t === 'dialogue/continue'
      ? adapter.continue!(restored) : adapter.choose(restored, String(command.choiceIndex));
    const complete = !next.canContinue && next.choices.length === 0 && next.lines.length === 0;
    const projected = dialogueStateFromSession({ storyId: current.storyId,
      storyHash: current.storyHash, entryKey: current.entryKey, randomSeed: current.randomSeed,
      session: next, history: history(current), pendingIntents: current.pendingIntents,
      consumedTagKeys: current.consumedTagKeys });
    tx.set(['dialogue'], projected);
    if (command.t === 'dialogue/choose')
      tx.emit({ t: 'dialogue/choiceCommitted', payload: { storyId: current.storyId,
        choiceIndex: command.choiceIndex } });
    else if (!complete)
      tx.emit({ t: 'dialogue/continued', payload: { storyId: current.storyId } });
    const consumedTagKeys = commitDialogueIntents(tx, projected);
    tx.set(['dialogue'], complete ? null : { ...projected, pendingIntents: [], consumedTagKeys });
    if (complete)
      tx.emit({ t: 'dialogue/completed', payload: { storyId: current.storyId } });
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
      const progression = tx.state.profile.progression!;
      const receipt = 'aqing_transmission/layer_1';
      tx.set(['chapter', 'prologue'], { mode, routeNodeId: route.routeNodeId,
        completionNodeId: route.completionNodeId, exitKey: PROLOGUE_EXIT,
        receipts: [route.receipt, PROLOGUE_EXIT_RECEIPT] });
      tx.emit({ t: 'story/prologueRouteSettled', payload: { mode,
        completionNodeId: route.completionNodeId, routeReceipt: route.receipt,
        exitReceipt: PROLOGUE_EXIT_RECEIPT,
        exitKey: PROLOGUE_EXIT } });
      tx.set(['profile', 'progression'], {
        ...progression, changshengLayer: Math.max(1, progression.changshengLayer),
        changshengLayerReceipts: progression.changshengLayerReceipts.includes(receipt)
          ? progression.changshengLayerReceipts
          : [...progression.changshengLayerReceipts, receipt],
        prologueModeReceipt: { mode, routeNodeId: route.routeNodeId,
          completionNodeId: route.completionNodeId, exitKey: PROLOGUE_EXIT,
          receipts: [route.receipt, PROLOGUE_EXIT_RECEIPT] },
      });
      tx.set(['profile', 'protagonist', 'skills'], []);
      return;
    }
    tx.set(['chapter', 'prologue'], { mode, routeNodeId: route.routeNodeId,
      completionNodeId: null, exitKey: null, receipts: [] });
    tx.emit({ t: 'story/choiceCommitted', payload: { questId: command.questId, optionId: mode } });
    tx.emit({ t: 'story/prologueRouteSelected', payload: { mode, nextNodeId: route.routeNodeId } });
  },
};
