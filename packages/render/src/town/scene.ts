import { AmbientLight, AnimationMixer, CircleGeometry, Color, DirectionalLight, Frustum, Group, InstancedMesh, Matrix4, Mesh,
  MeshBasicMaterial, type MeshStandardMaterial, OrthographicCamera, PlaneGeometry, Quaternion, Raycaster, Scene, SRGBColorSpace,
  TextureLoader, Vector2, Vector3, WebGLRenderer, type AnimationAction } from 'three';
import type { Texture } from 'three';
import type { PilotModel } from '../gltf/load';
import type { RigInstance } from '../rig/character';
import { createTownGeometry, loadTownAtlas } from './geometry';
import { createTownHeightPicker, elevationAtHex, townBillboardQuaternion, townCameraOffset,
  townHexToWorld } from './projection';
import type { TownAnchorView, TownNpcView, TownRuntimeView, TownScene,
  TownSceneOptions, TownSceneProjection } from './types';

const CAMERA_DISTANCE = 42;
const FADE_SECONDS = 0.24;
/** Walking figures are cutout 立绘 billboards; world height in metres (buildings are ~5 m). */
const SPRITE_HEIGHT = 2.1;
const DEFAULT_PLAYER_SPRITE = '/img/hero_cutout.png';
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
  let disposed = false;
  const rig = await (options.loadRigRuntime ?? (() => import('../rig/runtime')))();
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance' }); renderer.setClearColor(new Color(0xddd0ad));
  const scene = new Scene(); const camera = new OrthographicCamera(-12, 12, 8, -8, 0.1, 200);
  const [tileAtlas, buildingAtlas] = await Promise.all([loadTownAtlas(town.assets.tile),
    loadTownAtlas(town.assets.building)]);
  const geometry = createTownGeometry(town, tileAtlas, buildingAtlas);
  scene.add(geometry.group, new AmbientLight(0xfff4dc, 2));
  const light = new DirectionalLight(0xfff2d3, 2); light.position.set(-20, 35, 12); scene.add(light);
  const fillLight = new DirectionalLight(0xffeedd, 1.8); fillLight.position.set(25, 30, 25); scene.add(fillLight);
  const rigSet = await rig.loadRigSet(rig.createPlaceholderRigManifest('town-actors'));
  const batch = new rig.RigBatch(rigSet, 100); batch.addTo(scene);
  const player = rig.createRigCharacter(rigSet, options.projection.actor.equipment, 1); batch.add(player);
  const npcs = new Map<string, { readonly actor: RigInstance; view: TownNpcView }>();
  // Cutout figures for the walking player / NPCs. They stand on their foot point and face the camera.
  const spriteGeometry = new PlaneGeometry(1, 1); spriteGeometry.translate(0, 0.5, 0);
  const spriteRotation = townBillboardQuaternion(new Quaternion());
  const spriteTextures = new Map<string, Promise<Texture | null>>();
  const sprites = new Map<RigInstance, { readonly mesh: Mesh; readonly material: MeshBasicMaterial;
    walking: boolean; phase: number; baseY: number }>();
  const spriteLoader = typeof document === 'undefined' ? null : new TextureLoader();
  function spriteTexture(url: string): Promise<Texture | null> {
    let entry = spriteTextures.get(url);
    if (!entry) {
      entry = spriteLoader ? spriteLoader.loadAsync(url).then((texture) => {
        texture.colorSpace = SRGBColorSpace; return texture;
      }).catch(() => null) : Promise.resolve(null);
      spriteTextures.set(url, entry);
    }
    return entry;
  }
  function attachSprite(actor: RigInstance, url: string | null | undefined, seed: number): void {
    if (!url || sprites.has(actor)) return;
    const material = new MeshBasicMaterial({ transparent: true, alphaTest: 0.4, depthWrite: true });
    const mesh = new Mesh(spriteGeometry, material); mesh.name = 'town-actor-sprite';
    mesh.quaternion.copy(spriteRotation); mesh.renderOrder = 30; mesh.visible = false;
    mesh.scale.set(SPRITE_HEIGHT * 2 / 3, SPRITE_HEIGHT, 1); scene.add(mesh);
    sprites.set(actor, { mesh, material, walking: false, phase: seed * 1.7, baseY: 0 });
    void spriteTexture(url).then((texture) => {
      if (!texture || disposed) return;
      const image = texture.image as { width?: number; height?: number } | undefined;
      if (image?.width && image.height) mesh.scale.x = SPRITE_HEIGHT * image.width / image.height;
      material.map = texture; material.needsUpdate = true; mesh.visible = true;
    });
  }
  function detachSprite(actor: RigInstance): void {
    const sprite = sprites.get(actor); if (!sprite) return;
    scene.remove(sprite.mesh); sprite.material.dispose(); sprites.delete(actor);
  }
  attachSprite(player, options.spriteFor?.('player') ?? DEFAULT_PLAYER_SPRITE, 0);

  // 3D Animated Character Model for protagonist (AR-92 / 图5: 小地图3D建模+贴图+行走动作)
  const player3DContainer = new Group();
  player3DContainer.name = 'town-player-3d-container';
  scene.add(player3DContainer);

  let player3D: PilotModel | undefined;
  let playerMixer: AnimationMixer | undefined;
  let idleAction: AnimationAction | undefined;
  let walkAction: AnimationAction | undefined;
  let currentMotion: 'idle' | 'walk' | 'run' = 'idle';
  let currentFacingYaw = 0;

  if (typeof document !== 'undefined') {
    const modelUrl = options.playerModelUrl ?? '/assets/default/model3d/npc_zhujue__ch00_m/anim_idle_walk_run.glb';
    try {
      const { loadPilotModel } = await import('../gltf/load');
      const pilot = await loadPilotModel(modelUrl, 3.4);
      if (!disposed) {
        player3D = pilot;
        pilot.scene.name = 'town-player-3d';
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
        const playerSprite = sprites.get(player);
        if (playerSprite) playerSprite.mesh.visible = false;
      }
    } catch (err) {
      console.error('createTownScene loadPilotModel failed:', err);
    }
  }
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
  let width = 1; let height = 1; let previous = 0; let opacity = 1;
  const playerWorldPos = new Vector3();
  const playerTargetPos = new Vector3();
  let playerPosInitialized = false;

  function placeActor(actor: RigInstance, view: TownSceneProjection['actor'] | TownNpcView): void {
    townHexToWorld(view.point, town.grid.height, elevationAtHex(town.navigation.nodes, view.point), scratch);
    const walking = 'walking' in view && view.walking === true;
    if (actor === player) {
      playerTargetPos.set(scratch.x, scratch.y, scratch.z);
      if (!playerPosInitialized) {
        playerWorldPos.copy(playerTargetPos);
        playerPosInitialized = true;
        actor.setPosition(scratch.x, scratch.y + 0.03, scratch.z);
      }
    } else {
      actor.setPosition(scratch.x, scratch.y + 0.03, scratch.z);
    }
    actor.setMotion(view.direction ?? 1, walking ? 1.4 : 0,
      rig.weightClassForEquipment(view.equipment));
    const sprite = sprites.get(actor);
    if (sprite) {
      if (actor !== player) {
        sprite.baseY = scratch.y + 0.02;
        sprite.mesh.position.set(scratch.x, sprite.baseY, scratch.z);
      }
      sprite.walking = walking;
      // Mirror the cutout so it faces the direction of travel (Dir8 1..3 = east-ish, 5..7 = west-ish).
      const direction = view.direction ?? 1; const flip = direction >= 5 && direction <= 7 ? -1 : 1;
      sprite.mesh.scale.x = Math.abs(sprite.mesh.scale.x) * flip;
    }
  }
  function setCamera(instant = false): void {
    const focus = playerPosInitialized ? playerWorldPos : scratch;
    if (!playerPosInitialized) {
      townHexToWorld(projection.actor.point, town.grid.height,
        elevationAtHex(town.navigation.nodes, projection.actor.point), scratch);
    }
    townCameraOffset(CAMERA_DISTANCE, cameraOffset);
    if (instant) {
      camera.position.copy(focus).add(cameraOffset);
      camera.lookAt(focus);
      camera.updateMatrixWorld();
    }
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
      detachSprite(entry.actor); batch.remove(entry.actor); entry.actor.dispose(); npcs.delete(id);
    }
    for (let index = 0; index < next.length; index += 1) {
      const view = next[index]!; let entry = npcs.get(view.npcId);
      if (!entry) {
        const actor = rig.createRigCharacter(rigSet, view.equipment, index + 2);
        batch.add(actor); entry = { actor, view }; npcs.set(view.npcId, entry);
        attachSprite(actor, options.spriteFor?.(view.npcId), index + 1);
      } else await entry.actor.setEquipment(view.equipment);
      entry.view = view; placeActor(entry.actor, view);
    }
  }
  async function update(next: TownSceneProjection): Promise<void> {
    projection = next; await player.setEquipment(next.actor.equipment); placeActor(player, next.actor);
    await updateNpcs(next.npcs); updateAnchors(next.anchors); setCamera(!playerPosInitialized);
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
  setCamera(true);
  return { stats, resize, update,
    render(timeMs, reducedMotion = false) {
      if (disposed) return; const started = performance.now();
      const dt = previous === 0 ? 0 : Math.min(0.1, Math.max(0, (timeMs - previous) / 1000)); previous = timeMs;
      const target = projection.activeBuildingId === null ||
        projection.buildingPhase === 'outside' || projection.buildingPhase === 'fading-out' ? 1 : 0.28;
      const delta = reducedMotion ? 1 : Math.min(1, dt / FADE_SECONDS); opacity += (target - opacity) * delta;
      if (Math.abs(target - opacity) < 0.001) opacity = target;
      geometry.setBuildingFocus(projection.activeBuildingId, opacity);

      if (playerPosInitialized) {
        const dist = playerWorldPos.distanceTo(playerTargetPos);
        const lerpFactor = reducedMotion ? 1 : Math.min(1, dt * 14);
        if (dist > 0.001) {
          playerWorldPos.lerp(playerTargetPos, lerpFactor);
        } else {
          playerWorldPos.copy(playerTargetPos);
        }
        player.setPosition(playerWorldPos.x, playerWorldPos.y + 0.03, playerWorldPos.z);
        const playerSprite = sprites.get(player);
        if (playerSprite) {
          playerSprite.baseY = playerWorldPos.y + 0.02;
        }
        townCameraOffset(CAMERA_DISTANCE, cameraOffset);
        const desiredCam = scratch.copy(playerWorldPos).add(cameraOffset);
        camera.position.lerp(desiredCam, reducedMotion ? 1 : Math.min(1, dt * 10));
        camera.lookAt(playerWorldPos);
        camera.updateMatrixWorld();
      }

      player.update(reducedMotion ? 0 : dt); for (const entry of npcs.values()) entry.actor.update(reducedMotion ? 0 : dt);
      if (player3D && playerPosInitialized) {
        player3DContainer.position.set(playerWorldPos.x, playerWorldPos.y + 0.02, playerWorldPos.z);
        const moveDx = playerTargetPos.x - playerWorldPos.x;
        const moveDz = playerTargetPos.z - playerWorldPos.z;
        const moveDist = Math.hypot(moveDx, moveDz);
        const isMoving = moveDist > 0.04 || projection.actor.walking;

        if (moveDist > 0.06) {
          const desiredYaw = Math.atan2(moveDx, moveDz);
          let diff = desiredYaw - currentFacingYaw;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          currentFacingYaw += diff * Math.min(1, dt * 14);
          player3DContainer.rotation.y = currentFacingYaw;
        } else if (projection.actor.direction !== undefined) {
          const dirYaw = ((projection.actor.direction * 45) * Math.PI) / 180;
          let diff = dirYaw - currentFacingYaw;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          currentFacingYaw += diff * Math.min(1, dt * 8);
          player3DContainer.rotation.y = currentFacingYaw;
        }

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
        const playerSprite = sprites.get(player);
        if (playerSprite && playerSprite.mesh.visible) {
          playerSprite.mesh.visible = false;
        }
      }
      for (const [actor, sprite] of sprites.entries()) {
        if (actor === player && player3D) continue;
        const isWalking = sprite.walking || (actor === player && playerWorldPos.distanceTo(playerTargetPos) > 0.04);
        sprite.phase += (reducedMotion ? 0 : dt) * (isWalking ? 12 : 1.6);
        const lift = isWalking ? Math.abs(Math.sin(sprite.phase)) * 0.12 : 0;
        const sway = isWalking ? Math.sin(sprite.phase) * 0.04 : 0;
        if (actor === player) {
          sprite.mesh.position.set(playerWorldPos.x, sprite.baseY + lift, playerWorldPos.z);
        } else {
          sprite.mesh.position.y = sprite.baseY + lift;
        }
        sprite.mesh.quaternion.copy(spriteRotation);
        if (sway !== 0) {
          sprite.mesh.rotateZ(sway);
        }
        sprite.mesh.scale.y = SPRITE_HEIGHT * (1 + (isWalking ? 0 : Math.sin(sprite.phase) * 0.006));
      }
      viewProjection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      frustum.setFromProjectionMatrix(viewProjection);
      let visibleChunks = 0;
      for (const chunk of geometry.groundChunks) {
        chunk.visible = frustum.intersectsObject(chunk);
        if (chunk.visible) visibleChunks += 1;
      }
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
    get scene() { return scene; },
    get camera() { return camera; },
    get canvas() { return canvas; },
    get renderer() { return renderer; },
    dispose() {
      if (disposed) return; disposed = true;
      if (player3D) {
        playerMixer?.stopAllAction();
        player3D.dispose();
        player3D = undefined;
      }
      player3DContainer.removeFromParent();
      for (const actor of [...sprites.keys()]) detachSprite(actor); spriteGeometry.dispose();
      for (const entry of spriteTextures.values()) void entry.then((texture) => texture?.dispose());
      player.dispose();
      for (const entry of npcs.values()) entry.actor.dispose(); npcs.clear();
      batch.dispose(); rigSet.dispose(); anchorMesh.dispose(); anchorMesh.geometry.dispose();
      (anchorMesh.material as MeshBasicMaterial).dispose(); geometry.dispose();
      tileAtlas.dispose(); buildingAtlas.dispose(); renderer.dispose();
    },
  };
}
