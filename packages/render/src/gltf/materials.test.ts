import { BoxGeometry, Mesh, MeshBasicMaterial, SkinnedMesh } from 'three';
import { describe, expect, it } from 'vitest';
import { createPilotMaterials, createThreeStepGradient } from './materials';

describe('pilot toon materials', () => {
  it('builds a nearest-filtered three-step gradient', () => {
    const value = createThreeStepGradient();
    expect(Array.from(value.image.data ?? [])).toEqual([64, 154, 255]); expect(value.image.width).toBe(3); value.dispose();
  });

  it('preserves the base texture and toggles the outline', () => {
    const texture = { isTexture: true }; const source = new MeshBasicMaterial(); source.map = texture as never;
    const mesh = new Mesh(new BoxGeometry(), source); const state = createPilotMaterials([mesh]);
    expect((state.toon.get(mesh) as { map?: unknown }).map).toBe(texture);
    const outline = mesh.children[0]!; expect(outline.visible).toBe(false); state.setOutline(true); expect(outline.visible).toBe(true);
    state.setToon(false); expect(mesh.material).toBe(source); state.dispose(); mesh.geometry.dispose(); source.dispose();
  });

  it('creates a skinned outline for a skinned source mesh', () => {
    const mesh = new SkinnedMesh(new BoxGeometry(), new MeshBasicMaterial()); const state = createPilotMaterials([mesh]);
    expect(mesh.children[0]).toBeInstanceOf(SkinnedMesh); state.dispose(); mesh.geometry.dispose(); mesh.material.dispose();
  });
});
