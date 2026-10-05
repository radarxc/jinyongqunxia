import { HEX_DIRECTIONS, evaluateStep, hexDistance, hexKey, jumpDistance,
  hexLineBetween, qinggongTier, type HexDir, type HexPathQuery } from '../hex';
import type { GameState } from '../state';
import { decodeRegionMap, rampAllows, terrainMoveCost, terrainStandable, type RegionCell } from './region-codec';
import { evaluateGate } from './region-gates';
import type { GateEvaluation, RegionAnchorView, RegionDoorView, RegionDynamicProjection,
  RegionPathPreview, RegionPathQueryResult, RegionRuntimeContent, RegionStaticProjection } from './region-types';
import type { MountedRegionState, RegionObject } from './region-types';

const INTERACTIVE = new Set(['NpcSpawn', 'Door', 'Trigger', 'QinggongGate', 'Chest', 'BattleArena']);
const OPAQUE = new Set(['tr_shibi', 'tr_chengqiang', 'tr_gaoqiang', 'tr_gongdianwuji']);
const GAP = new Set(['tr_shengu', 'tr_shenshui']);
export const regionMap = (content: RegionRuntimeContent, sceneId: string) =>
  content.maps.find((map) => map.id === sceneId);
export const regionObjects = (content: RegionRuntimeContent, sceneId: string) => {
  const map = regionMap(content, sceneId); if (!map) return [];
  return [...map.objects, ...map.chunks.flatMap((chunk) => chunk.objects)]
    .sort((left, right) => left.r - right.r || left.q - right.q ||
      (left.id < right.id ? -1 : left.id > right.id ? 1 : 0));
};
export function regionRuntimeForState(state: Readonly<GameState>,
  content: RegionRuntimeContent): RegionRuntimeContent {
  const items = Object.fromEntries(state.party.inventory.stacks.map((entry) =>
    [entry.itemId, entry.count]));
  const quests: Record<string, 'inactive' | 'active' | 'completed' | 'failed'> = {};
  for (const line of state.chapter.story.lines) quests[line.lineId] =
    line.status === 'completed' ? 'completed' :
      line.status === 'active' || line.status === 'available' ? 'active' : 'inactive';
  const flags = [...new Set([...content.gateFacts.flags ?? [],
    ...state.chapter.story.lines.flatMap((line) => line.appliedEffectIds),
    ...Object.entries(state.profile.replayRules?.switches ?? {})
      .filter(([, enabled]) => enabled).map(([key]) => key)])]
    .sort((left, right) => left < right ? -1 : left > right ? 1 : 0);
  return { ...content, gateFacts: { ...content.gateFacts,
    items: { ...content.gateFacts.items, ...items },
    quests: { ...content.gateFacts.quests, ...quests }, flags } };
}

export function doorGate(content: RegionRuntimeContent, gateId?: string): GateEvaluation {
  if (!gateId) return { allowed: true, reason: null };
  const binding = content.gates?.find((entry) => entry.gateId === gateId);
  return binding ? evaluateGate(binding.expression, content.gateFacts)
    : { allowed: false, reason: 'REGION_GATE_LOCKED' };
}
export function objectGate(object: ReturnType<typeof regionObjects>[number],
  content: RegionRuntimeContent): GateEvaluation {
  if (object.class === 'Door') return doorGate(content, object.lockedBy);
  if (object.class === 'QinggongGate') {
    const tier = qinggongTier(content.gateFacts.qinggong);
    if (tier >= object.tier) return { allowed: true, reason: null };
    const alt = object.alt.map((entry) => evaluateGate(entry, content.gateFacts));
    return alt.some((entry) => entry.allowed) ? { allowed: true, reason: null }
      : alt[0] ?? { allowed: false, reason: 'REGION_GATE_QINGGONG' };
  }
  if ('gateIntent' in object && object.gateIntent &&
      qinggongTier(content.gateFacts.qinggong) < object.gateIntent.requiresQigong)
    return { allowed: false, reason: 'REGION_GATE_QINGGONG' };
  return { allowed: true, reason: null };
}

function query(state: Readonly<GameState>, content: RegionRuntimeContent):
  { readonly query: HexPathQuery; readonly cells: ReadonlyMap<string, RegionCell>;
    readonly ramps: ReadonlySet<string> } | null {
  const mounted = state.world.navigation.mountedRegion;
  const map = mounted && regionMap(content, state.world.navigation.locationId); if (!mounted || !map) return null;
  const tier = qinggongTier(content.gateFacts.qinggong);
  const decoded = decodeRegionMap(map, tier, content.gateFacts.swim ?? 0);
  const dynamic = new Map(mounted.dynamicTiles.map((tile) => [hexKey(tile), tile]));
  const cells = decoded.cells.map((cell) => { const tile = dynamic.get(hexKey(cell));
    return tile ? { ...cell, terrainId: tile.terrainId, height: tile.height,
      moveCost: terrainMoveCost(tile.terrainId, tier),
      standable: terrainStandable(tile.terrainId, tier, content.gateFacts.swim ?? 0) } : cell; });
  const active = new Map(mounted.entities.map((entry) => [entry.anchorId, entry.active]));
  const units = regionObjects(content, state.world.navigation.locationId).filter(
    (object) => object.class === 'NpcSpawn' &&
    active.get(object.id) !== false).map((object) => ({ id: object.id, q: object.q, r: object.r,
      relation: 'neutral' as const, active: true, exertsZoc: false }));
  return { query: { cells, units, start: mounted.playerHex, mover: { id: 'player', qgTier: tier,
    jump: jumpDistance(content.gateFacts.qinggong), move: Number.MAX_SAFE_INTEGER } },
    cells: new Map(cells.map((cell) => [hexKey(cell), cell])), ramps: decoded.ramps };
}
interface Candidate { readonly cell: RegionCell; readonly cost: number; readonly actions: number;
  readonly dangers: number; readonly path: readonly { readonly q: number; readonly r: number }[] }
function comparePath(left: Candidate, right: Candidate): number {
  const head = left.cost - right.cost || left.actions - right.actions || left.dangers - right.dangers;
  if (head !== 0) return head;
  const count = Math.min(left.path.length, right.path.length);
  for (let index = 0; index < count; index += 1) {
    const a = left.path[index]!; const b = right.path[index]!;
    const order = a.r - b.r || a.q - b.q; if (order !== 0) return order;
  }
  return left.path.length - right.path.length;
}
interface RegionEdge { readonly target: RegionCell; readonly cost: number;
  readonly dangerous: boolean; readonly path: readonly { readonly q: number; readonly r: number }[] }
function regionEdges(context: NonNullable<ReturnType<typeof query>>, from: RegionCell): RegionEdge[] {
  const edges: RegionEdge[] = []; const tier = context.query.mover.qgTier;
  for (let direction = 0; direction < 6; direction += 1) {
    const step = HEX_DIRECTIONS[direction]!;
    const adjacent = context.cells.get(`${from.q + step.q},${from.r + step.r}`);
    if (!adjacent) continue;
    const ramp = rampAllows(context.ramps, from, adjacent, direction as HexDir);
    const walk = ramp ? { allowed: adjacent.standable, cost: Math.max(1, adjacent.moveCost),
      dangerous: adjacent.dangerous } : evaluateStep(context.query, from, adjacent);
    if (walk.allowed) edges.push({ target: adjacent, cost: walk.cost,
      dangerous: walk.dangerous, path: [{ q: adjacent.q, r: adjacent.r }] });
    if (adjacent.standable || tier === 0 || !GAP.has(adjacent.terrainId)) continue;
    for (let width = 1; width <= tier; width += 1) {
      const landing = context.cells.get(`${from.q + step.q * (width + 1)},${from.r + step.r * (width + 1)}`);
      if (!landing) break;
      if (!landing.standable) { if (!GAP.has(landing.terrainId)) break; continue; }
      const deltaUp = Math.max(0, landing.height - from.height);
      const drop = Math.max(0, from.height - landing.height);
      if (width + deltaUp > tier + 1 || drop > tier + 5) break;
      edges.push({ target: landing, cost: width + 1 + ((deltaUp + 1) >> 1),
        dangerous: landing.dangerous, path: [{ q: landing.q, r: landing.r }] });
      break;
    }
  }
  return edges;
}
function regionPath(context: NonNullable<ReturnType<typeof query>>,
  destination: { readonly q: number; readonly r: number }): Candidate | null {
  const start = context.cells.get(hexKey(context.query.start));
  const goal = context.cells.get(hexKey(destination)); if (!start || !goal || !goal.standable) return null;
  const occupied = new Set(context.query.units.filter((unit) => unit.active && unit.id !== 'player')
    .map(hexKey));
  const best = new Map<string, Candidate>();
  const first: Candidate = { cell: start, cost: 0, actions: 0, dangers: 0,
    path: [{ q: start.q, r: start.r }] };
  best.set(hexKey(start), first); const open = [first];
  while (open.length > 0) {
    open.sort(comparePath); const current = open.shift()!;
    if (best.get(hexKey(current.cell)) !== current) continue;
    if (hexKey(current.cell) === hexKey(goal)) return current;
    for (const edge of regionEdges(context, current.cell)) {
      const next = edge.target; if (occupied.has(hexKey(next))) continue;
      const candidate: Candidate = { cell: next, cost: current.cost + edge.cost,
        actions: current.actions + 1, dangers: current.dangers + Number(edge.dangerous),
        path: [...current.path, ...edge.path] };
      const previous = best.get(hexKey(next));
      if (!previous || comparePath(candidate, previous) < 0) {
        best.set(hexKey(next), candidate); open.push(candidate);
      }
    }
  }
  return null;
}

export function previewRegionPath(state: Readonly<GameState>, content: RegionRuntimeContent,
  destination: { readonly q: number; readonly r: number }): RegionPathPreview | null {
  const context = query(state, regionRuntimeForState(state, content)); if (!context) return null;
  const path = regionPath(context, destination); if (!path) return null;
  let waterRun = 0;
  for (const cell of path.path) {
    const terrain = context.cells.get(hexKey(cell))?.terrainId;
    waterRun = terrain === 'tr_shenshui' ? waterRun + 1 : 0;
    const tier = context.query.mover.qgTier;
    if ((tier === 3 && waterRun > 3) || (tier === 4 && waterRun > 6)) return null;
  }
  const previous = path.path[path.path.length - 2]; const last = path.path[path.path.length - 1]!;
  const facing = previous ? directionTo(previous, last) :
    state.world.navigation.mountedRegion?.facing ?? 0;
  return { path: path.path, cost: path.cost, destination, facing };
}
export function queryRegionPath(state: Readonly<GameState>, content: RegionRuntimeContent,
  destination: { readonly q: number; readonly r: number }): RegionPathQueryResult {
  const mounted = state.world.navigation.mountedRegion;
  if (!mounted) return { ok: false, reason: 'REGION_NOT_MOUNTED' };
  if (state.dialogue !== null || state.battle !== null || state.world.pendingTimeAdvance !== null ||
      state.world.navigation.pendingMount !== null)
    return { ok: false, reason: 'REGION_INTERACTION_BUSY' };
  const runtime = regionRuntimeForState(state, content);
  const map = regionMap(runtime, state.world.navigation.locationId);
  if (!map || map.regionId !== mounted.regionId)
    return { ok: false, reason: 'REGION_CONTENT_MISMATCH' };
  const context = query(state, runtime);
  const target = context?.cells.get(hexKey(destination));
  if (!target) return { ok: false, reason: 'REGION_PATH_NOT_STANDABLE' };
  if (!target.standable) return { ok: false, reason: terrainStandable(target.terrainId, 5, 3)
    ? 'REGION_PATH_QINGGONG' : 'REGION_PATH_NOT_STANDABLE' };
  const preview = previewRegionPath(state, runtime, destination);
  if (preview) return { ok: true, preview };
  const current = context?.cells.get(hexKey(mounted.playerHex));
  if (current && Math.abs(target.height - current.height) > 0)
    return { ok: false, reason: 'REGION_PATH_HEIGHT' };
  const maximal = { ...runtime, gateFacts: { ...runtime.gateFacts, qinggong: 200, swim: 3 } };
  return { ok: false, reason: previewRegionPath(state, maximal, destination)
    ? 'REGION_PATH_QINGGONG' : 'REGION_PATH_BLOCKED' };
}
function directionTo(from: { readonly q: number; readonly r: number },
  to: { readonly q: number; readonly r: number }): HexDir {
  const distance = hexDistance(from, to);
  const index = HEX_DIRECTIONS.findIndex((step) =>
    from.q + step.q * distance === to.q && from.r + step.r * distance === to.r);
  return (index < 0 ? 0 : index) as HexDir;
}

function consumed(state: Readonly<GameState>, anchorId: string): boolean {
  return state.world.navigation.mountedRegion?.entities.find((entry) => entry.anchorId === anchorId)
    ?.consumed === true;
}
function visibleAnchor(state: Readonly<GameState>, content: RegionRuntimeContent,
  target: { readonly q: number; readonly r: number }): boolean {
  const mounted = state.world.navigation.mountedRegion;
  const map = mounted && regionMap(content, state.world.navigation.locationId); if (!mounted || !map) return false;
  const decoded = decodeRegionMap(map, qinggongTier(content.gateFacts.qinggong),
    content.gateFacts.swim ?? 0);
  const dynamic = new Map(mounted.dynamicTiles.map((tile) => [hexKey(tile), tile]));
  const byKey = new Map(decoded.cells.map((cell) => {
    const tile = dynamic.get(hexKey(cell));
    return [hexKey(cell), tile ? { ...cell, terrainId: tile.terrainId } : cell] as const;
  }));
  return hexLineBetween(mounted.playerHex, target).every((cell) => {
    const tile = byKey.get(hexKey(cell)); return tile !== undefined && !OPAQUE.has(tile.terrainId);
  });
}
export function reachedRegionTriggers(state: Readonly<GameState>, content: RegionRuntimeContent,
  path: readonly { readonly q: number; readonly r: number }[]): readonly Extract<RegionObject,
    { class: 'Trigger' }>[] {
  const entities = state.world.navigation.mountedRegion?.entities ?? [];
  const consumedIds = new Set(entities.filter((entry) => entry.consumed)
    .map((entry) => entry.anchorId));
  const inactiveIds = new Set(entities.filter((entry) => !entry.active)
    .map((entry) => entry.anchorId));
  const cells = new Set(path.slice(1).map(hexKey));
  return regionObjects(content, state.world.navigation.locationId).filter((object): object is
    Extract<RegionObject, { class: 'Trigger' }> => object.class === 'Trigger' &&
    !inactiveIds.has(object.id) && (!object.once || !consumedIds.has(object.id)) &&
    object.cells.some((cell) => cells.has(hexKey(cell))));
}
export function consumeRegionEntity(mounted: MountedRegionState, anchorId: string): MountedRegionState {
  const existing = mounted.entities.find((entry) => entry.anchorId === anchorId);
  const entities = existing ? mounted.entities.map((entry) => entry.anchorId === anchorId
    ? { ...entry, consumed: true } : entry) : [...mounted.entities,
      { anchorId, active: true, consumed: true }];
  return { ...mounted, entities };
}
export function projectRegionDynamic(state: Readonly<GameState>,
  content: RegionRuntimeContent): RegionDynamicProjection | null {
  content = regionRuntimeForState(state, content);
  const mounted = state.world.navigation.mountedRegion; const sceneId = state.world.navigation.locationId;
  if (!mounted || !regionMap(content, sceneId)) return null;
  const objects = regionObjects(content, sceneId);
  const active = new Map(mounted.entities.map((entry) => [entry.anchorId, entry.active]));
  const interactableAnchors: RegionAnchorView[] = objects.filter((object) =>
    INTERACTIVE.has(object.class) && active.get(object.id) !== false && !consumed(state, object.id) &&
    hexDistance(mounted.playerHex, object) <= 1 && visibleAnchor(state, content, object)).map((object) => {
      const gate = objectGate(object, content); return { anchorId: object.id, class: object.class,
        hex: { q: object.q, r: object.r }, enabled: gate.allowed, reason: gate.reason };
    });
  const doors: RegionDoorView[] = objects.filter((object) => object.class === 'Door' ||
    object.class === 'QinggongGate').filter((object) => active.get(object.id) !== false).map((object) => {
      const gate = objectGate(object, content); return { anchorId: object.id, open: gate.allowed,
        locked: !gate.allowed, reason: gate.reason };
    });
  return { regionId: mounted.regionId, sceneId, spawnId: mounted.spawnId,
    playerHex: mounted.playerHex, facing: mounted.facing, interactableAnchors, doors,
    pendingMount: state.world.navigation.pendingMount };
}
export function projectRegionStatic(content: RegionRuntimeContent,
  sceneId: string): RegionStaticProjection | null {
  const map = regionMap(content, sceneId); return map ? { schemaVersion: 'region-static.v1',
    regionId: map.regionId, sceneId: map.id, bounds: map.bounds, terrainTable: map.terrainTable,
    chunks: map.chunks, objects: regionObjects(content, sceneId),
    backdropAssetKey: map.backdropAssetKey } : null;
}
