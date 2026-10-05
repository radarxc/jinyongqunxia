import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { stringify } from 'yaml';
import { MeridianTopologyCatalogSchema, SectCatalogSchema } from '../src/schemas';
import { extractMeridianTopology, extractSectCatalog } from '../src/schemas/catalog-extract';
const MERIDIAN_GROUPS = [
  ['regular12', 0, 12], ['extra8', 12, 20],
] as const;
const SECT_GROUPS = [
  ['temples', 29], ['estates', 22], ['associations', 33], ['gulong', 15],
] as const;

async function emit(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, stringify(value, { lineWidth: 0 }));
}

export async function importDocCatalogs(rootDir = process.cwd()): Promise<void> {
  const root = resolve(rootDir);
  const meridians = extractMeridianTopology(await readFile(
    join(root, 'docs/design/15-meridians-and-acupoints.md'), 'utf8'));
  const sects = extractSectCatalog(await readFile(
    join(root, 'docs/design/17-sects-compendium.md'), 'utf8'));
  if (meridians.length !== 20 || meridians.flatMap((entry) => entry.points).length !== 180)
    throw new TypeError('IMPORT_MERIDIAN_COUNTS');
  if (sects.length !== 99) throw new TypeError('IMPORT_SECT_COUNTS');
  for (const [group, start, end] of MERIDIAN_GROUPS)
    await emit(join(root, `content/common/meridians/${group}.yaml`),
      MeridianTopologyCatalogSchema.parse({ schemaVersion: 'meridian-topology.v1',
        id: `ev_common_meridians_${group}`, event: 'content/meridianTopologyCatalog', group,
        meridians: meridians.slice(start, end) }));
  let offset = 0;
  for (const [group, size] of SECT_GROUPS) {
    await emit(join(root, `content/common/sects/${group}.yaml`),
      SectCatalogSchema.parse({ schemaVersion: 'sect-catalog.v1',
        id: `ev_common_sects_${group}`, event: 'content/sectCatalog', group,
        sects: sects.slice(offset, offset + size) }));
    offset += size;
  }
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === import.meta.filename)
  void importDocCatalogs().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
