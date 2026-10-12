export {
  REGION_CHUNK_CELLS,
  REGION_CHUNK_SIZE,
  REGION_HEIGHT_STEP,
  REGION_HEX_DIRECTIONS,
  REGION_HEX_RADIUS,
  REGION_INITIAL_CHUNK_RADIUS,
  REGION_UPLOADS_PER_FRAME,
  REGION_SURFACE_PLACEHOLDER_COLORS,
  createRegionTerrainChunk,
  createRegionTerrainMaterial,
  createTerrainPlaceholderArray,
  decodeRegionBase64,
  decodeRegionChunk,
  prepareRegionTerrain,
  regionCellKey,
  regionHexWorld,
  setRegionTerrainHighlight,
  surfacePlaceholderColor,
  terrainPlaceholderColor,
} from './terrain';
export {
  CAMERA_BOUNDS_INSET_M,
  CAMERA_DEAD_ZONE_RATIO,
  CAMERA_LOOK_AHEAD_M,
  CAMERA_SPRING_OMEGA,
  HEX_STEP_MM,
  MAX_TURN_RAD_PER_SECOND,
  WORLD_TICK_MS,
  advanceCameraSpring,
  advanceFacing,
  applyCameraDeadZone,
  applyLookAhead,
  cameraBasis,
  clampCameraTarget,
  groundViewQuad,
  regionHexGround,
  regionWorldBounds,
  sampleWalk,
} from './explore-motion';
export { createRegionObjectLayer } from './objects';
export { createRegionScene } from './scene';
export type {
  DecodedRegionChunk,
  PreparedRegionTerrain,
  RegionTerrainChunk,
  RegionTerrainMaterial,
} from './terrain';
export type { RegionObjectLayer } from './objects';
export type * from './types';
