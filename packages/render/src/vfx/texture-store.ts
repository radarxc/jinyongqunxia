import { NearestFilter, SRGBColorSpace, TextureLoader, type Texture } from 'three';

/** URL-keyed Promise cache. Rejected requests are evicted so a transient failure can recover. */
export class VfxTextureStore {
  private readonly loader: TextureLoader;
  private readonly entries = new Map<string, Promise<Texture>>();
  constructor(loader = new TextureLoader()) { this.loader = loader; }

  load(url: string): Promise<Texture> {
    let pending = this.entries.get(url);
    if (!pending) {
      pending = this.loader.loadAsync(url).then(texture => {
        texture.colorSpace = SRGBColorSpace; texture.flipY = false;
        texture.premultiplyAlpha = false; texture.minFilter = NearestFilter; texture.magFilter = NearestFilter;
        texture.generateMipmaps = false; return texture;
      }).catch((failure: unknown) => { this.entries.delete(url); throw failure; });
      this.entries.set(url, pending);
    }
    return pending;
  }

  get size(): number { return this.entries.size; }
  dispose(): void {
    for (const pending of this.entries.values()) void pending.then(texture => texture.dispose(), () => undefined);
    this.entries.clear();
  }
}
