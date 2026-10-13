import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { canonicalJson, type JsonValue } from '@tianshu/shared';
import { parse } from 'yaml';
import { TownFacilitiesSchema } from '../../schemas/facility';
import { compileKit } from '../town-plan';
import { TownSourceSchema, type TownCompileInput } from './types';

export const REPOSITORY = fileURLToPath(new URL('../../../../../', import.meta.url));
const read = (relative: string): string =>
  readFileSync(new URL(`../../../../../${relative}`, import.meta.url), 'utf8');
export const sha256Text = (text: string): string => createHash('sha256').update(text).digest('hex');
export const canonical = (value: unknown): string => canonicalJson(value as JsonValue);
export const SONG_KIT = compileKit(parse(read('content/town/buildkits/song_dali.yaml')));
export const XIYU_KIT = compileKit(parse(read('content/town/buildkits/xiyu.yaml')));

const CASES = {
  dali01: [
    '__fixtures__/city_dali__ch01.source.yaml',
    'assets/default/baseline/town/town_dali__ch01.layout.yaml',
    'packages/data/src/build/town/__fixtures__/city_dali__ch01.facilities.yaml',
  ],
  dali10: [
    '__fixtures__/city_dali__ch10.source.yaml',
    'assets/default/town/city_dali__ch10/layout.yaml',
    'packages/data/src/build/town/__fixtures__/city_dali__ch10.facilities.yaml',
  ],
  turpan10: [
    '__fixtures__/city_turpan__ch10.source.yaml',
    'assets/default/town/city_turpan__ch10/layout.yaml',
    'packages/data/src/build/town/__fixtures__/city_turpan__ch10.facilities.yaml',
  ],
} as const;
export type PilotName = keyof typeof CASES;
const CACHE = new Map<PilotName, { input: TownCompileInput; kit: typeof SONG_KIT }>();
export function pilot(name: PilotName): { input: TownCompileInput; kit: typeof SONG_KIT } {
  const cached = CACHE.get(name);
  if (cached !== undefined) return cached;
  const [sourceName, layoutName, facilityName] = CASES[name];
  const sourceText = read(`packages/data/src/build/town/${sourceName}`);
  const layoutText = read(layoutName);
  const source = TownSourceSchema.parse(parse(sourceText));
  if (source.layout.sha256 !== sha256Text(layoutText)) throw new Error(`TEST_LAYOUT_SHA:${name}`);
  const result = {
    input: {
      source,
      sourcePath: `packages/data/src/build/town/${sourceName}`,
      layout: parse(layoutText) as TownCompileInput['layout'],
      facilities: TownFacilitiesSchema.parse(parse(read(facilityName))),
    },
    kit: name === 'turpan10' ? XIYU_KIT : SONG_KIT,
  };
  CACHE.set(name, result);
  return result;
}

export function decode(bytes: string): Uint8Array {
  return Uint8Array.from(Buffer.from(bytes, 'base64'));
}
export function bit(bytes: Uint8Array, index: number): boolean {
  return (bytes[index >> 3]! & (1 << (index & 7))) !== 0;
}
