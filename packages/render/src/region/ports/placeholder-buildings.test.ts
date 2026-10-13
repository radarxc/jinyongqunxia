import { Raycaster, Vector3, type Mesh, type ShaderMaterial, type WebGLRenderer } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { MINI_BUILDING_PLANS, MINI_BUILD_KIT } from '../../buildgen/testing/mini-plans';
import { getDefaultRenderQuality } from '../../quality/tiers';
import { createPlaceholderBuildingLayer } from './placeholder-buildings';

const atX = (index: number, xMm: number) => ({ ...MINI_BUILDING_PLANS[index % 2]!,
  id: `same_${index}`, footprint: [xMm,4_000,6_000,5_000] as const });
const input = (plans = MINI_BUILDING_PLANS.slice(0, 1)) => ({
  plans, walls: [], kit: MINI_BUILD_KIT, quality: getDefaultRenderQuality(),
  renderer: { domElement: { width: 1280, height: 720 } } as WebGLRenderer,
});
const debug = (layer: ReturnType<typeof createPlaceholderBuildingLayer>) =>
  layer.object.userData['placeholder'] as {
    states: Array<{ roof: number; wall: number; vignette: number }>; stateData: Uint8Array;
    uniforms: { uFacadeMask: { value: number } }; shells: Mesh[]; roofs: Mesh[];
    vignette: Mesh & { material: ShaderMaterial & { uniforms: Record<string, { value: unknown }> } };
  };

describe('placeholder building port', () => {
  it.each([[45,9],[135,3],[225,6],[315,12]] as const)(
    'uses the tech/16 cut facade set at yaw %i', (yaw, mask) => {
      const layer = createPlaceholderBuildingLayer(input()); layer.setCutaway(0, 2);
      layer.setCameraYaw(yaw); layer.update(.25, false); const value = debug(layer);
      const facades = [...new Set(Array.from(
        value.shells[0]!.geometry.getAttribute('aFacade').array as ArrayLike<number>))]
        .filter(facade => (facade & mask) !== 0);
      expect(value.uniforms.uFacadeMask.value).toBe(mask); expect(facades).toEqual(
        [1,2,4,8].filter(facade => (facade & mask) !== 0)); expect(value.states[0]!.wall).toBe(1);
      const mesh = value.shells[0]!; const positions = mesh.geometry.getAttribute('position');
      const grounds = mesh.geometry.getAttribute('aGround'); const sides = mesh.geometry.getAttribute('aFacade');
      const tops = new Map<number,number>();
      for (let vertex = 0; vertex < positions.count; vertex += 1) {
        const side = sides.getX(vertex); const ground = grounds.getX(vertex); const y = positions.getY(vertex);
        const outputY = (side & mask) !== 0 ? y-Math.max(0,y-ground-1) : y;
        tops.set(side,Math.max(tops.get(side) ?? -Infinity,outputY));
      }
      for (const side of [1,2,4,8]) expect(tops.get(side)).toBeCloseTo(
        (side & mask) !== 0 ? 1.15 : 3.22, 5);
      layer.dispose();
    });

  it('animates roof, cut wall and vignette for 250 ms and snaps reduced motion', () => {
    const layer = createPlaceholderBuildingLayer(input()); const state = debug(layer).states[0]!;
    layer.setCutaway(0, 2); expect(layer.stats.drawCalls).toBe(3); layer.update(.125, false);
    expect(state).toMatchObject({ roof: .5, wall: .5, vignette: .15 });
    const vignette = debug(layer).vignette;
    expect(vignette.material.fragmentShader).toContain('inside?-distancePx:distancePx');
    expect(vignette.material.uniforms['opacity']!.value).toBe(.15);
    layer.update(.125, false); expect(state).toMatchObject({ roof: 0, wall: 1, vignette: .3 });
    layer.setCutaway(0, 0); layer.update(0, true);
    expect(state).toMatchObject({ roof: 1, wall: 0, vignette: 0 }); expect(layer.stats.drawCalls).toBe(2);
    layer.dispose();
  });

  it('measures platform plus ridge height and supports pick, occlusion and restore', () => {
    const plan = MINI_BUILDING_PLANS[4]!; const layer = createPlaceholderBuildingLayer(input([plan]));
    expect(layer.measure(0)).toMatchObject({ heightM: (plan.elev[1]+plan.roof[2])/1_000 });
    expect(layer.measure(0).bounds[4]).toBeCloseTo(9.383, 6);
    expect(layer.occludes(new Vector3(39,4,0))).toBe(true);
    expect(layer.pick(new Raycaster(new Vector3(39,4,20),new Vector3(0,0,-1)))).toBe(0);
    const value = debug(layer); const oldGeometry = value.vignette.geometry; layer.restore();
    expect(value.vignette.geometry).not.toBe(oldGeometry); expect(value.stateData.byteLength).toBe(1_024);
    layer.dispose();
  });

  it('leaves a 1200 x 2100 mm clear entrance in the shell', () => {
    const layer = createPlaceholderBuildingLayer(input()); const shell = debug(layer).shells[0]!;
    const ray = new Raycaster(new Vector3(0, 1.2, 2.7), new Vector3(0, 0, -1), 0, .5);
    shell.updateMatrixWorld(true);
    expect(ray.intersectObject(shell, false)).toHaveLength(0); layer.dispose();
  });

  it('keeps N buildings in one shell draw and one roof draw', () => {
    const layer = createPlaceholderBuildingLayer(input([0,1,2,3,4].map(index => atX(index, 4_000+index*5_000))));
    expect(layer.stats).toMatchObject({ units: 5, cells: 1, drawCalls: 2 });
    expect(layer.object.children.filter(child => child.name.includes('building-'))).toHaveLength(3);
    layer.dispose();
  });

  it('creates exactly four building draws across two high-tier cells', () => {
    const layer = createPlaceholderBuildingLayer(input([atX(0,4_000),atX(1,36_000)]));
    expect(layer.stats).toMatchObject({ units: 2, cells: 2, visibleCells: 2, drawCalls: 4 });
    layer.dispose();
  });

  it('disposes every owned resource once and tolerates repeated disposal', () => {
    const layer = createPlaceholderBuildingLayer(input()); const value = debug(layer);
    const shell = debug(layer).shells[0]!;
    const geometry = vi.spyOn(shell.geometry, 'dispose'); const roof = vi.spyOn(value.roofs[0]!.geometry,'dispose');
    const shellMaterial = vi.spyOn(shell.material as ShaderMaterial,'dispose');
    const roofMaterial = vi.spyOn(value.roofs[0]!.material as ShaderMaterial,'dispose');
    const vignetteGeometry = vi.spyOn(value.vignette.geometry,'dispose');
    const vignetteMaterial = vi.spyOn(value.vignette.material,'dispose'); const texture = vi.spyOn(
      (layer.object.userData['placeholder'] as { stateTexture: { dispose(): void } }).stateTexture, 'dispose');
    layer.dispose(); layer.dispose(); expect(geometry).toHaveBeenCalledOnce(); expect(texture).toHaveBeenCalledOnce();
    for (const resource of [roof,shellMaterial,roofMaterial,vignetteGeometry,vignetteMaterial])
      expect(resource).toHaveBeenCalledOnce();
    expect(value.states).toHaveLength(1);
  });
});
