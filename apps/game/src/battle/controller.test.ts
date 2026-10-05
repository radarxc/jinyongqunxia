import { describe, expect, it, vi } from 'vitest';
import type { DomainEvent } from '@tianshu/core';
import type { GameHost, GameUpdate } from '../runtime/contracts';
import { createBattleController, type FrameScheduler } from './controller';
import { BattleRuntime } from './runtime';
import { createBattleDemo } from './demo';

function harness() {
  let listener: ((update: GameUpdate) => void) | undefined; let frame: ((time: number) => void) | undefined;
  const dispatch = vi.fn(async () => ({ accepted: true, changes: {}, events: [] }));
  const host = { dispatch, subscribe: vi.fn(callback => { listener = callback; return () => undefined; }) } as unknown as GameHost;
  const frames: FrameScheduler = { request(callback) { frame = callback; return 1; }, cancel: vi.fn() };
  const controller = createBattleController(host, frames);
  return { controller, dispatch, publish(update: GameUpdate) { listener!(update); }, tick(time: number) { frame!(time); } };
}
describe('battle controller', () => {
  it('stays inert when lazy construction loses a race with host disposal', async () => {
    const host = {
      dispatch: vi.fn(),
      subscribe: vi.fn(() => { throw new Error('HOST_DISPOSED'); }),
    } as unknown as GameHost;
    const frames: FrameScheduler = { request: vi.fn(() => 1), cancel: vi.fn() };
    const controller = createBattleController(host, frames);
    expect(frames.request).not.toHaveBeenCalled();
    expect(await controller.command({ t: 'battle/step', revision: 0 })).toBe(false);
    controller.dispose();
  });
  it('steps AI by animation frame and lets the player take over immediately', async () => {
    const kit = harness(); const packet = new BattleRuntime(createBattleDemo('world')).packet(true);
    kit.controller.apply({ ...packet, auto: true }); kit.controller.setActive(true); kit.tick(1000);
    await Promise.resolve();
    expect(kit.dispatch).toHaveBeenCalledWith({ t: 'battle/step', revision: 0 });
    expect(await kit.controller.setAuto(false)).toBe(true);
    expect(kit.dispatch).toHaveBeenLastCalledWith({ t: 'battle/auto', enabled: false });
    kit.controller.dispose();
  });
  it('uses core event prose in the log and invokes the ENG-11 playback hook', () => {
    const kit = harness(); const packet = new BattleRuntime(createBattleDemo('world')).packet(true);
    kit.controller.apply(packet); const hook = vi.fn(); kit.controller.onMoveResolved(hook);
    const resolved = { moveId: 'mv_basic_strike', from: packet.units[0]!, to: [packet.units[1]!],
      result: { actionNo: 1, hpDamage: 7, events: [] } };
    kit.publish({ accepted: true, changes: { battle: { ...packet, units: [], resolved } }, events: [
      { t: 'combat.qiRepel', payload: { t: 'combat.qiRepel', actionNo: 1, actor: 'hero',
        target: 'enemy_0', message: '真气鼓荡震开攻击' } } as DomainEvent,
      { t: 'qi.fullCycleCrit', payload: { t: 'qi.fullCycleCrit', unitId: 'hero',
        targetIds: ['enemy_0'], battleTick: 1, message: '运转一周天，内劲喷涌而出，难以抵挡' } } as DomainEvent,
    ] });
    expect(kit.controller.logs.value[0]?.text).toBe('真气鼓荡震开攻击');
    expect(kit.controller.logs.value[1]).toMatchObject({ text: '运转一周天，内劲喷涌而出，难以抵挡',
      event: { actionNo: 0, actor: 'hero', target: 'enemy_0' } });
    expect(hook).toHaveBeenCalledWith(resolved.moveId, resolved.from, resolved.to, resolved.result);
    kit.controller.dispose();
  });
  it('queues movement and cancel previews through the existing read-only preview route', async () => {
    const kit = harness(); const packet = new BattleRuntime(createBattleDemo('world')).packet(true);
    kit.controller.apply(packet);
    kit.controller.preview({ kind: 'move', revision: packet.revision, actor: packet.actorId!,
      destination: { q: -1, r: 0 } });
    await Promise.resolve();
    expect(kit.dispatch).toHaveBeenCalledWith({ t: 'battle/preview', kind: 'move',
      revision: packet.revision, actor: packet.actorId, destination: { q: -1, r: 0 }, requestId: 1 });
    kit.controller.preview({ kind: 'cancel', revision: packet.revision });
    await Promise.resolve();
    expect(kit.dispatch).toHaveBeenLastCalledWith({ t: 'battle/preview', kind: 'cancel',
      revision: packet.revision, requestId: 2 });
    kit.controller.dispose();
  });
  it('cancels an area-only draft even when no movement destination is selected', async () => {
    const kit = harness(); const runtime = new BattleRuntime(createBattleDemo('world'));
    kit.controller.apply(runtime.packet(true));
    const packet = runtime.previewArea({ t: 'battle/preview', revision: 0, actor: 'hero',
      moveId: 'mv_basic_strike', anchor: { q: 1, r: 0 },
      aim: { dirCount: 6, dir: 0 }, requestId: 1 });
    expect(packet.capabilities.move.selected).toBeNull();
    expect(packet.preview).not.toBeNull();
    kit.controller.apply(packet);
    await kit.controller.command({ t: 'battle/cancel-plan', revision: packet.revision });
    await Promise.resolve();
    expect(kit.dispatch).toHaveBeenLastCalledWith({ t: 'battle/preview', kind: 'cancel',
      revision: packet.revision, requestId: 1 });
    kit.controller.dispose();
  });
  it('keeps movement mode local and adds the selected core path to area previews', async () => {
    const kit = harness(); const runtime = new BattleRuntime(createBattleDemo('world'));
    kit.controller.apply(runtime.packet(true));
    await kit.controller.command({ t: 'battle/movement-mode', enabled: true });
    expect(kit.controller.movement.value).toBe(true);
    expect(kit.dispatch).not.toHaveBeenCalled();
    const moved = runtime.previewArea({ t: 'battle/preview', kind: 'move', revision: 0,
      actor: 'hero', destination: { q: 0, r: 1 }, requestId: 1 });
    kit.controller.apply(moved);
    kit.controller.preview({ revision: 0, actor: 'hero', moveId: 'mv_basic_strike',
      anchor: { q: 1, r: 0 }, aim: { dirCount: 6, dir: 0 } });
    await Promise.resolve();
    expect(kit.dispatch).toHaveBeenCalledWith(expect.objectContaining({ t: 'battle/preview',
      walkTo: { q: 0, r: 1 } }));
    kit.controller.dispose();
  });
});
