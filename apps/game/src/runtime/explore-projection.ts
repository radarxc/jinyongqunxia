import type { PriceTableDef, ShopTemplateDef } from '@tianshu/data/schemas';
import { currentTownLayoutKey } from '@tianshu/core/dialogue';
import type { DirtyView, GameProjection, SessionSnapshot } from './contracts';
import type { GameContent } from './content';

declare module './content' {
  interface GameContent {
    readonly shopTemplates?: readonly ShopTemplateDef[];
    readonly priceTables?: readonly PriceTableDef[];
  }
}

function currentFacility(
  session: SessionSnapshot,
  content: GameContent,
  townDefinition: GameProjection['townRuntime'],
) {
  const town = session.chapter.town;
  if (!town?.buildingId || town.buildingPhase !== 'inside') return null;
  const layoutKey = currentTownLayoutKey(
    session,
    {
      ...(townDefinition === null ? {} : { towns: [townDefinition] }),
      region: { maps: content.regionMaps ?? [] },
    },
    town.sceneId,
  );
  if (layoutKey === undefined) return null;
  const facility = content.townFacilities
    ?.find((entry) => entry.layoutKey === layoutKey)
    ?.facilities.find((entry) => entry.buildingId === town.buildingId);
  if (!facility) return null;
  return {
    key: facility.key,
    kind: facility.kind,
    nameKey: facility.nameKey,
    shopKey: facility.shop ? `${layoutKey}/${facility.key}` : null,
  };
}

export function exploreWorldPaused(state: SessionSnapshot): boolean {
  return (
    state.dialogue !== null ||
    state.battle !== null ||
    state.world.pendingTimeAdvance !== null ||
    state.chapter.town?.buildingPhase === 'fading-in' ||
    state.chapter.town?.buildingPhase === 'fading-out'
  );
}

interface ProjectionSelectors {
  readonly update: (
    session: SessionSnapshot,
    dirty: readonly DirtyView[],
    status?: string,
    dynamicOnly?: boolean,
  ) => Partial<GameProjection>;
  readonly query: () => GameProjection;
}

/** Adds facility and pause fields to the existing v1 town projection without recomputing it. */
export function createExploreProjection(
  base: ProjectionSelectors,
  content: GameContent,
): ProjectionSelectors {
  let initialized = false;
  let facility: Exclude<NonNullable<GameProjection['town']>['facility'], undefined> = null;
  let paused = false;
  return {
    update(session, dirty, status = '', dynamicOnly = false) {
      const changes = base.update(session, dirty, status, dynamicOnly);
      const townDirty = !initialized || dirty.includes('town');
      paused = exploreWorldPaused(session);
      const townDefinition =
        changes.townRuntime !== undefined ? changes.townRuntime : base.query().townRuntime;
      if (townDirty) facility = currentFacility(session, content, townDefinition);
      initialized = true;
      const town = changes.town;
      return {
        ...changes,
        worldPaused: paused,
        ...(town !== undefined ? { town: town ? { ...town, facility } : null } : {}),
      };
    },
    query() {
      if (!initialized) throw new Error('PROJECTION_NOT_INITIALIZED');
      const projected = base.query();
      return {
        ...projected,
        worldPaused: paused,
        town: projected.town ? { ...projected.town, facility } : null,
      };
    },
  };
}
