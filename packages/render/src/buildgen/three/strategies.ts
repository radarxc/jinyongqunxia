import {
  Box3,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  DataTexture,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  PlaneGeometry,
  Quaternion,
  RGBAFormat,
  ShaderMaterial,
  TextureLoader,
  UnsignedByteType,
  Vector3,
  type Raycaster,
  type Vector2,
} from 'three';
import type {
  BatchStrategy,
  BuildingLayerInput,
  MeshPayload,
  PickBounds,
  PickStrategy,
  SignTextSource,
} from '../types';

import type { UnitPlacement } from './topology';
export {
  createUnitPlacements,
  createUnitTopology,
  type UnitPlacement,
  type UnitTopology,
} from './topology';

export const MERGED_BATCH_STRATEGY: BatchStrategy = Object.freeze({
  id: 'merged-buffer-geometry',
  createGeometry(payload: MeshPayload): BufferGeometry {
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(payload.position, 3));
    geometry.setAttribute('normal', new BufferAttribute(payload.normal, 4, true));
    geometry.setAttribute('uv', new BufferAttribute(payload.uv, 2));
    geometry.setAttribute('aMat', new BufferAttribute(payload.mat, 4, true));
    geometry.setAttribute('aUnit', new BufferAttribute(payload.unit, 2));
    geometry.setAttribute('aTint', new BufferAttribute(payload.tint, 4, true));
    geometry.setIndex(new BufferAttribute(payload.index, 1));
    if (payload.position.length > 0) {
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
    }
    return geometry;
  },
});

const scratchBox = new Box3();
const scratchMin = new Vector3();
const scratchMax = new Vector3();
const scratchHit = new Vector3();
export const BOUNDS_PICK_STRATEGY: PickStrategy = Object.freeze({
  id: 'bounds',
  pick(raycaster: Raycaster, bounds: readonly PickBounds[]): number {
    let selected = -1;
    let distance = Infinity;
    for (const entry of bounds) {
      scratchMin.fromArray(entry.bounds, 0);
      scratchMax.fromArray(entry.bounds, 3);
      scratchBox.set(scratchMin, scratchMax);
      const hit = raycaster.ray.intersectBox(scratchBox, scratchHit);
      if (!hit) continue;
      const nextDistance = raycaster.ray.origin.distanceToSquared(hit);
      if (nextDistance < distance) {
        distance = nextDistance;
        selected = entry.unit;
      }
    }
    return selected;
  },
});

export function createPlanBounds(input: BuildingLayerInput): PickBounds[] {
  const result: PickBounds[] = [];
  const add = (
    unit: number,
    footprint: readonly [number, number, number, number],
    yaw: number,
    baseMm: number,
    platformMm: number,
    ridgeMm: number,
  ): void => {
    const [cx, cz, localW, localD] = footprint;
    const swapped = yaw % 2 === 1;
    const width = (swapped ? localD : localW) / 1000;
    const depth = (swapped ? localW : localD) / 1000;
    const base = baseMm / 1000;
    result.push({
      unit,
      bounds: [
        cx / 1000 - width / 2,
        base,
        cz / 1000 - depth / 2,
        cx / 1000 + width / 2,
        base + (platformMm + ridgeMm) / 1000,
        cz / 1000 + depth / 2,
      ],
    });
  };
  let nextPart = input.plans.length;
  for (let unit = 0; unit < input.plans.length; unit += 1) {
    const plan = input.plans[unit]!;
    add(unit, plan.footprint, plan.yaw, plan.elev[0], plan.elev[1], plan.roof[2]);
    for (const part of plan.parts ?? [])
      add(
        nextPart++,
        [part[1], part[2], part[3], part[4]],
        part[5],
        plan.elev[0],
        part[10],
        part[9],
      );
  }
  for (const wall of input.walls ?? []) {
    let minX = Infinity,
      minZ = Infinity,
      maxX = -Infinity,
      maxZ = -Infinity;
    for (const [x, z] of wall.points) {
      minX = Math.min(minX, x / 1000);
      maxX = Math.max(maxX, x / 1000);
      minZ = Math.min(minZ, z / 1000);
      maxZ = Math.max(maxZ, z / 1000);
    }
    const half = wall.thicknessMm / 2000;
    result.push({
      unit: nextPart++,
      bounds: [minX - half, 0, minZ - half, maxX + half, wall.heightMm / 1000, maxZ + half],
    });
  }
  return result.sort((left, right) => left.unit - right.unit);
}
const SIGN_RGBA = new Uint8Array([92, 54, 31, 255]);
export function createPlainSignTextSource(): SignTextSource {
  const texture = new DataTexture(SIGN_RGBA, 1, 1, RGBAFormat, UnsignedByteType);
  texture.version += 1;
  texture.source.version += 1;
  return { texture, owned: true, rect: () => [0, 0, 1, 1] };
}
export function createAtlasSignTextSource(
  atlas: NonNullable<BuildingLayerInput['signAtlas']>,
): SignTextSource {
  const texture = new TextureLoader().load(atlas.url);
  return {
    texture,
    owned: true,
    rect: (textKey) => atlas.rects[textKey] ?? [0, 0, 1, 1],
  };
}

export function cellCentre(cell: number, cellSizeM: number, out: Vector2): Vector2 {
  const x = ((cell >>> 16) & 0xffff) - 32_768;
  const z = (cell & 0xffff) - 32_768;
  return out.set((x + 0.5) * cellSizeM, (z + 0.5) * cellSizeM);
}

/**
 * Logical instances (`total`, `units`, `sides`, `logical` matrices, `instanceData`) keep fixed
 * indices; the GPU buffers (`mesh.instanceMatrix`, `gpuData`, `gpuUnits`) hold only the visible
 * instances compacted to a prefix, with `mesh.count` = visible count (see accessories.ts).
 */
export interface AccessoryBatch {
  readonly mesh: InstancedMesh;
  readonly total: number;
  readonly units: Uint16Array;
  readonly sides: Uint8Array;
  readonly closed: Float32Array;
  readonly open: Float32Array;
  readonly logical: Float32Array;
  readonly instanceData?: Float32Array | undefined;
  readonly gpuData?: Float32Array | undefined;
  readonly gpuUnits?: Uint16Array | undefined;
}
const accessoryMatrix = new Matrix4();
const accessoryPosition = new Vector3();
const accessoryScale = new Vector3();
const accessoryRotation = new Quaternion();
const UP = new Vector3(0, 1, 0);
export function createDoorBatch(records: readonly Float32Array[]): AccessoryBatch {
  let count = 0;
  for (const data of records) count += data.length / 10;
  const mesh = new InstancedMesh(
    new BoxGeometry(1, 1, 0.06),
    new MeshBasicMaterial({ color: 0x68452f }),
    Math.max(1, count),
  );
  mesh.name = 'building-doors';
  mesh.count = count;
  const units = new Uint16Array(count);
  const sides = new Uint8Array(count);
  const closed = new Float32Array(count * 16);
  const open = new Float32Array(count * 16);
  const logical = new Float32Array(count * 16);
  let instance = 0;
  for (const data of records)
    for (let offset = 0; offset < data.length; offset += 10) {
      const width = data[offset + 6]!;
      const height = data[offset + 7]!;
      const yaw = data[offset + 5]!;
      units[instance] = data[offset]!;
      sides[instance] = Math.round(yaw) & 3;
      accessoryPosition.set(data[offset + 2]!, data[offset + 3]!, data[offset + 4]!);
      accessoryScale.set(width, height, 1);
      accessoryRotation.setFromAxisAngle(UP, (yaw * Math.PI) / 2);
      accessoryMatrix.compose(accessoryPosition, accessoryRotation, accessoryScale);
      accessoryMatrix.toArray(closed, instance * 16);
      const angle = (yaw * Math.PI) / 2;
      // Keep local -X fixed: centre = hinge + rotated half-width after the quarter turn.
      accessoryPosition.x += (-Math.cos(angle) - Math.sin(angle)) * width * 0.5;
      accessoryPosition.z += (Math.sin(angle) - Math.cos(angle)) * width * 0.5;
      accessoryRotation.setFromAxisAngle(UP, angle + Math.PI * 0.5);
      accessoryMatrix.compose(accessoryPosition, accessoryRotation, accessoryScale);
      accessoryMatrix.toArray(open, instance * 16);
      accessoryMatrix.fromArray(closed, instance * 16);
      accessoryMatrix.toArray(logical, instance * 16);
      mesh.setMatrixAt(instance, accessoryMatrix);
      instance += 1;
    }
  return { mesh, total: count, units, sides, closed, open, logical };
}

export function doorNearPoint(batch: AccessoryBatch, index: number, x: number, z: number): boolean {
  const offset = index * 16;
  const dx = batch.closed[offset + 12]! - x;
  const dz = batch.closed[offset + 14]! - z;
  return dx * dx + dz * dz <= 1.8 * 1.8;
}

export function createSignBatch(
  records: readonly Float32Array[],
  placements: readonly UnitPlacement[],
  source: SignTextSource,
): AccessoryBatch {
  let count = 0;
  for (const data of records) count += data.length / 6;
  const material = new ShaderMaterial({
    transparent: true,
    uniforms: { map: { value: source.texture } },
    vertexShader: `attribute vec4 signRect; varying vec2 signUv; void main(){
      signUv=mix(signRect.xy,signRect.zw,uv);
      gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.0);}`,
    fragmentShader: `uniform sampler2D map; varying vec2 signUv; void main(){
      gl_FragColor=texture2D(map,signUv);}`,
  });
  const mesh = new InstancedMesh(new PlaneGeometry(1, 1), material, Math.max(1, count));
  mesh.name = 'building-signs';
  mesh.count = count;
  const units = new Uint16Array(count);
  const sides = new Uint8Array(count);
  const rects = new Float32Array(Math.max(1, count) * 4);
  const closed = new Float32Array(count * 16);
  const open = new Float32Array(count * 16);
  const logical = new Float32Array(count * 16);
  let instance = 0;
  for (const data of records)
    for (let offset = 0; offset < data.length; offset += 6) {
      const unit = data[offset]!;
      const side = data[offset + 1]!;
      const placement = placements[unit];
      const worldSide = ((placement?.yaw ?? 0) + side) & 3;
      const positionYaw = (worldSide * Math.PI) / 2;
      const facingYaw = (-worldSide * Math.PI) / 2;
      units[instance] = unit;
      sides[instance] = worldSide;
      rects.set(source.rect(placement?.textKey ?? '', data[offset + 5]!), instance * 4);
      const centreX = placement?.x ?? 0;
      const centreZ = placement?.z ?? 0;
      const front = ((side & 1) === 0 ? placement?.depth : placement?.width) ?? 0;
      accessoryPosition.set(
        centreX - Math.sin(positionYaw) * (front / 2 - 0.031),
        data[offset + 2]! + data[offset + 3]! / 2,
        centreZ + Math.cos(positionYaw) * (front / 2 - 0.031),
      );
      accessoryScale.set(data[offset + 4]!, data[offset + 3]!, 1);
      accessoryRotation.setFromAxisAngle(UP, facingYaw);
      accessoryMatrix.compose(accessoryPosition, accessoryRotation, accessoryScale);
      accessoryMatrix.toArray(closed, instance * 16);
      accessoryMatrix.toArray(open, instance * 16);
      accessoryMatrix.toArray(logical, instance * 16);
      mesh.setMatrixAt(instance, accessoryMatrix);
      instance += 1;
    }
  const gpuData = rects.slice();
  const gpuUnits = units.slice();
  mesh.geometry.setAttribute('signRect', new InstancedBufferAttribute(gpuData, 4));
  mesh.geometry.setAttribute('signUnit', new InstancedBufferAttribute(gpuUnits, 1, false));
  return {
    mesh,
    total: count,
    units,
    sides,
    closed,
    open,
    logical,
    instanceData: rects,
    gpuData,
    gpuUnits,
  };
}

export function restoreAccessoryGeometry(batch: AccessoryBatch, kind: 'door' | 'sign'): void {
  batch.mesh.geometry.dispose();
  const geometry = kind === 'door' ? new BoxGeometry(1, 1, 0.06) : new PlaneGeometry(1, 1);
  if (kind === 'door')
    geometry.setAttribute(
      'doorOpen',
      new InstancedBufferAttribute(batch.gpuData ?? new Float32Array(Math.max(1, batch.total)), 1),
    );
  else {
    geometry.setAttribute('signRect', new InstancedBufferAttribute(batch.gpuData!, 4));
    geometry.setAttribute('signUnit', new InstancedBufferAttribute(batch.gpuUnits!, 1, false));
  }
  batch.mesh.geometry = geometry;
  batch.mesh.instanceMatrix.version += 1;
}

/** Logical matrix writers: they never touch the compacted GPU buffer directly. */
export function setAccessoryMatrix(batch: AccessoryBatch, index: number, open: boolean): void {
  const source = open ? batch.open : batch.closed;
  for (let element = 0; element < 16; element += 1)
    batch.logical[index * 16 + element] = source[index * 16 + element]!;
}
export function setAccessoryBlend(batch: AccessoryBatch, index: number, amount: number): void {
  const offset = index * 16;
  const m00 = batch.closed[offset]!;
  const m02 = batch.closed[offset + 2]!;
  const width = Math.hypot(m00, m02);
  const angle = Math.atan2(-m02, m00) + amount * Math.PI * 0.5;
  const hingeX = batch.closed[offset + 12]! - m00 * 0.5;
  const hingeZ = batch.closed[offset + 14]! - m02 * 0.5;
  accessoryPosition.set(
    hingeX + Math.cos(angle) * width * 0.5,
    batch.closed[offset + 13]!,
    hingeZ - Math.sin(angle) * width * 0.5,
  );
  accessoryScale.set(
    width,
    Math.hypot(batch.closed[offset + 4]!, batch.closed[offset + 5]!, batch.closed[offset + 6]!),
    Math.hypot(batch.closed[offset + 8]!, batch.closed[offset + 9]!, batch.closed[offset + 10]!),
  );
  accessoryRotation.setFromAxisAngle(UP, angle);
  accessoryMatrix.compose(accessoryPosition, accessoryRotation, accessoryScale);
  accessoryMatrix.toArray(batch.logical, index * 16);
}

/** Logical open amounts (returned) plus a compacted GPU copy bound as the `doorOpen` attribute. */
export function addDoorOpenAttribute(batch: AccessoryBatch): Float32Array {
  const values = new Float32Array(Math.max(1, batch.total));
  const gpu = new Float32Array(Math.max(1, batch.total));
  batch.mesh.geometry.setAttribute('doorOpen', new InstancedBufferAttribute(gpu, 1));
  (batch as { instanceData?: Float32Array }).instanceData = values;
  (batch as { gpuData?: Float32Array }).gpuData = gpu;
  return values;
}
