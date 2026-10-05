import { describe, expect, it } from 'vitest';
import { StorageErrorCode, toStorageError } from './index';

describe('storage error mapping', () => {
  it.each([
    ['QuotaExceededError', StorageErrorCode.QuotaExceeded],
    ['VersionError', StorageErrorCode.UnsupportedVersion],
    ['InvalidStateError', StorageErrorCode.Unavailable],
  ])('maps %s to %s', (name, code) => {
    const error = new Error(name);
    error.name = name;
    expect(toStorageError(error)).toMatchObject({ code });
  });

  it('uses the requested fallback for unknown failures', () => {
    expect(toStorageError(new Error('broken'), StorageErrorCode.TransactionFailed)).toMatchObject({
      code: StorageErrorCode.TransactionFailed,
      message: 'broken',
    });
  });
});
