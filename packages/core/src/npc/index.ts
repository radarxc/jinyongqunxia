import { clampInt, compareCodePoints } from '@tianshu/shared';

export interface NpcPresence {
  readonly npcId: string; readonly eraLayer: string; readonly sceneId: string;
  readonly anchor: string; readonly sourceLineId: string; readonly sourceNodeId: string;
}
export interface NpcRelationship {
  readonly npcId: string; readonly affinity: number; readonly bond: number;
  readonly resentment: number;
}
export interface NpcWorldState {
  readonly presences: readonly NpcPresence[]; readonly relationships: readonly NpcRelationship[];
}
export const EMPTY_NPC_WORLD: NpcWorldState = { presences: [], relationships: [] };

function presenceKey(value: NpcPresence): string {
  return `${value.eraLayer}/${value.npcId}`;
}
export function spawnNpc(state: NpcWorldState, presence: NpcPresence): NpcWorldState {
  const key = presenceKey(presence);
  const current = state.presences.find((entry) => presenceKey(entry) === key);
  if (current !== undefined) {
    if (current.sceneId === presence.sceneId && current.anchor === presence.anchor) return state;
    throw new TypeError(`NPC_PRESENCE_CONFLICT:${key}`);
  }
  const presences = [...state.presences];
  presences.push(presence);
  presences.sort((left, right) => compareCodePoints(presenceKey(left), presenceKey(right)));
  return { ...state, presences };
}
export function despawnNpc(
  state: NpcWorldState, npcId: string, eraLayer: string,
): NpcWorldState {
  return { ...state, presences: state.presences.filter(
    (entry) => entry.npcId !== npcId || entry.eraLayer !== eraLayer,
  ) };
}
export function queryNpcPresence(
  state: NpcWorldState, npcId: string, eraLayer: string,
): NpcPresence | undefined {
  return state.presences.find((entry) => entry.npcId === npcId && entry.eraLayer === eraLayer);
}
export function setNpcRelationship(
  state: NpcWorldState, npcId: string, delta: Partial<Omit<NpcRelationship, 'npcId'>>,
): NpcWorldState {
  const current = state.relationships.find((entry) => entry.npcId === npcId) ??
    { npcId, affinity: 0, bond: 0, resentment: 0 };
  const next: NpcRelationship = { npcId,
    affinity: clampInt(current.affinity + (delta.affinity ?? 0), -100, 100),
    bond: clampInt(current.bond + (delta.bond ?? 0), 0, 100),
    resentment: clampInt(current.resentment + (delta.resentment ?? 0), 0, 100) };
  const relationships = state.relationships.filter((entry) => entry.npcId !== npcId);
  relationships.push(next);
  relationships.sort((left, right) => compareCodePoints(left.npcId, right.npcId));
  return { ...state, relationships };
}
