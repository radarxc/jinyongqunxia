import {
  AnimationMixer, CircleGeometry, Group, InstancedMesh, Matrix4, MeshBasicMaterial,
  Vector3, type AnimationAction, type Camera, type Object3D, type Raycaster, type Scene,
} from 'three';
import type { PilotModel } from '../../gltf/load';
import type { ActorEquipment, ActorLook, ActorPort } from './types';

export const PLACEHOLDER_WALK_HPS = 0.6 / 0.98;
export const PLACEHOLDER_RUN_HPS = 2.1 / 0.98;
const MAX_TURN_RAD_PER_SECOND = 3 * Math.PI;
const PICK_RADIUS_SQ = 0.35 * 0.35;
const CAPACITY = 100;

interface Actor {
  readonly id: string; readonly look: ActorLook; readonly anchor: Group;
  readonly target: Vector3; readonly current: Vector3;
  model?: Object3D; mixer?: AnimationMixer;
  actions?: readonly [AnimationAction | undefined, AnimationAction | undefined, AnimationAction | undefined];
  equipment?: ActorEquipment; yaw: number; targetYaw: number; speed: number; motion: 0 | 1 | 2;
  initialized: boolean; generation: number; drawCalls: number; triangles: number;
}
export interface PlaceholderActorPortOptions {
  readonly scene: Scene;
  readonly loadModel?: (url: string, heightM: number, options: { stature: 'headTop' }) => Promise<PilotModel>;
  readonly requestFrame?: () => void;
  readonly playerModelUrl?: string;
}

function female(look: ActorLook): boolean {
  return /(?:^|_)f(?:_|$)|female|tpl_f/u.test(look.template);
}
export function placeholderActorUrl(look: ActorLook): string {
  const key = look.role === 'player'
    ? `npc_zhujue__ch00_${female(look) ? 'f' : 'm'}`
    : `npc_generic_${female(look) ? 'f' : 'm'}`;
  return `/assets/default/model3d/${key}/anim_idle_walk_run.glb`;
}
export function gaitTimeScale(speedMps: number, heightM: number, motion: 0 | 1 | 2): number {
  const hps = motion === 2 ? PLACEHOLDER_RUN_HPS : PLACEHOLDER_WALK_HPS;
  return Math.min(1.45, Math.max(0.8, speedMps / (hps * heightM)));
}
function clipAction(model: PilotModel, mixer: AnimationMixer, name: string): AnimationAction | undefined {
  const clip = model.clips.find(value => value.name.toLowerCase().includes(name));
  return clip ? mixer.clipAction(clip) : undefined;
}
function turnToward(value: number, target: number, dt: number): number {
  let delta = (target - value) % (Math.PI * 2);
  if (delta > Math.PI) delta -= Math.PI * 2; else if (delta < -Math.PI) delta += Math.PI * 2;
  const step = (dt > 0 ? dt : 0) * MAX_TURN_RAD_PER_SECOND;
  return value + (delta < -step ? -step : delta > step ? step : delta);
}

export function createPlaceholderActorPort(options: PlaceholderActorPortOptions): ActorPort {
  const templates = new Map<string, Promise<PilotModel>>(); const loaded = new Set<PilotModel>();
  const byId = new Map<string, Actor>(); const actors: Actor[] = []; let disposed = false;
  const shadowGeometry = new CircleGeometry(.28, 12); shadowGeometry.rotateX(-Math.PI / 2);
  const shadowMaterial = new MeshBasicMaterial({ color: 0x211b16, transparent: true, opacity: .28, depthWrite: false });
  const shadows = new InstancedMesh(shadowGeometry, shadowMaterial, CAPACITY);
  shadows.name = 'placeholder-actor-shadows'; options.scene.add(shadows);
  const transform = new Matrix4(); const capsuleTop = new Vector3();
  const rayPoint = new Vector3(); const segmentPoint = new Vector3();
  let cloneLoader: Promise<(source: Object3D) => Object3D> | undefined;
  const stats = { actors: 0, drawCalls: 0, triangles: 0, templates: 0, failures: 0 };
  function template(url: string): Promise<PilotModel> {
    let promise = templates.get(url);
    if (!promise) { const loading = options.loadModel
      ? options.loadModel(url, 1, { stature: 'headTop' })
      : import('../../gltf/load').then(module => module.loadPilotModel(url, 1, { stature: 'headTop' }));
      promise = loading.then(value => {
      if (disposed) value.dispose(); else loaded.add(value); return value; });
      templates.set(url, promise); stats.templates = templates.size; }
    return promise;
  }
  function refreshStats(): void {
    stats.actors = actors.length; stats.drawCalls = actors.length > 0 ? 1 : 0; stats.triangles = 0;
    for (let index = 0; index < actors.length; index += 1) {
      stats.drawCalls += actors[index]!.drawCalls; stats.triangles += actors[index]!.triangles;
    }
    shadows.count = actors.length;
  }
  function attach(actor: Actor): void {
    const url = actor.look.role === 'player' && options.playerModelUrl
      ? options.playerModelUrl : placeholderActorUrl(actor.look);
    const token = ++actor.generation;
    cloneLoader ??= import('three/examples/jsm/utils/SkeletonUtils.js')
      .then(module => (source: Object3D) => module.clone(source));
    void Promise.all([template(url), cloneLoader]).then(([model, cloneSkeleton]) => {
      if (disposed || actor.generation !== token || byId.get(actor.id) !== actor) return;
      const instance = cloneSkeleton(model.scene);
      instance.scale.multiplyScalar(actor.look.heightM); instance.updateMatrixWorld(true);
      const mixer = new AnimationMixer(instance);
      actor.model = instance; actor.mixer = mixer; actor.actions = [clipAction(model,mixer,'idle'),
        clipAction(model,mixer,'walk'),clipAction(model,mixer,'run')];
      actor.actions[0]?.play(); actor.drawCalls = model.stats.drawCalls; actor.triangles = model.stats.triangles;
      actor.anchor.add(instance); refreshStats(); options.requestFrame?.();
    }).catch(() => { stats.failures += 1; options.requestFrame?.(); });
  }
  function removeAt(index: number): void {
    const actor = actors[index]!; actor.generation += 1; actor.mixer?.stopAllAction();
    actor.anchor.removeFromParent(); byId.delete(actor.id);
    const last = actors.pop(); if (last && index < actors.length) actors[index] = last; refreshStats();
  }
  return { stats,
    spawn(id, look) {
      if (disposed) return; const previous = byId.get(id);
      if (previous) { removeAt(actors.indexOf(previous)); }
      if (!(look.heightM > 0) || !Number.isFinite(look.heightM)) throw new RangeError('ACTOR_HEIGHT');
      if (actors.length >= CAPACITY) throw new RangeError('ACTOR_CAPACITY');
      const anchor = new Group(); anchor.name = `placeholder-actor:${id}`; options.scene.add(anchor);
      const actor: Actor = { id, look, anchor, target: new Vector3(), current: new Vector3(),
        yaw: 0, targetYaw: 0, speed: 0, motion: 0, initialized: false, generation: 0, drawCalls: 0, triangles: 0 };
      actors.push(actor); byId.set(id, actor); refreshStats(); attach(actor);
    },
    despawn(id) { const actor = byId.get(id); if (actor) removeAt(actors.indexOf(actor)); },
    setPose(id, x, y, z, yawRad, motion, speedMps) {
      const actor = byId.get(id); if (!actor) return; actor.target.set(x,y,z); actor.targetYaw = yawRad;
      actor.motion = motion; actor.speed = speedMps > 0 ? speedMps : 0;
    },
    setEquipment(id, equipment) { const actor = byId.get(id); if (actor) actor.equipment = equipment; },
    update(dt, _camera: Camera) {
      if (disposed) return; const stepDt = dt > 0 ? dt : 0;
      if (actors.length === 1) { const actor = actors[0]!;
        if (actor.initialized && actor.current.x === actor.target.x && actor.current.y === actor.target.y &&
          actor.current.z === actor.target.z && actor.yaw === actor.targetYaw && actor.motion === 0) return; }
      for (let index = 0; index < actors.length; index += 1) {
        const actor = actors[index]!;
        if (!actor.initialized) { actor.current.copy(actor.target); actor.yaw = actor.targetYaw; actor.initialized = true; }
        const dx = actor.target.x-actor.current.x; const dy = actor.target.y-actor.current.y;
        const dz = actor.target.z-actor.current.z; const distance = Math.hypot(dx,dy,dz);
        const step = actor.motion === 0 ? distance : actor.speed*stepDt;
        if (distance > 0 && step > 0) { const portion = step < distance ? step/distance : 1;
          actor.current.x += dx*portion; actor.current.y += dy*portion; actor.current.z += dz*portion; }
        actor.yaw = turnToward(actor.yaw, actor.targetYaw, stepDt); actor.anchor.position.copy(actor.current);
        actor.anchor.rotation.y = actor.yaw;
        if (actor.actions) { for (let action = 0; action < actor.actions.length; action += 1) {
          const value = actor.actions[action]; if (value) value.enabled = action === actor.motion;
        }
          const selected = actor.actions[actor.motion];
          if (selected && !selected.isRunning()) selected.reset().play();
          if (selected) selected.timeScale = actor.motion === 0 ? 1 :
            gaitTimeScale(actor.speed, actor.look.heightM, actor.motion); }
        actor.mixer?.update(stepDt); transform.makeTranslation(actor.current.x,actor.current.y+.012,actor.current.z);
        shadows.setMatrixAt(index, transform);
      }
      shadows.instanceMatrix.needsUpdate = true;
    },
    pick(raycaster: Raycaster) {
      let nearest = Infinity; let result: string | null = null;
      for (let index = 0; index < actors.length; index += 1) {
        const actor = actors[index]!; capsuleTop.copy(actor.current); capsuleTop.y += actor.look.heightM;
        const distance = raycaster.ray.distanceSqToSegment(actor.current,capsuleTop,rayPoint,segmentPoint);
        const along = raycaster.ray.origin.distanceToSquared(rayPoint);
        if (distance <= PICK_RADIUS_SQ && along < nearest) { nearest = along; result = actor.id; }
      }
      return result;
    },
    restore() {
      if (disposed) return; shadowGeometry.attributes['position']!.needsUpdate = true;
      for (const model of loaded) model.scene.traverse(node => {
        const value = node as Object3D & { geometry?: { attributes: Record<string, { needsUpdate: boolean }> } };
        if (value.geometry) for (const attribute of Object.values(value.geometry.attributes)) attribute.needsUpdate = true;
      });
    },
    dispose() {
      if (disposed) return; disposed = true;
      while (actors.length) removeAt(actors.length - 1); shadows.removeFromParent(); shadows.dispose();
      shadowGeometry.dispose(); shadowMaterial.dispose(); for (const model of loaded) model.dispose(); loaded.clear();
    },
  };
}
