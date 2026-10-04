import { describe, expect, it, vi } from 'vitest';
import { probeVersion } from './network';

describe('probeVersion', () => {
  it('requires the no-cache version endpoint to respond successfully', async () => {
    const fetcher = vi.fn(async () => new Response('{}'));
    expect(await probeVersion({ fetch: fetcher, now: () => 4 })).toEqual({
      status: 'online', browserOnline: true, reachable: true, checkedAt: 4 });
    expect(fetcher).toHaveBeenCalledWith('/version.json?__ts_probe=4',
      expect.objectContaining({ cache: 'no-store' }));
  });
  it('reports a failed probe as offline', async () => {
    expect((await probeVersion({ fetch: async () => { throw new Error('network'); } })).status).toBe('offline');
  });
});
