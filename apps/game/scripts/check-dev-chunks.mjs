import { access, readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultDistDir = resolve(import.meta.dirname, '../dist');
const developmentOnlyPatterns = [
  /(^|[/_.-])rig-demo(?=$|[/_.-])/i,
  /(^|[/_.-])(?:dev|development)-only(?=$|[/_.-])/i,
  /(^|[/_.-])(?:dev|development)-entry(?=$|[/_.-])/i,
];

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isDevelopmentOnlyPath(value) {
  return (
    typeof value === 'string' && developmentOnlyPatterns.some((pattern) => pattern.test(value))
  );
}

export function findDevelopmentOnlyArtifacts(assetFiles, manifest) {
  if (!Array.isArray(assetFiles)) throw new Error('PRODUCTION_ASSET_LIST_INVALID');
  if (!isRecord(manifest)) throw new Error('PRODUCTION_MANIFEST_INVALID');

  const offenders = [];
  for (const file of assetFiles) {
    if (typeof file !== 'string') throw new Error('PRODUCTION_ASSET_LIST_INVALID');
    if (isDevelopmentOnlyPath(file)) offenders.push(`assets/${file}`);
  }

  for (const [key, entry] of Object.entries(manifest)) {
    if (!isRecord(entry) || typeof entry.file !== 'string') {
      throw new Error(`PRODUCTION_MANIFEST_ENTRY_INVALID:${key}`);
    }
    const paths = [key, entry.file, entry.name, entry.src];
    if (paths.some(isDevelopmentOnlyPath)) offenders.push(`manifest:${key}`);
  }

  return [...new Set(offenders)].sort();
}

export function assertNoDevelopmentOnlyArtifacts(assetFiles, manifest) {
  const offenders = findDevelopmentOnlyArtifacts(assetFiles, manifest);
  if (offenders.length > 0) {
    throw new Error(`PRODUCTION_DEV_ONLY_ARTIFACTS:${offenders.join(',')}`);
  }
}

export async function checkProductionBuild(distDir = defaultDistDir) {
  const assetsDir = resolve(distDir, 'assets');
  const manifestPath = resolve(distDir, '.vite/manifest.json');
  try {
    await access(distDir);
  } catch (error) {
    throw new Error(`PRODUCTION_DIST_MISSING:${distDir}`, { cause: error });
  }

  let assetFiles;
  try {
    assetFiles = await readdir(assetsDir, { recursive: true });
  } catch (error) {
    throw new Error(`PRODUCTION_ASSETS_MISSING:${assetsDir}`, { cause: error });
  }

  let manifest;
  try {
    manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  } catch (error) {
    throw new Error(`PRODUCTION_MANIFEST_MISSING_OR_INVALID:${manifestPath}`, { cause: error });
  }

  assertNoDevelopmentOnlyArtifacts(assetFiles, manifest);
  return { assetCount: assetFiles.length, manifestEntryCount: Object.keys(manifest).length };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const distDir = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : defaultDistDir;
  try {
    const result = await checkProductionBuild(distDir);
    console.log(
      `[dev-chunks] PASS assets=${result.assetCount} manifest=${result.manifestEntryCount}`,
    );
  } catch (error) {
    console.error(`[dev-chunks] FAIL ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
