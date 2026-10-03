export type PrologueMode = 'full' | 'summary' | 'skip';
export type M1FlowStage =
  | 'create' | 'opening' | 'mode' | 'summary' | 'skip-bridge' | 'game'
  | 'export' | 'allocation' | 'allocation-confirm' | 'wake-cutscene' | 'baima-title';

export function initialM1Stage(input: { pendingCreation: boolean; allocationReady: boolean }): M1FlowStage {
  if (input.pendingCreation) return 'create';
  return input.allocationReady ? 'export' : 'game';
}
export function stageAfterMode(mode: PrologueMode): M1FlowStage {
  if (mode === 'full') return 'game';
  return mode === 'summary' ? 'summary' : 'skip-bridge';
}
export function prologueCompletion(mode: PrologueMode): string {
  return { full: 'n_full_complete', summary: 'n_summary_complete',
    skip: 'n_skip_complete' }[mode];
}
