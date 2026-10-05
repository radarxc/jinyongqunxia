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

  it('rolls back a failed choice together with its scheduled timeout', () => {
    const choice = { id: 'n_choice', type: 'choice', titleKey: 'test.choice',
      completeOn: 'story/choiceCommitted', timeWindow: { mode: 'absolute', epochId: 'epoch_ch01',
        opensAt: { year: 1093, month: 1, day: 1, hour: 0, minute: 0 },
        closesAt: { year: 1093, month: 1, day: 1, hour: 1, minute: 0 },
        onMiss: { policy: 'alternate', targetNodeId: 'n_timeout' } },
      payload: { decisionId: 'dc_test', options: [
        { key: 'missing', textKey: 'test.missing' },
      ] }, sourceRef: 'test' };
    const line = mainLine([choice, end('n_timeout', 'timeout')], [
      { id: 'e_timeout', from: 'n_choice', to: 'n_timeout', trigger: 'timeout', priority: 0 },
    ]);
    const runtime = new StoryRuntime([line]); runtime.start();
    const before = runtime.snapshot();

    expect(() => runtime.choose('missing')).toThrow('STORY_CHOICE_EDGE');
    expect(runtime.snapshot()).toEqual(before);
    expect(runtime.advanceTo(600).snapshot.endingTags).toEqual(['timeout']);
  });

  // This 1,001-node rollback regression asserts correctness, not performance; allow loaded hosts.
  it('rolls back every node when stabilization exceeds its guard', () => {
    const nodes = Array.from({ length: 1_001 }, (_, index) => ({
      id: `n_${index}`, type: 'condition', titleKey: `test.${index}`,
      completeOn: 'immediate', payload: { expression: { flag: { id: 'fl_open', is: true } } },
      sourceRef: 'test',
    }));
    const edges = Array.from({ length: 1_000 }, (_, index) => ({
      id: `e_${index}`, from: `n_${index}`, to: `n_${index + 1}`, trigger: 'auto', priority: 0,
    }));
    const runtime = new StoryRuntime([mainLine(nodes, edges)], { facts: { flags: { fl_open: true } } });
    const before = runtime.snapshot();

    expect(() => runtime.start()).toThrow('STORY_STABILIZE_LIMIT');
    expect(runtime.snapshot()).toEqual(before);
  }, 30_000);

  // This 1,001-node quest-port regression asserts atomicity, not performance; allow loaded hosts.
  it('does not publish quest-port effects before a failed stabilization commits', () => {
    const nodes = [{ id: 'n_activate', type: 'quest', titleKey: 'test.quest',
      completeOn: 'immediate', payload: { inlineEvent: { eventKey: 'test/activate', actions: [] } },
      sourceRef: 'test' }, ...Array.from({ length: 1_001 }, (_, index) => ({
      id: `n_gate_${index}`, type: 'condition', titleKey: `test.${index}`,
      completeOn: 'immediate', payload: { expression: { flag: { id: 'fl_open', is: true } } },
      sourceRef: 'test',
    }))];
    const edges = Array.from({ length: 1_001 }, (_, index) => ({ id: `e_${index}`,
      from: index === 0 ? 'n_activate' : `n_gate_${index - 1}`, to: `n_gate_${index}`,
      trigger: 'auto', priority: 0 }));
    const effects: string[] = [];
    const runtime = new StoryRuntime([mainLine(nodes, edges)], {
      facts: { flags: { fl_open: true } }, ports: { quest: { commit: (batch) => {
        effects.push(...batch.filter((entry) => entry.type === 'executeEvent')
          .map((entry) => entry.eventKey));
      } } },
    });
    expect(() => runtime.start()).toThrow('STORY_STABILIZE_LIMIT');
    expect(effects).toEqual([]);
  }, 30_000);

  it('rolls back state, deadlines and all effects when an atomic port batch fails', () => {
    const inline = (id: string, eventKey: string) => ({ id, type: 'quest',
      titleKey: `test.${id}`, completeOn: 'immediate', payload: { inlineEvent: { eventKey,
        actions: [{ id: `${id}_action`, op: 'test/op' }] } }, sourceRef: 'test' });
    const choice = { id: 'n_wait', type: 'choice', titleKey: 'test.wait',
      completeOn: 'story/choiceCommitted', timeWindow: { mode: 'absolute', epochId: 'epoch_ch01',
        opensAt: { year: 1093, month: 1, day: 1, hour: 0, minute: 0 },
        closesAt: { year: 1093, month: 1, day: 1, hour: 1, minute: 0 },
        onMiss: { policy: 'alternate', targetNodeId: 'n_timeout' } },
      payload: { decisionId: 'dc_test', options: [{ key: 'wait', textKey: 'test.wait' }] },
      sourceRef: 'test' };
    const line = mainLine([choice, inline('n_first', 'test/first'),
      inline('n_second', 'test/second'), end('n_done', 'done')], [
      { id: 'e_timeout', from: 'n_wait', to: 'n_first', trigger: 'timeout', priority: 0 },
      { id: 'e_first', from: 'n_first', to: 'n_second', trigger: 'auto', priority: 0 },
      { id: 'e_second', from: 'n_second', to: 'n_done', trigger: 'auto', priority: 0 },
    ]);
    const external: string[] = []; let failSecond = true; let observedAtCommit: unknown;
    const holder: { runtime?: StoryRuntime } = {};
    const runtime = new StoryRuntime([line], { ports: { quest: { commit: (batch) => {
      observedAtCommit = holder.runtime?.snapshot();
      const staged = [...external];
      for (const [index, effect] of batch.entries()) {
        if (effect.type !== 'executeEvent') continue;
        if (failSecond && index === 1) throw new Error(`PORT_SECOND_FAILED:${effect.eventKey}`);
        staged.push(effect.eventKey);
      }
      external.splice(0, external.length, ...staged);
    } } } });
    holder.runtime = runtime;
    runtime.start(); const before = runtime.snapshot();
    expect(() => runtime.advanceTo(600)).toThrow('PORT_SECOND_FAILED:test/second');
    expect(observedAtCommit).toEqual(before); expect(runtime.snapshot()).toEqual(before);
    expect(external).toEqual([]);
    failSecond = false;
    expect(runtime.advanceTo(600).snapshot.endingTags).toEqual(['done']);
    expect(external).toEqual(['test/first', 'test/second']);
  });
});
