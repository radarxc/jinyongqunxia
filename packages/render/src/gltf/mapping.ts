import type { Object3D } from 'three';

export type PilotSkeletonKind = 'mixamo' | 'ue';
export interface PilotBoneNames { readonly driver: readonly string[]; readonly start?: readonly string[]; readonly end: readonly string[] }

export const MIXAMO_JOINT_NAMES = {
  pelvis: ['mixamorig:Hips'], chest: ['mixamorig:Spine2', 'mixamorig:Spine1'], neck: ['mixamorig:Neck'], head: ['mixamorig:Head'],
  shoulder_L: ['mixamorig:LeftArm'], elbow_L: ['mixamorig:LeftForeArm'], wrist_L: ['mixamorig:LeftHand'], grip_L: ['mixamorig:LeftHandMiddle1'],
  shoulder_R: ['mixamorig:RightArm'], elbow_R: ['mixamorig:RightForeArm'], wrist_R: ['mixamorig:RightHand'], grip_R: ['mixamorig:RightHandMiddle1'],
  hip_L: ['mixamorig:LeftUpLeg'], knee_L: ['mixamorig:LeftLeg'], ankle_L: ['mixamorig:LeftFoot'], toe_L: ['mixamorig:LeftToeBase'],
  hip_R: ['mixamorig:RightUpLeg'], knee_R: ['mixamorig:RightLeg'], ankle_R: ['mixamorig:RightFoot'], toe_R: ['mixamorig:RightToeBase'],
} as const;

export const UE_JOINT_NAMES = {
  pelvis: ['pelvis'], chest: ['spine_03', 'spine_02'], neck: ['neck_01'], head: ['head', 'Head'],
  shoulder_L: ['upperarm_l'], elbow_L: ['lowerarm_l'], wrist_L: ['hand_l'], grip_L: ['middle_01_l'],
  shoulder_R: ['upperarm_r'], elbow_R: ['lowerarm_r'], wrist_R: ['hand_r'], grip_R: ['middle_01_r'],
  hip_L: ['thigh_l'], knee_L: ['calf_l'], ankle_L: ['foot_l'], toe_L: ['ball_l'],
  hip_R: ['thigh_r'], knee_R: ['calf_r'], ankle_R: ['foot_r'], toe_R: ['ball_r'],
} as const;

export const PILOT_AIM_BONES: Readonly<Record<PilotSkeletonKind, Readonly<Record<string, PilotBoneNames>>>> = {
  mixamo: {
    hip_span: { driver: ['mixamorig:Hips'], start: MIXAMO_JOINT_NAMES.hip_L, end: MIXAMO_JOINT_NAMES.hip_R },
    torso: { driver: ['mixamorig:Spine'], end: ['mixamorig:Spine1'] },
    shoulder_span: { driver: ['mixamorig:Spine2'], start: MIXAMO_JOINT_NAMES.shoulder_L, end: MIXAMO_JOINT_NAMES.shoulder_R },
    head: { driver: ['mixamorig:Neck'], end: ['mixamorig:Head'] },
    upper_arm_L: { driver: MIXAMO_JOINT_NAMES.shoulder_L, end: MIXAMO_JOINT_NAMES.elbow_L }, upper_arm_R: { driver: MIXAMO_JOINT_NAMES.shoulder_R, end: MIXAMO_JOINT_NAMES.elbow_R },
    forearm_L: { driver: MIXAMO_JOINT_NAMES.elbow_L, end: MIXAMO_JOINT_NAMES.wrist_L }, forearm_R: { driver: MIXAMO_JOINT_NAMES.elbow_R, end: MIXAMO_JOINT_NAMES.wrist_R },
    hand_L: { driver: MIXAMO_JOINT_NAMES.wrist_L, end: MIXAMO_JOINT_NAMES.grip_L }, hand_R: { driver: MIXAMO_JOINT_NAMES.wrist_R, end: MIXAMO_JOINT_NAMES.grip_R },
    thigh_L: { driver: MIXAMO_JOINT_NAMES.hip_L, end: MIXAMO_JOINT_NAMES.knee_L }, thigh_R: { driver: MIXAMO_JOINT_NAMES.hip_R, end: MIXAMO_JOINT_NAMES.knee_R },
    shin_L: { driver: MIXAMO_JOINT_NAMES.knee_L, end: MIXAMO_JOINT_NAMES.ankle_L }, shin_R: { driver: MIXAMO_JOINT_NAMES.knee_R, end: MIXAMO_JOINT_NAMES.ankle_R },
    foot_L: { driver: MIXAMO_JOINT_NAMES.ankle_L, end: MIXAMO_JOINT_NAMES.toe_L }, foot_R: { driver: MIXAMO_JOINT_NAMES.ankle_R, end: MIXAMO_JOINT_NAMES.toe_R },
  },
  ue: {
    hip_span: { driver: UE_JOINT_NAMES.pelvis, start: UE_JOINT_NAMES.hip_L, end: UE_JOINT_NAMES.hip_R },
    torso: { driver: ['spine_01'], end: ['spine_02', 'spine_03'] },
    shoulder_span: { driver: UE_JOINT_NAMES.chest, start: UE_JOINT_NAMES.shoulder_L, end: UE_JOINT_NAMES.shoulder_R },
    head: { driver: UE_JOINT_NAMES.neck, end: UE_JOINT_NAMES.head },
    upper_arm_L: { driver: UE_JOINT_NAMES.shoulder_L, end: UE_JOINT_NAMES.elbow_L }, upper_arm_R: { driver: UE_JOINT_NAMES.shoulder_R, end: UE_JOINT_NAMES.elbow_R },
    forearm_L: { driver: UE_JOINT_NAMES.elbow_L, end: UE_JOINT_NAMES.wrist_L }, forearm_R: { driver: UE_JOINT_NAMES.elbow_R, end: UE_JOINT_NAMES.wrist_R },
    hand_L: { driver: UE_JOINT_NAMES.wrist_L, end: UE_JOINT_NAMES.grip_L }, hand_R: { driver: UE_JOINT_NAMES.wrist_R, end: UE_JOINT_NAMES.grip_R },
    thigh_L: { driver: UE_JOINT_NAMES.hip_L, end: UE_JOINT_NAMES.knee_L }, thigh_R: { driver: UE_JOINT_NAMES.hip_R, end: UE_JOINT_NAMES.knee_R },
    shin_L: { driver: UE_JOINT_NAMES.knee_L, end: UE_JOINT_NAMES.ankle_L }, shin_R: { driver: UE_JOINT_NAMES.knee_R, end: UE_JOINT_NAMES.ankle_R },
    foot_L: { driver: UE_JOINT_NAMES.ankle_L, end: UE_JOINT_NAMES.toe_L }, foot_R: { driver: UE_JOINT_NAMES.ankle_R, end: UE_JOINT_NAMES.toe_R },
  },
};

export function indexPilotNodes(root: Object3D): ReadonlyMap<string, Object3D> {
  const nodes = new Map<string, Object3D>(); root.traverse(node => { if (node.name && !nodes.has(node.name)) nodes.set(node.name, node); }); return nodes;
}
export function detectPilotSkeleton(nodes: ReadonlyMap<string, Object3D>): PilotSkeletonKind | undefined {
  const mixamo = Object.values(MIXAMO_JOINT_NAMES).filter(names => names.some(name => nodes.has(name))).length;
  const ue = Object.values(UE_JOINT_NAMES).filter(names => names.some(name => nodes.has(name))).length;
  return Math.max(mixamo, ue) < 8 ? undefined : mixamo >= ue ? 'mixamo' : 'ue';
}
