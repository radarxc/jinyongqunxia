import {
  Material,
  Matrix4,
  Mesh,
  Raycaster,
  Texture,
  Vector3,
  type DataTexture,
  type InstancedMesh,
  type ShaderMaterial,
  type WebGLRenderer,
} from 'three';
import { Session } from 'node:inspector/promises';
import { describe, expect, it, vi } from 'vitest';
import { MINI_BUILDING_PLANS, MINI_BUILD_KIT } from '../testing/mini-plans';
import type { BuildingLayerInput } from '../types';
import { setStaticLitTimeOfDay } from '../../materials/static-lit/lighting';
import { ISO_LIT_UNIFORMS } from '../../materials/static-lit/lighting';
import { staticLitLampStrength } from '../../materials/static-lit/material';
import {
  BOUNDS_PICK_STRATEGY as PUBLIC_BOUNDS_PICK_STRATEGY,
  MERGED_BATCH_STRATEGY as PUBLIC_MERGED_BATCH_STRATEGY,
  createBuildingLayer as createPublicBuildingLayer,
} from '../index';
import { createBuildingLayer } from './layer';

function shortLivedAllocationProbe(): number {
  const values: object[] = [];
  for (let index = 0; index < 10_000; index += 1)
    values.push({ index, payload: new Uint8Array(16) });
  return values.length;
}

interface HeapNode {
  readonly callFrame: { readonly functionName: string; readonly url: string };
  readonly selfSize: number;
  readonly children: readonly HeapNode[];
}
function sampledUpdateBytes(node: HeapNode, inside = false): number {
  const matched =
    inside ||
    (node.callFrame.functionName === 'update' &&
      node.callFrame.url.includes('/buildgen/three/layer.ts'));
  let total = matched ? node.selfSize : 0;
  for (const child of node.children) total += sampledUpdateBytes(child, matched);
  return total;
}
function sampledUpdateFunctions(
  node: HeapNode,
  result = new Map<string, number>(),
  inside = false,
): ReadonlyMap<string, number> {
  const matched =
    inside ||
    (node.callFrame.functionName === 'update' &&
      node.callFrame.url.includes('/buildgen/three/layer.ts'));
  if (matched) {
    const name = node.callFrame.functionName || '<anonymous>';
    result.set(name, (result.get(name) ?? 0) + node.selfSize);
  }
  for (const child of node.children) sampledUpdateFunctions(child, result, matched);
  return result;
}

function input(
  plans = MINI_BUILDING_PLANS,
  tier: 'low' | 'high' = 'high',
  state?: { texture?: DataTexture; data?: Uint8Array },
): BuildingLayerInput {
  const renderer = {
    initTexture: vi.fn<(texture: Texture) => void>(),
    compileAsync: vi.fn(async () => {}),
    domElement: { width: 1280, height: 720 },
  } as unknown as WebGLRenderer;
  return {
    plans,
    walls: [],
    kit: MINI_BUILD_KIT,
    renderer,
    generator: 'inline',
    quality: { tier, renderScale: 1, effectivePixelRatio: (value) => value },
    observeStateTexture: (texture, data) => {
      if (state) {
        state.texture = texture;
        state.data = data;
      }
    },
  };
}
function uploadedMeshes(layer: Awaited<ReturnType<typeof createBuildingLayer>>) {
  return layer.object.children.filter(
    (child) => child.name.startsWith('building-shell-') || child.name.startsWith('building-roof-'),
  );
}

describe('BuildingLayer', () => {
  it('exports the layer and default strategies from the public buildgen entry', () => {
    expect(createPublicBuildingLayer).toBe(createBuildingLayer);
    expect(PUBLIC_BOUNDS_PICK_STRATEGY.id).toBe('bounds');
    expect(PUBLIC_MERGED_BATCH_STRATEGY.id).toBe('merged-buffer-geometry');
  });

  it('reports an empty layer without inventing a unit', async () => {
    const layer = await createBuildingLayer(input([]));
    expect(layer.stats).toMatchObject({ cells: 0, units: 0, pendingCells: 0 });
    await expect(layer.ready()).resolves.toBeUndefined();
    layer.dispose();
  });

  it('uploads no more than one cell a frame and each visible cell has two draws', async () => {
    const layer = await createBuildingLayer(input());
    const total = layer.stats.cells;
    const doors = layer.object.getObjectByName('building-doors')!;
    const signs = layer.object.getObjectByName('building-signs')!;
    expect(layer.stats.pendingCells).toBe(total);
    expect(layer.stats.drawCalls).toBe(0);
    for (let frame = 0; frame < total; frame += 1) {
      layer.update(0, false);
      expect(layer.stats.pendingCells).toBe(total - frame - 1);
      // Accessory batches draw once (at most) only after a cell owning them is uploaded.
      const accessoryDraws = Number(doors.visible) + Number(signs.visible);
      expect(layer.stats.drawCalls).toBe(accessoryDraws + (frame + 1) * 2);
    }
    expect(doors.visible).toBe(true);
    expect(uploadedMeshes(layer)).toHaveLength(total * 2);
    layer.dispose();
  });

  it('keeps roof unit attributes aligned with plan indices', async () => {
    const layer = await createBuildingLayer(input());
    while (layer.stats.pendingCells > 0) layer.update(0, false);
    const seen = new Set<number>();
    for (const mesh of uploadedMeshes(layer).filter((item) =>
      item.name.startsWith('building-roof-'),
    )) {
      const units = (mesh as Mesh).geometry.getAttribute('aUnit');
      for (let vertex = 0; vertex < units.count; vertex += 1) {
        const unit = units.getX(vertex);
        expect(Number.isInteger(unit)).toBe(true);
        expect(unit).toBeGreaterThanOrEqual(0);
        expect(unit).toBeLessThan(MINI_BUILDING_PLANS.length);
        seen.add(unit);
      }
    }
    for (let plan = 0; plan < MINI_BUILDING_PLANS.length; plan += 1)
      expect(seen.has(plan)).toBe(true);
    layer.dispose();
  });

  it('prewarms exactly the shell, roof and depth variants before returning the layer', async () => {
    const current = input();
    const compile = vi.mocked(current.renderer.compileAsync);
    let keys: string[] = [];
    compile.mockImplementation(async (scene) => {
      keys = scene.children.map((child) =>
        ((child as Mesh).material as ShaderMaterial).customProgramCacheKey(),
      );
      return scene;
    });
    const layer = await createBuildingLayer(current);
    expect(compile).toHaveBeenCalledTimes(1);
    expect(keys).toEqual(['static-lit:r2:0:0:0', 'static-lit:r2:1:0:0', 'static-lit:r2:0:0:1']);
    expect(compile.mock.calls[0]![0].children).toHaveLength(0);
    layer.dispose();
  });

  it('uses the same three warmup program keys regardless of building count', async () => {
    const keySets: string[][] = [];
    for (const plans of [[MINI_BUILDING_PLANS[0]!], MINI_BUILDING_PLANS]) {
      const current = input(plans);
      vi.mocked(current.renderer.compileAsync).mockImplementation(async (scene) => {
        keySets.push(
          scene.children.map((child) =>
            ((child as Mesh).material as ShaderMaterial).customProgramCacheKey(),
          ),
        );
        return scene;
      });
      const layer = await createBuildingLayer(current);
      layer.dispose();
    }
    expect(keySets).toEqual([keySets[0], keySets[0]]);
    expect(new Set(keySets[0])).toHaveLength(3);
  });

  it('keeps the shared sun uniform object and rotates its XZ direction with camera yaw', async () => {
    const direction = ISO_LIT_UNIFORMS.uSunDirection.value;
    setStaticLitTimeOfDay(20, 45);
    const beforeX = direction.x,
      beforeY = direction.y,
      beforeZ = direction.z;
    const layer = await createBuildingLayer(input([MINI_BUILDING_PLANS[0]!]));
    layer.setCameraYaw(135);
    expect(ISO_LIT_UNIFORMS.uSunDirection.value).toBe(direction);
    expect(ISO_LIT_UNIFORMS.uTimeOfDay.value).toBe(20);
    expect(direction.y).toBeCloseTo(beforeY, 12);
    expect(direction.x).toBeCloseTo(-beforeZ, 12);
    expect(direction.z).toBeCloseTo(beforeX, 12);
    layer.dispose();
    setStaticLitTimeOfDay(12, 45);
  });

  it('merges city-wall geometry into cells without adding a third mesh per cell', async () => {
    const current = input([MINI_BUILDING_PLANS[0]!]);
    const layer = await createBuildingLayer({
      ...current,
      walls: [
        {
          id: 'wall_a',
          points: [
            [-12_000, -8_000],
            [12_000, -8_000],
          ],
          closed: false,
          heightMm: 6_000,
          thicknessMm: 4_000,
          gates: [{ seg: 0, offsetMm: 12_000, widthMm: 4_500, kind: 'gate' }],
        },
      ],
    });
    while (layer.stats.pendingCells > 0) layer.update(0, false);
    expect(uploadedMeshes(layer)).toHaveLength(layer.stats.cells * 2);
    expect(layer.stats.units).toBe(2);
    expect(layer.measure(1).heightM).toBe(6);
    layer.dispose();
  });

  it('reorders pending cells around the latest focus before uploading', async () => {
    const layer = await createBuildingLayer(input());
    layer.setFocusOcclusion(new Vector3(49, 1, 0), 1.8);
    layer.update(0, true);
    const first = uploadedMeshes(layer).find((mesh) =>
      mesh.name.startsWith('building-shell-'),
    ) as Mesh;
    expect(first.geometry.boundingBox?.max.x).toBeGreaterThan(40);
    layer.dispose();
  });

  it('animates three cutaway states over 250 ms and snaps for reduced motion', async () => {
    const state: { texture?: DataTexture; data?: Uint8Array } = {};
    const layer = await createBuildingLayer(input(MINI_BUILDING_PLANS, 'high', state));
    layer.setCutaway(0, 2);
    layer.update(0.125, false);
    expect(state.data?.[0]).toBeCloseTo(128, 0);
    expect(state.data?.[1]).toBeCloseTo(128, 0);
    layer.update(0.125, false);
    expect(state.data?.[0]).toBe(0);
    expect(state.data?.[1]).toBe(255);
    layer.setCutaway(0, 0);
    layer.update(0, true);
    expect(Array.from(state.data!.slice(0, 3))).toEqual([255, 0, 0]);
    layer.dispose();
  });

  it('keeps mode-0 night windows lit without exposing interiors', async () => {
    const state: { texture?: DataTexture; data?: Uint8Array } = {};
    const layer = await createBuildingLayer(input(MINI_BUILDING_PLANS, 'high', state));
    setStaticLitTimeOfDay(20);
    layer.update(0, false);
    expect(state.data?.[2]).toBe(1);
    expect(staticLitLampStrength(128, 1 << 3, state.data![2]!, 1)).toBeCloseTo(128 / 255);
    expect(staticLitLampStrength(128, 1 << 2, state.data![2]!, 1)).toBe(0);
    setStaticLitTimeOfDay(12);
    layer.update(0, false);
    expect(state.data?.[2]).toBe(0);
    expect(staticLitLampStrength(128, 1 << 3, state.data![2]!, 0)).toBe(0);
    layer.setCutaway(0, 1);
    setStaticLitTimeOfDay(20);
    layer.update(0, true);
    expect(state.data?.[2]).toBe(255);
    expect(staticLitLampStrength(128, 1 << 3, state.data![2]!, 1)).toBeCloseTo(128 / 255);
    layer.dispose();
    setStaticLitTimeOfDay(12);
  });

  it('fades focus occlusion in and out over 200 ms while retaining radius during exit', async () => {
    const layer = await createBuildingLayer(input());
    layer.update(0, false);
    const material = (uploadedMeshes(layer)[0] as Mesh).material as ShaderMaterial & {
      staticUniforms: { uFocusRadiusFade: { value: { x: number; y: number } } };
    };
    layer.setFocusOcclusion(new Vector3(0, 1, 0), 1.8);
    layer.update(0.2, false);
    expect(material.staticUniforms.uFocusRadiusFade.value).toMatchObject({ x: 1.8, y: 1 });
    layer.setFocusOcclusion(new Vector3(0, 1, 0), 0);
    layer.update(0.1, false);
    expect(material.staticUniforms.uFocusRadiusFade.value).toMatchObject({ x: 1.8, y: 0.5 });
    layer.update(0.1, false);
    expect(material.staticUniforms.uFocusRadiusFade.value.y).toBe(0);
    layer.update(0, false);
    expect(material.staticUniforms.uFocusRadiusFade.value.x).toBe(0);
    layer.dispose();
  });

  it('keeps doors closed until the player enters the 1.8 m hinge radius', async () => {
    const layer = await createBuildingLayer(input([MINI_BUILDING_PLANS[1]!]));
    const doors = layer.object.getObjectByName('building-doors') as InstancedMesh;
    // Nothing is submitted before the owning cell is uploaded by the first update.
    expect(doors.count).toBe(0);
    layer.update(0, false);
    expect(doors.count).toBeGreaterThan(0);
    const closed = new Matrix4();
    doors.getMatrixAt(0, closed);
    const centre = new Vector3().setFromMatrixPosition(closed);
    layer.setFocusOcclusion(new Vector3(centre.x + 1.801, 1, centre.z), 1.8);
    layer.update(0.125, false);
    const outside = new Matrix4();
    doors.getMatrixAt(0, outside);
    expect(outside.elements).toEqual(closed.elements);
    layer.setFocusOcclusion(new Vector3(centre.x + 1.79, 1, centre.z), 1.8);
    layer.update(0.125, false);
    const opening = new Matrix4();
    doors.getMatrixAt(0, opening);
    expect(opening.elements).not.toEqual(closed.elements);
    const hinge = new Vector3(-0.5, 0, 0);
    expect(hinge.clone().applyMatrix4(opening).distanceTo(hinge.applyMatrix4(closed))).toBeLessThan(
      1e-6,
    );
    layer.dispose();
  });

  it('addresses compound parts while keeping the rest of the compound at roof-only mode', async () => {
    const state: { texture?: DataTexture; data?: Uint8Array } = {};
    const compound = {
      ...MINI_BUILDING_PLANS[0]!,
      parts: [[0, 0, 0, 2_000, 2_000, 0, 1, 1, 2_500, 3_000, 0, 0]] as const,
    };
    const layer = await createBuildingLayer(input([compound], 'high', state));
    layer.setCutaway(1, 2);
    layer.update(0, true);
    expect(Array.from(state.data!.slice(0, 3))).toEqual([0, 0, 255]);
    expect(Array.from(state.data!.slice(4, 7))).toEqual([0, 255, 255]);
    layer.dispose();
  });

  it('measures, occludes and picks plan bounds', async () => {
    const layer = await createBuildingLayer(input());
    expect(layer.measure(0)).toMatchObject({
      widthM: 6,
      depthM: 5,
      heightM: 4.716,
    });
    expect(layer.occludes(new Vector3(0, 1, 0))).toBe(true);
    const ray = new Raycaster(new Vector3(0, 10, 0), new Vector3(0, -1, 0));
    expect(layer.pick(ray)).toBe(0);
    layer.dispose();
  });

  it('uses base plus platform plus ridge when floor height differs from the platform', async () => {
    const plan = {
      ...MINI_BUILDING_PLANS[0]!,
      elev: [1_200, 400] as const,
      floorY: [2_600] as const,
    };
    const layer = await createBuildingLayer(input([plan]));
    expect(layer.measure(0)).toMatchObject({
      bounds: [-3, 1.2, -2.5, 3, 6.166, 2.5],
      heightM: 4.966,
    });
    expect(layer.occludes(new Vector3(0, 6, 0))).toBe(true);
    expect(layer.occludes(new Vector3(0, 6.2, 0))).toBe(false);
    expect(layer.pick(new Raycaster(new Vector3(0, 10, 0), new Vector3(0, -1, 0)))).toBe(0);
    layer.dispose();
  });

  it('picks closed city-wall segments without occluding the enclosed empty court', async () => {
    const current = input([]);
    const layer = await createBuildingLayer({
      ...current,
      walls: [
        {
          id: 'wall_ring',
          closed: true,
          heightMm: 4_000,
          thicknessMm: 1_000,
          gates: [],
          points: [
            [-10_000, -8_000],
            [10_000, -8_000],
            [10_000, 8_000],
            [-10_000, 8_000],
          ],
        },
      ],
    });
    expect(layer.measure(0).bounds).toEqual([-10.5, 0, -8.5, 10.5, 4, 8.5]);
    expect(layer.occludes(new Vector3(0, 1, 0))).toBe(false);
    expect(layer.pick(new Raycaster(new Vector3(0, 10, 0), new Vector3(0, -1, 0)))).toBe(-1);
    expect(layer.occludes(new Vector3(0, 1, -8))).toBe(true);
    expect(layer.pick(new Raycaster(new Vector3(0, 10, -8), new Vector3(0, -1, 0)))).toBe(0);
    layer.dispose();
  });

  it('keeps only four recent interiors, or two on low', async () => {
    for (const [tier, kept] of [
      ['high', 4],
      ['low', 2],
    ] as const) {
      const layer = await createBuildingLayer(input(MINI_BUILDING_PLANS, tier));
      for (let unit = 0; unit < 5; unit += 1) layer.setCutaway(unit, 1);
      expect(layer.stats.interiors).toBe(kept);
      expect(
        layer.object.children.filter((child) => /^building-interior-\d+$/.test(child.name)),
      ).toHaveLength(kept);
      layer.dispose();
    }
  });

  it('keeps the vignette active while any building remains in state 2', async () => {
    const layer = await createBuildingLayer(input());
    const vignette = layer.object.getObjectByName('building-interior-vignette')!;
    layer.setCutaway(0, 2);
    layer.setCutaway(1, 1);
    expect(vignette.visible).toBe(true);
    layer.setCutaway(1, 0);
    expect(vignette.visible).toBe(true);
    layer.setCutaway(0, 0);
    expect(vignette.visible).toBe(false);
    layer.dispose();
  });

  it('does not enable the vignette for state 1 courtyard-wall cutting', async () => {
    const compound = {
      ...MINI_BUILDING_PLANS[0]!,
      parts: [[3, 0, 0, 7_000, 6_000, 0, 1, 1, 2_500, 3_000, 0, 0]] as const,
    };
    const layer = await createBuildingLayer(input([compound]));
    layer.setCutaway(0, 1);
    expect(layer.object.getObjectByName('building-interior-vignette')?.visible).toBe(false);
    layer.dispose();
  });

  it('reports frustum-visible cell, accessory, texture and vignette costs', async () => {
    const plan = { ...MINI_BUILDING_PLANS[0]!, signage: ['shop.name', 0] as const };
    const current = input([plan]);
    const layer = await createBuildingLayer({ ...current, cellVisible: () => false });
    layer.update(0, false);
    // Every cell culled: its sign and doors are culled with it, nothing draws.
    expect(layer.stats.visibleCells).toBe(0);
    expect(layer.stats.drawCalls).toBe(0);
    expect(layer.stats.triangles).toBe(0);
    expect(layer.stats.geometryBytes).toBeGreaterThan(0);
    expect(layer.stats.textureBytes).toBeGreaterThan(0);
    // Only the vignette is added by an interior cutaway: 1 draw / 2 triangles.
    layer.setCutaway(0, 2);
    expect(layer.stats.drawCalls).toBe(1);
    expect(layer.stats.triangles).toBe(2);
    layer.dispose();
  });

  it('hides doors and signs with their culled cell and restores them when it is visible again', async () => {
    const plan = { ...MINI_BUILDING_PLANS[1]!, signage: ['shop.name', 0] as const };
    let visible = true;
    const layer = await createBuildingLayer({ ...input([plan]), cellVisible: () => visible });
    layer.update(0, false);
    const doors = layer.object.getObjectByName('building-doors') as InstancedMesh;
    const signs = layer.object.getObjectByName('building-signs') as InstancedMesh;
    expect(doors.count).toBeGreaterThan(0);
    expect(signs.count).toBe(1);
    const shown = { draws: layer.stats.drawCalls, triangles: layer.stats.triangles };
    expect([doors.visible, signs.visible]).toEqual([true, true]);
    expect(shown.draws).toBe(2 + 2);
    const closedDoor = new Matrix4();
    doors.getMatrixAt(0, closedDoor);
    const shownSign = new Matrix4();
    signs.getMatrixAt(0, shownSign);
    visible = false;
    layer.update(0, false);
    expect([doors.visible, signs.visible]).toEqual([false, false]);
    expect([doors.count, signs.count]).toEqual([0, 0]);
    expect([layer.stats.visibleCells, layer.stats.drawCalls, layer.stats.triangles]).toEqual([
      0, 0, 0,
    ]);
    visible = true;
    layer.update(0, false);
    expect([doors.visible, signs.visible]).toEqual([true, true]);
    const restoredDoor = new Matrix4();
    doors.getMatrixAt(0, restoredDoor);
    const restoredSign = new Matrix4();
    signs.getMatrixAt(0, restoredSign);
    expect(restoredDoor.elements).toEqual(closedDoor.elements);
    expect(restoredSign.elements).toEqual(shownSign.elements);
    expect({ draws: layer.stats.drawCalls, triangles: layer.stats.triangles }).toEqual(shown);
    layer.dispose();
  });

  it("submits only the visible cell's doors and signs as a compacted instance prefix", async () => {
    // House at x≈9 m and temple at x≈39 m fall into two 32 m cells; only the near one passes.
    const near = { ...MINI_BUILDING_PLANS[1]!, signage: ['shop.name', 0] as const };
    const far = { ...MINI_BUILDING_PLANS[4]!, signage: ['temple.name', 0] as const };
    let mode: 'all' | 'near' | 'none' = 'all';
    const layer = await createBuildingLayer({
      ...input([near, far]),
      cellVisible: (bounds) => mode === 'all' || (mode === 'near' && bounds[0]! < 30),
    });
    while (layer.stats.pendingCells > 0) layer.update(0, false);
    layer.update(0, false);
    expect(layer.stats.cells).toBe(2);
    const doors = layer.object.getObjectByName('building-doors') as InstancedMesh;
    const signs = layer.object.getObjectByName('building-signs') as InstancedMesh;
    const matrix = new Matrix4();
    const position = new Vector3();
    const prefixX = (mesh: InstancedMesh) =>
      Array.from({ length: mesh.count }, (_, slot) => {
        mesh.getMatrixAt(slot, matrix);
        return Number(position.setFromMatrixPosition(matrix).x.toFixed(4));
      });
    const signAttributes = () => ({
      units: Array.from(signs.geometry.getAttribute('signUnit').array).slice(0, signs.count),
      rects: Array.from(signs.geometry.getAttribute('signRect').array).slice(0, signs.count * 4),
    });
    const cellTriangles = () =>
      uploadedMeshes(layer)
        .filter((mesh) => mesh.visible)
        .reduce((sum, mesh) => sum + ((mesh as Mesh).geometry.index?.count ?? 0) / 3, 0);
    const allDoorX = prefixX(doors);
    const allSigns = signAttributes();
    expect(allDoorX.some((x) => x < 30) && allDoorX.some((x) => x > 30)).toBe(true);
    expect(signs.count).toBe(2);
    // Open the near door at once (reduced motion) so its state must survive compaction.
    const nearDoor = allDoorX.findIndex((x) => x < 30);
    doors.getMatrixAt(nearDoor, matrix);
    const hinge = new Vector3().setFromMatrixPosition(matrix);
    layer.setFocusOcclusion(new Vector3(hinge.x + 0.5, 1, hinge.z), 1.8);
    layer.update(0, true);
    const openedNear = new Matrix4();
    doors.getMatrixAt(nearDoor, openedNear);
    expect(openedNear.elements).not.toEqual(matrix.elements);

    mode = 'near';
    layer.update(0, true);
    const nearDoorX = prefixX(doors);
    expect(doors.count).toBe(allDoorX.filter((x) => x < 30).length);
    expect(nearDoorX.every((x) => x < 30)).toBe(true);
    expect(signs.count).toBe(1);
    expect(prefixX(signs).every((x) => x < 30)).toBe(true);
    const nearSigns = signAttributes();
    expect(nearSigns.units).toEqual([0]);
    expect(nearSigns.rects).toEqual(allSigns.rects.slice(0, 4));
    expect(layer.stats.visibleCells).toBe(1);
    expect(layer.stats.drawCalls).toBe(2 + 1 + 1);
    expect(layer.stats.triangles).toBe(cellTriangles() + doors.count * 12 + signs.count * 2);
    const openedAfterCull = new Matrix4();
    doors.getMatrixAt(
      nearDoorX.indexOf(Number(new Vector3().setFromMatrixPosition(openedNear).x.toFixed(4))),
      openedAfterCull,
    );
    expect(openedAfterCull.elements).toEqual(openedNear.elements);

    mode = 'none';
    layer.update(0, true);
    expect([doors.count, signs.count, layer.stats.drawCalls, layer.stats.triangles]).toEqual([
      0, 0, 0, 0,
    ]);

    mode = 'all';
    layer.update(0, true);
    expect(doors.count).toBe(allDoorX.length);
    expect(signs.count).toBe(2);
    expect(signAttributes()).toEqual(allSigns);
    const restored = new Matrix4();
    doors.getMatrixAt(nearDoor, restored);
    expect(restored.elements).toEqual(openedNear.elements);
    expect(layer.stats.triangles).toBe(cellTriangles() + doors.count * 12 + signs.count * 2);
    layer.dispose();
  });

  it('restores CPU geometry/state and disposes every owned resource once', async () => {
    const state: { texture?: DataTexture; data?: Uint8Array } = {};
    const current = input(MINI_BUILDING_PLANS, 'high', state);
    const layer = await createBuildingLayer(current);
    while (layer.stats.pendingCells > 0) layer.update(0, false);
    layer.setCutaway(0, 2);
    layer.update(0.25, false);
    const before = state.data!.slice();
    const geometry = (uploadedMeshes(layer)[0] as Mesh).geometry;
    const oldPosition = geometry.getAttribute('position').array;
    const door = layer.object.getObjectByName('building-doors') as Mesh;
    const oldDoorGeometry = door.geometry;
    const sign = layer.object.getObjectByName('building-signs') as InstancedMesh;
    const doorMeshDispose = vi.spyOn(door as InstancedMesh, 'dispose');
    const signMeshDispose = vi.spyOn(sign, 'dispose');
    const oldVignette = layer.object.getObjectByName('building-interior-vignette') as Mesh;
    const oldVignetteGeometry = oldVignette.geometry;
    const textureUploads = vi.mocked(current.renderer.initTexture);
    textureUploads.mockClear();
    layer.restore();
    const rebuilt = (uploadedMeshes(layer)[0] as Mesh).geometry;
    expect(Array.from(rebuilt.getAttribute('position').array)).toEqual(Array.from(oldPosition));
    expect(state.data).toEqual(before);
    expect(door.geometry).not.toBe(oldDoorGeometry);
    expect(oldVignette.geometry).not.toBe(oldVignetteGeometry);
    expect(textureUploads.mock.calls.length).toBeGreaterThanOrEqual(4);
    const gpuResources = new Set<{ dispose: () => void }>([state.texture!]);
    layer.object.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      gpuResources.add(object.geometry);
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        gpuResources.add(material);
        if (!(material instanceof Material) || !('uniforms' in material)) continue;
        for (const uniform of Object.values((material as ShaderMaterial).uniforms))
          if (uniform.value instanceof Texture) gpuResources.add(uniform.value);
      }
      if (object.customDepthMaterial) gpuResources.add(object.customDepthMaterial);
    });
    const disposals = [...gpuResources].map((resource) => vi.spyOn(resource, 'dispose'));
    layer.dispose();
    expect(() => layer.dispose()).not.toThrow();
    expect(doorMeshDispose).toHaveBeenCalledTimes(1);
    expect(signMeshDispose).toHaveBeenCalledTimes(1);
    expect(disposals.every((dispose) => dispose.mock.calls.length === 1)).toBe(true);
    expect(layer.object.children).toHaveLength(0);
  });

  it('uses a stable material program key for equal tiers', async () => {
    const first = await createBuildingLayer(input());
    const second = await createBuildingLayer(input());
    first.update(0, false);
    second.update(0, false);
    const firstMaterial = (uploadedMeshes(first)[0] as Mesh).material as ShaderMaterial;
    const secondMaterial = (uploadedMeshes(second)[0] as Mesh).material as ShaderMaterial;
    expect(firstMaterial.customProgramCacheKey()).toBe(secondMaterial.customProgramCacheKey());
    first.dispose();
    second.dispose();
  });

  it('samples no allocations after update warmup', async () => {
    const layer = await createBuildingLayer(input());
    for (let frame = 0; frame < 10_000; frame += 1) layer.update(1 / 60, false);
    const session = new Session();
    session.connect();
    await session.post('HeapProfiler.enable');
    await session.post('HeapProfiler.startSampling', {
      samplingInterval: 1,
    });
    expect(shortLivedAllocationProbe()).toBe(10_000);
    const probeProfile = await session.post('HeapProfiler.getSamplingProfile');
    const probeBytes = (node: HeapNode): number => {
      let bytes = node.callFrame.functionName === 'shortLivedAllocationProbe' ? node.selfSize : 0;
      for (const child of node.children) bytes += probeBytes(child);
      return bytes;
    };
    expect(probeBytes(probeProfile.profile.head as HeapNode)).toBeGreaterThan(0);
    await session.post('HeapProfiler.collectGarbage');
    let before = await session.post('HeapProfiler.getSamplingProfile');
    let cleanStreak = 0;
    const sampledWindows: number[] = [];
    let lastDirty = '';
    for (let window = 0; window < 10 && cleanStreak < 3; window += 1) {
      await Promise.resolve().then(() => {
        for (let frame = 0; frame < 600; frame += 1) layer.update(1 / 60, false);
      });
      const after = await session.post('HeapProfiler.getSamplingProfile');
      const sampledBytes =
        sampledUpdateBytes(after.profile.head as HeapNode) -
        sampledUpdateBytes(before.profile.head as HeapNode);
      sampledWindows.push(sampledBytes);
      const clean = sampledBytes === 0;
      if (!clean) {
        const previousFunctions = sampledUpdateFunctions(before.profile.head as HeapNode);
        const currentFunctions = sampledUpdateFunctions(after.profile.head as HeapNode);
        lastDirty = [...currentFunctions]
          .map(([name, bytes]) => `${name}:${bytes - (previousFunctions.get(name) ?? 0)}`)
          .filter((value) => !value.endsWith(':0'))
          .join(',');
      }
      cleanStreak = clean ? cleanStreak + 1 : 0;
      before = after;
    }
    await session.post('HeapProfiler.stopSampling');
    session.disconnect();
    expect(
      cleanStreak,
      `sampled update bytes per window: ${sampledWindows.join(',')}; ${lastDirty}`,
    ).toBe(3);
    layer.dispose();
  }, 15_000);
});
