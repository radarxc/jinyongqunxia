import { describe, expect, it, vi } from 'vitest';
import { mountRegionCommand, regionPointerCommand, requestedRegion, walkedRegionPath } from './commands';
import { regionKeyboardTarget } from './presentation';

const bounds = {} as DOMRect;
describe('region input adapters', () => {
  it('maps ground preview and commit without evaluating path rules', () => {
    const scene = { pickAnchor: vi.fn(() => null), pickHex: vi.fn(() => ({ q: 4, r: -2 })) };
    expect(regionPointerCommand(scene, 10, 20, bounds, false)).toEqual({
      t: 'world/previewRegionPath', hex: { q: 4, r: -2 } });
    expect(regionPointerCommand(scene, 10, 20, bounds, true)).toEqual({
      t: 'world/walkTo', hex: { q: 4, r: -2 } });
  });

  it('gives an anchor hit priority and emits only its core identity', () => {
    const scene = { pickAnchor: vi.fn(() => ({ anchorId: 'door_exit', class: 'Door',
      hex: { q: 2, r: 0 }, enabled: false, reason: 'locked' })),
      pickHex: vi.fn(() => ({ q: 2, r: 0 })) };
    expect(regionPointerCommand(scene, 10, 20, bounds, true)).toEqual({
      t: 'world/interact', anchorId: 'door_exit' });
    expect(scene.pickHex).not.toHaveBeenCalled();
  });

  it('maps WASD relative to camera yaw while leaving legality to core', () => {
    expect(regionKeyboardTarget({ q: 4, r: 7 }, 's', 0)).toEqual({ q: 5, r: 7 });
    expect(regionKeyboardTarget({ q: 4, r: 7 }, 's', 180)).toEqual({ q: 3, r: 7 });
    expect(regionKeyboardTarget({ q: 4, r: 7 }, 'w', 45)).toEqual({ q: 4, r: 6 });
    expect(regionKeyboardTarget({ q: 4, r: 7 }, 'Enter', 45)).toBeNull();
  });

  it('reads core paths and rejects exits without a spawn ID', () => {
    const update = { accepted: true, changes: {}, events: [{ t: 'world/walked', payload: {
      path: [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 1.5, r: 1 }] } }] };
    expect(walkedRegionPath(update as never)).toEqual([{ q: 0, r: 0 }, { q: 1, r: 0 }]);
    const requestUpdate = { accepted: true, changes: {}, events: [{ t: 'world/regionRequested',
      payload: { regionId: 'rg_baima', sceneId: 'sc_10_shamo', spawnId: null } }] };
    const request = requestedRegion(requestUpdate as never); expect(request).not.toBeNull();
    expect(mountRegionCommand(request!)).toBeNull();
  });
});
