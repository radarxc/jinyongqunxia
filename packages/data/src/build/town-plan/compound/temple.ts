import { baseCourt, PART_BRACKETS } from './parts';
import type { CompoundDraft, LayoutContext } from './parts';

export function layoutTemple(context: LayoutContext): CompoundDraft {
  return baseCourt(context, {
    wings: 0,
    mainFacility: 'temple',
    hallFlags: PART_BRACKETS,
    forecourtGapMm: 1_200,
  });
}
