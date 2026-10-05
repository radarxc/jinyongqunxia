import { Bone, Group } from 'three';
import { describe, expect, it } from 'vitest';
import { detectPilotSkeleton, indexPilotNodes } from './mapping';

describe('pilot skeleton mapping', () => {
  it('detects the Mixamo names used by the Tripo delivery', () => {
    const root = new Group();
    for (const name of ['Hips', 'Spine2', 'Neck', 'Head', 'LeftArm', 'LeftForeArm', 'LeftHand', 'LeftUpLeg', 'LeftLeg', 'LeftFoot']) { const bone = new Bone(); bone.name = `mixamorig:${name}`; root.add(bone); }
    expect(detectPilotSkeleton(indexPilotNodes(root))).toBe('mixamo');
  });

  it('detects the UE alias table reused from clip_import.py', () => {
    const root = new Group();
    for (const name of ['pelvis', 'spine_03', 'neck_01', 'head', 'upperarm_l', 'lowerarm_l', 'hand_l', 'thigh_l', 'calf_l', 'foot_l']) { const bone = new Bone(); bone.name = name; root.add(bone); }
    expect(detectPilotSkeleton(indexPilotNodes(root))).toBe('ue');
  });
});
