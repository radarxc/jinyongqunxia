import {
  AmbientLight,
  CircleGeometry,
  Color,
  DirectionalLight,
  Frustum,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  OrthographicCamera,
  Raycaster,
  Scene,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import type { Intersection, Mesh, Object3D } from 'three';
import { DEFAULT_PLAYER_HEIGHT_M } from '../actors/heights';
import { cameraBack, IsoCameraRotation, normalizeYaw } from '../camera/iso-camera';
import { createContextGuard } from '../core/context-guard';
import { createTimeOfDayFrame, evaluateTimeOfDay, sunAzimuthDeg } from '../lighting/time-of-day';
import { getDefaultRenderQuality } from '../quality/tiers';
import { collectRegionObjects, createRegionObjectLayer } from './objects';
import {
  advanceCameraSpring,
  applyCameraDeadZone,
  applyLookAhead,
  cameraBasis,
  clampCameraTarget,
  groundViewQuad,
  regionHexGround,
  regionWorldBounds,
  sampleWalk,
  type CameraSpringState,
  type GroundPoint,
  type WalkSample,
} from './explore-motion';
import { createRegionPathLayer } from './path-layer';
import { createPlaceholderBuildingPort, PLACEHOLDER_BUILD_KIT } from './ports/placeholder-buildings';
import type { ActorEquipment, ActorLook, ActorPort, BuildingLayer } from './ports/types';
import type { BuildingPlanView } from '../buildgen/types';
import {
  createRegionTerrainChunk,
  createTerrainPlaceholderArray,
  prepareRegionTerrain,
  regionCellKey,
  regionHexWorld,
  REGION_CHUNK_SIZE,
  REGION_HEX_DIRECTIONS,
  REGION_HEX_RADIUS,
  REGION_UPLOADS_PER_FRAME,
  type RegionTerrainChunk,
} from './terrain';
import type {
  ExploreWalkView,
  RegionAnchorView,
  RegionHexPoint,
  RegionObjectView,
  RegionHexDir,
  RegionScene,
  RegionSceneOptions,
  RegionStaticView,
} from './types';

const CAMERA_DISTANCE = 250;
const PICK_GUARD_MS = 150;
const MARKER_CAPACITY = 256;
const ZOOM_ANIMATION_MS = 200;
function clampZoom(value: number): number {
  if (!Number.isFinite(value)) throw new RangeError('REGION_ZOOM');
  return Math.min(112, Math.max(40, value));
}
function displayHeight(
  prepared: ReturnType<typeof prepareRegionTerrain>,
  point: RegionHexPoint,
): number {
  return prepared.cells.get(regionCellKey(point.q, point.r))?.height ?? 0;
}
function markerColor(anchor: RegionAnchorView): number {
  if (!anchor.enabled) return 0x866f66;
  if (anchor.class === 'Door' || anchor.class === 'QinggongGate') return 0xc99b45;
  return anchor.class === 'NpcSpawn' ? 0x5c8390 : anchor.class === 'Chest' ? 0xb98542 : 0x7d8c5c;
}
function initialChunkOrder(view: RegionStaticView, focus: RegionHexPoint): readonly string[] {
  const cq = Math.floor(focus.q / REGION_CHUNK_SIZE);
  const cr = Math.floor(focus.r / REGION_CHUNK_SIZE);
  return view.chunks
    .map((chunk) => ({
      key: regionCellKey(chunk.q, chunk.r),
      chunk,
      distance: Math.max(Math.abs(chunk.q - cq), Math.abs(chunk.r - cr)),
    }))
    .sort(
      (left, right) =>
        left.distance - right.distance ||
        left.chunk.r - right.chunk.r ||
        left.chunk.q - right.chunk.q,
    )
    .map((entry) => entry.key);
}
function placeholderPlan(object: RegionObjectView): BuildingPlanView {
  const footprint = object.footprint; const q = object.q; const r = object.r;
  const width = footprint?.width ?? 1; const depth = footprint?.height ?? 1;
  const cx = Math.sqrt(3) * REGION_HEX_RADIUS * (q + r / 2);
  const cz = r; const widthM = Math.max(1.2, width * Math.sqrt(3) * REGION_HEX_RADIUS);
  const depthM = Math.max(1.2, depth); const baseMm = object.h * 1_000;
  return { id: object.id, archetype: 'placeholder', kit: PLACEHOLDER_BUILD_KIT.id, seed: 0,
    footprint: [Math.round(cx*1_000),Math.round(cz*1_000),Math.round(widthM*1_000),Math.round(depthM*1_000)],
    yaw: 0, storeys: 1, roof: [0,2_800,3_400], entrances: [[0,0,1_200]], enterable: true,
    elev: [baseMm,0], floors: [[Math.round((cx-widthM/2)*1_000),Math.round((cz-depthM/2)*1_000),
      Math.round((cx+widthM/2)*1_000),Math.round((cz+depthM/2)*1_000)]], floorY: [0], fixtures: [],
    signage: null, facility: 'none' };
}
function actorEquipment(value: unknown): ActorEquipment {
  const equipment = value as Partial<ActorEquipment> | undefined;
  return { specs: equipment?.specs ?? [], ...(equipment?.bodyLayers ? { bodyLayers: equipment.bodyLayers } : {}) };
}

export async function createRegionScene(
  canvas: HTMLCanvasElement,
  definition: RegionStaticView,
  options: RegionSceneOptions,
): Promise<RegionScene> {
  let disposed = false;
  const playerHeightM = options.playerHeightM ?? DEFAULT_PLAYER_HEIGHT_M.male;
  const renderer = new WebGLRenderer({
    canvas,
    alpha: false,
    antialias: false,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(new Color(0xd7ccb0));
  const quality = options.quality ?? getDefaultRenderQuality();
  const scene = new Scene();
  const camera = new OrthographicCamera(-8, 8, 4.5, -4.5, 1, 500);
  const prepared = prepareRegionTerrain(definition);
  const chunks = new Map<string, RegionTerrainChunk>();
  const heightWidth = definition.bounds.qMax - definition.bounds.qMin + 1;
  const heightGrid = new Float32Array(
    heightWidth * (definition.bounds.rMax - definition.bounds.rMin + 1),
  );
  for (const cell of prepared.cells.values())
    heightGrid[(cell.r - definition.bounds.rMin) * heightWidth + cell.q - definition.bounds.qMin] =
      cell.height;
  const heightAt = (point: RegionHexPoint): number => {
    const q = point.q - definition.bounds.qMin;
    const r = point.r - definition.bounds.rMin;
    return q < 0 || q >= heightWidth || r < 0 || r > definition.bounds.rMax - definition.bounds.rMin
      ? 0
      : heightGrid[r * heightWidth + q]!;
  };
  const loadedChunks: RegionTerrainChunk[] = [];
  const terrainMeshes: Mesh[] = [];
  const allObjects = collectRegionObjects(definition);
  const buildingObjects = allObjects.filter((entry) => entry.class === 'Building');
  const terrainAlbedo =
    options.terrainAlbedo ?? createTerrainPlaceholderArray(definition.terrainTable);
  let terrainCellCount = 0;
  const sourceChunks = new Map(
    definition.chunks.map((chunk) => [regionCellKey(chunk.q, chunk.r), chunk]),
  );
  const queue = [...initialChunkOrder(definition, options.projection.playerHex)];
  const initialQ = Math.floor(options.projection.playerHex.q / 32);
  const initialR = Math.floor(options.projection.playerHex.r / 32);
  const immediate = queue.filter((key) => {
    const [q, r] = key.split(',').map(Number);
    return Math.max(Math.abs(q! - initialQ), Math.abs(r! - initialR)) <= 1;
  });
  const upload = (key: string): void => {
    const source = sourceChunks.get(key);
    if (!source || chunks.has(key)) return;
    const built = createRegionTerrainChunk(definition, source, prepared, terrainAlbedo);
    chunks.set(key, built);
    loadedChunks.push(built);
    terrainMeshes.push(built.mesh);
    scene.add(built.mesh);
    if (built.waterMesh) scene.add(built.waterMesh);
    terrainCellCount += built.cellCount;
    const index = queue.indexOf(key);
    if (index >= 0) queue.splice(index, 1);
  };
  for (const key of immediate) upload(key);
  const staticDefinition = {
    ...definition,
    objects: allObjects.filter((entry) => entry.class !== 'Building'),
    chunks: definition.chunks.map((chunk) => ({
      ...chunk,
      objects: chunk.objects.filter((entry) => entry.class !== 'Building'),
    })),
  };
  const staticLayer = createRegionObjectLayer(staticDefinition, prepared);
  scene.add(staticLayer.group);
  const ambient = new AmbientLight(0xfff3d6, 1.7);
  scene.add(ambient);
  const sun = new DirectionalLight(0xffedc7, 2.2);
  scene.add(sun);
  const clearColor = new Color();
  const timeFrame = createTimeOfDayFrame();
  let createdActorPort: ActorPort | undefined;
  let createdBuildingLayer: BuildingLayer | undefined;
  try {
    createdActorPort =
      options.actorPort ??
      (await import('./ports/placeholder-actors')).createPlaceholderActorPort({ scene,
        ...(options.requestFrame ? { requestFrame: options.requestFrame } : {}),
        ...(options.playerModelUrl ? { playerModelUrl: options.playerModelUrl } : {}) });
    const fallbackPlans = buildingObjects.map(placeholderPlan);
    const buildingInput = options.buildingInput
      ? { ...options.buildingInput, quality, renderer }
      : {
          plans: fallbackPlans,
          walls: [],
          kit: PLACEHOLDER_BUILD_KIT,
          quality,
          renderer,
        };
    createdBuildingLayer = await (options.buildingPort ?? createPlaceholderBuildingPort()).create(
      buildingInput,
    );
    scene.add(createdBuildingLayer.object);
    createdBuildingLayer.setCameraYaw(45);
  } catch (error) {
    createdActorPort?.dispose();
    createdBuildingLayer?.dispose();
    staticLayer.dispose();
    for (let index = 0; index < loadedChunks.length; index += 1) loadedChunks[index]!.dispose();
    if (options.terrainAlbedo === undefined) terrainAlbedo.dispose();
    renderer.forceContextLoss();
    renderer.dispose();
    throw error;
  }
  if (!createdActorPort || !createdBuildingLayer) throw new Error('REGION_PORT_INITIALIZATION');
  const actorPort: ActorPort = createdActorPort;
  const buildingLayer: BuildingLayer = createdBuildingLayer;
  const npcObjects = allObjects
    .filter((entry) => entry.class === 'NpcSpawn' || entry.class === 'FacilityNpc')
    .slice(0, 99);
  const defaultLook = (role: ActorLook['role'], template: string, heightM: number): ActorLook => ({
    role,
    template,
    heightM,
    outfit: 'default',
    seed: 0,
  });
  actorPort.spawn(
    'player',
    options.playerLook ?? defaultLook('player',
      playerHeightM <= DEFAULT_PLAYER_HEIGHT_M.female ? 'tpl_f_medium' : 'tpl_m_medium', playerHeightM),
  );
  actorPort.setEquipment('player', actorEquipment(options.playerEquipment));
  for (let index = 0; index < npcObjects.length; index += 1) {
    const object = npcObjects[index]!;
    const id = object.npcId ?? object.id;
    actorPort.spawn(id, options.npcLooks?.[id] ?? defaultLook('npc', 'tpl_m_lean', 1.76));
    actorPort.setEquipment(id, actorEquipment(options.npcEquipment?.[id]));
  }
  const playerWorldPos = new Vector3();
  const playerTargetPos = new Vector3();
  let playerPosInitialized = false;
  let playerSpeed = 0;
  let activeWalk: ExploreWalkView | null = null;
  let activeWalkTickAtMs = 0;
  const walkSample: WalkSample = {
    x: 0,
    z: 0,
    yawRad: 0,
    moving: false,
    segment: 0,
    portion: 0,
  };
  const cameraSpring: CameraSpringState = { x: 0, z: 0, vx: 0, vz: 0 };
  const desiredCamera: GroundPoint = { x: 0, z: 0 };
  const cameraFrame = { yawDeg: 45, halfWidth: 0, halfHeight: 0 };
  const walkHeights = new Float32Array(64);
  const mapWorldBounds = new Float32Array(4);
  regionWorldBounds(definition.bounds, mapWorldBounds);

  const markerGeometry = new CircleGeometry(0.22, 12);
  markerGeometry.rotateX(-Math.PI / 2);
  const markerMesh = new InstancedMesh(
    markerGeometry,
    new MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9 }),
    MARKER_CAPACITY,
  );
  markerMesh.name = 'region-anchor-instances';
  markerMesh.renderOrder = 50;
  scene.add(markerMesh);
  const pathLayer = createRegionPathLayer(heightAt);
  scene.add(pathLayer.group);
  const markerAnchors: RegionAnchorView[] = [];
  const markerTransform = new Matrix4();
  const markerTint = new Color();
  const anchorHits: Intersection<Object3D>[] = [];
  const terrainHits: Intersection<Object3D>[] = [];
  const markerPoint = new Vector3();
  const raycaster = new Raycaster();
  const pointer = new Vector2();
  const target = new Vector3();
  const cameraBackVector = new Vector3();
  const projected = new Vector3();
  const viewProjection = new Matrix4();
  const frustum = new Frustum();
  const rotation = new IsoCameraRotation();
  const playerPoint = { ...options.projection.playerHex };
  let playerFacing: RegionHexDir = options.projection.facing;
  let yawOffset = 0;
  let zoom = clampZoom(80 * (options.zoom ?? 1));
  let targetZoom = zoom;
  let zoomFrom = zoom;
  let zoomStartMs = -1;
  let zoomAnimating = false;
  let lastReducedMotion = options.reducedMotion === true;
  let insideBuildingIndex: number | null = null;
  let currentHintId: string | null | undefined;
  let allowRotation = true;
  let width = 1;
  let height = 1;
  let deviceDpr = 1;
  let appliedPixelRatio = quality.effectivePixelRatio(1);
  let previousTime = 0;
  let samplingPrevious: number | undefined;
  let pickBlockedUntil = 0;
  let snapPickGuardPending = false;
  let updateGeneration = 0;
  let frameDirection: RegionHexDir = playerFacing;
  const stats = {
    drawCalls: 0,
    triangles: 0,
    frameMs: 0,
    cpuMs: 0,
    terrainChunks: chunks.size,
    visibleChunks: chunks.size,
    queuedChunks: queue.length,
    terrainCells: terrainCellCount,
    staticInstances: staticLayer.instanceCount,
    rigInstances: 0,
  };
  const effectiveYaw = (): number =>
    allowRotation ? normalizeYaw(rotation.yawDeg + yawOffset) : 45;
  function resizeProjection(): void {
    const metresPerCssPixel = Math.SQRT2 / zoom;
    const halfHeight = (height * metresPerCssPixel) / 2;
    camera.left = (-width * metresPerCssPixel) / 2;
    camera.right = (width * metresPerCssPixel) / 2;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();
  }
  function placeSun(): void {
    const azimuth = (sunAzimuthDeg(effectiveYaw(), timeFrame.dayPhase) * Math.PI) / 180;
    const elevation = (timeFrame.elevationDeg * Math.PI) / 180;
    const horizontal = Math.cos(elevation) * 32;
    sun.position.set(
      target.x + Math.cos(azimuth) * horizontal,
      target.y + Math.sin(elevation) * 32,
      target.z + Math.sin(azimuth) * horizontal,
    );
    sun.target.position.copy(target);
    sun.target.updateMatrixWorld();
  }
  function setTimeOfDay(hours: number): void {
    evaluateTimeOfDay(hours, timeFrame);
    ambient.color.setRGB(
      timeFrame.skyColor.r,
      timeFrame.skyColor.g,
      timeFrame.skyColor.b,
      SRGBColorSpace,
    );
    ambient.intensity = timeFrame.hemiIntensity * 2.8;
    sun.color.setRGB(
      timeFrame.lightColor.r,
      timeFrame.lightColor.g,
      timeFrame.lightColor.b,
      SRGBColorSpace,
    );
    sun.intensity = timeFrame.lightIntensity * 2.2;
    placeSun();
    clearColor.setRGB(
      timeFrame.fogColor.r,
      timeFrame.fogColor.g,
      timeFrame.fogColor.b,
      SRGBColorSpace,
    );
    renderer.setClearColor(clearColor, 1);
  }
  function applyCameraPose(): void {
    target.x = cameraSpring.x;
    target.z = cameraSpring.z;
    cameraBack(effectiveYaw(), cameraBackVector);
    camera.position.copy(target).addScaledVector(cameraBackVector, CAMERA_DISTANCE);
    camera.lookAt(target);
    camera.updateMatrixWorld();
    placeSun();
    buildingLayer.setCameraYaw(effectiveYaw());
  }
  function applyCameraHint(): void {
    let hint: RegionObjectView | undefined;
    for (let index = 0; index < allObjects.length; index += 1) {
      const candidate = allObjects[index]!;
      const bounds = candidate.bounds;
      if (
        candidate.class === 'CameraHint' &&
        bounds &&
        playerPoint.q >= bounds.q &&
        playerPoint.q < bounds.q + bounds.width &&
        playerPoint.r >= bounds.r &&
        playerPoint.r < bounds.r + bounds.height
      ) {
        hint = candidate;
        break;
      }
    }
    allowRotation = hint?.allowRotation ?? true;
    yawOffset = allowRotation ? normalizeYaw((hint?.yawDeg ?? 45) - 45) : 0;
    const nextHintId = hint?.id ?? null;
    if (hint?.zoom !== undefined && nextHintId !== currentHintId) {
      zoom = clampZoom(80 * hint.zoom);
      targetZoom = zoom;
      zoomAnimating = false;
      resizeProjection();
    }
    currentHintId = nextHintId;
  }
  function snapCameraToPlayer(): void {
    regionHexGround(playerPoint, desiredCamera);
    clampCameraTarget(mapWorldBounds, desiredCamera);
    cameraSpring.x = desiredCamera.x;
    cameraSpring.z = desiredCamera.z;
    cameraSpring.vx = 0;
    cameraSpring.vz = 0;
    target.y = displayHeight(prepared, playerPoint);
    applyCameraPose();
  }
  function updatePlayer3DTarget(speed = 0): void {
    playerSpeed = speed;
    regionHexWorld(
      playerPoint.q,
      playerPoint.r,
      displayHeight(prepared, playerPoint),
      playerTargetPos,
    );
    if (!playerPosInitialized) {
      playerWorldPos.copy(playerTargetPos);
      playerPosInitialized = true;
    }
  }
  function snapPlayerToPoint(speed = 0): void {
    playerSpeed = speed;
    regionHexWorld(
      playerPoint.q,
      playerPoint.r,
      displayHeight(prepared, playerPoint),
      playerWorldPos,
    );
    playerTargetPos.copy(playerWorldPos);
    playerPosInitialized = true;
  }
  function facingYaw(facing: number): number {
    const direction = REGION_HEX_DIRECTIONS[facing] ?? REGION_HEX_DIRECTIONS[0]!;
    const x = Math.sqrt(3) * REGION_HEX_RADIUS * (direction[0] + direction[1] / 2);
    return Math.atan2(x, direction[1]);
  }
  function placeActor(id: string, point: RegionHexPoint, facing: number, speed = 0): void {
    regionHexWorld(point.q, point.r, displayHeight(prepared, point), projected);
    actorPort.setPose(
      id,
      projected.x,
      projected.y + 0.02,
      projected.z,
      facingYaw(facing),
      speed < 0.05 ? 0 : speed >= 2.2 ? 2 : 1,
      speed,
    );
  }
  function updateDirections(): void {
    updatePlayer3DTarget(0);
    placeActor('player', playerPoint, playerFacing);
    for (let index = 0; index < npcObjects.length; index += 1) {
      const entry = npcObjects[index]!;
      placeActor(entry.npcId ?? entry.id, entry, entry.facing ?? 0);
    }
  }
  function updateAnchors(next: readonly RegionAnchorView[]): void {
    markerAnchors.splice(0);
    for (const anchor of next) {
      if (markerAnchors.length >= MARKER_CAPACITY) break;
      markerAnchors.push(anchor);
      regionHexWorld(anchor.hex.q, anchor.hex.r, displayHeight(prepared, anchor.hex), markerPoint);
      markerPoint.y += 0.055;
      markerTransform.makeTranslation(markerPoint.x, markerPoint.y, markerPoint.z);
      markerMesh.setMatrixAt(markerAnchors.length - 1, markerTransform);
      markerMesh.setColorAt(markerAnchors.length - 1, markerTint.setHex(markerColor(anchor)));
    }
    markerMesh.count = markerAnchors.length;
    markerMesh.instanceMatrix.needsUpdate = true;
    if (markerMesh.instanceColor) markerMesh.instanceColor.needsUpdate = true;
    markerMesh.computeBoundingSphere();
  }
  function applyPath(path: readonly RegionHexPoint[]): void {
    pathLayer.setPreviewPath(path);
  }
  function pointerRay(clientX: number, clientY: number, bounds: DOMRect): boolean {
    if (
      bounds.width <= 0 ||
      bounds.height <= 0 ||
      rotation.rotating ||
      previousTime < pickBlockedUntil
    )
      return false;
    pointer.set(
      ((clientX - bounds.left) * 2) / bounds.width - 1,
      1 - ((clientY - bounds.top) * 2) / bounds.height,
    );
    raycaster.setFromCamera(pointer, camera);
    return true;
  }
  applyCameraHint();
  snapCameraToPlayer();
  updateDirections();
  updateAnchors(options.projection.interactableAnchors);
  const contextGuard = createContextGuard(canvas, renderer, {
    onStateChange(state) {
      previousTime = 0;
      samplingPrevious = undefined;
      quality.invalidateSamples?.(performance.now());
      options.onContextStateChange?.(state);
    },
    onLoss(count) {
      quality.reportContextLoss?.();
      options.onContextLoss?.(count);
    },
    onRecreate: options.onContextRecreate,
    onFatal: options.onContextFatal,
    onRestore() {
      for (let index = 0; index < loadedChunks.length; index += 1) loadedChunks[index]!.restore();
      staticLayer.restore();
      buildingLayer.restore();
      actorPort.restore();
      pathLayer.restore();
      setTimeOfDay(timeFrame.hours);
    },
    requestFrame() {
      previousTime = 0;
      samplingPrevious = undefined;
      quality.invalidateSamples?.(performance.now());
      options.requestFrame?.();
    },
  });
  const cameraControl = {
    get yawDeg() {
      return effectiveYaw();
    },
    get rotating() {
      return rotation.rotating;
    },
    get allowRotation() {
      return allowRotation;
    },
    rotate(step: -1 | 1, reducedMotion = options.reducedMotion === true) {
      if (disposed || !allowRotation) return Promise.resolve();
      const promise = rotation.rotate(step, reducedMotion);
      if (reducedMotion) {
        snapPickGuardPending = true;
        applyCameraPose();
        updateDirections();
      }
      return promise;
    },
  } as const;
  setTimeOfDay(12);
  const api: RegionScene = {
    stats,
    camera: cameraControl,
    get contextState() {
      return contextGuard.state;
    },
    render(timeMs, reducedMotion = options.reducedMotion === true) {
      if (!contextGuard.canRender) {
        previousTime = 0;
        samplingPrevious = undefined;
        return;
      }
      lastReducedMotion = reducedMotion;
      if (snapPickGuardPending) {
        pickBlockedUntil = Math.max(pickBlockedUntil, timeMs + PICK_GUARD_MS);
        snapPickGuardPending = false;
      }
      const wasRotating = rotation.rotating;
      if (wasRotating) {
        rotation.update(timeMs);
        applyCameraPose();
        updateDirections();
      }
      const isRotating = rotation.rotating;
      if (wasRotating && !isRotating)
        pickBlockedUntil = Math.max(pickBlockedUntil, timeMs + PICK_GUARD_MS);
      for (let count = 0; count < REGION_UPLOADS_PER_FRAME && queue.length; count += 1)
        upload(queue[0]!);
      const elapsed = (timeMs - previousTime) / 1_000;
      const dt = previousTime ? (elapsed < 0 ? 0 : elapsed > 0.1 ? 0.1 : elapsed) : 0;
      previousTime = timeMs;
      const started = performance.now();
      if (zoomAnimating) {
        if (reducedMotion) {
          zoom = targetZoom;
          zoomAnimating = false;
          resizeProjection();
        } else {
          if (zoomStartMs < 0) zoomStartMs = timeMs;
          const progress = Math.min(1, Math.max(0, (timeMs - zoomStartMs) / ZOOM_ANIMATION_MS));
          const eased = progress * progress * (3 - 2 * progress);
          zoom = zoomFrom + (targetZoom - zoomFrom) * eased;
          resizeProjection();
          if (progress === 1) zoomAnimating = false;
        }
      }
      if (activeWalk?.path.length) {
        sampleWalk(activeWalk, timeMs, activeWalkTickAtMs, walkSample);
        const current =
          activeWalk.path[walkSample.portion >= 1 ? walkSample.segment + 1 : walkSample.segment]!;
        playerPoint.q = current.q;
        playerPoint.r = current.r;
        playerWorldPos.set(walkSample.x, playerWorldPos.y, walkSample.z);
        const fromHeight = walkHeights[walkSample.segment]!;
        const nextSegment = walkSample.segment + 1;
        const toHeight =
          walkHeights[
            nextSegment < activeWalk.path.length ? nextSegment : activeWalk.path.length - 1
          ]!;
        playerWorldPos.y = fromHeight + (toHeight - fromHeight) * walkSample.portion;
        playerTargetPos.copy(playerWorldPos);
        playerPosInitialized = true;
        playerSpeed = (activeWalk.mmPerTick * 10) / 1_000;
      }
      if (activeWalk && playerPosInitialized) {
        frameDirection = playerFacing;
        const from = activeWalk.path[walkSample.segment]!;
        const nextSegment = walkSample.segment + 1;
        const to =
          activeWalk.path[
            nextSegment < activeWalk.path.length ? nextSegment : activeWalk.path.length - 1
          ]!;
        for (let index = 0; index < REGION_HEX_DIRECTIONS.length; index += 1) {
          const delta = REGION_HEX_DIRECTIONS[index]!;
          if (from.q + delta[0] === to.q && from.r + delta[1] === to.r)
            frameDirection = index as RegionHexDir;
        }
        playerFacing = frameDirection;
        actorPort.setPose(
          'player',
          playerWorldPos.x,
          playerWorldPos.y + 0.02,
          playerWorldPos.z,
          walkSample.yawRad,
          playerSpeed >= 2.2 ? 2 : 1,
          playerSpeed,
        );
      }
      desiredCamera.x = playerWorldPos.x;
      desiredCamera.z = playerWorldPos.z;
      applyLookAhead(desiredCamera, walkSample.yawRad, activeWalk !== null && walkSample.moving);
      cameraFrame.yawDeg = effectiveYaw();
      cameraFrame.halfWidth = Math.abs(camera.right);
      cameraFrame.halfHeight = Math.abs(camera.top);
      applyCameraDeadZone(cameraSpring, desiredCamera, cameraFrame, desiredCamera);
      clampCameraTarget(mapWorldBounds, desiredCamera);
      if (reducedMotion) {
        cameraSpring.x = desiredCamera.x;
        cameraSpring.z = desiredCamera.z;
        cameraSpring.vx = 0;
        cameraSpring.vz = 0;
      } else advanceCameraSpring(cameraSpring, desiredCamera.x, desiredCamera.z, dt);
      target.y = playerWorldPos.y;
      applyCameraPose();
      if (staticLayer.instanceCount > 0) staticLayer.updateFocus(playerPoint, dt, reducedMotion);
      buildingLayer.setFocusOcclusion(playerWorldPos, 2.2);
      buildingLayer.update(dt, reducedMotion);
      actorPort.update(reducedMotion ? 0 : dt, camera);
      viewProjection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      frustum.setFromProjectionMatrix(viewProjection);
      let visible = 0;
      for (let index = 0; index < loadedChunks.length; index += 1) {
        const chunk = loadedChunks[index]!;
        chunk.mesh.visible = frustum.intersectsObject(chunk.mesh);
        if (chunk.waterMesh) chunk.waterMesh.visible = chunk.mesh.visible;
        if (chunk.mesh.visible) visible += 1;
      }
      renderer.info.reset();
      renderer.render(scene, camera);
      stats.cpuMs = performance.now() - started;
      stats.frameMs =
        samplingPrevious === undefined || timeMs < samplingPrevious ? 0 : timeMs - samplingPrevious;
      samplingPrevious = timeMs;
      if (stats.frameMs > 0) quality.sample?.(stats.frameMs, stats.cpuMs, timeMs);
      const nextRatio = quality.effectivePixelRatio(deviceDpr);
      if (nextRatio !== appliedPixelRatio) {
        appliedPixelRatio = nextRatio;
        contextGuard.resize(width, height, appliedPixelRatio);
      }
      stats.drawCalls = renderer.info.render.calls;
      stats.triangles = renderer.info.render.triangles;
      stats.terrainChunks = chunks.size;
      stats.visibleChunks = visible;
      stats.queuedChunks = queue.length;
      stats.terrainCells = terrainCellCount;
      stats.rigInstances = actorPort.stats.actors;
    },
    resize(nextWidth, nextHeight, nextDpr = 1) {
      if (disposed) return;
      width = Math.max(1, nextWidth);
      height = Math.max(1, nextHeight);
      deviceDpr = nextDpr;
      appliedPixelRatio = quality.effectivePixelRatio(deviceDpr);
      resizeProjection();
      quality.markSizeChanged?.(performance.now());
      contextGuard.resize(width, height, appliedPixelRatio);
    },
    async update(next, equipment = options.playerEquipment ?? {}) {
      if (disposed) return;
      const token = ++updateGeneration;
      await Promise.resolve(equipment);
      if (disposed || token !== updateGeneration) return;
      actorPort.setEquipment('player', actorEquipment(equipment));
      playerPoint.q = next.playerHex.q;
      playerPoint.r = next.playerHex.r;
      playerFacing = next.facing;
      applyCameraHint();
      updatePlayer3DTarget(0);
      if (!activeWalk) {
        snapPlayerToPoint();
        snapCameraToPlayer();
      }
      updateDirections();
      updateAnchors(next.interactableAnchors);
    },
    setPlayerPose(point, facing, speedMps = 0) {
      if (disposed) return;
      playerPoint.q = point.q;
      playerPoint.r = point.r;
      playerFacing = facing;
      activeWalk = null;
      applyCameraHint();
      snapPlayerToPoint(speedMps);
      placeActor('player', playerPoint, playerFacing, speedMps);
    },
    setTimeOfDay,
    setPath: applyPath,
    setPreviewPath: applyPath,
    setDestination(hex) {
      pathLayer.setDestination(hex);
    },
    setInsideBuilding(index) {
      if (insideBuildingIndex === index) return;
      if (insideBuildingIndex !== null) buildingLayer.setCutaway(insideBuildingIndex, 0);
      insideBuildingIndex = index;
      if (index !== null) buildingLayer.setCutaway(index, 2);
    },
    setWalk(walk, worldTickAtMs) {
      activeWalk = walk;
      activeWalkTickAtMs = worldTickAtMs;
      if (walk?.path.length) {
        playerPoint.q = walk.path[0]!.q;
        playerPoint.r = walk.path[0]!.r;
        const length = Math.min(walkHeights.length, walk.path.length);
        for (let index = 0; index < length; index += 1)
          walkHeights[index] = heightAt(walk.path[index]!);
        pathLayer.setDestination(walk.destination);
        applyCameraHint();
      } else {
        pathLayer.setDestination(null);
        snapPlayerToPoint();
        playerSpeed = 0;
      }
      placeActor('player', playerPoint, playerFacing, playerSpeed);
    },
    setZoom(value) {
      api.setZoomPx(80 * value);
    },
    setZoomPx(px, animate = false) {
      targetZoom = clampZoom(px);
      if (!animate || lastReducedMotion) {
        zoom = targetZoom;
        zoomAnimating = false;
        resizeProjection();
        return;
      }
      zoomFrom = zoom;
      zoomStartMs = previousTime > 0 ? previousTime : -1;
      zoomAnimating = zoomFrom !== targetZoom;
    },
    getCameraBasis(out) {
      if (out.length < 4) throw new RangeError('REGION_CAMERA_BASIS_OUT');
      cameraBasis(effectiveYaw(), out);
    },
    getViewGroundQuad(out) {
      if (out.length < 8) throw new RangeError('REGION_CAMERA_QUAD_OUT');
      groundViewQuad(
        cameraSpring,
        effectiveYaw(),
        Math.abs(camera.right),
        Math.abs(camera.top),
        out,
      );
    },
    pickHex(clientX, clientY, bounds) {
      if (!contextGuard.canRender || !pointerRay(clientX, clientY, bounds)) return null;
      terrainHits.length = 0;
      raycaster.intersectObjects(terrainMeshes, false, terrainHits);
      for (const hit of terrainHits) {
        if (hit.faceIndex === undefined || hit.faceIndex === null) continue;
        let chunk: RegionTerrainChunk | undefined;
        for (let index = 0; index < loadedChunks.length; index += 1)
          if (loadedChunks[index]!.mesh === hit.object) {
            chunk = loadedChunks[index];
            break;
          }
        const cell = chunk?.cellByTriangle[hit.faceIndex];
        if (cell) return cell;
      }
      return null;
    },
    pickAnchor(clientX, clientY, bounds) {
      if (!contextGuard.canRender || !pointerRay(clientX, clientY, bounds)) return null;
      anchorHits.length = 0;
      const hit = raycaster.intersectObject(markerMesh, false, anchorHits)[0];
      return hit?.instanceId === undefined ? null : (markerAnchors[hit.instanceId] ?? null);
    },
    pickActor(clientX, clientY, bounds) {
      if (!contextGuard.canRender || !pointerRay(clientX, clientY, bounds)) return null;
      return actorPort.pick(raycaster);
    },
    pickBuilding(clientX, clientY, bounds) {
      if (!contextGuard.canRender || !pointerRay(clientX, clientY, bounds)) return null;
      const index = buildingLayer.pick(raycaster);
      return index < 0
        ? null
        : (options.buildingInput?.plans[index]?.id ?? buildingObjects[index]?.id ?? null);
    },
    project(hex, heightValue, out) {
      regionHexWorld(hex.q, hex.r, heightValue, projected).project(camera);
      out.x = ((projected.x + 1) * width) / 2;
      out.y = ((1 - projected.y) * height) / 2;
      out.visible =
        projected.z >= -1 &&
        projected.z <= 1 &&
        Math.abs(projected.x) <= 1 &&
        Math.abs(projected.y) <= 1;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      updateGeneration += 1;
      contextGuard.dispose();
      actorPort.dispose();
      buildingLayer.dispose();
      pathLayer.dispose();
      markerMesh.dispose();
      markerMesh.geometry.dispose();
      (markerMesh.material as MeshBasicMaterial).dispose();
      staticLayer.dispose();
      for (let index = 0; index < loadedChunks.length; index += 1) loadedChunks[index]!.dispose();
      loadedChunks.length = 0;
      terrainMeshes.length = 0;
      chunks.clear();
      if (options.terrainAlbedo === undefined) terrainAlbedo.dispose();
      renderer.forceContextLoss();
      renderer.dispose();
    },
  };
  api.resize(1, 1, 1);
  return api;
}
