export type Brand<Value, Name extends string> = Value & { readonly __brand: Name };
type NamedId<Prefix extends string, Name extends string> = Brand<`${Prefix}${string}`, Name>;

export type ChapterId = Brand<`ch${number}_${string}`, 'ChapterId'>;
export type SkillId = NamedId<'sk_', 'SkillId'>;
export type MoveId = NamedId<'mv_', 'MoveId'>;
export type BuffId = NamedId<'bf_', 'BuffId'>;
export type ItemId = Brand<`it_${string}` | `eq_${string}`, 'ItemId'>;
export type NpcId = NamedId<'npc_', 'NpcId'>;
export type QuestId = NamedId<'q_', 'QuestId'>;
export type RegionId = NamedId<'rg_', 'RegionId'>;
export type EventId = NamedId<'ev_', 'EventId'>;
export type SetId = NamedId<'set_', 'SetId'>;
export type TerrainId = NamedId<'tr_', 'TerrainId'>;
export type SectId = NamedId<'sect_', 'SectId'>;
export type SceneId = Brand<`sc_${number}_${string}`, 'SceneId'>;
export type CityId = NamedId<'city_', 'CityId'>;
export type MeridianId = NamedId<'mer_', 'MeridianId'>;
export type AcupointId = NamedId<'ap_', 'AcupointId'>;

export function hasIdPrefix<Prefix extends string>(
  value: string,
  prefix: Prefix,
): value is `${Prefix}${string}` {
  return value.startsWith(prefix) && value.length > prefix.length;
}

export function asSkillId(value: string): SkillId {
  if (!/^sk_[a-z0-9]+(?:_[a-z0-9]+)*$/.test(value)) throw new TypeError('INVALID_SKILL_ID');
  return value as SkillId;
}
