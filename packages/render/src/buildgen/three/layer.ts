import { Group, Vector2, Vector3, type Material } from 'three';
import { ISO_LIT_UNIFORMS, setStaticLitCameraYaw } from '../../materials/static-lit/lighting';
import { createStaticLitMaterial } from '../../materials/static-lit/material';
import {
  PlaceholderLayerTextureSource,
  createStateTexture,
  createUnitTopTexture,
  uploadTexture,
} from '../../materials/static-lit/textures';
import { warmStaticLitMaterials } from '../../materials/static-lit/warmup';
import type { BuildingLayer, BuildingLayerInput, BuildingLayerStats } from '../types';
import { compactAccessoryBatch, updateDoorInstances, updateSignInstances } from './accessories';
import { cutFacadeMask } from './cutaway';
import { InteriorLru } from './interiors';
import { advanceBuildingStates, createBuildingStates } from './state';
import {
  addDoorOpenAttribute,
  BOUNDS_PICK_STRATEGY,
  cellCentre,
  createAtlasSignTextSource,
  createDoorBatch,
  createPlanBounds,
  createPlainSignTextSource,
  createSignBatch,
  restoreAccessoryGeometry,
} from './strategies';
import {
  createInteriorVignette,
  restoreInteriorVignette,
  setInteriorVignettePlan,
  updateInteriorVignette,
} from './vignette';
import { prepareLayerPayloads } from './prepare';
import { createUnitPlacements, createUnitTopology } from './topology';
import { createWallPickBounds } from './walls';
import {
  boundsContainPoint,
  disposeOwnedMesh,
  rebuildCellGeometry,
  setStaticLayerUniforms,
  uploadCellMeshes,
  type CellResource,
} from './resources';
import {
  accessorySlots,
  meshAttributeBytes,
  refreshBuildingStats,
  resetBuildingStats,
  updateCellVisibility,
  type StatsContext,
} from './statistics';
const PART_KIND_ENCLOSURE = 3;
export async function createBuildingLayer(input: BuildingLayerInput): Promise<BuildingLayer> {
  if (input.generator === 'worker') throw new Error('BUILDGEN_WORKER_NOT_AVAILABLE');
  const tier = input.quality.tier;
  const lod = tier === 'low' || tier === 'mid' ? 1 : 0;
  const cellSizeM = tier === 'low' || tier === 'mid' ? 16 : 32;
  const { payloads, units, wallUnitBase } = prepareLayerPayloads(input, lod, cellSizeM);
  const root = new Group();
  root.name = 'building-layer';
  const state = createStateTexture(units);
  const unitTop = createUnitTopTexture(input.plans, units);
  const textureResult = await (input.layerTextures ?? new PlaceholderLayerTextureSource()).load(
    input.kit,
    input.quality,
  );
  input.observeStateTexture?.(state.texture, state.data);
  uploadTexture(input.renderer, state.texture);
  uploadTexture(input.renderer, unitTop.texture);
  uploadTexture(input.renderer, textureResult.texture);
  const shellMaterial = createStaticLitMaterial({
    layers: textureResult.texture,
    state: state.texture,
    unitTop: unitTop.texture,
    repeatM: textureResult.repeatM,
  });
  const roofMaterial = createStaticLitMaterial({
    layers: textureResult.texture,
    state: state.texture,
    unitTop: unitTop.texture,
    repeatM: textureResult.repeatM,
    roofFade: true,
  });
  const shadowMaterial = createStaticLitMaterial({
    layers: textureResult.texture,
    state: state.texture,
    unitTop: unitTop.texture,
    repeatM: textureResult.repeatM,
    depthOnly: true,
  });
  await warmStaticLitMaterials(input.renderer, shellMaterial, roofMaterial, shadowMaterial);
  const stats: BuildingLayerStats = {
    drawCalls: 0,
    triangles: 0,
    cells: payloads.length,
    visibleCells: 0,
    units,
    interiors: 0,
    pendingCells: payloads.length,
    geometryBytes: 0,
    textureBytes:
      state.data.byteLength +
      unitTop.data.byteLength +
      (textureResult.texture.image.data?.byteLength ?? 0),
    lastCellMs: 0,
  };
  const states = createBuildingStates(units);
  const topology = createUnitTopology(input, units);
  const ownerModes = new Int8Array(topology.groups.length);
  const resources: CellResource[] = [];
  const bounds = createPlanBounds(input);
  const collisionBounds = bounds.slice(0, wallUnitBase);
  collisionBounds.push(...createWallPickBounds(input.walls, wallUnitBase, cellSizeM));
  const focus = new Vector3();
  const focus2 = new Vector2();
  const pendingCentre = new Vector2();
  let focusRadius = 0;
  let focusFade = 0;
  let focusFadeTarget = 0;
  let hasFocus = false;
  let pendingCursor = 0;
  let disposed = false;
  let readyResolved = false;
  let resolveReady = () => {};
  const readyPromise = new Promise<void>((resolve) => {
    resolveReady = resolve;
  });
  const interior = new InteriorLru(root, tier === 'low' ? 2 : 4);
  const signSource =
    input.signText ??
    (input.signAtlas ? createAtlasSignTextSource(input.signAtlas) : createPlainSignTextSource());
  const doorBatch = createDoorBatch(payloads.map((payload) => payload.doors));
  const placements = createUnitPlacements(input.plans);
  const signBatch = createSignBatch(
    payloads.map((payload) => payload.signs),
    placements,
    signSource,
  );
  const doorOpen = addDoorOpenAttribute(doorBatch);
  root.add(doorBatch.mesh, signBatch.mesh);
  const doorDesired = new Int8Array(Math.max(1, doorBatch.total));
  doorDesired.fill(-2);
  // Logical visibility; nothing is uploaded yet, so both GPU prefixes start empty.
  const doorShown = new Uint8Array(Math.max(1, doorBatch.total));
  const signShown = new Uint8Array(Math.max(1, signBatch.total));
  compactAccessoryBatch(doorBatch, doorShown);
  compactAccessoryBatch(signBatch, signShown);
  const vignette = createInteriorVignette(input.renderer);
  root.add(vignette);
  let vignetteOwner = -1;
  let cameraYaw = 45;
  let currentFacadeMask = cutFacadeMask(cameraYaw);
  setStaticLayerUniforms(shellMaterial, cameraYaw, focus, focusRadius, focusFade);
  setStaticLayerUniforms(roofMaterial, cameraYaw, focus, focusRadius, focusFade);
  const signImage = signSource.texture?.image as { data?: ArrayBufferView } | undefined;
  const baseTextureBytes = stats.textureBytes + (signImage?.data?.byteLength ?? 0);
  // Accessories belong to the cell they were generated in; payload order is still the batch order
  // here (later focus re-sorts only change the upload queue).
  const cellSlots = new Map<number, number>();
  for (let slot = 0; slot < payloads.length; slot += 1) cellSlots.set(payloads[slot]!.cell, slot);
  const resourceSlots: number[] = [];
  const statsContext: StatsContext = {
    stats,
    resources,
    resourceSlots,
    cellShown: new Uint8Array(Math.max(1, payloads.length)),
    doors: {
      mesh: doorBatch.mesh,
      trianglesPerInstance: 12,
      slots: accessorySlots(payloads, (payload) => payload.doors, 10),
    },
    signs: {
      mesh: signBatch.mesh,
      trianglesPerInstance: 2,
      slots: accessorySlots(payloads, (payload) => payload.signs, 6),
    },
    attachmentBytes:
      meshAttributeBytes(doorBatch.mesh) +
      meshAttributeBytes(signBatch.mesh) +
      meshAttributeBytes(vignette),
    textureBytes: baseTextureBytes,
    interior,
    vignette,
    cellVisible: input.cellVisible,
  };
  const cellShown = statsContext.cellShown;
  const doorSlots = statsContext.doors.slots;
  const signSlots = statsContext.signs.slots;
  const refreshStats = (): void => refreshBuildingStats(statsContext);

  function resortPending(): void {
    for (let index = pendingCursor + 1; index < payloads.length; index += 1) {
      const candidate = payloads[index]!;
      cellCentre(candidate.cell, cellSizeM, pendingCentre);
      const candidateDistance = pendingCentre.distanceToSquared(focus2);
      let insert = index;
      for (; insert > pendingCursor; insert -= 1) {
        cellCentre(payloads[insert - 1]!.cell, cellSizeM, pendingCentre);
        if (pendingCentre.distanceToSquared(focus2) <= candidateDistance) break;
        payloads[insert] = payloads[insert - 1]!;
      }
      payloads[insert] = candidate;
    }
  }

  function uploadOne(): void {
    if (pendingCursor >= payloads.length) return;
    const started = performance.now();
    const next = payloads[pendingCursor++]!;
    const resource = uploadCellMeshes(root, next, input, shellMaterial, roofMaterial);
    resource.roof.customDepthMaterial = shadowMaterial;
    resources.push(resource);
    resourceSlots.push(cellSlots.get(next.cell) ?? 0);
    stats.pendingCells = payloads.length - pendingCursor;
    stats.lastCellMs = performance.now() - started;
    refreshStats();
    if (stats.pendingCells === 0 && !readyResolved) {
      readyResolved = true;
      resolveReady();
    }
  }
  if (payloads.length === 0) {
    readyResolved = true;
    resolveReady();
  }

  const layer: BuildingLayer = {
    object: root,
    stats,
    setCutaway(index, mode) {
      if (!Number.isInteger(index) || index < 0 || index >= units) return;
      const owner = topology.owners[index]!;
      if (owner < 0) return;
      ownerModes[owner] = mode;
      const group = topology.groups[owner]!;
      for (let offset = 0; offset < group.length; offset += 1) {
        const unit = group[offset]!;
        states[unit]!.mode =
          mode === 0 ? 0 : mode === 1 && topology.kinds[unit] === PART_KIND_ENCLOSURE ? 2 : 1;
      }
      if (mode === 2) states[index]!.mode = 2;
      if (mode === 0) interior.hide(owner);
      else interior.touch(owner);
      stats.interiors = interior.size;
      if (mode === 2) vignetteOwner = owner;
      else if (vignetteOwner === owner) {
        vignetteOwner = -1;
        for (let candidate = 0; candidate < ownerModes.length; candidate += 1)
          if (ownerModes[candidate] === 2) {
            vignetteOwner = candidate;
            break;
          }
      }
      vignette.visible = vignetteOwner >= 0;
      const vignettePlan = input.plans[vignetteOwner];
      if (vignettePlan) setInteriorVignettePlan(vignette, vignettePlan);
      refreshStats();
    },
    setCameraYaw(deg) {
      if (!Number.isFinite(deg)) return;
      cameraYaw = deg;
      setStaticLitCameraYaw(cameraYaw);
      currentFacadeMask = cutFacadeMask(cameraYaw);
      setStaticLayerUniforms(shellMaterial, cameraYaw, focus, focusRadius, focusFade);
      setStaticLayerUniforms(roofMaterial, cameraYaw, focus, focusRadius, focusFade);
    },
    setFocusOcclusion(next, radiusM) {
      focus.copy(next);
      focus2.set(next.x, next.z);
      const nextRadius = Number.isFinite(radiusM) ? Math.max(0, radiusM) : 0;
      if (nextRadius > 0) focusRadius = nextRadius;
      hasFocus = nextRadius > 0;
      focusFadeTarget = hasFocus ? 1 : 0;
      resortPending();
      setStaticLayerUniforms(shellMaterial, cameraYaw, focus, focusRadius, focusFade);
      setStaticLayerUniforms(roofMaterial, cameraYaw, focus, focusRadius, focusFade);
    },
    update(dt, reducedMotion) {
      if (disposed) return;
      uploadOne();
      updateCellVisibility(statsContext);
      updateInteriorVignette(vignette, input.renderer);
      advanceBuildingStates(
        states,
        state.data,
        state.texture,
        dt,
        reducedMotion,
        ISO_LIT_UNIFORMS.uLampIntensity.value > 0,
      );
      if (focusFade !== focusFadeTarget) {
        const fadeStep = reducedMotion ? 1 : (dt > 0 ? dt : 0) / 0.2;
        focusFade =
          focusFadeTarget < focusFade
            ? Math.max(focusFadeTarget, focusFade - fadeStep)
            : Math.min(focusFadeTarget, focusFade + fadeStep);
      }
      if (focusFade === 0 && focusFadeTarget === 0) focusRadius = 0;
      shellMaterial.staticUniforms.uFocusRadiusFade.value.x = focusRadius;
      roofMaterial.staticUniforms.uFocusRadiusFade.value.x = focusRadius;
      shellMaterial.staticUniforms.uFocusRadiusFade.value.y = focusFade;
      roofMaterial.staticUniforms.uFocusRadiusFade.value.y = focusFade;
      const mask = currentFacadeMask;
      updateDoorInstances(
        doorBatch,
        doorSlots,
        cellShown,
        states,
        mask,
        doorDesired,
        doorOpen,
        doorShown,
        hasFocus,
        focus.x,
        focus.z,
        dt,
        reducedMotion,
      );
      updateSignInstances(signBatch, signSlots, cellShown, states, mask, signShown);
      refreshStats();
    },
    pick(raycaster) {
      return (input.pickStrategy ?? BOUNDS_PICK_STRATEGY).pick(raycaster, collisionBounds);
    },
    restore() {
      if (disposed) return;
      state.texture.version += 1;
      state.texture.source.version += 1;
      unitTop.texture.version += 1;
      unitTop.texture.source.version += 1;
      textureResult.texture.version += 1;
      textureResult.texture.source.version += 1;
      rebuildCellGeometry(resources, input);
      restoreAccessoryGeometry(doorBatch, 'door');
      restoreAccessoryGeometry(signBatch, 'sign');
      restoreInteriorVignette(vignette);
      interior.restore();
      uploadTexture(input.renderer, state.texture);
      uploadTexture(input.renderer, unitTop.texture);
      uploadTexture(input.renderer, textureResult.texture);
      if (signSource.texture) uploadTexture(input.renderer, signSource.texture);
      refreshStats();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const resource of resources) {
        resource.shell.geometry.dispose();
        resource.roof.geometry.dispose();
      }
      resources.length = 0;
      interior.dispose();
      doorBatch.mesh.dispose();
      doorBatch.mesh.geometry.dispose();
      (doorBatch.mesh.material as Material).dispose();
      signBatch.mesh.dispose();
      signBatch.mesh.geometry.dispose();
      (signBatch.mesh.material as Material).dispose();
      disposeOwnedMesh(vignette);
      shellMaterial.dispose();
      roofMaterial.dispose();
      shadowMaterial.dispose();
      state.texture.dispose();
      unitTop.texture.dispose();
      if (textureResult.owned) textureResult.texture.dispose();
      if (signSource.owned) signSource.texture?.dispose();
      root.clear();
      resetBuildingStats(stats);
      if (!readyResolved) {
        readyResolved = true;
        resolveReady();
      }
    },
    ready() {
      return readyPromise;
    },
    occludes(point) {
      return boundsContainPoint(collisionBounds, point);
    },
    measure(index) {
      const entry = bounds[index];
      if (!entry) throw new RangeError(`BUILDGEN_UNIT:${index}`);
      const b = entry.bounds;
      return { bounds: b, widthM: b[3] - b[0], depthM: b[5] - b[2], heightM: b[4] - b[1] };
    },
  };
  resortPending();
  refreshStats();
  return layer;
}
