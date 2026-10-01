import { expect, test } from 'vitest';
import { runMeridianTickWorkload } from './meridian-flow.fixture';

test('meridian-flow hot path', async ({ bench }) => {
  const result = await bench('1000 ticks x 12 routes', { iterations: 100,
    warmupIterations: 20 }, () => {
    runMeridianTickWorkload();
  }).run();
  expect(result.latency.mean).toBeLessThanOrEqual(5);
});
