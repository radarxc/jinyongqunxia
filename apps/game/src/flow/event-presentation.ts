import type { DomainEvent, EventPresentationAction } from '@tianshu/core';

export interface PresentedEvent {
  readonly eventId: string;
  readonly steps: readonly EventPresentationAction[];
}

function record(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function stringAt(value: Readonly<Record<string, unknown>>, key: string): boolean {
  return typeof value[key] === 'string' && value[key].length > 0;
}

function presentationStep(value: unknown): value is EventPresentationAction {
  if (!record(value) || typeof value['op'] !== 'string') return false;
  switch (value['op']) {
    case 'battle/start':
      return stringAt(value, 'encounter');
    case 'tutorial/mark':
      return stringAt(value, 'tutorial') && stringAt(value, 'state');
    case 'story/requestTransmission':
      return stringAt(value, 'skill') && stringAt(value, 'source');
    case 'ui/openAllocation':
      return stringAt(value, 'mode');
    case 'ui/showTitleCard':
      return stringAt(value, 'card');
    case 'dialogue/speaker':
      return stringAt(value, 'speaker');
    case 'dialogue/start':
      return stringAt(value, 'storyId') && stringAt(value, 'knot');
    case 'ui/showText':
      return stringAt(value, 'textKey') || stringAt(value, 'text');
    case 'ui/revealText':
      return stringAt(value, 'textKey');
    case 'ui/observeOnly':
      return true;
    case 'world/loadScene':
      return (
        stringAt(value, 'regionId') && stringAt(value, 'sceneId') && stringAt(value, 'spawnId')
      );
    default:
      return false;
  }
}

/** Validates the core-to-presentation boundary without importing runtime schemas into the UI. */
export function presentedEvent(event: Pick<DomainEvent, 't' | 'payload'>): PresentedEvent | null {
  if (event.t !== 'world/eventPresented' || !record(event.payload)) return null;
  const eventId = event.payload['eventId'];
  const steps = event.payload['steps'];
  if (
    typeof eventId !== 'string' ||
    eventId.length === 0 ||
    !Array.isArray(steps) ||
    !steps.every(presentationStep)
  )
    return null;
  return { eventId, steps };
}
