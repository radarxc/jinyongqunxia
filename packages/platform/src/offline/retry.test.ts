import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchWithRetry } from './retry';

describe('fetchWithRetry body deadline and backoff', () => {
  afterEach(() => vi.useRealTimers());
  it('keeps the 20 second deadline while the response body is stalled', async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => new Response(
      new ReadableStream({ start(controller) {
        init?.signal?.addEventListener('abort', () => controller.error(init.signal?.reason));
      } }),
    ));
    const result = fetchWithRetry('/slow', { fetch: fetcher, random: () => 0 });
    const rejected = expect(result).rejects.toMatchObject({ name: 'TimeoutError' });
    await vi.runAllTimersAsync(); await rejected;
    expect(fetcher).toHaveBeenCalledTimes(6);
  });
  it('honors Retry-After without ignoring the retry ceiling', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response('', { status: 429,
      headers: { 'Retry-After': '4' } })).mockResolvedValue(new Response('ok'));
    const sleep = vi.fn(async () => undefined);
    await fetchWithRetry('/retry', { fetch: fetcher, sleep, random: () => 0 });
    expect(sleep).toHaveBeenCalledWith(4000, undefined);
    const long = vi.fn(async () => new Response('', { status: 429, headers: { 'Retry-After': '61' } }));
    await expect(fetchWithRetry('/retry', { fetch: long, sleep })).rejects.toMatchObject({ code: 'RETRY_AFTER' });
    expect(long).toHaveBeenCalledOnce();
  });
});
