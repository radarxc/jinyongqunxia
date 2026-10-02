import { OrthographicCamera, Raycaster, Scene, Vector2, Vector3, WebGLRenderer } from 'three';
import { RigBatch } from '../rig/batch';
import { createRigCharacter, type RigInstance } from '../rig/character';
import { equipmentEquals, weightClassForEquipment } from '../rig/equipment';
import { loadRigSet } from '../rig/manifest';
import { createPlaceholderRigManifest } from '../rig/placeholder';
import type { Dir8 } from '../rig/types';
import { HexLayer, hexWorld } from './hex-layer';
import type { BattleCell, BattleMarker, BattleRenderer, BattleRendererOptions } from './types';

/** Hex world angles [0,300,240,180,120,60] minus camera yaw 45°, rounded to rig octants. */
export function hexDirToRig(direction: BattleMarker['facing']): Dir8 {
  return ([7, 6, 4, 3, 2, 0] as const)[direction];
}
export interface BattlePickCandidate {
  readonly instanceId: number; readonly screenX: number; readonly screenY: number;
}
/** Shared-edge policy: nearest projected cell centre, then stable (r,q). */
export function chooseBattleCell(cells: readonly BattleCell[], candidates: readonly BattlePickCandidate[],
  pointer: Readonly<{ x: number; y: number }>): BattleCell | null {
  const ranked = [...candidates].sort((left, right) => {
    const leftDistance = (left.screenX - pointer.x) ** 2 + (left.screenY - pointer.y) ** 2;
    const rightDistance = (right.screenX - pointer.x) ** 2 + (right.screenY - pointer.y) ** 2;
    const a = cells[left.instanceId]; const b = cells[right.instanceId];
    return leftDistance - rightDistance || (a?.r ?? 0) - (b?.r ?? 0) || (a?.q ?? 0) - (b?.q ?? 0);
  });
  return cells[ranked[0]?.instanceId ?? -1] ?? null;
}
export async function createBattleRenderer(canvas: HTMLCanvasElement, cells: readonly BattleCell[],
  options: BattleRendererOptions = {}): Promise<BattleRenderer> {
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  renderer.setClearColor(0xe7dec8);
  const scene = new Scene();
  const camera = new OrthographicCamera(-6, 6, 4, -4, 0.1, 100);
  const terrain = new HexLayer(cells); scene.add(terrain.mesh);
  let rigSet;
  try { rigSet = await loadRigSet(options.rig ?? createPlaceholderRigManifest()); }
  catch (error) { terrain.dispose(); renderer.dispose(); throw error; }
  const batch = new RigBatch(rigSet, 100); batch.addTo(scene);
  const characters = new Map<string, { character: RigInstance; marker: BattleMarker }>();
  const point = new Vector3(); const mouse = new Vector2(); const raycaster = new Raycaster();
  const center = new Vector3(); const snapshotAnchor = new Vector3(); const cameraRight = new Vector3();
  let radius = 1; let minimumX = Infinity; let maximumX = -Infinity;
  let minimumZ = Infinity; let maximumZ = -Infinity; let maxHeight = 0;
  for (const cell of cells) {
    hexWorld(cell.q, cell.r, cell.height, point);
    minimumX = Math.min(minimumX, point.x); maximumX = Math.max(maximumX, point.x);
    minimumZ = Math.min(minimumZ, point.z); maximumZ = Math.max(maximumZ, point.z);
    maxHeight = Math.max(maxHeight, point.y);
  }
  center.set((minimumX + maximumX) / 2, maxHeight / 2, (minimumZ + maximumZ) / 2);
  radius = Math.hypot(maximumX - minimumX, maximumZ - minimumZ) / 2 + 1.5;
  const distance = Math.max(20, radius * 3); const diagonal = distance * Math.cos(Math.PI / 6) / Math.sqrt(2);
  camera.position.set(center.x + diagonal, center.y + distance / 2, center.z + diagonal);
  camera.far = distance * 3; camera.lookAt(center); camera.updateMatrixWorld();
  let width = 1; let height = 1; let previousTime = 0; let disposed = false;
  const stats = { drawCalls: 0, characters: 0, instances: 0, cpuMs: 0, frameMs: 0, placeholders: rigSet.placeholderCount };
  return { stats,
    updateUnits(units) {
      if (disposed) return;
      for (const unit of units) {
        let entry = characters.get(unit.id);
        if (!entry) {
          const character = createRigCharacter(rigSet, unit.equipment, unit.index + 1);
          entry = { character, marker: unit }; characters.set(unit.id, entry);
          if (unit.active) batch.add(character);
          hexWorld(unit.q, unit.r, unit.height, point);
          character.setPosition(point.x, point.y + 0.02, point.z);
          character.setMotion(hexDirToRig(unit.facing), 0, weightClassForEquipment(unit.equipment));
        } else {
          const previous = entry.marker;
          const equipmentChanged = !equipmentEquals(previous.equipment, unit.equipment);
          if (equipmentChanged) void entry.character.setEquipment(unit.equipment);
          if (unit.active !== entry.marker.active) {
            if (unit.active) batch.add(entry.character); else batch.remove(entry.character);
          }
          if (unit.q !== previous.q || unit.r !== previous.r || unit.height !== previous.height) {
            hexWorld(unit.q, unit.r, unit.height, point);
            entry.character.setPosition(point.x, point.y + 0.02, point.z);
          }
          if (unit.facing !== previous.facing || equipmentChanged) {
            entry.character.setMotion(hexDirToRig(unit.facing), 0, weightClassForEquipment(unit.equipment));
          }
          entry.marker = unit;
        }
      }
    },
    setHighlights: value => terrain.setHighlights(value),
    render(timeMs, reducedMotion = false) {
      if (disposed) return;
      const dt = previousTime ? Math.min(0.1, Math.max(0, (timeMs - previousTime) / 1000)) : 0;
      previousTime = timeMs; const start = performance.now();
      for (const entry of characters.values()) if (entry.marker.active) entry.character.update(reducedMotion ? 0 : dt);
      batch.sync(); renderer.render(scene, camera);
      stats.cpuMs = performance.now() - start; stats.frameMs = dt * 1000;
      stats.drawCalls = renderer.info.render.calls; stats.characters = batch.stats.characters; stats.instances = batch.stats.activeInstances;
    },
    resize(nextWidth, nextHeight, pixelRatio = 1) {
      width = Math.max(1, nextWidth); height = Math.max(1, nextHeight);
      const aspect = width / height; const halfHeight = Math.max(radius * 0.65, radius / aspect);
      camera.left = -halfHeight * aspect; camera.right = halfHeight * aspect;
      camera.top = halfHeight; camera.bottom = -halfHeight; camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(2, Math.max(1, pixelRatio))); renderer.setSize(width, height, false);
    },
    project(q, r, elevation, out) {
      hexWorld(q, r, elevation, point).project(camera);
      out.x = (point.x + 1) * width / 2; out.y = (1 - point.y) * height / 2;
      out.visible = point.z >= -1 && point.z <= 1 && Math.abs(point.x) <= 1 && Math.abs(point.y) <= 1;
    },
    snapshot(id) {
      const entry = characters.get(id); const snapshot = entry?.character.snapshot();
      if (!entry || !snapshot) return undefined;
      hexWorld(entry.marker.q, entry.marker.r, entry.marker.height, snapshotAnchor); snapshotAnchor.y += 0.02;
      point.copy(snapshotAnchor).project(camera);
      const anchorX = (point.x + 1) * width / 2; const anchorY = (1 - point.y) * height / 2;
      const [left, top, right, bottom] = snapshot.localBounds;
      cameraRight.setFromMatrixColumn(camera.matrixWorld, 0);
      point.copy(snapshotAnchor).add(cameraRight).project(camera);
      const dx = (point.x + 1) * width / 2 - anchorX;
      point.copy(snapshotAnchor); point.y += 1.1547; point.project(camera);
      const dy = (1 - point.y) * height / 2 - anchorY;
      return { ...snapshot, sizePx: [(right - left) * Math.abs(dx), (bottom - top) * Math.abs(dy)],
        centerOffsetPx: [(left + right) / 2 * dx, (top + bottom) / 2 * dy] };
    },
    pick(x, y) {
      mouse.set(x / width * 2 - 1, 1 - y / height * 2); raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObject(terrain.mesh);
      const first = hits[0]; if (!first || first.instanceId === undefined) return null;
      const ties = hits.filter(hit => Math.abs(hit.distance - first.distance) < 1e-6 && hit.instanceId !== undefined);
      const candidates = ties.map(hit => {
        const cell = cells[hit.instanceId!]!; hexWorld(cell.q, cell.r, cell.height, point).project(camera);
        return { instanceId: hit.instanceId!, screenX: (point.x + 1) * width / 2,
          screenY: (1 - point.y) * height / 2 };
      });
      return chooseBattleCell(cells, candidates, { x, y });
    },
    dispose() {
      if (disposed) return; disposed = true;
      for (const entry of characters.values()) entry.character.dispose();
      characters.clear(); batch.coreMesh.dispose(); batch.dispose(); rigSet.dispose(); terrain.dispose(); renderer.dispose();
    },
  };
}
