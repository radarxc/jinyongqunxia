import { access, copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';
import { recordCopiedAssetReference, type CopiedAssetReferenceMap } from './copied-assets';

interface DressupManifestRow {
  id?: string;
  kind?: string;
  template?: string;
  file?: string;
  fit?: string;
  report?: string;
  status?: string;
  slot?: string;
  socket?: string;
  skeleton?: string;
  heightM?: string;
  fits?: DressupManifestVariant[];
}

interface DressupManifestVariant extends DressupManifestRow {
  template: string;
}

type DressupIndexKind = 'template' | 'head' | 'garment' | 'hair' | 'prop' | 'layer';

export interface DressupAssetIndexEntry {
  readonly kind: DressupIndexKind;
  readonly id: string;
  readonly template: string;
  readonly file: string;
  readonly fit: string | null;
  readonly report: string | null;
  readonly status: string;
  readonly slot?: string;
  readonly socket?: string;
  readonly skeleton?: string;
  readonly heightM?: number;
}

export interface DressupAssetIndex {
  readonly schema: 'tianshu-dressup-index.v1';
  readonly groups: Readonly<Record<DressupIndexKind, readonly DressupAssetIndexEntry[]>>;
}

function scalar(value: string): string {
  return value.trim().replace(/^(?:"(.*)"|'(.*)')$/u, '$1$2');
}

function runtimeRows(text: string): readonly DressupManifestRow[] {
  const rows: DressupManifestRow[] = [];
  let row: DressupManifestRow | undefined;
  let inFits = false; let fit: DressupManifestVariant | undefined;
  for (const line of text.split(/\r?\n/u)) {
    const rowStart = line.match(/^- id:\s*([^#]+?)(?:\s+#.*)?$/u);
    if (rowStart) {
      if (row) rows.push(row);
      row = { id: scalar(rowStart[1]!) };
      inFits = false; fit = undefined;
      continue;
    }
    if (!row) continue;
    if (/^ {2}fits:\s*(?:#.*)?$/u.test(line)) { inFits = true; row.fits = []; continue; }
    if (/^ {2}\S/u.test(line)) { inFits = false; fit = undefined; }
    const fitStart = inFits && line.match(/^ {4}([^\s:#][^:#]*):\s*(.*)$/u);
    if (fitStart) {
      fit = { template: scalar(fitStart[1]!) }; row.fits!.push(fit);
      for (const field of fitStart[2]!.matchAll(/(file|fit|report|status|slot|socket):\s*([^,}#]+)/gu))
        fit[field[1] as keyof DressupManifestRow] = scalar(field[2]!);
      continue;
    }
    const fitField = inFits && fit && line.match(/^ {6}(file|fit|report|status|slot|socket):\s*([^#]+?)(?:\s+#.*)?$/u);
    if (fitField) { fit[fitField[1] as keyof DressupManifestRow] = scalar(fitField[2]!); continue; }
    const field = line.match(/^ {2}(id|kind|template|file|fit|report|status|slot|socket|skeleton|heightM):\s*([^#]+?)(?:\s+#.*)?$/u);
    if (!field) continue;
    const name = field[1] as keyof DressupManifestRow;
    row[name] = scalar(field[2]!);
  }
  if (row) rows.push(row);
  return rows;
}

function indexKind(row: DressupManifestRow, manifest: string): DressupIndexKind {
  const declared = row.kind?.replace(/^dressup-/u, '');
  if (declared === 'template' || declared === 'head' || declared === 'garment' ||
      declared === 'hair' || declared === 'prop' || declared === 'layer') return declared;
  const directory = manifest.split(sep).at(-3);
  const inferred: Record<string, DressupIndexKind> = {
    templates: 'template', heads: 'head', garments: 'garment', hairs: 'hair', props: 'prop',
  };
  const kind = directory ? inferred[directory] : undefined;
  if (!kind) throw new Error('DRESSUP_INDEX_KIND_INVALID');
  return kind;
}

function runtimeUrl(root: string, manifest: string, file: string): string {
  const source = resolve(dirname(manifest), file);
  if (file.split(/[\\/]/u).includes('..'))
    throw new Error('DRESSUP_ASSET_PATH_INVALID');
  const path = relative(root, source).split(sep).join('/');
  if (!path.startsWith('assets/default/model3d/dressup/'))
    throw new Error('DRESSUP_ASSET_OUTSIDE_ROOT');
  return '/' + path;
}

async function indexEntry(root: string, manifest: string, row: DressupManifestRow,
  variant: DressupManifestRow): Promise<DressupAssetIndexEntry> {
  if (!row.id || !variant.file) throw new Error('DRESSUP_INDEX_FIELDS_MISSING');
  const kind = indexKind(row, manifest);
  const template = variant.template ?? row.template ?? (kind === 'template' ? undefined : 'tpl_f_medium');
  if (!template) throw new Error('DRESSUP_INDEX_TEMPLATE_MISSING');
  const fit = variant.fit ?? row.fit;
  const report = variant.report ?? row.report;
  const skeleton = kind === 'template' ? (variant.skeleton ?? row.skeleton) : undefined;
  const heightText = variant.heightM ?? row.heightM;
  const heightM = heightText === undefined ? undefined : Number(heightText);
  let socket = variant.socket ?? row.socket;
  if (!socket && fit && kind === 'prop') {
    const fitPath = resolve(root, runtimeUrl(root, manifest, fit).slice(1));
    const fitDocument = JSON.parse(await readFile(fitPath, 'utf8')) as { socket?: unknown };
    if (typeof fitDocument.socket === 'string' && fitDocument.socket.length > 0) {
      socket = fitDocument.socket;
    }
  }
  if (heightM !== undefined && (!Number.isFinite(heightM) || heightM <= 0))
    throw new Error('DRESSUP_INDEX_HEIGHT_INVALID');
  return {
    kind, id: row.id, template, file: runtimeUrl(root, manifest, variant.file),
    fit: fit ? runtimeUrl(root, manifest, fit) : null,
    report: report ? runtimeUrl(root, manifest, report) : null,
    status: variant.status ?? row.status ?? 'draft',
    ...(variant.slot ?? row.slot ? { slot: variant.slot ?? row.slot } : {}),
    ...(socket ? { socket } : {}),
    ...(skeleton ? { skeleton: runtimeUrl(root, manifest, skeleton) } : {}),
    ...(heightM === undefined ? {} : { heightM }),
  };
}

async function manifests(directory: string): Promise<string[]> {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(entries.map(async entry => {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) return manifests(path);
      return entry.isFile() && entry.name === 'manifest.yaml' ? [path] : [];
    }));
    return nested.flat().sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}

/** Copy non-rejected dressup file/fit/report entries; YAML parsing stays build-time only. */
export async function publishDressupAssets(
  root: string,
  copy: boolean,
  copied?: Set<string>,
  references?: CopiedAssetReferenceMap,
): Promise<string[]> {
  const assetRoot = resolve(root, 'assets/default/model3d/dressup');
  const selected = new Set<string>();
  const byManifest = new Map<string, Set<string>>();
  const indexed = new Map<string, DressupAssetIndexEntry>();
  for (const manifest of await manifests(assetRoot)) {
    const paths = new Set<string>();
    const entries: DressupAssetIndexEntry[] = [];
    try {
      for (const row of runtimeRows(await readFile(manifest, 'utf8'))) {
        const variants = row.status === 'rejected' ? [] : [row, ...(row.fits ?? [])];
        for (const variant of variants) {
          if (variant.status === 'rejected') continue;
          const entry = await indexEntry(root, manifest, row, variant);
          entries.push(entry);
          for (const file of [variant.file, variant.fit, variant.report,
            entry.kind === 'template' ? (variant.skeleton ?? row.skeleton) : undefined]) {
            if (!file) continue;
            const source = resolve(root, runtimeUrl(root, manifest, file).slice(1));
            await access(source);
            const path = relative(root, source).split(sep).join('/');
            if (!path.startsWith('assets/default/model3d/dressup/'))
              throw new Error('DRESSUP_ASSET_OUTSIDE_ROOT');
            paths.add(path);
          }
        }
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      try { await access(manifest); } catch (manifestError) {
        if ((manifestError as NodeJS.ErrnoException).code === 'ENOENT') continue;
        throw manifestError;
      }
      throw error;
    }
    for (const path of paths) selected.add(path);
    for (const entry of entries)
      indexed.set([entry.kind, entry.id, entry.template].join(':'), entry);
    byManifest.set(relative(root, manifest).split(sep).join('/'), paths);
  }
  for (const path of [...selected].sort()) if (copy) {
    const output = resolve(root, 'apps/game/public', path);
    await mkdir(dirname(output), { recursive: true });
    await copyFile(resolve(root, path), output); copied?.add(path);
  }
  if (copy) {
    const groups: Record<DressupIndexKind, DressupAssetIndexEntry[]> = {
      template: [], head: [], garment: [], hair: [], prop: [], layer: [],
    };
    for (const entry of [...indexed.values()].sort((left, right) =>
      [left.kind, left.id, left.template].join(':').localeCompare(
        [right.kind, right.id, right.template].join(':'), 'en'))) groups[entry.kind].push(entry);
    const output = resolve(root, 'apps/game/public/assets/default/model3d/dressup/index.json');
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, JSON.stringify({ schema: 'tianshu-dressup-index.v1', groups }, null, 2) + '\n');
  }
  for (const [manifest, paths] of byManifest) for (const path of paths)
    recordCopiedAssetReference(references, manifest, path);
  return [...selected].sort();
}
