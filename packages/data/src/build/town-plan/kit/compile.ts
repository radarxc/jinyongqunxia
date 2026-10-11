import { KNOWN_ARCHETYPES } from '../archetype';
import type { BuildKitRecipe, CompiledBuildKit } from '../types';
import { parse } from 'yaml';
import { parseBuildKitSource } from './schema';
import type { BuildKitSource, BuildKitSourceArchetype } from './schema';

function inRange(value: number, min: number, max: number, path: string): void {
  if (value < min || value > max) {
    throw new RangeError(`BUILD_KIT_RANGE:${path}:${value}:${min}..${max}`);
  }
}

function validateDimensions(source: BuildKitSource): void {
  for (const [name, dims] of Object.entries(source.dims)) {
    inRange(dims.platform, 0, 1_200, `dims.${name}.platform`);
    inRange(dims.column, 2_300, 4_200, `dims.${name}.column`);
    inRange(dims.diaRatio, 10, 16, `dims.${name}.diaRatio`);
    inRange(dims.beam, 300, 900, `dims.${name}.beam`);
    inRange(dims.eave, 0, 1_400, `dims.${name}.eave`);
    inRange(dims.rise, 200, 3_330, `dims.${name}.rise`);
    inRange(dims.lift[0], 0, 480, `dims.${name}.lift.0`);
    inRange(dims.lift[1], 0, 360, `dims.${name}.lift.1`);
    if (dims.verge !== undefined) inRange(dims.verge, 400, 800, `dims.${name}.verge`);
    if (dims.upperStorey !== undefined) {
      inRange(dims.upperStorey, 2_600, 2_700, `dims.${name}.upperStorey`);
    }
  }
  inRange(source.door.clearH, 2_100, 3_200, 'door.clearH');
  inRange(source.door.single, 900, 1_200, 'door.single');
  inRange(source.door.double, 1_000, 2_600, 'door.double');
  inRange(source.door.threshold, 100, 300, 'door.threshold');
  inRange(source.door.frame, 80, 200, 'door.frame');
  inRange(source.window.sill, 900, 1_400, 'window.sill');
  inRange(source.window.head, 2_000, 2_600, 'window.head');
  inRange(source.window.width, 500, 1_000, 'window.width');
  for (const [name, wall] of Object.entries(source.walls)) {
    inRange(wall.t, 100, 600, `walls.${name}.t`);
    if (wall.h !== undefined) inRange(wall.h, 2_000, 3_500, `walls.${name}.h`);
    if (wall.dado !== undefined) inRange(wall.dado.h, 400, 900, `walls.${name}.dado.h`);
  }
  inRange(source.ridge.h, 0, 800, 'ridge.h');
  for (const [index, layer] of source.layers.entries()) {
    inRange(layer.repeatMm[0], 100, 4_000, `layers.${index}.repeatMm.0`);
    inRange(layer.repeatMm[1], 100, 4_000, `layers.${index}.repeatMm.1`);
  }
  if (source.layers.some((layer, index) =>
    source.layers.findIndex((other) => other.id === layer.id) !== index)) {
    throw new TypeError('BUILD_KIT_LAYER_DUPLICATE');
  }
  inRange(source.cityWall.h, 4_000, 12_000, 'cityWall.h');
  inRange(source.cityWall.top, 2_000, 6_000, 'cityWall.top');
  inRange(source.cityWall.batter, 0, 3_333, 'cityWall.batter');
  inRange(source.cityWall.merlon[0], 1_000, 2_000, 'cityWall.merlon.0');
  inRange(source.cityWall.merlon[1], 800, 1_500, 'cityWall.merlon.1');
  inRange(source.cityWall.merlon[2], 300, 800, 'cityWall.merlon.2');
  inRange(source.cityWall.gate.w, 4_500, 6_000, 'cityWall.gate.w');
  inRange(source.cityWall.gate.h, 5_000, 7_000, 'cityWall.gate.h');
}

function hasAlias(entry: BuildKitSourceArchetype): entry is { alias: string } {
  return 'alias' in entry;
}

function resolveArchetypes(source: BuildKitSource): Record<string, BuildKitRecipe> {
  const known = new Set<string>(KNOWN_ARCHETYPES);
  for (const name of Object.keys(source.archetypes)) {
    if (!known.has(name)) throw new TypeError(`BUILD_KIT_ARCHETYPE_UNKNOWN:${name}`);
  }
  const result: Record<string, BuildKitRecipe> = {};
  for (const name of KNOWN_ARCHETYPES) {
    const entry = source.archetypes[name];
    if (entry === undefined) throw new TypeError(`BUILD_KIT_ARCHETYPE_MISSING:${name}`);
    if (!hasAlias(entry)) {
      result[name] = canonicalValue(entry) as BuildKitRecipe;
      continue;
    }
    const target = source.archetypes[entry.alias];
    if (target === undefined) throw new TypeError(`BUILD_KIT_ALIAS_MISSING:${name}:${entry.alias}`);
    if (hasAlias(target)) throw new TypeError(`BUILD_KIT_ALIAS_CHAIN:${name}:${entry.alias}`);
    result[name] = canonicalValue(target) as BuildKitRecipe;
  }
  return result;
}

function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value !== null && typeof value === 'object') {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value).sort()) {
      const child = (value as Record<string, unknown>)[key];
      if (child !== undefined) sorted[key] = canonicalValue(child);
    }
    return sorted;
  }
  return value;
}

/** Validate, expand aliases, convert the source marker, and canonicalize every map key. */
export function compileKit(input: unknown): CompiledBuildKit {
  // p0 reserved {} as its explicit stub sentinel; retain that diagnostic for compatibility.
  if (typeof input === 'object' && input !== null && Object.keys(input).length === 0) {
    throw new Error('TOWN_PLAN_NOT_IMPLEMENTED:compileKit');
  }
  const source = parseBuildKitSource(typeof input === 'string' ? parse(input) : input);
  validateDimensions(source);
  const fields: Omit<BuildKitSource, 'schemaVersion' | 'archetypes'> = {
    id: source.id, style: source.style, profile: source.profile, dims: source.dims,
    door: source.door, window: source.window, walls: source.walls, ridge: source.ridge,
    palette: source.palette, layers: source.layers, variants: source.variants,
    landmarks: source.landmarks, cityWall: source.cityWall,
    ...(source.variantSets === undefined ? {} : { variantSets: source.variantSets }),
    ...(source.preferSouthHall === undefined ? {} : { preferSouthHall: source.preferSouthHall }),
  };
  const runtime = {
    schemaVersion: 'buildkit-runtime.v1' as const,
    ...fields,
    archetypes: resolveArchetypes(source),
  };
  return canonicalValue(runtime) as CompiledBuildKit;
}

export function stringifyCompiledKit(kit: CompiledBuildKit): string {
  return JSON.stringify(canonicalValue(kit));
}
