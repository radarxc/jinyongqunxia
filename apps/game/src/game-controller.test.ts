import { createPinia } from 'pinia';
import { describe, expect, it, vi } from 'vitest';
import { useUiStore } from '@tianshu/ui/runtime';
import type { GameHost } from './runtime/contracts';
import { createGameController } from './game-controller';

function failingHost(): GameHost {
  return { mode: 'main-thread', dispatch: vi.fn().mockRejectedValue(new TypeError('INT_OVERFLOW')),
    query: vi.fn(), snapshot: vi.fn(), validate: vi.fn(), restore: vi.fn(),
    subscribe: () => () => undefined, dispose: vi.fn() } as unknown as GameHost;
}

describe('game controller engine failure boundary', () => {
  it('terminates gameplay after an internal command error while retaining the host for export', async () => {
    const host = failingHost();
    const controller = createGameController(host, useUiStore(createPinia()));
    controller.loading.value = false; controller.setSceneRunsWorldTicks(true);
    const logged = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      await controller.worldMapCommand({ t: 'worldmap/cancel' });
      expect(controller.notice.value).toContain('游戏内部错误');
      expect(controller.canRunWorldTicks()).toBe(false);
      await controller.worldMapCommand({ t: 'worldmap/cancel' });
      expect(host.dispatch).toHaveBeenCalledTimes(1);
      expect(host.dispose).not.toHaveBeenCalled();
    } finally { logged.mockRestore(); controller.dispose(); }
  });
});
