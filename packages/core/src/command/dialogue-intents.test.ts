/// <reference types="node" />
// eslint-disable-next-line no-restricted-imports -- test-only SHA-256 oracle.
import { createHash } from 'node:crypto';
import { Compiler } from 'inkjs/full';
import { describe, expect, it } from 'vitest';
import type { QuestDef } from '@tianshu/data/schemas';
import { createCore, createNewGameState, type Core, type CoreContent } from '..';

const identity = { name: '沈砚', gender: 'female', appearance: 'hero_f01',
  pronoun: '她', originId: 'origin_wenshiguan' };
const item = (id: string, stack = 99) =>
  ({ id, kind: 'material', grade: 1, stack } as NonNullable<CoreContent['items']>[number]);
const quest: QuestDef = {
  schemaVersion: 'quest.v1', id: 'q_00_main_c_01', kind: 'main', chapterId: 'ch00_yuenv',
  titleKey: 'quest.fixture', subjectNpcIds: [], routeTone: 'neutral', startStageId: 'st_start',
  flagIds: ['fl_ready'], encounterIds: [], stages: [
    { id: 'st_start', objectiveKeys: [], objectives: [], effects: [], transitions: [
      { id: 'edge_reward', priority: 10, when: { flag: { id: 'fl_ready', is: true } },
        to: 'st_reward', branchKey: 'reward' },
    ] },
    { id: 'st_reward', objectiveKeys: [], objectives: [], transitions: [],
      effects: [{ id: 'fx_reward', op: 'reward/item', itemId: 'it_reward', count: 1 }],
      terminal: 'completed', endingKey: 'done' },
  ], tracking: { defaultTracked: true, revealPolicy: 'known_only' },
  source: { origin: 'expanded', note: 'test' },
};
function compiled(source: string): string | Readonly<Record<string, unknown>> {
  const output = new Compiler(source).Compile().ToJson();
  if (typeof output !== 'string') throw new TypeError('INK_FIXTURE');
  return output;
}
function content(source: string, includeQuest = true): CoreContent {
  return { items: [item('it_seed'), item('it_reward')],
    ...(includeQuest ? { quests: [quest] } : {}), inkStories: [{ storyId: 'story_intents',
      storyHash: 'd'.repeat(64), storyJson: compiled(source) }] };
}
function state() {
  return createNewGameState({ masterSeed: 20261003, identity, difficulty: 'diff_xiake' });
}
function hash(core: Core): string {
  return createHash('sha256').update(core.canonicalStateJson()).digest('hex');
}
const CHAIN = `=== opening ===
#ts:party/giveItem item=it_seed count=2
#ts:flag/set flagId=fl_ready value=true
ink.story_intents.text.0000
#ts:party/takeItem item=it_seed count=1
ink.story_intents.text.0001
#ts:quest/advance quest=q_00_main_c_01 stage=st_reward
ink.story_intents.text.0002
#ts:world/openEntrance entranceId=ent_fixture
ink.story_intents.text.0003
#ts:save/autosave reason=dialogue_fixture
#ts:ui/openAllocation mode=manual
#ts:ui/showTitleCard card=fixture_card
#ts:battle/start encounter=enc_fixture
ink.story_intents.text.0004
-> END`;

function runChain(): { readonly core: Core; readonly events: readonly string[] } {
  const supplied = content(CHAIN); const core = createCore(20261003, { state: state(), content: supplied });
  const events: string[] = [];
  for (const command of [{ t: 'dialogue/start', storyId: 'story_intents', entryKey: 'opening' },
    { t: 'dialogue/continue' }, { t: 'dialogue/continue' }, { t: 'dialogue/continue' },
    { t: 'dialogue/continue' }] as const) {
    const result = core.dispatch(command);
    if (!result.ok) throw new TypeError(result.reason);
    events.push(...result.events.map((event) => event.t));
  }
  return { core, events };
}

describe('DialogueIntent commit', () => {
  it('executes a source-ordered Ink chain through the shared action executor', () => {
    const { core, events } = runChain(); const snapshot = core.snapshot();
    expect(snapshot.party.inventory.stacks).toEqual([
      { itemId: 'it_reward', count: 1 }, { itemId: 'it_seed', count: 1 },
    ]);
    expect(snapshot.profile.replayRules?.switches).toMatchObject({ fl_ready: true, ent_fixture: true });
    expect(snapshot.chapter.story.lines).toMatchObject([{ lineId: 'q_00_main_c_01',
      status: 'completed', activeNodeIds: [], completedNodeIds: ['st_start', 'st_reward'],
      appliedEffectIds: ['q_00_main_c_01/st_reward/fx_reward'] }]);
    expect(events).toContain('quest/succeeded');
    expect(events).toContain('world/entranceOpened');
    expect(events).toContain('world/autosaveRequested');
    expect(events).toContain('world/battleRequested');
    const completed = core.dispatch({ t: 'dialogue/continue' });
    expect(completed.ok).toBe(true); expect(core.snapshot().dialogue).toBeNull();
  });

  it('publishes allocation/title-card in order and battle as a separate request', () => {
    const supplied = content(CHAIN); const core = createCore(20261003, { state: state(), content: supplied });
    const results = [{ t: 'dialogue/start', storyId: 'story_intents', entryKey: 'opening' },
      { t: 'dialogue/continue' }, { t: 'dialogue/continue' }, { t: 'dialogue/continue' },
      { t: 'dialogue/continue' }].map((command) => core.dispatch(command as never));
    const events = results.flatMap((result) => result.ok ? result.events : []);
    expect(events.find((event) => event.t === 'world/eventPresented')?.payload).toEqual({
      eventId: 'dialogue:story_intents', steps: [
        { op: 'ui/openAllocation', mode: 'manual' },
        { op: 'ui/showTitleCard', card: 'fixture_card' },
      ],
    });
    expect(events.find((event) => event.t === 'world/battleRequested')?.payload).toEqual({
      anchorId: 'dialogue', encounterId: 'enc_fixture',
    });
  });

  it('rejects current-snapshot inventory failure and rolls Ink plus prior actions back', () => {
    const supplied = content(`=== opening ===
#ts:flag/set flagId=fl_should_rollback value=true
#ts:party/takeItem item=it_seed count=1
ink.story_intents.text.0000
-> END`);
    const core = createCore(20261003, { state: state(), content: supplied });
    const before = hash(core);
    expect(core.dispatch({ t: 'dialogue/start', storyId: 'story_intents', entryKey: 'opening' }))
      .toEqual({ ok: false, reason: 'DIALOGUE_INTENT_INVENTORY' });
    expect(hash(core)).toBe(before);
    expect(core.snapshot().dialogue).toBeNull();
    expect(core.snapshot().profile.replayRules?.switches['fl_should_rollback']).toBeUndefined();
  });

  it('rejects a quest intent when its definition or current transition is unavailable', () => {
    const source = `=== opening ===
#ts:quest/advance quest=q_00_main_c_01 stage=st_reward
ink.story_intents.text.0000
-> END`;
    const missing = createCore(20261003, { state: state(), content: content(source, false) });
    expect(missing.dispatch({ t: 'dialogue/start', storyId: 'story_intents', entryKey: 'opening' }))
      .toEqual({ ok: false, reason: 'DIALOGUE_INTENT_QUEST' });
    const gated = createCore(20261003, { state: state(), content: content(source) });
    expect(gated.dispatch({ t: 'dialogue/start', storyId: 'story_intents', entryKey: 'opening' }))
      .toEqual({ ok: false, reason: 'DIALOGUE_INTENT_QUEST' });
  });

  it('rejects recursive quest effects atomically', () => {
    const recursive: QuestDef = { ...quest, stages: quest.stages.map((stage) =>
      stage.id !== 'st_reward' ? stage : { ...stage, effects: [{ id: 'fx_loop',
        op: 'quest/advance', questId: quest.id, toStage: 'st_reward' }] }) };
    const source = `=== opening ===
#ts:flag/set flagId=fl_ready value=true
#ts:quest/advance quest=q_00_main_c_01 stage=st_reward
ink.story_intents.text.0000
-> END`;
    const supplied = { ...content(source), quests: [recursive] };
    const core = createCore(20261003, { state: state(), content: supplied });
    const before = hash(core);
    expect(core.dispatch({ t: 'dialogue/start', storyId: 'story_intents', entryKey: 'opening' }))
      .toEqual({ ok: false, reason: 'DIALOGUE_INTENT_QUEST' });
    expect(hash(core)).toBe(before);
  });

  it('executes a selected choice tag, but never an unselected choice tag', () => {
    const supplied = content(`=== opening ===
Choose.
* [Take #ts:party/giveItem item=it_seed count=1]
  Taken.
  -> END
* [Leave #ts:flag/set flagId=fl_left value=true]
  Left.
  -> END`);
    const core = createCore(20261003, { state: state(), content: supplied });
    expect(core.dispatch({ t: 'dialogue/start', storyId: 'story_intents', entryKey: 'opening' }).ok)
      .toBe(true);
    expect(core.snapshot().party.inventory.stacks).toEqual([]);
    const chosen = core.dispatch({ t: 'dialogue/choose', choiceIndex: 0 });
    expect(chosen.ok).toBe(true);
    expect(core.snapshot().party.inventory.stacks).toEqual([{ itemId: 'it_seed', count: 1 }]);
    expect(core.snapshot().profile.replayRules?.switches['fl_left']).toBeUndefined();
  });

  it('evaluates Ink externals from the current command snapshot without mutating it', () => {
    const source = `EXTERNAL get_flag(id)
EXTERNAL has_item(id)
EXTERNAL quest_stage(id)
EXTERNAL affinity(id)
=== opening ===
{get_flag("fl_ready") && has_item("it_seed") && quest_stage("q_00_main_c_01") == "st_start" && affinity("npc_friend") >= 20:
Allowed.
- else:
Blocked.
}
-> END`;
    const initial = state();
    Object.assign(initial.profile.replayRules!.switches, { fl_ready: true });
    Object.assign(initial.party, { inventory: { stacks: [{ itemId: 'it_seed', count: 1 }] } });
    const withFacts = { ...initial, chapter: { ...initial.chapter, npcs: [
      ...initial.chapter.npcs, { npcId: 'npc_friend', relationship: 'met' as const,
        affinity: 20, character: null },
    ] } };
    const core = createCore(20261003, { state: withFacts, content: content(source) });
    expect(core.dispatch({ t: 'dialogue/start', storyId: 'story_intents', entryKey: 'opening' }).ok)
      .toBe(true);
    expect(core.snapshot().dialogue?.textKey).toBe('Allowed.');
    expect(core.snapshot().party.inventory.stacks).toEqual([{ itemId: 'it_seed', count: 1 }]);
  });

  it('keeps consumed receipts across restore and skips a duplicate queued tag', () => {
    const supplied = content(CHAIN); const first = createCore(20261003, { state: state(), content: supplied });
    expect(first.dispatch({ t: 'dialogue/start', storyId: 'story_intents', entryKey: 'opening' }).ok)
      .toBe(true);
    const saved = first.snapshot(); const receipt = saved.dialogue!.consumedTagKeys[0]!;
    const duplicate = saved.dialogue!.pendingIntents[0] ?? { key: receipt,
      action: { op: 'party/giveItem', item: 'it_seed', count: 2 } };
    const restoredState = { ...saved, dialogue: { ...saved.dialogue!,
      pendingIntents: [{ ...(duplicate as object), key: receipt } as never] } };
    const restored = createCore(20261003, { state: restoredState, content: supplied });
    expect(restored.dispatch({ t: 'dialogue/continue' }).ok).toBe(true);
    expect(restored.snapshot().party.inventory.stacks.find((row) => row.itemId === 'it_seed')?.count)
      .toBe(1);
  });

  it('produces one final hash over 100 identical runs', () => {
    const expected = hash(runChain().core);
    for (let index = 0; index < 100; index += 1) expect(hash(runChain().core)).toBe(expected);
  });
});
