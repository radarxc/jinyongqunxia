import { compareCodePoints, floorDivInt } from '@tianshu/shared';
import type { DifficultyId, GameState } from './models';

export interface GameStateSummary {
  readonly chapterId: string; readonly act: number; readonly regionId: string;
  readonly locationId: string; readonly realLevel: number; readonly displayLevel: number;
  readonly yuyun: number; readonly tianshuCount: number; readonly fateCount: number;
  readonly difficulty: DifficultyId; readonly rules: readonly string[];
  readonly playTimeSec: number; readonly rollbackCount: number; readonly debugTainted: boolean;
  readonly partyIds: readonly string[];
}

/** Only currently authoritative M1 fields are projected; absent progression fields stay neutral. */
export function projectGameStateSummary(state: Readonly<GameState>): GameStateSummary {
  const replayRules = state.profile.replayRules ?? { difficulty: 'diff_jianghu' as const,
    switches: {} };
  return { chapterId: state.chapter.chapterId, act: 1, regionId: '',
    locationId: state.world.navigation.locationId, realLevel: 1, displayLevel: 1, yuyun: 0,
    tianshuCount: 0, fateCount: 0, difficulty: replayRules.difficulty,
    rules: Object.entries(replayRules.switches)
      .filter(([, enabled]) => enabled).map(([id]) => id).sort(compareCodePoints),
    playTimeSec: floorDivInt(state.meta.worldTick, 10), rollbackCount: 0,
    debugTainted: state.meta.debugTainted, partyIds: [state.profile.protagonist,
      ...state.profile.companions].flatMap((entry) => entry ? [entry.characterId] : []).slice(0, 6) };
}
