import {
  AmbientLight,
  Color,
  DirectionalLight,
  OrthographicCamera,
  Raycaster,
  Scene,
  Vector2,
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
import { createDestinationMarker, createWorldMapGeometry, mapPointToWorld } from './geometry';
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
  const camera = new OrthographicCamera(-10, 10, 6, -6, 0.1, 80);
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
  const CAMERA_YAW_DEG = 45;
  let sunOffsetX = 0;
  let sunOffsetY = 0;
  let sunOffsetZ = 0;
  const marker = createDestinationMarker();
  scene.add(marker);
  let rigSet;
  try { rigSet = await rig.loadRigSet(rig.createPlaceholderRigManifest('worldmap-player')); }
  catch (error) {
    geometry.dispose(); mapTexture?.dispose(); disposeObject(marker);
    renderer.forceContextLoss(); renderer.dispose(); throw error;
  }
  const batch = new rig.RigBatch(rigSet, 1);
  batch.addTo(scene);
  const actor = rig.createRigCharacter(rigSet, options.actor.equipment, 1);
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
  let zoom = options.zoom ?? 1;
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
    const azimuth = (sunAzimuthDeg(CAMERA_YAW_DEG, timeFrame.dayPhase) * Math.PI) / 180;
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
  function placeSun(): void {
    const [x, y, z] = mapPointToWorld(map, current.point);
    light.target.position.set(x, y, z);
    light.position.set(x + sunOffsetX, y + sunOffsetY, z + sunOffsetZ);
  }

  function place(view: MapActorView): void {
    const [x, y, z] = mapPointToWorld(map, view.point);
    actor.setPosition(x, y + 0.08, z);
    actor.setMotion(view.direction ?? 1, view.walking ? 1.4 : 0, 'medium');
    camera.position.set(x + 8, y + CAMERA_HEIGHT, z + 8);
    camera.lookAt(x, y, z);
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
      place(view);
    },
    setDestination(nodeId) {
      const node = geometry.visibleNodes.find((value) => value.id === nodeId);
      marker.visible = node !== undefined;
      if (node) {
        const [x, y, z] = mapPointToWorld(map, node.point);
        marker.position.set(x, y + 0.52, z);
      }
    },
    setZoom(next) {
      if (!Number.isFinite(next)) throw new RangeError('WORLDMAP_ZOOM');
      zoom = Math.min(2.5, Math.max(0.65, next));
      const width = canvas.clientWidth || canvas.width;
      const height = canvas.clientHeight || canvas.height;
      resize(width, height, deviceDpr);
    },
    pickNode(clientX, clientY, bounds) {
      if (!contextGuard.canRender || bounds.width <= 0 || bounds.height <= 0) return null;
      pointer.set(
        ((clientX - bounds.left) * 2) / bounds.width - 1,
        1 - ((clientY - bounds.top) * 2) / bounds.height,
      );
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObject(geometry.nodes, false)[0];
      return hit?.instanceId === undefined ? null : (geometry.visibleNodes[hit.instanceId] ?? null);
    },
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
      renderer.forceContextLoss();
      renderer.dispose();
    },
  };
}
