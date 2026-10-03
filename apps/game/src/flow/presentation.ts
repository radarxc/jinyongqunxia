import type {
  DialoguePanelView,
  FlowCardView,
  QuestLogEntryView,
  QuestTrackerView,
  QuestView,
  DialogueView,
} from '@tianshu/ui';

export type TextCatalog = Readonly<Record<string, string>>;
const SPEAKERS: Readonly<Record<string, string>> = {
  narrator: '旁白',
  player: '你',
  npc_shuling: '书灵',
  book_spirit: '书灵',
};
const QUESTS: Readonly<Record<string, { title: string; summary: string }>> = {
  q_00_main_c_01: { title: '入书寻青', summary: '在越地竹林寻找牧羊少女。' },
  q_00_main_c_02: { title: '竹林试步', summary: '走过山径，收束白猿试手。' },
  q_00_main_c_03: { title: '越营观剑', summary: '前往越营，完成两项教学体验。' },
  q_00_main_c_04: { title: '一梦千年', summary: '传功、导出、初眠，再往白马。' },
};
const STATUS: Readonly<Record<string, string>> = {
  available: '可接取',
  active: '进行中',
  completed: '已完成',
  expired: '已错过',
};
function text(key: string | null, catalog: TextCatalog): string {
  if (key === null) return '';
  return catalog[key] ?? (/^(?:ink|story|quest)./u.test(key) ? '正文尚未装载。' : key);
}
function speaker(id: string): string {
  return SPEAKERS[id] ?? '江湖人物';
}
export function presentDialogue(view: DialogueView, catalog: TextCatalog = {}): DialoguePanelView {
  return {
    speaker: speaker(view.speakerId),
    text: text(view.textKey, catalog),
    choices: view.choices.map((choice) => ({
      id: String(choice.choiceIndex),
      label: text(choice.textKey, catalog),
      ...(choice.unavailableReason
        ? { disabledReason: text(choice.unavailableReason, catalog) }
        : {}),
    })),
    history: view.history.map((line) => ({
      speaker: speaker(line.speakerId),
      text: text(line.textKey, catalog),
    })),
    canContinue: view.choices.length === 0,
  };
}
export function presentQuests(
  quests: readonly QuestView[],
  trackedId: string | null,
): QuestLogEntryView[] {
  return quests.map((quest) => {
    const content = QUESTS[quest.id];
    return {
      id: quest.id,
      name: content?.title ?? '未命名任务',
      category: '江湖',
      status: STATUS[quest.status] ?? '状态未知',
      summary: content?.summary ?? '任务详情尚未装载。',
      tracked: trackedId === quest.id,
    };
  });
}
export function presentTracker(
  quests: readonly QuestLogEntryView[],
  trackedId: string | null,
): QuestTrackerView | null {
  const quest =
    quests.find((entry) => entry.id === trackedId) ??
    quests.find((entry) => entry.status === '进行中') ??
    null;
  return quest ? { questId: quest.id, name: quest.name, objective: quest.summary } : null;
}
const UNAVAILABLE = '正式文本尚未装载。';
export const openingFallback: readonly FlowCardView[] = [
  { key: 'opening-unavailable', title: '开场', body: UNAVAILABLE },
];
export const summaryFallback: readonly FlowCardView[] = [
  { key: 'summary-unavailable', title: '序章摘要', body: UNAVAILABLE },
];
export const skipBridgeFallback: readonly FlowCardView[] = [
  { key: 'transmission-unavailable', title: '阿青传功', body: UNAVAILABLE },
  { key: 'avalanche-unavailable', title: '长白山雪崩', body: UNAVAILABLE },
];
export const wakeFallback: readonly FlowCardView[] = [
  { key: 'wake-unavailable', title: '洞门再开', body: UNAVAILABLE },
  { key: 'west-unavailable', title: '一路向西', body: UNAVAILABLE },
];
