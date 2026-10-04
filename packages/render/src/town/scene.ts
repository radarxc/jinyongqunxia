import { AmbientLight, CircleGeometry, Color, DirectionalLight, Frustum, InstancedMesh, Matrix4,
  MeshBasicMaterial, OrthographicCamera, Raycaster, Scene, Vector2, Vector3,
  WebGLRenderer } from 'three';
import type { RigInstance } from '../rig/character';
import { createTownGeometry, loadTownAtlas } from './geometry';
import { createTownHeightPicker, elevationAtHex, townCameraOffset, townHexToWorld } from './projection';
import type { TownAnchorView, TownNpcView, TownRuntimeView, TownScene,
  TownSceneOptions, TownSceneProjection } from './types';

const CAMERA_DISTANCE = 42;
const FADE_SECONDS = 0.24;
function validZoom(value: number): number {
  if (!Number.isFinite(value)) throw new RangeError('TOWN_ZOOM');
  return Math.min(2.5, Math.max(0.65, value));
}
function markerColor(anchor: TownAnchorView): number {
  return anchor.kind === 'meditation' ? 0x5b8291 :
    anchor.kind === 'npc' ? 0xc36b45 : anchor.kind === 'building' ? 0xc99b45 : 0x758c5f;
}

export async function createTownScene(canvas: HTMLCanvasElement, town: TownRuntimeView,
  options: TownSceneOptions): Promise<TownScene> {
  const rig = await (options.loadRigRuntime ?? (() => import('../rig/runtime')))();
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false,
    powerPreference: 'high-performance' }); renderer.setClearColor(new Color(0xddd0ad));
  const scene = new Scene(); const camera = new OrthographicCamera(-12, 12, 8, -8, 0.1, 200);
  const [tileAtlas, buildingAtlas] = await Promise.all([loadTownAtlas(town.assets.tile),
    loadTownAtlas(town.assets.building)]);
  const geometry = createTownGeometry(town, tileAtlas, buildingAtlas);
  scene.add(geometry.group, new AmbientLight(0xfff4dc, 2));
  const light = new DirectionalLight(0xfff2d3, 2); light.position.set(-20, 35, 12); scene.add(light);
  const rigSet = await rig.loadRigSet(rig.createPlaceholderRigManifest('town-actors'));
  const batch = new rig.RigBatch(rigSet, 100); batch.addTo(scene);
  const player = rig.createRigCharacter(rigSet, options.projection.actor.equipment, 1); batch.add(player);
  const npcs = new Map<string, { readonly actor: RigInstance; view: TownNpcView }>();
  const anchorMesh = new InstancedMesh(new CircleGeometry(0.24, 16),
    new MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.88 }), 256);
  anchorMesh.name = 'town-anchor-instances'; anchorMesh.rotation.x = -Math.PI / 2; anchorMesh.renderOrder = 50;
  scene.add(anchorMesh);
  const stats = { drawCalls: 0, triangles: 0, frameMs: 0, cpuMs: 0,
    groundInstances: geometry.groundInstances, buildingInstances: geometry.buildingInstances,
    rigInstances: player.activeInstanceCount, visibleChunks: 0, atlasTextures: 3 };
  const raycaster = new Raycaster(); const pointer = new Vector2(); const hit = new Vector3();
  const pickHeight = createTownHeightPicker(town.navigation.nodes); const scratch = new Vector3();
  const cameraOffset = new Vector3(); const viewProjection = new Matrix4(); const frustum = new Frustum();
  const anchors: TownAnchorView[] = []; const anchorPoints: Vector3[] = []; const transform = new Matrix4();
  let projection = options.projection; let zoom = validZoom(options.zoom ?? 1);
  let width = 1; let height = 1; let previous = 0; let opacity = 1; let disposed = false;

  function placeActor(actor: RigInstance, view: TownSceneProjection['actor'] | TownNpcView): void {
    townHexToWorld(view.point, town.grid.height, elevationAtHex(town.navigation.nodes, view.point), scratch);
    actor.setPosition(scratch.x, scratch.y + 0.03, scratch.z);
    actor.setMotion(view.direction ?? 1, 'walking' in view && view.walking ? 1.35 : 0,
      rig.weightClassForEquipment(view.equipment));
  }
  function setCamera(): void {
    townHexToWorld(projection.actor.point, town.grid.height,
      elevationAtHex(town.navigation.nodes, projection.actor.point), scratch);
    townCameraOffset(CAMERA_DISTANCE, cameraOffset);
    camera.position.copy(scratch).add(cameraOffset); camera.lookAt(scratch); camera.updateMatrixWorld();
  }
  function updateAnchors(next: readonly TownAnchorView[]): void {
    anchors.splice(0); anchorPoints.splice(0);
    for (const anchor of next) {
      if (anchor.active === false || anchors.length >= anchorMesh.count) continue;
      townHexToWorld(anchor.point, town.grid.height,
        elevationAtHex(town.navigation.nodes, anchor.point), scratch); scratch.y += 0.06;
      transform.makeTranslation(scratch.x, scratch.y, scratch.z);
      anchorMesh.setMatrixAt(anchors.length, transform); anchorMesh.setColorAt(anchors.length,
        new Color(markerColor(anchor))); anchors.push(anchor); anchorPoints.push(scratch.clone());
    }
    anchorMesh.count = anchors.length; anchorMesh.instanceMatrix.needsUpdate = true;
    if (anchorMesh.instanceColor) anchorMesh.instanceColor.needsUpdate = true;
    anchorMesh.computeBoundingSphere();
  }
  async function updateNpcs(next: readonly TownNpcView[]): Promise<void> {
    const visible = new Set(next.map((npc) => npc.npcId));
    for (const [id, entry] of npcs) if (!visible.has(id)) {
      batch.remove(entry.actor); entry.actor.dispose(); npcs.delete(id);
    }
    for (let index = 0; index < next.length; index += 1) {
      const view = next[index]!; let entry = npcs.get(view.npcId);
      if (!entry) {
        const actor = rig.createRigCharacter(rigSet, view.equipment, index + 2);
        batch.add(actor); entry = { actor, view }; npcs.set(view.npcId, entry);
      } else await entry.actor.setEquipment(view.equipment);
      entry.view = view; placeActor(entry.actor, view);
    }
  }
  async function update(next: TownSceneProjection): Promise<void> {
    projection = next; await player.setEquipment(next.actor.equipment); placeActor(player, next.actor);
    await updateNpcs(next.npcs); updateAnchors(next.anchors); setCamera();
  }
  function resize(nextWidth: number, nextHeight: number, pixelRatio = 1): void {
    width = Math.max(1, nextWidth); height = Math.max(1, nextHeight);
    const aspect = width / height; const half = 9 / zoom;
    camera.left = -half * aspect; camera.right = half * aspect; camera.top = half; camera.bottom = -half;
    camera.updateProjectionMatrix(); renderer.setPixelRatio(Math.min(2, Math.max(1, pixelRatio)));
    renderer.setSize(width, height, false);
  }
  function pointerRay(clientX: number, clientY: number, bounds: DOMRect): boolean {
    if (bounds.width <= 0 || bounds.height <= 0) return false;
    pointer.set((clientX - bounds.left) * 2 / bounds.width - 1,
      1 - (clientY - bounds.top) * 2 / bounds.height); raycaster.setFromCamera(pointer, camera);
    return true;
  }
  await update(options.projection);
  return { stats, resize, update,
    render(timeMs, reducedMotion = false) {
      if (disposed) return; const started = performance.now();
      const dt = previous === 0 ? 0 : Math.min(0.1, Math.max(0, (timeMs - previous) / 1000)); previous = timeMs;
      const target = projection.activeBuildingId === null ||
        projection.buildingPhase === 'outside' || projection.buildingPhase === 'fading-out' ? 1 : 0.28;
      const delta = reducedMotion ? 1 : Math.min(1, dt / FADE_SECONDS); opacity += (target - opacity) * delta;
      if (Math.abs(target - opacity) < 0.001) opacity = target;
      geometry.setBuildingFocus(projection.activeBuildingId, opacity);
      player.update(reducedMotion ? 0 : dt); for (const entry of npcs.values()) entry.actor.update(reducedMotion ? 0 : dt);
      viewProjection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      frustum.setFromProjectionMatrix(viewProjection); let visibleChunks = 0;
      for (const chunk of geometry.groundChunks) { chunk.visible = frustum.intersectsObject(chunk);
        if (chunk.visible) visibleChunks += 1; }
      batch.sync(); renderer.render(scene, camera); stats.cpuMs = performance.now() - started;
      stats.frameMs = dt * 1000; stats.drawCalls = renderer.info.render.calls;
      stats.triangles = renderer.info.render.triangles; stats.rigInstances = batch.stats.activeInstances;
      stats.visibleChunks = visibleChunks;
    },
    setZoom(next) { zoom = validZoom(next); resize(width, height, renderer.getPixelRatio()); },
    pickPoint(clientX, clientY, bounds) {
      if (!pointerRay(clientX, clientY, bounds)) return null;
      return pickHeight(raycaster.ray, hit);
    },
    pickAnchor(clientX, clientY, bounds) {
      if (!pointerRay(clientX, clientY, bounds)) return null;
      const match = raycaster.intersectObject(anchorMesh, false)[0];
      return match?.instanceId === undefined ? null : anchors[match.instanceId] ?? null;
    },
    project(point, elevationCm, out) {
      townHexToWorld(point, town.grid.height, elevationCm, scratch).project(camera);
      out.x = (scratch.x + 1) * width / 2; out.y = (1 - scratch.y) * height / 2;
      out.visible = scratch.z >= -1 && scratch.z <= 1 && Math.abs(scratch.x) <= 1 && Math.abs(scratch.y) <= 1;
    },
    dispose() {
      if (disposed) return; disposed = true; player.dispose();
      for (const entry of npcs.values()) entry.actor.dispose(); npcs.clear();
      batch.dispose(); rigSet.dispose(); anchorMesh.dispose(); anchorMesh.geometry.dispose();
      (anchorMesh.material as MeshBasicMaterial).dispose(); geometry.dispose();
      tileAtlas.dispose(); buildingAtlas.dispose(); renderer.dispose();
    },
  };
}
