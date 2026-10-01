import { Color, GridHelper, OrthographicCamera, Scene, WebGLRenderer } from 'three';
import { RigBatch } from './batch';
import { createRigCharacter, type RigInstance } from './character';
import { createPlaceholderRigManifest } from './placeholder';
import { loadRigSet } from './manifest';
import type { Dir8, EquipmentVisuals, MotionMode, WeightClass } from './types';

export interface RigDemoStats {
  frameTimeMs: number; rigCpuMs: number; drawCalls: number; rigDrawCalls: number;
  characters: number; instances: number; uploadedRanges: number; placeholders: number;
}
export type RigDemoEquipmentSlot = 'weapon' | 'armor' | 'cape' | 'feet' | 'head' | 'waist' | 'shoulder';
export interface RigDemoController {
  readonly stats: RigDemoStats; render(timeMs: number): void; resize(width: number, height: number, pixelRatio?: number): void;
  setMotion(mode: MotionMode): void; setDirection(direction: Dir8): void; setWeight(weight: WeightClass): void;
  setSpeed(speedMps: number): void; setStepFps(stepFps: number): void; setEquipment(slot: RigDemoEquipmentSlot, enabled: boolean): Promise<void>;
  setStress(enabled: boolean): void; dispose(): void;
}

const EQUIPMENT: Record<RigDemoEquipmentSlot, keyof EquipmentVisuals> = {
  weapon: 'mainHand', armor: 'body', cape: 'cape', feet: 'feet', head: 'head', waist: 'waist', shoulder: 'shoulder',
};
const IDS: Record<RigDemoEquipmentSlot, string> = {
  weapon: 'eq_demo_sword', armor: 'eq_demo_armor', cape: 'eq_demo_cape', feet: 'eq_demo_boots',
  head: 'eq_demo_headgear', waist: 'eq_demo_belt', shoulder: 'eq_demo_pauldron',
};

export async function createRigDemoScene(canvas: HTMLCanvasElement): Promise<RigDemoController> {
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  renderer.setClearColor(new Color(0xe6dcc2), 1);
  const scene = new Scene();
  const camera = new OrthographicCamera(-5, 5, 3, -3, 0.1, 100);
  camera.position.set(6, 5, 7); camera.lookAt(0, 0.8, 0);
  const grid = new GridHelper(12, 12, 0x796a58, 0xb8aa90); scene.add(grid);
  const rigSet = await loadRigSet(createPlaceholderRigManifest());
  const batch = new RigBatch(rigSet, 20); batch.addTo(scene);
  const characters: RigInstance[] = [];
  for (let index = 0; index < 20; index += 1) {
    const character = createRigCharacter(rigSet, {}, index + 1);
    const column = index % 5; const row = Math.floor(index / 5);
    character.setPosition((column - 2) * 1.45, 0, (row - 1.5) * 1.15);
    characters.push(character);
  }
  batch.add(characters[0]!);

  const stats: RigDemoStats = { frameTimeMs: 0, rigCpuMs: 0, drawCalls: 0, rigDrawCalls: 2, characters: 1, instances: 16, uploadedRanges: 0, placeholders: rigSet.placeholderCount };
  const enabled: Record<RigDemoEquipmentSlot, boolean> = { weapon: false, armor: false, cape: false, feet: false, head: false, waist: false, shoulder: false };
  let direction: Dir8 = 1; let weight: WeightClass = 'medium'; let mode: MotionMode = 'walk';
  let speed = 1.4; let stepFps = 12; let stress = false; let previousTime = 0; let disposed = false;

  function applyMotion(): void {
    const resolvedSpeed = mode === 'idle' ? 0 : mode === 'run' ? Math.max(2, speed) : Math.min(1.99, Math.max(.06, speed));
    const count = stress ? characters.length : 1;
    for (let index = 0; index < count; index += 1) { const character = characters[index]!; character.setMotion(((direction + index) % 8) as Dir8, resolvedSpeed, weight); character.setStepFps(stepFps); }
  }

  async function applyEquipment(): Promise<void> {
    const next: Record<string, string> = {};
    for (const slot of Object.keys(enabled) as RigDemoEquipmentSlot[]) if (enabled[slot]) next[EQUIPMENT[slot]] = IDS[slot];
    await characters[0]!.setEquipment(next);
  }
  applyMotion();

  return {
    stats,
    render(timeMs) {
      if (disposed) return;
      const dt = previousTime === 0 ? 0 : Math.min(.5, Math.max(0, (timeMs - previousTime) / 1_000)); previousTime = timeMs; stats.frameTimeMs = dt * 1_000;
      const started = performance.now(); const count = stress ? characters.length : 1;
      for (let index = 0; index < count; index += 1) characters[index]!.update(dt);
      batch.sync(); stats.rigCpuMs = performance.now() - started; renderer.render(scene, camera);
      const batchStats = batch.stats; stats.drawCalls = renderer.info.render.calls; stats.rigDrawCalls = batchStats.drawCalls; stats.characters = batchStats.characters;
      stats.instances = batchStats.activeInstances; stats.uploadedRanges = batchStats.uploadedRanges;
    },
    resize(width, height, pixelRatio = 1) { const safeHeight = Math.max(1, height); const aspect = width / safeHeight; camera.left = -3 * aspect; camera.right = 3 * aspect; camera.updateProjectionMatrix(); renderer.setPixelRatio(Math.min(2, Math.max(1, pixelRatio))); renderer.setSize(width, safeHeight, false); },
    setMotion(next) { mode = next; applyMotion(); }, setDirection(next) { direction = next; applyMotion(); }, setWeight(next) { weight = next; applyMotion(); },
    setSpeed(next) { speed = Math.max(0, next); applyMotion(); }, setStepFps(next) { stepFps = Math.max(0, next); applyMotion(); },
    async setEquipment(slot, value) { enabled[slot] = value; await applyEquipment(); },
    setStress(next) {
      if (stress === next) return; stress = next;
      for (let index = 1; index < characters.length; index += 1) { if (next) batch.add(characters[index]!); else batch.remove(characters[index]!); }
      applyMotion();
    },
    dispose() {
      if (disposed) return; disposed = true; for (const character of characters) character.dispose();
      batch.dispose(); rigSet.dispose(); grid.geometry.dispose();
      if (Array.isArray(grid.material)) for (const item of grid.material) item.dispose(); else grid.material.dispose();
      renderer.dispose();
    },
  };
}
