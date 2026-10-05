import type { GameCommand } from './contracts';

/** Preload only the page reached by an accepted flow command; the title entry stays untouched. */
export async function preloadFlowForCommand(command: GameCommand): Promise<void> {
  if (typeof document === 'undefined') return;
  if (command.t === 'quest/choose') {
    if ((command.phase ?? 'select') === 'settle') {
      await import('../pages/ExportPromptPage.vue');
    } else if (command.optionId === 'summary') {
      await import('../pages/SummaryPage.vue');
    } else if (command.optionId === 'skip') {
      await import('../pages/SkipBridgePage.vue');
    }
  } else if (command.t === 'chapter/bookSleep') {
    await import('../pages/WakePage.vue');
  }
}
