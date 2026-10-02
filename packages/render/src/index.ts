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

export type RenderStats = FrameStats;
export * from './frame-stats';
export * from './camera';
export * from './lighting';
export interface RenderWorld {
  render(timeMs: number): void;
  resize(width: number, height: number, pixelRatio?: number): void;
  readonly stats: RenderStats;
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
  const frameStats = createFrameStatsTracker();
  return {
    render(timeMs) {
      marker.rotation.y = ((timeMs % 12_000) / 12_000) * Math.PI * 2;
      marker.rotation.x = 0.24;
      renderer.render(scene, camera);
      frameStats.sample(timeMs, renderer.info.render.calls);
    },
    resize(width, height, pixelRatio = 1) {
      const safeHeight = Math.max(1, height);
      const halfWidth = (1.5 * width) / safeHeight;
      camera.left = -halfWidth;
      camera.right = halfWidth;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(2, Math.max(1, pixelRatio)));
      renderer.setSize(width, safeHeight, false);
    },
    get stats() {
      return frameStats.value;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}
