export enum StorageErrorCode {
  InvalidArgument = 'INVALID_ARGUMENT',
  NotFound = 'NOT_FOUND',
  CorruptData = 'CORRUPT_DATA',
  HashMismatch = 'HASH_MISMATCH',
  QuotaExceeded = 'QUOTA_EXCEEDED',
  MigrationFailed = 'MIGRATION_FAILED',
  ImportFailed = 'IMPORT_FAILED',
  UnsupportedVersion = 'UNSUPPORTED_VERSION',
  Unavailable = 'UNAVAILABLE',
  TransactionFailed = 'TRANSACTION_FAILED',
  Unknown = 'UNKNOWN',
}

export class StorageError extends Error {
  readonly code: StorageErrorCode;
  override readonly cause: unknown;

  constructor(code: StorageErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = 'StorageError';
    this.code = code;
    this.cause = cause;
  }
}

export function isStorageError(error: unknown): error is StorageError {
  return error instanceof StorageError;
}

export function toStorageError(error: unknown, fallback = StorageErrorCode.Unknown): StorageError {
  if (isStorageError(error)) return error;
  const name =
    error && typeof error === 'object' && 'name' in error && typeof error.name === 'string'
      ? error.name
      : '';
  if (name) {
    if (name === 'QuotaExceededError') {
      return new StorageError(StorageErrorCode.QuotaExceeded, 'IndexedDB quota exceeded', error);
    }
    if (name === 'VersionError') {
      return new StorageError(
        StorageErrorCode.UnsupportedVersion,
        'Unsupported database version',
        error,
      );
    }
    if (name === 'InvalidStateError' || name === 'NotAllowedError') {
      return new StorageError(StorageErrorCode.Unavailable, 'IndexedDB is unavailable', error);
    }
  }
  const message = error instanceof Error ? error.message : String(error);
  return new StorageError(fallback, message, error);
}
