import { floorDivInt } from '@tianshu/shared';
import { decodeRegionMap, terrainMoveCost, terrainStandable } from '../region-codec';
import type { RegionDynamicTileState, RegionMap, TerrainId } from '../region-types';

export const EXPLORE_VALID = 1 << 0;
export const EXPLORE_STANDABLE = 1 << 1;
export const EXPLORE_NARROW = 1 << 2;
export const EXPLORE_DANGEROUS = 1 << 3;
export const EXPLORE_OPAQUE = 1 << 4;
export const EXPLORE_BLOCKED = 1 << 5;
export const EXPLORE_GAP = 1 << 6;
export const EXPLORE_DEEP_WATER = 1 << 7;

const OPAQUE = new Set<TerrainId>(['tr_shibi', 'tr_chengqiang', 'tr_gaoqiang', 'tr_gongdianwuji']);
const GAP = new Set<TerrainId>(['tr_shengu', 'tr_shenshui']);

export interface ExploreGraph {
  readonly width: number;
  readonly height: number;
  readonly qMin: number;
  readonly rMin: number;
  readonly nodeCount: number;
  readonly qgTier: number;
  readonly swim: number;
  readonly dynamicRev: number;
  readonly heights: Uint8Array;
  readonly terrain: Uint16Array;
  readonly flags: Uint8Array;
  readonly moveCosts: Uint8Array;
  readonly moveCost: Uint8Array;
  readonly ramps: Uint8Array;
  readonly rampBits: Uint8Array;
  readonly buildings: Uint8Array;
  readonly building: Uint8Array;
  readonly terrainTable: readonly TerrainId[];
}

type RevisionCache = Map<number, ExploreGraph>;
type SwimCache = Map<number, RevisionCache>;
type TierCache = Map<number, SwimCache>;
const GRAPH_CACHE = new WeakMap<RegionMap, TierCache>();

function assertGraphInput(qgTier: number, swim: number, dynamicRev: number): void {
  if (
    !Number.isSafeInteger(qgTier) ||
    qgTier < 0 ||
    qgTier > 5 ||
    !Number.isSafeInteger(swim) ||
    swim < 0 ||
    !Number.isSafeInteger(dynamicRev) ||
    dynamicRev < 0
  )
    throw new RangeError('EXPLORE_GRAPH_INPUT');
}

export function exploreNodeAt(graph: ExploreGraph, q: number, r: number): number {
  if (
    !Number.isSafeInteger(q) ||
    !Number.isSafeInteger(r) ||
    q < graph.qMin ||
    r < graph.rMin ||
    q >= graph.qMin + graph.width ||
    r >= graph.rMin + graph.height
  )
    return -1;
  return (r - graph.rMin) * graph.width + q - graph.qMin;
}

export function exploreNodeQ(graph: ExploreGraph, node: number): number {
  return (node % graph.width) + graph.qMin;
}

export function exploreNodeR(graph: ExploreGraph, node: number): number {
  return floorDivInt(node, graph.width) + graph.rMin;
}

function terrainIndex(
  table: TerrainId[],
  byTerrain: Map<TerrainId, number>,
  terrain: TerrainId,
): number {
  const known = byTerrain.get(terrain);
  if (known !== undefined) return known;
  const index = table.length;
  if (index > 65_535) throw new RangeError('EXPLORE_TERRAIN_TABLE');
  table.push(terrain);
  byTerrain.set(terrain, index);
  return index;
}

function terrainFlags(
  terrain: TerrainId,
  standable: boolean,
  narrow: boolean,
  dangerous: boolean,
  blocked: boolean,
): number {
  return (
    EXPLORE_VALID |
    (Number(standable) * EXPLORE_STANDABLE) |
    (Number(narrow) * EXPLORE_NARROW) |
    (Number(dangerous) * EXPLORE_DANGEROUS) |
    (Number(!blocked && OPAQUE.has(terrain)) * EXPLORE_OPAQUE) |
    (Number(blocked) * EXPLORE_BLOCKED) |
    (Number(GAP.has(terrain)) * EXPLORE_GAP) |
    (Number(terrain === 'tr_shenshui') * EXPLORE_DEEP_WATER)
  );
}

function buildGraph(
  map: RegionMap,
  qgTier: number,
  swim: number,
  dynamicTiles: readonly RegionDynamicTileState[],
  dynamicRev: number,
): ExploreGraph {
  const width = map.bounds.qMax - map.bounds.qMin + 1;
  const height = map.bounds.rMax - map.bounds.rMin + 1;
  const nodeCount = width * height;
  const heights = new Uint8Array(nodeCount);
  const terrain = new Uint16Array(nodeCount);
  const flags = new Uint8Array(nodeCount);
  flags.fill(EXPLORE_OPAQUE);
  const moveCosts = new Uint8Array(nodeCount);
  const ramps = new Uint8Array(nodeCount);
  const buildings = new Uint8Array(nodeCount);
  const decoded = decodeRegionMap(map, qgTier, swim);
  const terrainTable = [...map.terrainTable];
  const byTerrain = new Map<TerrainId, number>();
  for (let index = 0; index < terrainTable.length; index += 1)
    byTerrain.set(terrainTable[index]!, index);
  for (const cell of decoded.cells) {
    const node = (cell.r - map.bounds.rMin) * width + cell.q - map.bounds.qMin;
    terrain[node] = terrainIndex(terrainTable, byTerrain, cell.terrainId);
    heights[node] = cell.height;
    moveCosts[node] = cell.moveCost;
    buildings[node] = cell.building ?? 0;
    flags[node] = terrainFlags(
      cell.terrainId,
      cell.standable,
      cell.narrow,
      cell.dangerous,
      cell.blocked === true,
    );
  }
  const coordinates = {
    width,
    height,
    qMin: map.bounds.qMin,
    rMin: map.bounds.rMin,
    nodeCount,
  } as ExploreGraph;
  const dynamicByNode = new Map<number, RegionDynamicTileState>();
  for (const tile of dynamicTiles) {
    const node = exploreNodeAt(coordinates, tile.q, tile.r);
    if (node >= 0 && (flags[node]! & EXPLORE_VALID) !== 0) dynamicByNode.set(node, tile);
  }
  // Same effective semantics as region-runtime query(): a dynamic tile replaces the terrain, so
  // standability and opacity follow the new terrain only and a static `blocked` mark no longer
  // applies; the narrow and dangerous marks stay from the static decode.
  for (const [node, tile] of dynamicByNode) {
    const current = flags[node]!;
    terrain[node] = terrainIndex(terrainTable, byTerrain, tile.terrainId);
    heights[node] = tile.height;
    moveCosts[node] = terrainMoveCost(tile.terrainId, qgTier);
    flags[node] = terrainFlags(
      tile.terrainId,
      terrainStandable(tile.terrainId, qgTier, swim),
      (current & EXPLORE_NARROW) !== 0,
      (current & EXPLORE_DANGEROUS) !== 0,
      false,
    );
  }
  for (const chunk of map.chunks)
    for (const ramp of chunk.ramps) {
      const q = chunk.q * 32 + (ramp.index % 32);
      const r = chunk.r * 32 + (ramp.index >> 5);
      const node = exploreNodeAt(coordinates, q, r);
      if (node >= 0) ramps[node] = ramps[node]! | (1 << ramp.dir);
    }
  return {
    width,
    height,
    qMin: map.bounds.qMin,
    rMin: map.bounds.rMin,
    nodeCount,
    qgTier,
    swim,
    dynamicRev,
    heights,
    terrain,
    flags,
    moveCosts,
    moveCost: moveCosts,
    ramps,
    rampBits: ramps,
    buildings,
    building: buildings,
    terrainTable,
  };
}

export function getExploreGraph(
  map: RegionMap,
  qgTier: number,
  swim: number,
  dynamicTiles: readonly RegionDynamicTileState[],
  dynamicRev: number,
): ExploreGraph {
  assertGraphInput(qgTier, swim, dynamicRev);
  let tiers = GRAPH_CACHE.get(map);
  if (!tiers) {
    tiers = new Map();
    GRAPH_CACHE.set(map, tiers);
  }
  let swims = tiers.get(qgTier);
  if (!swims) {
    swims = new Map();
    tiers.set(qgTier, swims);
  }
  let revisions = swims.get(swim);
  if (!revisions) {
    revisions = new Map();
    swims.set(swim, revisions);
  }
  const cached = revisions.get(dynamicRev);
  if (cached) return cached;
  const graph = buildGraph(map, qgTier, swim, dynamicTiles, dynamicRev);
  revisions.set(dynamicRev, graph);
  return graph;
}
