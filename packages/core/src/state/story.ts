import { compareCodePoints } from '@tianshu/shared';
import type { StoryLine } from '@tianshu/data/schemas';
import type { StoryLineState, StoryState } from './models';

export function createStoryLineState(line: StoryLine): StoryLineState {
  return { lineId: line.lineId, status: line.kind === 'main' ? 'active' : 'locked',
    activeNodeIds: line.kind === 'main' ? [line.startNodeId] : [], completedNodeIds: [],
    expiredNodeIds: [], chosenOptions: {}, branchPath: [], resolvedWindows: {},
    appliedEffectIds: [], revision: 0 };
}

export function createStoryState(chapterId: string, lines: readonly StoryLine[]): StoryState {
  if (lines.some((line) => line.chapterId !== chapterId)) throw new TypeError('STORY_CHAPTER_MISMATCH');
  if (lines.filter((line) => line.kind === 'main').length !== 1) throw new TypeError('STORY_MAIN_COUNT');
  const states = lines.map(createStoryLineState);
  states.sort((left, right) => compareCodePoints(left.lineId, right.lineId));
  return { chapterId, lines: states };
}
