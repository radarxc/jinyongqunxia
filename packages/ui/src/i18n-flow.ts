export const flowText = {
  title: '金庸群侠传·天书录', tagline: '一卷天书，十四段江湖',
  continue: '继续', newGame: '新游戏', settings: '设置', demo: '进入演示',
  noSave: '尚无可继续的正式存档', back: '返回', textScale: '文字大小',
  reducedMotion: '减少动态', subtitles: '字幕', quality: '画质', difficulty: '难度',
  masterVolume: '总音量', musicVolume: '音乐', effectsVolume: '音效', voiceVolume: '语音',
  rotateTitle: '请将设备横置', rotateBody: '横屏能完整显示江湖场景；设置与存档仍可继续操作。',
  rotateDismiss: '暂不横置', recoveryTitle: '书卷暂未展开',
  recoveryBody: '最后一份正确画面已冻结。你的本机存档没有被清除。',
  exportSaves: '导出全部存档', restoreAutosave: '从最近自动存档恢复', reload: '重新载入',
  noAutosave: '没有可恢复的自动存档', restoredPrefix: '已从', restoredSuffix: '的自动存档恢复',
  dialogueHistory: '对话记录', questLog: '任务日志', trackedQuest: '追踪任务',
  close: '关闭', next: '继续', auto: '自动', low: '低', medium: '中', high: '高', ultra: '极高',
  jianghu: '江湖', xiake: '侠客', zongshi: '宗师', noQuests: '暂无任务。',
  track: '追踪', untrack: '取消追踪', recentAutosave: '最近自动存档',
  coreFailed: '核心进程已停止响应。', hostDisposed: '游戏会话已结束。',
  coreTimeout: '核心进程响应超时。', storageFailed: '本机存储暂不可用。',
  internalFailure: '游戏启动或运行时遇到内部错误。',
  loadingStorage: '正在整理书卷与设置…', loadingGame: '正在翻开书卷…',
  exportDone: '存档已导出。', exportFailed: '导出失败，原有存档仍保留。',
  dialogueSaveBlocked: '对话结束后可保存旅程。',
  bookSleepSaveBlocked: '书眠事务结束后可保存旅程。',
  defaultHero: '无名侠客', defaultPronoun: '你', questCategory: '江湖',
  titleMenu: '标题菜单', recoveryActions: '恢复操作',
} as const;

export type FlowTextKey = keyof typeof flowText;
export function flowT(key: FlowTextKey): string { return flowText[key]; }
export function autosaveLabel(slot: string, savedAt: number): string {
  return `自动存档 ${slot.replace('save_auto_', '')} · ${new Date(savedAt).toLocaleString('zh-CN')}`;
}
export function recoveredAutosaveText(savedAt: number): string {
  const time = new Date(savedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  return `${flowT('restoredPrefix')} ${time} ${flowT('restoredSuffix')}`;
}
