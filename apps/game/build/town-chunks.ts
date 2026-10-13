/** Lazily loaded town-exploration render families. More specific rules must run first. */
export function townLazyChunk(id: string): string | undefined {
  const normalized = id.replaceAll('\\', '/');
  if (normalized.includes('/three/examples/jsm/libs/meshopt_decoder.module.js'))
    return 'render-meshopt';
  if (normalized.includes('/packages/render/src/buildgen/worker/buildgen.worker.'))
    return 'render-buildgen-worker';
  if (normalized.includes('/packages/render/src/region/')) return 'render-explore';
  if (normalized.includes('/packages/render/src/town/')) return 'render-town-legacy';
  if (normalized.includes('/packages/render/src/buildgen/')) return 'render-buildgen';
  if (normalized.includes('/packages/render/src/actor3d/')) return 'render-actor3d';
  return undefined;
}
