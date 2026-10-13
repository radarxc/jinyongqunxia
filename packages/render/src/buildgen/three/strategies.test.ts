import { Matrix4, Vector3, type Material } from 'three';
import { describe, expect, it } from 'vitest';
import { MINI_BUILDING_PLANS } from '../testing/mini-plans';
import { accessoryVisible, createBuildingStates } from './state';
import {
  createDoorBatch,
  createPlanBounds,
  createPlainSignTextSource,
  createSignBatch,
  createUnitPlacements,
  setAccessoryBlend,
} from './strategies';

describe('door batches', () => {
  it('keeps the hinge fixed while opening each world-facing door', () => {
    for (let yaw = 0; yaw < 4; yaw += 1) {
      const batch = createDoorBatch([
        new Float32Array([0, 0, 2, 1.2, 3, yaw, 1.4, 2.1, 0.08, 0.025]),
      ]);
      const closed = new Matrix4().fromArray(batch.closed);
      const open = new Matrix4().fromArray(batch.open);
      const initial = new Matrix4();
      batch.mesh.getMatrixAt(0, initial);
      expect(initial.elements).toEqual(closed.elements);
      const hinge = new Vector3(-0.5, 0, 0);
      const closedHinge = hinge.clone().applyMatrix4(closed);
      const openHinge = hinge.clone().applyMatrix4(open);
      expect(openHinge.distanceTo(closedHinge)).toBeLessThan(1e-6);
      // Crossing the 1.8 m threshold is handled by the layer; its first blend keeps this hinge.
      setAccessoryBlend(batch, 0, 0.5);
      batch.mesh.getMatrixAt(0, open);
      expect(hinge.clone().applyMatrix4(open).distanceTo(closedHinge)).toBeLessThan(1e-6);
      expect(new Vector3().setFromMatrixColumn(open, 0).length()).toBeCloseTo(1.4, 6);
      batch.mesh.geometry.dispose();
      const materials = Array.isArray(batch.mesh.material)
        ? batch.mesh.material
        : [batch.mesh.material];
      for (const material of materials) material.dispose();
    }
  });

  it('places and faces sign quads outward for four plan-yaw/local-side pairs', () => {
    const cases = [
      { yaw: 0, side: 0, centre: [0, 2.469], normal: [0, 1] },
      { yaw: 1, side: 0, centre: [-2.469, 0], normal: [-1, 0] },
      { yaw: 1, side: 1, centre: [0, -2.969], normal: [0, -1] },
      { yaw: 3, side: 0, centre: [2.469, 0], normal: [1, 0] },
    ] as const;
    for (let worldSide = 0; worldSide < cases.length; worldSide += 1) {
      const item = cases[worldSide]!;
      const plan = {
        ...MINI_BUILDING_PLANS[0]!,
        yaw: item.yaw as 0 | 1 | 2 | 3,
        signage: ['shop', 0] as const,
      };
      const batch = createSignBatch(
        [new Float32Array([0, item.side, 3, 0.5, 2.4, 0])],
        createUnitPlacements([plan]),
        createPlainSignTextSource(),
      );
      const matrix = new Matrix4();
      batch.mesh.getMatrixAt(0, matrix);
      const centre = new Vector3().setFromMatrixPosition(matrix);
      const normal = new Vector3(0, 0, 1).transformDirection(matrix);
      expect([centre.x, centre.z]).toEqual(item.centre.map((v) => expect.closeTo(v, 6)));
      expect([normal.x, normal.z]).toEqual(item.normal.map((v) => expect.closeTo(v, 6)));
      expect(Array.from(batch.units)).toEqual([0]);
      expect(batch.mesh.geometry.getAttribute('signUnit').getX(0)).toBe(0);
      const states = createBuildingStates(1);
      states[0]!.mode = 2;
      expect(accessoryVisible(states, 0, batch.sides[0]!, 1 << worldSide)).toBe(false);
      batch.mesh.geometry.dispose();
      (batch.mesh.material as Material).dispose();
    }
  });

  it('builds bounds for both main and compound-part units', () => {
    const plan = {
      ...MINI_BUILDING_PLANS[0]!,
      parts: [[0, 8_000, 4_000, 2_000, 4_000, 1, 1, 1, 2_500, 3_000, 200, 0]] as const,
    };
    const bounds = createPlanBounds({ plans: [plan] } as never);
    expect(bounds.map((entry) => entry.unit)).toEqual([0, 1]);
    expect(bounds[1]?.bounds).toEqual([6, 0, 3, 10, 3.2, 5]);
  });

  it('places a compound-part sign at the part transform and uploads its unit id', () => {
    const plan = {
      ...MINI_BUILDING_PLANS[0]!,
      signage: ['part-shop', 0] as const,
      parts: [[0, 8_000, 4_000, 2_000, 4_000, 1, 1, 1, 2_500, 3_000, 200, 0]] as const,
    };
    const batch = createSignBatch(
      [new Float32Array([1, 0, 2.5, 0.5, 1.5, 0])],
      createUnitPlacements([plan]),
      createPlainSignTextSource(),
    );
    const matrix = new Matrix4();
    batch.mesh.getMatrixAt(0, matrix);
    const centre = new Vector3().setFromMatrixPosition(matrix);
    expect(centre.x).toBeCloseTo(6.031, 3);
    expect(centre.z).toBeCloseTo(4, 3);
    expect(Array.from(batch.units)).toEqual([1]);
    expect(Array.from(batch.mesh.geometry.getAttribute('signUnit').array)).toEqual([1]);
    batch.mesh.geometry.dispose();
    (batch.mesh.material as Material).dispose();
  });
});
