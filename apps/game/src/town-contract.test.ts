// ENG-town2-chunks 会在本文件补其他契约断言。
import { readFileSync } from 'node:fs';
import { compileKit } from '@tianshu/data/town-plan';
import type { CompiledBuildKit } from '@tianshu/data/town-plan';
import type { BuildKitView } from '@tianshu/render/buildgen';
import { describe, expect, expectTypeOf, it } from 'vitest';

const REQUIRED_KEYS = [
  'schemaVersion', 'id', 'style', 'profile', 'dims', 'door', 'window', 'walls',
  'ridge', 'palette', 'layers', 'archetypes', 'landmarks', 'variants', 'cityWall',
] as const;

function loadKit(name: string): CompiledBuildKit {
  const source = readFileSync(
    new URL(`../../../content/town/buildkits/${name}.yaml`, import.meta.url), 'utf8',
  );
  return compileKit(source);
}

describe('town build-kit cross-package contract', () => {
  it('assigns data CompiledBuildKit directly to render BuildKitView', () => {
    expectTypeOf<CompiledBuildKit>().toMatchTypeOf<BuildKitView>();
  });

  it.each(['song_dali', 'xiyu'])('%s has every required BuildKitView top-level key', (name) => {
    const kit: BuildKitView = loadKit(name);
    for (const key of REQUIRED_KEYS) expect(kit).toHaveProperty(key);
  });
});
