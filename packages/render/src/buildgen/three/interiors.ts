import { BufferGeometry, Mesh, MeshBasicMaterial, type Group, type Object3D } from 'three';

/** Placeholder interior until the furniture meshes (i1 / r8) exist: empty, so it never draws. */
export function createEmptyInterior(name: string): Mesh {
  const mesh = new Mesh(new BufferGeometry(), new MeshBasicMaterial({ visible: false }));
  mesh.name = name;
  mesh.visible = false;
  return mesh;
}

interface InteriorEntry {
  readonly unit: number;
  readonly object: Object3D;
  stamp: number;
}
function interiorTriangles(object: Object3D): number {
  const geometry = (object as Partial<Mesh>).geometry;
  if (!geometry) return 0;
  const count = geometry.index?.count ?? geometry.getAttribute('position')?.count ?? 0;
  return Math.floor(count / 3);
}

export class InteriorLru {
  private readonly entries: InteriorEntry[] = [];
  private stamp = 0;
  constructor(
    private readonly root: Group,
    readonly capacity: number,
    private readonly factory: (name: string) => Mesh = createEmptyInterior,
  ) {}

  has(unit: number): boolean {
    return this.find(unit) >= 0;
  }
  touch(unit: number): void {
    const found = this.find(unit);
    if (found >= 0) {
      const entry = this.entries[found]!;
      entry.stamp = ++this.stamp;
      entry.object.visible = true;
      return;
    }
    if (this.entries.length >= this.capacity) this.evictOldest();
    const object = this.factory(`building-interior-${unit}`);
    object.visible = true;
    this.root.add(object);
    this.entries.push({ unit, object, stamp: ++this.stamp });
  }
  hide(unit: number): void {
    const found = this.find(unit);
    if (found >= 0) this.entries[found]!.object.visible = false;
  }
  get size(): number {
    return this.entries.length;
  }
  get visible(): number {
    let count = 0;
    for (const entry of this.entries) if (entry.object.visible) count += 1;
    return count;
  }
  /** Draw calls of visible interiors; an empty placeholder geometry issues none. */
  get visibleDraws(): number {
    let draws = 0;
    for (let index = 0; index < this.entries.length; index += 1) {
      const entry = this.entries[index]!;
      if (entry.object.visible && interiorTriangles(entry.object) > 0) draws += 1;
    }
    return draws;
  }
  get visibleTriangles(): number {
    let triangles = 0;
    for (let index = 0; index < this.entries.length; index += 1) {
      const entry = this.entries[index]!;
      if (entry.object.visible) triangles += interiorTriangles(entry.object);
    }
    return triangles;
  }
  restore(): void {
    for (const entry of this.entries) {
      const mesh = entry.object as Mesh;
      mesh.geometry.dispose();
      mesh.geometry = new BufferGeometry();
    }
  }
  dispose(): void {
    while (this.entries.length > 0) this.disposeAt(this.entries.length - 1);
  }
  private find(unit: number): number {
    for (let index = 0; index < this.entries.length; index += 1)
      if (this.entries[index]!.unit === unit) return index;
    return -1;
  }
  private evictOldest(): void {
    let oldest = 0;
    for (let index = 1; index < this.entries.length; index += 1)
      if (this.entries[index]!.stamp < this.entries[oldest]!.stamp) oldest = index;
    this.disposeAt(oldest);
  }
  private disposeAt(index: number): void {
    const entry = this.entries[index]!;
    this.root.remove(entry.object);
    const mesh = entry.object as Mesh;
    mesh.geometry.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) material.dispose();
    this.entries.splice(index, 1);
  }
}
