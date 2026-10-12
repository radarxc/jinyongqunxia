import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('region scene source invariants', () => {
  it('does not restore the old exponential interpolation or doubled player stature', () => {
    const source = readFileSync(new URL('./scene.ts', import.meta.url), 'utf8');
    expect(source).not.toContain('lerp(');
    expect(source).not.toContain('3.4');
  });

  it('keeps the camera quad getter free of temporary corner arrays', () => {
    const source = readFileSync(new URL('./explore-motion.ts', import.meta.url), 'utf8');
    expect(source).not.toContain('const signs =');
  });
});
