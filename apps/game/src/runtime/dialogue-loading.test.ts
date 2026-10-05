import { resolve } from 'node:path';
import { createServer } from 'vite';
import { describe, expect, it } from 'vitest';

describe('dialogue intent loading boundary', () => {
  it('loads dialogue-only action validation only with the dialogue command chunk', async () => {
    const root = resolve(import.meta.dirname, '../../../..');
    const server = await createServer({ root, configFile: false, server: { middlewareMode: true },
      appType: 'custom', logLevel: 'silent' });
    const evaluated = () => [...server.moduleGraph.idToModuleMap.values()]
      .filter((module) => module.ssrModule !== null).map((module) => module.id ?? '');
    try {
      await server.ssrLoadModule('/apps/game/src/runtime/session.ts');
      await server.ssrLoadModule('/apps/game/src/runtime/item-content.ts');
      expect(evaluated().some((id) => id.endsWith('/dialogue/intent-actions.ts'))).toBe(false);
      expect(evaluated().some((id) => id.endsWith('/dialogue-content.ts'))).toBe(false);
      expect(evaluated().some((id) => id.endsWith('/schemas/quest.ts'))).toBe(false);
      expect(evaluated().some((id) => id.endsWith('/event/quest-actions.ts'))).toBe(true);
      await server.ssrLoadModule('/packages/core/src/entries/dialogue-command.ts');
      expect(evaluated().some((id) => id.endsWith('/dialogue/intent-actions.ts'))).toBe(true);
      expect(evaluated().some((id) => id.endsWith('/dialogue-content.ts'))).toBe(true);
      expect(evaluated().some((id) => id.endsWith('/schemas/quest.ts'))).toBe(true);
      expect(evaluated().filter((id) => id.endsWith('/event/quest-actions.ts'))).toHaveLength(1);
    } finally { await server.close(); }
  }, 30_000);
});
