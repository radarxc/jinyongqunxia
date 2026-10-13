import { barrelLike, cabinetRecipe, crateRecipe, stoolRecipe, tableRecipe } from './common';
import { board, drawerGrid, legs, panel, post, propContext, shelfStack, solid, sweep } from './dsl';
import { PROP_LAYER, type PropRecipe } from './types';

export const counter: PropRecipe = (w, d, h, variant, lod, sink) => {
  const context = propContext(sink.writer, sink.placement);
  solid(context, [0, h / 2, 0], [w, h, d]);
  if (lod === 0) drawerGrid(context, w * 0.82, 30, h * 0.62, 3 + (variant & 1), 2, 0);
};

export const barredHighCounter: PropRecipe = (w, d, h, variant, lod, sink) => {
  const context = propContext(sink.writer, sink.placement);
  const baseH = Math.round(h * 0.45);
  solid(context, [0, baseH / 2, 0], [w, baseH, d]);
  const bars = lod === 0 ? Math.max(3, Math.min(9, Math.round(w / 320))) : 3;
  for (let index = 0; index < bars; index += 1) {
    const x = -w / 2 + 50 + (index * (w - 100)) / Math.max(1, bars - 1);
    post(context, x, 0, baseH, h, 35 + (variant & 1) * 5, { layer: PROP_LAYER.iron });
  }
  board(context, [0, h - 30, 0], [w, 60, d]);
};

export const shelf4: PropRecipe = (w, d, h, _variant, lod, sink) => {
  const context = propContext(sink.writer, sink.placement);
  shelfStack(context, w, d, h, lod === 0 ? 4 : 2);
  if (lod === 0) legs(context, w - 70, d - 70, 0, h, 50);
};

export const apothecaryCabinet: PropRecipe = (w, d, h, variant, lod, sink) => {
  const context = propContext(sink.writer, sink.placement);
  // Keep the carcass behind the drawer plane: the 30 mm reveal is a real recess, not coplanar ink.
  solid(context, [0, h / 2, 25], [w, h, d - 50], { layer: PROP_LAYER.woodRough });
  if (lod === 0)
    board(context, [0, h / 2, -d / 2 + 38], [w - 60, h - 80, 16], {
      layer: PROP_LAYER.medicineDrawers,
    });
  drawerGrid(context, w - 60, d, h - 80, 8 + (variant & 1), 6, lod, {
    layer: PROP_LAYER.medicineDrawers,
  });
};

export const clothRack: PropRecipe = (w, d, h, variant, lod, sink) => {
  const context = propContext(sink.writer, sink.placement);
  if (lod === 1) {
    solid(context, [0, h / 2, 0], [w, h, d]);
    return;
  }
  board(context, [0, 20, 0], [w, 40, d]);
  post(context, -w / 2 + 35, 0, 0, h, 70);
  post(context, w / 2 - 35, 0, 0, h, 70);
  board(context, [0, h - 40, 0], [w, 80, 80]);
  const bolts = lod === 0 ? 5 : 1;
  for (let index = 0; index < bolts; index += 1) {
    const x = -w * 0.35 + (index * w * 0.7) / Math.max(1, bolts - 1);
    board(
      context,
      [x, h * 0.52, (index + variant) % 2 ? -d * 0.18 : d * 0.18],
      [Math.max(50, w / (bolts + 2)), h * 0.72, 35],
      { layer: PROP_LAYER.clothBolt },
    );
  }
};

export const bookcase: PropRecipe = (w, d, h, variant, lod, sink) => {
  cabinetRecipe(w, d, h, variant, lod, sink);
  if (lod === 0) {
    const context = propContext(sink.writer, sink.placement);
    for (let index = 0; index < 4; index += 1)
      board(context, [-w * 0.3 + index * w * 0.2, h * 0.42, -d / 2 + 25], [45, h * 0.25, 45], {
        layer: PROP_LAYER.paperBooks,
      });
  }
};

export const readingTable = tableRecipe();
export const squareTable = tableRecipe();

export const bench: PropRecipe = (w, d, h, variant, lod, sink) => {
  const context = propContext(sink.writer, sink.placement);
  if (lod === 1) {
    solid(context, [0, h / 2, 0], [w, h, d]);
    return;
  }
  board(context, [0, h - 35, 0], [w, 70, d]);
  post(context, -w * 0.38, 0, 0, h - 70, 60 + (variant & 1) * 10);
  post(context, w * 0.38, 0, 0, h - 70, 60 + (variant & 1) * 10);
};
export const stool = stoolRecipe;

export const armchair: PropRecipe = (w, d, h, variant, lod, sink) => {
  const context = propContext(sink.writer, sink.placement);
  if (lod === 1) {
    solid(context, [0, h / 2, 0], [w, h, d]);
    return;
  }
  const seatY = Math.round(h * 0.45);
  board(context, [0, seatY, 0], [w, 70, d]);
  board(context, [0, (seatY + h) / 2, d / 2 - 35], [w, h - seatY, 70]);
  legs(context, w - 100, d - 100, 0, seatY, 55 + (variant & 1) * 5);
  for (const x of [-w / 2 + 35, w / 2 - 35]) board(context, [x, seatY + 180, 0], [70, 55, d]);
};

export const altarTable = tableRecipe();

export const bed: PropRecipe = (w, d, h, variant, lod, sink) => {
  const context = propContext(sink.writer, sink.placement);
  const deckY = Math.round(h * 0.22);
  board(context, [0, deckY, 0], [w, 120, d]);
  board(context, [0, h / 2, d / 2 - 45], [w, h, 90]);
  if (lod === 0) {
    for (const x of [-w / 2 + 45, w / 2 - 45]) post(context, x, -d / 2 + 45, 0, h, 90);
    board(context, [0, deckY + 80, -d * 0.18], [w * 0.82, 80 + (variant & 1) * 30, d * 0.55], {
      layer: PROP_LAYER.clothBolt,
    });
  }
};

export const chest = crateRecipe;

export const stairs14: PropRecipe = (w, d, h, variant, lod, sink) => {
  const context = propContext(sink.writer, sink.placement);
  const steps = 14;
  const railHeight = 800;
  const rise = h - railHeight;
  for (let index = 0; index < steps; index += 1) {
    const x0 = -w / 2 + (index * w) / steps;
    const x1 = -w / 2 + ((index + 1) * w) / steps;
    const y = ((index + 1) * rise) / steps;
    if (lod === 0)
      solid(context, [(x0 + x1) / 2, y / 2, 0], [x1 - x0, y, d], { layer: PROP_LAYER.woodRough });
    else {
      panel(
        context,
        [
          [x0, y, -d / 2],
          [x1, y, -d / 2],
          [x1, y, d / 2],
          [x0, y, d / 2],
        ],
        { layer: PROP_LAYER.woodRough },
      );
    }
  }
  const beamZ = d / 2 - 45;
  for (const z of [-beamZ, beamZ]) {
    sweep(
      context,
      [
        [-w / 2 + 35, 35, z],
        [w / 2 - 35, rise - 35, z],
      ],
      [
        [-35, -35],
        [35, -35],
        [35, 35],
        [-35, 35],
      ],
      { layer: PROP_LAYER.woodRough },
    );
    sweep(
      context,
      [
        [-w / 2 + 30, railHeight - 30, z],
        [w / 2 - 30, h - 30, z],
      ],
      [
        [-30, -30],
        [30, -30],
        [30, 30],
        [-30, 30],
      ],
      { layer: PROP_LAYER.woodRough },
    );
    const posts = lod === 0 ? 4 : 2;
    for (let index = 0; index < posts; index += 1) {
      const rail = 55 + (variant & 1) * 5;
      const x = -w / 2 + rail / 2 + (index * (w - rail)) / (posts - 1);
      const stairY = (index * rise) / (posts - 1);
      post(context, x, z, stairY, stairY + railHeight, rail);
    }
  }
};

export const screen: PropRecipe = (w, d, h, variant, lod, sink) => {
  const context = propContext(sink.writer, sink.placement);
  if (lod === 1) {
    solid(context, [0, h / 2, 0], [w, h, d]);
    return;
  }
  const panels = lod === 0 ? 3 : 1;
  const panelW = w / panels;
  for (let index = 0; index < panels; index += 1)
    board(context, [-w / 2 + panelW * (index + 0.5), h / 2, 0], [panelW, h, d], {
      layer: variant & 1 ? PROP_LAYER.paperBooks : PROP_LAYER.woodFurniture,
    });
};

export const dais: PropRecipe = (w, d, h, _variant, _lod, sink) => {
  solid(propContext(sink.writer, sink.placement), [0, h / 2, 0], [w, h, d], {
    layer: PROP_LAYER.woodRough,
  });
};
export const gamblingTable = tableRecipe();
export const storytellerTable = tableRecipe(PROP_LAYER.woodRough);

export const barrel: PropRecipe = barrelLike;
export const crate = crateRecipe;
