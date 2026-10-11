import {
  AmbientLight, AnimationMixer, CircleGeometry, Color, DirectionalLight, Frustum, Group, InstancedMesh, Matrix4,
  MeshBasicMaterial, type MeshStandardMaterial, OrthographicCamera, Raycaster, Scene, SRGBColorSpace, Vector2, Vector3, WebGLRenderer,
  type AnimationAction,
} from 'three';
import type { Intersection, Mesh, Object3D } from 'three';
import { DEFAULT_PLAYER_HEIGHT_M } from '../actors/heights';
import type { PilotModel } from '../gltf/load';
import { cameraBack, IsoCameraRotation, normalizeYaw } from '../camera/iso-camera';
import { hexDirToRig } from '../camera/facing';
import { createContextGuard } from '../core/context-guard';
import { createTimeOfDayFrame, evaluateTimeOfDay, sunAzimuthDeg } from '../lighting/time-of-day';
import { getDefaultRenderQuality } from '../quality/tiers';
import type { RigInstance } from '../rig/character';
import { collectRegionObjects, createRegionObjectLayer } from './objects';
import { createRegionTerrainChunk, createTerrainPlaceholderArray, prepareRegionTerrain, regionCellKey, regionHexWorld,
  REGION_CHUNK_SIZE, REGION_HEX_DIRECTIONS, REGION_HEX_RADIUS, REGION_UPLOADS_PER_FRAME, setRegionTerrainHighlight,
  type RegionTerrainChunk } from './terrain';
import type { RegionAnchorView, RegionHexPoint, RegionObjectView,
  RegionHexDir, RegionScene, RegionSceneOptions, RegionStaticView } from './types';

const CAMERA_DISTANCE = 250; const PICK_GUARD_MS = 150; const MARKER_CAPACITY = 256;
function clampZoom(value: number): number {
  if (!Number.isFinite(value)) throw new RangeError('REGION_ZOOM');
  return Math.min(112, Math.max(40, value));
}
function displayHeight(prepared: ReturnType<typeof prepareRegionTerrain>, point: RegionHexPoint): number {
  return prepared.cells.get(regionCellKey(point.q, point.r))?.height ?? 0;
}
function markerColor(anchor: RegionAnchorView): number {
  if (!anchor.enabled) return 0x866f66;
  if (anchor.class === 'Door' || anchor.class === 'QinggongGate') return 0xc99b45;
  return anchor.class === 'NpcSpawn' ? 0x5c8390 : anchor.class === 'Chest' ? 0xb98542 : 0x7d8c5c;
}
function initialChunkOrder(view: RegionStaticView, focus: RegionHexPoint): readonly string[] {
  const cq = Math.floor(focus.q / REGION_CHUNK_SIZE); const cr = Math.floor(focus.r / REGION_CHUNK_SIZE);
  return view.chunks.map((chunk) => ({ key: regionCellKey(chunk.q, chunk.r), chunk,
    distance: Math.max(Math.abs(chunk.q - cq), Math.abs(chunk.r - cr)) }))
    .sort((left, right) => left.distance - right.distance || left.chunk.r - right.chunk.r ||
      left.chunk.q - right.chunk.q).map((entry) => entry.key);
}

export async function createRegionScene(canvas: HTMLCanvasElement, definition: RegionStaticView,
  options: RegionSceneOptions): Promise<RegionScene> {
  let disposed = false;
  const playerHeightM = options.playerHeightM ?? DEFAULT_PLAYER_HEIGHT_M.male;
  const rig = await (options.loadRigRuntime ?? (() => import('../rig/runtime')))();
  const renderer = new WebGLRenderer({ canvas, alpha: false, antialias: false,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance' }); renderer.setClearColor(new Color(0xd7ccb0));
  const quality = options.quality ?? getDefaultRenderQuality(); const scene = new Scene();
  const camera = new OrthographicCamera(-8, 8, 4.5, -4.5, 1, 500);
  const prepared = prepareRegionTerrain(definition); const chunks = new Map<string, RegionTerrainChunk>();
  const loadedChunks: RegionTerrainChunk[] = []; const terrainMeshes: Mesh[] = [];
  const allObjects = collectRegionObjects(definition);
  const terrainAlbedo = options.terrainAlbedo ?? createTerrainPlaceholderArray(definition.terrainTable);
  let terrainCellCount = 0; let currentPath: readonly RegionHexPoint[] = [];
  const sourceChunks = new Map(definition.chunks.map((chunk) => [regionCellKey(chunk.q, chunk.r), chunk]));
  const queue = [...initialChunkOrder(definition, options.projection.playerHex)];
  const initialQ = Math.floor(options.projection.playerHex.q / 32);
  const initialR = Math.floor(options.projection.playerHex.r / 32);
  const immediate = queue.filter((key) => { const [q, r] = key.split(',').map(Number);
    return Math.max(Math.abs(q! - initialQ), Math.abs(r! - initialR)) <= 1; });
  const upload = (key: string): void => {
    const source = sourceChunks.get(key); if (!source || chunks.has(key)) return;
    const built = createRegionTerrainChunk(definition, source, prepared, terrainAlbedo);
    chunks.set(key, built); loadedChunks.push(built); terrainMeshes.push(built.mesh);
    scene.add(built.mesh); if (built.waterMesh) scene.add(built.waterMesh);
    terrainCellCount += built.cellCount;
    if (currentPath.length) { const slots: number[] = [];
      for (const point of currentPath) if (Math.floor(point.q / 32) === built.q &&
          Math.floor(point.r / 32) === built.r) slots.push((point.r & 31) * 32 + (point.q & 31));
      setRegionTerrainHighlight(built, slots); }
    const index = queue.indexOf(key); if (index >= 0) queue.splice(index, 1);
  };
  for (const key of immediate) upload(key);
  const staticLayer = createRegionObjectLayer(definition, prepared); scene.add(staticLayer.group);
  const ambient = new AmbientLight(0xfff3d6, 1.7); scene.add(ambient);
  const sun = new DirectionalLight(0xffedc7, 2.2); scene.add(sun);
  const clearColor = new Color(); const timeFrame = createTimeOfDayFrame();
  let rigSet;
  try { rigSet = await rig.loadRigSet(options.rig ?? rig.createPlaceholderRigManifest('region-actors')); }
  catch (error) { staticLayer.dispose();
    for (let index = 0; index < loadedChunks.length; index += 1) loadedChunks[index]!.dispose();
    if (options.terrainAlbedo === undefined) terrainAlbedo.dispose();
    renderer.forceContextLoss(); renderer.dispose(); throw error; }
  const batch = new rig.RigBatch(rigSet, 100); batch.addTo(scene);
  const player = rig.createRigCharacter(rigSet, options.playerEquipment ?? {}, 1); batch.add(player);
  const npcEntries: Array<{ readonly object: RegionObjectView; readonly actor: RigInstance }> = [];
  const npcObjects = allObjects.filter((entry) => entry.class === 'NpcSpawn').slice(0, 99);
  for (let index = 0; index < npcObjects.length; index += 1) { const object = npcObjects[index]!;
    const actor = rig.createRigCharacter(rigSet, options.npcEquipment?.[object.npcId ?? ''] ?? {}, index + 2);
    npcEntries.push({ object, actor }); batch.add(actor);
  }

  // 3D Animated Character Model for player (AR-92 / 图5: 小地图3D建模+贴图+行走动作)
  const player3DContainer = new Group();
  player3DContainer.name = 'region-player-3d-container';
  scene.add(player3DContainer);

  let player3D: PilotModel | undefined;
  let playerMixer: AnimationMixer | undefined;
  let idleAction: AnimationAction | undefined;
  let walkAction: AnimationAction | undefined;
  let currentMotion: 'idle' | 'walk' | 'run' = 'idle';
  let currentFacingYaw = 0;
  const playerWorldPos = new Vector3();
  const playerTargetPos = new Vector3();
  let playerPosInitialized = false;
  let playerSpeed = 0;

  if (typeof document !== 'undefined') {
    const modelUrl = options.playerModelUrl ?? '/assets/default/model3d/npc_zhujue__ch00_m/anim_idle_walk_run.glb';
    try {
      const { loadPilotModel } = await import('../gltf/load');
      const pilot = await loadPilotModel(modelUrl, playerHeightM, { stature: 'headTop' });
      if (!disposed) {
        player3D = pilot;
        pilot.scene.name = 'region-player-3d';
        pilot.setToon(false);
        pilot.scene.traverse((node) => {
          if ((node as Mesh).isMesh) {
            const m = node as Mesh;
            m.renderOrder = 30;
            if (m.material) {
              const mats = Array.isArray(m.material) ? m.material : [m.material];
              mats.forEach((mat) => {
                mat.transparent = true;
                mat.depthTest = true;
                mat.depthWrite = true;
                if ('metalness' in mat) (mat as MeshStandardMaterial).metalness = 0.05;
                if ('roughness' in mat) (mat as MeshStandardMaterial).roughness = 0.6;
              });
            }
          }
        });
        playerMixer = new AnimationMixer(pilot.scene);
        const idleClip = pilot.clips.find((c) => c.name.toLowerCase().includes('idle'));
        const walkClip = pilot.clips.find((c) => c.name.toLowerCase().includes('walk'));
        const runClip = pilot.clips.find((c) => c.name.toLowerCase().includes('run'));
        if (idleClip) {
          idleAction = playerMixer.clipAction(idleClip);
          idleAction.play();
        }
        if (walkClip || runClip) {
          walkAction = playerMixer.clipAction(walkClip || runClip!);
        }
        player3DContainer.add(pilot.scene);
        player.setPosition(0, -9999, 0);
      }
    } catch (err) {
      console.warn('createRegionScene loadPilotModel fallback:', err);
    }
  }

  const markerGeometry = new CircleGeometry(.22, 12); markerGeometry.rotateX(-Math.PI / 2);
  const markerMesh = new InstancedMesh(markerGeometry,
    new MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: .9 }), MARKER_CAPACITY);
  markerMesh.name = 'region-anchor-instances';
  markerMesh.renderOrder = 50; scene.add(markerMesh);
  const markerAnchors: RegionAnchorView[] = []; const markerTransform = new Matrix4();
  const markerTint = new Color(); const anchorHits: Intersection<Object3D>[] = [];
  const terrainHits: Intersection<Object3D>[] = [];
  const markerPoint = new Vector3(); const raycaster = new Raycaster(); const pointer = new Vector2();
  const target = new Vector3(); const cameraBackVector = new Vector3(); const projected = new Vector3();
  const viewProjection = new Matrix4(); const frustum = new Frustum();
  const rotation = new IsoCameraRotation();
  const playerPoint = { ...options.projection.playerHex };
  let playerFacing: RegionHexDir = options.projection.facing;
  let yawOffset = 0; let zoom = clampZoom(80 * (options.zoom ?? 1));
  let allowRotation = true; let width = 1; let height = 1; let deviceDpr = 1;
  let appliedPixelRatio = quality.effectivePixelRatio(1); let previousTime = 0;
  let samplingPrevious: number | undefined; let pickBlockedUntil = 0;
  let snapPickGuardPending = false; let updateGeneration = 0;
  const stats = { drawCalls: 0, triangles: 0, frameMs: 0, cpuMs: 0,
    terrainChunks: chunks.size, visibleChunks: chunks.size, queuedChunks: queue.length,
    terrainCells: terrainCellCount,
    staticInstances: staticLayer.instanceCount, rigInstances: 0 };
  const effectiveYaw = (): number => allowRotation ? normalizeYaw(rotation.yawDeg + yawOffset) : 45;
  function placeSun(): void {
    const azimuth = sunAzimuthDeg(effectiveYaw(), timeFrame.dayPhase) * Math.PI / 180;
    const elevation = timeFrame.elevationDeg * Math.PI / 180;
    const horizontal = Math.cos(elevation) * 32;
    sun.position.set(target.x + Math.cos(azimuth) * horizontal, target.y + Math.sin(elevation) * 32,
      target.z + Math.sin(azimuth) * horizontal);
    sun.target.position.copy(target); sun.target.updateMatrixWorld();
  }
  function setTimeOfDay(hours: number): void {
    evaluateTimeOfDay(hours, timeFrame);
    ambient.color.setRGB(timeFrame.skyColor.r, timeFrame.skyColor.g, timeFrame.skyColor.b, SRGBColorSpace);
    ambient.intensity = timeFrame.hemiIntensity * 2.8;
    sun.color.setRGB(timeFrame.lightColor.r, timeFrame.lightColor.g, timeFrame.lightColor.b, SRGBColorSpace);
    sun.intensity = timeFrame.lightIntensity * 2.2;
    placeSun();
    clearColor.setRGB(timeFrame.fogColor.r, timeFrame.fogColor.g, timeFrame.fogColor.b, SRGBColorSpace);
    renderer.setClearColor(clearColor, 1);
  }
  function placeCamera(): void {
    let hint: RegionObjectView | undefined;
    for (let index = 0; index < allObjects.length; index += 1) { const candidate = allObjects[index]!;
      const bounds = candidate.bounds;
      if (candidate.class === 'CameraHint' && bounds && playerPoint.q >= bounds.q &&
          playerPoint.q < bounds.q + bounds.width && playerPoint.r >= bounds.r &&
          playerPoint.r < bounds.r + bounds.height) { hint = candidate; break; }
    }
    allowRotation = hint?.allowRotation ?? true;
    yawOffset = allowRotation ? normalizeYaw((hint?.yawDeg ?? 45) - 45) : 0;
    if (hint?.zoom !== undefined) zoom = clampZoom(80 * hint.zoom);
    regionHexWorld(playerPoint.q, playerPoint.r, displayHeight(prepared, playerPoint), target);
    cameraBack(effectiveYaw(), cameraBackVector); camera.position.copy(target)
      .addScaledVector(cameraBackVector, CAMERA_DISTANCE); camera.lookAt(target); camera.updateMatrixWorld();
    placeSun();
  }
  function updatePlayer3DTarget(speed = 0): void {
    playerSpeed = speed;
    regionHexWorld(playerPoint.q, playerPoint.r, displayHeight(prepared, playerPoint), playerTargetPos);
    if (!playerPosInitialized) {
      playerWorldPos.copy(playerTargetPos);
      player3DContainer.position.set(playerWorldPos.x, playerWorldPos.y + 0.02, playerWorldPos.z);
      playerPosInitialized = true;
    }
  }
  function placeActor(actor: RigInstance, point: RegionHexPoint, facing: number, speed = 0): void {
    if (actor === player && player3D) {
      player.setPosition(0, -9999, 0);
      return;
    }
    regionHexWorld(point.q, point.r, displayHeight(prepared, point), projected);
    actor.setPosition(projected.x, projected.y + .02, projected.z);
    actor.setMotion(hexDirToRig(facing as 0, effectiveYaw()), speed, rig.weightClassForEquipment(actor.equipment));
  }
  function updateDirections(): void {
    updatePlayer3DTarget(0);
    placeActor(player, playerPoint, playerFacing);
    for (let index = 0; index < npcEntries.length; index += 1) { const entry = npcEntries[index]!;
      placeActor(entry.actor, entry.object, entry.object.facing ?? 0);
    }
  }
  function updateAnchors(next: readonly RegionAnchorView[]): void {
    markerAnchors.splice(0);
    for (const anchor of next) {
      if (markerAnchors.length >= MARKER_CAPACITY) break; markerAnchors.push(anchor);
      regionHexWorld(anchor.hex.q, anchor.hex.r, displayHeight(prepared, anchor.hex), markerPoint);
      markerPoint.y += .055; markerTransform.makeTranslation(markerPoint.x, markerPoint.y, markerPoint.z);
      markerMesh.setMatrixAt(markerAnchors.length - 1, markerTransform);
      markerMesh.setColorAt(markerAnchors.length - 1, markerTint.setHex(markerColor(anchor)));
    }
    markerMesh.count = markerAnchors.length; markerMesh.instanceMatrix.needsUpdate = true;
    if (markerMesh.instanceColor) markerMesh.instanceColor.needsUpdate = true; markerMesh.computeBoundingSphere();
  }
  function applyPath(path: readonly RegionHexPoint[]): void {
    currentPath = path;
    for (const chunk of chunks.values()) { const slots: number[] = [];
      for (const point of path) { const q = Math.floor(point.q / 32); const r = Math.floor(point.r / 32);
        if (q === chunk.q && r === chunk.r) slots.push((point.r & 31) * 32 + (point.q & 31)); }
      setRegionTerrainHighlight(chunk, slots);
    }
  }
  function pointerRay(clientX: number, clientY: number, bounds: DOMRect): boolean {
    if (bounds.width <= 0 || bounds.height <= 0 || rotation.rotating || previousTime < pickBlockedUntil) return false;
    pointer.set((clientX - bounds.left) * 2 / bounds.width - 1,
      1 - (clientY - bounds.top) * 2 / bounds.height); raycaster.setFromCamera(pointer, camera); return true;
  }
  placeCamera(); updateDirections(); updateAnchors(options.projection.interactableAnchors);
  const contextGuard = createContextGuard(canvas, renderer, {
    onStateChange(state) { previousTime = 0; samplingPrevious = undefined;
      quality.invalidateSamples?.(performance.now()); options.onContextStateChange?.(state); },
    onLoss(count) { quality.reportContextLoss?.(); options.onContextLoss?.(count); },
    onRecreate: options.onContextRecreate, onFatal: options.onContextFatal,
    onRestore() { for (let index = 0; index < loadedChunks.length; index += 1) loadedChunks[index]!.restore();
      staticLayer.restore();
      rigSet.texture.needsUpdate = true; setTimeOfDay(timeFrame.hours); },
    requestFrame() { previousTime = 0; samplingPrevious = undefined;
      quality.invalidateSamples?.(performance.now()); options.requestFrame?.(); },
  });
  const cameraControl = {
    get yawDeg() { return effectiveYaw(); }, get rotating() { return rotation.rotating; },
    get allowRotation() { return allowRotation; },
    rotate(step: -1 | 1, reducedMotion = options.reducedMotion === true) {
      if (disposed || !allowRotation) return Promise.resolve();
      const promise = rotation.rotate(step, reducedMotion);
      if (reducedMotion) { snapPickGuardPending = true; placeCamera(); updateDirections(); }
      return promise;
    },
  } as const;
  setTimeOfDay(12);
  const api: RegionScene = { stats, camera: cameraControl,
    get contextState() { return contextGuard.state; },
    render(timeMs, reducedMotion = options.reducedMotion === true) {
      if (!contextGuard.canRender) { previousTime = 0; samplingPrevious = undefined; return; }
      if (snapPickGuardPending) { pickBlockedUntil = Math.max(pickBlockedUntil, timeMs + PICK_GUARD_MS);
        snapPickGuardPending = false; }
      const wasRotating = rotation.rotating;
      if (rotation.update(timeMs)) { placeCamera(); updateDirections(); }
      if (wasRotating && !rotation.rotating) pickBlockedUntil = Math.max(pickBlockedUntil, timeMs + PICK_GUARD_MS);
      for (let count = 0; count < REGION_UPLOADS_PER_FRAME && queue.length; count += 1) upload(queue[0]!);
      const dt = previousTime ? Math.min(.1, Math.max(0, (timeMs - previousTime) / 1_000)) : 0;
      previousTime = timeMs; const started = performance.now();
      staticLayer.updateFocus(playerPoint, dt, reducedMotion); player.update(reducedMotion ? 0 : dt);
      for (let index = 0; index < npcEntries.length; index += 1)
        npcEntries[index]!.actor.update(reducedMotion ? 0 : dt);
      if (player3D && playerPosInitialized) {
        const lerpFactor = reducedMotion ? 1 : Math.min(1, dt * 14);
        playerWorldPos.lerp(playerTargetPos, lerpFactor);
        player3DContainer.position.set(playerWorldPos.x, playerWorldPos.y + 0.02, playerWorldPos.z);

        const distToTarget = playerWorldPos.distanceTo(playerTargetPos);
        const isMoving = distToTarget > 0.04 || playerSpeed > 0.1;

        const hexDir = REGION_HEX_DIRECTIONS[playerFacing] ?? [1, 0];
        const dirWorldX = Math.sqrt(3) * REGION_HEX_RADIUS * (hexDir[0] + hexDir[1] / 2);
        const dirWorldZ = hexDir[1];
        const desiredYaw = Math.atan2(dirWorldX, dirWorldZ);

        let diff = desiredYaw - currentFacingYaw;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        currentFacingYaw += diff * Math.min(1, dt * 12);
        player3DContainer.rotation.y = currentFacingYaw;

        if (isMoving) {
          if (currentMotion !== 'walk') {
            idleAction?.fadeOut(0.12);
            walkAction?.reset().fadeIn(0.12).play();
            currentMotion = 'walk';
          }
        } else {
          if (currentMotion !== 'idle') {
            walkAction?.fadeOut(0.12);
            idleAction?.reset().fadeIn(0.12).play();
            currentMotion = 'idle';
          }
        }
        playerMixer?.update(dt);
        player.setPosition(0, -9999, 0);
      }
      batch.sync();
      viewProjection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      frustum.setFromProjectionMatrix(viewProjection); let visible = 0;
      for (let index = 0; index < loadedChunks.length; index += 1) { const chunk = loadedChunks[index]!;
        chunk.mesh.visible = frustum.intersectsObject(chunk.mesh);
        if (chunk.waterMesh) chunk.waterMesh.visible = chunk.mesh.visible; if (chunk.mesh.visible) visible += 1; }
      renderer.info.reset(); renderer.render(scene, camera); stats.cpuMs = performance.now() - started;
      stats.frameMs = samplingPrevious === undefined ? 0 : Math.max(0, timeMs - samplingPrevious);
      samplingPrevious = timeMs; if (stats.frameMs > 0) quality.sample?.(stats.frameMs, stats.cpuMs, timeMs);
      const nextRatio = quality.effectivePixelRatio(deviceDpr);
      if (nextRatio !== appliedPixelRatio) { appliedPixelRatio = nextRatio;
        contextGuard.resize(width, height, appliedPixelRatio); }
      stats.drawCalls = renderer.info.render.calls; stats.triangles = renderer.info.render.triangles;
      stats.terrainChunks = chunks.size; stats.visibleChunks = visible; stats.queuedChunks = queue.length;
      stats.terrainCells = terrainCellCount;
      stats.rigInstances = batch.stats.activeInstances;
    },
    resize(nextWidth, nextHeight, nextDpr = 1) {
      if (disposed) return; width = Math.max(1, nextWidth); height = Math.max(1, nextHeight);
      deviceDpr = nextDpr; appliedPixelRatio = quality.effectivePixelRatio(deviceDpr);
      const metresPerCssPixel = Math.SQRT2 / zoom; const halfHeight = height * metresPerCssPixel / 2;
      camera.left = -width * metresPerCssPixel / 2; camera.right = width * metresPerCssPixel / 2;
      camera.top = halfHeight; camera.bottom = -halfHeight; camera.updateProjectionMatrix();
      quality.markSizeChanged?.(performance.now()); contextGuard.resize(width, height, appliedPixelRatio);
    },
    async update(next, equipment = options.playerEquipment ?? {}) {
      if (disposed) return; const token = ++updateGeneration; await player.setEquipment(equipment);
      if (disposed || token !== updateGeneration) return;
      playerPoint.q = next.playerHex.q; playerPoint.r = next.playerHex.r;
      playerFacing = next.facing; placeCamera(); updatePlayer3DTarget(0); updateDirections(); updateAnchors(next.interactableAnchors);
    },
    setPlayerPose(point, facing, speedMps = 0) {
      if (disposed) return; playerPoint.q = point.q; playerPoint.r = point.r; playerFacing = facing;
      placeCamera(); updatePlayer3DTarget(speedMps); placeActor(player, playerPoint, playerFacing, speedMps);
    },
    setTimeOfDay, setPath: applyPath,
    setZoom(value) { zoom = clampZoom(80 * value); api.resize(width, height, deviceDpr); },
    pickHex(clientX, clientY, bounds) {
      if (!contextGuard.canRender || !pointerRay(clientX, clientY, bounds)) return null;
      terrainHits.length = 0; raycaster.intersectObjects(terrainMeshes, false, terrainHits);
      for (const hit of terrainHits) {
        if (hit.faceIndex === undefined || hit.faceIndex === null) continue;
        let chunk: RegionTerrainChunk | undefined;
        for (let index = 0; index < loadedChunks.length; index += 1)
          if (loadedChunks[index]!.mesh === hit.object) { chunk = loadedChunks[index]; break; }
        const cell = chunk?.cellByTriangle[hit.faceIndex]; if (cell) return cell;
      }
      return null;
    },
    pickAnchor(clientX, clientY, bounds) {
      if (!contextGuard.canRender || !pointerRay(clientX, clientY, bounds)) return null;
      anchorHits.length = 0; const hit = raycaster.intersectObject(markerMesh, false, anchorHits)[0];
      return hit?.instanceId === undefined ? null : markerAnchors[hit.instanceId] ?? null;
    },
    project(hex, heightValue, out) {
      regionHexWorld(hex.q, hex.r, heightValue, projected).project(camera);
      out.x = (projected.x + 1) * width / 2; out.y = (1 - projected.y) * height / 2;
      out.visible = projected.z >= -1 && projected.z <= 1 && Math.abs(projected.x) <= 1 &&
        Math.abs(projected.y) <= 1;
    },
    dispose() {
      if (disposed) return; disposed = true; updateGeneration += 1; contextGuard.dispose(); player.dispose();
      for (let index = 0; index < npcEntries.length; index += 1) npcEntries[index]!.actor.dispose();
      playerMixer?.stopAllAction();
      if (player3D) {
        player3D.scene.traverse((node) => {
          if ((node as Mesh).isMesh) {
            (node as Mesh).geometry?.dispose();
          }
        });
      }
      scene.remove(player3DContainer);
      batch.dispose(); rigSet.dispose();
      markerMesh.dispose(); markerMesh.geometry.dispose();
      (markerMesh.material as MeshBasicMaterial).dispose(); staticLayer.dispose();
      for (let index = 0; index < loadedChunks.length; index += 1) loadedChunks[index]!.dispose();
      loadedChunks.length = 0; terrainMeshes.length = 0; chunks.clear();
      if (options.terrainAlbedo === undefined) terrainAlbedo.dispose();
      renderer.forceContextLoss(); renderer.dispose();
    },
  };
  api.resize(1, 1, 1); return api;
}
