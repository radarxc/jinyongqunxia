import type { BufferAttribute } from 'three';
import { accessoryVisible, type BuildingState } from './state';
import {
  doorNearPoint,
  setAccessoryBlend,
  setAccessoryMatrix,
  type AccessoryBatch,
} from './strategies';

const GPU_INSTANCE_ATTRIBUTES = ['doorOpen', 'signRect', 'signUnit'] as const;

/**
 * Writes the visible logical instances into the GPU buffers as a dense prefix and sets
 * `mesh.count`, so culled / cut-away accessories are never submitted (not even as degenerate
 * zero-scale instances). `shown[index]` is the logical visibility (1 = draw). Zero allocation.
 */
export function compactAccessoryBatch(batch: AccessoryBatch, shown: Uint8Array): number {
  const matrices = batch.mesh.instanceMatrix.array as Float32Array;
  const extra = batch.instanceData;
  const gpuExtra = batch.gpuData;
  const extraSize = extra && gpuExtra ? extra.length / Math.max(1, batch.total) : 0;
  const units = batch.gpuUnits;
  let slot = 0;
  for (let index = 0; index < batch.total; index += 1) {
    if (shown[index] !== 1) continue;
    for (let element = 0; element < 16; element += 1)
      matrices[slot * 16 + element] = batch.logical[index * 16 + element]!;
    for (let element = 0; element < extraSize; element += 1)
      gpuExtra![slot * extraSize + element] = extra![index * extraSize + element]!;
    if (units) units[slot] = batch.units[index]!;
    slot += 1;
  }
  batch.mesh.count = slot;
  batch.mesh.visible = slot > 0;
  batch.mesh.instanceMatrix.version += 1;
  const geometry = batch.mesh.geometry;
  for (let index = 0; index < GPU_INSTANCE_ATTRIBUTES.length; index += 1) {
    // Accessory batches only carry plain InstancedBufferAttributes (no interleaving).
    const attribute = geometry.getAttribute(GPU_INSTANCE_ATTRIBUTES[index]!) as
      BufferAttribute | undefined;
    if (attribute) attribute.version += 1;
  }
  return slot;
}

/**
 * Per-frame door state: a door is hidden when its facade is cut away or its owning cell is culled
 * or not uploaded yet (`cellShown[slot] === 0`); visible doors swing within 1.8 m of the focus.
 * The GPU prefix is rebuilt only when visibility or a visible door's matrix changed.
 */
export function updateDoorInstances(
  batch: AccessoryBatch,
  slots: Uint32Array,
  cellShown: Uint8Array,
  states: readonly BuildingState[],
  facadeMask: number,
  desiredState: Int8Array,
  openState: Float32Array,
  shown: Uint8Array,
  hasFocus: boolean,
  focusX: number,
  focusZ: number,
  dt: number,
  reducedMotion: boolean,
): number {
  let dirty = false;
  const step = (dt > 0 ? dt : 0) * 4;
  for (let index = 0; index < batch.total; index += 1) {
    const hidden =
      !accessoryVisible(states, batch.units[index]!, batch.sides[index]!, facadeMask) ||
      cellShown[slots[index]!] === 0;
    const visible = hidden ? 0 : 1;
    if (shown[index] !== visible) {
      shown[index] = visible;
      dirty = true;
    }
    const target = hasFocus && doorNearPoint(batch, index, focusX, focusZ) ? 1 : 0;
    const desired = hidden ? -1 : target;
    if (desiredState[index] === desired && openState[index] === target) continue;
    const current = openState[index]!;
    const next = reducedMotion
      ? target
      : target < current
        ? Math.max(target, current - step)
        : Math.min(target, current + step);
    if (desiredState[index] === desired && current === next) continue;
    desiredState[index] = desired;
    openState[index] = next;
    if (hidden) continue;
    dirty = true;
    if (next === 0 || next === 1) setAccessoryMatrix(batch, index, next === 1);
    else setAccessoryBlend(batch, index, next);
  }
  return dirty ? compactAccessoryBatch(batch, shown) : batch.mesh.count;
}

/** Signs follow the cutaway of their facade and the visibility of their owning cell. */
export function updateSignInstances(
  batch: AccessoryBatch,
  slots: Uint32Array,
  cellShown: Uint8Array,
  states: readonly BuildingState[],
  facadeMask: number,
  shown: Uint8Array,
): number {
  let dirty = false;
  for (let index = 0; index < batch.total; index += 1) {
    const visible =
      accessoryVisible(states, batch.units[index]!, batch.sides[index]!, facadeMask) &&
      cellShown[slots[index]!] === 1
        ? 1
        : 0;
    if (shown[index] === visible) continue;
    shown[index] = visible;
    dirty = true;
  }
  return dirty ? compactAccessoryBatch(batch, shown) : batch.mesh.count;
}
