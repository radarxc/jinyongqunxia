import { describe, expect, it, vi } from 'vitest';
import { PwaController } from './controller';
import { initialPwaSnapshot, reducePwaState, UPDATE_REMINDER_MS } from './machine';

describe('PWA update state machine', () => {
  it('does not activate outside a safe point', () => {
    const ready = reducePwaState(reducePwaState(initialPwaSnapshot(),
      { type: 'UPDATE_FOUND', now: 1, hasDownloadedPacks: false }), { type: 'READY' });
    expect(reducePwaState(ready, { type: 'ACTIVATE', safety: { localTransactionComplete: false,
      inBattle: false, dialogueCommitting: false } }).phase).toBe('ready');
    expect(reducePwaState(ready, { type: 'ACTIVATE', safety: { localTransactionComplete: true,
      inBattle: true, dialogueCommitting: false } }).phase).toBe('ready');
  });

  it('repeats the reminder only after 24 hours', () => {
    let state = reducePwaState(reducePwaState(initialPwaSnapshot(),
      { type: 'UPDATE_FOUND', now: 10, hasDownloadedPacks: false }), { type: 'READY' });
    state = reducePwaState(state, { type: 'REMIND_LATER', now: 10 });
    expect(reducePwaState(state, { type: 'TICK', now: 10 + UPDATE_REMINDER_MS - 1 }).phase).toBe('needRefresh');
    expect(reducePwaState(state, { type: 'TICK', now: 10 + UPDATE_REMINDER_MS }).phase).toBe('ready');
  });

  it('schedules the 24 hour reminder through the controller', () => {
    let now = 10; let callback: (() => void) | undefined; const schedule = vi.fn((next: () => void) => {
      callback = next; return 1 as unknown as ReturnType<typeof setTimeout>;
    });
    const controller = new PwaController({ now: () => now, schedule });
    void controller.needRefresh(async () => undefined, false); controller.remindLater();
    expect(schedule).toHaveBeenCalledWith(expect.any(Function), UPDATE_REMINDER_MS);
    now += UPDATE_REMINDER_MS; callback?.(); expect(controller.snapshot().update.phase).toBe('ready');
  });

  it('requires an explicit safe point and then activates after delta sync', async () => {
    const activate = vi.fn(async () => undefined); const sync = vi.fn(async () => undefined);
    const controller = new PwaController({ now: () => 1 });
    await controller.needRefresh(activate, true, sync);
    expect(controller.snapshot().update.phase).toBe('ready'); expect(sync).toHaveBeenCalledOnce();
    expect(await controller.activate()).toBe(false); expect(activate).not.toHaveBeenCalled();
    expect(await controller.activate({ localTransactionComplete: true, inBattle: false,
      dialogueCommitting: false })).toBe(true); expect(activate).toHaveBeenCalledWith(true);
  });
});
