/// <reference types="node" />
// eslint-disable-next-line no-restricted-imports -- test-only SHA-256 oracle.
import { createHash } from 'node:crypto';
import type { ChapterDef, SkillInstance } from '@tianshu/data/schemas';
import { canonicalJson, floorDivInt, type JsonValue } from '@tianshu/shared';
import { describe, expect, it } from 'vitest';
import { createCoreFromState, createGameClock, createNewGameState, FIRST_SLEEP_RULE,
  migrateBookSleepV2, type BookSleepPlan, type Core, type CoreContent,
  type GameState, type PrologueMode, type SleepAllocation } from '..';
import golden from './book-sleep.golden.json';

const SOURCE_HASH = 'a'.repeat(64);
const TARGET_HASH = 'b'.repeat(64);
const CH00: ChapterDef = { schemaVersion: 'book-world.v1', id: 'ch00_yuenv',
  eraLayerId: 'ch00', gameYear: { start: -482, end: -482, approx: true },
  worldTier: 'LOW', levelCap: 10, layerCap: 9, foreignSuppression: 4, startTick: 0,
  countsRealLevel: false, wake: { regionId: 'rg_jiangnan_taihu',
    sceneId: 'sc_00_zhulin', spawnId: 'bookfall' } };
const CH10: ChapterDef = { schemaVersion: 'book-world.v1', id: 'ch10_baima',
  eraLayerId: 'ch10', gameYear: { start: 702, end: 703, approx: true },
  worldTier: 'LOW', levelCap: 20, layerCap: 8, foreignSuppression: 4, startTick: 0,
  countsRealLevel: true, wake: { regionId: 'rg_xiyu_beijiang',
    sceneId: 'sc_10_fengshi_feiyi', spawnId: 'cold_open' } };
const identity = { name: '沈砚', gender: 'female', appearance: 'hero_f01',
  pronoun: '她', originId: 'origin_wenshiguan' };
const balanced = Object.fromEntries(FIRST_SLEEP_RULE.keys.map((key) =>
  [key, floorDivInt(FIRST_SLEEP_RULE.keys.length * FIRST_SLEEP_RULE.base +
    FIRST_SLEEP_RULE.budget, FIRST_SLEEP_RULE.keys.length)])) as SleepAllocation;
const plan = (overrides: Partial<BookSleepPlan> = {}): BookSleepPlan => ({
  id: '00000000-0000-4000-8000-000000000017', from: CH00.id, to: CH10.id,
  targetTier: 'LOW', sleepEventId: 'slp_first_changbai',
  skills: { martial: [], inner: [] }, convert: { forget: [], dissipate: [] },
  equips: [], sleepAlloc: balanced, acknowledged: [], allocationSource: 'balanced',
  allocationRuleVersion: FIRST_SLEEP_RULE.version, ...overrides,
});
const completion = { full: 'n_full_complete', summary: 'n_summary_complete',
  skip: 'n_skip_complete' } as const;
const content = (target: ChapterDef = CH10): CoreContent => ({
  chapters: [target], targetContentHash: TARGET_HASH,
});
function initial(): GameState {
  const state = createNewGameState({ masterSeed: 271828, identity,
    difficulty: 'diff_xiake', contentHash: SOURCE_HASH, chapter: CH00,
    coreVersion: '0.0.0', coreBuild: '20261002-new-run' });
  const clock = createGameClock('epoch_ch00_yuenv', -482, 123);
  return { ...state, meta: { ...state.meta, worldTick: 123 },
    chapter: { ...state.chapter, worldYear: -482, clock },
    party: { ...state.party, inventory: { stacks: [{ itemId: 'it_tutorial', count: 2 }] },
      equipment: { entries: state.party.equipment.entries.map((entry, index) =>
        index === 0 ? { ...entry, itemId: 'eq_tutorial' } : entry) }, money: 987 } };
}
function settle(mode: PrologueMode, supplied: CoreContent = content()): Core {
  const runtime = createCoreFromState(initial(), supplied);
  expect(runtime.dispatch({ t: 'quest/choose', questId: 'dc_00_01', optionId: mode }).ok)
    .toBe(true);
  expect(runtime.dispatch({ t: 'quest/choose', questId: 'dc_00_01', optionId: mode,
    phase: 'settle', completionNodeId: completion[mode] }).ok).toBe(true);
  return runtime;
}
function tutorialSkill(): SkillInstance {
  return { skillId: 'sk_tutorial_yuenv', sourceGrade: 1, sourceCap: 9, trueLayer: 9,
    sxp: 0, learnedIn: CH00.id, nativeTo: CH00.id, attunedGrade: null, attunedIn: null,
    latentExp: 0, movesEquipped: [], insight: 0, pages: [], flags: ['tutorial'] };
}
function ready(mode: PrologueMode = 'skip', target: ChapterDef = CH10): Core {
  const settled = settle(mode, content(target)).snapshot();
  const protagonist = settled.profile.protagonist!;
  const companion = { ...protagonist, characterId: 'npc_tutorial_companion', skills: [] };
  const state = { ...settled, profile: { ...settled.profile,
    protagonist: { ...protagonist, skills: [tutorialSkill()] }, companions: [companion] },
    chapter: { ...settled.chapter, worldItems: { entries: [{ instanceKey: 'tutorial:1',
      itemId: 'it_tutorial', count: 1, locationId: 'sc_00_yueying',
      collectible: true, pickedUp: false }] }, shops: [{ shopKey: 'shop_tutorial',
      stock: [{ itemId: 'it_tutorial', count: 3, lastRestockDay: 0 }] }],
      npcs: [{ npcId: companion.characterId, relationship: 'met' as const, affinity: 1,
        character: companion }], itemChapterUses: { it_tutorial: 1 } } };
  return createCoreFromState(state, content(target));
}
function hash(state: GameState): string {
  return createHash('sha256').update(canonicalJson(state as unknown as JsonValue)).digest('hex');
}

describe('first-sleep allocation query and validation', () => {
  it('derives the six-key budget and balanced preset without touching RNG', () => {
    const runtime = settle('skip'); const before = runtime.snapshot().meta.rng;
    const query = runtime.firstSleepAllocation(balanced);
    expect(query).toEqual({ ruleVersion: 'first-sleep.v1',
      keys: ['str', 'con', 'bre', 'wis', 'agi', 'wil'], base: 35, min: 20, max: 80,
      budget: 90, requiredTotal: 300, draft: balanced,
      presets: { balanced }, lockedKeys: ['luk', 'cha'] });
    expect(runtime.snapshot().meta.rng).toEqual(before);
  });

  it.each([
    ['wrong total', { ...balanced, str: 49 }],
    ['below range', { str: 19, con: 56, bre: 56, wis: 56, agi: 56, wil: 57 }],
    ['locked key', { ...balanced, luk: 50 }],
    ['seven keys', { ...balanced, extra: 0 }],
  ] as const)('rejects %s allocation without a byte of state or version change', (_, sleepAlloc) => {
    const runtime = ready(); const before = runtime.canonicalStateJson();
    const version = runtime.snapshot().meta.stateVersion;
    expect(runtime.dispatch({ t: 'chapter/bookSleep', plan: plan({ sleepAlloc }) }))
      .toEqual({ ok: false, reason: 'BOOK_SLEEP_ALLOCATION_INVALID' });
    expect(runtime.canonicalStateJson()).toBe(before);
    expect(runtime.snapshot().meta.stateVersion).toBe(version);
  });

  it('rejects malformed transport values instead of throwing or mutating state', () => {
    const runtime = ready(); const before = runtime.canonicalStateJson();
    const malformed = { ...plan(), sleepAlloc: null, acknowledged: [7] } as unknown as BookSleepPlan;
    expect(runtime.dispatch({ t: 'chapter/bookSleep', plan: malformed }))
      .toEqual({ ok: false, reason: 'BOOK_SLEEP_PLAN_INVALID' });
    expect(runtime.canonicalStateJson()).toBe(before);
  });

  it('gates unsupported, busy, not-ready and unavailable-content states atomically', () => {
    const cases: readonly [Core, BookSleepPlan, string][] = [
      [ready(), plan({ to: 'ch01_tianlong' }), 'BOOK_SLEEP_UNSUPPORTED'],
      [createCoreFromState({ ...ready().snapshot(), dialogue: { storyId: 'story_busy',
        storyHash: 'c'.repeat(64), entryKey: 'opening', storyJsonState: '{}', randomSeed: 1,
        pendingIntents: [], consumedTagKeys: [] } }, content()), plan(), 'BOOK_SLEEP_BUSY'],
      [createCoreFromState(initial(), content()), plan(), 'BOOK_SLEEP_NOT_READY'],
      [ready('skip', { ...CH10, worldTier: 'MID' }), plan(), 'BOOK_SLEEP_CONTENT_UNAVAILABLE'],
    ];
    for (const [runtime, value, reason] of cases) {
      const before = runtime.canonicalStateJson();
      expect(runtime.dispatch({ t: 'chapter/bookSleep', plan: value }))
        .toEqual({ ok: false, reason });
      expect(runtime.canonicalStateJson()).toBe(before);
    }
  });
});

describe('ch00 to ch10 book-sleep transaction', () => {
  it('commits the cold entrance atomically, clears chapter assets and emits three facts', () => {
    const runtime = ready(); const before = runtime.snapshot();
    const luck = before.profile.protagonist!.innate.luk;
    const charm = before.profile.protagonist!.innate.cha;
    const result = runtime.dispatch({ t: 'chapter/bookSleep', plan: plan() });
    expect(result.ok && result.events.map((event) => event.t)).toEqual([
      'chapter/bookSleepCommitted', 'world/eraChanged', 'chapter/woke',
    ]);
    expect(result.ok && result.events.map((event) => event.payload)).toEqual([
      { planId: plan().id, from: CH00.id, to: CH10.id, ruleVersion: 'first-sleep.v1',
        allocationSource: 'balanced' },
      { fromEraLayerId: 'ch00', eraLayerId: 'ch10', worldYear: CH10.gameYear.start },
      { chapterId: CH10.id, ...CH10.wake },
    ]);
    const state = runtime.snapshot();
    expect(state.chapter).toEqual({ chapterId: CH10.id, eraLayerId: CH10.eraLayerId,
      worldTier: CH10.worldTier, worldYear: CH10.gameYear.start,
      clock: createGameClock(`epoch_${CH10.id}`, CH10.gameYear.start, CH10.startTick),
      story: { chapterId: CH10.id, lines: [] }, worldItems: { entries: [] }, shops: [],
      worldMap: null, town: null, npcs: [], itemChapterUses: {} });
    expect(state.meta).toMatchObject({ worldTick: CH10.startTick, contentHash: TARGET_HASH });
    expect(state.chapter.clock.elapsedTicks).toBe(CH10.startTick);
    expect(state.world).toEqual({ navigation: { locationId: CH10.wake.sceneId,
      selectedDestinationId: null, pendingMount: CH10.wake }, pendingTimeAdvance: null });
    expect(state.party.inventory.stacks).toEqual([]); expect(state.party.money).toBe(0);
    expect(state.party.equipment.entries.every((entry) => entry.itemId === null)).toBe(true);
    expect(state.profile.companions).toEqual([]);
    expect(state.profile.protagonist).toMatchObject({ innate: { ...balanced, luk: luck, cha: charm },
      skills: [] });
    expect(state.profile.progression).toMatchObject({ changshengLayer: 1,
      sleepPoints: 0, bookSleepLog: [{ planId: plan().id, from: CH00.id, to: CH10.id,
        ruleVersion: 'first-sleep.v1', allocationSource: 'balanced',
        sleepEventId: 'slp_first_changbai', contentHash: TARGET_HASH }] });
    expect(state.meta.rng).toEqual(before.meta.rng);
  });

  it('reads target year and start tick from ChapterDef without catch-up', () => {
    const target = { ...CH10, gameYear: { start: 777, end: 778, approx: false },
      startTick: 1200 };
    const runtime = ready('skip', target); const beforeRng = runtime.snapshot().meta.rng;
    expect(runtime.dispatch({ t: 'chapter/bookSleep', plan: plan() }).ok).toBe(true);
    const state = runtime.snapshot();
    expect(state.chapter.worldYear).toBe(777); expect(state.chapter.clock.epochYear).toBe(777);
    expect(state.meta.worldTick).toBe(1200); expect(state.chapter.clock.elapsedTicks).toBe(1200);
    expect(state.chapter.clock.shichenIndex).toBe(1); expect(state.meta.rng).toEqual(beforeRng);
  });

  it('makes an identical plan ID a no-op and rejects a conflicting replay', () => {
    const runtime = ready(); const first = runtime.dispatch({ t: 'chapter/bookSleep', plan: plan() });
    expect(first.ok).toBe(true); const before = runtime.canonicalStateJson();
    const version = runtime.snapshot().meta.stateVersion;
    expect(runtime.dispatch({ t: 'chapter/bookSleep', plan: plan() })).toEqual({
      ok: true, stateVersion: version, events: [],
    });
    expect(runtime.canonicalStateJson()).toBe(before);
    expect(runtime.dispatch({ t: 'chapter/bookSleep', plan: plan({
      allocationSource: 'default' }) })).toEqual({
      ok: false, reason: 'BOOK_SLEEP_PLAN_CONFLICT',
    });
    expect(runtime.canonicalStateJson()).toBe(before);
  });
});

describe('first-sleep determinism and migration', () => {
  it('replays the reviewed cross-engine fixture at every accepted checkpoint', () => {
    expect(golden).toMatchObject({ fixtureVersion: 1, contentHash: TARGET_HASH,
      appBuild: '20261002-0000-local', coreVersion: '0.0.0',
      rulesProtocol: 3, rngProtocol: 2 });
    const runtime = createCoreFromState(golden.initialState as unknown as GameState, content());
    for (const [index, command] of golden.commands.entries()) {
      const result = runtime.dispatch(command as Parameters<Core['dispatch']>[0]);
      expect(result.ok, `golden command ${index + 1}`).toBe(true);
      expect(hash(runtime.snapshot())).toBe(golden.checkpoints[index]?.stateHash);
    }
    expect(hash(runtime.snapshot())).toBe(golden.finalStateHash);
  });

  it('keeps query, commit RNG, and committed event bytes deterministic', () => {
    const runtime = ready(); const beforeRng = runtime.snapshot().meta.rng;
    runtime.firstSleepAllocation(balanced);
    const result = runtime.dispatch({ t: 'chapter/bookSleep', plan: plan() });
    expect(result.ok).toBe(true); expect(runtime.snapshot().meta.rng).toEqual(beforeRng);
    expect(canonicalJson((result.ok ? result.events : []) as unknown as JsonValue))
      .toContain('chapter/bookSleepCommitted');
  });

  it('keeps full and skip outcomes equal except for the explicit mode receipt', () => {
    const full = ready('full'); const skipped = ready('skip');
    expect(full.dispatch({ t: 'chapter/bookSleep', plan: plan() }).ok).toBe(true);
    expect(skipped.dispatch({ t: 'chapter/bookSleep', plan: plan() }).ok).toBe(true);
    const strip = (state: GameState): JsonValue => {
      const clone = JSON.parse(JSON.stringify(state)) as GameState;
      return { ...clone, profile: { ...clone.profile, progression: {
        ...clone.profile.progression!, prologueModeReceipt: null,
      } } } as unknown as JsonValue;
    };
    expect(canonicalJson(strip(full.snapshot()))).toBe(canonicalJson(strip(skipped.snapshot())));
    expect(full.snapshot().profile.progression?.prologueModeReceipt?.mode).toBe('full');
    expect(skipped.snapshot().profile.progression?.prologueModeReceipt?.mode).toBe('skip');
  });

  it('migrates the same schema-2 bytes to identical schema-3 bytes repeatedly', () => {
    const state = initial();
    const { progression, ...profile } = state.profile; void progression;
    const { eraLayerId, worldTier, ...chapter } = state.chapter; void eraLayerId; void worldTier;
    const { pendingMount, ...navigation } = state.world.navigation; void pendingMount;
    const legacy = { ...state, meta: { ...state.meta, saveSchema: 2 },
      profile, chapter, world: { ...state.world, navigation } } as unknown as JsonValue;
    const context = { fromContentHash: SOURCE_HASH, targetSchema: 3, remapVersion: 'none' };
    const first = canonicalJson(migrateBookSleepV2(legacy, context));
    const second = canonicalJson(migrateBookSleepV2(JSON.parse(first) as JsonValue, context));
    const repeated = canonicalJson(migrateBookSleepV2(legacy, context));
    expect(repeated).toBe(first); expect(second).toBe(first);
    expect(JSON.parse(first)).toMatchObject({ meta: { saveSchema: 3 },
      profile: { progression: { changshengLayer: 0, sleepPoints: 0, bookSleepLog: [],
        changshengLayerReceipts: [], prologueModeReceipt: null },
        protagonist: { innate: { bre: 0 } } },
      chapter: { eraLayerId: 'ch00', worldTier: 'LOW' },
      world: { navigation: { pendingMount: null } } });
  });
});
