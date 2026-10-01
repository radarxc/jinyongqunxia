import type { TimeWindow } from '@tianshu/data/schemas';
import { TICKS_PER_MINUTE, type GameClock, type ResolvedStoryWindow } from '../state';
import { calendarTick } from './compile';
import type { StoryRuntimeSnapshot } from './runtime-models';

function anchorTick(
  snapshot: StoryRuntimeSnapshot, lineId: string, window: Extract<TimeWindow, { mode: 'relative' }>,
): number | undefined {
  const anchor = window.anchor;
  if (anchor.event === 'story/nodeCompleted') {
    const owner = anchor.lineId ?? lineId;
    const receipt = `${owner}/${anchor.nodeId}/completed`;
    return snapshot.eventTicks[receipt];
  }
  return snapshot.eventTicks[`${anchor.event}/${anchor.questId}`];
}
export function resolveWindow(
  snapshot: StoryRuntimeSnapshot, lineId: string, nodeId: string, window: TimeWindow,
  clock: GameClock, current?: ResolvedStoryWindow,
): ResolvedStoryWindow | undefined {
  if (current !== undefined) return current;
  if (window.mode === 'absolute') {
    if (window.epochId !== clock.epochId) throw new TypeError(`STORY_WINDOW_EPOCH:${nodeId}`);
    const [opensAtTick, closesAtTick] = calendarTick(window, clock.epochYear, TICKS_PER_MINUTE);
    return { opensAtTick, closesAtTick, defersUsed: 0 };
  }
  const base = anchorTick(snapshot, lineId, window);
  if (base === undefined) return undefined;
  return { opensAtTick: base + window.opensAfterMinutes * TICKS_PER_MINUTE,
    closesAtTick: base + window.closesAfterMinutes * TICKS_PER_MINUTE, defersUsed: 0 };
}

