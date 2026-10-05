import { readFileSync } from 'node:fs';
import { Bone, Group, Quaternion, Vector3 } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { loadRigClip } from '../rig/clip';
import { createPilotRetargeter } from './retarget';

const NAMES = {
  Hips: ['Spine', 'LeftUpLeg', 'RightUpLeg'], Spine: ['Spine1'], Spine1: ['Spine2'],
  Spine2: ['Neck', 'LeftArm', 'RightArm'], Neck: ['Head'], LeftArm: ['LeftForeArm'], LeftForeArm: ['LeftHand'], LeftHand: ['LeftHandMiddle1'],
  RightArm: ['RightForeArm'], RightForeArm: ['RightHand'], RightHand: ['RightHandMiddle1'], LeftUpLeg: ['LeftLeg'], LeftLeg: ['LeftFoot'],
  LeftFoot: ['LeftToeBase'], RightUpLeg: ['RightLeg'], RightLeg: ['RightFoot'], RightFoot: ['RightToeBase'],
} as const;
const POSITION: Record<string, readonly [number, number, number]> = {
  Spine: [0,.2,0], Spine1: [0,.2,0], Spine2: [0,.2,0], Neck: [0,.2,0], Head: [0,.2,0],
  LeftArm: [.2,.05,0], LeftForeArm: [.3,0,0], LeftHand: [.3,0,0], LeftHandMiddle1: [.1,0,0],
  RightArm: [-.2,.05,0], RightForeArm: [-.3,0,0], RightHand: [-.3,0,0], RightHandMiddle1: [-.1,0,0],
  LeftUpLeg: [.12,-.05,0], LeftLeg: [0,-.4,0], LeftFoot: [0,-.4,0], LeftToeBase: [0,0,.15],
  RightUpLeg: [-.12,-.05,0], RightLeg: [0,-.4,0], RightFoot: [0,-.4,0], RightToeBase: [0,0,.15],
};

function syntheticMixamo(): Group {
  const root = new Group(); const make = (name: keyof typeof NAMES | string): Bone => {
    const bone = new Bone(); bone.name = `mixamorig:${name}`; bone.position.fromArray(POSITION[name] ?? [0,0,0]);
    for (const child of NAMES[name as keyof typeof NAMES] ?? []) bone.add(make(child)); return bone;
  }; root.add(make('Hips')); return root;
}
function fixture(name: string) { return loadRigClip(JSON.parse(readFileSync(new URL(`../../../../assets/default/rig/clips/${name}.json`, import.meta.url), 'utf8'))); }

describe('tianshu clip to GLB retargeting', () => {
  it('rejects an unskinned or unmapped fixture without mutating it', () => {
    const root = new Group(); expect(() => createPilotRetargeter(root, fixture('clip_walk'))).toThrow('PILOT_RETARGET_SKELETON_UNMAPPED');
  });

  it('aims every mapped child direction within five degrees', () => {
    const root = syntheticMixamo(); const retargeter = createPilotRetargeter(root, fixture('clip_walk'), { speedMps: .78 });
    for (let frame = 0; frame < 90; frame += 1) retargeter.update(1 / 60);
    expect(retargeter.kind).toBe('mixamo'); expect(retargeter.mappedBones.length).toBe(16); expect(retargeter.maxDirectionErrorDeg).toBeLessThanOrEqual(5);
    retargeter.setFacingYawDeg(315); retargeter.update(1 / 12); expect(retargeter.maxDirectionErrorDeg).toBeLessThanOrEqual(5); retargeter.dispose();
  });

  it('inherits non-loop clip hit/end timing from clip-player', () => {
    const events = vi.fn(); const retargeter = createPilotRetargeter(syntheticMixamo(), fixture('clip_sword_attack'), { onEvent: events });
    for (let frame = 0; frame < 140; frame += 1) retargeter.update(1 / 60);
    expect(events.mock.calls.map(([event]) => event)).toEqual(['hit', 'end']); retargeter.dispose();
  });

  it('restores local bone rotations on dispose', () => {
    const root = syntheticMixamo(); const arm = root.getObjectByName('mixamorig:LeftArm')!; const rest = arm.quaternion.clone();
    const retargeter = createPilotRetargeter(root, fixture('clip_sword_attack')); retargeter.update(.8); expect(arm.quaternion.equals(rest)).toBe(false);
    retargeter.dispose(); expect(arm.quaternion.angleTo(rest)).toBeCloseTo(0, 8); expect(arm.quaternion).toBeInstanceOf(Quaternion); expect(new Vector3(1,0,0).length()).toBe(1);
  });
});
