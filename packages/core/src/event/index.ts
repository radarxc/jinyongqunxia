import { compareCodePoints, type JsonValue } from '@tianshu/shared';
import type { EventPresentationAction } from '@tianshu/data/schemas';
export { executeAction, executeActions, executeEvent, type ActionExecutionContext } from './event-executor';
export type { EventPresentationAction };

/** Presentation boundary consumed by the game UI; core never performs these steps. */
export interface EventPresentedPayload {
  readonly eventId: string;
  readonly steps: readonly EventPresentationAction[];
}

/** Committed core facts share one causal envelope; localized text never enters it. */
export interface CommittedDomainEvent<T extends string = string, P extends JsonValue = JsonValue> {
  readonly t: T; readonly seq: number; readonly stateVersion: number;
  readonly causeId: string; readonly parentSeq: number | null; readonly payload: P;
}
/** Battle remains outside the command bus until ENG-16c and uses this transport-only shape. */
export interface LegacyDomainEvent<T extends string = string, P extends JsonValue = JsonValue> {
  readonly t: T; readonly payload: P;
}
export type DomainEvent<T extends string = string, P extends JsonValue = JsonValue> =
  CommittedDomainEvent<T, P> | LegacyDomainEvent<T, P>;
export interface PendingDomainEvent<T extends string = string, P extends JsonValue = JsonValue> {
  readonly t: T; readonly payload: P; readonly parent?: 'root' | null;
}

export type AnchorKind = 'npc' | 'location';
export type AnchorTrigger =
  | 'interact' | 'enter' | 'exit' | 'approach' | 'map-enter' | 'map-exit';
export interface AnchorGridPoint { readonly q: number; readonly r: number; readonly z?: number; }
interface BaseEventAnchor {
  readonly id: string; readonly sceneId: string;
  readonly trigger: AnchorTrigger; readonly lineId: string; readonly nodeId: string;
}
export interface NpcEventAnchor extends BaseEventAnchor {
  readonly kind: 'npc'; readonly npcId: string;
}
export interface LocationEventAnchor extends BaseEventAnchor {
  readonly kind: 'location'; readonly point: AnchorGridPoint; readonly radius?: number;
}
export type EventAnchor = NpcEventAnchor | LocationEventAnchor;
export type EventAnchorProbe =
  | { readonly kind: 'npc'; readonly sceneId: string; readonly trigger: AnchorTrigger;
      readonly npcId: string }
  | { readonly kind: 'location'; readonly sceneId: string; readonly trigger: AnchorTrigger;
      readonly point: AnchorGridPoint };

function compareAnchors(left: EventAnchor, right: EventAnchor): number {
  return compareCodePoints(left.id, right.id);
}
function validateAnchor(anchor: EventAnchor): void {
  const kinds: readonly AnchorKind[] = ['npc', 'location'];
  const triggers: readonly AnchorTrigger[] =
    ['interact', 'enter', 'exit', 'approach', 'map-enter', 'map-exit'];
  if (anchor.id.length === 0 || anchor.sceneId.length === 0 ||
      anchor.lineId.length === 0 || anchor.nodeId.length === 0)
    throw new TypeError('ANCHOR_ID');
  if (!kinds.includes(anchor.kind)) throw new TypeError('ANCHOR_KIND');
  if (!triggers.includes(anchor.trigger)) throw new TypeError('ANCHOR_TRIGGER');
  if (anchor.kind === 'npc' &&
      (!('npcId' in anchor) || typeof anchor.npcId !== 'string' || anchor.npcId.length === 0))
    throw new TypeError('ANCHOR_NPC');
  if (anchor.kind === 'location' && (!('point' in anchor) || anchor.point === undefined))
    throw new TypeError('ANCHOR_POINT');
  const integers = anchor.kind === 'location'
    ? [anchor.point.q, anchor.point.r, anchor.point.z ?? 0] : [];
  if (integers.some((value) => !Number.isSafeInteger(value))) throw new TypeError('ANCHOR_POINT');
  if (anchor.kind === 'location' && anchor.radius !== undefined &&
      (!Number.isSafeInteger(anchor.radius) || anchor.radius < 0)) throw new TypeError('ANCHOR_RADIUS');
}

/** Immutable scene-bucketed lookup; a query never scans anchors from another scene. */
export class EventAnchorRegistry {
  readonly #byScene: ReadonlyMap<string, readonly EventAnchor[]>;
  public constructor(anchors: readonly EventAnchor[]) {
    const ids = new Set<string>();
    const buckets = new Map<string, EventAnchor[]>();
    for (const anchor of anchors) {
      validateAnchor(anchor);
      if (ids.has(anchor.id)) throw new TypeError(`ANCHOR_DUPLICATE:${anchor.id}`);
      ids.add(anchor.id);
      const bucket = buckets.get(anchor.sceneId) ?? [];
      bucket.push(anchor); buckets.set(anchor.sceneId, bucket);
    }
    const frozen = new Map<string, readonly EventAnchor[]>();
    for (const [sceneId, bucket] of buckets) {
      bucket.sort(compareAnchors); frozen.set(sceneId, Object.freeze([...bucket]));
    }
    this.#byScene = frozen;
  }
  public queryScene(sceneId: string): readonly EventAnchor[] {
    return this.#byScene.get(sceneId) ?? [];
  }
  public query(sceneId: string, trigger: AnchorTrigger): readonly EventAnchor[] {
    return this.queryScene(sceneId).filter((anchor) => anchor.trigger === trigger);
  }
  public match(probe: EventAnchorProbe): readonly EventAnchor[] {
    return this.query(probe.sceneId, probe.trigger).filter((anchor) => {
      if (probe.kind === 'npc') return anchor.kind === 'npc' && anchor.npcId === probe.npcId;
      if (anchor.kind !== 'location') return false;
      const radius = anchor.radius ?? 0;
      const dq = probe.point.q - anchor.point.q;
      const dr = probe.point.r - anchor.point.r;
      return Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr)) <= radius;
    });
  }
  public resolve(probe: EventAnchorProbe): readonly { readonly lineId: string; readonly nodeId: string }[] {
    return this.match(probe).map(({ lineId, nodeId }) => ({ lineId, nodeId }));
  }
}
