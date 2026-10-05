export type NetworkStatus = 'online' | 'offline' | 'checking';
export const VERSION_PROBE_TIMEOUT_MS = 3_000;
export interface NetworkSnapshot { readonly status: NetworkStatus; readonly browserOnline: boolean;
  readonly reachable: boolean | null; readonly checkedAt: number | null }

export async function probeVersion(options: { readonly fetch?: typeof globalThis.fetch | undefined;
  readonly signal?: AbortSignal | undefined; readonly now?: (() => number) | undefined } = {}): Promise<NetworkSnapshot> {
  const checkedAt = (options.now ?? Date.now)();
  const browserOnline = typeof navigator === 'undefined' || navigator.onLine !== false;
  if (!browserOnline) return { status: 'offline', browserOnline, reachable: false, checkedAt };
  const controller = new AbortController();
  const abort = () => controller.abort(options.signal?.reason ?? new DOMException('Aborted', 'AbortError'));
  if (options.signal?.aborted) abort(); else options.signal?.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(() => controller.abort(new DOMException('Timed out', 'TimeoutError')),
    VERSION_PROBE_TIMEOUT_MS);
  try {
    const response = await (options.fetch ?? fetch)(`/version.json?__ts_probe=${checkedAt}`, { cache: 'no-store',
      credentials: 'same-origin', signal: controller.signal });
    const reachable = response.ok && !response.redirected;
    if (reachable) void response.body?.cancel().catch(() => undefined);
    return { status: reachable ? 'online' : 'offline', browserOnline, reachable, checkedAt };
  } catch { return { status: 'offline', browserOnline, reachable: false, checkedAt };
  } finally { clearTimeout(timer); options.signal?.removeEventListener('abort', abort); }
}
