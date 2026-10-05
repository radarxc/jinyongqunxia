import { describe, expect, it, vi } from 'vitest';
import { PwaController } from './controller';

describe('PwaController activation safeguards', () => {
  it('blocks force update during a local transaction and preserves asset caches', async () => {
    let safe = false; const unregister = vi.fn(async () => undefined);
    const deleteShellCaches = vi.fn(async () => undefined); const reload = vi.fn();
    const controller = new PwaController({ safety: () => ({ localTransactionComplete: safe,
      inBattle: false, dialogueCommitting: false }), unregister, deleteShellCaches, reload });
    await controller.forceUpdate();
    expect(unregister).not.toHaveBeenCalled(); expect(reload).not.toHaveBeenCalled();
    safe = true; await controller.forceUpdate();
    expect(unregister).toHaveBeenCalledOnce(); expect(deleteShellCaches).toHaveBeenCalledOnce();
    expect(reload).toHaveBeenCalledOnce();
  });
  it('sends at most one activation while a request is still running', async () => {
    let finish: () => void = () => undefined;
    const update = vi.fn(() => new Promise<void>(resolve => { finish = resolve; }));
    const controller = new PwaController(); await controller.needRefresh(update, false);
    const safety = { localTransactionComplete: true, inBattle: false, dialogueCommitting: false };
    const first = controller.activate(safety); const second = controller.activate(safety);
    finish(); await first;
    expect(await second).toBe(false); expect(update).toHaveBeenCalledOnce();
  });
  it('returns to ready after an activation error so a retry remains possible', async () => {
    const controller = new PwaController();
    await controller.needRefresh(async () => { throw new Error('connection lost'); }, false);
    expect(await controller.activate({ localTransactionComplete: true, inBattle: false,
      dialogueCommitting: false })).toBe(false);
    expect(controller.snapshot().update.phase).toBe('ready');
    expect(controller.snapshot().update.error).toBe('connection lost');
  });
  it('allows an explicit safety snapshot to override the conservative provider fallback', async () => {
    const update = vi.fn(async () => undefined);
    const controller = new PwaController({ safety: () => ({ localTransactionComplete: false,
      inBattle: true, dialogueCommitting: true }) });
    await controller.needRefresh(update, false);
    expect(await controller.activate({ localTransactionComplete: true, inBattle: false,
      dialogueCommitting: false })).toBe(true);
    expect(update).toHaveBeenCalledOnce();
  });
});
