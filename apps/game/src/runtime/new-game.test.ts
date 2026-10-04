import { compileInk } from '@tianshu/data/build';
import { describe, expect, it, vi } from 'vitest';
import { createGameCoreHost } from '../core-host';
import type { NewGameHost } from './contracts';
import { createGameSession } from './session';
import { createNewGameSessionState } from './new-game';
import { fixtureContent, fixtureItemPack } from './test-fixture';

vi.mock('virtual:tianshu-content', async () => {
  const { fixtureContent: fixture } = await import('./test-fixture');
  return { default: fixture(), loadChapterAssets: async () => ({}) };
});
vi.mock('virtual:tianshu-towns', () => ({ loadTown: async () => null }));

const identity = { name: '沈砚', gender: 'female', appearance: 'hero_f01', pronoun: '她',
  originId: 'origin_wenshiguan' } as const;

describe('new game host wiring', () => {
  it('takes entropy at the host boundary and produces a canonical ch00 state', () => {
    const content = fixtureContent();
    const state = createNewGameSessionState(content, { identity, difficulty: 'diff_xiake' },
      () => 0x1234_5678);
    expect(state).toMatchObject({ meta: { masterSeed: 0x1234_5678 },
      chapter: { chapterId: 'ch00_yuenv' }, profile: { identity } });
  });

  it('keeps preview explicit and can replace a running session with a new run', async () => {
    const content = fixtureContent();
    const production = createGameSession(content, undefined, undefined, {
      demo: false, seedSource: () => 7 });
    expect((await production.snapshot()).meta.debugTainted).toBe(false);
    expect((await production.snapshot()).chapter.chapterId).toBe('ch00_yuenv');
    const preview = createGameSession(content, undefined, undefined, { demo: true });
    expect((await preview.snapshot()).meta.debugTainted).toBe(true);
    expect((await preview.snapshot()).chapter.chapterId).toBe('ch10_baima');
    const created = await production.createNewGame({ identity, difficulty: 'diff_zongshi' });
    expect(created).toMatchObject({ accepted: true, events: [{ t: 'run/created', payload: {
      chapterId: 'ch00_yuenv', difficulty: 'diff_zongshi',
    } }] });
    expect((await production.snapshot()).meta.masterSeed).toBe(7);
  });

  it('exposes new-game creation through the public projection host', async () => {
    const fixture = await fixtureItemPack('ch00_yuenv');
    const host = await createGameCoreHost({ contentSource: fixture.source });
    const entry = host as typeof host & Partial<NewGameHost>;
    expect(entry.createNewGame).toBeTypeOf('function');
    const created = await entry.createNewGame!({ identity, difficulty: 'diff_jianghu' });
    expect(created).toMatchObject({ accepted: true, events: [{ t: 'run/created' }] });
    expect((await host.snapshot()).chapter.chapterId).toBe('ch00_yuenv');
    host.dispose();
  });

  it('fixes old references from a verified pack when the host transport has no fixup RPC', async () => {
    const fixture = await fixtureItemPack('ch00_yuenv', [{ from: 'it_old_medicine',
      to: 'it_jinchuangyao', since: 'c'.repeat(64), reason: 'test remap' }]);
    const host = await createGameCoreHost({ contentSource: fixture.source });
    try {
      expect(host.fixupContentRefs).toBeTypeOf('function');
      const current = await host.snapshot();
      const candidate = { ...current, meta: { ...current.meta, contentHash: 'd'.repeat(64) },
        party: { ...current.party, inventory: { stacks: [
          { itemId: 'it_old_medicine', count: 1 },
        ] } } };
      const fixed = await host.fixupContentRefs!(candidate, candidate.meta.contentHash);
      expect(fixed.party.inventory.stacks).toEqual([{ itemId: 'it_jinchuangyao', count: 1 }]);
      expect(fixed.meta.contentHash).toBe(fixture.manifest.contentHash);
      expect(candidate.party.inventory.stacks[0]?.itemId).toBe('it_old_medicine');
    } finally { host.dispose(); }
  });

  // This wait synchronizes functional state; loaded-host latency is not a performance assertion.
  it('loads display text on first detail read and reuses the cache', async () => {
    const fixture = await fixtureItemPack('ch10_baima');
    const host = await createGameCoreHost({ demo: true, contentSource: fixture.source });
    const updates: string[] = [];
    const off = host.subscribe((update) => {
      const text = update.changes.inventory?.find((item) =>
        item.id === 'it_jinchuangyao')?.description;
      if (text) updates.push(text);
    });
    try {
      const initial = await host.query();
      const item = initial.inventory.find((row) => row.id === 'it_jinchuangyao')!;
      expect(item.name).toBe('金创药');
      expect(initial.characters.some((row) => row.name === '李文秀')).toBe(true);
      expect(fixture.reads.filter((path) => path.includes('.text.'))).toEqual([
        'ch10_baima/ch10.text.zh-Hans.base.json',
      ]);
      expect(item.description).toBe('正文载入中……');
      await vi.waitFor(() => expect(updates.some((text) => text !== '正文载入中……'))
        .toBe(true), { timeout: 10_000 });
      const loaded = await host.query();
      expect(loaded.inventory.find((row) => row.id === item.id)?.description)
        .not.toBe('正文载入中……');
      expect(fixture.reads.filter((path) => path.includes('.text.'))).toEqual([
        'ch10_baima/ch10.text.zh-Hans.base.json',
        'ch10_baima/common.text.zh-Hans.items.json',
      ]);
    } finally { off(); host.dispose(); }
  }, 30_000);

  it('projects a compiled Ink fixture through the game session', async () => {
    const compiled = await compileInk(`=== opening ===
# ts:dialogue/speaker speaker=book_spirit
正文。
-> END`, `schemaVersion: inkmeta.v1
storyId: story_host
chapter: ch00_yuenv
entryKnots: [opening]
readFlags: []
commands: [dialogue/speaker]
npcs: []
`, 'story_host.ink');
    const base = fixtureContent(); const content = { ...base, inkStories: [{
      storyId: compiled.storyId, storyHash: compiled.structure.storyHash,
      storyJson: compiled.storyJson,
    }] };
    const session = createGameSession(content);
    const update = await session.dispatch({ t: 'dialogue/start', storyId: 'story_host',
      entryKey: 'opening' });
    expect(update.accepted).toBe(true);
    expect(update.changes.dialogue).toMatchObject({ speakerId: 'book_spirit',
      textKey: 'ink.story_host.text.0000' });
    expect((await session.query()).worldPaused).toBe(true);
    expect(() => session.snapshot()).toThrow('DIALOGUE_SAVE_UNAVAILABLE');
  });
});
