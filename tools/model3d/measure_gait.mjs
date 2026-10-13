#!/usr/bin/env node
/** Measure bind-pose stature and native walk/run speed from a humanoid GLB. */

import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import process from 'node:process';

const renderRequire = createRequire(new URL('../../packages/render/package.json', import.meta.url));
const threeEntry = renderRequire.resolve('three');
const THREE = await import(pathToFileURL(join(dirname(threeEntry), 'three.module.js')).href);
const loaderUrl = pathToFileURL(renderRequire.resolve('three/examples/jsm/loaders/GLTFLoader.js'));
const decoderUrl = pathToFileURL(renderRequire.resolve('three/examples/jsm/libs/meshopt_decoder.module.js'));
const skeletonUrl = pathToFileURL(renderRequire.resolve('three/examples/jsm/utils/SkeletonUtils.js'));
const { GLTFLoader } = await import(loaderUrl.href);
const { MeshoptDecoder } = await import(decoderUrl.href);
const { retargetClip } = await import(skeletonUrl.href);

const SAMPLE_HZ = 240;
const REFERENCE_HEIGHT_M = 1.81;
const normalize = value => value.replace(/[^a-z0-9]/giu, '').toLowerCase();

function fail(message) { process.stderr.write(`错误：${message}\n`); return 2; }
function named(root, aliases) {
  const wanted = new Set(aliases.map(normalize)); let found;
  root.traverse(node => { if (!found && wanted.has(normalize(node.name))) found = node; });
  return found;
}

async function loadGlb(path) {
  globalThis.self ??= globalThis;
  const bytes = await readFile(path);
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  return new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(buffer, '');
}

function stature(root) {
  root.updateMatrixWorld(true);
  const head = named(root, ['HeadTop_End', 'mixamorig:HeadTop_End', 'mixamorigHeadTop_End']);
  if (!head) throw new Error('缺 HeadTop_End / mixamorig:HeadTop_End 骨骼');
  const value = head.getWorldPosition(new THREE.Vector3()).y;
  if (!Number.isFinite(value) || value <= 1e-6) throw new Error(`HeadTop_End 世界高度无效：${value}`);
  return value;
}

function sampleClip(root, clip) {
  const left = named(root, ['LeftFoot', 'mixamorig:LeftFoot', 'mixamorigLeftFoot']);
  const right = named(root, ['RightFoot', 'mixamorig:RightFoot', 'mixamorigRightFoot']);
  const hips = named(root, ['Hips', 'mixamorig:Hips', 'mixamorigHips', 'pelvis']);
  if (!left || !right || !hips) throw new Error(`${clip.name}: 缺 Hips / LeftFoot / RightFoot 骨骼`);
  const mixerRoot = clip.tracks.some(track => track.name.startsWith('.bones[')) ? firstSkinned(root) : root;
  if (!mixerRoot) throw new Error(`${clip.name}: 重定向动画缺 SkinnedMesh`);
  const mixer = new THREE.AnimationMixer(mixerRoot); const action = mixer.clipAction(clip);
  action.setLoop(THREE.LoopOnce, 1); action.clampWhenFinished = true; action.play();
  const count = Math.max(2, Math.ceil(clip.duration * SAMPLE_HZ));
  const samples = [];
  for (let index = 0; index <= count; index++) {
    const time = clip.duration * index / count; mixer.setTime(time); root.updateMatrixWorld(true);
    const l = left.getWorldPosition(new THREE.Vector3());
    const r = right.getWorldPosition(new THREE.Vector3());
    const h = hips.getWorldPosition(new THREE.Vector3());
    samples.push({ time, L: l, R: r, hips: h, side: l.y <= r.y ? 'L' : 'R' });
  }
  mixer.stopAllAction(); mixer.uncacheRoot(mixerRoot);
  return samples;
}

function rootMotion(samples, statureMu) {
  const first = samples[0].hips; const last = samples.at(-1).hips;
  const displacement = new THREE.Vector2(last.x - first.x, last.z - first.z);
  const duration = samples.at(-1).time - samples[0].time;
  return displacement.lengthSq() > 1e-12 ?
    displacement.length() / duration / statureMu : undefined;
}

function supportSlip(samples, statureMu, velocity = new THREE.Vector2()) {
  let phase; let slipMu = 0;
  for (const sample of samples) {
    const point = sample[sample.side];
    if (!phase || phase.side !== sample.side)
      phase = { side: sample.side, time: sample.time, point: point.clone() };
    const elapsed = sample.time - phase.time;
    slipMu = Math.max(slipMu, Math.hypot(point.x + velocity.x * elapsed - phase.point.x,
      point.z + velocity.y * elapsed - phase.point.z));
  }
  return slipMu * REFERENCE_HEIGHT_M / statureMu;
}

function footMotion(samples, statureMu) {
  const travel = new THREE.Vector2();
  for (let index = 1; index < samples.length; index++) {
    const before = samples[index - 1]; const after = samples[index];
    if (before.side !== after.side) continue;
    const a = before[before.side]; const b = after[after.side];
    const dx = b.x - a.x; const dz = b.z - a.z;
    travel.x -= dx; travel.y -= dz;
  }
  const duration = samples.at(-1).time - samples[0].time;
  if (!(duration > 0) || travel.lengthSq() <= 1e-12)
    throw new Error('完整周期没有可量出的支撑脚水平位移');
  const velocity = travel.multiplyScalar(1 / duration);
  return { hps: velocity.length() / statureMu, slipM: supportSlip(samples, statureMu, velocity) };
}

function motionFor(root, clips, label, statureMu) {
  const clip = clips.find(value => value.name.toLowerCase().includes(label));
  if (!clip || !(clip.duration > 0)) throw new Error(`缺 ${label} 完整周期动画`);
  const samples = sampleClip(root, clip);
  const rooted = rootMotion(samples, statureMu);
  if (rooted !== undefined) return { hps: rooted, slipM: supportSlip(samples, statureMu),
    clip: clip.name, duration: clip.duration };
  return { ...footMotion(samples, statureMu), clip: clip.name, duration: clip.duration };
}
function firstSkinned(root) {
  let found; root.traverse(node => { if (!found && node.isSkinnedMesh) found = node; }); return found;
}
function sameRig(leftRoot, rightRoot) {
  const left = firstSkinned(leftRoot)?.skeleton.bones;
  const right = firstSkinned(rightRoot)?.skeleton.bones;
  if (!left || !right || left.length !== right.length) return false;
  return left.every((bone, index) => normalize(bone.name) === normalize(right[index].name) &&
    bone.position.distanceTo(right[index].position) <= 1e-6 &&
    1 - Math.abs(bone.quaternion.dot(right[index].quaternion)) <= 1e-6 &&
    bone.scale.distanceTo(right[index].scale) <= 1e-6);
}
function retargetClips(targetRoot, sourceRoot, clips) {
  const target = firstSkinned(targetRoot); const source = firstSkinned(sourceRoot);
  if (!target || !source) return clips;
  const hip = source.skeleton.bones.find(bone =>
    ['mixamorighips', 'hips', 'pelvis'].includes(normalize(bone.name)))?.name;
  if (!hip) throw new Error('动画源缺 Hips / pelvis 骨骼');
  const rest = [...target.skeleton.bones, ...source.skeleton.bones].map(bone => ({
    bone, position: bone.position.clone(), quaternion: bone.quaternion.clone(), scale: bone.scale.clone(),
  }));
  try {
    return clips.map(clip => retargetClip(target, source, clip, {
      getBoneName: bone => bone.name, hip, hipInfluence: new THREE.Vector3(0, 1, 0),
      useFirstFramePosition: true,
    }));
  } finally {
    for (const item of rest) { item.bone.position.copy(item.position);
      item.bone.quaternion.copy(item.quaternion); item.bone.scale.copy(item.scale); }
    targetRoot.updateMatrixWorld(true); sourceRoot.updateMatrixWorld(true);
  }
}

export async function measure(modelPath, clipsPath = modelPath) {
  const model = await loadGlb(modelPath);
  const clipsModel = clipsPath === modelPath ? model : await loadGlb(clipsPath);
  const statureMu = stature(model.scene);
  const clips = clipsModel === model || sameRig(model.scene, clipsModel.scene) ?
    clipsModel.animations : retargetClips(model.scene, clipsModel.scene, clipsModel.animations);
  const walk = motionFor(model.scene, clips, 'walk', statureMu);
  const run = motionFor(model.scene, clips, 'run', statureMu);
  return { statureMu, nativeHps: { walk: walk.hps, run: run.hps },
    slipM: { walk: walk.slipM, run: run.slipM },
    clips: { walk: walk.clip, run: run.clip },
    durationSec: { walk: walk.duration, run: run.duration } };
}

export async function main(argv = process.argv.slice(2)) {
  if (argv.includes('-h') || argv.includes('--help')) {
    process.stdout.write('用法：node measure_gait.mjs <模型.glb> [--clips <动画.glb>]\n');
    return 0;
  }
  let model; let clips;
  for (let index = 0; index < argv.length; index++) {
    if (argv[index] === '--clips') clips = argv[++index];
    else if (argv[index].startsWith('-')) return fail(`未知参数：${argv[index]}`);
    else if (!model) model = argv[index]; else return fail('只能指定一个模型路径');
  }
  if (!model || (argv.includes('--clips') && !clips)) return fail('需要模型路径；用 --help 查看说明');
  try { process.stdout.write(`${JSON.stringify(await measure(model, clips))}\n`); return 0; }
  catch (error) { return fail(error instanceof Error ? error.message : String(error)); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  process.exitCode = await main();
