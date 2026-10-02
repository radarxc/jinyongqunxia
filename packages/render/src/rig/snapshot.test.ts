// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import { CanvasTexture } from 'three';
import { createRigCharacter } from './character';
import { loadRigSet } from './manifest';
import { createPlaceholderRigManifest } from './placeholder';

describe('rig VFX snapshot', () => {
  it('flattens the current layered pose into one reusable canvas', async () => {
    const transforms: number[][] = []; const drawImage = vi.fn();
    const context = { clearRect: vi.fn(), save: vi.fn(), restore: vi.fn(), drawImage,
      fillRect: vi.fn(), strokeRect: vi.fn(), scale: vi.fn(),
      setTransform: vi.fn((...values: number[]) => transforms.push(values)) };
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(context as unknown as CanvasRenderingContext2D);
    const rigSet = await loadRigSet(createPlaceholderRigManifest());
    expect(rigSet.texture).toBeInstanceOf(CanvasTexture);
    const character = createRigCharacter(rigSet, {}, 3);
    const first = character.snapshot(); const second = character.snapshot();
    expect(first?.image).toBe(second?.image); expect(first?.image.width).toBeGreaterThan(1);
    expect(first?.image.height).toBeGreaterThan(1); expect(first?.localBounds).toHaveLength(4);
    expect(drawImage).toHaveBeenCalledTimes(32); expect(transforms[0]?.[3]).toBeLessThan(0);
    character.dispose(); rigSet.dispose(); getContext.mockRestore();
  });
});
