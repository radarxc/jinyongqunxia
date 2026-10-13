export {
  INTERIOR_SURFACE_FLAG,
  LAMP_RANGE_MM,
  NIGHT_GLOW_FLAG,
  PROP_AO,
  PROP_ARRAY_FLAG,
  PROP_FLAGS,
  WALL_CORNER_AO,
  bakedLampByte,
  propContext,
} from './dsl';
export { buildInterior, defaultInteriorLamps } from './interior';
export { PROP_DEFINITIONS, propByIndex, propsByIndex } from './register';
export { PROP_LAYER } from './types';
export type {
  InteriorBuildStats,
  InteriorDiagnostic,
  InteriorSink,
  LampPointMm,
  PropDefinition,
  PropLod,
  PropPlacement,
  PropRecipe,
  PropSink,
} from './types';
