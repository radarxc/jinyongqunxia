import { GLSL3, type WebGLRenderer } from 'three';
import { describe, expect, it } from 'vitest';
import {
  createInteriorVignette,
  interiorVignetteOpacity,
  setInteriorVignettePlan,
  updateInteriorVignette,
} from './vignette';
import { MINI_BUILDING_PLANS } from '../testing/mini-plans';

describe('interior vignette', () => {
  it('uses GLSL3 and tracks drawing-buffer pixels for the 24 px feather', () => {
    let width = 1280;
    let height = 720;
    const renderer = { domElement: { width, height } } as unknown as WebGLRenderer;
    const vignette = createInteriorVignette(renderer);
    expect(vignette.material.glslVersion).toBe(GLSL3);
    expect(vignette.material.uniforms.viewportPx.value.toArray()).toEqual([1280, 720]);
    width = 1920;
    height = 1080;
    (renderer.domElement as { width: number; height: number }).width = width;
    (renderer.domElement as { width: number; height: number }).height = height;
    updateInteriorVignette(vignette, renderer);
    expect(vignette.material.uniforms.viewportPx.value.toArray()).toEqual([1920, 1080]);
    setInteriorVignettePlan(vignette, MINI_BUILDING_PLANS[0]!);
    expect(
      vignette.material.uniforms.interiorCorners.value.map((point) =>
        point.toArray().map((value) => Number(value.toFixed(3))),
      ),
    ).toEqual([
      [-2.2, 0.17, -1.55],
      [2.2, 0.17, -1.55],
      [2.2, 0.17, 1.55],
      [-2.2, 0.17, 1.55],
    ]);
    vignette.geometry.dispose();
    vignette.material.dispose();
  });

  it('puts the hole at baseYMm + floorY for buildings on raised ground', () => {
    const renderer = { domElement: { width: 1280, height: 720 } } as unknown as WebGLRenderer;
    const vignette = createInteriorVignette(renderer);
    const source = MINI_BUILDING_PLANS[0]!;
    const raised = { ...source, elev: [1_250, source.elev[1]] as const };
    setInteriorVignettePlan(vignette, raised);
    const expectedY = (1_250 + (source.floorY[0] ?? source.elev[1])) / 1000 + 0.02;
    const corners = vignette.material.uniforms.interiorCorners.value;
    expect(corners).toHaveLength(4);
    for (const corner of corners) expect(corner.y).toBeCloseTo(expectedY, 6);
    setInteriorVignettePlan(vignette, source);
    for (const corner of corners) expect(corner.y).toBeCloseTo(expectedY - 1.25, 6);
    vignette.geometry.dispose();
    vignette.material.dispose();
  });

  it('keeps the interior clear, darkens outdoors by 30%, and feathers 24 px', () => {
    const corners = [
      [100, 100],
      [300, 100],
      [300, 300],
      [100, 300],
    ] as const;
    expect(interiorVignetteOpacity([200, 200], corners)).toBe(0);
    expect(interiorVignetteOpacity([20, 200], corners)).toBeCloseTo(0.3, 8);
    expect(interiorVignetteOpacity([100, 200], corners)).toBeCloseTo(0.15, 8);
    const insideFeather = interiorVignetteOpacity([94, 200], corners);
    const outsideFeather = interiorVignetteOpacity([106, 200], corners);
    expect(insideFeather).toBeGreaterThan(0.15);
    expect(insideFeather).toBeLessThan(0.3);
    expect(outsideFeather).toBeGreaterThan(0);
    expect(outsideFeather).toBeLessThan(0.15);
  });
});
