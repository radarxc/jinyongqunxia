export class MemoryCacheStorage implements CacheStorage {
  private stores = new Map<string, MemoryCache>();
  async open(cacheName: string): Promise<Cache> {
    let cache = this.stores.get(cacheName);
    if (!cache) { cache = new MemoryCache(); this.stores.set(cacheName, cache); }
    return cache;
  }
  async has(cacheName: string): Promise<boolean> { return this.stores.has(cacheName); }
  async delete(cacheName: string): Promise<boolean> { return this.stores.delete(cacheName); }
  async keys(): Promise<string[]> { return [...this.stores.keys()]; }
  async match(request: RequestInfo | URL, options?: MultiCacheQueryOptions): Promise<Response | undefined> {
    for (const cache of this.stores.values()) { const hit = await cache.match(request, options); if (hit) return hit; }
    return undefined;
  }
}

class MemoryCache implements Cache {
  private rows = new Map<string, Response>();
  private key(input: RequestInfo | URL): string {
    return input instanceof Request ? input.url : new URL(String(input), 'https://tianshu.invalid').href;
  }
  async match(request: RequestInfo | URL, _options?: CacheQueryOptions): Promise<Response | undefined> {
    return this.rows.get(this.key(request))?.clone();
  }
  async matchAll(request?: RequestInfo | URL): Promise<readonly Response[]> {
    if (request) { const hit = await this.match(request); return hit ? [hit] : []; }
    return [...this.rows.values()].map(response => response.clone());
  }
  async add(): Promise<void> { throw new Error('not implemented'); }
  async addAll(): Promise<void> { throw new Error('not implemented'); }
  async put(request: RequestInfo | URL, response: Response): Promise<void> {
    if (response.status === 206) throw new TypeError('partial response');
    this.rows.set(this.key(request), response.clone());
  }
  async delete(request: RequestInfo | URL): Promise<boolean> { return this.rows.delete(this.key(request)); }
  async keys(): Promise<readonly Request[]> { return [...this.rows.keys()].map(url => new Request(url)); }
}
