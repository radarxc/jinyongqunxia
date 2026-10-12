import { describe, expect, it } from 'vitest';
import { MeshBufferBuilder } from './mesher/core/buffer';
import { decodeHangingProps, inspectInv1, inspectInv3, inspectInv5 } from './mesher/core/inspect';
import { wallWithOpenings } from './mesher/core/openings';
import { quad } from './mesher/core/prims';
import { generateCells } from './mesher/generate';
import { MINI_BUILDING_PLANS, MINI_BUILD_KIT } from './testing/mini-plans';

const plan = MINI_BUILDING_PLANS[0]!;
describe('geometry invariant diagnostics', () => {
  it('INV-1 reports a vertex outside the 40 mm inset', () => {
    const builder = new MeshBufferBuilder();
    builder.addVertex({ position: [3, 1, 0], normal: [1, 0, 0], unit: 0 });
    expect(inspectInv1(builder.finish(), [plan]).map((item) => item.code)).toContain(
      'OUTSIDE_FOOTPRINT',
    );
  });

  it('INV-1 rejects a high overhanging ordinary bit5 prop', () => {
    const ordinary = new MeshBufferBuilder();
    quad(
      ordinary,
      [
        [3.5, 2.25, 0],
        [3.5, 2.25, 0.2],
        [3.5, 2.5, 0.2],
        [3.5, 2.5, 0],
      ],
      { unit: 0, flags: 1 << 5 },
    );
    expect(inspectInv1(ordinary.finish(), [plan]).map((item) => item.code)).toContain(
      'OUTSIDE_FOOTPRINT',
    );
  });

  it('INV-1 decodes exact hanging categories from the transferable payload', () => {
    expect(decodeHangingProps(new Uint32Array([0, 2, 3, 4, 5, 6]), 'shell')).toEqual([
      { kind: 'flag', vertices: [4, 5, 6] },
    ]);
    expect(decodeHangingProps(new Uint32Array([1, 3, 1, 7]), 'shell')).toEqual([]);
    expect(() => decodeHangingProps(new Uint32Array([0, 9, 0]), 'shell')).toThrow(
      'BUILDGEN_INVALID_HANGING_METADATA',
    );
  });

  it('INV-1 permits only explicitly typed hanging props above 2.25 m', () => {
    const hanging = new MeshBufferBuilder();
    quad(
      hanging,
      [
        [3.5, 2.25, 0],
        [3.5, 2.25, 0.2],
        [3.5, 2.5, 0.2],
        [3.5, 2.5, 0],
      ],
      { unit: 0, flags: 1 << 5 },
    );
    expect(
      inspectInv1(hanging.finish(), [plan], [{ kind: 'sign', vertices: [0, 1, 2, 3] }]),
    ).toEqual([]);
    const low = new MeshBufferBuilder();
    quad(
      low,
      [
        [3.5, 2.24, 0],
        [3.5, 2.24, 0.2],
        [3.5, 2.5, 0.2],
        [3.5, 2.5, 0],
      ],
      { unit: 0, flags: 1 << 5 },
    );
    expect(
      inspectInv1(low.finish(), [plan], [{ kind: 'lantern', vertices: [0, 1, 2, 3] }]).map(
        (item) => item.code,
      ),
    ).toContain('OUTSIDE_FOOTPRINT');
  });

  it('INV-3 reports a triangle occupying the entrance box', () => {
    const builder = new MeshBufferBuilder();
    quad(
      builder,
      [
        [-0.3, 0.5, 2.46],
        [0.3, 0.5, 2.46],
        [0.3, 1.5, 2.46],
        [-0.3, 1.5, 2.46],
      ],
      { unit: 0, facade: 1 },
    );
    expect(inspectInv3(builder.finish(), [plan]).map((item) => item.code)).toContain(
      'TRIANGLE_IN_DOOR',
    );
  });

  it('INV-3 uses a real triangle/box test: AABB overlap that misses the opening is legal', () => {
    // mini_shop_y0: front door u ∈ [-0.7, 0.7], floor 0.15, wall band d ∈ [0, 0.3] (z = 2.5 - d).
    const builder = new MeshBufferBuilder();
    for (const position of [
      [0.6, 2.6, 2.4],
      [2.0, 2.6, 2.4],
      [2.0, 0.4, 2.4],
    ] as const)
      builder.addVertex({ position, normal: [0, 0, 1], unit: 0 });
    builder.addTriangle(0, 1, 2);
    // Its bounding box overlaps the opening box, but the slanted edge stays at u > 0.82 m
    // everywhere below the 2.25 m opening top, so nothing occupies the doorway.
    expect(inspectInv3(builder.finish(), [plan], MINI_BUILD_KIT)).toEqual([]);
  });

  it('INV-3 starts the opening above the kit threshold and ends at the real wall depth', () => {
    const sill = new MeshBufferBuilder();
    quad(
      sill,
      [
        [-0.3, 0.16, 2.4],
        [0.3, 0.16, 2.4],
        [0.3, 0.25, 2.4],
        [-0.3, 0.25, 2.4],
      ],
      { unit: 0, facade: 1 },
    );
    const sillMesh = sill.finish();
    // threshold 120 mm: 0.16–0.25 m is the sill itself (floor 0.15) and is allowed …
    expect(inspectInv3(sillMesh, [plan], MINI_BUILD_KIT)).toEqual([]);
    // … but without a threshold the same quad sits inside the clear opening.
    expect(inspectInv3(sillMesh, [plan]).map((item) => item.code)).toContain('TRIANGLE_IN_DOOR');
    // Interior geometry behind the floors edge (d > 0.3 m, z < 2.2) is not part of the wall band.
    const inside = new MeshBufferBuilder();
    quad(
      inside,
      [
        [-0.3, 0.5, 2.1],
        [0.3, 0.5, 2.1],
        [0.3, 1.5, 2.1],
        [-0.3, 1.5, 2.1],
      ],
      { unit: 0, facade: 1 },
    );
    expect(inspectInv3(inside.finish(), [plan], MINI_BUILD_KIT)).toEqual([]);
  });

  it('INV-3 adds base elevation to relative floorY', () => {
    const elevated = { ...plan, elev: [1_200, 150] as const, floorY: [150] };
    const builder = new MeshBufferBuilder();
    quad(
      builder,
      [
        [-0.3, 2.4, 2.46],
        [0.3, 2.4, 2.46],
        [0.3, 3, 2.46],
        [-0.3, 3, 2.46],
      ],
      { unit: 0, facade: 1 },
    );
    expect(inspectInv3(builder.finish(), [elevated]).map((item) => item.code)).toContain(
      'TRIANGLE_IN_DOOR',
    );
    const cell = generateCells([elevated], MINI_BUILD_KIT, 0, 16)[0]!;
    expect(inspectInv3(cell.shell, [elevated])).toEqual([]);
  });

  it('INV-5 accepts both faces of real 120 / 350 / 600 mm outer walls with one facade bit', () => {
    const halfW = plan.footprint[2] / 2000 - 0.04;
    const halfD = plan.footprint[3] / 2000 - 0.04;
    for (const thicknessMm of [120, 350, 600]) {
      const kit = {
        ...MINI_BUILD_KIT,
        walls: {
          ...MINI_BUILD_KIT.walls,
          gable: { ...MINI_BUILD_KIT.walls.gable, t: thicknessMm },
        },
      };
      const t = thicknessMm / 1000;
      // West wall (local side 1 of mini_shop_y0, yaw 0 → world W, bit 1) on the 40 mm inset edge,
      // thickness inward: outer face at x = -halfW, inner face at x = -halfW + t.
      const shell = new MeshBufferBuilder();
      wallWithOpenings(shell, {
        lengthM: halfD * 2,
        y0M: 0,
        y1M: 3,
        thicknessM: t,
        openings: [],
        origin: [-halfW + t / 2, 0, -halfD],
        yaw: 1,
        facade: 0b0010,
        unit: 0,
      });
      const mismatches = inspectInv5(
        shell.finish(),
        new MeshBufferBuilder().finish(),
        [plan],
        [],
        kit,
      ).filter((item) => item.code === 'FACADE_MISMATCH');
      expect(mismatches).toEqual([]);
    }
  });

  it('INV-5 reports invalid roof units, missing roofs and facade mismatch', () => {
    const cell = generateCells([plan], MINI_BUILD_KIT, 0, 16)[0]!;
    cell.roof.unit[0] = 99;
    cell.shell.unit[0] = 98;
    cell.shell.mat[7] = 9;
    const codes = inspectInv5(cell.shell, cell.roof, [plan]).map((item) => item.code);
    expect(codes).toContain('INVALID_ROOF_UNIT');
    expect(codes).toContain('INVALID_SHELL_UNIT');
    expect(codes).toContain('FACADE_MISMATCH');
  });

  it('INV-5 reports a roof-bearing unit when both payloads are empty', () => {
    const emptyShell = new MeshBufferBuilder().finish();
    const emptyRoof = new MeshBufferBuilder().finish();
    expect(inspectInv5(emptyShell, emptyRoof, [plan]).map((item) => item.code)).toContain(
      'MISSING_ROOF_UNIT',
    );
  });

  it('INV-5 reports a vertical front wall with facade zero', () => {
    const shell = new MeshBufferBuilder();
    quad(
      shell,
      [
        [-1, 0, 2.46],
        [1, 0, 2.46],
        [1, 2, 2.46],
        [-1, 2, 2.46],
      ],
      { unit: 0, facade: 0 },
    );
    const roof = generateCells([plan], MINI_BUILD_KIT, 0, 16)[0]!.roof;
    expect(inspectInv5(shell.finish(), roof, [plan]).map((item) => item.code)).toContain(
      'FACADE_MISMATCH',
    );
  });

  it('INV-5 accepts main and compound-part unit ids from the explicit cell list', () => {
    const compound = {
      ...plan,
      parts: [[0, 0, 0, 2_000, 2_000, 0, 1, 1, 2_500, 3_000, 0, 0]] as const,
    };
    const roof = new MeshBufferBuilder();
    roof.addVertex({ position: [0, 3, 0], normal: [0, 1, 0], unit: 0 });
    roof.addVertex({ position: [0, 3, 0], normal: [0, 1, 0], unit: 1 });
    expect(
      inspectInv5(new MeshBufferBuilder().finish(), roof.finish(), [compound], [0, 1]),
    ).toEqual([]);
  });
});
