import { describe, expect, it } from 'vitest';
import { presentedEvent } from './event-presentation';

describe('event presentation boundary', () => {
  it('keeps validated actions in authored order', () => {
    const value = presentedEvent({
      t: 'world/eventPresented',
      payload: {
        eventId: 'ev_10_cold_entry_arrival',
        steps: [
          {
            op: 'dialogue/start',
            storyId: 'story_ch10_cold_entry',
            knot: 'westward_journey',
            presentation: 'text_stills',
          },
          { op: 'ui/revealText', textKey: 'ch10.coldEntry.eraTitle' },
          {
            op: 'world/loadScene',
            regionId: 'rg_xiyu_beijiang',
            sceneId: 'sc_10_fengshi_feiyi',
            spawnId: 'cold_open',
          },
        ],
      },
    });
    expect(value?.steps.map((step) => step.op)).toEqual([
      'dialogue/start',
      'ui/revealText',
      'world/loadScene',
    ]);
  });

  it('rejects malformed and unknown presentation actions', () => {
    expect(
      presentedEvent({
        t: 'world/eventPresented',
        payload: { eventId: 'ev_bad', steps: [{ op: 'world/loadScene', sceneId: 'sc_bad' }] },
      }),
    ).toBeNull();
    expect(
      presentedEvent({
        t: 'world/eventPresented',
        payload: { eventId: 'ev_bad', steps: [{ op: 'ui/unknown' }] },
      }),
    ).toBeNull();
  });
});
