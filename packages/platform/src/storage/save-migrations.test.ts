import { describe, expect, it } from 'vitest';
import { migrateSaveJson, StorageErrorCode, type ContentFixup, type SaveMigration } from './index';

describe('save schema and content migration', () => {
  it('keeps current v1 data detached through the identity path', () => {
    const state = { meta: { saveSchema: 1 }, inventory: ['it_tea'] };
    const result = migrateSaveJson(state, {
      fromSchema: 1,
      targetSchema: 1,
      fromContentHash: 'a',
    });
    expect(result).toEqual({ state, applied: [], fixedContent: false });
    expect(result.state).not.toBe(state);
  });

  it('runs an example v1 to v2 pure migration and then content fixup', () => {
    const migration: SaveMigration = (value) => {
      const state = value as { meta: { saveSchema: number }; gold: number };
      return { meta: { saveSchema: 2 }, wealth: state.gold };
    };
    const fixup: ContentFixup = (value, context) => ({
      ...(value as Record<string, never>),
      contentHash: context.targetContentHash,
    });
    const migrations = new Map([[1, migration]]);
    const first = migrateSaveJson(
      { meta: { saveSchema: 1 }, gold: 9 },
      {
        fromSchema: 1,
        targetSchema: 2,
        fromContentHash: 'old',
        targetContentHash: 'new',
        migrations,
        fixup,
      },
    );
    const second = migrateSaveJson(
      { meta: { saveSchema: 1 }, gold: 9 },
      {
        fromSchema: 1,
        targetSchema: 2,
        fromContentHash: 'old',
        targetContentHash: 'new',
        migrations,
        fixup,
      },
    );
    expect(first).toEqual({
      state: { meta: { saveSchema: 2 }, wealth: 9, contentHash: 'new' },
      applied: [1],
      fixedContent: true,
    });
    expect(first).toEqual(second);
  });

  it('rejects future saves, gaps, invalid versions, and thrown migrations', () => {
    const base = { fromContentHash: 'a' };
    expect(() => migrateSaveJson({}, { ...base, fromSchema: 2, targetSchema: 1 })).toThrow(
      expect.objectContaining({ code: StorageErrorCode.SaveTooNew }),
    );
    expect(() => migrateSaveJson({}, { ...base, fromSchema: 1, targetSchema: 3 })).toThrow(
      expect.objectContaining({ code: StorageErrorCode.MissingMigration }),
    );
    expect(() => migrateSaveJson({}, { ...base, fromSchema: 0, targetSchema: 1 })).toThrow(
      expect.objectContaining({ code: StorageErrorCode.MigrationFailed }),
    );
    expect(() =>
      migrateSaveJson(
        {},
        {
          ...base,
          fromSchema: 1,
          targetSchema: 2,
          migrations: new Map([
            [
              1,
              () => {
                throw new Error('bad migration');
              },
            ],
          ]),
        },
      ),
    ).toThrow(expect.objectContaining({ code: StorageErrorCode.MigrationFailed }));
  });
});
