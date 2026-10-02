import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseContentFile } from '@tianshu/data/tooling';
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
