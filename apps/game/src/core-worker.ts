import { exposeProjectionCore } from '@tianshu/platform/host';
import { createLazyGameSession } from './runtime/lazy-session';

const demo = import.meta.env.DEV &&
  new URLSearchParams(globalThis.location?.search ?? '').has('demo');
exposeProjectionCore(createLazyGameSession({ demo }));
