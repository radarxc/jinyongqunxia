import { floorDivInt } from '@tianshu/shared';
import { PartKind } from '../types';
import { addPart, baseCourt, draftPart, partBounds, PART_FRONT_PORCH, yardBounds } from './parts';
import type { CompoundDraft, LayoutContext } from './parts';

export function layoutXiyu(context: LayoutContext, inn: boolean): CompoundDraft {
  const draft = baseCourt(context, {
    mainFacility: inn ? 'inn' : context.facility,
    forecourtGapMm: 1_100,
    hallSideGapMm: 1_500,
  });
  const hall = draft.parts.find((part) => part.kind === PartKind.Hall);
  if (hall === undefined) throw new TypeError('TOWN_PLAN_COMPOUND_HALL_MISSING');
  const hallRect = partBounds(hall);
  const hallFront = hall.yaw === 2 ? hallRect[1] : hallRect[3];
  const yard = yardBounds(draft);
  const galleryZ0 = hall.yaw === 2 ? hallFront - 700 : hallFront + 200;
  const galleryZ1 = hall.yaw === 2 ? hallFront - 200 : yard[1] - 200;
  const galleryX0 = hall.yaw === 2 ? yard[0] : yard[0] + 1_200;
  const galleryX1 = yard[2];
  const gallery = draftPart(
    PartKind.Gallery,
    [galleryX0, galleryZ0, galleryX1, galleryZ1],
    0,
    PART_FRONT_PORCH,
  );
  const withGallery = addPart(draft, gallery);
  const trellisWidth = yard[2] - yard[0] >= 3_600 ? 1_200 : 800;
  const trellisEnd = hall.yaw === 2 ? hallFront - 900 : yard[3];
  const trellisZ0 = yard[1] + (trellisEnd - yard[1] >= 1_000 ? 500 : 100);
  const trellis = draftPart(
    PartKind.Trellis,
    [yard[0], trellisZ0, yard[0] + trellisWidth, trellisEnd],
    0,
  );
  const parts = withGallery.parts.map((part) =>
    part.kind === PartKind.Yard
      ? draftPart(PartKind.Yard, [yard[0] + trellisWidth, yard[1], yard[2], trellisEnd], 0)
      : part,
  );
  const floors = [
    ...withGallery.floors,
    [
      floorDivInt(hall.cxMm * 2 - 1_800, 2),
      hallFront < yard[3] ? hallFront - 500 : yard[3] - 500,
      floorDivInt(hall.cxMm * 2 + 1_800, 2),
      hallFront < yard[3] ? yard[3] + 500 : hallFront + 500,
    ] as const,
  ];
  return addPart({ ...withGallery, parts, floors }, trellis);
}
