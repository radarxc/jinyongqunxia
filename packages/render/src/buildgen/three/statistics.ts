import { InstancedMesh, type Mesh } from 'three';
import type { BuildingLayerStats, CellPayload } from '../types';
import type { InteriorLru } from './interiors';
import { meshPayloadBytes, type CellResource } from './resources';

export function meshAttributeBytes(mesh: Mesh): number {
  let bytes = mesh.geometry.index?.array.byteLength ?? 0;
  for (const key of Object.keys(mesh.geometry.attributes))
    bytes += mesh.geometry.attributes[key]!.array.byteLength;
  return bytes + (mesh instanceof InstancedMesh ? mesh.instanceMatrix.array.byteLength : 0);
}

/** Door / sign batch; `mesh.count` is the compacted number of instances actually submitted. */
export interface AccessoryVisibility {
  readonly mesh: InstancedMesh;
  readonly trianglesPerInstance: number;
  /** Owning cell slot of every logical instance, in batch order. */
  readonly slots: Uint32Array;
}

/** Cell slot of every door (10 floats) or sign (6 floats) record, in batch creation order. */
export function accessorySlots(
  payloads: readonly CellPayload[],
  records: (payload: CellPayload) => Float32Array,
  stride: number,
): Uint32Array {
  let count = 0;
  for (const payload of payloads) count += records(payload).length / stride;
  const slots = new Uint32Array(count);
  let instance = 0;
  for (let slot = 0; slot < payloads.length; slot += 1) {
    const length = records(payloads[slot]!).length / stride;
    for (let offset = 0; offset < length; offset += 1) slots[instance++] = slot;
  }
  return slots;
}

export interface StatsContext {
  readonly stats: BuildingLayerStats;
  readonly resources: readonly CellResource[];
  /** `resources[i]` belongs to cell slot `resourceSlots[i]`. */
  readonly resourceSlots: readonly number[];
  /** Per cell slot: 1 once its meshes are uploaded and pass `cellVisible`, else 0. */
  readonly cellShown: Uint8Array;
  readonly doors: AccessoryVisibility;
  readonly signs: AccessoryVisibility;
  readonly attachmentBytes: number;
  readonly textureBytes: number;
  readonly interior: InteriorLru;
  readonly vignette: Mesh;
  readonly cellVisible?: ((bounds: Float32Array) => boolean) | undefined;
}

/** Bounds culling for uploaded cells; accessories follow `cellShown` of their owning cell. */
export function updateCellVisibility(context: StatsContext): void {
  for (let index = 0; index < context.resources.length; index += 1) {
    const resource = context.resources[index]!;
    const visible = context.cellVisible?.(resource.payload.shell.bounds) ?? true;
    resource.shell.visible = visible;
    resource.roof.visible = visible;
    context.cellShown[context.resourceSlots[index]!] = visible ? 1 : 0;
  }
}

/** Only counts what actually draws: visible cells, non-empty accessory batches, interiors, vignette. */
export function refreshBuildingStats(context: StatsContext): void {
  let visible = 0,
    triangles = 0,
    geometryBytes = 0;
  for (let index = 0; index < context.resources.length; index += 1) {
    const resource = context.resources[index]!;
    geometryBytes +=
      meshPayloadBytes(resource.payload.shell) + meshPayloadBytes(resource.payload.roof);
    if (!resource.shell.visible) continue;
    visible += 1;
    triangles += (resource.payload.shell.index.length + resource.payload.roof.index.length) / 3;
  }
  let draws = visible * 2;
  // Exactly what Three submits: the compacted instance prefix of each visible batch.
  const doors = context.doors.mesh.visible ? context.doors.mesh.count : 0;
  const signs = context.signs.mesh.visible ? context.signs.mesh.count : 0;
  draws += Number(doors > 0) + Number(signs > 0);
  triangles +=
    doors * context.doors.trianglesPerInstance + signs * context.signs.trianglesPerInstance;
  const vignetteDraw = Number(context.vignette.visible);
  context.stats.visibleCells = visible;
  context.stats.drawCalls = draws + context.interior.visibleDraws + vignetteDraw;
  context.stats.triangles = triangles + context.interior.visibleTriangles + vignetteDraw * 2;
  context.stats.geometryBytes = geometryBytes + context.attachmentBytes;
  context.stats.textureBytes = context.textureBytes;
  context.stats.interiors = context.interior.size;
}

export function resetBuildingStats(stats: BuildingLayerStats): void {
  stats.drawCalls = 0;
  stats.triangles = 0;
  stats.visibleCells = 0;
  stats.pendingCells = 0;
  stats.geometryBytes = 0;
  stats.textureBytes = 0;
  stats.interiors = 0;
}
