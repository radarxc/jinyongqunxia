import { AnimationMixer, BufferAttribute, InterleavedBufferAttribute, Matrix4, Sphere,
  SkinnedMesh, Vector3, type AnimationClip, type Object3D } from 'three';

const SAMPLE_RATE_HZ = 24;
const MARGIN_RATIO = 0.1;
const MIN_MARGIN_MU = 0.03;

function collectSkinned(root: Object3D): SkinnedMesh[] {
  const result: SkinnedMesh[] = [];
  root.traverse(node => { if (node instanceof SkinnedMesh) result.push(node); });
  return result;
}

type SkinAttribute = BufferAttribute | InterleavedBufferAttribute;
interface BoneMotion { readonly sphere: Sphere; maxScale: number }
interface MeshMotion { readonly mesh: SkinnedMesh; readonly bones: readonly BoneMotion[] }

function component(attribute: SkinAttribute, index: number, item: number): number {
  if (item === 0) return attribute.getX(index);
  if (item === 1) return attribute.getY(index);
  if (item === 2) return attribute.getZ(index);
  return attribute.getW(index);
}

function includeBones(target: readonly MeshMotion[], boneMatrix: Matrix4, point: Vector3): void {
  for (const { mesh, bones } of target) {
    for (let index = 0; index < mesh.skeleton.bones.length; index += 1) {
      boneMatrix.multiplyMatrices(
        mesh.bindMatrixInverse, mesh.skeleton.bones[index]!.matrixWorld,
      );
      bones[index]!.sphere.expandByPoint(point.setFromMatrixPosition(boneMatrix));
      bones[index]!.maxScale = Math.max(
        bones[index]!.maxScale, boneMatrix.getMaxScaleOnAxis(),
      );
    }
  }
}

function sampleMotion(
  actorRoot: Object3D, animationRoot: Object3D, meshes: readonly SkinnedMesh[],
  clips: readonly AnimationClip[],
): readonly MeshMotion[] {
  const result = meshes.map(mesh => ({ mesh, bones: mesh.skeleton.bones.map(
    () => ({ sphere: new Sphere().makeEmpty(), maxScale: 0 }),
  ) }));
  const boneMatrix = new Matrix4(); const point = new Vector3();
  const update = (): void => {
    actorRoot.updateMatrixWorld(true);
    includeBones(result, boneMatrix, point);
  };
  update();
  const mixer = new AnimationMixer(animationRoot);
  try {
    for (const clip of clips) {
      if (!Number.isFinite(clip.duration) || clip.duration <= 0) continue;
      const action = mixer.clipAction(clip); action.play();
      const intervals = Math.max(1, Math.ceil(clip.duration * SAMPLE_RATE_HZ));
      for (let sample = 0; sample <= intervals; sample += 1) {
        action.time = clip.duration * sample / intervals;
        mixer.update(0); update();
      }
      action.stop();
    }
  } finally {
    mixer.stopAllAction(); mixer.uncacheRoot(animationRoot);
    actorRoot.updateMatrixWorld(true);
  }
  return result;
}

/** Event-path owner for conservative SkinnedMesh bounds; no work is done per frame. */
export class DressupCullingBounds {
  readonly #actorRoot: Object3D;
  readonly #animationRoot: Object3D;
  readonly #clips: readonly AnimationClip[];
  readonly #meshEnvelopes = new Map<SkinnedMesh, Sphere>();

  constructor(
    actorRoot: Object3D, animationRoot: Object3D, clips: readonly AnimationClip[],
  ) {
    this.#actorRoot = actorRoot;
    this.#animationRoot = animationRoot; this.#clips = clips;
  }

  refreshMotion(): void {
    this.#rebuild([...this.#meshEnvelopes.keys()]);
  }

  add(root: Object3D): readonly SkinnedMesh[] {
    const meshes = collectSkinned(root);
    if (meshes.length === 0) return meshes;
    this.#rebuild(meshes.filter(mesh => !this.#meshEnvelopes.has(mesh)));
    return meshes;
  }

  remove(meshes: readonly SkinnedMesh[]): void {
    for (const mesh of meshes) this.#meshEnvelopes.delete(mesh);
  }

  #rebuild(meshes: readonly SkinnedMesh[]): void {
    const motions = sampleMotion(this.#actorRoot, this.#animationRoot, meshes, this.#clips);
    for (const { mesh, bones } of motions) {
      const envelope = this.#meshEnvelope(mesh, bones);
      envelope.radius += Math.max(MIN_MARGIN_MU, envelope.radius * MARGIN_RATIO);
      this.#meshEnvelopes.set(mesh, envelope);
      if (mesh.boundingSphere === null) mesh.boundingSphere = envelope.clone();
      else mesh.boundingSphere.copy(envelope);
    }
  }

  #meshEnvelope(mesh: SkinnedMesh, motion: readonly BoneMotion[]): Sphere {
    const envelope = new Sphere().makeEmpty();
    const position = mesh.geometry.getAttribute('position');
    const indices = mesh.geometry.getAttribute('skinIndex');
    const weights = mesh.geometry.getAttribute('skinWeight');
    const offsets = new Float64Array(mesh.skeleton.bones.length); offsets.fill(-1);
    const bindPoint = new Vector3(); const bonePoint = new Vector3();
    if ((position instanceof BufferAttribute || position instanceof InterleavedBufferAttribute)
      && (indices instanceof BufferAttribute || indices instanceof InterleavedBufferAttribute)
      && (weights instanceof BufferAttribute || weights instanceof InterleavedBufferAttribute)) {
      for (let vertex = 0; vertex < position.count; vertex += 1) {
        bindPoint.fromBufferAttribute(position, vertex).applyMatrix4(mesh.bindMatrix);
        for (let item = 0; item < Math.min(4, indices.itemSize, weights.itemSize); item += 1) {
          if (component(weights, vertex, item) <= 0) continue;
          const boneIndex = component(indices, vertex, item);
          const inverse = mesh.skeleton.boneInverses[boneIndex];
          if (!inverse || boneIndex >= offsets.length) continue;
          offsets[boneIndex] = Math.max(
            offsets[boneIndex]!, bonePoint.copy(bindPoint).applyMatrix4(inverse).length(),
          );
        }
      }
      for (let index = 0; index < offsets.length; index += 1) {
        if (offsets[index]! < 0) continue;
        const swept = motion[index]!.sphere.clone();
        swept.radius += offsets[index]! * motion[index]!.maxScale;
        envelope.union(swept);
      }
    }
    if (mesh.geometry.boundingSphere === null) mesh.geometry.computeBoundingSphere();
    const bindSphere = mesh.geometry.boundingSphere;
    if (bindSphere && !bindSphere.isEmpty()) envelope.union(bindSphere);
    return envelope;
  }
}
