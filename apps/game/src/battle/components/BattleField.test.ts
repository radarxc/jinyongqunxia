// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils';
import { shallowRef } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { BattleCell, BattleRenderer, ScreenPoint } from '@tianshu/render/battle';
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

function rendererFixture(overrides: Partial<BattleRenderer> = {}): BattleRenderer {
  const project = vi.fn((_q: number, _r: number, _height: number, out: ScreenPoint) => {
    Object.assign(out, { x: 10, y: 20, visible: true });
  });
  return {
    stats: { drawCalls: 4, characters: 2, instances: 2, cpuMs: 0, frameMs: 0, placeholders: 0,
      modelCharacters: 0, modelDrawCalls: 0, modelFailures: 0, modelMoving: 0 },
    camera: { yawDeg: 45, rotating: false, rotate: vi.fn(async () => undefined) },
    contextState: 'ok', updateUnits: vi.fn(), setHighlights: vi.fn(), render: vi.fn(),
    resize: vi.fn(), project,
    projectUnit: vi.fn((_id: string, q: number, r: number, height: number, out: ScreenPoint) => {
      project(q, r, height, out);
    }),
    snapshot: vi.fn(), setTimeOfDay: vi.fn(), pick: vi.fn(() => null), dispose: vi.fn(),
    ...overrides,
  };
}
function pickedCell(packet: ReturnType<BattleRuntime['packet']>, q: number, r: number): BattleCell {
  return packet.info!.cells.find(cell => cell.q === q && cell.r === r)!;
}
beforeEach(() => {
  vi.stubGlobal('ResizeObserver', class { observe = vi.fn(); disconnect = vi.fn(); });
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); document.body.innerHTML = ''; });

describe('battle field movement draft', () => {
  it('shows core reachability and sends a read-only destination preview', async () => {
    const packet = new BattleRuntime(createBattleDemo('world')).packet(true);
    const destination = packet.capabilities.move.reachable.find(cell => cell.cost > 0)!;
    const setHighlights = vi.fn();
    const renderer = rendererFixture({ setHighlights,
      pick: vi.fn(() => pickedCell(packet, destination.q, destination.r)) });
    renderMocks.createBattleRenderer.mockResolvedValue(renderer);
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
    expect(renderer.projectUnit).toHaveBeenCalled();
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
    runtime.previewArea({ t: 'battle/preview', kind: 'move', revision: 0, requestId: 1,
      actor: initial.actorId!, destination });
    const packet = { ...runtime.packet(true), info: initial.info! };
    const setHighlights = vi.fn();
    const renderer = rendererFixture({ setHighlights });
    renderMocks.createBattleRenderer.mockResolvedValue(renderer);
    const controller = { movement: shallowRef(false), active: shallowRef(false), preview: vi.fn(),
      setMovement: vi.fn(), setActive: vi.fn(),
      onMoveResolved: vi.fn(() => () => undefined) } as unknown as BattleController;
    const wrapper = mount(BattleField, { attachTo: document.body, props: { controller,
      battle: packet, selected: packet.actorId, reducedMotion: false,
      floating: [], skip: false } });
    await flushPromises();
    expect(setHighlights).toHaveBeenCalledWith(expect.objectContaining({
      selected: `${packet.units[0]!.q},${packet.units[0]!.r}`,
      path: destination.path.map(cell => `${cell.q},${cell.r}`),
      ghost: `${destination.q},${destination.r}`,
    }));
    expect(renderer.projectUnit).toHaveBeenCalled();
    wrapper.unmount();
  });
  it('keeps highlights and other unit labels when one unit projection fails', async () => {
    const runtime = new BattleRuntime(createBattleDemo('world'));
    const initial = runtime.packet(true);
    const destination = initial.capabilities.move.reachable.find(cell => cell.cost > 0)!;
    runtime.previewArea({ t: 'battle/preview', kind: 'move', revision: 0, requestId: 1,
      actor: initial.actorId!, destination });
    const packet = { ...runtime.packet(true), info: initial.info! };
    const setHighlights = vi.fn();
    const project = vi.fn((_q: number, _r: number, _height: number, out: ScreenPoint) => {
      Object.assign(out, { x: 30, y: 40, visible: true });
    });
    const projectUnit = vi.fn((id: string, q: number, r: number, height: number, out: ScreenPoint) => {
      if (id === packet.units[0]!.id) throw new Error('model projection failed');
      Object.assign(out, { x: q + 50, y: r + 60, visible: true });
    });
    const renderer = rendererFixture({ setHighlights, project, projectUnit,
      pick: vi.fn(() => pickedCell(packet, destination.q, destination.r)) });
    renderMocks.createBattleRenderer.mockResolvedValue(renderer);
    const preview = vi.fn();
    const controller = { movement: shallowRef(true), active: shallowRef(false), preview,
      setMovement: vi.fn(), setActive: vi.fn(),
      onMoveResolved: vi.fn(() => () => undefined) } as unknown as BattleController;
    const wrapper = mount(BattleField, { attachTo: document.body, props: { controller,
      battle: { ...packet, info: packet.info! }, selected: packet.actorId, reducedMotion: false,
      floating: [], skip: false } });
    await flushPromises();
    expect(setHighlights).toHaveBeenCalledWith(expect.objectContaining({
      reachable: packet.capabilities.move.reachable.map(cell => `${cell.q},${cell.r}`),
      path: destination.path.map(cell => `${cell.q},${cell.r}`),
      ghost: `${destination.q},${destination.r}`,
    }));
    expect(projectUnit.mock.calls.map(call => call[0])).toEqual(
      expect.arrayContaining(packet.units.map(unit => unit.id)),
    );
    expect(project).toHaveBeenCalledWith(packet.units[0]!.q, packet.units[0]!.r,
      packet.units[0]!.height, expect.any(Object));
    expect(wrapper.findAll('.unit-label')).toHaveLength(packet.units.length);
    expect(wrapper.findAll('.unit-label').every(label => label.isVisible())).toBe(true);
    setHighlights.mockClear();
    await wrapper.setProps({ battle: { ...packet, units: packet.units.map((unit, index) =>
      index === 0 ? { ...unit, q: unit.q + 1 } : unit) } });
    await flushPromises();
    expect(setHighlights).toHaveBeenCalledWith(expect.objectContaining({
      reachable: packet.capabilities.move.reachable.map(cell => `${cell.q},${cell.r}`),
      path: destination.path.map(cell => `${cell.q},${cell.r}`),
      ghost: `${destination.q},${destination.r}`,
    }));
    await wrapper.get('canvas[aria-label="六角地形与分层角色"]').trigger('click');
    expect(preview).toHaveBeenCalledWith({ kind: 'move', revision: packet.revision,
      actor: packet.actorId, destination: { q: destination.q, r: destination.r } });
    wrapper.unmount();
  });
  it('still sends highlights when renderer unit synchronization fails', async () => {
    const packet = new BattleRuntime(createBattleDemo('world')).packet(true);
    const setHighlights = vi.fn();
    const renderer = rendererFixture({ setHighlights,
      updateUnits: vi.fn(() => { throw new Error('unit synchronization failed'); }) });
    renderMocks.createBattleRenderer.mockResolvedValue(renderer);
    const controller = { movement: shallowRef(true), active: shallowRef(false), preview: vi.fn(),
      setMovement: vi.fn(), setActive: vi.fn(),
      onMoveResolved: vi.fn(() => () => undefined) } as unknown as BattleController;
    const wrapper = mount(BattleField, { attachTo: document.body, props: { controller,
      battle: { ...packet, info: packet.info! }, selected: packet.actorId, reducedMotion: false,
      floating: [], skip: false } });
    await flushPromises();
    expect(setHighlights).toHaveBeenCalledWith(expect.objectContaining({
      reachable: packet.capabilities.move.reachable.map(cell => `${cell.q},${cell.r}`),
    }));
    wrapper.unmount();
  });
});
