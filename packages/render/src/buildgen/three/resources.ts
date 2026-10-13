import { Mesh, type Group, type Material, type Vector3 } from 'three';
import { cameraBack } from '../../camera/iso-camera';
import type { StaticLitMaterial } from '../../materials/static-lit/material';
import type { BuildingLayerInput, CellPayload, MeshPayload, PickBounds } from '../types';
import { cutFacadeMask } from './cutaway';
import { MERGED_BATCH_STRATEGY } from './strategies';

export interface CellResource {
  readonly payload: CellPayload;
  readonly shell: Mesh;
  readonly roof: Mesh;
}
const cameraBackScratch = { x: 0, y: 0, z: 0 };

export function meshPayloadBytes(mesh: MeshPayload): number {
  return (
    mesh.position.byteLength +
    mesh.normal.byteLength +
    mesh.uv.byteLength +
    mesh.mat.byteLength +
    mesh.unit.byteLength +
    mesh.tint.byteLength +
    mesh.index.byteLength +
    mesh.bounds.byteLength
  );
}

export function disposeOwnedMesh(mesh: Mesh): void {
  mesh.geometry.dispose();
  (mesh.material as Material).dispose();
}

export function setStaticLayerUniforms(
  material: StaticLitMaterial,
  yaw: number,
  focus: Vector3,
  radius: number,
  fade: number,
): void {
  cameraBack(yaw, cameraBackScratch);
  material.staticUniforms.uCameraBack.value.set(
    cameraBackScratch.x,
    cameraBackScratch.y,
    cameraBackScratch.z,
  );
  material.staticUniforms.uCutFacadeMask.value = cutFacadeMask(yaw);
  material.staticUniforms.uFocusWorld.value.copy(focus);
  material.staticUniforms.uFocusRadiusFade.value.set(radius, fade);
}

export function uploadCellMeshes(
  root: Group,
  payload: CellPayload,
  input: BuildingLayerInput,
  shellMaterial: StaticLitMaterial,
  roofMaterial: StaticLitMaterial,
): CellResource {
  const strategy = input.batchStrategy ?? MERGED_BATCH_STRATEGY;
  const shell = new Mesh(strategy.createGeometry(payload.shell), shellMaterial);
  const roof = new Mesh(strategy.createGeometry(payload.roof), roofMaterial);
  shell.name = `building-shell-${payload.cell}`;
  roof.name = `building-roof-${payload.cell}`;
  shell.castShadow = true;
  shell.receiveShadow = true;
  roof.castShadow = true;
  roof.receiveShadow = true;
  root.add(shell, roof);
  return { payload, shell, roof };
}

/** Context restore: rebuild every uploaded cell's GPU geometry from its retained CPU payload. */
export function rebuildCellGeometry(
  resources: readonly CellResource[],
  input: BuildingLayerInput,
): void {
  for (const resource of resources) {
    const shell =
      input.batchStrategy?.createGeometry(resource.payload.shell) ??
      MERGED_BATCH_STRATEGY.createGeometry(resource.payload.shell);
    const roof =
      input.batchStrategy?.createGeometry(resource.payload.roof) ??
      MERGED_BATCH_STRATEGY.createGeometry(resource.payload.roof);
    resource.shell.geometry.dispose();
    resource.roof.geometry.dispose();
    resource.shell.geometry = shell;
    resource.roof.geometry = roof;
  }
}

/** True when the point lies inside any [minX, minY, minZ, maxX, maxY, maxZ] pick box. */
export function boundsContainPoint(entries: readonly PickBounds[], point: Vector3): boolean {
  for (const entry of entries) {
    const b = entry.bounds;
    if (
      point.x >= b[0] &&
      point.x <= b[3] &&
      point.y >= b[1] &&
      point.y <= b[4] &&
      point.z >= b[2] &&
      point.z <= b[5]
    )
      return true;
  }
  return false;
}
