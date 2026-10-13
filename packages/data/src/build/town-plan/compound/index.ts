import { layoutEscort } from './escort';
import { layoutManor } from './manor';
import { baseCourt } from './parts';
import type { CompoundDraft, LayoutContext } from './parts';
import { layoutResidence } from './residence';
import { layoutTemple } from './temple';
import { layoutWangfu } from './wangfu';
import { layoutXiyu } from './xiyu';
import { layoutYamen } from './yamen';
import { townPlanNotImplemented } from '../types';
import type { RectMm } from '../types';

export type { CompoundDraft, DraftPart, DraftRoom, LayoutContext } from './parts';
export {
  GATE_CLEAR_HEIGHT_MM,
  GATE_CLEAR_WIDTH_MM,
  GATEHOUSE_EAVE_MM,
  GATEHOUSE_RIDGE_MM,
  PART_ADOBE,
  PART_BRACKETS,
  PART_COPING,
  PART_ENTERABLE,
  PART_FRONT_PORCH,
  PART_GATE_OPENING,
  PART_SECOND_ENTRY,
  PART_STABLE,
  partBounds,
  partDoorWidthMm,
} from './parts';

export function layoutCompound(bounds: RectMm): CompoundDraft;
export function layoutCompound(layout: string, context: LayoutContext): CompoundDraft;
export function layoutCompound(layout: string | RectMm, context?: LayoutContext): CompoundDraft {
  if (typeof layout !== 'string' || context === undefined) {
    return townPlanNotImplemented('layoutCompound');
  }
  if (layout === 'hall_wing_gate') return layoutResidence(context);
  if (layout === 'yamen') return layoutYamen(context);
  if (layout === 'wangfu' || layout === 'palace') return layoutWangfu(context);
  if (layout === 'manor') return layoutManor(context);
  if (layout === 'escort' || layout === 'biaoju') return layoutEscort(context);
  if (layout === 'temple') return layoutTemple(context);
  if (layout === 'xiyu_inn') return layoutXiyu(context, true);
  if (layout === 'xiyu_court' || layout === 'xiyu_courtyard') return layoutXiyu(context, false);
  if (layout === 'xiyu_manor') return layoutXiyu(context, false);
  if (layout === 'xiyu_yamen') return layoutYamen(context);
  return baseCourt(context);
}
