import {
  AmbientLight,
  Color,
  DirectionalLight,
  OrthographicCamera,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  LinearFilter,
  SRGBColorSpace,
  TextureLoader,
  WebGLRenderer,
  type Object3D,
  type Texture,
} from 'three';
import { createTimeOfDayFrame, evaluateTimeOfDay, sunAzimuthDeg } from '../lighting/time-of-day';
import { createContextGuard } from '../core/context-guard';
import { getDefaultRenderQuality } from '../quality/tiers';
import { createDestinationMarker, createProtagonistMarker, createWorldMapGeometry, mapPointToWorld } from './geometry';
import type { MapActorView, WorldMapScene, WorldMapSceneOptions, WorldMapStats } from './types';
import type { MapGeometryView } from './types';

const CAMERA_HEIGHT = 14;

function disposeObject(object: Object3D): void {
  const owned = object as Object3D & {
    geometry?: { dispose(): void };
    material?: { dispose(): void };
  };
  owned.geometry?.dispose();
  owned.material?.dispose();
}

export async function createWorldMapScene(
  canvas: HTMLCanvasElement,
  map: MapGeometryView,
  options: WorldMapSceneOptions,
): Promise<WorldMapScene> {
  const rig = await (options.loadRigRuntime ?? (() => import('../rig/runtime')))();
  const renderer = new WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(new Color(0xddd0ad), 1);
  const quality = options.quality ?? getDefaultRenderQuality();
  const scene = new Scene();
  const camera = new OrthographicCamera(-10, 10, 6, -6, -200, 1200);
  let mapTexture: Texture | undefined;
  if (options.mapTextureUrl)
    try {
      mapTexture = await new TextureLoader().loadAsync(options.mapTextureUrl);
      mapTexture.colorSpace = SRGBColorSpace;
      mapTexture.minFilter = LinearFilter;
    } catch {
      mapTexture = undefined;
    }
  const geometry = createWorldMapGeometry(map, mapTexture);
  scene.add(geometry.group);
  const ambient = new AmbientLight(0xfff1cf, 1.7);
  scene.add(ambient);
  const light = new DirectionalLight(0xfff4db, 2.2);
  scene.add(light, light.target);
  const timeFrame = createTimeOfDayFrame();
  const clearColor = new Color();
  let cameraYawDeg = 0;
  const CAM_DISTANCE = 11;
  let sunOffsetX = 0;
  let sunOffsetY = 0;
  let sunOffsetZ = 0;
  const marker = createDestinationMarker();
  scene.add(marker);
  const protagonist = createProtagonistMarker();
  scene.add(protagonist);
  let rigSet;
  try { rigSet = await rig.loadRigSet(rig.createPlaceholderRigManifest('worldmap-player')); }
  catch (error) {
    geometry.dispose(); mapTexture?.dispose(); disposeObject(marker); disposeObject(protagonist);
    renderer.forceContextLoss(); renderer.dispose(); throw error;
  }
  const batch = new rig.RigBatch(rigSet, 1);
  batch.addTo(scene);
  const actor = rig.createRigCharacter(rigSet, options.actor.equipment, 0.22);
  batch.add(actor);
  const stats: WorldMapStats = {
    drawCalls: 0,
    triangles: 0,
    frameMs: 0,
    cpuMs: 0,
    nodes: geometry.nodeInstances,
    roads: geometry.roadSegments,
    instances: actor.activeInstanceCount,
  };
  const raycaster = new Raycaster();
  const pointer = new Vector2();
  let zoom = options.zoom ?? 1.9;
  let current = options.actor;
  let previous = 0;
  let samplingPrevious: number | undefined;
  let disposed = false;
  let viewportWidth = 1; let viewportHeight = 1;
  let deviceDpr = 1; let appliedPixelRatio = quality.effectivePixelRatio(deviceDpr);
  const contextGuard = createContextGuard(canvas, renderer, {
    onStateChange: (state) => {
      previous = 0; samplingPrevious = undefined; quality.invalidateSamples?.(performance.now());
      options.onContextStateChange?.(state);
    },
    onLoss: (count) => { quality.reportContextLoss?.(); options.onContextLoss?.(count); },
    onRecreate: options.onContextRecreate,
    onFatal: options.onContextFatal,
    onRestore: () => {
      if (mapTexture) mapTexture.needsUpdate = true;
      rigSet.texture.needsUpdate = true;
      geometry.group.traverse((object) => {
        const material = (object as Object3D & { material?: { needsUpdate: boolean; map?: Texture } }).material;
        if (material) { material.needsUpdate = true; if (material.map) material.map.needsUpdate = true; }
      });
      setTimeOfDay(timeFrame.hours);
    },
    requestFrame: () => {
      previous = 0; samplingPrevious = undefined; quality.invalidateSamples?.(performance.now());
      options.requestFrame?.();
    },
  });
  function setTimeOfDay(hours: number): void {
    evaluateTimeOfDay(hours, timeFrame);
    ambient.color.setRGB(
      timeFrame.skyColor.r,
      timeFrame.skyColor.g,
      timeFrame.skyColor.b,
      SRGBColorSpace,
    );
    ambient.intensity = timeFrame.hemiIntensity * 2.8;
    light.color.setRGB(
      timeFrame.lightColor.r,
      timeFrame.lightColor.g,
      timeFrame.lightColor.b,
      SRGBColorSpace,
    );
    light.intensity = timeFrame.lightIntensity * 2.2;
    const azimuth = (sunAzimuthDeg(cameraYawDeg, timeFrame.dayPhase) * Math.PI) / 180;
    const elevation = (timeFrame.elevationDeg * Math.PI) / 180;
    const horizontal = Math.cos(elevation) * 20;
    sunOffsetX = Math.cos(azimuth) * horizontal;
    sunOffsetY = Math.sin(elevation) * 20;
    sunOffsetZ = Math.sin(azimuth) * horizontal;
    placeSun();
    clearColor.setRGB(
      timeFrame.fogColor.r,
      timeFrame.fogColor.g,
      timeFrame.fogColor.b,
      SRGBColorSpace,
    );
    renderer.setClearColor(clearColor, 1);
  }

  let camTargetX = 0;
  let camTargetY = 0;
  let camTargetZ = 0;
  let followActor = true;
  const PITCH_ANGLE = Math.atan2(CAMERA_HEIGHT, CAM_DISTANCE);
  const SIN_PITCH = Math.sin(PITCH_ANGLE);
  const BOUND_MIN_X = -120;
  const BOUND_MAX_X = 90;
  const BOUND_MIN_Z = -65;
  const BOUND_MAX_Z = 55;

  function placeSun(): void {
    const [x, y, z] = mapPointToWorld(map, current.point);
    light.target.position.set(x, y, z);
    light.position.set(x + sunOffsetX, y + sunOffsetY, z + sunOffsetZ);
  }

  function updateCameraTransform(): void {
    camera.position.set(camTargetX, camTargetY + CAMERA_HEIGHT, camTargetZ + CAM_DISTANCE);
    camera.lookAt(camTargetX, camTargetY, camTargetZ);
  }

  function place(view: MapActorView): void {
    const [x, y, z] = mapPointToWorld(map, view.point);
    actor.setPosition(x, y + 0.02, z);
    actor.setMotion(view.direction ?? 1, view.walking ? 1.4 : 0, 'medium');
    protagonist.position.set(x, y, z);
    if (followActor) {
      camTargetX = x;
      camTargetY = y;
      camTargetZ = z;
    }
    updateCameraTransform();
    placeSun();
  }
  function resize(width: number, height: number, pixelRatio = 1): void {
    if (disposed) return;
    viewportWidth = Math.max(1, width); viewportHeight = Math.max(1, height);
    const aspect = viewportWidth / viewportHeight;
    camera.left = (-6 * aspect) / zoom;
    camera.right = (6 * aspect) / zoom;
    camera.top = 6 / zoom;
    camera.bottom = -6 / zoom;
    camera.updateProjectionMatrix();
    quality.markSizeChanged?.(performance.now());
    deviceDpr = pixelRatio; appliedPixelRatio = quality.effectivePixelRatio(deviceDpr);
    contextGuard.resize(viewportWidth, viewportHeight, appliedPixelRatio);
  }
  place(current);
  setTimeOfDay(12);

  return {
    stats,
    get contextState() { return contextGuard.state; },
    render(timeMs) {
      if (!contextGuard.canRender) { previous = 0; samplingPrevious = undefined; return; }
      const started = performance.now();
      const dt = previous === 0 ? 0 : Math.min(0.1, Math.max(0, (timeMs - previous) / 1_000));
      previous = timeMs;
      actor.update(dt);
      const heroFigure = protagonist.getObjectByName('protagonist-hero-figure');
      if (heroFigure) {
        heroFigure.quaternion.copy(camera.quaternion);
      }
      const beacon = protagonist.getObjectByName('protagonist-beacon');
      if (beacon) {
        beacon.position.y = 1.65 + Math.sin(timeMs * 0.005) * 0.10;
        beacon.rotation.y = timeMs * 0.003;
      }
      const groundRing = protagonist.getObjectByName('protagonist-ground-ring');
      if (groundRing) {
        const pulse = 1 + Math.sin(timeMs * 0.004) * 0.12;
        groundRing.scale.set(pulse, pulse, 1);
      }
      // Clouds removed: outer geography rendered with real GIS terrain and classical water ripples
      batch.sync();
      renderer.render(scene, camera);
      stats.cpuMs = performance.now() - started;
      stats.frameMs = samplingPrevious === undefined ? 0 : Math.max(0, timeMs - samplingPrevious);
      samplingPrevious = timeMs;
      if (stats.frameMs > 0) quality.sample?.(stats.frameMs, stats.cpuMs, timeMs);
      const nextPixelRatio = quality.effectivePixelRatio(deviceDpr);
      if (nextPixelRatio !== appliedPixelRatio) {
        appliedPixelRatio = nextPixelRatio; contextGuard.resize(viewportWidth, viewportHeight, appliedPixelRatio);
      }
      stats.drawCalls = renderer.info.render.calls;
      stats.triangles = renderer.info.render.triangles;
      stats.instances = actor.activeInstanceCount;
    },
    resize,
    setTimeOfDay,
    async setActor(view) {
      if (disposed) return;
      current = view;
      await actor.setEquipment(view.equipment);
      if (view.walking) {
        followActor = true;
      }
      place(view);
    },
    setDestination(nodeId) {
      const node = geometry.visibleNodes.find((value) => value.id === nodeId);
      marker.visible = node !== undefined;
      if (node) {
        const [x, y, z] = mapPointToWorld(map, node.point);
        marker.position.set(x, y + 0.05, z);
      }
    },
    setZoom(next) {
      if (!Number.isFinite(next)) throw new RangeError('WORLDMAP_ZOOM');
      zoom = Math.min(3.5, Math.max(0.35, next));
      const width = canvas.clientWidth || canvas.width;
      const height = canvas.clientHeight || canvas.height;
      resize(width, height, deviceDpr);
    },
    setYaw(_deg) {
      cameraYawDeg = 0;
      updateCameraTransform();
      placeSun();
    },
    rotate(_deltaDeg) {
      cameraYawDeg = 0;
      updateCameraTransform();
      placeSun();
    },
    getYaw() {
      return 0;
    },
    focusActor() {
      followActor = true;
      const [x, y, z] = mapPointToWorld(map, current.point);
      camTargetX = x;
      camTargetY = y;
      camTargetZ = z;
      updateCameraTransform();
    },
    panBy(deltaScreenX, deltaScreenY, screenWidth, screenHeight) {
      const sw = screenWidth || canvas.clientWidth || canvas.width || 800;
      const sh = screenHeight || canvas.clientHeight || canvas.height || 600;
      if (sw <= 0 || sh <= 0) return;
      followActor = false;
      const aspect = viewportWidth / viewportHeight;
      const halfH = 6 / zoom;
      const halfW = (6 * aspect) / zoom;
      const worldPerPixelX = (halfW * 2) / sw;
      const worldPerPixelY = (halfH * 2) / sh;

      const deltaWorldX = -deltaScreenX * worldPerPixelX;
      const deltaWorldZ = -(deltaScreenY * worldPerPixelY) / SIN_PITCH;

      camTargetX = Math.max(BOUND_MIN_X, Math.min(BOUND_MAX_X, camTargetX + deltaWorldX));
      camTargetZ = Math.max(BOUND_MIN_Z, Math.min(BOUND_MAX_Z, camTargetZ + deltaWorldZ));
      updateCameraTransform();
    },
    getPanTarget() {
      return [camTargetX, camTargetZ] as const;
    },
    pickNode(clientX, clientY, bounds) {
      if (!contextGuard.canRender || bounds.width <= 0 || bounds.height <= 0) return null;
      pointer.set(
        ((clientX - bounds.left) * 2) / bounds.width - 1,
        1 - ((clientY - bounds.top) * 2) / bounds.height,
      );
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObject(geometry.nodes, false)[0];
      let foundNode = hit?.instanceId === undefined ? null : (geometry.visibleNodes[hit.instanceId] ?? null);
      if (!foundNode) {
        const tempVec = new Vector3();
        let closestDist = 36;
        for (const node of geometry.visibleNodes) {
          const [nx, ny, nz] = mapPointToWorld(map, node.point);
          tempVec.set(nx, ny + 0.15, nz).project(camera);
          const screenX = ((tempVec.x + 1) * bounds.width) / 2 + bounds.left;
          const screenY = ((-tempVec.y + 1) * bounds.height) / 2 + bounds.top;
          const dist = Math.hypot(clientX - screenX, clientY - screenY);
          if (dist < closestDist) {
            closestDist = dist;
            foundNode = node;
          }
        }
      }
      return foundNode;
    },
    projectNodes(bounds) {
      if (contextGuard.state !== 'ok' || bounds.width <= 0 || bounds.height <= 0) return [];
      const tempVec = new Vector3();
      const majorCities = new Set([
        'city_dali', 'city_zhangye', 'city_luoyang', 'city_hangzhou',
        'city_beijing', 'city_chengdu', 'city_chongqing', 'city_changsha',
        'city_kaifeng', 'city_suzhou', 'city_jinan', 'city_xian',
        'city_nanjing', 'city_wuhan', 'city_guangzhou', 'city_kunming',
        'city_lijiang', 'city_lhasa', 'city_guilin', 'city_lanzhou',
      ]);
      const raw = geometry.visibleNodes.map((node) => {
        const [nx, ny, nz] = mapPointToWorld(map, node.point);
        tempVec.set(nx, ny + 0.22, nz).project(camera);
        const x = ((tempVec.x + 1) * bounds.width) / 2;
        const y = ((-tempVec.y + 1) * bounds.height) / 2;
        const inFrustum = tempVec.z < 1 && x >= -40 && x <= bounds.width + 40 && y >= -40 && y <= bounds.height + 40;
        let cleanName = node.name.replace(/（待考）|\(待考\)/g, '').trim();
        cleanName = cleanName.replace(/地区所指治所$/, '').replace(/所指治所$/, '');
        const isMajor = majorCities.has(node.id);
        const priority = isMajor ? 10 : (node.kind === 'town' ? 5 : 1);
        return { id: node.id, name: cleanName, kind: node.kind, x, y, visible: inFrustum, priority };
      });

      // Sort by priority descending so major historical cities reserve space first
      const sorted = [...raw].sort((a, b) => b.priority - a.priority);
      const occupied: Array<{ x: number; y: number; width: number; height: number }> = [];
      const visibilityMap = new Map<string, boolean>();

      for (const node of sorted) {
        if (!node.visible) {
          visibilityMap.set(node.id, false);
          continue;
        }
        const textWidth = Math.max(44, node.name.length * 13 + 6);
        const textHeight = 22;
        const collides = occupied.some((other) => {
          const minSpacingX = (textWidth + other.width) / 2 + 5;
          const minSpacingY = (textHeight + other.height) / 2 + 4;
          return Math.abs(node.x - other.x) < minSpacingX && Math.abs(node.y - other.y) < minSpacingY;
        });
        if (collides) {
          visibilityMap.set(node.id, false);
        } else {
          visibilityMap.set(node.id, true);
          occupied.push({ x: node.x, y: node.y, width: textWidth, height: textHeight });
        }
      }

      return raw.map((node) => ({
        id: node.id,
        name: node.name,
        kind: node.kind,
        x: node.x,
        y: node.y,
        visible: visibilityMap.get(node.id) ?? false,
      }));
    },
    get scene() { return scene; },
    get camera() { return camera; },
    dispose() {
      if (disposed) return;
      disposed = true;
      contextGuard.dispose();
      actor.dispose();
      batch.coreMesh.dispose();
      batch.dispose();
      rigSet.dispose();
      geometry.dispose();
      mapTexture?.dispose();
      disposeObject(marker);
      disposeObject(protagonist);
      renderer.forceContextLoss();
      renderer.dispose();
    },
  };
}
