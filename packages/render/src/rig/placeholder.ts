import type { RigManifest, RigManifestPart, RigSourcePart, RigView, TintSlot } from './types';
import { RIG_SOURCE_PARTS, RIG_VIEWS } from './types';

interface PartTemplate {
  readonly size: readonly [number, number];
  readonly pivot: readonly [number, number];
  readonly child: Readonly<Record<string, readonly [number, number]>>;
  readonly tint: TintSlot;
}

const TEMPLATE: Record<RigSourcePart, PartTemplate> = {
  head: { size: [96, 80], pivot: [48, 70], child: { crown: [48, 9] }, tint: false },
  hair_or_headgear: { size: [112, 80], pivot: [56, 72], child: { crown: [56, 8] }, tint: 'hair' },
  torso: { size: [132, 154], pivot: [66, 142], child: { neck: [66, 9], shoulder_L: [18, 30], shoulder_R: [114, 30] }, tint: 'clothPrimary' },
  pelvis_skirt: { size: [146, 92], pivot: [73, 8], child: { hip_L: [46, 8], hip_R: [100, 8], hem: [73, 80] }, tint: 'clothSecondary' },
  upper_arm_L: { size: [58, 92], pivot: [29, 8], child: { elbow_L: [29, 85] }, tint: 'clothPrimary' },
  upper_arm_R: { size: [58, 92], pivot: [29, 8], child: { elbow_R: [29, 85] }, tint: 'clothPrimary' },
  forearm_L: { size: [52, 82], pivot: [26, 8], child: { wrist_L: [26, 75] }, tint: 'clothSecondary' },
  forearm_R: { size: [52, 82], pivot: [26, 8], child: { wrist_R: [26, 75] }, tint: 'clothSecondary' },
  hand_L: { size: [40, 62], pivot: [20, 6], child: { grip_L: [20, 33] }, tint: false },
  hand_R: { size: [40, 62], pivot: [20, 6], child: { grip_R: [20, 33] }, tint: false },
  thigh_shared: { size: [64, 128], pivot: [32, 8], child: { knee: [32, 121] }, tint: 'clothSecondary' },
  shin_shared: { size: [58, 116], pivot: [29, 7], child: { ankle: [29, 109] }, tint: 'clothSecondary' },
  foot_shared: { size: [96, 68], pivot: [48, 8], child: { toe: [90, 57] }, tint: 'footwear' },
};

const FRONT_Z = [8, 9, 6, 7, 0, 13, 1, 14, 2, 15, 3, 4, 5] as const;
const BACK_Z = [8, 12, 7, 6, 1, 13, 0, 14, 2, 15, 3, 4, 5] as const;
const SIDE_Z = [8, 9, 7, 6, 0, 13, 1, 14, 2, 15, 3, 4, 5] as const;

function makePart(view: RigView, id: RigSourcePart, index: number): RigManifestPart {
  const template = TEMPLATE[id];
  const z = view === 'front34' ? FRONT_Z[index] : view === 'back34' ? BACK_Z[index] : SIDE_Z[index];
  return {
    id, view, file: `${view}/${id}.png`, size: template.size, pivot: template.pivot,
    childJoint: template.child, restAngle: id.startsWith('forearm_') ? -90 : 0,
    zOrder: z ?? 0, tintable: template.tint, placeholder: true,
  };
}

export function createPlaceholderRigManifest(set = 'male_std'): RigManifest {
  const parts: RigManifestPart[] = [];
  for (const view of RIG_VIEWS) {
    for (let index = 0; index < RIG_SOURCE_PARTS.length; index += 1) {
      const id = RIG_SOURCE_PARTS[index];
      if (id) parts.push(makePart(view, id, index));
    }
  }
  return {
    schema: 'tianshu-rig.v1', set, ppm: 256, heightM: 1.7, views: RIG_VIEWS,
    palette: { clothPrimary: '#6b5141', clothSecondary: '#394c53', skin: '#e9cfb4', footwear: '#332820', hair: '#241b18' },
    parts,
  };
}
