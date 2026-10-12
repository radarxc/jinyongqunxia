import type { FacilityDialogueDef, TownFacility, TownFacilitiesDef } from '@tianshu/data/schemas';
import type { CoreContent } from '../command';
import type { GameState } from '../state';
import { evaluateGate } from '../world/region-gates';
import { regionRuntimeForState } from '../world/region-runtime';
import type { FacilityDialogueContext } from './context-validate';

declare module '../command' {
  interface CoreContent {
    readonly facilityDialogues?: readonly FacilityDialogueDef[];
  }
}

export interface FacilityDialogueTarget {
  readonly sceneId: string;
  readonly facilityKey: string;
  readonly roleKey: string;
}
export interface ResolvedFacilityDialogue {
  readonly storyId: string;
  readonly entryKey: string;
  readonly nameKey: string;
  readonly context: FacilityDialogueContext;
}
interface TownLayoutContent {
  readonly towns?: CoreContent['towns'];
  readonly region?: Pick<NonNullable<CoreContent['region']>, 'maps'>;
}

/** Resolves facilities from authored layout identity, never from the active chapter era. */
export function currentTownLayoutKey(
  state: Readonly<GameState>,
  content: TownLayoutContent,
  sceneId = state.chapter.town?.sceneId,
): string | undefined {
  if (sceneId === undefined) return undefined;
  const regionLayout = content.region?.maps.find((map) => map.id === sceneId)?.town?.layoutKey;
  if (regionLayout !== undefined) return regionLayout;
  const active = state.chapter.town;
  if (active?.sceneId !== sceneId) return undefined;
  const definition = content.towns?.find((town) => town.sceneId === active.sceneId);
  return definition === undefined ? undefined : `${definition.cityId}__${definition.chapterId}`;
}
function layout(content: CoreContent, key: string): TownFacilitiesDef | undefined {
  return content.townFacilities?.find((entry) => entry.layoutKey === key);
}
function soleOffTownLayout(content: CoreContent, sceneId: string): string | undefined {
  const prefix = `${sceneId}__`;
  const candidates = content.townFacilities?.filter((entry) => entry.layoutKey.startsWith(prefix));
  return candidates?.length === 1 ? candidates[0]!.layoutKey : undefined;
}
function shopKey(layoutKey: string, facility: TownFacility): string | null {
  if (facility.shop === null) return null;
  const explicit = facility.shop as typeof facility.shop & { readonly instanceKey?: string };
  return explicit.instanceKey ?? `${layoutKey}/${facility.key}`;
}

export function resolveFacilityDialogue(
  state: Readonly<GameState>,
  content: CoreContent,
  target: FacilityDialogueTarget,
): ResolvedFacilityDialogue {
  // Direct off-town callers predate town definitions; accept only an unambiguous authored layout.
  const key =
    currentTownLayoutKey(state, content, target.sceneId) ??
    (state.chapter.town === null ? soleOffTownLayout(content, target.sceneId) : undefined);
  const facility =
    key === undefined
      ? undefined
      : layout(content, key)?.facilities.find((entry) => entry.key === target.facilityKey);
  if (key === undefined || facility === undefined || !facility.roles.includes(target.roleKey))
    throw new TypeError('FACILITY_DIALOGUE_MISSING');
  const bindings = content.facilityDialogues?.flatMap((entry) => entry.bindings) ?? [];
  const runtime = regionRuntimeForState(
    state,
    content.region ?? {
      maps: [],
      gateFacts: { qinggong: 0 },
    },
  );
  const candidates = bindings
    .map((binding, ordinal) => ({ binding, ordinal }))
    .filter(
      ({ binding }) =>
        (binding.chapter === state.chapter.chapterId || binding.chapter === 'common') &&
        binding.kind === facility.kind &&
        (binding.sub === undefined || binding.sub === facility.sub) &&
        binding.roleKey === target.roleKey &&
        (binding.condition === undefined ||
          evaluateGate(binding.condition, runtime.gateFacts).allowed),
    );
  candidates.sort(
    (left, right) =>
      Number(right.binding.sub !== undefined) - Number(left.binding.sub !== undefined) ||
      Number(right.binding.condition !== undefined) -
        Number(left.binding.condition !== undefined) ||
      Number(right.binding.chapter === state.chapter.chapterId) -
        Number(left.binding.chapter === state.chapter.chapterId) ||
      left.ordinal - right.ordinal,
  );
  const binding: FacilityDialogueDef['bindings'][number] | undefined = candidates[0]?.binding;
  if (binding === undefined) throw new TypeError('FACILITY_DIALOGUE_MISSING');
  return {
    storyId: binding.storyId,
    entryKey: binding.entryKey,
    nameKey: facility.nameKey,
    context: {
      kind: 'facility',
      sceneId: target.sceneId,
      facilityKey: facility.key,
      roleKey: target.roleKey,
      shopKey: shopKey(key, facility),
      interlocutorNameKey: facility.nameKey,
    },
  };
}
