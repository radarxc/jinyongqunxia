import { exposeProjectionCore } from '@tianshu/platform/host';
import content from 'virtual:tianshu-content';
import { loadTown } from 'virtual:tianshu-towns';
import { createGameSession } from './runtime/session';

exposeProjectionCore(createGameSession(content, undefined, loadTown, {
  demo: import.meta.env.DEV && new URLSearchParams(globalThis.location?.search ?? '').has('demo'),
}));
