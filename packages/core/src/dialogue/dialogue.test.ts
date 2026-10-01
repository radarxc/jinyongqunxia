import type { StoryNode } from '@tianshu/data/schemas';
import { Compiler } from 'inkjs/full';
import { describe, expect, it, vi } from 'vitest';
import { InkJsDialogueBridge, StubInkDialogueBridge, startDialogue, type InkDialogueBridge } from '.';

const common = { id: 'n_dialogue', type: 'dialogue', titleKey: 'test.dialogue',
  completeOn: 'dialogue/completed', sourceRef: 'test' } as const;

describe('startDialogue', () => {
  it('starts an inline session without invoking the Ink bridge', () => {
    const bridge: InkDialogueBridge = {
      start: vi.fn(), choose: vi.fn(), restore: vi.fn(), save: vi.fn(),
    };
    const node = { ...common, payload: { inlineLines: [
      { speakerId: 'narrator', textKey: 'story.test.line' },
    ] } } as StoryNode;
    expect(startDialogue(node as Extract<StoryNode, { type: 'dialogue' }>, bridge)).toEqual({
      mode: 'inline', storyId: null, knot: null,
      lines: [{ speakerId: 'narrator', textKey: 'story.test.line' }], choices: [],
    });
    expect(bridge.start).not.toHaveBeenCalled();
  });

  it('delegates an Ink node and its deterministic seed to the injected adapter', () => {
    const expected = { mode: 'ink', storyId: 'story_ch01_main', knot: 'wake',
      lines: [], choices: [{ key: 'go', textKey: 'story.go' }] } as const;
    const start = vi.fn(() => expected);
    const bridge: InkDialogueBridge = { start, choose: vi.fn(), restore: vi.fn(), save: vi.fn() };
    const node = { ...common,
      payload: { ink: { storyId: 'story_ch01_main', knot: 'wake' } } } as StoryNode;
    expect(startDialogue(node as Extract<StoryNode, { type: 'dialogue' }>, bridge, 17)).toBe(expected);
    expect(start).toHaveBeenCalledWith('story_ch01_main', 'wake', 17);
  });

  it('fails fast when no production Ink adapter is installed', () => {
    const bridge = new StubInkDialogueBridge();
    expect(() => bridge.start('story_ch01_main', 'wake', 17)).toThrow('INK_ADAPTER_REQUIRED');
  });
});

describe('InkJsDialogueBridge', () => {
  const source = `=== wake ===
Welcome.
+ [Go]
  -> done
=== done ===
Done.
-> END`;
  const compiled = new Compiler(source).Compile().ToJson();
  const bridge = new InkJsDialogueBridge(() => {
    if (typeof compiled !== 'string') throw new TypeError('INK_FIXTURE_INVALID');
    return compiled;
  });

  it('continues, saves, restores, and selects by stable choice index', () => {
    const started = bridge.start('story_fixture', 'wake', 17);
    expect(started.lines.map((line) => line.textKey)).toEqual(['Welcome.\n']);
    expect(started.choices).toEqual([{ key: '0', textKey: 'Go' }]);
    expect(bridge.restore('story_fixture', bridge.save(started)).choices).toEqual(started.choices);
    expect(bridge.choose(started, '0').lines.map((line) => line.textKey)).toEqual(['Done.\n']);
  });

  it('rejects unknown choice keys without mutating the saved session', () => {
    const started = bridge.start('story_fixture', 'wake', 17);
    expect(() => bridge.choose(started, 'missing')).toThrow('INK_CHOICE_UNKNOWN:missing');
    expect(bridge.restore('story_fixture', bridge.save(started)).choices).toEqual(started.choices);
  });

  it('reports a stable error when compiled story data is unavailable', () => {
    const missing = new InkJsDialogueBridge(() => { throw new Error('network path'); });
    expect(() => missing.start('story_missing', 'wake', 1))
      .toThrow('INK_STORY_INVALID:story_missing');
  });
});
