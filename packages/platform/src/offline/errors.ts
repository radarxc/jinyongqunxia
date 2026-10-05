export class OfflineDownloadError extends Error {
  constructor(
    readonly code: 'HTTP' | 'HASH_MISMATCH' | 'SIZE_MISMATCH' | 'QUOTA' | 'MANIFEST_STALE' | 'RETRY_AFTER',
    message: string,
    readonly status?: number,
  ) { super(message); this.name = 'OfflineDownloadError'; }
}

export function isQuotaExceeded(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'QuotaExceededError' ||
    error instanceof Error && error.name === 'QuotaExceededError';
}
