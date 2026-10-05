import { describe, expect, it, vi } from 'vitest';
import { ObjectPool } from './pool';

describe('VFX object pool', () => {
  it('reuses released slots and caps concurrent allocations', () => {
    const make = vi.fn(() => ({ value: 0 })); const reset = vi.fn((item: { value: number }) => { item.value = 0; });
    const pool = new ObjectPool(2, make, reset);
    const first = pool.acquire(); const second = pool.acquire();
    first.value = 7; expect(() => pool.acquire()).toThrow(/exhausted/i);
    pool.release(first); const reused = pool.acquire();
    expect(reused).toBe(first); expect(reused.value).toBe(0); expect(make).toHaveBeenCalledTimes(2);
    pool.release(reused); pool.release(second);
    expect(pool.stats).toEqual({ active: 0, pooled: 2, capacity: 2 });
  });

  it('disposes every allocated slot once', () => {
    const dispose = vi.fn(); const pool = new ObjectPool(3, () => ({ dispose }), () => undefined);
    pool.acquire(); pool.acquire(); pool.dispose(item => item.dispose()); pool.dispose(item => item.dispose());
    expect(dispose).toHaveBeenCalledTimes(2);
  });
});
