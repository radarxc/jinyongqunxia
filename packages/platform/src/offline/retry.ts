import { OfflineDownloadError } from './errors';

export const RETRY_DELAYS_MS = [1_000, 2_000, 4_000, 8_000, 16_000] as const;
export const FETCH_TIMEOUT_MS = 20_000;

export function shouldRetry(error: unknown): boolean {
  if (error instanceof OfflineDownloadError)
    return error.code === 'HTTP' && (error.status === 408 || error.status === 429 ||
      (error.status !== undefined && error.status >= 500));
  return error instanceof TypeError || error instanceof Error && error.name === 'TimeoutError';
}

export function sleepWithSignal(milliseconds: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(signal.reason ?? new DOMException('Aborted', 'AbortError')); return; }
    const done = () => { signal?.removeEventListener('abort', abort); resolve(); };
    const timer = globalThis.setTimeout(done, milliseconds);
    const abort = () => {
      clearTimeout(timer); reject(signal?.reason ?? new DOMException('Aborted', 'AbortError'));
    };
    signal?.addEventListener('abort', abort, { once: true });
  });
}

function timeoutSignal(parent: AbortSignal | undefined, timeoutMs: number): { signal: AbortSignal; clear(): void } {
  const controller = new AbortController();
  const abort = () => controller.abort(parent?.reason ?? new DOMException('Aborted', 'AbortError'));
  if (parent?.aborted) abort(); else parent?.addEventListener('abort', abort, { once: true });
  const timer = globalThis.setTimeout(() => controller.abort(new DOMException('Timed out', 'TimeoutError')),
    timeoutMs);
  return { signal: controller.signal, clear: () => { clearTimeout(timer);
    parent?.removeEventListener('abort', abort); } };
}

/** Fetch bodies are decoded by the browser. Never persist transport encoding/length headers. */
async function completeResponse(response: Response, signal: AbortSignal, limit: number): Promise<Response> {
  const reader = response.body?.getReader(); const chunks: Uint8Array[] = []; let length = 0;
  const abort = () => { void reader?.cancel(signal.reason).catch(() => undefined); };
  signal.addEventListener('abort', abort, { once: true });
  try {
    while (reader) {
      signal.throwIfAborted(); const result = await reader.read(); signal.throwIfAborted();
      if (result.done) break;
      length += result.value.byteLength;
      if (length > limit) { await reader.cancel();
        throw new OfflineDownloadError('SIZE_MISMATCH', 'OFFLINE_SIZE_MISMATCH:body-limit'); }
      chunks.push(result.value);
    }
    signal.throwIfAborted();
  } finally { signal.removeEventListener('abort', abort); reader?.releaseLock(); }
  const bytes = new Uint8Array(length); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  const headers = new Headers(response.headers); headers.delete('content-encoding'); headers.delete('content-length');
  return new Response(bytes, { status: 200, headers });
}

function retryAfter(response: Response): number {
  const value = response.headers.get('retry-after'); if (!value) return 0;
  const seconds = Number(value);
  return Math.max(0, Number.isFinite(seconds) ? seconds * 1000 : Date.parse(value) - Date.now()) || 0;
}

export async function fetchWithRetry(
  input: RequestInfo | URL,
  options: { readonly fetch?: typeof globalThis.fetch | undefined; readonly signal?: AbortSignal | undefined;
    readonly sleep?: typeof sleepWithSignal | undefined; readonly random?: (() => number) | undefined;
    readonly timeoutMs?: number | undefined; readonly maxBytes?: number } = {},
): Promise<Response> {
  const fetcher = options.fetch ?? fetch;
  const sleep = options.sleep ?? sleepWithSignal;
  const random = options.random ?? Math.random;
  let lastError: unknown;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    options.signal?.throwIfAborted();
    const timed = timeoutSignal(options.signal, options.timeoutMs ?? FETCH_TIMEOUT_MS);
    let serverDelay = 0;
    try {
      const response = await fetcher(input, { signal: timed.signal, credentials: 'same-origin', cache: 'no-store' });
      if (response.status === 200) return await completeResponse(response, timed.signal, options.maxBytes ?? 8 * 1024 * 1024);
      const failure = new OfflineDownloadError('HTTP', `OFFLINE_HTTP_${response.status}`, response.status);
      serverDelay = retryAfter(response); void response.body?.cancel().catch(() => undefined);
      if (serverDelay > 60_000) throw new OfflineDownloadError('RETRY_AFTER', 'OFFLINE_RETRY_AFTER_PAUSED', response.status);
      if (!shouldRetry(failure) || attempt === RETRY_DELAYS_MS.length) throw failure;
      lastError = failure;
    } catch (error) {
      if (options.signal?.aborted) throw options.signal.reason ?? error;
      const failure: unknown = timed.signal.aborted ? timed.signal.reason : error;
      if (!shouldRetry(failure) || attempt === RETRY_DELAYS_MS.length) throw failure;
      lastError = failure;
    } finally { timed.clear(); }
    await sleep(Math.max(serverDelay, RETRY_DELAYS_MS[attempt]! + Math.min(250, Math.floor(random() * 251))), options.signal);
  }
  throw lastError;
}
