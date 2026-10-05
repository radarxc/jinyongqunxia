import type { Rng } from '../../rng';
import { acuteGather, type AcuteGatheredEvent } from './gather';
import type { MeridianFlowAdvancedEvent, MeridianFlowRuntime } from './runtime';
import type { ResolveQiMoveInput, ResolveQiMoveResult } from './types';

export * from './gather';
export * from './math';
export * from './runtime';
export * from './types';

export type MeridianFlowCommand =
  | { readonly t: 'qi.tick'; readonly ticks: number; readonly productionBp?: number }
  | { readonly t: 'qi.selectRoute'; readonly routeId: string }
  | { readonly t: 'qi.acuteGather'; readonly routeId: string }
  | { readonly t: 'qi.resolveMove'; readonly input: ResolveQiMoveInput };

export type MeridianFlowEvent =
  | AcuteGatheredEvent
  | MeridianFlowAdvancedEvent
  | ResolveQiMoveResult['resolution']
  | NonNullable<ResolveQiMoveResult['fullCycleCrit']>
  | { readonly t: 'qi.routeSelected'; readonly unitId: string; readonly routeId: string };

export interface MeridianFlowCommandContext {
  readonly flow: MeridianFlowRuntime;
  readonly battleRng: Rng;
}

export interface MeridianFlowCommandResult {
  readonly accepted: boolean;
  readonly events: readonly MeridianFlowEvent[];
  readonly error?: string;
}

function advancedEvent(flow: MeridianFlowRuntime, ticks: number): MeridianFlowAdvancedEvent {
  return {
    t: 'qi.flowAdvanced',
    unitId: flow.unitId,
    ticks,
    battleTick: flow.battleTick,
    stateVersion: flow.stateVersion,
  };
}

/** Command facade for isolated flow tests and non-battle hosts. */
export function dispatchMeridianFlowCommand(
  context: MeridianFlowCommandContext,
  command: MeridianFlowCommand,
): MeridianFlowCommandResult {
  try {
    switch (command.t) {
      case 'qi.tick':
        context.flow.tick(command.ticks, command.productionBp);
        return { accepted: true, events: [advancedEvent(context.flow, command.ticks)] };
      case 'qi.selectRoute':
        context.flow.selectRoute(command.routeId);
        return {
          accepted: true,
          events: [
            { t: 'qi.routeSelected', unitId: context.flow.unitId, routeId: command.routeId },
          ],
        };
      case 'qi.acuteGather':
        return { accepted: true, events: [acuteGather(context.flow, command.routeId)] };
      case 'qi.resolveMove': {
        const result = context.flow.resolveMove(command.input, context.battleRng);
        return {
          accepted: true,
          events:
            result.fullCycleCrit === null
              ? [result.resolution]
              : [result.resolution, result.fullCycleCrit],
        };
      }
    }
  } catch (error) {
    return {
      accepted: false,
      events: [],
      error: error instanceof Error ? error.message : 'QI_COMMAND_ERROR',
    };
  }
}
