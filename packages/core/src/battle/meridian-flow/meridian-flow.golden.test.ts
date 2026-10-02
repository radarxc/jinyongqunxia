/// <reference types="node" />
// eslint-disable-next-line no-restricted-imports -- Test reads the reviewed cross-language fixture.
import { readFileSync } from 'node:fs';
// eslint-disable-next-line no-restricted-imports -- Test-only fixture integrity check.
import { createHash } from 'node:crypto';
import { canonicalJson, compareCodePoints } from '@tianshu/shared';
import { describe, expect, it } from 'vitest';
import {
  runMeridianGoldenFixture, type MeridianGoldenInputs,
} from './golden-runner';

interface GoldenFixture {
  readonly fixtureVersion: number;
  readonly rulesProtocol: number;
  readonly rngProtocol: number;
  readonly masterSeed: number;
  readonly inputs: MeridianGoldenInputs;
  readonly outputs: unknown;
  readonly vectorSha256: string;
}

const GOLDEN_URL = new URL('../../../../../tools/balance/meridian_flow_golden.json', import.meta.url);
const EXPECTED_VECTOR_SHA256 = 'af33dcd10dc196e18811fe485870666ab139c03a17342fa47113ecc19552cd76';
const fixture = JSON.parse(readFileSync(GOLDEN_URL, 'utf8')) as GoldenFixture;

function firstDifference(
  expected: unknown, actual: unknown, path = '$',
): { readonly path: string; readonly expected: unknown; readonly actual: unknown } | null {
  if (Object.is(expected, actual)) return null;
  if (Array.isArray(expected) && Array.isArray(actual)) {
    if (expected.length !== actual.length) {
      return { path: `${path}.length`, expected: expected.length, actual: actual.length };
    }
    for (let index = 0; index < expected.length; index += 1) {
      const difference = firstDifference(expected[index], actual[index], `${path}[${index}]`);
      if (difference !== null) return difference;
    }
    return null;
  }
  if (expected !== null && actual !== null
    && typeof expected === 'object' && typeof actual === 'object') {
    const expectedObject = expected as Record<string, unknown>;
    const actualObject = actual as Record<string, unknown>;
    const keys = [...new Set([
      ...Object.keys(expectedObject), ...Object.keys(actualObject),
    ])].sort(compareCodePoints);
    for (const key of keys) {
      const difference = firstDifference(expectedObject[key], actualObject[key], `${path}.${key}`);
      if (difference !== null) return difference;
    }
    return null;
  }
  return { path, expected, actual };
}

describe('meridian fixtureVersion=2 TypeScript golden runner', () => {
  it('verifies fixture identity before executing vectors', () => {
    expect(fixture.fixtureVersion).toBe(2);
    expect(fixture.rulesProtocol).toBe(2);
    expect(fixture.rngProtocol).toBe(1);
    expect(fixture.masterSeed).toBe(20_260_927);
    expect(fixture.vectorSha256).toBe(EXPECTED_VECTOR_SHA256);
    const payload = { fixtureVersion: fixture.fixtureVersion, inputs: fixture.inputs,
      masterSeed: fixture.masterSeed, outputs: fixture.outputs, rngProtocol: fixture.rngProtocol,
      rulesProtocol: fixture.rulesProtocol };
    const digest = createHash('sha256').update(canonicalJson(payload as never)).digest('hex');
    expect(digest).toBe(EXPECTED_VECTOR_SHA256);
  });

  it('matches every output field and reports the first divergent path', () => {
    const actual = runMeridianGoldenFixture(fixture.inputs, fixture.masterSeed);
    const difference = firstDifference(fixture.outputs, actual);
    expect(difference, difference === null ? undefined
      : `first golden difference at ${difference.path}: expected ${JSON.stringify(difference.expected)}, `
        + `received ${JSON.stringify(difference.actual)}`).toBeNull();
  });
});
