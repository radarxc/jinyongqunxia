import { barrelLike } from './common';
import { board, cylinder, lathe, propContext, solid } from './dsl';
import { PROP_LAYER, type PropRecipe } from './types';

export const sack: PropRecipe = (w, d, h, variant, lod, sink) => {
  const context = propContext(sink.writer, sink.placement);
  if (lod === 1) {
    solid(context, [0, h / 2, 0], [w, h, d], { layer: PROP_LAYER.clothBolt });
    return;
  }
  board(context, [0, h * 0.35, 0], [w, h * 0.7, d], { layer: PROP_LAYER.clothBolt });
  board(context, [0, h * 0.85, 0], [w, h * 0.3, d], { layer: PROP_LAYER.clothBolt });
  if (variant & 1 && lod === 0)
    board(context, [0, h - 8, 0], [w * 0.35, 16, d * 0.35], { layer: PROP_LAYER.woodRough });
};

export const wineJar: PropRecipe = (w, d, h, variant, lod, sink) => {
  const context = propContext(sink.writer, sink.placement);
  if (lod === 1) {
    solid(context, [0, h / 2, 0], [w, h, d], { layer: PROP_LAYER.ceramicGlaze });
    return;
  }
  lathe(
    context,
    [
      [w * 0.28, 0],
      [w / 2, h * 0.28],
      [w * 0.46, h * 0.72],
      [w * 0.24, h],
    ],
    lod === 0 ? 8 : 4,
    { layer: PROP_LAYER.ceramicGlaze },
  );
  if (variant & 1)
    board(context, [0, h * 0.75, -d / 2 + 8], [w * 0.45, h * 0.18, 16], {
      layer: PROP_LAYER.paperBooks,
    });
};

export const jarGroup: PropRecipe = (w, d, h, variant, lod, sink) => {
  const context = propContext(sink.writer, sink.placement);
  const jars = lod === 0 ? 3 : 1;
  const jarW = w / jars;
  for (let index = 0; index < jars; index += 1) {
    const x = -w / 2 + jarW * (index + 0.5);
    const jarH = index === 1 || jars === 1 ? h : h * 0.78;
    solid(context, [x, jarH / 2, 0], [jarW, jarH, d], { layer: PROP_LAYER.ceramicGlaze });
  }
  board(context, [0, 8, 0], [w, 16, d], { layer: PROP_LAYER.woodRough });
};

export const basket: PropRecipe = (w, d, h, variant, lod, sink) => {
  const context = propContext(sink.writer, sink.placement);
  cylinder(context, [0, h / 2, 0], Math.min(w, d) / 2, h, lod === 0 ? 8 : 4, {
    layer: PROP_LAYER.strawBasket,
  });
  if (lod === 0 && variant & 1)
    board(context, [0, h * 0.78, -d / 2 + 10], [w, 28, 20], { layer: PROP_LAYER.woodRough });
};

export const hayBale: PropRecipe = (w, d, h, _variant, _lod, sink) => {
  solid(propContext(sink.writer, sink.placement), [0, h / 2, 0], [w, h, d], {
    layer: PROP_LAYER.strawBasket,
  });
};

export const cushion: PropRecipe = (w, d, h, variant, lod, sink) => {
  const context = propContext(sink.writer, sink.placement);
  solid(context, [0, h / 2, 0], [w, h, d], { layer: PROP_LAYER.clothBolt });
  if (variant & 1)
    board(context, [0, h - 5, 0], [w * 0.6, 10, d * 0.08], { layer: PROP_LAYER.paperBooks });
};

export const barrel: PropRecipe = barrelLike;
