import { compareCodePoints } from '@tianshu/shared';
import {
  HEX_DIRECTIONS, hexAdd, hexCone, hexDisk, hexDistance, hexKey, hexLine, hexRing,
  type HexAim, type HexCoord, type HexDir,
} from '../../hex';

export type HexZoneInner =
  | { readonly tpl: 'aoe_ring' | 'aoe_disk'; readonly r: number }
  | { readonly tpl: 'aoe_line'; readonly n: number }
  | { readonly tpl: 'aoe_cone'; readonly r: number; readonly angle: 60 | 120; readonly dirCount: 6 | 12 };
export type HexPrimitiveShape =
  | { readonly tpl: 'aoe_single'; readonly includeEmpty?: boolean }
  | { readonly tpl: 'aoe_self' | 'aoe_around' }
  | { readonly tpl: 'aoe_ring' | 'aoe_disk' | 'aoe_spokes'; readonly r: number }
  | { readonly tpl: 'aoe_line'; readonly n: number }
  | { readonly tpl: 'aoe_cone'; readonly r: number; readonly angle: 60 | 120; readonly dirCount: 6 | 12 }
  | { readonly tpl: 'aoe_zone'; readonly inner: HexZoneInner; readonly duration: number };

export interface AreaResolveInput {
  readonly origin: HexCoord;
  readonly anchor: HexCoord;
  readonly aim?: HexAim;
  readonly available?: readonly HexCoord[];
}

function resolveUnclipped(shape: HexPrimitiveShape, input: AreaResolveInput): HexCoord[] {
  switch (shape.tpl) {
    case 'aoe_single': return [{ ...input.anchor }];
    case 'aoe_self': return [{ ...input.origin }];
    case 'aoe_around': return hexRing(input.origin, 1);
    case 'aoe_ring': return hexRing(input.anchor, shape.r);
    case 'aoe_disk': return hexDisk(input.anchor, shape.r);
    case 'aoe_spokes': {
      const result: HexCoord[] = [{ ...input.anchor }];
      for (let direction = 0; direction < 6; direction += 1) {
        result.push(...hexLine(input.anchor, direction as HexDir, shape.r));
      }
      return result.sort((left, right) => hexDistance(input.anchor, left) - hexDistance(input.anchor, right)
        || left.r - right.r || left.q - right.q);
    }
    case 'aoe_line': {
      if (input.aim === undefined || input.aim.dirCount !== 6) throw new RangeError('HEX_AIM_REQUIRED');
      return hexLine(input.origin, input.aim.dir, shape.n);
    }
    case 'aoe_cone': {
      if (input.aim === undefined || input.aim.dirCount !== shape.dirCount) {
        throw new RangeError('HEX_AIM_REQUIRED');
      }
      return hexCone(input.origin, shape.r, shape.angle, input.aim);
    }
    case 'aoe_zone': return resolveUnclipped(shape.inner, input);
  }
}

export function resolveAreaCells(shape: HexPrimitiveShape, input: AreaResolveInput): HexCoord[] {
  const cells = resolveUnclipped(shape, input);
  if (input.available === undefined) return cells;
  const allowed = new Set(input.available.map(hexKey));
  return cells.filter((cell) => allowed.has(hexKey(cell)));
}

export interface FormationSlot { readonly q: number; readonly r: number; readonly required: boolean }
export interface FormationMember { readonly unitId: string; readonly unitIndex: number; readonly pos: HexCoord }
export interface FormationMatch {
  readonly formed: boolean; readonly rotation: HexDir; readonly anchorUnitId: string | null;
  readonly memberIds: readonly string[]; readonly totalDeviation: number;
}

function rotate(value: HexCoord, count: number): HexCoord {
  let q = value.q; let r = value.r;
  for (let index = 0; index < count; index += 1) {
    const nextQ = -r; r = q + r; q = nextQ;
  }
  return { q, r };
}

export function matchFormation(slots: readonly FormationSlot[], members: readonly FormationMember[]): FormationMatch {
  const ordered = [...members].sort((left, right) => left.unitIndex - right.unitIndex
    || compareCodePoints(left.unitId, right.unitId));
  let best: FormationMatch = { formed: false, rotation: 0, anchorUnitId: null, memberIds: [],
    totalDeviation: Number.MAX_SAFE_INTEGER };
  for (const anchor of ordered) for (let rotation = 0; rotation < 6; rotation += 1) {
    const used = new Set<string>(); let deviation = 0; let valid = true;
    for (const slot of slots) {
      const expected = hexAdd(anchor.pos, rotate(slot, rotation));
      const candidate = ordered.find((member) => !used.has(member.unitId)
        && hexDistance(member.pos, expected) === 0);
      if (candidate === undefined && slot.required) { valid = false; break; }
      if (candidate !== undefined) used.add(candidate.unitId); else deviation += 1;
    }
    const ids = [...used].sort(compareCodePoints);
    if (valid && (deviation < best.totalDeviation || (deviation === best.totalDeviation
      && rotation < best.rotation))) best = { formed: true, rotation: rotation as HexDir,
      anchorUnitId: anchor.unitId, memberIds: ids, totalDeviation: deviation };
  }
  return best;
}

export function formationDirection(origin: HexCoord, direction: HexDir): HexCoord {
  return hexAdd(origin, HEX_DIRECTIONS[direction]);
}
