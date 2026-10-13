import { PartKind } from '../types';
import { addPart, baseCourt, draftPart, hallBounds, yardBounds } from './parts';
import type { CompoundDraft, LayoutContext } from './parts';

export function layoutManor(context: LayoutContext): CompoundDraft {
  const draft = baseCourt(context, { forecourtGapMm: 900 });
  const hall = hallBounds(draft);
  const yard = yardBounds(draft);
  return addPart(
    draft,
    draftPart(PartKind.Gallery, [yard[0], hall[3] + 200, yard[2], hall[3] + 700], 0),
  );
}
