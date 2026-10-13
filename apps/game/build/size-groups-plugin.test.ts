import type { OutputBundle, OutputChunk, PluginContext } from 'vite';
import { describe, expect, it, vi } from 'vitest';
import { sizeGroupsPlugin } from './size-groups-plugin';

function chunk(fileName: string, moduleIds: string[], imports: string[] = []): OutputChunk {
  return { type: 'chunk', fileName, moduleIds, imports } as OutputChunk;
}

function context() {
  const emitFile = vi.fn();
  return {
    value: {
      emitFile,
      error: (message: string) => {
        throw new Error(message);
      },
    } as unknown as PluginContext,
    emitFile,
  };
}

function emittedJson(emitFile: ReturnType<typeof vi.fn>): unknown {
  const source = emitFile.mock.calls[0]?.[0]?.source;
  if (typeof source !== 'string') throw new Error('missing emitted size group');
  return JSON.parse(source);
}

describe('sizeGroupsPlugin town groups', () => {
  it('writes app explore UI files and render static module IDs', () => {
    const plugin = sizeGroupsPlugin({ target: 'app' });
    const bundle = {
      'render.js': chunk('assets/render.js', [
        '/repo/packages/render/src/index.ts',
        '/repo/node_modules/three/build/three.module.js',
      ]),
      'explore.js': chunk('assets/explore.js', ['/repo/apps/game/src/explore/controller.ts']),
      'shop.js': chunk('assets/shop.js', ['/repo/apps/game/src/pages/ShopLayer.vue']),
    } as unknown as OutputBundle;
    const ctx = context();
    plugin.generateBundle?.call(ctx.value, {} as never, bundle, false);
    expect(emittedJson(ctx.emitFile)).toEqual({
      schemaVersion: 'size-groups.v1',
      groups: { exploreUi: ['assets/explore.js', 'assets/shop.js'] },
      moduleIds: {
        renderStatic: [
          '/repo/node_modules/three/build/three.module.js',
          '/repo/packages/render/src/index.ts',
        ],
      },
    });
  });

  it('writes empty explore UI files before those sources exist', () => {
    const plugin = sizeGroupsPlugin({ target: 'app' });
    const ctx = context();
    plugin.generateBundle?.call(
      ctx.value,
      {} as never,
      {
        'render.js': chunk('assets/render.js', ['/repo/packages/render/src/index.ts']),
      } as unknown as OutputBundle,
      false,
    );
    expect(emittedJson(ctx.emitFile)).toMatchObject({ groups: { exploreUi: [] } });
  });

  it('registers each core lazy entry with its complete static closure', () => {
    const plugin = sizeGroupsPlugin();
    const bundle = {
      'worker.js': chunk('assets/worker.js', [
        '/repo/apps/game/src/core-worker.ts',
        '/repo/apps/game/src/runtime/session.ts',
        '\0virtual:tianshu-content',
        '/repo/packages/core/src/entries/dialogue-projection.ts',
        '/repo/packages/core/src/entries/dialogue-command.ts',
        '/repo/packages/core/src/entries/region-runtime.ts',
        '/repo/packages/core/src/entries/region-command.ts',
        '/repo/apps/game/src/battle/runtime.ts',
        '\0virtual:tianshu-towns',
        '/repo/packages/core/src/entries/town.ts',
      ]),
      'explore.js': chunk(
        'assets/explore.js',
        ['/repo/packages/core/src/entries/explore-command.ts'],
        ['assets/explore-dependency.js'],
      ),
      'explore-dependency.js': chunk('assets/explore-dependency.js', ['/repo/core/graph.ts']),
      'shop.js': chunk(
        'assets/shop.js',
        ['/repo/packages/core/src/entries/shop-command.ts'],
        ['assets/shop-dependency.js'],
      ),
      'shop-dependency.js': chunk('assets/shop-dependency.js', ['/repo/core/pricing.ts']),
    } as unknown as OutputBundle;
    const ctx = context();
    plugin.generateBundle?.call(ctx.value, {} as never, bundle, false);
    expect(emittedJson(ctx.emitFile)).toMatchObject({
      groups: {
        coreExplore: ['assets/explore-dependency.js', 'assets/explore.js'],
        coreShop: ['assets/shop-dependency.js', 'assets/shop.js'],
      },
    });
  });

  it('registers the buildgen worker entry and all static dependency chunks', () => {
    const plugin = sizeGroupsPlugin();
    const bundle = {
      'worker.js': chunk(
        'assets/render-buildgen-worker.js',
        ['/repo/packages/render/src/buildgen/worker/buildgen.worker.ts'],
        ['assets/buildgen-shared.js'],
      ),
      'shared.js': chunk('assets/buildgen-shared.js', ['/repo/packages/render/src/buildgen/types.ts']),
    } as unknown as OutputBundle;
    const ctx = context();
    plugin.generateBundle?.call(ctx.value, {} as never, bundle, false);
    expect(ctx.emitFile).toHaveBeenCalledWith(
      expect.objectContaining({ fileName: '.vite/buildgen-worker-size-groups.json' }),
    );
    expect(emittedJson(ctx.emitFile)).toEqual({
      schemaVersion: 'size-groups.v1',
      groups: {
        buildgenWorker: ['assets/buildgen-shared.js', 'assets/render-buildgen-worker.js'],
      },
    });
  });
});
