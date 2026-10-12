import type { TownCommand, TownPoint } from '@tianshu/core';
import type { FacilityKind } from '@tianshu/data/schemas';
import type { TownAnchorView } from '@tianshu/render/town';
import { V1_CONTEXT_ACTION_STRINGS as strings } from './v1-context-actions.strings';

export type V1ContextIntent =
  | { readonly kind: 'town'; readonly command: TownCommand }
  | { readonly kind: 'leave' };

export interface V1ContextAction {
  readonly id: string; readonly verb: string; readonly label: string; readonly enabled: boolean;
  readonly reason: string; readonly hotkey: string; readonly intent: V1ContextIntent;
}

export interface V1FacilityActionView {
  readonly key: string; readonly kind: FacilityKind; readonly nameKey: string;
  readonly shopKey: string | null;
}

export interface V1ContextActionInput {
  readonly actor: TownPoint; readonly anchors: readonly TownAnchorView[];
  readonly facility?: V1FacilityActionView | null; readonly facilityName?: string;
  readonly inside: boolean; readonly canLeave: boolean; readonly busy: boolean;
}

function samePoint(left: TownPoint, right: TownPoint): boolean {
  return left[0] === right[0] && left[1] === right[1];
}

export function v1AnchorCommand(anchor: TownAnchorView, actor: TownPoint): TownCommand {
  const here = samePoint(anchor.point, actor);
  if (anchor.kind === 'npc' && here && anchor.npcId)
    return { t: 'town/interact', npcId: anchor.npcId };
  if (anchor.kind === 'meditation' && here)
    return { t: 'town/meditate', anchorId: anchor.id, plannedTicks: 600 };
  return { t: 'town/move', destination: anchor.point,
    ...(anchor.kind === 'building' && anchor.buildingId ? { buildingId: anchor.buildingId } : {}) };
}

function anchorAction(anchor: TownAnchorView, actor: TownPoint, busy: boolean): V1ContextAction {
  const verb = anchor.kind === 'npc' ? strings.verbs.talk
    : anchor.kind === 'building' ? strings.verbs.enter
      : anchor.kind === 'meditation' ? strings.verbs.meditate : strings.verbs.inspect;
  return action(`anchor:${anchor.id}`, verb, anchor.label, busy,
    { kind: 'town', command: v1AnchorCommand(anchor, actor) });
}

function action(id: string, verb: string, label: string, busy: boolean,
  intent: V1ContextIntent): V1ContextAction {
  return { id, verb, label, enabled: !busy, reason: busy ? strings.busy : '',
    hotkey: '', intent };
}

/** Projects v1 core-owned anchors and the current facility into a three-action presentation strip. */
export function createV1ContextActions(input: V1ContextActionInput): readonly V1ContextAction[] {
  const result: V1ContextAction[] = [];
  const add = (entry: V1ContextAction): void => { if (result.length < 3) result.push(entry); };
  if (input.inside && input.facility) {
    const name = input.facilityName || strings.facilityNames[input.facility.kind];
    add(action(`facility:${input.facility.key}`, strings.verbs.talk, `与${name}店员交谈`,
      input.busy, { kind: 'town', command: { t: 'town/interact' } }));
  }
  const local = input.anchors.filter((anchor) =>
    anchor.active !== false && samePoint(anchor.point, input.actor) &&
    !(input.inside && anchor.kind === 'building'));
  const reserveTail = input.inside || input.canLeave ? 1 : 0;
  for (const anchor of local.slice(0, Math.max(0, 3 - result.length - reserveTail)))
    add(anchorAction(anchor, input.actor, input.busy));
  if (input.inside) add(action('leave-building', strings.verbs.leaveBuilding,
    strings.labels.leaveBuilding, input.busy, { kind: 'town', command: { t: 'town/exit-building' } }));
  else if (input.canLeave) add(action('leave-town', strings.verbs.leaveTown,
    strings.labels.leaveTown, input.busy, { kind: 'leave' }));
  const firstEnabled = result.findIndex((entry) => entry.enabled);
  return result.map((entry, index) => ({ ...entry, hotkey: index === firstEnabled ? 'F' : '' }));
}

export function facilityPresentation(kind: FacilityKind, name?: string):
{ readonly icon: string; readonly label: string } {
  return { icon: strings.facilityIcons[kind], label: name || strings.facilityNames[kind] };
}
