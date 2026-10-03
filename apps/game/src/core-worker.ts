import { exposeProjectionCore } from '@tianshu/platform/host';
import content from 'virtual:tianshu-content';
import { loadTown } from 'virtual:tianshu-towns';
import { FetchContentSource } from './runtime/item-content';
import { createLoadedGameSession } from './runtime/session';

const demo = import.meta.env.DEV &&
  new URLSearchParams(globalThis.location?.search ?? '').has('demo');
exposeProjectionCore(await createLoadedGameSession(content, new FetchContentSource(),
  undefined, loadTown, {
  demo,
}));
