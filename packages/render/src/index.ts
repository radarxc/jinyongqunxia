import {
  AmbientLight,
  BoxGeometry,
  Color,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  OrthographicCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import { createFrameStatsTracker, type FrameStats } from './frame-stats';
import { createContextGuard, type ContextState } from './core/context-guard';
import { getDefaultRenderQuality } from './quality/tiers';
import type { PilotModel } from './gltf/load';
import type { PilotDemoController, PilotDemoOptions } from './gltf/pilot-scene';

export type RenderStats = FrameStats;
export * from './frame-stats';
export * from './camera';
export * from './lighting';
export * from './core/context-guard';
export * from './quality';
export type { ClipPlayOptions, PartPose, PartPoseBuffer, RigBoneLengthKey, RigClipEventType } from './rig/types';
export type { RigClip, RigClipEvent } from './rig/clip';
export type {
  PilotDemoController, PilotDemoOptions, PilotDemoStats, PilotModel, PilotModelStats, PilotRetargeter, PilotSkeletonKind,
} from './gltf';

/** Development pilot stays behind a second dynamic boundary inside the route-only render import. */
export async function loadPilotModel(url: string): Promise<PilotModel> {
  const modulePath = './gltf/load.ts';
  return (await import(/* @vite-ignore */ modulePath)).loadPilotModel(url);
}
export async function createPilotDemoScene(
  canvas: HTMLCanvasElement, options: PilotDemoOptions,
): Promise<PilotDemoController> {
  const modulePath = './gltf/pilot-scene.ts';
  return (await import(/* @vite-ignore */ modulePath)).createPilotDemoScene(canvas, options);
}
export interface RenderWorld {
  render(timeMs: number): void;
  resize(width: number, height: number, pixelRatio?: number): void;
  readonly stats: RenderStats;
  readonly contextState: ContextState;
  dispose(): void;
}

export async function createRenderer(canvas: HTMLCanvasElement): Promise<RenderWorld> {
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance',
  });
  const scene = new Scene();
  scene.background = new Color(0xebe2ca);
  const camera = new OrthographicCamera(-2, 2, 1.5, -1.5, 0.1, 100);
  camera.position.set(4, 4, 4);
  camera.lookAt(0, 0, 0);
  const geometry = new BoxGeometry(1.35, 1.35, 1.35);
  const material = new MeshStandardMaterial({ color: 0x8b3a32, roughness: 0.72 });
  const marker = new Mesh(geometry, material);
  scene.add(marker, new AmbientLight(0xffffff, 1.5));
  const keyLight = new DirectionalLight(0xfff4d6, 2.4);
  keyLight.position.set(3, 5, 2);
  scene.add(keyLight);
  const quality = getDefaultRenderQuality();
  const frameStats = createFrameStatsTracker(quality);
  let disposed = false;
  let width = 1; let height = 1; let deviceDpr = 1; let appliedPixelRatio = quality.effectivePixelRatio(1);
  const contextGuard = createContextGuard(canvas, renderer, {
    onStateChange: () => frameStats.reset(),
    onLoss: () => quality.reportContextLoss?.(),
    onRestore: () => { material.needsUpdate = true; },
    requestFrame: () => { frameStats.reset(); world.render(performance.now()); },
  });
  const world: RenderWorld = {
    render(timeMs) {
      if (!contextGuard.canRender) return;
      const started = performance.now();
      marker.rotation.y = ((timeMs % 12_000) / 12_000) * Math.PI * 2;
      marker.rotation.x = 0.24;
      renderer.render(scene, camera);
      frameStats.sample(timeMs, renderer.info.render.calls, performance.now() - started);
      const nextPixelRatio = quality.effectivePixelRatio(deviceDpr);
      if (nextPixelRatio !== appliedPixelRatio) {
        appliedPixelRatio = nextPixelRatio; contextGuard.resize(width, height, appliedPixelRatio);
      }
    },
    resize(nextWidth, nextHeight, pixelRatio = 1) {
      width = Math.max(1, nextWidth); height = Math.max(1, nextHeight); deviceDpr = pixelRatio;
      const halfWidth = (1.5 * width) / height;
      camera.left = -halfWidth;
      camera.right = halfWidth;
      camera.updateProjectionMatrix();
      quality.markSizeChanged?.(performance.now());
      appliedPixelRatio = quality.effectivePixelRatio(deviceDpr);
      contextGuard.resize(width, height, appliedPixelRatio);
    },
    get stats() {
      return frameStats.value;
    },
    get contextState() { return contextGuard.state; },
    dispose() {
      if (disposed) return;
      disposed = true;
      contextGuard.dispose();
      geometry.dispose();
      material.dispose();
      renderer.forceContextLoss();
      renderer.dispose();
    },
  };
  return world;
}
