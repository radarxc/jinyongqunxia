import * as os from 'node:os';
import {
  AnimationClip, Bone, BufferGeometry, Float32BufferAttribute, Group, Matrix4, Mesh,
  MeshBasicMaterial, QuaternionKeyframeTrack, Skeleton, SkinnedMesh, Uint16BufferAttribute,
} from 'three';
import type { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDressupActor } from './actor';
import { clearDressupSkeletonFrameCache } from './skeleton-frame';
import type { DressupActor, DressupEquipSpec, DressupSkeletonFrame } from './types';

const ACTORS = 100;
const EQUIPMENT_PER_ACTOR = 4;
const WARMUP_FRAMES = 120;
const SAMPLE_FRAMES = 600;
const MEASUREMENT_ROUNDS = 3;
const LIMIT_MS = 2;

function geometry(skinned: boolean, region = false): BufferGeometry {
  const value = new BufferGeometry();
  value.setAttribute('position', new Float32BufferAttribute([
    -.1, 0, 0, .1, 0, 0, -.1, .2, 0, .1, .2, 0,
  ], 3));
  value.setIndex([0, 1, 2, 2, 1, 3]);
  if (skinned) {
    value.setAttribute('skinIndex', new Uint16BufferAttribute([
      0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
    ], 4));
    value.setAttribute('skinWeight', new Float32BufferAttribute([
      1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0,
    ], 4));
  }
  if (region) value.setAttribute('_region', new Float32BufferAttribute([0, 0, 0, 0], 1));
  return value;
}

function bones(): { root: Bone; hand: Bone; skeleton: Skeleton } {
  const root = new Bone(); root.name = 'Hips';
  const hand = new Bone(); hand.name = 'RightHand'; hand.position.y = 1; root.add(hand);
  root.updateMatrixWorld(true);
  return { root, hand, skeleton: new Skeleton([root, hand], [new Matrix4(), new Matrix4()]) };
}

function bodyGltf(): GLTF {
  const rig = bones();
  const mesh = new SkinnedMesh(geometry(true, true), new MeshBasicMaterial());
  mesh.bind(rig.skeleton, new Matrix4());
  const scene = new Group(); scene.add(rig.root, mesh);
  const clip = new AnimationClip('walk', 1, [new QuaternionKeyframeTrack(
    'RightHand.quaternion', [0, .5, 1],
    [0, 0, 0, 1, 0, .19509, 0, .980785, 0, 0, 0, 1],
  )]);
  return { scene, scenes: [scene], animations: [clip], cameras: [], asset: {} } as unknown as GLTF;
}

function equipmentGltf(kind: DressupEquipSpec['kind']): GLTF {
  const scene = new Group();
  if (kind === 'prop') scene.add(new Mesh(geometry(false), new MeshBasicMaterial()));
  else {
    const rig = bones(); const mesh = new SkinnedMesh(geometry(true), new MeshBasicMaterial());
    mesh.bind(rig.skeleton, new Matrix4()); scene.add(rig.root, mesh);
  }
  return { scene, scenes: [scene], animations: [], cameras: [], asset: {} } as unknown as GLTF;
}

function loader(): GLTFLoader {
  return { loadAsync: async (url: string) => url === 'body' ? bodyGltf()
    : equipmentGltf(url.startsWith('prop') ? 'prop' : 'garment') } as unknown as GLTFLoader;
}

function frame(): DressupSkeletonFrame {
  return {
    schema: 'tianshu-dressup-skeleton.v1', source: { file: 'body.glb', sha256: 'perf' },
    unit: 'mu', heightMu: 1, defaultHeightM: 1.66, mPerMu: 1.66,
    joints: ['Hips', 'RightHand'], parents: [-1, 0],
    bindWorld: { Hips: new Array(16).fill(0), RightHand: new Array(16).fill(0) },
    restPose: { armAngleDeg: 25, forearmAngleDeg: 25 },
    measures: { headWidthMu: .1, headDepthMu: .1, headCircumferenceMu: .3,
      headTopMu: [0, 1, 0], shoulderSkinWidthMu: .2, chestWidthMu: .2, waistWidthMu: .15,
      hipWidthMu: .18, handLengthMu: { L: .1, R: .1 }, handThicknessMu: { L: .02, R: .02 },
      footLengthMu: .12 },
    neckRing: { localYMu: 0, centerMu: [0, 0, 0], radiusMu: { x: .03, z: .03 },
      samples: 0, profile: [], lipOffsetMu: 0, sha256: 'ring' },
    skullProfile: { file: 'skull.json', stepMu: .005, sha256: 'skull' },
    sockets: { gripR: { bone: 'RightHand', pos: [0, .1, 0], quat: [0, 0, 0, 1] } },
    regions: { ids: { torso: 0 }, jointToRegion: {}, file: 'regions.npy' },
    fingerPose: { fist: {} },
  };
}

async function setup(): Promise<DressupActor[]> {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(frame()))));
  const actors = await Promise.all(Array.from({ length: ACTORS }, async (_, actorIndex) => {
    const actor = await createDressupActor({
      bodyUrl: 'body', frameUrl: 'frame', heightM: 1.66, loader: loader(),
    });
    const specs: DressupEquipSpec[] = Array.from({ length: EQUIPMENT_PER_ACTOR },
      (_, equipmentIndex) => {
        const prop = equipmentIndex === EQUIPMENT_PER_ACTOR - 1;
        return {
          kind: prop ? 'prop' : 'garment',
          id: `actor-${actorIndex}-equipment-${equipmentIndex}`,
          url: prop ? `prop-${actorIndex}` : `garment-${actorIndex}-${equipmentIndex}`,
          fit: { schema: 'tianshu-dressup-fit.v1', kind: prop ? 'prop' : 'garment',
            id: `equipment-${equipmentIndex}`, ...(prop ? { socket: 'gripR' } : {}) },
        };
      });
    await Promise.all(specs.map(spec => actor.equip(spec)));
    actor.playClip('walk', 0);
    return actor;
  }));
  return actors;
}

function percentile95(samples: Float64Array): number {
  samples.sort();
  return samples[Math.floor(samples.length * .95)] ?? 0;
}

function measureRound(actors: readonly DressupActor[]): number {
  const samples = new Float64Array(SAMPLE_FRAMES);
  for (let frameIndex = 0; frameIndex < SAMPLE_FRAMES; frameIndex += 1) {
    const started = performance.now();
    for (const actor of actors) { actor.update(1 / 60); actor.skeleton.update(); }
    samples[frameIndex] = performance.now() - started;
  }
  return percentile95(samples);
}

function formatLoad(loadAverage: readonly number[]): string {
  return loadAverage.map(value => value.toFixed(2)).join('/');
}

afterEach(() => { clearDressupSkeletonFrameCache(); vi.unstubAllGlobals(); });

describe('dressup CPU performance', () => {
  it('keeps 100 actors with four equipped meshes below the CPU P95 gate', async () => {
    const actors = await setup();
    try {
      for (let frameIndex = 0; frameIndex < WARMUP_FRAMES; frameIndex += 1) {
        for (const actor of actors) { actor.update(1 / 60); actor.skeleton.update(); }
      }
      const cpuCount = os.cpus().length; const rounds: number[] = []; const loads: number[][] = [];
      for (let round = 0; round < MEASUREMENT_ROUNDS; round += 1) {
        rounds.push(measureRound(actors)); loads.push(os.loadavg());
      }
      const best = Math.min(...rounds);
      for (let round = 0; round < rounds.length; round += 1) {
        console.info(`[dressup-perf] 100 actors / 400 equipment round ${round + 1}/${MEASUREMENT_ROUNDS}: ` +
          `P95 ${rounds[round]!.toFixed(3)} ms; min P95 ${best.toFixed(3)} ms; ` +
          `loadavg ${formatLoad(loads[round]!)}; cpus ${cpuCount}`);
      }
      expect(actors).toHaveLength(ACTORS);
      expect(actors.every(actor => actor.stats().drawCalls === 1 + EQUIPMENT_PER_ACTOR)).toBe(true);
      expect(best, `[dressup-perf] min P95 ${best.toFixed(3)} ms; round P95s ` +
        `${rounds.map(value => value.toFixed(3)).join('/')}; loadavg ` +
        `${loads.map(formatLoad).join(', ')}; cpus ${cpuCount}`).toBeLessThan(LIMIT_MS);
    } finally {
      for (const actor of actors) actor.dispose();
    }
  }, 120_000);
});
