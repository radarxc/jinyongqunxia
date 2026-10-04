import { describe, expect, it } from 'vitest';
import { VerifiedProgress } from './progress';
import type { DownloadProgress } from './types';

describe('VerifiedProgress', () => {
  it('counts only complete verified files and applies a 10 second EMA', () => {
    let now = 0; const rows: DownloadProgress[] = [];
    const progress = new VerifiedProgress(300, 3, 0, 0, () => now, row => rows.push(row));
    now = 1_000; progress.report('downloading', '/partial');
    expect(rows.at(-1)).toMatchObject({ verifiedBytes: 0, etaSeconds: null });
    progress.verified(100, '/one');
    now = 11_000; progress.verified(100, '/two');
    const latest = rows.at(-1)!;
    expect(latest.verifiedBytes).toBe(200); expect(latest.completedFiles).toBe(2);
    expect(latest.bytesPerSecond).not.toBeNull(); expect(latest.etaSeconds).toBeGreaterThan(0);
  });
});
