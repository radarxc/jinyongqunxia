import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseContentFile } from '@tianshu/data/tooling';
import { createManifest, emitLeaves } from '@tianshu/data/build';
import type { ContentSource } from '@tianshu/data';
import type { JsonValue } from '@tianshu/shared';
import { mapFromRegistration, type ItemDef, type MartialArtDef,
  type NpcDef, type TownRuntimeDefinition } from '@tianshu/data/schemas';
import type { GameContent } from './content';

function read<T>(path: string): T {
  const text = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../../../../', path), 'utf8');
  return parseContentFile({ path, text }).value as T;
}
export function fixtureContent(): GameContent {
  return {
    items: [read<ItemDef>('content/common/items/eq_qinggangjian.yaml'),
      read<ItemDef>('content/common/items/it_jinchuangyao.yaml'),
      read<ItemDef>('content/common/items/it_dahuandan.yaml')],
    skills: [read<MartialArtDef>('content/common/skills/sk_taizuchangquan.yaml'),
      read<MartialArtDef>('content/common/skills/sk_beiming.yaml')],
    npcs: ['npc_duanyu', 'npc_zhongling', 'npc_xiaofeng'].map((id) => read<NpcDef>(`content/chapters/ch01_tianlong/npcs/${id}.yaml`)),
    factions: { sect_dali: '大理段氏' },
    worldMaps: [mapFromRegistration(read<unknown>('content/world/ch01/map.yaml'))],
    towns: [read<TownRuntimeDefinition>('content/town/ch01/city_dali.json')],
    topology: [{ id: 'mer_shoutaiyin', name: '手太阴肺经', points: [
      { id: 'ap_shoutaiyin_zhongfu', name: '中府' }, { id: 'ap_shoutaiyin_yunmen', name: '云门' },
    ] }],
  };
}

export async function fixtureItemPack(chapter = 'ch01_tianlong'): Promise<{
  readonly source: ContentSource;
  readonly manifest: Awaited<ReturnType<typeof createManifest>>;
  readonly values: Map<string, unknown>;
  readonly reads: string[];
}> {
  const items = fixtureContent().items as readonly ItemDef[];
  const rules = items.map((item) => {
    const value: Partial<ItemDef> = { ...item };
    delete value.text;
    return { kind: 'item', id: item.id, value } as unknown as JsonValue;
  });
  const text = Object.fromEntries(items.flatMap((item) =>
    Object.entries(item.text).flatMap(([field, value]) => value === undefined
      ? []
      : [[`item.${item.id}.text.${field}`, value]])));
  const leaves = await emitLeaves([{ logicalName: 'common.rules.items.json',
    kind: 'rules', load: 'resident', value: rules },
  { logicalName: 'common.text.zh-Hans.items.json', kind: 'text', load: 'resident',
    locale: 'zh-Hans', value: text }]);
  const manifest = await createManifest(chapter, 'a'.repeat(64), leaves, []);
  const values = new Map<string, unknown>([[`${chapter}/manifest.json`, manifest],
    ...leaves.map((leaf): [string, unknown] => [`${chapter}/${leaf.logicalName}`, leaf.value])]);
  const reads: string[] = [];
  return { manifest, values, reads, source: { readJson: async (path) => {
    reads.push(path); return values.get(path);
  } } };
}
