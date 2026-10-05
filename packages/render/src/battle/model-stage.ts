import { AmbientLight, AnimationMixer, DirectionalLight, Group, MathUtils, SkinnedMesh, Vector3,
  type AnimationAction, type AnimationClip, type Object3D, type Scene } from 'three';
import { clone as cloneSkeleton, retargetClip } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { hexDirWorldYaw } from '../camera/facing';
import { loadPilotModel, type PilotModel } from '../gltf/load';
import { hexWorld } from './hex-layer';
import type { BattleMarker } from './types';

export interface BattleModelStageStats { readonly characters: number; readonly drawCalls: number;
  readonly failures: number; readonly moving: number }
export interface BattleModelStage {
  readonly stats: BattleModelStageStats;
  updateUnits(units: readonly BattleMarker[]): void;
  update(dt: number, reducedMotion: boolean): void;
  hasModel(id: string): boolean;
  position(id: string, out: Vector3): boolean;
  playStrike?(actorId: string, targetId?: string): void;
  restore(): void;
  dispose(): void;
}
export interface BattleModelStageOptions {
  readonly requestFrame?: () => void;
  readonly changed?: () => void;
  readonly loadModel?: typeof loadPilotModel;
}
interface StrikeMotion {
  readonly mode: 'attack' | 'recoil';
  elapsed: number;
  readonly duration: number;
  readonly direction: Vector3;
  readonly distance: number;
  readonly originPos: Vector3;
}
interface Instance {
  readonly key: string; readonly anchor: Group; readonly mixer: AnimationMixer;
  readonly actions: Readonly<Record<'idle' | 'walk' | 'run', AnimationAction | undefined>>;
  readonly target: Vector3; readonly heightScale: number; readonly drawCalls: number;
  marker: BattleMarker; motion: 'idle' | 'walk' | 'run';
  strike?: StrikeMotion;
}

const clipFor = (clips: readonly AnimationClip[], motion: 'idle' | 'walk' | 'run') =>
  clips.find(clip => clip.name.toLowerCase().includes(motion));
const modelKey = (marker: BattleMarker): string => {
  const value = marker.model!;
  return [value.key, value.modelUrl, value.animationUrl ?? '', value.heightM].join('|');
};
export function battleModelSpeed(motion: 'walk' | 'run', heightM: number): number {
  return (motion === 'run' ? 2.1 : 0.6) * heightM / 0.98;
}
function firstSkinnedMesh(root: Object3D): SkinnedMesh | undefined {
  let result: SkinnedMesh | undefined;
  root.traverse(node => { if (!result && node instanceof SkinnedMesh) result = node; });
  return result;
}
/** Retarget a same-named humanoid clip while preserving the target rig's bone lengths. */
export function retargetBattleClips(targetRoot: Object3D, sourceRoot: Object3D,
  clips: readonly AnimationClip[]): readonly AnimationClip[] {
  const target = firstSkinnedMesh(targetRoot); const source = firstSkinnedMesh(sourceRoot);
  if (!target || !source) throw new Error('BATTLE_MODEL_SKELETON_UNMAPPED');
  const hip = source.skeleton.bones.find(bone =>
    ['mixamorighips', 'pelvis'].includes(bone.name.replace(/[^a-z]/giu, '').toLowerCase()))?.name;
  if (!hip) throw new Error('BATTLE_MODEL_HIP_UNMAPPED');
  const rest = [...target.skeleton.bones, ...source.skeleton.bones].map(bone => ({
    bone, position: bone.position.clone(), quaternion: bone.quaternion.clone(),
    scale: bone.scale.clone(),
  }));
  try {
    return clips.map(clip => retargetClip(target, source, clip, {
      getBoneName: bone => bone.name, hip, hipInfluence: new Vector3(0, 1, 0),
      useFirstFramePosition: true,
    }));
  } finally {
    for (const value of rest) { value.bone.position.copy(value.position);
      value.bone.quaternion.copy(value.quaternion); value.bone.scale.copy(value.scale); }
    targetRoot.updateMatrixWorld(true); sourceRoot.updateMatrixWorld(true);
  }
}
function disposeInstance(instance: Instance): void {
  instance.mixer.stopAllAction(); instance.anchor.removeFromParent();
}
function setMotion(instance: Instance, motion: Instance['motion']): void {
  if (instance.motion === motion) return;
  const previous = instance.actions[instance.motion]; const next = instance.actions[motion];
  previous?.fadeOut(0.12); next?.reset().fadeIn(0.12).play(); instance.motion = motion;
}

/** One cache entry owns one decoded GLB; SkeletonUtils clones share its geometry/material. */
export function createBattleModelStage(scene: Scene, options: BattleModelStageOptions = {}): BattleModelStage {
  const loader = options.loadModel ?? loadPilotModel;
  const templates = new Map<string, Promise<PilotModel>>();
  const animationTemplates = new Map<string, readonly AnimationClip[]>();
  const loaded = new Set<PilotModel>(); const instances = new Map<string, Instance>();
  const pending = new Map<string, string>(); const failed = new Map<string, string>();
  const wanted = new Map<string, BattleMarker>(); const point = new Vector3();
  const fill = new AmbientLight(0xffffff, 1.55);
  const keyLight = new DirectionalLight(0xfff0cf, 2.2); keyLight.position.set(3, 6, 4);
  scene.add(fill, keyLight); let disposed = false;
  const stats = { characters: 0, drawCalls: 0, failures: 0, moving: 0 };
  const template = (url: string, heightM: number): Promise<PilotModel> => {
    const cacheKey = `${url}|${heightM}`; let promise = templates.get(cacheKey);
    if (!promise) {
      promise = loader(url, heightM).then(value => { loaded.add(value); return value; });
      templates.set(cacheKey, promise);
    }
    return promise;
  };
  const refreshStats = (): void => {
    stats.characters = instances.size; stats.drawCalls = [...instances.values()]
      .reduce((sum, value) => sum + value.drawCalls, 0); stats.failures = failed.size;
  };
  const create = async (marker: BattleMarker, key: string): Promise<void> => {
    const descriptor = marker.model!;
    try {
      const [model, motionModel] = await Promise.all([template(descriptor.modelUrl, descriptor.heightM),
        template(descriptor.animationUrl ?? descriptor.modelUrl, descriptor.heightM)]);
      if (disposed || pending.get(marker.id) !== key) return;
      const latest = wanted.get(marker.id);
      if (!latest?.model || modelKey(latest) !== key || !latest.active) {
        pending.delete(marker.id); return;
      }
      const root = cloneSkeleton(model.scene); const anchor = new Group(); anchor.add(root);
      const retargeted = model !== motionModel; const animationKey = modelKey(latest);
      let clips = animationTemplates.get(animationKey);
      if (!clips) {
        clips = retargeted ? retargetBattleClips(root, motionModel.scene, motionModel.clips)
          : motionModel.clips;
        animationTemplates.set(animationKey, clips);
      }
      const animationRoot = retargeted ? firstSkinnedMesh(root) : root;
      if (!animationRoot) throw new Error('BATTLE_MODEL_SKELETON_UNMAPPED');
      const mixer = new AnimationMixer(animationRoot);
      const action = (motion: 'idle' | 'walk' | 'run') => {
        const clip = clipFor(clips, motion); return clip ? mixer.clipAction(clip) : undefined;
      };
      const actions = { idle: action('idle'), walk: action('walk'), run: action('run') };
      const target = hexWorld(latest.q, latest.r, latest.height, point.clone()); target.y += 0.02;
      anchor.position.copy(target);
      anchor.rotation.y = MathUtils.degToRad(hexDirWorldYaw(latest.facing)); scene.add(anchor);
      const instance: Instance = { key, anchor, mixer, actions, target, marker: latest,
        heightScale: descriptor.heightM / 0.98, drawCalls: model.stats.drawCalls, motion: 'idle' };
      if (actions.idle) actions.idle.timeScale = 1.8;
      actions.idle?.play(); instances.set(marker.id, instance); pending.delete(marker.id);
      refreshStats(); options.changed?.(); options.requestFrame?.();
    } catch {
      if (pending.get(marker.id) === key) { pending.delete(marker.id); failed.set(marker.id, key);
        refreshStats(); options.changed?.(); options.requestFrame?.(); }
    }
  };
  return {
    stats,
    updateUnits(units) {
      if (disposed) return;
      wanted.clear(); for (const marker of units) wanted.set(marker.id, marker);
      for (const [id, instance] of instances) {
        const marker = wanted.get(id);
        if (!marker?.model || !marker.active || modelKey(marker) !== instance.key) {
          disposeInstance(instance); instances.delete(id);
          continue;
        }
        hexWorld(marker.q, marker.r, marker.height, instance.target); instance.target.y += 0.02;
        instance.anchor.rotation.y = MathUtils.degToRad(hexDirWorldYaw(marker.facing));
        instance.marker = marker;
      }
      for (const marker of units) {
        if (!marker.active || !marker.model || instances.has(marker.id)) continue;
        const key = modelKey(marker);
        if (pending.get(marker.id) === key || failed.get(marker.id) === key) continue;
        pending.set(marker.id, key); void create(marker, key);
      }
      refreshStats();
    },
    update(dt, reducedMotion) {
      if (disposed) return;
      let moving = 0;
      for (const instance of instances.values()) {
        if (instance.strike) {
          const s = instance.strike;
          s.elapsed += dt;
          const p = Math.min(1, s.elapsed / s.duration);
          if (s.mode === 'attack') {
            const factor = p < 0.45
              ? Math.sin(p / 0.45 * (Math.PI / 2))
              : Math.cos((p - 0.45) / 0.55 * (Math.PI / 2));
            instance.anchor.position.copy(s.originPos)
              .addScaledVector(s.direction, s.distance * factor);
            instance.anchor.rotation.x = -0.15 * factor;
          } else {
            const factor = Math.sin(p * Math.PI);
            instance.anchor.position.copy(s.originPos)
              .addScaledVector(s.direction, s.distance * factor);
            instance.anchor.rotation.x = 0.12 * factor;
          }
          if (p >= 1) {
            instance.anchor.position.copy(s.originPos);
            instance.anchor.rotation.x = 0;
            instance.anchor.rotation.y = MathUtils.degToRad(hexDirWorldYaw(instance.marker.facing));
            setMotion(instance, 'idle');
            delete instance.strike;
          }
          moving += 1;
        } else {
          const distance = instance.anchor.position.distanceTo(instance.target);
          if (reducedMotion) { instance.anchor.position.copy(instance.target); setMotion(instance, 'idle'); }
          else if (distance > 1e-3) {
            const motion = distance > 1.25 ? 'run' : 'walk';
            const speed = battleModelSpeed(motion, instance.heightScale * 0.98);
            const step = Math.min(distance, speed * dt);
            instance.anchor.position.lerp(instance.target, distance <= step ? 1 : step / distance);
            setMotion(instance, motion); moving += distance > step ? 1 : 0;
          } else setMotion(instance, 'idle');
        }
        instance.mixer.update(reducedMotion ? 0 : dt);
      }
      stats.moving = moving;
    },
    hasModel: id => instances.has(id),
    position(id, out) {
      const instance = instances.get(id);
      if (!instance) return false; out.copy(instance.anchor.position); return true;
    },
    playStrike(actorId: string, targetId?: string) {
      if (disposed) return;
      const attacker = instances.get(actorId);
      if (!attacker) return;
      const target = targetId ? instances.get(targetId) : undefined;
      let dir: Vector3;
      let dist = 1.0;
      if (target) {
        dir = target.target.clone().sub(attacker.target);
        dir.y = 0;
        dist = dir.length();
        if (dist > 1e-4) dir.normalize();
        else dir.set(0, 0, 1);
        target.strike = {
          mode: 'recoil',
          elapsed: 0,
          duration: 0.32,
          direction: dir,
          distance: Math.min(dist * 0.25, 0.35),
          originPos: target.target.clone(),
        };
      } else {
        const yaw = MathUtils.degToRad(hexDirWorldYaw(attacker.marker.facing));
        dir = new Vector3(Math.sin(yaw), 0, Math.cos(yaw));
      }
      attacker.anchor.rotation.y = Math.atan2(dir.x, dir.z);
      setMotion(attacker, 'run');
      attacker.strike = {
        mode: 'attack',
        elapsed: 0,
        duration: 0.38,
        direction: dir,
        distance: Math.min(dist * 0.45, 0.75),
        originPos: attacker.target.clone(),
      };
      options.changed?.();
      options.requestFrame?.();
    },
    restore() {
      for (const model of loaded) for (const mesh of model.materials.meshes) {
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const material of materials) material.needsUpdate = true;
      }
    },
    dispose() {
      if (disposed) return; disposed = true; pending.clear(); wanted.clear();
      for (const instance of instances.values()) disposeInstance(instance); instances.clear();
      for (const model of loaded) model.dispose(); loaded.clear(); templates.clear();
      animationTemplates.clear();
      fill.removeFromParent(); keyLight.removeFromParent(); stats.moving = 0; refreshStats();
    },
  };
}
