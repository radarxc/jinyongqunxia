// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils';
import { shallowRef } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { BattleRenderer } from '@tianshu/render/battle';
import { createBattleDemo } from '../demo';
import { BattleRuntime } from '../runtime';
import type { BattleController } from '../controller';
import BattleField from './BattleField.vue';

const renderMocks = vi.hoisted(() => ({ createBattleRenderer: vi.fn() }));
vi.mock('@tianshu/render/battle', () => ({ createBattleRenderer: renderMocks.createBattleRenderer }));
vi.mock('../../render-host', () => ({
  createRenderQuality: vi.fn(async () => ({ contextLosses7d: 0, effectivePixelRatio: () => 1 })),
  reloadLatestRenderAutosave: vi.fn(async () => false),
}));
vi.mock('../vfx', () => ({ bindBattleVfx: vi.fn(() => () => undefined) }));

afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); document.body.innerHTML = ''; });

describe('battle field movement draft', () => {
  it('shows core reachability and sends a read-only destination preview', async () => {
    const packet = new BattleRuntime(createBattleDemo('world')).packet(true);
    const destination = packet.capabilities.move.reachable.find(cell => cell.cost > 0)!;
    const setHighlights = vi.fn();
    const renderer = { stats: { drawCalls: 4, characters: 2, instances: 2, cpuMs: 0, frameMs: 0, placeholders: 0 },
      camera: { yawDeg: 45, rotating: false, rotate: vi.fn(async () => undefined) }, contextState: 'ok',
      updateUnits: vi.fn(), setHighlights, render: vi.fn(), resize: vi.fn(), setTimeOfDay: vi.fn(),
      project: vi.fn((_q, _r, _height, out) => Object.assign(out, { x: 0, y: 0, visible: true })),
      snapshot: vi.fn(), pick: vi.fn(() => destination), dispose: vi.fn(),
    } as unknown as BattleRenderer;
    renderMocks.createBattleRenderer.mockResolvedValue(renderer);
    vi.stubGlobal('ResizeObserver', class { observe = vi.fn(); disconnect = vi.fn(); });
    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    const preview = vi.fn(); const setMovement = vi.fn();
    const controller = { movement: shallowRef(true), active: shallowRef(false), preview, setMovement,
      setActive: vi.fn(), onMoveResolved: vi.fn(() => () => undefined) } as unknown as BattleController;
    const battle = { ...packet, info: packet.info! };
    const wrapper = mount(BattleField, { attachTo: document.body, props: { controller, battle,
      selected: packet.actorId, reducedMotion: false, floating: [], skip: false } });
    await flushPromises();
    expect(setHighlights).toHaveBeenCalledWith(expect.objectContaining({
      reachable: packet.capabilities.move.reachable.map(cell => `${cell.q},${cell.r}`),
    }));
    await wrapper.get('canvas[aria-label="六角地形与分层角色"]').trigger('click');
    expect(preview).toHaveBeenCalledWith({ kind: 'move', revision: packet.revision,
      actor: packet.actorId, destination: { q: destination.q, r: destination.r } });
    expect(setMovement).toHaveBeenCalledWith(false);
    wrapper.unmount();
  });
  it('renders the selected core path and destination through the retained highlight texture API', async () => {
    const runtime = new BattleRuntime(createBattleDemo('world'));
    const initial = runtime.packet(true); const destination = initial.capabilities.move.reachable.find(
      cell => cell.cost > 0)!;
    const projected = runtime.previewArea({ t: 'battle/preview', kind: 'move', revision: 0, requestId: 1,
      actor: initial.actorId!, destination });
    const packet = { ...projected, info: initial.info! };
    const setHighlights = vi.fn();
    const renderer = { stats: { drawCalls: 4, characters: 2, instances: 2, cpuMs: 0, frameMs: 0, placeholders: 0 },
      camera: { yawDeg: 45, rotating: false, rotate: vi.fn(async () => undefined) }, contextState: 'ok',
      updateUnits: vi.fn(), setHighlights, render: vi.fn(), resize: vi.fn(), setTimeOfDay: vi.fn(),
      project: vi.fn((_q, _r, _height, out) => Object.assign(out, { x: 0, y: 0, visible: true })),
      snapshot: vi.fn(), pick: vi.fn(), dispose: vi.fn(),
    } as unknown as BattleRenderer;
    renderMocks.createBattleRenderer.mockResolvedValue(renderer);
    vi.stubGlobal('ResizeObserver', class { observe = vi.fn(); disconnect = vi.fn(); });
    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    const controller = { movement: shallowRef(false), active: shallowRef(false), preview: vi.fn(),
      setMovement: vi.fn(), setActive: vi.fn(),
      onMoveResolved: vi.fn(() => () => undefined) } as unknown as BattleController;
    const wrapper = mount(BattleField, { attachTo: document.body, props: { controller,
      battle: packet, selected: packet.actorId, reducedMotion: false,
      floating: [], skip: false } });
    await flushPromises();
    expect(setHighlights).toHaveBeenCalledWith(expect.objectContaining({
      path: destination.path.map(cell => `${cell.q},${cell.r}`),
      ghost: `${destination.q},${destination.r}`,
    }));
    wrapper.unmount();
  });
});
