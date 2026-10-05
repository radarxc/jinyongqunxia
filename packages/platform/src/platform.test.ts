import { createCore } from '@tianshu/core';
import { describe, expect, it } from 'vitest';
import { createMainThreadCoreHost } from './index';

describe('main-thread CoreHost', () => {
  it('normalizes synchronous core calls to promises', async () => {
    const host = createMainThreadCoreHost(createCore(1));
    expect(host.mode).toBe('main-thread');
    await expect(host.tick()).resolves.toMatchObject({ accepted: true });
    await expect(host.snapshot()).resolves.toMatchObject({ meta: { worldTick: 1 } });
    host.dispose();
  });
});
