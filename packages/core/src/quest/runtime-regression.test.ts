import type { StoryLine } from '@tianshu/data/schemas';
import { describe, expect, it } from 'vitest';
import { StoryRuntime } from '.';

const source = { document: 'test', anchors: ['test'] } as const;
function mainLine(
  nodes: readonly Record<string, unknown>[], edges: readonly Record<string, unknown>[],
): StoryLine {
  return { schemaVersion: 'story.v1', chapterId: 'ch01_tianlong', lineId: 'main',
    kind: 'main', titleKey: 'test.main', eraLayer: 'ch01', startNodeId: nodes[0]!['id'],
    sideHooks: [], nodes, edges, source } as unknown as StoryLine;
}
function end(id: string, tag: string): Record<string, unknown> {
  return { id, type: 'end', titleKey: `test.${id}`, completeOn: 'immediate',
    payload: { endingTags: [tag] }, sourceRef: 'test' };
}
function sideLine(trigger: Record<string, unknown>): StoryLine {
  return { ...mainLine([end('n_side_end', 'side')], []), lineId: 'side_timed',
    kind: 'side', trigger, titleKey: 'test.side' } as unknown as StoryLine;
}

describe('StoryRuntime routing invariants', () => {
  it('evaluates condition edges before the auto fallback regardless of priority', () => {
    const line = mainLine([
      { id: 'n_gate', type: 'condition', titleKey: 'test.gate', completeOn: 'immediate',
        payload: { expression: { flag: { id: 'fl_open', is: true } } }, sourceRef: 'test' },
      end('n_condition', 'condition'), end('n_auto', 'auto'),
    ], [
      { id: 'e_auto', from: 'n_gate', to: 'n_auto', trigger: 'auto', priority: 1000 },
      { id: 'e_condition', from: 'n_gate', to: 'n_condition', trigger: 'condition',
        condition: { flag: { id: 'fl_open', is: true } }, priority: 0 },
    ]);
    expect(new StoryRuntime([line], { facts: { flags: { fl_open: true } } })
      .start().snapshot.endingTags).toEqual(['condition']);
  });

  it('does not execute a timed start node before its half-open window opens', () => {
    const choice = { id: 'n_choice', type: 'choice', titleKey: 'test.choice',
      completeOn: 'story/choiceCommitted', timeWindow: { mode: 'absolute', epochId: 'epoch_ch01',
        opensAt: { year: 1093, month: 1, day: 1, hour: 1, minute: 0 },
        closesAt: { year: 1093, month: 1, day: 1, hour: 2, minute: 0 },
        onMiss: { policy: 'alternate', targetNodeId: 'n_timeout' } },
      payload: { decisionId: 'dc_test', options: [
        { key: 'yes', textKey: 'test.yes' }, { key: 'no', textKey: 'test.no' },
      ] }, sourceRef: 'test' };
    const line = mainLine([choice, end('n_yes', 'yes'), end('n_no', 'no'),
      { ...end('n_timeout', 'timeout'), type: 'end' }], [
      { id: 'e_yes', from: 'n_choice', to: 'n_yes', trigger: 'choice',
        choiceKey: 'yes', priority: 0 },
      { id: 'e_no', from: 'n_choice', to: 'n_no', trigger: 'choice',
        choiceKey: 'no', priority: 0 },
      { id: 'e_timeout', from: 'n_choice', to: 'n_timeout', trigger: 'timeout', priority: 0 },
    ]);
    const runtime = new StoryRuntime([line]);
    expect(runtime.start().snapshot.wait).toBeNull();
    expect(runtime.advanceTo(599).snapshot.wait).toBeNull();
    expect(runtime.advanceTo(600).snapshot.wait?.kind).toBe('choice');
  });

  it('records quest success so a following condition gate can route', () => {
    const line = mainLine([
      { id: 'n_quest', type: 'quest', titleKey: 'test.quest', completeOn: 'quest/succeeded',
        payload: { questId: 'q_01_main_c_01' }, sourceRef: 'test' },
      { id: 'n_gate', type: 'condition', titleKey: 'test.gate', completeOn: 'immediate',
        payload: { expression: { quest: { id: 'q_01_main_c_01', state: 'completed' } } },
        sourceRef: 'test' }, end('n_done', 'done'),
    ], [
      { id: 'e_to_gate', from: 'n_quest', to: 'n_gate', trigger: 'auto', priority: 0 },
      { id: 'e_to_done', from: 'n_gate', to: 'n_done', trigger: 'condition',
        condition: { quest: { id: 'q_01_main_c_01', state: 'completed' } }, priority: 0 },
    ]);
    const runtime = new StoryRuntime([line]); runtime.start();
    expect(runtime.completeQuest('q_01_main_c_01').snapshot.endingTags).toEqual(['done']);
  });

  it('emits one entered event with chapter and cause identity across repeated start calls', () => {
    const line = mainLine([
      { id: 'n_dialogue', type: 'dialogue', titleKey: 'test.dialogue',
        completeOn: 'dialogue/completed', payload: { inlineLines: [
          { speakerId: 'narrator', textKey: 'test.line' },
        ] }, sourceRef: 'test' }, end('n_done', 'done'),
    ], [{ id: 'e_done', from: 'n_dialogue', to: 'n_done', trigger: 'auto', priority: 0 }]);
    const runtime = new StoryRuntime([line]);
    expect(runtime.start().events).toEqual([expect.objectContaining({
      t: 'story/nodeEntered', chapterId: 'ch01_tianlong', causeId: 'main/n_dialogue/entered',
    })]);
    expect(runtime.start().events).toEqual([]);
  });

  it('restores a suspended main wait after a side line finishes', () => {
    const main = mainLine([{ id: 'n_main_wait', type: 'dialogue', titleKey: 'test.wait',
      completeOn: 'dialogue/completed', payload: { inlineLines: [
        { speakerId: 'narrator', textKey: 'test.wait' },
      ] }, sourceRef: 'test' }, end('n_main_end', 'main')], [
      { id: 'e_main_end', from: 'n_main_wait', to: 'n_main_end', trigger: 'auto', priority: 0 },
    ]);
    const side = sideLine({ condition: { flag: { id: 'fl_open', is: true } } });
    const snapshot = new StoryRuntime([main, side], { facts: { flags: { fl_open: true } } }).start().snapshot;
    const available = { ...snapshot, lines: snapshot.lines.map((line) => line.lineId === 'side_timed'
      ? { ...line, status: 'available' as const } : line) };
    const runtime = new StoryRuntime([main, side], { snapshot: available });
    expect(runtime.activateLine('side_timed').snapshot.wait?.lineId).toBe('main');
  });

  it('honours a half-open line trigger window and expires it at close', () => {
    const main = mainLine([{ id: 'n_main_wait', type: 'dialogue', titleKey: 'test.wait',
      completeOn: 'dialogue/completed', payload: { inlineLines: [
        { speakerId: 'narrator', textKey: 'test.wait' },
      ] }, sourceRef: 'test' }, end('n_main_end', 'main')], [
      { id: 'e_main_end', from: 'n_main_wait', to: 'n_main_end', trigger: 'auto', priority: 0 },
    ]);
    const side = sideLine({ timeWindow: { mode: 'absolute', epochId: 'epoch_ch01',
      opensAt: { year: 1093, month: 1, day: 1, hour: 1, minute: 0 },
      closesAt: { year: 1093, month: 1, day: 1, hour: 2, minute: 0 },
      onMiss: { policy: 'expire' } } });
    const initial = new StoryRuntime([main, side]).start().snapshot;
    const available = { ...initial, lines: initial.lines.map((line) => line.lineId === 'side_timed'
      ? { ...line, status: 'available' as const } : line) };
    const runtime = new StoryRuntime([main, side], { snapshot: available });
    expect(runtime.activateLine('side_timed').events).toEqual([]);
    runtime.advanceTo(1_200);
    expect(runtime.activateLine('side_timed').snapshot.lines
      .find(({ lineId }) => lineId === 'side_timed')?.status).toBe('expired');
  });

  it('enters a timeout alternative at its exact deadline during a large advance', () => {
    const choice = { id: 'n_choice', type: 'choice', titleKey: 'test.choice',
      completeOn: 'story/choiceCommitted', timeWindow: { mode: 'absolute', epochId: 'epoch_ch01',
        opensAt: { year: 1093, month: 1, day: 1, hour: 0, minute: 0 },
        closesAt: { year: 1093, month: 1, day: 1, hour: 1, minute: 0 },
        onMiss: { policy: 'alternate', targetNodeId: 'n_timeout' } },
      payload: { decisionId: 'dc_test', options: [
        { key: 'yes', textKey: 'test.yes' }, { key: 'no', textKey: 'test.no' },
      ] }, sourceRef: 'test' };
    const line = mainLine([choice, end('n_yes', 'yes'), end('n_no', 'no'),
      end('n_timeout', 'timeout')], [
      { id: 'e_yes', from: 'n_choice', to: 'n_yes', trigger: 'choice', choiceKey: 'yes', priority: 0 },
      { id: 'e_no', from: 'n_choice', to: 'n_no', trigger: 'choice', choiceKey: 'no', priority: 0 },
      { id: 'e_timeout', from: 'n_choice', to: 'n_timeout', trigger: 'timeout', priority: 0 },
    ]);
    const runtime = new StoryRuntime([line]); runtime.start();
    const result = runtime.advanceTo(5_000);
    expect(result.snapshot.eventTicks['main/n_timeout/entered']).toBe(600);
    expect(result.snapshot.nowTick).toBe(5_000);
  });

  it('parks a false condition gate until referenced facts change', () => {
    const line = mainLine([
      { id: 'n_gate', type: 'condition', titleKey: 'test.gate', completeOn: 'immediate',
        payload: { expression: { flag: { id: 'fl_open', is: true } } }, sourceRef: 'test' },
      end('n_done', 'done'),
    ], [{ id: 'e_done', from: 'n_gate', to: 'n_done', trigger: 'auto', priority: 0 }]);
    const result = new StoryRuntime([line]).start();
    expect(result.snapshot.lines[0]?.activeNodeIds).toEqual(['n_gate']);
    expect(result.snapshot.wait).toBeNull();
    expect(result.snapshot.endingTags).toEqual([]);
  });
});
