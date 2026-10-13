import { describe, expect, it } from 'vitest';
import { townLazyChunk } from './town-chunks';

describe('townLazyChunk', () => {
  it.each([
    ['/repo/packages/render/src/region/index.ts', 'render-explore'],
    ['/repo/packages/render/src/region/ports/actors.ts', 'render-explore'],
    ['/repo/packages/render/src/town/scene.ts', 'render-town-legacy'],
    ['/repo/packages/render/src/town/geometry.ts', 'render-town-legacy'],
    ['/repo/packages/render/src/buildgen/index.ts', 'render-buildgen'],
    ['/repo/packages/render/src/buildgen/three/layer.ts', 'render-buildgen'],
    ['/repo/packages/render/src/actor3d/index.ts', 'render-actor3d'],
    ['/repo/packages/render/src/actor3d/port/runtime.ts', 'render-actor3d'],
    ['/repo/node_modules/three/examples/jsm/libs/meshopt_decoder.module.js', 'render-meshopt'],
    [
      '/repo/node_modules/three/examples/jsm/libs/meshopt_decoder.module.js?worker',
      'render-meshopt',
    ],
    ['C:\\repo\\packages\\render\\src\\region\\scene.ts', 'render-explore'],
  ])('maps %s to %s', (id, expected) => {
    expect(townLazyChunk(id)).toBe(expected);
  });

  it('names the buildgen worker before its containing directory', () => {
    expect(townLazyChunk('/repo/packages/render/src/buildgen/worker/buildgen.worker.ts')).toBe(
      'render-buildgen-worker',
    );
  });

  it.each([
    '/repo/node_modules/three/build/three.module.js',
    '/repo/node_modules/three/examples/jsm/loaders/GLTFLoader.js',
    '/repo/packages/render/src/index.ts',
    '/repo/packages/render/src/battle/scene.ts',
  ])('does not pull the shared Three/render body into a town chunk: %s', (id) => {
    expect(townLazyChunk(id)).toBeUndefined();
  });
});
