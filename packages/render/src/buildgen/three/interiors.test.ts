import { BufferGeometry, Group, Mesh, MeshBasicMaterial } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { InteriorLru } from './interiors';

describe('InteriorLru', () => {
  it('disposes an evicted batch exactly once', () => {
    const disposed: ReturnType<typeof vi.fn>[] = [];
    const lru = new InteriorLru(new Group(), 4, (name) => {
      const geometry = new BufferGeometry();
      const marker = vi.spyOn(geometry, 'dispose');
      disposed.push(marker);
      const mesh = new Mesh(geometry, new MeshBasicMaterial());
      mesh.name = name;
      return mesh;
    });
    for (let unit = 0; unit < 5; unit += 1) lru.touch(unit);
    expect(lru.size).toBe(4);
    expect(disposed[0]).toHaveBeenCalledOnce();
    lru.dispose();
    expect(disposed.every((marker) => marker.mock.calls.length === 1)).toBe(true);
  });
});
