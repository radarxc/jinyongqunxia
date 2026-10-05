import type { MapEntry, MapPoint, WorldMapRuntimeDefinition } from '@tianshu/data/schemas';
import type { JsonValue } from '@tianshu/shared';
import type { EquipmentRule, LawEnforcementState } from '../economy';
import type { EventAnchor } from '../event';

export interface RoadLeg { readonly roadKey: string; readonly from: string; readonly to: string }
export type MapPosition =
  | { readonly kind: 'node'; readonly nodeId: string }
  | { readonly kind: 'road'; readonly leg: RoadLeg; readonly offsetLi: number };
export interface MapJourney {
  readonly id: number; readonly destination: string; readonly legs: readonly RoadLeg[];
  readonly legIndex: number; readonly offsetLi: number; readonly travelledLi: number;
  readonly totalLi: number; readonly status: 'walking' | 'paused' | 'encounter';
}
export interface SceneEntry extends MapEntry {
  readonly kind: 'town' | 'ruin'; readonly nodeId: string; readonly name: string;
  readonly chapterId: string; readonly era: string; readonly returnNodeId: string;
}
export interface WorldMapState {
  readonly version: 1; readonly mapRevision: string; readonly position: MapPosition;
  readonly journey: MapJourney | null; readonly nextJourneyId: number;
  readonly scene: SceneEntry | null; readonly law: LawEnforcementState;
  readonly lastMessage: string;
}
export interface WorldMapStaticProjection {
  readonly map: WorldMapRuntimeDefinition;
  readonly mapTextureUrl: string | null;
}
export interface WorldMapProjection {
  readonly point: MapPoint;
  readonly journey: MapJourney | null;
  readonly reachableNodeIds: readonly string[];
  readonly positionNodeId?: string | null;
  readonly scene?: SceneEntry | null;
  readonly law?: LawEnforcementState;
  readonly lastMessage?: string;
}
export interface WorldMapFullProjection extends WorldMapProjection {
  readonly positionNodeId: string | null;
  readonly scene: SceneEntry | null;
  readonly law: LawEnforcementState;
  readonly lastMessage: string;
}
export type WorldMapCommand =
  | { readonly t: 'worldmap/travel'; readonly nodeId: string }
  | { readonly t: 'worldmap/step'; readonly journeyId: number; readonly expectedTravelledLi: number }
  | { readonly t: 'worldmap/cancel' }
  | { readonly t: 'worldmap/resume' }
  | { readonly t: 'worldmap/enter' }
  | { readonly t: 'worldmap/leave' };
export interface TravelProbe {
  readonly chapterId: string; readonly roadKey: string; readonly journeyId: number;
  readonly distanceLi: number; readonly worldTick: number; readonly anchors: readonly EventAnchor[];
}
export interface WorldMapPorts {
  readonly encounter?: (probe: TravelProbe) =>
    { readonly command: string; readonly encounterId: string } | null;
}
export interface WorldMapContext {
  readonly map: WorldMapRuntimeDefinition; readonly equipmentRules: readonly EquipmentRule[];
  readonly identityTags: readonly string[]; readonly anchors?: readonly EventAnchor[];
  readonly ports?: WorldMapPorts;
}
export interface WorldMapFact { readonly t: string; readonly [key: string]: JsonValue }
