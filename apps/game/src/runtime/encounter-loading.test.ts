import { resolve } from 'node:path';
import { createServer } from 'vite';
import { describe, expect, it } from 'vitest';
import { fixtureContent, fixtureItemPack } from './test-fixture';

describe('encounter battle-only loading boundary', () => {
  it('does not evaluate encounter modules while loading first-session content', async () => {
    const root = resolve(import.meta.dirname, '../../../..');
    const fixture = await fixtureItemPack('ch01_tianlong');
    const server = await createServer({ root, configFile: false, server: { middlewareMode: true },
      appType: 'custom', logLevel: 'silent' });
    const evaluated = () => [...server.moduleGraph.idToModuleMap.values()]
      .filter((module) => module.ssrModule !== null).map((module) => module.id ?? '')
      .filter((id) => id.endsWith('/schemas/encounter.ts') ||
        id.endsWith('/battle/encounter/builder.ts'));
    try {
      const content = await server.ssrLoadModule('/apps/game/src/runtime/item-content.ts');
      await content['loadGameContent'](fixtureContent(), fixture.source, 'ch01_tianlong');
      expect(evaluated()).toEqual([]);
      await server.ssrLoadModule('/apps/game/src/battle/runtime.ts');
      expect(evaluated()).toHaveLength(2);
    } finally { await server.close(); }
  // Vite SSR startup can be slow on a loaded integration host; keep a fixed, load-independent cap.
  }, 30_000);
});
