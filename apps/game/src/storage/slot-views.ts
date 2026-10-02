import type { SaveSlotSummary } from '@tianshu/platform';
import type { SaveSlotView } from '@tianshu/ui';

export function slotViews(
  saves: readonly SaveSlotSummary[],
  histories: Readonly<Record<string, readonly SaveSlotSummary[]>> = {},
): readonly SaveSlotView[] {
  const regular = [
    ...Array.from(
      { length: 12 },
      (_, index) => `save_manual_${String(index + 1).padStart(2, '0')}`,
    ),
    'save_quick',
    'save_auto_1',
    'save_auto_2',
    'save_auto_3',
  ];
  const known = new Map(saves.map((save) => [save.slot, save]));
  const ids = [...regular, ...saves.map((save) => save.slot).filter((id) => !regular.includes(id))];
  return ids.map((id): SaveSlotView => {
    const row = known.get(id);
    const kind = id.startsWith('save_manual_')
      ? 'manual'
      : id === 'save_quick'
        ? 'quick'
        : id.startsWith('save_auto_')
          ? 'auto'
          : 'checkpoint';
    const label =
      kind === 'manual'
        ? `手动存档 ${id.slice(-2)}`
        : kind === 'auto'
          ? `自动存档 ${id.slice(-1)}`
          : kind === 'quick'
            ? '快速存档'
            : '旅程纪念存档';
    return {
      id,
      kind,
      label,
      occupied: !!row,
      writable: kind === 'manual' || kind === 'quick',
      readable: kind !== 'checkpoint',
      savedAt: row ? new Date(row.savedAt).toLocaleString('zh-CN') : '',
      summary: row
        ? `${row.meta.summary['name'] ?? '无名侠客'} · ${row.meta.summary['location'] ?? row.meta.worldId} · ${row.meta.summary['date'] ?? `世界刻 ${row.meta.gameTime}`}`
        : '',
      generations: (histories[id] ?? (row ? [row] : [])).map((entry) => ({
        generation: entry.generation,
        savedAt: new Date(entry.savedAt).toLocaleString('zh-CN'),
        current: entry.generation === row?.generation,
      })),
    };
  });
}
