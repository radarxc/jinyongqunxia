import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const repository = resolve(import.meta.dirname, '../../../..');
const fixtureRunner = resolve(repository, 'tools/content/test_compile_story.ts');

describe('story compile tool fixtures', () => {
  it('executes all four fixtures through the standalone tool', () => {
    const result = spawnSync(process.execPath, ['--import', 'tsx', fixtureRunner], {
      cwd: repository,
      encoding: 'utf8',
      timeout: 30_000,
    });

    expect(result.error).toBeUndefined();
    expect(result.signal).toBeNull();
    expect(result.status, result.stderr).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toBe('content:test-compile-story: 4 tests passed\n');
  });
});
