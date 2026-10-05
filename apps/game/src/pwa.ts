export function schedulePwaRegistration(): void {
  const register = (): void => {
    void import('./pwa/client').then(({ registerPwa }) => registerPwa());
  };
  const requestIdle = Reflect.get(window, 'requestIdleCallback') as
    typeof window.requestIdleCallback | undefined;

  if (requestIdle) {
    requestIdle.call(window, register, { timeout: 4_000 });
  } else {
    globalThis.setTimeout(register, 0);
  }
}
