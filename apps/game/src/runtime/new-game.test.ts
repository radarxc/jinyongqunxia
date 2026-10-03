import { compileInk } from '@tianshu/data/build';
import { describe, expect, it, vi } from 'vitest';
import { createGameCoreHost } from '../core-host';
import type { NewGameHost } from './contracts';
import { createGameSession } from './session';
import { createNewGameSessionState } from './new-game';
import { fixtureContent } from './test-fixture';

vi.mock('virtual:tianshu-content', async () => {
  const { fixtureContent: fixture } = await import('./test-fixture');
  return { default: fixture() };
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
    expect((await preview.snapshot()).chapter.chapterId).toBe('ch01_tianlong');
    const created = await production.createNewGame({ identity, difficulty: 'diff_zongshi' });
    expect(created).toMatchObject({ accepted: true, events: [{ t: 'run/created', payload: {
      chapterId: 'ch00_yuenv', difficulty: 'diff_zongshi',
    } }] });
    expect((await production.snapshot()).meta.masterSeed).toBe(7);
  });

  it('exposes new-game creation through the public projection host', async () => {
    const host = await createGameCoreHost();
    const entry = host as typeof host & Partial<NewGameHost>;
    expect(entry.createNewGame).toBeTypeOf('function');
    const created = await entry.createNewGame!({ identity, difficulty: 'diff_jianghu' });
    expect(created).toMatchObject({ accepted: true, events: [{ t: 'run/created' }] });
    expect((await host.snapshot()).chapter.chapterId).toBe('ch00_yuenv');
    host.dispose();
  });

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
