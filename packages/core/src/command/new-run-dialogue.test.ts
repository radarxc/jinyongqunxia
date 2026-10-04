/// <reference types="node" />
// eslint-disable-next-line no-restricted-imports -- test-only SHA-256 oracle.
import { createHash } from 'node:crypto';
import { Compiler } from 'inkjs/full';
import { describe, expect, it } from 'vitest';
import { createBattleSession } from '../battle';
import { battleSeed, combatFixture } from '../testing/combat-fixture';
import { createCore, createNewGameState, projectDialogue, type CoreContent,
  type DifficultyId, type NewGameInput } from '..';

const identity: NewGameInput['identity'] = {
  name: '沈砚', gender: 'female', appearance: 'hero_f01',
  pronoun: '她', originId: 'origin_wenshiguan',
};
const newGame = (difficulty: DifficultyId = 'diff_xiake') =>
  createNewGameState({ masterSeed: 271828, identity, difficulty });

function dialogueContent(): CoreContent {
  const source = `=== opening ===
# ts:dialogue/speaker speaker=npc_shuling
ink.story_fixture.text.0000
ink.story_fixture.text.0001
+ [ink.story_fixture.text.0002]
  -> answer
=== answer ===
# ts:dialogue/speaker speaker=player
ink.story_fixture.text.0003
-> END`;
  const storyJson = new Compiler(source).Compile().ToJson();
  if (typeof storyJson !== 'string') throw new TypeError('INK_FIXTURE');
  return { inkStories: [{ storyId: 'story_fixture', storyHash: 'a'.repeat(64), storyJson }] };
}
function terminalChoiceContent(): CoreContent {
  const storyJson = new Compiler(`=== opening ===
ink.story_terminal.text.0000
+ [ink.story_terminal.text.0001]
  -> END`).Compile().ToJson();
  if (typeof storyJson !== 'string') throw new TypeError('INK_FIXTURE');
  return { inkStories: [{ storyId: 'story_terminal', storyHash: 'c'.repeat(64), storyJson }] };
}

describe('new run and story command contracts', () => {
  it('creates the same canonical ch00 state from the same identity and seed', () => {
    const first = createCore(271828, { state: newGame() });
    const repeated = createCore(271828, { state: newGame() });
    expect(repeated.canonicalStateJson()).toBe(first.canonicalStateJson());
    expect(createHash('sha256').update(repeated.canonicalStateJson()).digest('hex'))
      .toBe(createHash('sha256').update(first.canonicalStateJson()).digest('hex'));
    expect(first.snapshot()).toMatchObject({
      meta: { masterSeed: 271828 }, chapter: { chapterId: 'ch00_yuenv', worldYear: -482 },
      world: { navigation: { locationId: 'sc_00_zhulin' } },
      profile: { identity, protagonist: { characterId: 'npc_zhujue',
        innate: { luk: 50, cha: 50 } }, replayRules: { difficulty: 'diff_xiake' } },
    });
  });

  it('rejects an out-of-range host seed and an unknown modern origin', () => {
    expect(() => createNewGameState({ masterSeed: -1, identity, difficulty: 'diff_xiake' }))
      .toThrow('NEW_GAME_SEED');
    expect(() => createNewGameState({ masterSeed: 1,
      identity: { ...identity, originId: 'origin_unknown' }, difficulty: 'diff_xiake' }))
      .toThrow('NEW_GAME_ORIGIN');
  });

  it('changes difficulty outside battle, logs it, and rejects it in battle', () => {
    const runtime = createCore(271828, { state: newGame() });
    const changed = runtime.dispatch({ t: 'rules/setDifficulty', difficulty: 'diff_zongshi' });
    expect(changed).toMatchObject({ ok: true, events: [{ t: 'rules/changed', payload: {
      from: 'diff_xiake', difficulty: 'diff_zongshi', worldTick: 0, revision: 2,
    } }] });
    expect(runtime.snapshot().profile.replayRules).toMatchObject({ difficulty: 'diff_zongshi',
      ruleRevision: 2, difficultyLog: [
        { difficulty: 'diff_xiake', worldTick: 0, revision: 1 },
        { difficulty: 'diff_zongshi', worldTick: 0, revision: 2 },
      ] });
    const state = runtime.snapshot();
    const fixture = combatFixture();
    const battle = createBattleSession(fixture.setup, fixture.units.map((unit) =>
      battleSeed(unit.id, unit.moves)));
    const fighting = createCore(271828, { state: { ...state, battle } });
    const before = fighting.canonicalStateJson();
    expect(fighting.dispatch({ t: 'rules/setDifficulty', difficulty: 'diff_jianghu' }))
      .toEqual({ ok: false, reason: 'RULES_BATTLE_ACTIVE' });
    expect(fighting.canonicalStateJson()).toBe(before);
  });

  it('runs start, continue and choice one presentation step at a time', () => {
    const runtime = createCore(271828, { state: newGame(), content: dialogueContent() });
    const started = runtime.dispatch({ t: 'dialogue/start', storyId: 'story_fixture',
      entryKey: 'opening' });
    expect(started.ok && started.events).toMatchObject([{ t: 'dialogue/started',
      payload: { storyId: 'story_fixture', entryKey: 'opening' } }]);
    expect(projectDialogue(runtime.snapshot())).toMatchObject({ speakerId: 'npc_shuling',
      textKey: 'ink.story_fixture.text.0000', choices: [], history: [] });
    expect(runtime.dispatch({ t: 'world/tick' })).toEqual({ ok: false, reason: 'WORLD_PAUSED' });
    const continued = runtime.dispatch({ t: 'dialogue/continue' });
    expect(continued.ok && continued.events).toMatchObject([{ t: 'dialogue/continued',
      payload: { storyId: 'story_fixture' } }]);
    expect(projectDialogue(runtime.snapshot())).toMatchObject({ speakerId: 'narrator',
      textKey: 'ink.story_fixture.text.0001', history: [
        { speakerId: 'npc_shuling', textKey: 'ink.story_fixture.text.0000' },
      ], choices: [{ choiceIndex: 0, textKey: 'ink.story_fixture.text.0002', unavailableReason: null }] });
    const chosen = runtime.dispatch({ t: 'dialogue/choose', choiceIndex: 0 });
    expect(chosen.ok && chosen.events).toMatchObject([{ t: 'dialogue/choiceCommitted',
      payload: { storyId: 'story_fixture', choiceIndex: 0 } }]);
    expect(projectDialogue(runtime.snapshot())).toMatchObject({ speakerId: 'player',
      textKey: 'ink.story_fixture.text.0003' });
    const completed = runtime.dispatch({ t: 'dialogue/continue' });
    expect(completed.ok && completed.events).toMatchObject([{ t: 'dialogue/completed',
      payload: { storyId: 'story_fixture' } }]);
    expect(projectDialogue(runtime.snapshot())).toBeNull();
  });

  it('keeps the committed-choice fact when a choice immediately ends dialogue', () => {
    const runtime = createCore(271828, { state: newGame(), content: terminalChoiceContent() });
    runtime.dispatch({ t: 'dialogue/start', storyId: 'story_terminal', entryKey: 'opening' });
    const result = runtime.dispatch({ t: 'dialogue/choose', choiceIndex: 0 });
    expect(result.ok && result.events).toMatchObject([
      { t: 'dialogue/choiceCommitted', payload: { storyId: 'story_terminal', choiceIndex: 0 } },
      { t: 'dialogue/completed', payload: { storyId: 'story_terminal' } },
    ]);
    expect(projectDialogue(runtime.snapshot())).toBeNull();
  });

  it('raises an internal error and rolls back when saved Ink structure changes', () => {
    const content = dialogueContent();
    const runtime = createCore(271828, { state: newGame(), content });
    runtime.dispatch({ t: 'dialogue/start', storyId: 'story_fixture', entryKey: 'opening' });
    const before = runtime.canonicalStateJson();
    const changed: CoreContent = { inkStories: content.inkStories!.map((entry) =>
      ({ ...entry, storyHash: 'b'.repeat(64) })) };
    const restored = createCore(271828, { state: runtime.snapshot(), content: changed });
    expect(() => restored.dispatch({ t: 'dialogue/continue' }))
      .toThrow('DIALOGUE_STORY_HASH');
    expect(restored.canonicalStateJson()).toBe(before);
  });

  it('rolls dialogue state and RNG back when Ink rejects a choice internally', () => {
    const runtime = createCore(271828, { state: newGame(), content: dialogueContent() });
    runtime.dispatch({ t: 'dialogue/start', storyId: 'story_fixture', entryKey: 'opening' });
    runtime.dispatch({ t: 'dialogue/continue' });
    const state = runtime.snapshot();
    const corrupted = { ...state, dialogue: { ...state.dialogue!, choices: [
      { choiceIndex: 99, textKey: 'ink.bad', unavailableReason: null },
    ] } };
    const restored = createCore(271828, { state: corrupted, content: dialogueContent() });
    const before = restored.canonicalStateJson();
    expect(() => restored.dispatch({ t: 'dialogue/choose', choiceIndex: 99 }))
      .toThrow('INK_CHOICE_UNKNOWN:99');
    expect(restored.canonicalStateJson()).toBe(before);
  });

  it.each([
    ['full', 'n_c01', 'n_full_complete', 'dc_00_01/full/settled'],
    ['summary', 'n_summary', 'n_summary_complete', 'dc_00_01/summary/settled'],
    ['skip', 'n_skip_direct', 'n_skip_complete', 'dc_00_01/skip/settled'],
  ] as const)('settles dc_00_01 %s at the shared exit idempotently',
    (optionId, routeNodeId, completionNodeId, routeReceipt) => {
    const runtime = createCore(271828, { state: newGame() });
    const result = runtime.dispatch({ t: 'quest/choose', questId: 'dc_00_01', optionId });
    expect(result.ok).toBe(true);
    expect(result.ok && result.events[0]).toMatchObject({ t: 'story/choiceCommitted',
      payload: { questId: 'dc_00_01', optionId } });
    expect(result.ok && result.events[1]).toMatchObject({ t: 'story/prologueRouteSelected',
      payload: { mode: optionId, nextNodeId: routeNodeId } });
    expect(runtime.snapshot().chapter.prologue).toEqual({ mode: optionId, routeNodeId,
      completionNodeId: null, exitKey: null, receipts: [] });
    expect(runtime.dispatch({ t: 'quest/choose', questId: 'dc_00_01', optionId }))
      .toEqual({ ok: false, reason: 'QUEST_CHOICE_COMMITTED' });
    const settled = runtime.dispatch({ t: 'quest/choose', questId: 'dc_00_01',
      optionId, phase: 'settle', completionNodeId });
    expect(settled.ok && settled.events).toMatchObject([{ t: 'story/prologueRouteSettled',
      payload: { mode: optionId, completionNodeId, routeReceipt,
        exitReceipt: 'dc_00_01/first_sleep_to_baima', exitKey: 'first_sleep_to_baima' } }]);
    expect(runtime.snapshot().chapter.prologue).toEqual({ mode: optionId, routeNodeId,
      completionNodeId, exitKey: 'first_sleep_to_baima', receipts: [routeReceipt,
        'dc_00_01/first_sleep_to_baima'] });
    const before = runtime.canonicalStateJson();
    expect(runtime.dispatch({ t: 'quest/choose', questId: 'dc_00_01',
      optionId, phase: 'settle', completionNodeId }))
      .toEqual({ ok: false, reason: 'QUEST_CHOICE_COMMITTED' });
    expect(runtime.canonicalStateJson()).toBe(before);
  });

  it('rejects the prologue decision outside ch00', () => {
    const state = newGame();
    const runtime = createCore(271828, { state: { ...state, chapter: { ...state.chapter,
      chapterId: 'ch01_tianlong', story: { ...state.chapter.story, chapterId: 'ch01_tianlong' } } } });
    expect(runtime.dispatch({ t: 'quest/choose', questId: 'dc_00_01', optionId: 'skip' }))
      .toEqual({ ok: false, reason: 'QUEST_CHOICE_UNKNOWN' });
  });

  it('rejects settlement before selection and for another selected route', () => {
    const runtime = createCore(271828, { state: newGame() });
    expect(runtime.dispatch({ t: 'quest/choose', questId: 'dc_00_01', optionId: 'skip',
      phase: 'settle', completionNodeId: 'n_skip_complete' }))
      .toEqual({ ok: false, reason: 'QUEST_ROUTE_NOT_SELECTED' });
    runtime.dispatch({ t: 'quest/choose', questId: 'dc_00_01', optionId: 'full' });
    const before = runtime.canonicalStateJson();
    expect(runtime.dispatch({ t: 'quest/choose', questId: 'dc_00_01', optionId: 'summary',
      phase: 'settle', completionNodeId: 'n_summary_complete' }))
      .toEqual({ ok: false, reason: 'QUEST_ROUTE_MISMATCH' });
    expect(runtime.dispatch({ t: 'quest/choose', questId: 'dc_00_01', optionId: 'full',
      phase: 'settle', completionNodeId: 'n_summary_complete' }))
      .toEqual({ ok: false, reason: 'QUEST_ROUTE_MISMATCH' });
    expect(runtime.canonicalStateJson()).toBe(before);
  });
});
