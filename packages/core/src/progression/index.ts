import { advanceMartialArtProgress } from './martial-art';
import { interruptMeditation } from './meditation';
import { advanceInnerPractice, applyMeridianBoost } from './meridian';
import type { ProgressionCommand, ProgressionCommandResult, ProgressionState } from './types';

export * from './martial-art';
export * from './math';
export * from './meditation';
export * from './meridian';
export * from './types';

function replaceSkill(
  state: ProgressionState, skillId: string, gainedSxp: number,
): ProgressionCommandResult {
  const index = state.skills.findIndex((skill) => skill.skillId === skillId);
  if (index < 0) throw new RangeError('PROGRESSION_SKILL_UNKNOWN');
  const result = advanceMartialArtProgress(state.skills[index]!, gainedSxp);
  const skills = [...state.skills];
  skills[index] = result.skill;
  return { accepted: true, state: { ...state, skills }, events: [result.event] };
}

export function dispatchProgressionCommand(
  state: ProgressionState, command: ProgressionCommand,
): ProgressionCommandResult {
  try {
    switch (command.t) {
      case 'progression/practiceInner': {
        const result = advanceInnerPractice(state.meridians, command.input);
        return { accepted: true, state: { ...state, meridians: result.progress }, events: result.events };
      }
      case 'progression/advanceMartialArt':
        return replaceSkill(state, command.skillId, command.gainedSxp);
      case 'progression/applyMeridianBoost': {
        const result = applyMeridianBoost(state.meridians, command.effect);
        return { accepted: true, state: { ...state, meridians: result.progress }, events: [result.event] };
      }
      case 'progression/interruptMeditation': {
        if (state.meditation === null) throw new RangeError('PROGRESSION_NOT_MEDITATING');
        const result = interruptMeditation(state.meditation, command.causeId, command.worldTick);
        return { accepted: true, state: { ...state, meditation: result.state },
          events: result.event === null ? [] : [result.event] };
      }
    }
  } catch (error) {
    return { accepted: false, state, events: [],
      error: error instanceof Error ? error.message : 'PROGRESSION_COMMAND_ERROR' };
  }
}
