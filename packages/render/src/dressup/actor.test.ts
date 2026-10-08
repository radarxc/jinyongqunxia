import {
  Bone, BufferGeometry, Float32BufferAttribute, Group, Matrix4, MeshBasicMaterial,
  Quaternion, Skeleton, SkinnedMesh, Uint16BufferAttribute, Vector3,
} from 'three';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { describe, expect, it } from 'vitest';
import { mergeBodySkeleton, remapAndBindSkinnedMesh } from './actor';

function skeleton(names: readonly string[]): { root: Bone; skeleton: Skeleton } {
  const bones = names.map(name => { const bone = new Bone(); bone.name = name; return bone; });
  for (let index = 1; index < bones.length; index += 1) bones[index - 1]!.add(bones[index]!);
  const root = bones[0]!; root.updateMatrixWorld(true);
  return { root, skeleton: new Skeleton(bones, bones.map(() => new Matrix4())) };
}
function mesh(value: Skeleton, indices = [0, 1, 2, 0], weights = [.25, .25, .25, .25]): SkinnedMesh {
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0], 3));
  geometry.setAttribute('skinIndex', new Uint16BufferAttribute(indices, 4));
  geometry.setAttribute('skinWeight', new Float32BufferAttribute(weights, 4));
  const result = new SkinnedMesh(geometry, new MeshBasicMaterial());
  result.bind(value, new Matrix4().makeTranslation(1, 2, 3)); return result;
}
function dispose(meshes: readonly SkinnedMesh[]): void {
  for (const value of meshes) {
    value.geometry.dispose();
    for (const material of Array.isArray(value.material) ? value.material : [value.material]) material.dispose();
  }
}

describe('dressup shared skeleton helpers', () => {
  it('remaps skin indices by sanitized bone name, clears missing weights, and normalizes', () => {
    const source = skeleton(['mixamorig:Hips', 'mixamorig:Arm', 'missing:Bone']);
    const target = skeleton(['mixamorigHips', 'mixamorigArm']);
    const value = mesh(source.skeleton, [0, 1, 2, 0], [.2, .3, .4, .1]);
    const oldIndices = value.geometry.getAttribute('skinIndex');
    const oldWeights = value.geometry.getAttribute('skinWeight');
    remapAndBindSkinnedMesh(value, target.skeleton);
    const indices = value.geometry.getAttribute('skinIndex');
    const weights = value.geometry.getAttribute('skinWeight');
    expect(indices).not.toBe(oldIndices); expect(weights).not.toBe(oldWeights);
    expect([indices.getX(0), indices.getY(0), indices.getZ(0), indices.getW(0)])
      .toEqual([0, 1, 0, 0]);
    expect(weights.getZ(0)).toBe(0);
    expect(weights.getX(0) + weights.getY(0) + weights.getW(0)).toBeCloseTo(1, 7);
    expect(value.skeleton).toBe(target.skeleton);
    dispose([value]);
  });

  it('passes bindMatrix explicitly and does not mutate shared bone inverses', () => {
    const source = skeleton(['hip', 'arm']); const target = skeleton(['hip', 'arm']);
    target.skeleton.boneInverses[0]!.makeTranslation(4, 5, 6);
    target.skeleton.boneInverses[1]!.makeRotationX(.7);
    const before = target.skeleton.boneInverses.map(value => value.elements.slice());
    const value = mesh(source.skeleton, [0, 1, 0, 0], [.5, .5, 0, 0]);
    const bind = value.bindMatrix.clone(); remapAndBindSkinnedMesh(value, target.skeleton);
    expect(value.bindMatrix.elements).toEqual(bind.elements);
    target.skeleton.boneInverses.forEach((inverse, index) => {
      expect(inverse.elements).toEqual(before[index]);
    });
    dispose([value]);
  });

  it('merges all cloned body primitives onto one skeleton without changing bind matrices', () => {
    const firstRig = skeleton(['hip']); const secondRig = skeleton(['hip']);
    const first = mesh(firstRig.skeleton, [0, 0, 0, 0], [1, 0, 0, 0]);
    const second = mesh(secondRig.skeleton, [0, 0, 0, 0], [1, 0, 0, 0]);
    second.bindMatrix.makeRotationY(.3); const before = second.bindMatrix.clone();
    const source = new Group(); source.add(firstRig.root, secondRig.root, first, second);
    const root = cloneSkeleton(source); const merged = mergeBodySkeleton(root);
    const clonedFirst = merged.meshes[0]!; const clonedSecond = merged.meshes[1]!;
    expect(merged.meshes).toHaveLength(2); expect(clonedFirst.skeleton).toBe(merged.skeleton);
    expect(clonedSecond.skeleton).toBe(merged.skeleton);
    expect(clonedSecond.bindMatrix.elements).toEqual(before.elements);
    dispose([clonedFirst, clonedSecond]);
  });

  it('documents matrix multiplication order for socket then grip adjustment', () => {
    const boneWorld = new Matrix4().compose(new Vector3(2, 3, 4),
      new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), .4), new Vector3(1, 1, 1));
    const socket = new Matrix4().makeTranslation(.1, .2, .3);
    const grip = new Matrix4().makeRotationZ(.7);
    const actual = boneWorld.clone().multiply(socket).multiply(grip);
    const expected = new Matrix4().multiplyMatrices(boneWorld, socket).multiply(grip);
    actual.elements.forEach((value, index) => expect(value).toBeCloseTo(expected.elements[index]!, 6));
  });
});
