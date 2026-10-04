import { OrthographicCamera, Raycaster, Scene, Vector2, Vector3, WebGLRenderer } from 'three';
import { cameraBack, IsoCameraRotation } from '../camera/iso-camera';
import { hexDirToRig } from '../camera/facing';
import { createTimeTintPass } from '../lighting/tint-pass';
import { createTimeOfDayFrame, evaluateTimeOfDay } from '../lighting/time-of-day';
import { createContextGuard } from '../core/context-guard';
import { getDefaultRenderQuality } from '../quality/tiers';
import { RigBatch } from '../rig/batch';
import { createRigCharacter, type RigInstance } from '../rig/character';
import { equipmentEquals, weightClassForEquipment } from '../rig/equipment';
import { loadRigSet } from '../rig/manifest';
import { createPlaceholderRigManifest } from '../rig/placeholder';
import type { Dir8 } from '../rig/types';
import { HexLayer, hexWorld } from './hex-layer';
import type { BattleCell, BattleMarker, BattleRenderer, BattleRendererOptions } from './types';
import type { BattleModelStage } from './model-stage';

export interface BattlePickCandidate {
  readonly instanceId: number;
  readonly screenX: number;
  readonly screenY: number;
}
/** Shared-edge policy: nearest projected cell centre, then stable (r,q). */
export function chooseBattleCell(
  cells: readonly BattleCell[],
  candidates: readonly BattlePickCandidate[],
  pointer: Readonly<{ x: number; y: number }>,
): BattleCell | null {
  const ranked = [...candidates].sort((left, right) => {
    const leftDistance = (left.screenX - pointer.x) ** 2 + (left.screenY - pointer.y) ** 2;
    const rightDistance = (right.screenX - pointer.x) ** 2 + (right.screenY - pointer.y) ** 2;
    const a = cells[left.instanceId];
    const b = cells[right.instanceId];
    return leftDistance - rightDistance || (a?.r ?? 0) - (b?.r ?? 0) || (a?.q ?? 0) - (b?.q ?? 0);
  });
  return cells[ranked[0]?.instanceId ?? -1] ?? null;
}
export async function createBattleRenderer(
  canvas: HTMLCanvasElement,
  cells: readonly BattleCell[],
  options: BattleRendererOptions = {},
): Promise<BattleRenderer> {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0xe7dec8);
  renderer.autoClear = false;
  renderer.info.autoReset = false;
  const quality = options.quality ?? getDefaultRenderQuality();
  const scene = new Scene();
  const camera = new OrthographicCamera(-6, 6, 4, -4, 0.1, 100);
  const terrain = new HexLayer(cells);
  scene.add(terrain.mesh);
  const tintPass = createTimeTintPass();
  const timeFrame = createTimeOfDayFrame();
  let rigSet;
  try {
    rigSet = await loadRigSet(options.rig ?? createPlaceholderRigManifest());
  } catch (error) {
    terrain.dispose();
    tintPass.dispose();
    renderer.forceContextLoss(); renderer.dispose();
    throw error;
  }
  const batch = new RigBatch(rigSet, 100);
  batch.addTo(scene);
  const characters = new Map<string, { character: RigInstance; marker: BattleMarker; dir: Dir8 }>();
  let modelStage: BattleModelStage | undefined;
  let latestUnits: readonly BattleMarker[] = [];
  let modelStageLoading = false;
  const point = new Vector3();
  const mouse = new Vector2();
  const raycaster = new Raycaster();
  const center = new Vector3();
  const snapshotAnchor = new Vector3();
  const cameraRight = new Vector3();
  const cameraBackVector = new Vector3();
  const rotation = new IsoCameraRotation();
  let radius = 1;
  let minimumX = Infinity;
  let maximumX = -Infinity;
  let minimumZ = Infinity;
  let maximumZ = -Infinity;
  let maxHeight = 0;
  for (const cell of cells) {
    hexWorld(cell.q, cell.r, cell.height, point);
    minimumX = Math.min(minimumX, point.x);
    maximumX = Math.max(maximumX, point.x);
    minimumZ = Math.min(minimumZ, point.z);
    maximumZ = Math.max(maximumZ, point.z);
    maxHeight = Math.max(maxHeight, point.y);
  }
  center.set((minimumX + maximumX) / 2, maxHeight / 2, (minimumZ + maximumZ) / 2);
  radius = Math.hypot(maximumX - minimumX, maximumZ - minimumZ) / 2 + 1.5;
  const distance = Math.max(20, radius * 3);
  function placeCamera(): void {
    cameraBack(rotation.yawDeg, cameraBackVector);
    camera.position.set(
      center.x + cameraBackVector.x * distance,
      center.y + cameraBackVector.y * distance,
      center.z + cameraBackVector.z * distance,
    );
    camera.lookAt(center);
    camera.updateMatrixWorld();
  }
  camera.far = distance * 3;
  placeCamera();
  let width = 1;
  let height = 1;
  let deviceDpr = 1;
  let appliedPixelRatio = quality.effectivePixelRatio(deviceDpr);
  let previousTime = 0;
  let samplingPrevious: number | undefined;
  let disposed = false;
  let pickBlockedUntil = 0;
  let snapPickGuardPending = false;
  const contextGuard = createContextGuard(canvas, renderer, {
    onStateChange: (state) => {
      previousTime = 0; samplingPrevious = undefined;
      quality.invalidateSamples?.(performance.now());
      options.onContextStateChange?.(state);
    },
    onLoss: (count) => { quality.reportContextLoss?.(); options.onContextLoss?.(count); },
    onRecreate: options.onContextRecreate,
    onFatal: options.onContextFatal,
    onRestore: () => {
      terrain.restore();
      rigSet.texture.needsUpdate = true;
      modelStage?.restore();
      tintPass.setTime(timeFrame);
    },
    requestFrame: () => {
      previousTime = 0; samplingPrevious = undefined;
      quality.invalidateSamples?.(performance.now()); options.requestFrame?.();
    },
  });
  evaluateTimeOfDay(12, timeFrame);
  tintPass.setTime(timeFrame);
  const stats = {
    drawCalls: 0,
    characters: 0,
    instances: 0,
    cpuMs: 0,
    frameMs: 0,
    placeholders: rigSet.placeholderCount,
    modelCharacters: 0,
    modelDrawCalls: 0,
    modelFailures: 0,
    modelMoving: 0,
  };
  function syncModelVisibility(): void {
    for (const [id, entry] of characters) {
      const shouldShow = entry.marker.active && !modelStage?.hasModel(id);
      if (shouldShow) batch.add(entry.character);
      else batch.remove(entry.character);
    }
  }
  function ensureModelStage(units: readonly BattleMarker[]): void {
    if (modelStage || modelStageLoading || !units.some(unit => unit.active && unit.model)) return;
    modelStageLoading = true;
    const load = options.loadModelStage ?? (() => import('./model-stage'));
    void load().then(module => {
      if (disposed) return;
      modelStage = module.createBattleModelStage(scene, {
        ...(options.requestFrame ? { requestFrame: options.requestFrame } : {}),
        changed: syncModelVisibility,
      });
      modelStage.updateUnits(latestUnits);
    }).catch(() => undefined).finally(() => { modelStageLoading = false; });
  }
  const cameraControl = {
    get yawDeg() {
      return rotation.yawDeg;
    },
    get rotating() {
      return rotation.rotating;
    },
    rotate(step: -1 | 1, reducedMotion = options.reducedMotion === true) {
      if (disposed) return Promise.resolve();
      const promise = rotation.rotate(step, reducedMotion);
      if (reducedMotion) {
        snapPickGuardPending = true;
        placeCamera();
        updateCharacterDirections();
      }
      return promise;
    },
  } as const;
  function updateCharacterDirections(): void {
    for (const entry of characters.values()) {
      const direction = hexDirToRig(entry.marker.facing, rotation.yawDeg);
      if (direction !== entry.dir) {
        entry.dir = direction;
        entry.character.setMotion(direction, 0, weightClassForEquipment(entry.marker.equipment));
      }
    }
  }
  return {
    stats,
    camera: cameraControl,
    get contextState() { return contextGuard.state; },
    updateUnits(units) {
      if (disposed) return;
      latestUnits = units; ensureModelStage(units); modelStage?.updateUnits(units);
      quality.invalidateSamples?.(performance.now());
      for (const unit of units) {
        let entry = characters.get(unit.id);
        if (!entry) {
          const character = createRigCharacter(rigSet, unit.equipment, unit.index + 1);
          const dir = hexDirToRig(unit.facing, rotation.yawDeg);
          entry = { character, marker: unit, dir };
          characters.set(unit.id, entry);
          if (unit.active && !modelStage?.hasModel(unit.id)) batch.add(character);
          hexWorld(unit.q, unit.r, unit.height, point);
          character.setPosition(point.x, point.y + 0.02, point.z);
          character.setMotion(dir, 0, weightClassForEquipment(unit.equipment));
        } else {
          const previous = entry.marker;
          const equipmentChanged = !equipmentEquals(previous.equipment, unit.equipment);
          if (equipmentChanged) void entry.character.setEquipment(unit.equipment);
          if (unit.active !== entry.marker.active) {
            if (unit.active && !modelStage?.hasModel(unit.id)) batch.add(entry.character);
            else batch.remove(entry.character);
          }
          if (unit.q !== previous.q || unit.r !== previous.r || unit.height !== previous.height) {
            hexWorld(unit.q, unit.r, unit.height, point);
            entry.character.setPosition(point.x, point.y + 0.02, point.z);
          }
          if (unit.facing !== previous.facing || equipmentChanged) {
            entry.dir = hexDirToRig(unit.facing, rotation.yawDeg);
            entry.character.setMotion(entry.dir, 0, weightClassForEquipment(unit.equipment));
          }
          entry.marker = unit;
        }
      }
      syncModelVisibility();
    },
    setHighlights: (value) => terrain.setHighlights(value),
    render(timeMs, reducedMotion = false) {
      if (!contextGuard.canRender) { samplingPrevious = undefined; previousTime = 0; return; }
      if (snapPickGuardPending) {
        pickBlockedUntil = Math.max(pickBlockedUntil, timeMs + 150);
        snapPickGuardPending = false;
      }
      const wasRotating = rotation.rotating;
      if (rotation.update(timeMs)) {
        placeCamera();
        updateCharacterDirections();
      }
      if (wasRotating && !rotation.rotating)
        pickBlockedUntil = Math.max(pickBlockedUntil, timeMs + 150);
      reducedMotion = reducedMotion || options.reducedMotion === true;
      const dt = previousTime ? Math.min(0.1, Math.max(0, (timeMs - previousTime) / 1000)) : 0;
      previousTime = timeMs;
      const start = performance.now();
      for (const entry of characters.values())
        if (entry.marker.active) entry.character.update(reducedMotion ? 0 : dt);
      modelStage?.update(dt, reducedMotion);
      batch.sync();
      renderer.info.reset();
      renderer.clear();
      renderer.render(scene, camera);
      renderer.clearDepth();
      tintPass.render(renderer);
      stats.cpuMs = performance.now() - start;
      stats.frameMs = samplingPrevious === undefined ? 0 : Math.max(0, timeMs - samplingPrevious);
      samplingPrevious = timeMs;
      if (stats.frameMs > 0) quality.sample?.(stats.frameMs, stats.cpuMs, timeMs);
      const nextPixelRatio = quality.effectivePixelRatio(deviceDpr);
      if (nextPixelRatio !== appliedPixelRatio) {
        appliedPixelRatio = nextPixelRatio; contextGuard.resize(width, height, appliedPixelRatio);
      }
      stats.drawCalls = renderer.info.render.calls;
      stats.characters = batch.stats.characters;
      stats.instances = batch.stats.activeInstances;
      stats.modelCharacters = modelStage?.stats.characters ?? 0;
      stats.modelDrawCalls = modelStage?.stats.drawCalls ?? 0;
      stats.modelFailures = modelStage?.stats.failures ?? 0;
      stats.modelMoving = modelStage?.stats.moving ?? 0;
    },
    resize(nextWidth, nextHeight, pixelRatio = 1) {
      if (disposed) return;
      width = Math.max(1, nextWidth);
      height = Math.max(1, nextHeight);
      deviceDpr = pixelRatio; appliedPixelRatio = quality.effectivePixelRatio(deviceDpr);
      quality.markSizeChanged?.(performance.now());
      const aspect = width / height;
      const halfHeight = Math.max(radius * 0.65, radius / aspect);
      camera.left = -halfHeight * aspect;
      camera.right = halfHeight * aspect;
      camera.top = halfHeight;
      camera.bottom = -halfHeight;
      camera.updateProjectionMatrix();
      contextGuard.resize(width, height, appliedPixelRatio);
    },
    project(q, r, elevation, out) {
      hexWorld(q, r, elevation, point).project(camera);
      out.x = ((point.x + 1) * width) / 2;
      out.y = ((1 - point.y) * height) / 2;
      out.visible =
        point.z >= -1 && point.z <= 1 && Math.abs(point.x) <= 1 && Math.abs(point.y) <= 1;
    },
    projectUnit(id, q, r, elevation, out) {
      if (!modelStage?.position(id, point)) hexWorld(q, r, elevation, point);
      point.project(camera);
      out.x = ((point.x + 1) * width) / 2; out.y = ((1 - point.y) * height) / 2;
      out.visible = point.z >= -1 && point.z <= 1 && Math.abs(point.x) <= 1 && Math.abs(point.y) <= 1;
    },
    snapshot(id) {
      const entry = characters.get(id);
      const snapshot = entry?.character.snapshot();
      if (!entry || !snapshot) return undefined;
      if (!modelStage?.position(id, snapshotAnchor)) {
        hexWorld(entry.marker.q, entry.marker.r, entry.marker.height, snapshotAnchor);
        snapshotAnchor.y += 0.02;
      }
      point.copy(snapshotAnchor).project(camera);
      const anchorX = ((point.x + 1) * width) / 2;
      const anchorY = ((1 - point.y) * height) / 2;
      const [left, top, right, bottom] = snapshot.localBounds;
      cameraRight.setFromMatrixColumn(camera.matrixWorld, 0);
      point.copy(snapshotAnchor).add(cameraRight).project(camera);
      const dx = ((point.x + 1) * width) / 2 - anchorX;
      point.copy(snapshotAnchor);
      point.y += 1.1547;
      point.project(camera);
      const dy = ((1 - point.y) * height) / 2 - anchorY;
      return {
        ...snapshot,
        sizePx: [(right - left) * Math.abs(dx), (bottom - top) * Math.abs(dy)],
        centerOffsetPx: [((left + right) / 2) * dx, ((top + bottom) / 2) * dy],
      };
    },
    setTimeOfDay(hours) {
      evaluateTimeOfDay(hours, timeFrame);
      tintPass.setTime(timeFrame);
    },
    pick(x, y) {
      if (!contextGuard.canRender) return null;
      if (rotation.rotating || snapPickGuardPending || previousTime < pickBlockedUntil) return null;
      mouse.set((x / width) * 2 - 1, 1 - (y / height) * 2);
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObject(terrain.mesh);
      const first = hits[0];
      if (!first || first.instanceId === undefined) return null;
      const ties = hits.filter(
        (hit) => Math.abs(hit.distance - first.distance) < 1e-6 && hit.instanceId !== undefined,
      );
      const candidates = ties.map((hit) => {
        const cell = cells[hit.instanceId!]!;
        hexWorld(cell.q, cell.r, cell.height, point).project(camera);
        return {
          instanceId: hit.instanceId!,
          screenX: ((point.x + 1) * width) / 2,
          screenY: ((1 - point.y) * height) / 2,
        };
      });
      return chooseBattleCell(cells, candidates, { x, y });
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      contextGuard.dispose();
      for (const entry of characters.values()) entry.character.dispose();
      characters.clear();
      modelStage?.dispose(); modelStage = undefined; latestUnits = [];
      batch.coreMesh.dispose();
      batch.dispose();
      rigSet.dispose();
      terrain.dispose();
      tintPass.dispose();
      renderer.forceContextLoss();
      renderer.dispose();
    },
  };
}
