import { DAYS_PER_MONTH, MONTHS_PER_YEAR, projectWorldMap } from '@tianshu/core';
import type { UiProjection } from '@tianshu/ui';
import type { GameContent } from './runtime/content';
import { ALL_VIEWS, type DirtyView, type GameProjection, type SessionSnapshot } from './runtime/contracts';
import { projectCharacters } from './selectors/characters';
import { projectItem } from './selectors/items';

export function projectHud(session: SessionSnapshot): UiProjection['hud'] {
  const { state } = session;
  const player = state.profile.protagonist;
  const clock = state.chapter.clock;
  const periods = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  return { name: '无名侠客', hp: { current: player?.resources.hp ?? 0, maximum: player?.stats.hpMax ?? 0 },
    mp: { current: player?.resources.mp ?? 0, maximum: player?.stats.mpMax ?? 0 }, action: null,
    date: `${state.chapter.worldYear}年 ${clock.monthIndex % MONTHS_PER_YEAR + 1}月 ${clock.dayIndex % DAYS_PER_MONTH + 1}日 ${periods[clock.slotInDay]}时`,
    location: session.location, money: state.party.money, preview: session.preview };
}

/** Only dirty branches are allocated; unchanged list references survive event batches. */
export function createSelectors(content: GameContent) {
  const items = new Map(content.items.map((item) => [item.id, item]));
  let view: GameProjection | undefined;
  function update(session: SessionSnapshot, dirty: readonly DirtyView[], status = ''): Partial<GameProjection> {
    const marked = new Set(view ? dirty : ALL_VIEWS);
    const changes: Partial<GameProjection> = { title: '天书录', coreVersion: session.state.meta.coreVersion,
      worldTick: session.state.meta.worldTick, status,
      ...(marked.has('hud') ? { hud: projectHud(session) } : {}),
      ...(marked.has('characters') ? { characters: projectCharacters(session, content) } : {}),
      ...(marked.has('inventory') ? { inventory: session.state.party.inventory.stacks.map((stack) => {
        const item = items.get(stack.itemId);
        if (!item) throw new Error('PROJECTION_ITEM_UNKNOWN');
        return projectItem(item, stack.count, content.assets);
      }) } : {}),
      ...(marked.has('equipment') ? { equipment: session.state.party.equipment.entries.map((entry) => {
        const item = entry.itemId ? items.get(entry.itemId) : undefined;
        return { slot: entry.slot, item: item ? projectItem(item, 1, content.assets) : null };
      }) } : {}),
      ...(marked.has('quests') ? { quests: session.state.chapter.story.lines
        .filter((line) => line.status !== 'locked').map((line) => ({ id: line.lineId, name: line.lineId, status: line.status })) } : {}),
      ...(marked.has('worldmap') ? { worldmap: session.state.chapter.worldMap && content.worldMaps
        ? (() => {
          const map = content.worldMaps.find((entry) => entry.chapterId === session.state.chapter.chapterId)!;
          const texture = content.assets?.[`ref_map_jianghu__${map.era}_base01`]?.map ?? null;
          return projectWorldMap(map, session.state.chapter.worldMap, texture);
        })() : null } : {}),
    };
    view = { ...view, ...changes } as GameProjection;
    return changes;
  }
  return { update, query: (): GameProjection => {
    if (!view) throw new Error('PROJECTION_NOT_INITIALIZED');
    return view;
  } };
}
