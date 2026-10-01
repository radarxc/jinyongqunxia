import type { DispatchResult, GameState } from '@tianshu/core';
import type { UiProjection } from '@tianshu/ui';

export function projectTitleState(
  state: GameState,
  result: DispatchResult,
  mode: 'worker' | 'main-thread',
): UiProjection {
  return {
    title: '天书录',
    coreVersion: state.meta.coreVersion,
    worldTick: state.meta.worldTick,
    status: result.accepted ? `Core ${mode} 已推进 1 tick` : 'Core 命令被拒绝',
  };
}
