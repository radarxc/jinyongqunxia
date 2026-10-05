import { DAYS_PER_MONTH, MONTHS_PER_YEAR, projectWorldMap,
  projectWorldMapStatic } from '@tianshu/core/projection';
import type { UiProjection } from '@tianshu/ui';
import type { EquipmentVisuals } from '@tianshu/render/rig';
import type { TownAnchorView, TownNpcView } from '@tianshu/render/town';
import type { TownRuntimeDefinition } from '@tianshu/data/schemas';
import { projectCharacters } from '../selectors/characters';
import { projectItem } from '../selectors/items';
import { ALL_VIEWS, type DirtyView, type GameProjection, type SessionSnapshot } from './contracts';
import type { GameContent } from './content';

function projectHud(session: SessionSnapshot, content?: GameContent): UiProjection['hud'] {
  const player = session.profile.protagonist; const clock = session.chapter.clock;
  const periods = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  return { name: '无名侠客',
    hp: { current: player?.resources.hp ?? 0, maximum: player?.stats.hpMax ?? 0 },
    mp: { current: player?.resources.mp ?? 0, maximum: player?.stats.mpMax ?? 0 }, action: null,
    date: `${session.chapter.worldYear}年 ${clock.monthIndex % MONTHS_PER_YEAR + 1}月 ${clock.dayIndex % DAYS_PER_MONTH + 1}日 ${periods[clock.slotInDay]}时`,
    location: projectLocation(session, content), money: session.party.money,
    preview: session.meta.debugTainted };
}
function projectLocation(state: SessionSnapshot, content?: GameContent): string {
  const town = state.chapter.town && content?.towns?.find((row) =>
    row.sceneId === state.chapter.town?.sceneId);
  if (town) return town.displayName;
  const map = content?.worldMaps?.find((row) => row.chapterId === state.chapter.chapterId);
  if (map && state.chapter.worldMap) {
    if (state.chapter.worldMap.scene) return state.chapter.worldMap.scene.name;
    const position = state.chapter.worldMap.position;
    if (position.kind === 'road') return '江湖 · 旅途中';
    return map.nodes.find((node) => node.id === position.nodeId)?.name ?? '江湖';
  }
  return state.world.navigation.locationId;
}
function equipmentVisuals(session: SessionSnapshot): EquipmentVisuals {
  return Object.fromEntries(session.party.equipment.entries.flatMap((entry) =>
    entry.itemId ? [[entry.slot, entry.itemId]] : [])) as EquipmentVisuals;
}
function projectTown(session: SessionSnapshot, content: GameContent,
  selected?: TownRuntimeDefinition): GameProjection['town'] {
  const state = session.chapter.town; if (!state) return null;
  const runtime = selected ?? content.towns?.find((entry) => entry.sceneId === state.sceneId);
  if (!runtime || runtime.revision !== state.townRevision) throw new Error('PROJECTION_TOWN_UNKNOWN');
  const era = session.chapter.worldMap?.scene?.era; const npcWorld = content.townNpcWorld;
  const npcs: TownNpcView[] = (content.townNpcPlacements ?? []).filter((entry) =>
    entry.sceneId === runtime.sceneId && entry.eraLayer === era &&
    (!npcWorld || npcWorld.presences.some((presence) => presence.npcId === entry.npcId &&
      presence.eraLayer === entry.eraLayer && presence.sceneId === entry.sceneId)))
    .map((entry) => ({ npcId: entry.npcId, point: entry.point,
      ...(entry.direction === undefined ? {} : { direction: entry.direction }),
      equipment: {}, interactive: true }));
  const anchors: TownAnchorView[] = runtime.anchors.map((entry) => ({ id: entry.id,
    kind: entry.kind, point: entry.point, label: entry.kind === 'meditation' ? '打坐' : '进入',
    ...(entry.buildingId ? { buildingId: entry.buildingId } : {}),
    active: entry.kind === 'building' ? entry.buildingId !== state.buildingId :
      entry.buildingId === null || (entry.buildingId === state.buildingId &&
        state.buildingPhase === 'inside') }));
  for (const entry of content.townEventAnchors ?? []) if (entry.sceneId === runtime.sceneId &&
      entry.kind === 'location') anchors.push({ id: entry.id, kind: 'location',
    point: [entry.point.q, entry.point.r], label: '事件', active: true });
  for (const npc of npcs) anchors.push({ id: `anchor_npc_${npc.npcId}`, kind: 'npc',
    point: npc.point, label: '交谈', npcId: npc.npcId, active: npc.interactive });
  return { location: runtime.displayName, canLeave: state.buildingPhase === 'outside', scene: {
    actor: { point: state.point, walking: false, direction: 1, equipment: equipmentVisuals(session) },
    npcs, anchors, activeBuildingId: state.buildingId, buildingPhase: state.buildingPhase } };
}
function worldPaused(state: SessionSnapshot): boolean {
  return state.dialogue !== null || state.battle !== null || state.world.pendingTimeAdvance !== null ||
    state.chapter.town?.buildingPhase === 'fading-in' ||
    state.chapter.town?.buildingPhase === 'fading-out';
}

/** Worker projection entry mirrors the public selector without importing core's root barrel. */
export function createSessionSelectors(content: GameContent,
  selectedTown: () => TownRuntimeDefinition | undefined = () => undefined) {
  const items = new Map(content.items.map((item) => [item.id, item])); let view: GameProjection | undefined;
  function update(session: SessionSnapshot, dirty: readonly DirtyView[], status = '',
    dynamicOnly = false): Partial<GameProjection> {
    const marked = new Set(view ? dirty : ALL_VIEWS);
    const map = marked.has('worldmap') && session.chapter.worldMap && content.worldMaps
      ? content.worldMaps.find((entry) => entry.chapterId === session.chapter.chapterId)! : undefined;
    const texture = map ? content.assets?.[`ref_map_jianghu__${map.era}_base01`]?.map ?? null : null;
    const staticChanged = marked.has('worldmap') && (!view || (map
      ? view.worldmapStatic?.map !== map : view.worldmapStatic !== null));
    const changes: Partial<GameProjection> = { title: '天书录', coreVersion: session.meta.coreVersion,
      worldTick: session.meta.worldTick, status, worldPaused: worldPaused(session),
      ...(marked.has('hud') ? { hud: projectHud(session, content) } : {}),
      ...(marked.has('characters') ? { characters: projectCharacters(session, content) } : {}),
      ...(marked.has('inventory') ? { inventory: session.party.inventory.stacks.map((stack) => {
        const item = items.get(stack.itemId); if (!item) throw new Error('PROJECTION_ITEM_UNKNOWN');
        return projectItem(item, stack.count, content.assets); }) } : {}),
      ...(marked.has('equipment') ? { equipment: session.party.equipment.entries.map((entry) => {
        const item = entry.itemId ? items.get(entry.itemId) : undefined;
        return { slot: entry.slot, item: item ? projectItem(item, 1, content.assets) : null }; }) } : {}),
      ...(marked.has('quests') ? { quests: session.chapter.story.lines.filter((line) =>
        line.status !== 'locked').map((line) => ({ id: line.lineId, name: line.lineId,
          status: line.status })) } : {}),
      ...(marked.has('worldmap') ? { worldmap: map && session.chapter.worldMap
        ? projectWorldMap(map, session.chapter.worldMap) : null } : {}),
      ...(staticChanged ? { worldmapStatic: map ? projectWorldMapStatic(map, texture) : null } : {}),
      ...(marked.has('town') ? { town: projectTown(session, content, selectedTown()) } : {}),
      ...(marked.has('townRuntime') ? { townRuntime: session.chapter.town
        ? selectedTown() ?? content.towns?.find((entry) =>
          entry.sceneId === session.chapter.town?.sceneId) ?? null : null } : {}) };
    view = { ...view, ...changes } as GameProjection;
    if (!dynamicOnly || changes.worldmap === undefined) return changes;
    const full = changes.worldmap; return { ...changes, worldmap: full ? { point: full.point,
      journey: full.journey, reachableNodeIds: full.reachableNodeIds } : null };
  }
  return { update, query: () => { if (!view) throw new Error('PROJECTION_NOT_INITIALIZED'); return view; } };
}
