import { baseCourt } from './parts';
import type { CompoundDraft, LayoutContext } from './parts';

export function layoutResidence(context: LayoutContext): CompoundDraft {
  return baseCourt(context);
}
