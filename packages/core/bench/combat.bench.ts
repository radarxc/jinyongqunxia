import { expect, test } from 'vitest';
import { runCombatWorkload } from './combat.fixture';

test('20-round automatic battle hot path', async ({ bench }) => {
  const result = await bench('20 automatic rounds', { iterations: 100, warmupIterations: 20 },
    () => { runCombatWorkload(); }).run();
  expect(result.latency.mean).toBeLessThanOrEqual(20);
});
