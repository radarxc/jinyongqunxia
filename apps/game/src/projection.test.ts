import { createCore } from '@tianshu/core';
import { describe, expect, it } from 'vitest';
import { projectTitleState } from './projection';

describe('title projection', () => {
  it('projects only title-screen data after one tick', () => {
    const core = createCore(1);
    const result = core.tick();
    expect(projectTitleState(core.snapshot(), result, 'worker')).toEqual({
      title: '天书录',
      coreVersion: '0.0.0',
      worldTick: 1,
      status: 'Core worker 已推进 1 tick',
    });
  });
});
