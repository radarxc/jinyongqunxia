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
  regionLoading: '正在铺开山川…', regionUnavailable: '区域地图尚未装载。',
  regionHelp: '点击地面预览并行走 · 点击标记互动 · WASD 移动 · Q/E 转动视角',
  regionAnchors: '近处可互动', regionDoors: '出口与门禁', regionNoAnchors: '近处暂无可互动之物。',
  regionLeave: '返回大地图', regionAutosaved: '已到达自动存档点。',
  regionSafe: '已到达安全落点。', regionTransition: '正在前往下一处场景…',
  regionCoordinateExit: '出口已触发，但目标场景缺少可解析的出生点 ID。',
  regionCamera: '区域视角', regionStats: '画面统计',
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

/** Kept separate so the title entry can tree-shake the first-use M1 copy. */
export const flowM1Text = {
  createTitle: '写下入卷之人', createLead: '身份只改变观察角度，不直接赠送武功、等级或银钱。',
  name: '姓名', gender: '性别', male: '男', female: '女', appearance: '外观预设',
  pronoun: '称谓与代词', origin: '现代身份', begin: '确认身份，翻开残卷',
  openingTitle: '雨夜·无字残卷', skipCutscene: '跳过画面', continueCutscene: '继续',
  modeTitle: '如何走过序章', modeLead: '三条路径抵达同一初眠配点与白马入口。',
  confirmChoice: '确认选择', previous: '上一页', nextCard: '下一页', finishCards: '确认摘要',
  exportTitle: '留一份可带走的书页', exportBody: '可先导出本机存档；导入时会先校验，不会直接覆盖当前进度。',
  exportNow: '导出全部存档', exportLater: '稍后再导出', allocationTitle: '长白山·初眠配点',
  allocationLead: '福缘与魅力保持原值；上下限、预算与均衡方案均来自当前核心规则。',
  remaining: '剩余点数', reset: '重置', balance: '一键均衡', useDefault: '使用默认方案',
  reviewAllocation: '查看确认页', allocationConfirmTitle: '确认初眠配点',
  allocationConfirmBody: '确认后将完成初眠事务并写入苏醒存档。此操作无需长按。',
  confirmAllocation: '确认并入眠', locked: '锁定，由核心保持原值', cancel: '返回修改',
  baimaVolume: '第一卷·白马啸西风', enterBaima: '踏入西州', contentUnavailable: '正文尚未装载。',
  unnamedQuest: '未命名任务', questSummaryUnavailable: '任务详情尚未装载。',
} as const;
export type FlowM1TextKey = keyof typeof flowM1Text;
export function flowM1T(key: FlowM1TextKey): string { return flowM1Text[key]; }
