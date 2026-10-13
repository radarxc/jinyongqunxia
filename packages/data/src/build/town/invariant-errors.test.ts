import { afterEach, describe, expect, it, vi } from 'vitest';
import type * as Invariants from './invariants';
import { boxPlanner } from './__fixtures__/box-planner';
import { pilot } from './test-helpers';

const codes = ['I1', 'I2', 'I3', 'I4', 'I5', 'I6'] as const;

afterEach(() => {
  vi.doUnmock('./invariants');
  vi.resetModules();
});

describe('compileTownScene invariant error boundary', () => {
  it.each(codes)(
    'throws TOWN_COMPILE_INVARIANT:%s for an injected invariant failure',
    async (code) => {
      vi.resetModules();
      vi.doMock('./invariants', async (importActual) => {
        const actual = await importActual<typeof Invariants>();
        return {
          ...actual,
          [`check${code}`]: () => [
            {
              code,
              severity: 'warning' as const,
              message: `injected ${code} failure`,
            },
          ],
        };
      });
      const { compileTownScene } = await import('./index');
      const { input, kit } = pilot('dali10');
      const emptyInput = { ...input, facilities: { ...input.facilities, facilities: [] } };
      expect(() => compileTownScene(emptyInput, { kit, planBuilding: boxPlanner })).toThrow(
        `TOWN_COMPILE_INVARIANT:${code}:injected ${code} failure`,
      );
    },
    30_000,
  );
});
