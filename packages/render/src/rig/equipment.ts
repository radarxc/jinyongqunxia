import type { EquipmentAsset, EquipmentRef, EquipmentVisuals, RigPart, RigView } from './types';

export type AttachmentKind = 'weapon_R' | 'weapon_L' | 'pauldron_L' | 'pauldron_R' | 'cape';
export interface PartLayer { readonly part: RigPart; readonly itemId: string; readonly tint: number }
export interface AttachmentLayer {
  readonly kind: AttachmentKind; readonly itemId: string; readonly parent: RigPart;
  readonly zOrder: number; readonly tint: number; readonly placeholder: true;
}
export interface EquipmentAssembly {
  readonly replacements: readonly PartLayer[];
  readonly attachments: readonly AttachmentLayer[];
  readonly composites: readonly PartLayer[];
}

const BODY_PARTS: readonly RigPart[] = [
  'torso', 'pelvis_skirt', 'upper_arm_L', 'upper_arm_R', 'forearm_L', 'forearm_R',
  'thigh_L', 'thigh_R', 'shin_L', 'shin_R',
];

function asset(ref: EquipmentRef | undefined): EquipmentAsset | undefined {
  return typeof ref === 'string' ? { id: ref } : ref;
}

export function equipmentId(ref: EquipmentRef | undefined): string | undefined {
  return asset(ref)?.id;
}

export function tintForEquipment(ref: EquipmentRef | undefined): number {
  const item = asset(ref);
  if (!item) return 0xffff;
  if (typeof item.tint === 'number') return item.tint & 0xffff;
  if (typeof item.tint === 'string' && /^#[0-9a-f]{6}$/i.test(item.tint)) {
    const rgb = Number.parseInt(item.tint.slice(1), 16);
    return (((rgb >>> 19) & 0x1f) << 11) | (((rgb >>> 10) & 0x3f) << 5) | ((rgb >>> 3) & 0x1f);
  }
  let hash = 2166136261;
  for (let index = 0; index < item.id.length; index += 1) hash = Math.imul(hash ^ item.id.charCodeAt(index), 16777619);
  return 0x4208 | ((hash >>> 8) & 0xbdef);
}

function replacement(parts: readonly RigPart[], ref: EquipmentRef | undefined, target: PartLayer[]): void {
  const id = equipmentId(ref);
  if (!id) return;
  const tint = tintForEquipment(ref);
  for (const part of parts) target.push({ part, itemId: id, tint });
}

function attachment(kind: AttachmentKind, ref: EquipmentRef, view: RigView, mirrored: boolean, isNear = false): AttachmentLayer {
  const nearRight = kind.endsWith('_R');
  const capeZ = view === 'back34' ? 11.5 : -2;
  const parent: RigPart = kind.startsWith('weapon') ? (nearRight ? 'hand_R' : 'hand_L')
    : kind === 'cape' ? 'torso' : nearRight ? 'upper_arm_R' : 'upper_arm_L';
  const handIsNear = mirrored ? !nearRight : nearRight;
  const zOrder = kind === 'cape' ? capeZ : kind.startsWith('weapon') ? (handIsNear ? 15.25 : 1.75)
    : isNear ? 13.35 : (view === 'front34' ? 5.85 : 6.85);
  return { kind, itemId: equipmentId(ref) ?? 'missing', parent, zOrder, tint: tintForEquipment(ref), placeholder: true };
}

export function assembleEquipment(equipment: EquipmentVisuals, view: RigView, mirrored = false): EquipmentAssembly {
  const replacements: PartLayer[] = [];
  const composites: PartLayer[] = [];
  replacement(BODY_PARTS, equipment.body, replacements);
  replacement(['hair_or_headgear'], equipment.head, replacements);
  replacement(['hand_L', 'hand_R'], equipment.hands, replacements);
  replacement(['foot_L', 'foot_R'], equipment.feet, replacements);
  replacement(['pelvis_skirt'], equipment.waist, composites);
  const accessory = asset(equipment.accessory);
  if (accessory?.visibleHolster) replacement(['pelvis_skirt'], accessory, composites);

  const requested: AttachmentLayer[] = [];
  const main = asset(equipment.mainHand);
  if (main) requested.push(attachment('weapon_R', main, view, mirrored));
  const off = asset(equipment.offHand);
  if (off || main?.hands === 'pair' || main?.hands === 2) requested.push(attachment('weapon_L', off ?? main!, view, mirrored));
  const shoulder = asset(equipment.shoulder);
  const near = mirrored ? 'pauldron_L' : 'pauldron_R';
  const far = mirrored ? 'pauldron_R' : 'pauldron_L';
  if (shoulder) requested.push(attachment(near, shoulder, view, mirrored, true));
  if (equipment.cape) requested.push(attachment('cape', equipment.cape, view, mirrored));
  if (shoulder) requested.push(attachment(far, shoulder, view, mirrored));

  const attachments = requested.slice(0, 4);
  for (let index = 4; index < requested.length; index += 1) {
    const layer = requested[index];
    if (layer) composites.push({ part: layer.parent, itemId: layer.itemId, tint: layer.tint });
  }
  return { replacements, attachments, composites };
}

export function equipmentEquals(left: EquipmentVisuals, right: EquipmentVisuals): boolean {
  const keys = ['mainHand', 'offHand', 'head', 'body', 'innerBody', 'hands', 'shoulder', 'cape', 'waist', 'feet', 'accessory'] as const;
  return keys.every((key) => {
    const a = asset(left[key]); const b = asset(right[key]);
    return a?.id === b?.id && a?.tint === b?.tint && a?.hands === b?.hands
      && a?.heavy === b?.heavy && a?.visibleHolster === b?.visibleHolster;
  });
}

export function weightClassForEquipment(equipment: EquipmentVisuals): 'light' | 'medium' | 'heavy' {
  const weaponHeavy = asset(equipment.mainHand)?.heavy || asset(equipment.offHand)?.heavy;
  const body = asset(equipment.body);
  if (weaponHeavy || body?.heavy) return 'heavy';
  return body ? 'medium' : 'light';
}
