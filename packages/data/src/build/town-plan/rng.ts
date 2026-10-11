export const SALT = {
  variant: 0x6d2b_79f5,
  interior: 0x1b56_c4e9,
  props: 0x85eb_ca6b,
  visual: 0xc2b2_ae35,
} as const;

export function fnv1a32(text: string): number {
  let hash = 0x811c_9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x0100_0193);
  }
  return hash >>> 0;
}

export function splitmix32(seed: number): number {
  let value = (seed + 0x9e37_79b9) | 0;
  value = Math.imul(value ^ value >>> 16, 0x21f0_aaad);
  value = Math.imul(value ^ value >>> 15, 0x735a_2d97);
  return (value ^ value >>> 15) >>> 0;
}

export function seedFor(sceneId: string, buildingId: string): number {
  return fnv1a32(`${sceneId}/${buildingId}`);
}
