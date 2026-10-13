import { floorDivInt } from '@tianshu/shared';
import { PartKind } from '../types';
import { baseCourt, draftPart, hallBounds, PART_STABLE, yardBounds } from './parts';
import type { CompoundDraft, LayoutContext } from './parts';

export function layoutEscort(context: LayoutContext): CompoundDraft {
  const draft = baseCourt(context, { wings: 2, mainFacility: 'escort' });
  let stableIndex = -1;
  const parts = draft.parts.map((part, index) => {
    if (part.kind !== PartKind.Wing || part.yaw !== 1) return part;
    stableIndex = index;
    return { ...part, flags: part.flags | PART_STABLE };
  });
  const rooms = draft.rooms.map((room) =>
    room.partIndex === stableIndex
      ? { ...room, facility: 'stable' as const, doorWidthMm: 1_500 }
      : room,
  );
  const hall = hallBounds(draft);
  const yard = yardBounds(draft);
  const splitZ = hall[3] + floorDivInt(yard[3] - hall[3], 2);
  const yards = [
    draftPart(PartKind.Yard, [yard[0], splitZ + 200, yard[2], yard[3]], 0),
    draftPart(PartKind.Yard, [yard[0], hall[3] + 200, yard[2], splitZ - 200], 0),
  ];
  return {
    ...draft,
    parts: parts.filter((part) => part.kind !== PartKind.Yard).concat(yards),
    rooms,
  };
}
