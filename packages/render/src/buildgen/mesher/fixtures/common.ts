import { board, cylinder, legs, post, propContext, shelfStack, solid } from './dsl';
import { PROP_LAYER, type PropRecipe } from './types';

export function tableRecipe(layer: number = PROP_LAYER.woodFurniture): PropRecipe {
  return (w, d, h, variant, lod, sink) => {
    const context = propContext(sink.writer, sink.placement);
    const top = Math.max(45, Math.round(h / 12));
    board(context, [0, h - top / 2, 0], [w, top, d], { layer });
    const inset = lod === 0 ? 70 + (variant & 1) * 20 : Math.min(w, d) / 2;
    const legW = Math.max(45, Math.round(Math.min(w, d) / 10));
    if (lod === 0)
      legs(
        context,
        Math.max(legW, w - inset * 2),
        Math.max(legW, d - inset * 2),
        0,
        h - top,
        legW,
        { layer },
      );
    else post(context, 0, 0, 0, h - top, legW, { layer });
  };
}

export const stoolRecipe: PropRecipe = (w, d, h, variant, lod, sink) => {
  const context = propContext(sink.writer, sink.placement);
  if (lod === 1) {
    solid(context, [0, h / 2, 0], [w, h, d]);
    return;
  }
  const seat = Math.max(35, Math.round(h / 10));
  board(context, [0, h - seat / 2, 0], [w, seat, d]);
  post(context, 0, 0, 0, h - seat, 45 + (variant & 1) * 5);
};

export const crateRecipe: PropRecipe = (w, d, h, variant, lod, sink) => {
  const context = propContext(sink.writer, sink.placement);
  solid(context, [0, h / 2, 0], [w, h, d], {
    layer: variant & 1 ? PROP_LAYER.woodRough : PROP_LAYER.woodFurniture,
  });
  if (lod === 0 && w > 650)
    board(context, [0, h * 0.65, -d / 2 + 12], [w * 0.7, 35, 24], { layer: PROP_LAYER.woodRough });
};

export const cabinetRecipe: PropRecipe = (w, d, h, variant, lod, sink) => {
  const context = propContext(sink.writer, sink.placement);
  const frame = lod === 0 ? 55 : 80;
  board(context, [0, frame / 2, 0], [w, frame, d]);
  board(context, [0, h - frame / 2, 0], [w, frame, d]);
  board(context, [-w / 2 + frame / 2, h / 2, 0], [frame, h, d]);
  board(context, [w / 2 - frame / 2, h / 2, 0], [frame, h, d]);
  board(context, [0, h / 2, d / 2 - 18], [w - frame * 2, h - frame * 2, 36], {
    layer: PROP_LAYER.woodRough,
  });
  if (lod === 0) {
    const shelves = 3 + (variant & 1);
    shelfStack(context, w - frame * 2, d - 30, h - frame * 2, shelves);
  }
};

export function barrelLike(
  w: number,
  d: number,
  h: number,
  variant: number,
  lod: 0 | 1,
  sink: Parameters<PropRecipe>[5],
  layer = PROP_LAYER.woodRough,
): void {
  const context = propContext(sink.writer, sink.placement);
  if (lod === 1) {
    solid(context, [0, h / 2, 0], [w, h, d], { layer });
    return;
  }
  const sides = lod === 0 ? 12 : 6;
  cylinder(context, [0, h / 2, 0], Math.min(w, d) / 2, h, sides, { layer });
  if (variant % 2 === 1)
    board(context, [0, h * 0.7, -d / 2 + 10], [w, 22, 20], { layer: PROP_LAYER.iron });
}
