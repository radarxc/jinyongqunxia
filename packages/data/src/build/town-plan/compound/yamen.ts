import { PartKind } from '../types';
import {
  addPart,
  baseCourt,
  draftPart,
  flagsWithDoorWidth,
  floorsThroughGate,
  hallBounds,
  PART_GATE_OPENING,
  PART_SECOND_ENTRY,
  yardBounds,
} from './parts';
import type { CompoundDraft, LayoutContext } from './parts';

export function layoutYamen(context: LayoutContext): CompoundDraft {
  const draft = baseCourt(context, { mainFacility: 'office', hallFlags: 4, forecourtGapMm: 1_200 });
  const hall = hallBounds(draft);
  const yard = yardBounds(draft);
  const instrument = draftPart(
    PartKind.Gatehouse,
    [yard[0] + 600, hall[3] + 200, yard[2] - 600, yard[1] - 200],
    0,
    flagsWithDoorWidth(PART_SECOND_ENTRY | PART_GATE_OPENING, 1_600),
  );
  const withGate = addPart(draft, instrument);
  return { ...withGate, floors: floorsThroughGate(withGate.floors, instrument, 1_600) };
}
