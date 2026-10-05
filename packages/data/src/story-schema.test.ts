import { describe, expect, it } from 'vitest';
import { StoryLineSchema, TimeWindowSchema } from './schemas';

const source = { document: 'docs/design/story/example.md', anchors: ['§1'] };

function sideLine(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    schemaVersion: 'story.v1',
    chapterId: 'ch01_tianlong',
    lineId: 'side_example',
    kind: 'side',
    titleKey: 'story.example',
    eraLayer: 'ch01',
    startNodeId: 'n_start',
    sideHooks: [],
    nodes: [
      {
        id: 'n_start',
        type: 'condition',
        titleKey: 'story.example.start',
        completeOn: 'immediate',
        payload: { expression: { op: 'flag' } },
        sourceRef: 'example §1',
      },
      {
        id: 'n_end',
        type: 'end',
        titleKey: 'story.example.end',
        completeOn: 'immediate',
        payload: { endingTags: ['complete'] },
        sourceRef: 'example §1',
      },
    ],
    edges: [{ id: 'e_finish', from: 'n_start', to: 'n_end', trigger: 'auto', priority: 0 }],
    source,
    ...overrides,
  };
}

describe('TimeWindowSchema', () => {
  it('accepts ordered half-open relative and absolute windows', () => {
    expect(TimeWindowSchema.parse({
      mode: 'relative',
      anchor: { event: 'story/nodeCompleted', nodeId: 'n_start' },
      opensAfterMinutes: 0,
      closesAfterMinutes: 60,
      onMiss: { policy: 'expire' },
    }).mode).toBe('relative');
    expect(TimeWindowSchema.parse({
      mode: 'absolute',
      epochId: 'epoch_ch01',
      opensAt: { year: 1093, month: 1, day: 30, hour: 23, minute: 59 },
      closesAt: { year: 1093, month: 2, day: 1, hour: 0, minute: 0 },
      onMiss: { policy: 'expire' },
    }).mode).toBe('absolute');
  });

  it('rejects empty or reversed absolute windows', () => {
    const base = {
      mode: 'absolute',
      epochId: 'epoch_ch01',
      opensAt: { year: 1093, month: 2, day: 1, hour: 6, minute: 0 },
      onMiss: { policy: 'expire' },
    };
    expect(TimeWindowSchema.safeParse({ ...base, closesAt: base.opensAt }).success).toBe(false);
    expect(TimeWindowSchema.safeParse({
      ...base, closesAt: { year: 1093, month: 1, day: 30, hour: 23, minute: 59 },
    }).success).toBe(false);
  });

  it('requires the identifier selected by the anchor event', () => {
    const window = {
      mode: 'relative',
      opensAfterMinutes: 0,
      closesAfterMinutes: 60,
      onMiss: { policy: 'expire' },
    };
    expect(TimeWindowSchema.safeParse({
      ...window, anchor: { event: 'story/nodeCompleted' },
    }).success).toBe(false);
    expect(TimeWindowSchema.safeParse({
      ...window, anchor: { event: 'quest/accepted' },
    }).success).toBe(false);
  });
});

describe('StoryLineSchema', () => {
  it('requires a trigger condition or time window', () => {
    expect(StoryLineSchema.safeParse(sideLine({ trigger: {} })).success).toBe(false);
  });

  it('permits a timeout edge only for an alternate miss policy', () => {
    const line = sideLine();
    const nodes = line['nodes'] as Record<string, unknown>[];
    nodes[0] = {
      ...nodes[0],
      timeWindow: {
        mode: 'relative',
        anchor: { event: 'story/nodeCompleted', nodeId: 'n_previous' },
        opensAfterMinutes: 0,
        closesAfterMinutes: 60,
        onMiss: { policy: 'expire' },
      },
    };
    line['edges'] = [{ id: 'e_timeout', from: 'n_start', to: 'n_end', trigger: 'timeout', priority: 0 }];
    expect(StoryLineSchema.safeParse(line).success).toBe(false);
  });

  it('rejects duplicate choice option keys even when matching edges are duplicated', () => {
    const line = sideLine({
      nodes: [
        {
          id: 'n_start', type: 'choice', titleKey: 'story.example.choice',
          completeOn: 'story/choiceCommitted', sourceRef: 'example §1',
          payload: {
            decisionId: 'dc_example',
            options: [
              { key: 'same', textKey: 'story.example.same.first' },
              { key: 'same', textKey: 'story.example.same.second' },
            ],
          },
        },
        {
          id: 'n_end', type: 'end', titleKey: 'story.example.end',
          completeOn: 'immediate', payload: { endingTags: ['complete'] }, sourceRef: 'example §1',
        },
      ],
      edges: [
        { id: 'e_first', from: 'n_start', to: 'n_end', trigger: 'choice', choiceKey: 'same', priority: 1 },
        { id: 'e_second', from: 'n_start', to: 'n_end', trigger: 'choice', choiceKey: 'same', priority: 0 },
      ],
    });
    expect(StoryLineSchema.safeParse(line).success).toBe(false);
  });

  it('requires an auto fallback when condition routes are not statically exhaustive', () => {
    const line = sideLine({
      nodes: [
        {
          id: 'n_start', type: 'condition', titleKey: 'story.example.gate',
          completeOn: 'immediate', payload: { expression: { op: 'gate' } }, sourceRef: 'example §1',
        },
        {
          id: 'n_left', type: 'end', titleKey: 'story.example.left',
          completeOn: 'immediate', payload: { endingTags: ['left'] }, sourceRef: 'example §1',
        },
        {
          id: 'n_right', type: 'end', titleKey: 'story.example.right',
          completeOn: 'immediate', payload: { endingTags: ['right'] }, sourceRef: 'example §1',
        },
      ],
      edges: [
        { id: 'e_left', from: 'n_start', to: 'n_left', trigger: 'condition', condition: { op: 'left' }, priority: 1 },
        { id: 'e_right', from: 'n_start', to: 'n_right', trigger: 'condition', condition: { op: 'right' }, priority: 0 },
      ],
    });
    expect(StoryLineSchema.safeParse(line).success).toBe(false);
  });

  it('accepts condition branches that exactly cover the gate any-expression', () => {
    const left = { flag: { id: 'left', state: true } };
    const right = { flag: { id: 'right', state: true } };
    const line = sideLine({
      nodes: [
        { id: 'n_start', type: 'condition', titleKey: 'story.example.gate', completeOn: 'immediate',
          payload: { expression: { any: [left, right] } }, sourceRef: 'example §1' },
        { id: 'n_left', type: 'end', titleKey: 'story.example.left', completeOn: 'immediate',
          payload: { endingTags: ['left'] }, sourceRef: 'example §1' },
        { id: 'n_right', type: 'end', titleKey: 'story.example.right', completeOn: 'immediate',
          payload: { endingTags: ['right'] }, sourceRef: 'example §1' },
      ],
      edges: [
        { id: 'e_left', from: 'n_start', to: 'n_left', trigger: 'condition', condition: left, priority: 1 },
        { id: 'e_right', from: 'n_start', to: 'n_right', trigger: 'condition', condition: right, priority: 0 },
      ],
    });
    expect(StoryLineSchema.safeParse(line).success).toBe(true);
  });
});
