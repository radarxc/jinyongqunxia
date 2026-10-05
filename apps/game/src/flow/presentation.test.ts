import { describe, expect, it } from 'vitest';
import type { DialogueView } from '@tianshu/ui';
import { fixtureItemPack } from '../runtime/test-fixture';
import { loadChapterTextCatalog } from './content-text';
import { presentDialogue } from './presentation';

const line = (speakerId: string): DialogueView => ({
  storyId: 'story_ch10_cold_entry',
  storyHash: 'a'.repeat(64),
  entryKey: 'fengshi_first_talk',
  speakerId,
  textKey: 'line',
  choices: [],
  history: [],
});
describe('dialogue speaker presentation', () => {
  it('loads the three ch10 names from the verified chapter NPC text leaf', async () => {
    const pack = await fixtureItemPack('ch10_baima');
    const catalog = await loadChapterTextCatalog(pack.source, 'ch10_baima');
    for (const [speakerId, name] of [
      ['npc_shenqinghe10', '沈青禾'],
      ['npc_liwenxiu', '李文秀'],
      ['npc_postman_tang_xiyu', '无名驿卒'],
    ] as const)
      expect(presentDialogue(line(speakerId), catalog).speaker).toBe(name);
  });

  it('retains system speakers and makes a missing NPC key diagnosable', () => {
    expect(presentDialogue(line('narrator')).speaker).toBe('旁白');
    expect(presentDialogue(line('player')).speaker).toBe('你');
    expect(presentDialogue(line('npc_shuling')).speaker).toBe('书灵');
    expect(presentDialogue(line('npc_missing')).speaker).toBe(
      '缺少文本：npc.npc_missing.identity.name',
    );
  });
});
