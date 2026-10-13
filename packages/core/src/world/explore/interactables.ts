import { hexDistance, hexKey, hexLineBetween, type HexCoord } from '../../hex';
import type { GameState } from '../../state';
import type { RegionMap, RegionObject, RegionRuntimeContent } from '../region-types';
import { EXPLORE_OPAQUE, EXPLORE_VALID, exploreNodeAt, type ExploreGraph } from './graph';
import type { ExploreInteractableView } from './types';
import { exploreWalkContext, interactRange } from './walk-validate';

const BUCKETS = new WeakMap<RegionMap, ReadonlyMap<string, readonly RegionObject[]>>();
const BUILDINGS = new WeakMap<RegionMap, readonly string[]>();
const INTERACTIVE = new Set<RegionObject['class']>([
  'FacilityNpc', 'NpcSpawn', 'Door', 'Chest', 'Exit', 'MeditationSpot',
]);

function buckets(map: RegionMap): ReadonlyMap<string, readonly RegionObject[]> {
  const known = BUCKETS.get(map);
  if (known) return known;
  const mutable = new Map<string, RegionObject[]>();
  for (const object of [...map.objects, ...map.chunks.flatMap((chunk) => chunk.objects)]) {
    const key = hexKey(object);
    const bucket = mutable.get(key);
    if (bucket) bucket.push(object);
    else mutable.set(key, [object]);
  }
  BUCKETS.set(map, mutable);
  return mutable;
}

function visible(graph: ExploreGraph, from: HexCoord, to: HexCoord): boolean {
  for (const cell of hexLineBetween(from, to)) {
    const node = exploreNodeAt(graph, cell.q, cell.r);
    if (node < 0 || (graph.flags[node]! & EXPLORE_VALID) === 0 ||
        (graph.flags[node]! & EXPLORE_OPAQUE) !== 0) return false;
  }
  return true;
}

export function insideBuildingId(map: RegionMap, graph: ExploreGraph, at: HexCoord): string | null {
  const node = exploreNodeAt(graph, at.q, at.r);
  const ordinal = node < 0 ? 0 : graph.buildings[node]!;
  if (ordinal === 0) return null;
  let ids = BUILDINGS.get(map);
  if (!ids) {
    ids = [...map.objects, ...map.chunks.flatMap((chunk) => chunk.objects)]
      .filter((object): object is Extract<RegionObject, { class: 'Building' }> =>
        object.class === 'Building')
      .map((object) => object.id).sort((left, right) => left < right ? -1 : left > right ? 1 : 0);
    BUILDINGS.set(map, ids);
  }
  return ids[ordinal - 1] ?? null;
}

export function queryExploreInteractables(state: Readonly<GameState>,
  content: RegionRuntimeContent): readonly ExploreInteractableView[] {
  const context = exploreWalkContext(state, content);
  const mounted = state.world.navigation.mountedRegion;
  if (!context || !mounted) return [];
  const active = new Map(mounted.entities.map((entry) => [entry.anchorId, entry]));
  const candidates: ExploreInteractableView[] = [];
  const radius = 3;
  for (let r = mounted.playerHex.r - radius; r <= mounted.playerHex.r + radius; r += 1)
    for (let q = mounted.playerHex.q - radius; q <= mounted.playerHex.q + radius; q += 1) {
      const point = { q, r };
      const distance = hexDistance(mounted.playerHex, point);
      if (distance > radius) continue;
      for (const object of buckets(context.map).get(hexKey(point)) ?? []) {
        const entity = active.get(object.id);
        if (!INTERACTIVE.has(object.class) || entity?.active === false || entity?.consumed === true ||
            distance > interactRange(object) || !visible(context.graph, mounted.playerHex, object)) continue;
        candidates.push({ id: object.id, class: object.class,
          hex: { q: object.q, r: object.r }, distance });
      }
    }
  candidates.sort((left, right) => left.distance - right.distance ||
    left.hex.r - right.hex.r || left.hex.q - right.hex.q ||
    (left.id < right.id ? -1 : left.id > right.id ? 1 : 0));
  if (candidates.length > 8) candidates.length = 8;
  return candidates;
}
