import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { hashCell } from './mesher/core/hash';
import { inspectCoreGeometry } from './mesher/core/inspect';
import { generateCells } from './mesher/generate';
import { RECIPES } from './mesher/recipes';
import { MINI_BUILDING_PLANS, MINI_BUILD_KIT } from './testing/mini-plans';
import { ROOF_STYLE } from './types';

describe('generateCells', () => {
  it('registers all nine recipe extension points', () => {
    expect(Object.keys(RECIPES)).toEqual([
      'hall',
      'storeyed',
      'stall',
      'adobe',
      'compound',
      'pagoda_dense',
      'pagoda_oct',
      'citywall',
      'gate',
    ]);
    expect(Object.values(RECIPES).every((recipe) => typeof recipe === 'function')).toBe(true);
  });

  it('groups six mini plans by aligned centre cells and passes INV-1/2/3/4/5', () => {
    const cells = generateCells(MINI_BUILDING_PLANS, MINI_BUILD_KIT, 0, 16);
    expect(cells.length).toBe(4);
    const diagnostics = cells.flatMap((cell) =>
      inspectCoreGeometry(
        cell.shell,
        cell.roof,
        MINI_BUILDING_PLANS,
        cell.units,
        [],
        [],
        MINI_BUILD_KIT,
      ),
    );
    expect(diagnostics).toEqual([]);
    expect(
      cells.every(
        (cell) => Object.values(cell).filter((value) => ArrayBuffer.isView(value)).length === 4,
      ),
    ).toBe(true);
    expect(cells.every((cell) => cell.hanging instanceof Uint32Array)).toBe(true);
  });

  it('gives the six mini plans their tech/16 §4.3 roof styles (named, not magic numbers)', () => {
    expect(Object.fromEntries(MINI_BUILDING_PLANS.map((plan) => [plan.id, plan.roof[0]]))).toEqual({
      mini_shop_y0: ROOF_STYLE.Xuanshan,
      mini_house_y1: ROOF_STYLE.Yingshan,
      mini_inn_y2: ROOF_STYLE.Xieshan,
      mini_stall_y3: ROOF_STYLE.Canopy,
      mini_temple_y0: ROOF_STYLE.Xieshan,
      mini_xiyu_y1: ROOF_STYLE.Flat,
    });
  });

  it('measures aUnit local height from the unit floor (base + floorY), not from the base', () => {
    const temple = MINI_BUILDING_PLANS.find((plan) => plan.id === 'mini_temple_y0')!;
    const elevated = { ...temple, elev: [1_200, temple.elev[1]] as const };
    for (const plan of [temple, elevated]) {
      const shell = generateCells([plan], MINI_BUILD_KIT, 0, 16)[0]!.shell;
      const baseM = plan.elev[0] / 1000;
      const eaveM = (plan.elev[0] + plan.elev[1] + plan.roof[1]) / 1000;
      let baseVertices = 0;
      let eaveVertices = 0;
      for (let vertex = 0; vertex < shell.position.length / 3; vertex += 1) {
        const y = shell.position[vertex * 3 + 1]!;
        const localCm = shell.unit[vertex * 2 + 1]!;
        if (Math.abs(y - baseM) < 1e-4) {
          baseVertices += 1;
          expect(localCm).toBe(0);
        }
        if (Math.abs(y - eaveM) < 1e-4) {
          eaveVertices += 1;
          // 900 mm platform must not be counted: eave sits roof.eaveMm / 10 cm above the floor.
          expect(Math.abs(localCm - plan.roof[1] / 10)).toBeLessThanOrEqual(0.5);
        }
      }
      expect(baseVertices).toBeGreaterThan(0);
      expect(eaveVertices).toBeGreaterThan(0);
    }
  });

  it('is byte-stable for the same input', () => {
    const first = generateCells(MINI_BUILDING_PLANS, MINI_BUILD_KIT, 1, 16);
    const second = generateCells(MINI_BUILDING_PLANS, MINI_BUILD_KIT, 1, 16);
    expect(first.map(hashCell)).toEqual(second.map(hashCell));
  });

  it('resolves real planner archetypes through kit recipes and rejects unknown ones', () => {
    const resolved = generateCells(MINI_BUILDING_PLANS.slice(0, 5), MINI_BUILD_KIT, 0, 64);
    expect(resolved).toHaveLength(1);
    const landmark = { ...MINI_BUILDING_PLANS[0]!, archetype: 'bld_lm_pagoda' };
    expect(generateCells([landmark], MINI_BUILD_KIT, 0, 16)).toHaveLength(1);
    const unknown = { ...MINI_BUILDING_PLANS[0]!, archetype: 'unknown_layout_type' };
    expect(() => generateCells([unknown], MINI_BUILD_KIT, 0, 16)).toThrowError(
      'BUILDGEN_UNKNOWN_ARCHETYPE:unknown_layout_type',
    );
  });
});

describe('mesher dependency boundary', () => {
  it('has no imports from three in mesher source files', () => {
    const root = dirname(fileURLToPath(import.meta.url));
    const pending = [join(root, 'mesher')];
    const files: string[] = [];
    while (pending.length > 0) {
      const directory = pending.pop()!;
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) pending.push(path);
        else if (entry.name.endsWith('.ts')) files.push(path);
      }
    }
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      expect(source).not.toContain("from 'three");
      expect(source).not.toContain('from "three');
      expect(source).not.toContain("import('three");
      expect(source).not.toContain('import("three');
    }
  });
});
