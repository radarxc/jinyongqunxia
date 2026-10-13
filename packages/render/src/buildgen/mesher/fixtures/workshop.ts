import { board, cylinder, legs, panel, post, propContext, solid } from './dsl';
import { PROP_LAYER, type PropRecipe } from './types';

export const forge: PropRecipe = (w, d, h, variant, lod, sink) => {
  const context = propContext(sink.writer, sink.placement);
  const hearth = Math.min(900, Math.round(h / 3));
  solid(context, [0, hearth / 2, 0], [w, hearth, d], { layer: PROP_LAYER.woodRough });
  board(context, [0, hearth * 0.72, -d / 2 + 20], [w * 0.62, hearth * 0.36, 40], {
    layer: PROP_LAYER.iron,
  });
  if (lod === 0) {
    panel(
      context,
      [
        [-w / 2, hearth, -d / 2],
        [w / 2, hearth, -d / 2],
        [w * 0.3, h * 0.68, -d * 0.15],
        [-w * 0.3, h * 0.68, -d * 0.15],
      ],
      { layer: PROP_LAYER.iron },
    );
  }
  const chimneyW = lod === 0 ? w * 0.34 : w * 0.45;
  solid(context, [0, (h + hearth) / 2, d * 0.15], [chimneyW, h - hearth, d * 0.34], {
    layer: variant & 1 ? PROP_LAYER.iron : PROP_LAYER.woodRough,
  });
};

export const bellows: PropRecipe = (w, d, h, variant, lod, sink) => {
  const context = propContext(sink.writer, sink.placement);
  solid(context, [0, h * 0.32, 0], [w, h * 0.64, d], { layer: PROP_LAYER.clothBolt });
  board(context, [0, h - 35, 0], [w, 70, d]);
  if (lod === 0) board(context, [0, h - 25, 0], [w * 0.75, 50 + (variant & 1) * 20, d * 0.65]);
};

export const anvilStump: PropRecipe = (w, d, h, _variant, lod, sink) => {
  const context = propContext(sink.writer, sink.placement);
  const stumpH = Math.round(h * 0.58);
  cylinder(context, [0, stumpH / 2, 0], Math.min(w, d) * 0.44, stumpH, lod === 0 ? 8 : 5, {
    layer: PROP_LAYER.woodRough,
  });
  board(context, [0, stumpH + (h - stumpH) / 2, 0], [w, h - stumpH, d], { layer: PROP_LAYER.iron });
};

export const quenchTrough: PropRecipe = (w, d, h, _variant, lod, sink) => {
  const context = propContext(sink.writer, sink.placement);
  if (lod === 1) {
    solid(context, [0, h / 2, 0], [w, h, d], { layer: PROP_LAYER.iron });
    return;
  }
  const wall = lod === 0 ? 55 : 80;
  board(context, [0, wall / 2, 0], [w, wall, d], { layer: PROP_LAYER.iron });
  board(context, [-w / 2 + wall / 2, h / 2, 0], [wall, h, d], { layer: PROP_LAYER.iron });
  board(context, [w / 2 - wall / 2, h / 2, 0], [wall, h, d], { layer: PROP_LAYER.iron });
  board(context, [0, h / 2, -d / 2 + wall / 2], [w, h, wall], { layer: PROP_LAYER.iron });
  board(context, [0, h / 2, d / 2 - wall / 2], [w, h, wall], { layer: PROP_LAYER.iron });
};

export const weaponRack: PropRecipe = (w, d, h, variant, lod, sink) => {
  const context = propContext(sink.writer, sink.placement);
  post(context, -w / 2 + 45, 0, 0, h, 90);
  post(context, w / 2 - 45, 0, 0, h, 90);
  board(context, [0, h * 0.72, 0], [w, 90, d]);
  const weapons = 6;
  for (let index = 0; index < weapons; index += 1) {
    const x = -w * 0.38 + (index * w * 0.76) / Math.max(1, weapons - 1);
    const shaftTop = h * (0.68 + (index % 3) * 0.08);
    if (lod === 1) {
      const half = 20 + index * 7;
      panel(
        context,
        [
          [x - half, 0, -d * 0.12],
          [x + half, 0, -d * 0.12],
          [x + half, shaftTop + h * 0.14, -d * 0.12],
          [x - half, shaftTop + h * 0.14, -d * 0.12],
        ],
        { layer: PROP_LAYER.iron },
      );
      continue;
    }
    post(context, x, -d * 0.12, 0, shaftTop, 24 + ((index + variant) & 1) * 4, {
      layer: PROP_LAYER.iron,
    });
    const headY = shaftTop + h * 0.07;
    if (index === 0)
      board(context, [x, headY, -d * 0.12], [70, h * 0.14, 24], { layer: PROP_LAYER.iron });
    if (index === 1)
      board(context, [x + 35, headY, -d * 0.12], [140, h * 0.12, 24], { layer: PROP_LAYER.iron });
    if (index === 2) {
      board(context, [x, headY, -d * 0.12], [55, h * 0.16, 24], { layer: PROP_LAYER.iron });
      board(context, [x + 42, shaftTop, -d * 0.12], [85, 35, 24], { layer: PROP_LAYER.iron });
    }
    if (index === 3)
      board(context, [x, shaftTop + 30, -d * 0.12], [190, 45, 24], { layer: PROP_LAYER.iron });
    if (index === 4)
      cylinder(context, [x, headY, -d * 0.12], 55, h * 0.1, 4, { layer: PROP_LAYER.iron });
    if (index === 5) {
      board(context, [x, headY, -d * 0.12], [95, h * 0.14, 24], { layer: PROP_LAYER.iron });
      board(context, [x, shaftTop, -d * 0.12], [180, 30, 24], { layer: PROP_LAYER.iron });
    }
  }
};

export const toolRack: PropRecipe = (w, d, h, variant, lod, sink) => {
  const context = propContext(sink.writer, sink.placement);
  board(context, [0, h / 2, d / 2 - 25], [w, h, 50], { layer: PROP_LAYER.woodRough });
  const tools = lod === 0 ? 5 : 2;
  for (let index = 0; index < tools; index += 1) {
    const x = -w * 0.36 + (index * w * 0.72) / Math.max(1, tools - 1);
    post(context, x, -d / 2 + 14, h * 0.15, h * (0.72 + ((index + variant) % 2) * 0.12), 28, {
      layer: PROP_LAYER.iron,
    });
  }
};

export const workbench: PropRecipe = (w, d, h, variant, lod, sink) => {
  const context = propContext(sink.writer, sink.placement);
  board(context, [0, h - 50, 0], [w, 100, d], { layer: PROP_LAYER.woodRough });
  if (lod === 0)
    legs(context, w - 120, d - 120, 0, h - 100, 75 + (variant & 1) * 10, {
      layer: PROP_LAYER.woodRough,
    });
  else solid(context, [0, (h - 100) / 2, 0], [80, h - 100, 80], { layer: PROP_LAYER.woodRough });
};

export const manger: PropRecipe = (w, d, h, variant, lod, sink) => {
  const context = propContext(sink.writer, sink.placement);
  solid(context, [0, h / 2, 0], [w, h, d], { layer: PROP_LAYER.woodRough });
  if (lod === 0 && variant & 1)
    board(context, [0, h - 20, -d / 2 + 10], [w * 0.75, 40, 20], { layer: PROP_LAYER.strawBasket });
};

export const woodenDummy: PropRecipe = (w, d, h, variant, lod, sink) => {
  const context = propContext(sink.writer, sink.placement);
  if (lod === 1) {
    solid(context, [0, h / 2, 0], [w, h, d], { layer: PROP_LAYER.woodRough });
    return;
  }
  const sides = lod === 0 ? 8 : 5;
  cylinder(context, [0, h / 2, 0], Math.min(w, d) * 0.13, h, sides, {
    layer: PROP_LAYER.woodRough,
  });
  const arms = lod === 0 ? 3 : 1;
  for (let index = 0; index < arms; index += 1) {
    const y = h * (0.48 + index * 0.13);
    const z = ((index + variant) % 2 ? -1 : 1) * d * 0.12;
    board(context, [0, y, z], [w, 55, 55], { layer: PROP_LAYER.woodRough });
  }
  board(context, [0, 35, 0], [w, 70, d], { layer: PROP_LAYER.woodRough });
};

export const flagRack: PropRecipe = (w, d, h, variant, lod, sink) => {
  const context = propContext(sink.writer, sink.placement);
  if (lod === 1) {
    solid(context, [0, h / 2, 0], [w, h, d], { layer: PROP_LAYER.woodRough });
    return;
  }
  post(context, 0, 0, 0, h, lod === 0 ? 65 : 85, { layer: PROP_LAYER.woodRough });
  board(context, [0, 35, 0], [w, 70, d], { layer: PROP_LAYER.woodRough });
  if (lod === 0)
    panel(
      context,
      [
        [0, h * 0.6, 0],
        [w * 0.5 * (variant & 1 ? -1 : 1), h * 0.6, 0],
        [w * 0.5 * (variant & 1 ? -1 : 1), h * 0.95, 0],
        [0, h * 0.95, 0],
      ],
      { layer: PROP_LAYER.clothBolt },
    );
};
