import {
  NIGHT_GLOW_FLAG,
  PROP_FLAGS,
  board,
  cylinder,
  lathe,
  panel,
  post,
  propContext,
  solid,
} from './dsl';
import { PROP_LAYER, type PropRecipe } from './types';

export const buddhaAltar: PropRecipe = (w, d, h, variant, lod, sink) => {
  const context = propContext(sink.writer, sink.placement);
  solid(context, [0, h * 0.42, 0], [w, h * 0.84, d], { layer: PROP_LAYER.woodFurniture });
  board(context, [0, h - h * 0.08, 0], [w, h * 0.16, d], { layer: PROP_LAYER.woodRough });
  if (lod === 0) {
    const panels = 3 + (variant & 1);
    for (let index = 1; index < panels; index += 1)
      board(context, [-w / 2 + (index * w) / panels, h * 0.42, -d / 2 + 15], [30, h * 0.55, 30], {
        layer: PROP_LAYER.woodRough,
      });
  }
};

export const statue: PropRecipe = (w, d, h, variant, lod, sink) => {
  const context = propContext(sink.writer, sink.placement);
  if (lod === 1) {
    solid(context, [0, h / 2, 0], [w, h, d], { layer: PROP_LAYER.woodRough });
    return;
  }
  const radius = Math.min(w, d) / 2;
  solid(context, [0, h * 0.04, 0], [w, h * 0.08, d], { layer: PROP_LAYER.woodRough });
  lathe(
    context,
    [
      [radius * 0.72, h * 0.08],
      [radius, h * 0.16],
      [radius * 0.48, h * 0.28],
      [radius * (variant & 1 ? 0.54 : 0.46), h * 0.68],
      [radius * 0.3, h * 0.84],
      [radius * 0.42, h],
    ],
    16,
    { layer: PROP_LAYER.woodRough },
  );
};

export const incenseBurner: PropRecipe = (w, d, h, variant, lod, sink) => {
  const context = propContext(sink.writer, sink.placement);
  if (lod === 1) {
    solid(context, [0, h / 2, 0], [w, h, d], { layer: PROP_LAYER.iron });
    return;
  }
  const radius = Math.min(w, d) / 2;
  lathe(
    context,
    [
      [radius * 0.45, 0],
      [radius, h * 0.2],
      [radius * 0.82, h * 0.65],
      [radius * 0.45, h],
    ],
    4,
    { layer: PROP_LAYER.iron },
  );
  board(context, [0, h * 0.42, 0], [w, h * 0.2, d], { layer: PROP_LAYER.iron });
  for (const x of [-w / 2 + 25, w / 2 - 25])
    post(context, x, 0, 0, h * 0.25, 50 + (variant & 1) * 5, { layer: PROP_LAYER.iron });
};

export const lantern: PropRecipe = (w, d, h, variant, lod, sink) => {
  const context = propContext(sink.writer, sink.placement);
  const bottom = 2_200;
  const rodHeight = variant & 1 ? 120 : 0;
  const bodyHeight = h - rodHeight;
  if (lod === 1) {
    solid(context, [0, bottom + bodyHeight / 2, 0], [w, bodyHeight, d], {
      layer: PROP_LAYER.paperBooks,
      flags: PROP_FLAGS | NIGHT_GLOW_FLAG,
    });
    if (rodHeight > 0)
      panel(context, [
        [-10, bottom + bodyHeight, 0],
        [10, bottom + bodyHeight, 0],
        [10, bottom + h, 0],
        [-10, bottom + h, 0],
      ]);
    return;
  }
  const sides = 6;
  cylinder(context, [0, bottom + bodyHeight / 2, 0], Math.min(w, d) / 2, bodyHeight, sides, {
    layer: PROP_LAYER.paperBooks,
    flags: PROP_FLAGS | NIGHT_GLOW_FLAG,
  });
  board(context, [0, bottom + 25, 0], [w, 50, d], { layer: PROP_LAYER.woodFurniture });
  if (rodHeight === 0)
    board(context, [0, bottom + h - 25, 0], [w, 50, d], { layer: PROP_LAYER.woodFurniture });
  else post(context, 0, 0, bottom + bodyHeight, bottom + h, 20);
};

export const hangingGoods: PropRecipe = (w, d, h, variant, lod, sink) => {
  const context = propContext(sink.writer, sink.placement);
  if (lod === 1) return;
  const bottom = 2_200;
  const bundles = 3;
  for (let index = 0; index < bundles; index += 1) {
    const x = -w / 2 + (w * (index + 0.5)) / bundles;
    board(context, [x, bottom + h / 2, 0], [w / bundles, h, d], {
      layer: (index + variant) % 2 ? PROP_LAYER.clothBolt : PROP_LAYER.strawBasket,
    });
  }
};
