// @vitest-environment happy-dom
import { Mesh, type Texture, type WebGLRenderer } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { createContextGuard } from '../../core/context-guard';
import { MINI_BUILD_KIT, MINI_BUILDING_PLANS } from '../testing/mini-plans';
import { createBuildingLayer } from './layer';

describe('BuildingLayer context recovery', () => {
  it('rebuilds owned geometry and reuploads CPU texture copies on browser restoration', async () => {
    const canvas = document.createElement('canvas');
    const context = { isContextLost: vi.fn(() => false) };
    const initTexture = vi.fn<(texture: Texture) => void>();
    const renderer = {
      initTexture,
      compileAsync: vi.fn(async () => {}),
      domElement: canvas,
      getContext: () => context,
      setPixelRatio: vi.fn(),
      setSize: vi.fn(),
    } as unknown as WebGLRenderer;
    const layer = await createBuildingLayer({
      plans: [MINI_BUILDING_PLANS[0]!],
      walls: [],
      kit: MINI_BUILD_KIT,
      renderer,
      generator: 'inline',
      quality: { tier: 'high', renderScale: 1, effectivePixelRatio: (value) => value },
    });
    layer.update(0, false);
    const before = new Map<string, unknown>();
    layer.object.traverse((object) => {
      if (object instanceof Mesh) before.set(object.name, object.geometry);
    });
    initTexture.mockClear();
    const guard = createContextGuard(canvas, renderer, { onRestore: layer.restore });
    const lost = new Event('webglcontextlost', { cancelable: true });
    canvas.dispatchEvent(lost);
    expect(lost.defaultPrevented).toBe(true);
    canvas.dispatchEvent(new Event('webglcontextrestored'));
    layer.object.traverse((object) => {
      if (object instanceof Mesh && before.has(object.name))
        expect(object.geometry, object.name).not.toBe(before.get(object.name));
    });
    expect(initTexture.mock.calls.length).toBeGreaterThanOrEqual(4);
    guard.dispose();
    layer.dispose();
  });
});
