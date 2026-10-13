import { floorDivInt } from '@tianshu/shared';
import { PartKind } from '../types';
import {
  baseCourt,
  draftPart,
  flagsWithDoorWidth,
  floorsThroughGate,
  hallBounds,
  PART_BRACKETS,
  PART_GATE_OPENING,
  PART_SECOND_ENTRY,
  partBounds,
  yardBounds,
} from './parts';
import type { CompoundDraft, LayoutContext } from './parts';

export function layoutWangfu(context: LayoutContext): CompoundDraft {
  const draft = baseCourt(context, { hallFlags: PART_BRACKETS, forecourtGapMm: 1_200 });
  const hall = hallBounds(draft);
  const yard = yardBounds(draft);
  const entryZ = context.southHall ? hall[1] - 2_600 : hall[3] + 600;
  const secondGate = draftPart(
    PartKind.Gatehouse,
    [yard[0] + 900, entryZ, yard[2] - 900, entryZ + 800],
    0,
    flagsWithDoorWidth(PART_SECOND_ENTRY | PART_GATE_OPENING, 1_600),
  );
  const gateBoundsZ = floorDivInt(secondGate.czMm * 2 + secondGate.dMm, 2);
  const gateBoundsBack = floorDivInt(secondGate.czMm * 2 - secondGate.dMm, 2);
  const screen = draft.parts.find((part) => part.kind === PartKind.ScreenWall);
  const screenEnd = screen === undefined ? gateBoundsZ : partBounds(screen)[3];
  const firstYard = context.southHall
    ? draftPart(PartKind.Yard, [yard[0], yard[1], yard[2], gateBoundsBack], 0)
    : draftPart(PartKind.Yard, [yard[0], gateBoundsZ, yard[2], yard[3]], 0);
  const secondYard = context.southHall
    ? draftPart(PartKind.Yard, [yard[0], screenEnd, yard[2], hall[1] - 100], 0)
    : draftPart(PartKind.Yard, [yard[0], hall[3] + 100, yard[2], gateBoundsBack], 0);
  const parts = draft.parts
    .filter((part) => part.kind !== PartKind.Yard)
    .concat(firstYard, secondYard, secondGate);
  return { ...draft, parts, floors: floorsThroughGate(draft.floors, secondGate, 1_600) };
}
