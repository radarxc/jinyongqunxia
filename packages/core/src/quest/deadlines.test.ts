import { describe, expect, it } from 'vitest';
import { DeadlineQueue } from './deadlines';

describe('DeadlineQueue', () => {
  it('orders by due tick then stable line and node IDs', () => {
    const queue = new DeadlineQueue();
    queue.push({ atTick: 20, lineId: 'main', nodeId: 'n_z' });
    queue.push({ atTick: 10, lineId: 'side_b', nodeId: 'n_a' });
    queue.push({ atTick: 10, lineId: 'main', nodeId: 'n_b' });
    queue.push({ atTick: 10, lineId: 'main', nodeId: 'n_a' });
    expect([queue.pop(), queue.pop(), queue.pop(), queue.pop()]).toEqual([
      { atTick: 10, lineId: 'main', nodeId: 'n_a' },
      { atTick: 10, lineId: 'main', nodeId: 'n_b' },
      { atTick: 10, lineId: 'side_b', nodeId: 'n_a' },
      { atTick: 20, lineId: 'main', nodeId: 'n_z' },
    ]);
    expect(queue.peek()).toBeUndefined();
  });
});
