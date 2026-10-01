/// <reference types="node" />
// eslint-disable-next-line no-restricted-imports -- Test fixture loading and SHA-256 oracle only.
import { createHash } from 'node:crypto';
// eslint-disable-next-line no-restricted-imports -- Test fixture loading only.
import { readFileSync } from 'node:fs';
import type { StoryLine } from '@tianshu/data/schemas';
import { parseContentFile } from '@tianshu/data/tooling';
import { canonicalJson, type JsonValue } from '@tianshu/shared';
import { describe, expect, it } from 'vitest';
import type { DialogueSession, InkDialogueBridge } from '../dialogue';
import { EventAnchorRegistry } from '../event';
import { restoreStoryRuntime, StoryRuntime, storyLineState, type QuestPort } from '.';

function loadStory(relativePath: string): StoryLine {
  const path = new URL(`../../../../content/story/ch01/${relativePath}`, import.meta.url);
  const text = readFileSync(path, 'utf8');
  return parseContentFile({ path: path.pathname, text }).value as StoryLine;
}
const main = loadStory('01-tianlong-main.yaml');
const side = loadStory('side_babuzhong.yaml');

function questPort(): QuestPort & { readonly activations: string[] } {
  const activations: string[] = [];
  return { activations, activate: (questId) => { activations.push(questId); },
    executeEvent: () => undefined };
}
const dialogue: InkDialogueBridge = {
  start: (storyId, knot): DialogueSession => ({
    mode: 'ink', storyId, knot, lines: [], choices: [], serializedState: '{}',
  }),
  choose: (session) => session,
  restore: (storyId, serializedState) => ({ mode: 'ink', storyId, knot: null,
    lines: [], choices: [], serializedState }),
  save: (session) => session.serializedState ?? '{}',
};
function createRuntime(port: QuestPort = questPort()): StoryRuntime {
  return new StoryRuntime([main, side], { ports: { quest: port, dialogue } });
}
function hash(value: unknown): string {
  return createHash('sha256').update(canonicalJson(value as JsonValue), 'utf8').digest('hex');
}
function progressToWindow(runtime: StoryRuntime): void {
  runtime.start(); runtime.completeDialogue(); runtime.completeDialogue();
  for (const [questId, choice] of [
    ['q_01_main_c_01', 'save_porter'], ['q_01_main_c_02', 'return_original'],
  ] as const) { runtime.completeQuest(questId); runtime.choose(choice); }
  runtime.completeQuest('q_01_main_c_03'); runtime.completeDialogue();
  runtime.completeQuest('q_01_main_c_04'); runtime.choose('protect_evidence');
  runtime.completeQuest('q_01_main_z_01'); runtime.completeQuest('q_01_main_z_02');
  runtime.choose('aid_xiaofeng'); runtime.completeQuest('q_01_main_z_03');
  runtime.completeQuest('q_01_main_z_04');
}

describe('StoryRuntime', () => {
  it('runs a scripted Tianlong route and unlocks an attached side line', () => {
    const port = questPort(); const runtime = createRuntime(port);
    progressToWindow(runtime);
    expect(storyLineState(runtime, 'side_babuzhong').status).toBe('available');
    runtime.activateLine('side_babuzhong'); runtime.completeDialogue();
    expect(storyLineState(runtime, 'side_babuzhong').status).toBe('completed');
    expect(port.activations).toContain('q_01_main_z_04');
  });

  it('takes the half-open timeout edge exactly at 480 minutes', () => {
    const runtime = createRuntime(); progressToWindow(runtime);
    const before = storyLineState(runtime, 'main');
    expect(before.activeNodeIds).toEqual(['n_choice_05']);
    runtime.advanceTo(480 * 10);
    const after = storyLineState(runtime, 'main');
    expect(after.expiredNodeIds).toContain('n_choice_05');
    expect(after.branchPath).toContain('e_042_dc05_timeout');
    expect(runtime.snapshot().wait?.kind).toBe('dialogue');
  });

  it('restores the same wait node and remains idempotent after save/load', () => {
    const runtime = createRuntime(); runtime.start(); runtime.completeDialogue();
    const saved = JSON.parse(JSON.stringify(runtime.snapshot())) as ReturnType<typeof runtime.snapshot>;
    const restored = restoreStoryRuntime([main, side], saved, { quest: questPort(), dialogue });
    expect(restored.snapshot()).toEqual(saved);
    restored.completeDialogue();
    const first = restored.snapshot();
    expect(() => restored.completeDialogue()).toThrow('STORY_WAIT_dialogue');
    expect(restored.snapshot()).toEqual(first);
  });

  it('has the same canonical replay hash for the same scripted choices', () => {
    const run = (): string => {
      const runtime = createRuntime(); progressToWindow(runtime);
      runtime.choose('tell_truth'); return hash(runtime.snapshot());
    };
    expect(run()).toBe('0abe07cfa439b604a0e0585e6a8efbe60ccc051bd67ef74a835cf7e11412cbed');
  });
});

describe('EventAnchorRegistry', () => {
  it('buckets NPC and position anchors by scene with stable order', () => {
    const registry = new EventAnchorRegistry([
      { id: 'z', kind: 'location', sceneId: 'sc_01_xingzilin', trigger: 'enter',
        lineId: 'main', nodeId: 'n_c04', point: { q: 2, r: 3 }, radius: 1 },
      { id: 'a', kind: 'npc', sceneId: 'sc_01_xingzilin', trigger: 'interact',
        lineId: 'main', nodeId: 'n_xingzilin_dialogue', npcId: 'npc_xiaofeng' },
      { id: 'other', kind: 'location', sceneId: 'sc_01_juxianzhuang', trigger: 'enter',
        lineId: 'main', nodeId: 'n_juxian_merge', point: { q: 0, r: 0 } },
    ]);
    expect(registry.queryScene('sc_01_xingzilin').map((anchor) => anchor.id)).toEqual(['a', 'z']);
    expect(registry.query('sc_01_xingzilin', 'enter').map((anchor) => anchor.id)).toEqual(['z']);
  });
});
