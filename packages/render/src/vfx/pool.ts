export class ObjectPool<T> {
  private readonly free: T[] = []; private readonly all = new Set<T>(); private active = 0; private disposed = false;
  constructor(private readonly capacity: number, private readonly create: () => T, private readonly reset: (item: T) => void) {
    if (!Number.isSafeInteger(capacity) || capacity <= 0) throw new Error('VFX_POOL_CAPACITY_INVALID');
  }
  acquire(): T {
    if (this.disposed) throw new Error('VFX_POOL_DISPOSED');
    const item = this.free.pop() ?? (this.all.size < this.capacity ? this.allocate() : undefined);
    if (!item) throw new Error('VFX_POOL_EXHAUSTED');
    this.active += 1; return item;
  }
  release(item: T): void {
    if (this.disposed || !this.all.has(item) || this.free.includes(item)) return;
    this.reset(item); this.free.push(item); this.active -= 1;
  }
  dispose(dispose: (item: T) => void): void {
    if (this.disposed) return; this.disposed = true;
    for (const item of this.all) dispose(item);
    this.all.clear(); this.free.length = 0; this.active = 0;
  }
  get stats() { return { active: this.active, pooled: this.free.length, capacity: this.capacity }; }
  private allocate(): T { const item = this.create(); this.all.add(item); return item; }
}
