import { describe, expect, it, vi } from 'vitest';
import { NearestFilter, SRGBColorSpace, Texture } from 'three';
import { VfxTextureStore } from './texture-store';

describe('VFX texture sharing', () => {
  it('deduplicates concurrent URLs and disposes the shared texture once', async () => {
    const texture = new Texture(); const dispose = vi.spyOn(texture, 'dispose');
    const loader = { loadAsync: vi.fn(async () => texture) };
    const store = new VfxTextureStore(loader as never);
    const first = store.load('/atlas.png'); const second = store.load('/atlas.png');
    expect(first).toBe(second); expect(await first).toBe(texture);
    expect(loader.loadAsync).toHaveBeenCalledOnce(); expect(store.size).toBe(1);
    expect(texture.colorSpace).toBe(SRGBColorSpace);
    expect(texture.minFilter).toBe(NearestFilter); expect(texture.magFilter).toBe(NearestFilter);
    expect(texture.flipY).toBe(false); expect(texture.generateMipmaps).toBe(false);
    store.dispose(); await Promise.resolve(); expect(dispose).toHaveBeenCalledOnce();
  });

  it('evicts a failed request so it can be retried', async () => {
    const texture = new Texture(); const loadAsync = vi.fn()
      .mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(texture);
    const store = new VfxTextureStore({ loadAsync } as never);
    await expect(store.load('/retry.png')).rejects.toThrow('offline');
    await expect(store.load('/retry.png')).resolves.toBe(texture);
    expect(loadAsync).toHaveBeenCalledTimes(2); store.dispose();
  });
});
