import type { Rng } from '../../rng';
import { acuteGather, advanceGatherState, type AcuteGatheredEvent, type GatherAdvancedEvent } from './gather';
import type { MeridianFlowRuntime } from './runtime';
import type { MeridianFlowAdvancedEvent } from './runtime';
import type { GatherState, ResolveQiMoveInput, ResolveQiMoveResult } from './types';

export * from './gather';
export * from './math';
export * from './runtime';
export * from './types';

export type MeridianFlowCommand =
  | { readonly t: 'qi.tick'; readonly ticks: number }
  | { readonly t: 'qi.selectRoute'; readonly routeId: string }
  | { readonly t: 'qi.acuteGather'; readonly routeId: string }
  | { readonly t: 'qi.resolveMove'; readonly input: ResolveQiMoveInput };

export type MeridianFlowEvent = GatherAdvancedEvent | AcuteGatheredEvent
  | MeridianFlowAdvancedEvent
  | ResolveQiMoveResult['resolution'] | NonNullable<ResolveQiMoveResult['fullCycleCrit']>
  | { readonly t: 'qi.routeSelected'; readonly routeId: string };

export interface MeridianFlowCommandContext {
  readonly flow: MeridianFlowRuntime;
  readonly gather: GatherState;
  readonly battleRng: Rng;
}

export interface MeridianFlowCommandResult {
  readonly accepted: boolean;
  readonly events: readonly MeridianFlowEvent[];
  readonly error?: string;
}

export function dispatchMeridianFlowCommand(
  context: MeridianFlowCommandContext, command: MeridianFlowCommand,
): MeridianFlowCommandResult {
  try {
    switch (command.t) {
      case 'qi.tick': {
        context.flow.tick(command.ticks);
        const flowEvent: MeridianFlowAdvancedEvent = { t: 'qi.flowAdvanced',
          unitId: context.flow.unitId, ticks: command.ticks, battleTick: context.flow.battleTick,
          stateVersion: context.flow.stateVersion };
        const gatherEvent = advanceGatherState(context.gather, command.ticks);
        return { accepted: true, events: [flowEvent, gatherEvent] };
      }
      case 'qi.selectRoute':
        context.flow.selectRoute(command.routeId);
        return { accepted: true, events: [{ t: 'qi.routeSelected', routeId: command.routeId }] };
      case 'qi.acuteGather': {
        if (context.gather.status !== 'ready' || context.gather.ct < 1000) {
          throw new RangeError('QI_GATHER_NOT_READY');
        }
        context.flow.validateAttackRoute(command.routeId);
        context.flow.selectRoute(command.routeId);
        return { accepted: true, events: [acuteGather(context.gather, command.routeId)] };
      }
      case 'qi.resolveMove': {
        context.flow.validateAttackRoute(command.input.routeId);
        const result = context.flow.resolveMove(command.input, context.battleRng);
        return { accepted: true, events: result.fullCycleCrit === null
          ? [result.resolution] : [result.resolution, result.fullCycleCrit] };
      }
    }
  } catch (error) {
    return { accepted: false, events: [], error: error instanceof Error ? error.message : 'QI_COMMAND_ERROR' };
  }
}
