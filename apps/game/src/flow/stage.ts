export type PrologueMode = 'full' | 'summary' | 'skip';
export type M1FlowStage =
  | 'create'
  | 'opening'
  | 'mode'
  | 'summary'
  | 'skip-bridge'
  | 'game'
  | 'export'
  | 'allocation'
  | 'allocation-confirm'
  | 'wake-cutscene'
  | 'baima-title';
export type ColdEntryStage =
  | 'inactive'
  | 'cutscene'
  | 'scene-loading'
  | 'movement'
  | 'first-talk'
  | 'east-exit-open'
  | 'autosave'
  | 'title-card'
  | 'free';

export const COLD_ENTRY = Object.freeze({
  arrivalEventId: 'ev_10_cold_entry_arrival',
  chapterId: 'ch10_baima',
  regionId: 'rg_xiyu_beijiang',
  sceneId: 'sc_10_fengshi_feiyi',
  spawnId: 'cold_open',
  storyId: 'story_ch10_cold_entry',
  firstTalkKnot: 'fengshi_first_talk',
  entranceId: 'ent_10_fengshi_east',
  titleCard: 'ch10_volume_one',
} as const);

export function initialM1Stage(input: {
  pendingCreation: boolean;
  allocationReady: boolean;
}): M1FlowStage {
  if (input.pendingCreation) return 'create';
  return input.allocationReady ? 'export' : 'game';
}
export function stageAfterMode(mode: PrologueMode): M1FlowStage {
  if (mode === 'full') return 'game';
  return mode === 'summary' ? 'summary' : 'skip-bridge';
}
export function prologueCompletion(mode: PrologueMode): string {
  return { full: 'n_full_complete', summary: 'n_summary_complete', skip: 'n_skip_complete' }[mode];
}
