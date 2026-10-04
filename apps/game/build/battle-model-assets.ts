import { access, copyFile, mkdir, readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import type { BattleModelCatalog, BattleModelVisual } from '@tianshu/render/battle';
import { recordCopiedAssetReference, type CopiedAssetReferenceMap } from './copied-assets';

export type BattleGender = 'male' | 'female';
export interface BattleModelDirectory {
  readonly directory: string; readonly npcId?: string; readonly chapterToken?: string;
  readonly rig?: string; readonly combined?: string;
}
export interface BattleModelSubject {
  readonly id: string; readonly chapterId: string; readonly species?: string;
  readonly gender?: BattleGender; readonly combatEligible?: boolean;
}

const HEIGHT_M = { male: 1.70, female: 1.62 } as const;
const publicUrl = (directory: string, file: string) =>
  `/assets/default/model3d/${directory}/${file}`;
const available = async (path: string): Promise<boolean> => {
  try { await access(path); return true; } catch { return false; }
};
function manifestRuntimeRows(text: string): readonly { file?: string; status?: string }[] {
  const rows: { file?: string; status?: string }[] = []; let row: { file?: string; status?: string } | undefined;
  const scalar = (value: string) => value.trim().replace(/^(?:"(.*)"|'(.*)')$/u, '$1$2');
  for (const line of text.split(/\r?\n/u)) {
    if (/^- id:\s/u.test(line)) { if (row) rows.push(row); row = {}; continue; }
    if (!row) continue;
    const field = line.match(/^ {2}(file|status):\s*([^#]+?)(?:\s+#.*)?$/u);
    if (field?.[1] === 'file') row.file = scalar(field[2]!);
    if (field?.[1] === 'status') row.status = scalar(field[2]!);
  }
  if (row) rows.push(row); return rows;
}

/** Directory names are data: plain npc_x or npc_x__chNN_variant both map to the NPC id. */
export function decodeModelDirectory(directory: string):
Pick<BattleModelDirectory, 'npcId' | 'chapterToken'> {
  if (!directory.startsWith('npc_') || directory.startsWith('npc_generic_') ||
      directory.startsWith('npc_zhujue__')) return {};
  const [npcId, suffix] = directory.split('__', 2);
  const chapterToken = suffix?.match(/^(ch(?:0[0-9]|1[0-4]))(?:_|$)/u)?.[1];
  return { npcId, ...(chapterToken ? { chapterToken } : {}) };
}

/** Generated directory-to-NPC table; assets remain the source of truth. */
export function mapBattleModelDirectories(directories: readonly BattleModelDirectory[]):
Readonly<Record<string, readonly BattleModelDirectory[]>> {
  const result: Record<string, BattleModelDirectory[]> = {};
  for (const directory of directories) {
    if (!directory.npcId) continue;
    (result[directory.npcId] ??= []).push(directory);
  }
  return result;
}

export async function readBattleModelDirectories(root: string): Promise<readonly BattleModelDirectory[]> {
  const base = resolve(root, 'assets/default/model3d');
  const entries = await readdir(base, { withFileTypes: true });
  const result: BattleModelDirectory[] = [];
  for (const entry of entries.filter(row => row.isDirectory()).sort((a, b) =>
    a.name.localeCompare(b.name, 'en'))) {
    const manifest = join(base, entry.name, 'manifest.yaml');
    if (!await available(manifest)) continue;
    // Asset manifests include provenance hashes that YAML core may parse as huge exponents;
    // scan only the two top-level runtime fields instead of interpreting unrelated metadata.
    const rows = manifestRuntimeRows(await readFile(manifest, 'utf8'));
    const accepted = (file: string) => rows.some(row => row['file'] === file &&
      row['status'] !== 'rejected');
    const rig = accepted('model_rig.glb') && await available(join(base, entry.name, 'model_rig.glb'))
      ? 'model_rig.glb' : undefined;
    const combined = accepted('anim_idle_walk_run.glb') &&
      await available(join(base, entry.name, 'anim_idle_walk_run.glb'))
      ? 'anim_idle_walk_run.glb' : undefined;
    if (!rig && !combined) continue;
    result.push({ directory: entry.name, ...decodeModelDirectory(entry.name),
      ...(rig ? { rig } : {}), ...(combined ? { combined } : {}) });
  }
  return result;
}

function common(directories: readonly BattleModelDirectory[], gender: BattleGender,
  role: 'generic' | 'protagonist'): BattleModelDirectory | undefined {
  const preferred = role === 'generic' ? `npc_generic_${gender === 'male' ? 'm' : 'f'}`
    : `npc_zhujue__ch00_${gender === 'male' ? 'm' : 'f'}`;
  const fallback = `npc_zhujue__ch00_${gender === 'male' ? 'm' : 'f'}`;
  return directories.find(row => row.directory === preferred && row.combined) ??
    directories.find(row => row.directory === fallback && row.combined);
}
function visual(directory: BattleModelDirectory, gender: BattleGender,
  kind: BattleModelVisual['kind'], modelFile: string, animationFile?: string,
  animationDirectory = directory.directory): BattleModelVisual {
  return { key: directory.directory, kind, gender, heightM: HEIGHT_M[gender],
    modelUrl: publicUrl(directory.directory, modelFile),
    ...(animationFile ? { animationUrl: publicUrl(animationDirectory, animationFile) } : {}) };
}
export function resolveBattleModel(directories: readonly BattleModelDirectory[], input: {
  readonly npcId?: string; readonly chapterId: string; readonly species?: string;
  readonly gender?: BattleGender; readonly protagonist?: boolean;
}): BattleModelVisual | null {
  if (input.species !== undefined && input.species !== 'human') return null;
  const gender = input.gender ?? 'male';
  const generic = common(directories, gender, 'generic');
  if (input.protagonist) {
    const hero = common(directories, gender, 'protagonist');
    return hero?.combined ? visual(hero, gender, 'dedicated', hero.combined, hero.combined) : null;
  }
  const token = input.chapterId.slice(0, 4);
  const candidates = (input.npcId ? mapBattleModelDirectories(directories)[input.npcId] : [])
    ?.filter(row => row.rig) ?? [];
  const dedicated = candidates.find(row => row.chapterToken === token) ??
    candidates.find(row => row.chapterToken === undefined);
  if (dedicated?.rig) return visual(dedicated, gender, 'dedicated', dedicated.rig,
    generic?.combined, generic?.directory);
  return generic?.combined ? visual(generic, gender,
    generic.directory.startsWith('npc_generic_') ? 'generic' : 'fallback',
    generic.combined, generic.combined) : null;
}

export function buildBattleModelCatalog(directories: readonly BattleModelDirectory[],
  chapterId: string, subjects: readonly BattleModelSubject[],
  templates: readonly { readonly id: string; readonly gender?: BattleGender }[]): BattleModelCatalog {
  const gender = (value?: BattleGender) => value ?? 'male';
  const generic = Object.fromEntries((['male', 'female'] as const).flatMap(value => {
    const found = resolveBattleModel(directories, { chapterId, gender: value });
    return found ? [[value, found]] : [];
  }));
  const protagonist = Object.fromEntries((['male', 'female'] as const).flatMap(value => {
    const found = resolveBattleModel(directories, { chapterId, gender: value, protagonist: true });
    return found ? [[value, found]] : [];
  }));
  const npcs = Object.fromEntries(subjects.filter(row => row.chapterId === chapterId &&
    row.combatEligible !== false).map(row => [row.id, resolveBattleModel(directories, {
      npcId: row.id, chapterId: row.chapterId, species: row.species, gender: row.gender,
    })]));
  const templateModels = Object.fromEntries(templates.flatMap(row => {
    const found = generic[gender(row.gender)]; return found ? [[row.id, found]] : [];
  }));
  return { schema: 'battle-models.v1', generic, protagonist, npcs, templates: templateModels };
}

function urls(value: BattleModelVisual): string[] {
  return [...new Set([value.modelUrl, value.animationUrl].filter(
    (url): url is string => typeof url === 'string'))];
}

/** Copy the exact GLBs reachable from projected catalog keys; previews and source files stay private. */
export async function publishBattleModels(root: string, copy: boolean,
  catalogs: Readonly<Record<string, BattleModelCatalog>>, copied?: Set<string>,
  references?: CopiedAssetReferenceMap): Promise<readonly string[]> {
  const byReference = new Map<string, Set<string>>();
  const add = (reference: string, value: BattleModelVisual): void => {
    const set = byReference.get(reference) ?? new Set<string>();
    for (const url of urls(value)) set.add(url.slice(1));
    byReference.set(reference, set);
  };
  for (const catalog of Object.values(catalogs)) {
    for (const [id, value] of Object.entries(catalog.npcs)) if (value) add(id, value);
    for (const [id, value] of Object.entries(catalog.templates)) add(id, value);
    for (const [gender, value] of Object.entries(catalog.generic)) if (value)
      add(`battle-generic:${gender}`, value);
    for (const value of Object.values(catalog.protagonist)) if (value) {
      add('protagonist', value); add('npc_zhujue', value);
    }
  }
  const selected = [...new Set([...byReference.values()].flatMap(set => [...set]))].sort();
  for (const relativePath of selected) {
    if (!relativePath.startsWith('assets/default/model3d/') ||
        relativePath.split('/').includes('..')) throw new Error('BATTLE_MODEL_PATH_INVALID');
    const source = resolve(root, relativePath);
    if (!source.startsWith(resolve(root, 'assets/default/model3d') + '/'))
      throw new Error('BATTLE_MODEL_OUTSIDE_ROOT');
    await access(source);
    if (copy) {
      const output = resolve(root, 'apps/game/public', relativePath);
      await mkdir(dirname(output), { recursive: true });
      await copyFile(source, output); copied?.add(relativePath);
    }
  }
  for (const [reference, paths] of byReference) for (const path of paths)
    recordCopiedAssetReference(references, reference, path);
  return selected;
}
