import { Compiler } from 'inkjs/full';
import { describe, expect, it } from 'vitest';
import { FacilityDialogueSchema } from '@tianshu/data/schemas';
import { createCoreFromState, createNewGameState, projectDialogue,
  resolveFacilityDialogue, type CoreContent, type GameState } from '..';

const identity = { name: '测试侠客', gender: 'unspecified' as const,
  appearance: 'appearance_default', pronoun: '你', originId: 'origin_wenshiguan' };
function compiled(source: string): string {
  const output = new Compiler(source).Compile().ToJson();
  if (typeof output !== 'string') throw new TypeError('INK_FIXTURE');
  return output;
}
function content(source: string): CoreContent {
  return { inkStories: [{ storyId: 'story_facility_test', storyHash: '8'.repeat(64),
    storyJson: compiled(source) }], townFacilities: [{ schemaVersion: 'town-facilities.v1',
    layoutKey: 'city_dali__ch01', facilities: [{ key: 'yaopu_01', kind: 'shop',
      sub: 'yaopu', buildingId: 'bi_0001', nameKey: 'town.city_dali__ch01.yaopu_01.name',
      shop: { templateRef: 'shop_tpl_yaopu', kind: 'normal' }, roles: ['keeper'] },
    { key: 'kedian_01', kind: 'inn', sub: null, buildingId: 'bi_0002',
      nameKey: 'town.city_dali__ch01.kedian_01.name', shop: null, roles: ['keeper'] }] }] };
}
function dialogues(bindings: unknown[]): NonNullable<CoreContent['facilityDialogues']> {
  return [FacilityDialogueSchema.parse({ schemaVersion: 'facility-dialogue.v1', bindings })];
}
function state() {
  const base = createNewGameState({ masterSeed: 20261011, identity, difficulty: 'diff_xiake' });
  return { ...base, chapter: { ...base.chapter, chapterId: 'ch01_tianlong',
    eraLayerId: 'ch01', story: { chapterId: 'ch01_tianlong', lines: [] } },
    world: { ...base.world, navigation: { ...base.world.navigation, locationId: 'city_dali' } } };
}
const shopContext = { kind: 'facility' as const, sceneId: 'city_dali',
  facilityKey: 'yaopu_01', roleKey: 'keeper', shopKey: 'city_dali__ch01/yaopu_01',
  interlocutorNameKey: 'town.city_dali__ch01.yaopu_01.name' };

describe('facility dialogue intents and projection', () => {
  it('projects interlocutor identity from facility content', () => {
    const supplied = content(`=== opening ===
fixture.hello
-> END`);
    const core = createCoreFromState(state(), supplied);
    expect(core.dispatch({ t: 'dialogue/start', storyId: 'story_facility_test',
      entryKey: 'opening' }).ok).toBe(true);
    const active = core.snapshot();
    const facility = { ...active, dialogue: { ...active.dialogue!, speakerId: 'interlocutor',
      context: shopContext } };
    expect(projectDialogue(facility)).toMatchObject({ speakerId: 'interlocutor',
      interlocutor: { facilityKey: 'yaopu_01', roleKey: 'keeper',
        nameKey: 'town.city_dali__ch01.yaopu_01.name' } });
  });

  it('raises an internal error when interlocutor has no facility context', () => {
    const supplied = content(`=== opening ===
#ts:dialogue/speaker speaker=interlocutor
fixture.hello
-> END`);
    const core = createCoreFromState(state(), supplied);
    expect(() => core.dispatch({ t: 'dialogue/start', storyId: 'story_facility_test',
      entryKey: 'opening' })).toThrow('DIALOGUE_INTERLOCUTOR_CONTEXT');
    expect(core.snapshot().dialogue).toBeNull();
  });

  it('raises an internal error when interlocutor context lacks its authored name key', () => {
    const supplied = content(`=== opening ===
fixture.hello
-> END`);
    const core = createCoreFromState(state(), supplied);
    expect(core.dispatch({ t: 'dialogue/start', storyId: 'story_facility_test',
      entryKey: 'opening' }).ok).toBe(true);
    const active = core.snapshot();
    const legacy = { ...active, dialogue: { ...active.dialogue!, speakerId: 'interlocutor',
      context: { kind: 'facility' as const, sceneId: 'city_dali', facilityKey: 'yaopu_01',
        roleKey: 'keeper', shopKey: 'city_dali__ch01/yaopu_01' } } };
    expect(() => projectDialogue(legacy as GameState)).toThrow('DIALOGUE_INTERLOCUTOR_CONTEXT');
  });

  it('evaluates conditional bindings against current-state facts without region content', () => {
    const base = state();
    const supplied: CoreContent = { ...content(''), facilityDialogues: dialogues([{
        chapter: 'ch01_tianlong', kind: 'shop', sub: 'yaopu', roleKey: 'keeper',
        storyId: 'story_item', entryKey: 'item', condition: { all: [
          { item: 'it_token' }, { quest: 'q_01_side_01', state: 'active' },
        ] } },
      { chapter: 'ch01_tianlong', kind: 'shop', sub: 'yaopu', roleKey: 'keeper',
        storyId: 'story_fallback', entryKey: 'fallback' }]) };
    const line: GameState['chapter']['story']['lines'][number] = { lineId: 'q_01_side_01',
      status: 'active', activeNodeIds: ['st_test'], completedNodeIds: [], expiredNodeIds: [],
      chosenOptions: {}, branchPath: [], resolvedWindows: {}, appliedEffectIds: [], revision: 0 };
    const withItem = { ...base,
      chapter: { ...base.chapter, story: { ...base.chapter.story, lines: [line] } },
      party: { ...base.party, inventory: {
      stacks: [{ itemId: 'it_token', count: 1 }],
    } } };
    expect(resolveFacilityDialogue(withItem, supplied, { sceneId: 'city_dali',
      facilityKey: 'yaopu_01', roleKey: 'keeper' }).storyId).toBe('story_item');
  });

  it('falls back when a condition misses and ranks exact and conditional matches', () => {
    const base = state();
    const supplied: CoreContent = { ...content(''), facilityDialogues: dialogues([{
        chapter: 'ch01_tianlong', kind: 'shop', sub: 'yaopu', roleKey: 'keeper',
        storyId: 'story_exact_plain', entryKey: 'exact_plain' },
      { chapter: 'ch01_tianlong', kind: 'shop', roleKey: 'keeper',
        storyId: 'story_kind_condition', entryKey: 'kind_condition', condition: { item: 'it_token' } },
      { chapter: 'ch01_tianlong', kind: 'shop', sub: 'yaopu', roleKey: 'keeper',
        storyId: 'story_exact_condition', entryKey: 'exact_condition', condition: { item: 'it_token' } },
      { chapter: 'ch01_tianlong', kind: 'shop', sub: 'yaopu', roleKey: 'keeper',
        storyId: 'story_exact_second', entryKey: 'exact_second',
        condition: { item: 'it_token_two' } },
      { chapter: 'ch01_tianlong', kind: 'shop', sub: 'yaopu', roleKey: 'keeper',
        storyId: 'story_missed', entryKey: 'missed', condition: { item: 'it_missing' } }]) };
    const target = { sceneId: 'city_dali', facilityKey: 'yaopu_01', roleKey: 'keeper' };
    expect(resolveFacilityDialogue(base, supplied, target).storyId).toBe('story_exact_plain');
    const withItem = { ...base, party: { ...base.party, inventory: {
      stacks: [{ itemId: 'it_token', count: 1 }],
    } } };
    expect(resolveFacilityDialogue(withItem, supplied, target).storyId)
      .toBe('story_exact_condition');
    const withBoth = { ...base, party: { ...base.party, inventory: { stacks: [
      { itemId: 'it_token', count: 1 }, { itemId: 'it_token_two', count: 1 },
    ] } } };
    expect(resolveFacilityDialogue(withBoth, supplied, target).storyId)
      .toBe('story_exact_condition');
  });

  it('turns facility/openShop into the bound shop/open presentation step', () => {
    const supplied = content(`=== opening ===
fixture.first
#ts:facility/openShop
fixture.second
-> END`);
    const first = createCoreFromState(state(), supplied);
    expect(first.dispatch({ t: 'dialogue/start', storyId: 'story_facility_test',
      entryKey: 'opening' }).ok).toBe(true);
    const snapshot = first.snapshot();
    const core = createCoreFromState({ ...snapshot, dialogue: { ...snapshot.dialogue!,
      context: shopContext } }, supplied);
    const result = core.dispatch({ t: 'dialogue/continue' });
    expect(result.ok && result.events.find((event) => event.t === 'world/eventPresented')?.payload)
      .toEqual({ eventId: 'dialogue:story_facility_test',
        steps: [{ op: 'shop/open', shopKey: 'city_dali__ch01/yaopu_01' }] });
  });

  it('rejects openShop for a facility without a shop and rolls back the tag', () => {
    const supplied = content(`=== opening ===
fixture.first
#ts:facility/openShop
fixture.second
-> END`);
    const first = createCoreFromState(state(), supplied);
    expect(first.dispatch({ t: 'dialogue/start', storyId: 'story_facility_test',
      entryKey: 'opening' }).ok).toBe(true);
    const snapshot = first.snapshot();
    const innContext = { ...shopContext, facilityKey: 'kedian_01', shopKey: null,
      interlocutorNameKey: 'town.city_dali__ch01.kedian_01.name' };
    const core = createCoreFromState({ ...snapshot, dialogue: { ...snapshot.dialogue!,
      context: innContext } }, supplied);
    const before = core.canonicalStateJson();
    expect(core.dispatch({ t: 'dialogue/continue' }))
      .toEqual({ ok: false, reason: 'DIALOGUE_INTENT_REFERENCE' });
    expect(core.canonicalStateJson()).toBe(before);
  });

  it('rejects openShop outside a facility context', () => {
    const supplied = content(`=== opening ===
fixture.first
#ts:facility/openShop
fixture.second
-> END`);
    const core = createCoreFromState(state(), supplied);
    expect(core.dispatch({ t: 'dialogue/start', storyId: 'story_facility_test',
      entryKey: 'opening' }).ok).toBe(true);
    expect(core.dispatch({ t: 'dialogue/continue' }))
      .toEqual({ ok: false, reason: 'DIALOGUE_INTENT_REFERENCE' });
  });

  it('does not present the same consumed openShop tag twice after restore', () => {
    const supplied = content(`=== opening ===
fixture.first
#ts:facility/openShop
fixture.second
fixture.third
-> END`);
    const first = createCoreFromState(state(), supplied);
    expect(first.dispatch({ t: 'dialogue/start', storyId: 'story_facility_test',
      entryKey: 'opening' }).ok).toBe(true);
    let snapshot = first.snapshot();
    const facility = createCoreFromState({ ...snapshot, dialogue: { ...snapshot.dialogue!,
      context: shopContext } }, supplied);
    const opened = facility.dispatch({ t: 'dialogue/continue' });
    expect(opened.ok && opened.events.filter((event) => event.t === 'world/eventPresented'))
      .toHaveLength(1);
    snapshot = facility.snapshot();
    const receipt = snapshot.dialogue!.consumedTagKeys[0]!;
    const duplicate = { key: receipt, action: { op: 'facility/openShop' } };
    const restored = createCoreFromState({ ...snapshot, dialogue: { ...snapshot.dialogue!,
      pendingIntents: [duplicate] } }, supplied);
    const continued = restored.dispatch({ t: 'dialogue/continue' });
    expect(continued.ok && continued.events.some((event) => event.t === 'world/eventPresented'))
      .toBe(false);
  });

});
